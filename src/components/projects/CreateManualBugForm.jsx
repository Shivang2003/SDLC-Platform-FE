import { useEffect, useState } from "react";
import { LoaderCircle } from "lucide-react";
import {
  createManualBugTicket,
  getProjectMembers,
} from "../../services/projectService";

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

const emptyBug = {
  title: "",
  description: "",
  stepsToReproduce: "",
  expectedResult: "",
  actualResult: "",
  assignee: "",
  status: "OPEN",
  priority: "MEDIUM",
  severity: "MEDIUM",
};

const getUsername = (member) => {
  if (typeof member === "string") return member;
  return (
    member?.userName ??
    member?.username ??
    member?.name ??
    member?.email ??
    member?.userId ??
    member?.id ??
    ""
  );
};

export default function CreateManualBugForm({
  projectId,
  testTicketId,
  onCancel,
  onCreated,
}) {
  const [form, setForm] = useState(emptyBug);
  const [membersResult, setMembersResult] = useState(null);
  const [membersRefresh, setMembersRefresh] = useState(0);
  const [saving, setSaving] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const membersRequestKey = `${projectId}:${membersRefresh}`;
  const currentMembersResult =
    membersResult?.requestKey === membersRequestKey ? membersResult : null;
  const assignees = currentMembersResult?.members ?? [];
  const membersError = currentMembersResult?.error ?? "";
  const membersLoading = Boolean(projectId && !currentMembersResult);

  useEffect(() => {
    if (!projectId) return undefined;

    let active = true;

    getProjectMembers(projectId)
      .then((members) => {
        const usernames = members.map(getUsername).filter(Boolean);
        if (active) {
          setMembersResult({
            requestKey: membersRequestKey,
            members: usernames,
          });
          setForm((current) => ({
            ...current,
            assignee: usernames[0] ?? "",
          }));
        }
      })
      .catch((error) => {
        if (active) {
          setMembersResult({
            requestKey: membersRequestKey,
            error:
              error.response?.data?.error ||
              error.response?.data?.message ||
              error.message ||
              "Unable to load project members.",
          });
        }
      });

    return () => {
      active = false;
    };
  }, [projectId, membersRequestKey]);

  const updateField = (field) => (event) => {
    setForm((current) => ({ ...current, [field]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setSubmitError("");

    try {
      await createManualBugTicket(testTicketId, form);
      setForm(emptyBug);
      onCreated();
    } catch (error) {
      setSubmitError(
        error.response?.data?.error ||
          error.response?.data?.message ||
          error.message ||
          "Unable to create the bug ticket."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="mb-4 max-h-[calc(100vh-10rem)] space-y-4 overflow-y-auto overscroll-contain rounded-lg border border-slate-200 bg-slate-50 p-4"
    >
      {membersLoading ? (
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <LoaderCircle size={16} className="animate-spin text-blue-600" />
          Loading project members...
        </div>
      ) : membersError ? (
        <div>
          <p role="alert" className="text-sm text-red-700">
            {membersError}
          </p>
          <button
            type="button"
            onClick={() => setMembersRefresh((current) => current + 1)}
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
              value={form.title}
              onChange={updateField("title")}
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
              value={form.description}
              onChange={updateField("description")}
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
              value={form.stepsToReproduce}
              onChange={updateField("stepsToReproduce")}
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
                  value={form[field]}
                  onChange={updateField(field)}
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
                value={form.assignee}
                onChange={updateField("assignee")}
                disabled={assignees.length === 0}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
              >
                {assignees.length === 0 && (
                  <option value="">No project members</option>
                )}
                {assignees.map((assignee) => (
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
                  value={form[field]}
                  onChange={updateField(field)}
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
          {assignees.length === 0 && (
            <p className="text-sm text-amber-800">
              Add a project member before creating a bug.
            </p>
          )}
          {submitError && (
            <p role="alert" className="text-sm text-red-700">
              {submitError}
            </p>
          )}
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onCancel}
              disabled={saving}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-white disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || assignees.length === 0}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {saving && (
                <LoaderCircle size={15} className="animate-spin" />
              )}
              Create Bug
            </button>
          </div>
        </>
      )}
    </form>
  );
}
