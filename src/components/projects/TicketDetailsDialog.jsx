import { useEffect, useState } from "react";
import {
  History,
  LoaderCircle,
  MessageSquareText,
  Pencil,
  Save,
  Plus,
  X,
} from "lucide-react";
import Editor from "../editor/MentionEditor";
import {
  addTicketComment,
  createManualBugTicket,
  getBugTicketDetails,
  getProjectMentions,
  getProjectMembers,
  getTicketComments,
} from "../../services/projectService";
import Renderer from "../editor/MentionRenderer";
import BugTicketCard from "./BugTicketCard";
import TestTicketCard from "./TestTicketCard";
import TicketRevisionCard from "./TicketRevisionCard";

const getAssignedToLabel = (assignedTo) => {
  if (typeof assignedTo === "string") return assignedTo;
  if (Array.isArray(assignedTo)) {
    return assignedTo.map(getAssignedToLabel).filter(Boolean).join(", ");
  }
  if (!assignedTo || typeof assignedTo !== "object") return "";

  const user = assignedTo.user ?? assignedTo;
  return (
    user.userName ??
    user.username ??
    user.name ??
    user.email ??
    user.userId ??
    user.id ??
    ""
  );
};

const createEmptyBugForm = () => ({
  title: "",
  description: "",
  stepsToReproduce: "",
  expectedResult: "",
  actualResult: "",
  assignee: "",
  status: "OPEN",
  priority: "MEDIUM",
  severity: "MEDIUM",
});

const bugStatuses = [
  "OPEN",
  "IN_PROGRESS",
  "FIXED",
  "READY_FOR_RETEST",
  "VERIFIED",
  "REOPENED",
  "CLOSED",
  "WONT_FIX",
];
const bugPriorities = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];

export default function TicketDetailsDialog({
  ticketType,
  ticketKey,
  projectId,
  loading,
  error,
  details,
  onClose,
  assignees = [],
  loadingAssignees = false,
  editError = "",
  savingEdit = false,
  revisions = [],
  revisionsLoading = false,
  revisionsError = "",
  onEdit,
  onSaveEdit,
  onShowRevisions,
  onBugCreated,
  selectedBugKey = "",
  onBugClick,
  onCloseBugDetails,
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValues, setEditValues] = useState(null);
  const [showPreviousRevisions, setShowPreviousRevisions] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [mentionsRefresh, setMentionsRefresh] = useState(0);
  const [mentionsResult, setMentionsResult] = useState(null);
  const [sendingComment, setSendingComment] = useState(false);
  const [commentError, setCommentError] = useState("");
  const [editorInstance, setEditorInstance] = useState(0);
  const [comments, setComments] = useState([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentsError, setCommentsError] = useState("");
  const [creatingBug, setCreatingBug] = useState(false);
  const [bugForm, setBugForm] = useState(createEmptyBugForm);
  const [bugAssignees, setBugAssignees] = useState([]);
  const [bugAssigneesLoading, setBugAssigneesLoading] = useState(false);
  const [bugFormError, setBugFormError] = useState("");
  const [bugSubmitError, setBugSubmitError] = useState("");
  const [savingBug, setSavingBug] = useState(false);
  const [bugDetailsRefresh, setBugDetailsRefresh] = useState(0);
  const [bugDetailsResult, setBugDetailsResult] = useState(null);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const isTestTicket = ticketType === "test";
  const ticket = isTestTicket ? details?.testTicket : details?.devTicket;
  const relatedTickets = isTestTicket
    ? details?.bugTickets
    : details?.testTickets;
  const relatedTicketType = isTestTicket ? "Bug tickets" : "Test tickets";
  const commentTicketId =
    ticket?.ticketId ?? ticket?._id ?? ticket?.key ?? ticketKey;
  const commentTicketType =
    ticketType === "test" ? "TEST" : ticketType === "bug" ? "BUG" : "DEV";
  const assignedToLabel =
    getAssignedToLabel(ticket?.assignedTo) ||
    ticket?.assigneeUserName ||
    getAssignedToLabel(ticket?.assignee) ||
    "Unassigned";
  const mentionsRequestKey = `${projectId}:${commentTicketId}:${mentionsRefresh}`;
  const currentMentionsResult =
    mentionsResult?.requestKey === mentionsRequestKey ? mentionsResult : null;
  const requiredMentions = currentMentionsResult?.data ?? null;
  const mentionsError = currentMentionsResult?.error ?? "";
  const mentionsLoading = Boolean(
    ticket && commentTicketId && !currentMentionsResult
  );
  const bugDetailsRequestKey = `${selectedBugKey}:${bugDetailsRefresh}`;
  const currentBugDetailsResult =
    bugDetailsResult?.requestKey === bugDetailsRequestKey
      ? bugDetailsResult
      : null;
  const bugDetails = currentBugDetailsResult?.data ?? null;
  const bugDetailsError = currentBugDetailsResult?.error ?? "";
  const bugDetailsLoading = Boolean(selectedBugKey && !currentBugDetailsResult);

  useEffect(() => {
    if (!ticket || !commentTicketId) return undefined;

    let active = true;

    async function loadComments() {
      setCommentsLoading(true);
      setCommentsError("");

      try {
        const ticketComments = await getTicketComments(commentTicketId);
        if (active) setComments(ticketComments);
      } catch (error) {
        if (active) {
          setCommentsError(
            error.response?.data?.message ||
              error.message ||
              "Unable to load ticket comments."
          );
        }
      } finally {
        if (active) setCommentsLoading(false);
      }
    }

    loadComments();

    return () => {
      active = false;
    };
  }, [commentTicketId, ticket]);

  useEffect(() => {
    if (!ticket || !projectId) return undefined;

    let active = true;
    const requestKey = `${projectId}:${commentTicketId}:${mentionsRefresh}`;

    async function loadMentions() {
      try {
        const mentions = await getProjectMentions(projectId);
        if (active) setMentionsResult({ requestKey, data: mentions });
      } catch (error) {
        if (active) {
          setMentionsResult({
            requestKey,
            error:
              error.response?.data?.message ||
              error.message ||
              "Unable to load comment mentions.",
          });
        }
      }
    }

    loadMentions();

    return () => {
      active = false;
    };
  }, [projectId, commentTicketId, ticket, mentionsRefresh]);

  useEffect(() => {
    if (!selectedBugKey) return undefined;

    let active = true;
    const requestKey = `${selectedBugKey}:${bugDetailsRefresh}`;

    async function loadBugDetails() {
      try {
        const data = await getBugTicketDetails(selectedBugKey);
        if (active) setBugDetailsResult({ requestKey, data });
      } catch (error) {
        if (active) {
          setBugDetailsResult({
            requestKey,
            error:
              error.response?.data?.message ||
              error.message ||
              "Unable to load bug ticket details.",
          });
        }
      }
    }

    loadBugDetails();

    return () => {
      active = false;
    };
  }, [selectedBugKey, bugDetailsRefresh]);

  const handleOpenComments = () => {
    setShowPreviousRevisions(false);
    setShowComments(true);
    setCommentError("");
  };

  const handleOpenCreateBug = async () => {
    setShowComments(false);
    setShowPreviousRevisions(false);
    onCloseBugDetails?.();
    setCreatingBug(true);
    setBugFormError("");
    setBugSubmitError("");
    setBugAssigneesLoading(true);

    try {
      const members = await getProjectMembers(projectId);
      const usernames = members.map(getAssignedToLabel).filter(Boolean);
      setBugAssignees(usernames);
      setBugForm((current) => ({
        ...current,
        assignee: usernames[0] ?? "",
      }));
    } catch (error) {
      setBugFormError(
        error.response?.data?.message ||
          error.message ||
          "Unable to load project members."
      );
    } finally {
      setBugAssigneesLoading(false);
    }
  };

  const handleCreateBug = async (event) => {
    event.preventDefault();
    const testTicketId =
      ticket?.ticketId ?? ticket?._id ?? ticket?.id ?? ticket?.key ?? ticketKey;
    setSavingBug(true);
    setBugSubmitError("");

    try {
      await createManualBugTicket(testTicketId, bugForm);
      setCreatingBug(false);
      setBugForm(createEmptyBugForm());
      onBugCreated?.();
    } catch (error) {
      setBugSubmitError(
        error.response?.data?.message ||
          error.message ||
          "Unable to create the bug ticket."
      );
    } finally {
      setSavingBug(false);
    }
  };

  const handleOpenBugDetails = (bugKey) => {
    onBugClick?.(bugKey);
  };

  const handleCloseBugDetails = () => {
    onCloseBugDetails?.();
  };

  const handleSubmitComment = async (delta) => {
    setSendingComment(true);
    setCommentError("");

    try {
      await addTicketComment(commentTicketId, commentTicketType, delta);
      setEditorInstance((current) => current + 1);
      try {
        setComments(await getTicketComments(commentTicketId));
        setCommentsError("");
      } catch (error) {
        setCommentsError(
          error.response?.data?.message ||
            error.message ||
            "Comment was added, but the comment list could not be refreshed."
        );
      }
    } catch (error) {
      setCommentError(
        error.response?.data?.message ||
          error.message ||
          "Unable to add this comment."
      );
    } finally {
      setSendingComment(false);
    }
  };

  const updateTestTicketStatus = (testTicketKey, executionStatus) => {
    setEditValues((current) => ({
      ...current,
      testTicketStatuses: current.testTicketStatuses.map((item) =>
        item.testTicketKey === testTicketKey
          ? { ...item, executionStatus }
          : item
      ),
    }));
  };

  const handleSave = async (event) => {
    event.preventDefault();
    const saved = await onSaveEdit(editValues, ticketType);
    if (saved) setIsEditing(false);
  };

  const handleStartEdit = async () => {
    const availableAssignees = await onEdit();
    if (!availableAssignees) return;

    setShowComments(false);
    setEditValues(
      isTestTicket
        ? {
            title: ticket.title ?? "",
            description: ticket.description ?? "",
            priority: ticket.priority ?? "MEDIUM",
            testCaseStatus: ticket.testCaseStatus ?? "DRAFT",
            executionStatus: ticket.executionStatus ?? "NOT_EXECUTED",
            assigneeUserName:
              ticket.assigneeUserName ?? availableAssignees[0] ?? "",
          }
        : {
            title: ticket.title ?? "",
            description: ticket.description ?? "",
            priority: ticket.priority ?? "MEDIUM",
            assigneeId:
              ticket.assigneeId ??
              ticket.assignee ??
              availableAssignees[0] ??
              "",
            targetVersionId: ticket.targetVersionId ?? null,
            testTicketStatuses: (details?.testTickets ?? []).map(
              (testTicket) => ({
                testTicketKey: testTicket.key,
                executionStatus: testTicket.executionStatus ?? "NOT_EXECUTED",
              })
            ),
          }
    );
    setIsEditing(true);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="dev-ticket-dialog-title"
        className="flex h-[calc(100vh-2rem)] max-h-[calc(100vh-2rem)] w-full max-w-6xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
      >
        <header className="flex items-center justify-between border-b border-slate-200 px-5 py-4 sm:px-7">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-blue-600">
              {isTestTicket ? "Test ticket" : "Development ticket"}
            </p>
            <h2
              id="dev-ticket-dialog-title"
              className="mt-1 text-lg font-bold text-slate-900"
            >
              {ticket?.key ?? ticketKey}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close ticket details"
            className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
          >
            <X size={20} />
          </button>
        </header>

        {loading && (
          <div className="flex min-h-64 items-center justify-center gap-3 text-sm text-slate-500">
            <LoaderCircle size={22} className="animate-spin text-blue-600" />
            Loading ticket details...
          </div>
        )}

        {error && (
          <div role="alert" className="m-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {!loading && !error && ticket && (
          <>
            {editError && !isEditing && (
              <p
                role="alert"
                className="mx-5 mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 sm:mx-7"
              >
                {editError}
              </p>
            )}
            <div
              className={`grid min-h-0 flex-1 ${
                showComments
                  ? "grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]"
                  : "md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]"
              }`}
            >
            <article
              className={`overflow-y-auto border-b border-slate-200 px-5 pb-5 pt-2 sm:px-7 sm:pb-7 sm:pt-3 md:border-b-0 md:border-r ${
                showComments ? "min-h-0" : ""
              }`}
            >
              <div>
              {isEditing && isTestTicket ? (
                <form
                  id="edit-ticket-form"
                  onSubmit={handleSave}
                  className="space-y-5"
                >
                  <label className="block">
                    <span className="mb-1.5 block text-sm font-medium text-slate-700">
                      Title
                    </span>
                    <input
                      required
                      value={editValues?.title ?? ""}
                      onChange={(event) =>
                        setEditValues((current) => ({
                          ...current,
                          title: event.target.value,
                        }))
                      }
                      className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </label>
                  <label className="block">
                    <span className="mb-1.5 block text-sm font-medium text-slate-700">
                      Description
                    </span>
                    <textarea
                      rows={5}
                      value={editValues?.description ?? ""}
                      onChange={(event) =>
                        setEditValues((current) => ({
                          ...current,
                          description: event.target.value,
                        }))
                      }
                      className="w-full resize-y rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </label>
                  <label className="block">
                    <span className="mb-1.5 block text-sm font-medium text-slate-700">
                      Assignee
                    </span>
                    <select
                      required
                      value={editValues?.assigneeUserName ?? ""}
                      onChange={(event) =>
                        setEditValues((current) => ({
                          ...current,
                          assigneeUserName: event.target.value,
                        }))
                      }
                      disabled={assignees.length === 0}
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    >
                      {assignees.map((assignee) => (
                        <option key={assignee} value={assignee}>
                          {assignee}
                        </option>
                      ))}
                    </select>
                  </label>
                  <div className="grid gap-4 sm:grid-cols-3">
                    <label className="block">
                      <span className="mb-1.5 block text-sm font-medium text-slate-700">
                        Priority
                      </span>
                      <select
                        value={editValues?.priority ?? "MEDIUM"}
                        onChange={(event) =>
                          setEditValues((current) => ({
                            ...current,
                            priority: event.target.value,
                          }))
                        }
                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      >
                        {["LOW", "MEDIUM", "HIGH", "CRITICAL"].map(
                          (priority) => (
                            <option key={priority} value={priority}>
                              {priority}
                            </option>
                          )
                        )}
                      </select>
                    </label>
                    <label className="block">
                      <span className="mb-1.5 block text-sm font-medium text-slate-700">
                        Test case status
                      </span>
                      <select
                        value={editValues?.testCaseStatus ?? "DRAFT"}
                        onChange={(event) =>
                          setEditValues((current) => ({
                            ...current,
                            testCaseStatus: event.target.value,
                          }))
                        }
                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      >
                        {["DRAFT", "ACTIVE", "DEPRECATED"].map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="block">
                      <span className="mb-1.5 block text-sm font-medium text-slate-700">
                        Execution status
                      </span>
                      <select
                        value={editValues?.executionStatus ?? "NOT_EXECUTED"}
                        onChange={(event) =>
                          setEditValues((current) => ({
                            ...current,
                            executionStatus: event.target.value,
                          }))
                        }
                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      >
                        {[
                          "PASS",
                          "FAIL",
                          "BLOCKED",
                          "SKIPPED",
                          "NOT_EXECUTED",
                        ].map((status) => (
                          <option key={status} value={status}>
                            {status.replaceAll("_", " ")}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>
                  {editError && (
                    <p
                      role="alert"
                      className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
                    >
                      {editError}
                    </p>
                  )}
                </form>
              ) : isEditing ? (
                <form
                  id="edit-ticket-form"
                  onSubmit={handleSave}
                  className="space-y-5"
                >
                  <label className="block">
                    <span className="mb-1.5 block text-sm font-medium text-slate-700">
                      Title
                    </span>
                    <input
                      required
                      value={editValues?.title ?? ""}
                      onChange={(event) =>
                        setEditValues((current) => ({
                          ...current,
                          title: event.target.value,
                        }))
                      }
                      className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </label>
                  <label className="block">
                    <span className="mb-1.5 block text-sm font-medium text-slate-700">
                      Description
                    </span>
                    <textarea
                      rows={5}
                      value={editValues?.description ?? ""}
                      onChange={(event) =>
                        setEditValues((current) => ({
                          ...current,
                          description: event.target.value,
                        }))
                      }
                      className="w-full resize-y rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </label>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="block">
                      <span className="mb-1.5 block text-sm font-medium text-slate-700">
                        Priority
                      </span>
                      <select
                        value={editValues?.priority ?? "MEDIUM"}
                        onChange={(event) =>
                          setEditValues((current) => ({
                            ...current,
                            priority: event.target.value,
                          }))
                        }
                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      >
                        {["LOW", "MEDIUM", "HIGH", "CRITICAL"].map(
                          (priority) => (
                            <option key={priority} value={priority}>
                              {priority}
                            </option>
                          )
                        )}
                      </select>
                    </label>
                    <label className="block">
                      <span className="mb-1.5 block text-sm font-medium text-slate-700">
                        Assignee
                      </span>
                      <select
                        required
                        value={editValues?.assigneeId ?? ""}
                        onChange={(event) =>
                          setEditValues((current) => ({
                            ...current,
                            assigneeId: event.target.value,
                          }))
                        }
                        disabled={
                          assignees.length === 0 &&
                          !editValues?.assigneeId
                        }
                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      >
                        {editValues?.assigneeId &&
                          !assignees.includes(editValues.assigneeId) && (
                            <option
                              value={editValues.assigneeId}
                              key={editValues.assigneeId}
                            >
                              {editValues.assigneeId}
                            </option>
                          )}
                        {assignees.map((assignee) => (
                          <option key={assignee} value={assignee}>
                            {assignee}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>
                  <p className="text-xs text-slate-500">
                    Target version is unchanged by this edit.
                  </p>
                  {editError && (
                    <p
                      role="alert"
                      className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
                    >
                      {editError}
                    </p>
                  )}
                </form>
              ) : (
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold text-blue-700">
                    {ticket.key}
                  </p>
                  <div className="mt-2 flex items-center gap-2">
                    <h3 className="text-xl font-bold text-slate-900">
                      {ticket.title}
                    </h3>
                    <button
                      type="button"
                      onClick={handleStartEdit}
                      disabled={loadingAssignees}
                      aria-label={`Edit ${ticket.title}`}
                      title="Edit ticket"
                      className="rounded-md p-1.5 text-slate-500 transition hover:bg-slate-100 hover:text-blue-700 disabled:opacity-50"
                    >
                      {loadingAssignees ? (
                        <LoaderCircle
                          size={16}
                          className="animate-spin"
                          aria-hidden="true"
                        />
                      ) : (
                        <Pencil size={16} aria-hidden="true" />
                      )}
                    </button>
                  </div>
                </div>
                <span className="rounded bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">
                  {ticket.priority}
                </span>
              </div>
              )}

              {!isEditing && (
                <p className="mt-5 whitespace-pre-wrap text-sm leading-6 text-slate-600">
                  {ticket.description || "No description provided."}
                </p>
              )}

              {!isEditing && <dl className="mt-7 grid grid-cols-2 gap-4 text-sm">
                <div>
                  <dt className="text-xs font-medium text-slate-500">Status</dt>
                  <dd className="mt-1 font-semibold text-slate-800">
                    {(isTestTicket
                      ? ticket.executionStatus
                      : ticket.status
                    ).replaceAll("_", " ")}
                  </dd>
                </div>
                {isTestTicket && (
                  <div>
                    <dt className="text-xs font-medium text-slate-500">
                      Test case status
                    </dt>
                    <dd className="mt-1 font-semibold text-slate-800">
                      {ticket.testCaseStatus.replaceAll("_", " ")}
                    </dd>
                  </div>
                )}
                <div>
                  <dt className="text-xs font-medium text-slate-500">
                    Assigned to
                  </dt>
                  <dd className="mt-1 break-all font-semibold text-slate-800">
                    {assignedToLabel}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-slate-500">
                    Revision
                  </dt>
                  <dd className="mt-1 font-semibold text-slate-800">
                    {ticket.currentRevision}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-slate-500">
                    Project
                  </dt>
                  <dd className="mt-1 break-all font-semibold text-slate-800">
                    {ticket.projectId}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-slate-500">
                    Feature
                  </dt>
                  <dd className="mt-1 break-all font-semibold text-slate-800">
                    {ticket.featureId}
                  </dd>
                </div>
              </dl>}
              </div>

              {showComments && (
                <div className="mt-6 border-t border-slate-200 pt-4">
                  <h3 className="mb-2 text-sm font-bold text-slate-900">
                    Add a comment
                  </h3>
                  {mentionsLoading && (
                    <div className="flex min-h-24 items-center justify-center gap-2 text-sm text-slate-500">
                      <LoaderCircle
                        size={18}
                        className="animate-spin text-blue-600"
                      />
                      Loading mention options...
                    </div>
                  )}
                  {mentionsError && (
                    <div className="space-y-3">
                      <p
                        role="alert"
                        className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
                      >
                        {mentionsError}
                      </p>
                      <button
                        type="button"
                        onClick={() =>
                          setMentionsRefresh((current) => current + 1)
                        }
                        className="text-sm font-semibold text-blue-700 hover:text-blue-800"
                      >
                        Retry
                      </button>
                    </div>
                  )}
                  {!mentionsLoading && !mentionsError && requiredMentions && (
                    <div>
                      <div className="rounded-lg border border-slate-200">
                        <Editor
                          key={editorInstance}
                          requiredMentions={requiredMentions}
                          onSubmitDelta={handleSubmitComment}
                          submitting={sendingComment}
                          compact
                        />
                      </div>
                      {commentError && (
                        <p
                          role="alert"
                          className="mt-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
                        >
                          {commentError}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}
            </article>

            <div className="flex min-h-0 flex-col">
              <div className="flex justify-end gap-2 px-5 pt-5 sm:px-7">
                {isEditing ? (
                  <>
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      disabled={savingEdit}
                      className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      form="edit-ticket-form"
                      disabled={savingEdit || loadingAssignees}
                      className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                    >
                      {savingEdit ? (
                        <LoaderCircle size={15} className="animate-spin" />
                      ) : (
                        <Save size={15} />
                      )}
                      Save
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        setShowPreviousRevisions(true);
                        setShowComments(false);
                        onShowRevisions();
                      }}
                      className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      <History size={15} />
                      Previous revisions
                    </button>
                    <button
                      type="button"
                      onClick={handleOpenComments}
                      className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      <MessageSquareText size={15} />
                      Comments
                    </button>
                  </>
                )}
              </div>

            {showComments ? (
              <section
                aria-labelledby="ticket-comments-heading"
                className="flex min-h-0 flex-1 flex-col overflow-y-auto p-5 sm:p-7"
              >
                <div className="mb-4 flex items-center justify-between gap-3">
                  <h3
                    id="ticket-comments-heading"
                    className="text-base font-bold text-slate-900"
                  >
                    Comments
                  </h3>
                  <button
                    type="button"
                    onClick={() => setShowComments(false)}
                    className="text-sm font-semibold text-blue-700 hover:text-blue-800"
                  >
                    Back to related tickets
                  </button>
                </div>

                <div className="min-h-0 flex-1 space-y-3 overflow-y-auto pr-1">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-semibold text-slate-800">
                          Ticket comments
                        </h4>
                        {commentsLoading && (
                          <LoaderCircle
                            size={15}
                            className="animate-spin text-blue-600"
                          />
                        )}
                      </div>
                      {commentsError && (
                        <p
                          role="alert"
                          className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
                        >
                          {commentsError}
                        </p>
                      )}
                      {!commentsLoading &&
                        !commentsError &&
                        comments.length === 0 && (
                          <p className="rounded-lg border border-dashed border-slate-300 p-4 text-center text-sm text-slate-500">
                            No comments on this ticket.
                          </p>
                        )}
                      {comments.map((item) => (
                        <article
                          key={item.commentId}
                          className="rounded-lg border border-slate-200 bg-white"
                        >
                          <header className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 px-3 py-2">
                            <span className="text-sm font-semibold text-slate-800">
                              {item.user?.userName ?? "Unknown user"}
                            </span>
                            <time
                              dateTime={item.time}
                              className="text-xs text-slate-500"
                            >
                              {item.time
                                ? new Date(item.time).toLocaleString()
                                : ""}
                            </time>
                          </header>
                          <div className="overflow-x-auto [&>div]:!justify-start [&>div>div]:!w-full [&>div>div]:!max-w-full [&>div>div]:!p-3 [&>div>div]:!text-sm">
                            <Renderer delta={item.comment.delta} />
                          </div>
                        </article>
                      ))}
                    </div>
                </div>
              </section>
            ) : showPreviousRevisions ? (
              <section
                aria-labelledby="previous-revisions-heading"
                className="flex min-h-0 flex-1 flex-col p-5 sm:p-7"
              >
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div>
                    <h3
                      id="previous-revisions-heading"
                      className="text-base font-bold text-slate-900"
                    >
                      Previous revisions
                    </h3>
                    <p className="mt-1 text-xs text-slate-500">
                      {revisions.length}{" "}
                      {revisions.length === 1 ? "revision" : "revisions"}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowPreviousRevisions(false)}
                    className="text-sm font-semibold text-blue-700 hover:text-blue-800"
                  >
                    Back to ticket details
                  </button>
                </div>
                {revisionsLoading && (
                  <div className="flex min-h-40 items-center justify-center gap-2 text-sm text-slate-500">
                    <LoaderCircle
                      size={18}
                      className="animate-spin text-blue-600"
                    />
                    Loading previous revisions...
                  </div>
                )}
                {revisionsError && (
                  <p
                    role="alert"
                    className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
                  >
                    {revisionsError}
                  </p>
                )}
                {!revisionsLoading && !revisionsError && (
                  <div className="min-h-0 flex-1 space-y-3 overflow-y-auto pr-1">
                    {[...revisions]
                      .sort(
                        (first, second) =>
                          second.revisionNumber - first.revisionNumber
                      )
                      .map((revision) => (
                      <TicketRevisionCard
                        key={revision.revisionNumber}
                        revision={revision}
                      />
                      ))}
                    {revisions.length === 0 && (
                      <p className="rounded-lg border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">
                        No previous revisions found.
                      </p>
                    )}
                  </div>
                )}
              </section>
            ) : <section
              aria-labelledby="test-tickets-heading"
              className="flex min-h-0 flex-1 flex-col p-5 sm:p-7"
            >
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <h3
                    id="test-tickets-heading"
                    className="text-base font-bold text-slate-900"
                  >
                    {relatedTicketType}
                  </h3>
                  <p className="mt-1 text-xs text-slate-500">
                    {relatedTickets.length}{" "}
                    {relatedTickets.length === 1 ? "ticket" : "tickets"}
                  </p>
                </div>
                {isTestTicket && (
                  <button
                    type="button"
                    onClick={handleOpenCreateBug}
                    disabled={bugAssigneesLoading}
                    className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-wait disabled:opacity-60"
                  >
                    {bugAssigneesLoading ? (
                      <LoaderCircle size={15} className="animate-spin" />
                    ) : (
                      <Plus size={15} />
                    )}
                    Create Bug
                  </button>
                )}
              </div>

              {creatingBug && !selectedBugKey && (
                <form
                  onSubmit={handleCreateBug}
                  className="mb-4 max-h-[calc(100vh-10rem)] space-y-4 overflow-y-auto overscroll-contain rounded-lg border border-slate-200 bg-slate-50 p-4"
                >
                  {bugAssigneesLoading ? (
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      <LoaderCircle
                        size={16}
                        className="animate-spin text-blue-600"
                      />
                      Loading project members...
                    </div>
                  ) : bugFormError ? (
                    <div>
                      <p role="alert" className="text-sm text-red-700">
                        {bugFormError}
                      </p>
                      <button
                        type="button"
                        onClick={handleOpenCreateBug}
                        className="mt-2 text-sm font-semibold text-blue-700 hover:text-blue-800"
                      >
                        Retry
                      </button>
                    </div>
                  ) : (
                    <>
                      <label className="block">
                        <span className="mb-1.5 block text-sm font-medium text-slate-700">
                          Title
                        </span>
                        <input
                          required
                          maxLength={200}
                          value={bugForm.title}
                          onChange={(event) =>
                            setBugForm((current) => ({
                              ...current,
                              title: event.target.value,
                            }))
                          }
                          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                        />
                      </label>
                      <label className="block">
                        <span className="mb-1.5 block text-sm font-medium text-slate-700">
                          Description
                        </span>
                        <textarea
                          required
                          rows={2}
                          value={bugForm.description}
                          onChange={(event) =>
                            setBugForm((current) => ({
                              ...current,
                              description: event.target.value,
                            }))
                          }
                          className="w-full resize-y rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                        />
                      </label>
                      <label className="block">
                        <span className="mb-1.5 block text-sm font-medium text-slate-700">
                          Steps to reproduce
                        </span>
                        <textarea
                          required
                          rows={2}
                          value={bugForm.stepsToReproduce}
                          onChange={(event) =>
                            setBugForm((current) => ({
                              ...current,
                              stepsToReproduce: event.target.value,
                            }))
                          }
                          className="w-full resize-y rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                        />
                      </label>
                      <div className="grid gap-3 sm:grid-cols-2">
                        {[
                          ["expectedResult", "Expected result"],
                          ["actualResult", "Actual result"],
                        ].map(([field, label]) => (
                          <label key={field} className="block">
                            <span className="mb-1.5 block text-sm font-medium text-slate-700">
                              {label}
                            </span>
                            <textarea
                              required
                              rows={2}
                              value={bugForm[field]}
                              onChange={(event) =>
                                setBugForm((current) => ({
                                  ...current,
                                  [field]: event.target.value,
                                }))
                              }
                              className="w-full resize-y rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                            />
                          </label>
                        ))}
                      </div>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <label className="block">
                          <span className="mb-1.5 block text-sm font-medium text-slate-700">
                            Assignee
                          </span>
                          <select
                            required
                            value={bugForm.assignee}
                            onChange={(event) =>
                              setBugForm((current) => ({
                                ...current,
                                assignee: event.target.value,
                              }))
                            }
                            disabled={bugAssignees.length === 0}
                            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                          >
                            {bugAssignees.length === 0 && (
                              <option value="">No project members</option>
                            )}
                            {bugAssignees.map((assignee) => (
                              <option key={assignee} value={assignee}>
                                {assignee}
                              </option>
                            ))}
                          </select>
                        </label>
                        {[
                          ["status", "Status", bugStatuses],
                          ["priority", "Priority", bugPriorities],
                          ["severity", "Severity", bugPriorities],
                        ].map(([field, label, options]) => (
                          <label key={field} className="block">
                            <span className="mb-1.5 block text-sm font-medium text-slate-700">
                              {label}
                            </span>
                            <select
                              value={bugForm[field]}
                              onChange={(event) =>
                                setBugForm((current) => ({
                                  ...current,
                                  [field]: event.target.value,
                                }))
                              }
                              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                            >
                              {options.map((option) => (
                                <option key={option} value={option}>
                                  {option.replaceAll("_", " ")}
                                </option>
                              ))}
                            </select>
                          </label>
                        ))}
                      </div>
                      {bugAssignees.length === 0 && (
                        <p className="text-sm text-amber-800">
                          Add a project member before creating a bug.
                        </p>
                      )}
                      {bugSubmitError && (
                        <p role="alert" className="text-sm text-red-700">
                          {bugSubmitError}
                        </p>
                      )}
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setCreatingBug(false)}
                          disabled={savingBug}
                          className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-white disabled:opacity-50"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={savingBug || bugAssignees.length === 0}
                          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                        >
                          {savingBug && (
                            <LoaderCircle
                              size={15}
                              className="animate-spin"
                            />
                          )}
                          Create Bug
                        </button>
                      </div>
                    </>
                  )}
                </form>
              )}

              {selectedBugKey ? (
                <section className="min-h-0 flex-1 overflow-y-auto p-1">
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <h4 className="text-base font-bold text-slate-900">
                      Bug details
                    </h4>
                    <button
                      type="button"
                      onClick={handleCloseBugDetails}
                      className="text-sm font-semibold text-blue-700 hover:text-blue-800"
                    >
                      Back to bug tickets
                    </button>
                  </div>
                  {bugDetailsLoading && (
                    <div className="flex min-h-32 items-center justify-center gap-2 text-sm text-slate-500">
                      <LoaderCircle
                        size={18}
                        className="animate-spin text-blue-600"
                      />
                      Loading bug details...
                    </div>
                  )}
                  {bugDetailsError && (
                    <div className="space-y-2">
                      <p role="alert" className="text-sm text-red-700">
                        {bugDetailsError}
                      </p>
                      <button
                        type="button"
                        onClick={() =>
                          setBugDetailsRefresh((current) => current + 1)
                        }
                        className="text-sm font-semibold text-blue-700 hover:text-blue-800"
                      >
                        Retry
                      </button>
                    </div>
                  )}
                  {!bugDetailsLoading && !bugDetailsError && bugDetails && (
                    <article className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <p className="text-xs font-semibold text-rose-700">
                            {bugDetails.key}
                          </p>
                          <h5 className="mt-2 break-words text-lg font-bold text-slate-900">
                            {bugDetails.title}
                          </h5>
                        </div>
                        <span className="rounded bg-rose-50 px-2 py-1 text-xs font-semibold text-rose-700">
                          {bugDetails.priority}
                        </span>
                      </div>

                      <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-slate-600">
                        {bugDetails.description || "No description provided."}
                      </p>

                      <dl className="mt-5 grid gap-4 text-sm sm:grid-cols-2">
                        {[
                          ["Steps to reproduce", bugDetails.stepsToReproduce],
                          ["Expected result", bugDetails.expectedResult],
                          ["Actual result", bugDetails.actualResult],
                          ["Status", bugDetails.status?.replaceAll("_", " ")],
                          ["Severity", bugDetails.severity],
                          ["Revision", bugDetails.currentRevision],
                          ["Project", bugDetails.projectName],
                          ["Feature", bugDetails.featureName],
                        ].map(([label, value]) => (
                          <div key={label}>
                            <dt className="text-xs font-medium text-slate-500">
                              {label}
                            </dt>
                            <dd className="mt-1 whitespace-pre-wrap break-words font-semibold text-slate-800">
                              {value ?? "—"}
                            </dd>
                          </div>
                        ))}
                      </dl>
                    </article>
                  )}
                </section>
              ) : (
              <div className="min-h-0 flex-1 space-y-3 overflow-y-auto pr-1">
                {relatedTickets.map((relatedTicket) =>
                  isTestTicket ? (
                    <BugTicketCard
                      key={relatedTicket.key}
                      ticket={relatedTicket}
                      onClick={() => handleOpenBugDetails(relatedTicket.key)}
                    />
                  ) : (
                    <TestTicketCard
                      key={relatedTicket.key}
                      ticket={relatedTicket}
                      editing={isEditing}
                      executionStatus={
                        editValues?.testTicketStatuses.find(
                          (item) => item.testTicketKey === relatedTicket.key
                        )?.executionStatus
                      }
                      onExecutionStatusChange={updateTestTicketStatus}
                    />
                  )
                )}
                {relatedTickets.length === 0 && (
                  <p className="rounded-lg border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">
                    No {isTestTicket ? "bug" : "test"} tickets are linked to
                    this ticket.
                  </p>
                )}
              </div>
              )}
            </section>}
            </div>
          </div>
          </>
        )}
      </section>
    </div>
  );
}
