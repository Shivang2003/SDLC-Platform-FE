import { useEffect, useState } from "react";
import { LoaderCircle, X } from "lucide-react";

const projectRoles = ["VIEWER", "DEV", "TESTER", "ADMIN", "OWNER", "WORKER"];

export default function ChangeProjectMemberRoleDialog({
  members,
  membersLoading,
  membersError,
  submitting,
  submitError,
  onClose,
  onSubmit,
}) {
  const [userName, setUserName] = useState("");
  const [newRole, setNewRole] = useState(projectRoles[0]);
  const selectedUserName = members.includes(userName) ? userName : members[0] ?? "";

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape" && !submitting) onClose();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose, submitting]);

  const handleSubmit = (event) => {
    event.preventDefault();
    if (selectedUserName) onSubmit({ userName: selectedUserName, newRole });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !submitting) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="change-project-member-role-heading"
        className="w-full max-w-lg overflow-hidden rounded-2xl bg-white text-slate-900 shadow-2xl"
      >
        <header className="flex items-center justify-between border-b border-slate-200 px-5 py-4 sm:px-7">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-blue-600">
              Project members
            </p>
            <h2
              id="change-project-member-role-heading"
              className="mt-1 text-lg font-bold"
            >
              Change member role
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            aria-label="Close change member role dialog"
            className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 disabled:opacity-50"
          >
            <X size={20} />
          </button>
        </header>

        <form onSubmit={handleSubmit} className="space-y-5 p-5 sm:p-7">
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-slate-700">
              Project member
            </span>
            {membersLoading ? (
              <span className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-3 text-sm text-slate-500">
                <LoaderCircle size={16} className="animate-spin text-blue-600" />
                Loading project members...
              </span>
            ) : membersError ? (
              <span role="alert" className="block text-sm text-red-700">
                {membersError}
              </span>
            ) : (
              <select
                required
                value={selectedUserName}
                onChange={(event) => setUserName(event.target.value)}
                disabled={members.length === 0 || submitting}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:opacity-60"
              >
                {members.length === 0 && (
                  <option value="">No project members available</option>
                )}
                {members.map((member) => (
                  <option key={member} value={member}>
                    {member}
                  </option>
                ))}
              </select>
            )}
          </label>

          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-slate-700">
              New role
            </span>
            <select
              value={newRole}
              onChange={(event) => setNewRole(event.target.value)}
              disabled={submitting}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:opacity-60"
            >
              {projectRoles.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
          </label>

          {submitError && (
            <p
              role="alert"
              className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
            >
              {submitError}
            </p>
          )}

          {!membersLoading && !membersError && members.length === 0 && (
            <p className="text-sm text-slate-500">
              No project members are available to update.
            </p>
          )}

          <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={
                membersLoading ||
                Boolean(membersError) ||
                !selectedUserName ||
                submitting
              }
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting && (
                <LoaderCircle size={16} className="animate-spin" />
              )}
              Change role
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
