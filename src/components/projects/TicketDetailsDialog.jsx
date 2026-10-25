import { useEffect, useState } from "react";
import { LoaderCircle, Pencil, Save, X } from "lucide-react";
import BugTicketCard from "./BugTicketCard";
import TestTicketCard from "./TestTicketCard";

export default function TicketDetailsDialog({
  ticketType,
  ticketKey,
  loading,
  error,
  details,
  onClose,
  assignees = [],
  loadingAssignees = false,
  editError = "",
  savingEdit = false,
  onEdit,
  onSaveEdit,
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValues, setEditValues] = useState(null);

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
    const saved = await onSaveEdit(editValues);
    if (saved) setIsEditing(false);
  };

  const handleStartEdit = async () => {
    const availableAssignees = await onEdit();
    if (!availableAssignees) return;

    setEditValues({
      title: ticket.title ?? "",
      description: ticket.description ?? "",
      priority: ticket.priority ?? "MEDIUM",
      assigneeId:
        ticket.assigneeId ??
        ticket.assignee ??
        availableAssignees[0] ??
        "",
      targetVersionId: ticket.targetVersionId ?? null,
      testTicketStatuses: (details?.testTickets ?? []).map((testTicket) => ({
        testTicketKey: testTicket.key,
        executionStatus: testTicket.executionStatus ?? "NOT_EXECUTED",
      })),
    });
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
        className="flex max-h-[90vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
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
            {!isTestTicket && (
              <div className="flex justify-end border-b border-slate-100 px-5 py-3 sm:px-7">
                {isEditing ? (
                  <div className="flex gap-2">
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
                      form="edit-dev-ticket-form"
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
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={handleStartEdit}
                    disabled={loadingAssignees}
                    className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                  >
                    {loadingAssignees ? (
                      <LoaderCircle size={15} className="animate-spin" />
                    ) : (
                      <Pencil size={15} />
                    )}
                    Edit
                  </button>
                )}
              </div>
            )}
            {editError && !isEditing && (
              <p
                role="alert"
                className="mx-5 mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 sm:mx-7"
              >
                {editError}
              </p>
            )}
            <div className="grid min-h-0 flex-1 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
            <article className="overflow-y-auto border-b border-slate-200 p-5 md:border-b-0 md:border-r sm:p-7">
              {isEditing && !isTestTicket ? (
                <form
                  id="edit-dev-ticket-form"
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
                  <h3 className="mt-2 text-xl font-bold text-slate-900">
                    {ticket.title}
                  </h3>
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
            </article>

            <section
              aria-labelledby="test-tickets-heading"
              className="flex min-h-0 flex-col p-5 sm:p-7"
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
              </div>

              <div className="min-h-0 flex-1 space-y-3 overflow-y-auto pr-1">
                {relatedTickets.map((relatedTicket) =>
                  isTestTicket ? (
                    <BugTicketCard
                      key={relatedTicket.key}
                      ticket={relatedTicket}
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
            </section>
          </div>
          </>
        )}
      </section>
    </div>
  );
}
