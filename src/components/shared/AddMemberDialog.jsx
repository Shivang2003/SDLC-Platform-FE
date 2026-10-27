import { useEffect, useState } from "react";
import { LoaderCircle, X } from "lucide-react";

const organizationRoles = ["ADMIN", "OWNER", "VIEWER", "WORKER"];

export default function AddMemberDialog({
  users,
  usersLoading,
  usersError,
  submitting,
  submitError,
  onClose,
  onSubmit,
}) {
  const [selectedUserId, setSelectedUserId] = useState("");
  const [userListOpen, setUserListOpen] = useState(false);
  const [role, setRole] = useState("OWNER");

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape" && !submitting) onClose();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose, submitting]);

  const selectedUser =
    users.find((user) => user.userId === selectedUserId) ?? users[0];

  const handleSubmit = (event) => {
    event.preventDefault();
    if (selectedUser) {
      onSubmit({ userName: selectedUser.userName, role });
    }
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
        aria-labelledby="add-organization-member-heading"
        className="w-full max-w-lg overflow-hidden rounded-2xl bg-white text-slate-900 shadow-2xl"
      >
        <header className="flex items-center justify-between border-b border-slate-200 px-5 py-4 sm:px-7">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-blue-600">
              Organization members
            </p>
            <h2
              id="add-organization-member-heading"
              className="mt-1 text-lg font-bold"
            >
              Add member
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            aria-label="Close add member dialog"
            className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 disabled:opacity-50"
          >
            <X size={20} />
          </button>
        </header>

        <form onSubmit={handleSubmit} className="space-y-5 p-5 sm:p-7">
          <div>
            <label
              id="organization-member-user-label"
              className="mb-1.5 block text-sm font-medium text-slate-700"
            >
              User
            </label>
            {usersLoading ? (
              <div className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-4 text-sm text-slate-500">
                <LoaderCircle size={17} className="animate-spin text-blue-600" />
                Loading users...
              </div>
            ) : usersError ? (
              <p
                role="alert"
                className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
              >
                {usersError}
              </p>
            ) : users.length === 0 ? (
              <p className="rounded-lg border border-slate-200 p-3 text-sm text-slate-500">
                No users are available to add.
              </p>
            ) : (
              <div className="relative">
                <button
                  type="button"
                  aria-labelledby="organization-member-user-label"
                  aria-haspopup="listbox"
                  aria-expanded={userListOpen}
                  onClick={() => setUserListOpen((open) => !open)}
                  disabled={submitting}
                  className="flex w-full items-center justify-between rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-left outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:opacity-60"
                >
                  {selectedUser ? (
                    <span>
                      <span className="block text-base font-semibold text-slate-800">
                        {selectedUser.userName}
                      </span>
                      <span className="block text-xs text-slate-500">
                        {selectedUser.userId}
                      </span>
                    </span>
                  ) : (
                    <span className="text-sm text-slate-500">Select a user</span>
                  )}
                  <span className="ml-3 text-xs text-slate-400">▼</span>
                </button>
                {userListOpen && (
                  <ul
                    role="listbox"
                    aria-labelledby="organization-member-user-label"
                    className="absolute z-10 mt-1 max-h-52 w-full overflow-y-auto rounded-lg border border-slate-200 bg-white p-1 shadow-lg"
                  >
                    {users.map((user) => (
                      <li key={user.userId} role="option" aria-selected={selectedUser?.userId === user.userId}>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedUserId(user.userId);
                            setUserListOpen(false);
                          }}
                          className={`w-full rounded-md px-3 py-2 text-left transition hover:bg-blue-50 ${
                            selectedUser?.userId === user.userId
                              ? "bg-blue-50"
                              : ""
                          }`}
                        >
                          <span className="block text-base font-semibold text-slate-800">
                            {user.userName}
                          </span>
                          <span className="block text-xs text-slate-500">
                            {user.userId}
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>

          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-slate-700">
              Role
            </span>
            <select
              value={role}
              onChange={(event) => setRole(event.target.value)}
              disabled={submitting}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm font-semibold text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:opacity-60"
            >
              {organizationRoles.map((option) => (
                <option key={option} value={option}>
                  {option}
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
                usersLoading ||
                Boolean(usersError) ||
                !selectedUser ||
                submitting
              }
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting && (
                <LoaderCircle size={16} className="animate-spin" />
              )}
              Add member
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
