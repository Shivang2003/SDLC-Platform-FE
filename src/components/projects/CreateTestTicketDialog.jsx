import { useEffect, useState } from "react";
import { LoaderCircle, X } from "lucide-react";

const testCaseStatuses = ["DRAFT", "ACTIVE", "DEPRECATED"];
const executionStatuses = [
  "PASS",
  "FAIL",
  "BLOCKED",
  "SKIPPED",
  "NOT_EXECUTED",
];
const priorities = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];

export default function CreateTestTicketDialog({
  devTickets,
  onClose,
  onSubmit,
  submitting,
  error,
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [devTicketId, setDevTicketId] = useState(devTickets[0]?.key ?? "");
  const [testCaseStatus, setTestCaseStatus] = useState("DRAFT");
  const [executionStatus, setExecutionStatus] = useState("NOT_EXECUTED");
  const [priority, setPriority] = useState("MEDIUM");

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape" && !submitting) onClose();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose, submitting]);

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit(devTicketId, {
      title: title.trim(),
      description: description.trim(),
      testCaseStatus,
      executionStatus,
      priority,
    });
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
        aria-labelledby="create-test-ticket-heading"
        className="w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl"
      >
        <header className="flex items-center justify-between border-b border-slate-200 px-5 py-4 sm:px-7">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-blue-600">
              Test tickets
            </p>
            <h2
              id="create-test-ticket-heading"
              className="mt-1 text-lg font-bold text-slate-900"
            >
              Create a test ticket
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            aria-label="Close create test ticket dialog"
            className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 disabled:opacity-50"
          >
            <X size={20} />
          </button>
        </header>

        <form onSubmit={handleSubmit} className="space-y-5 p-5 sm:p-7">
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-slate-700">
              Development ticket
            </span>
            <select
              required
              value={devTicketId}
              onChange={(event) => setDevTicketId(event.target.value)}
              disabled={devTickets.length === 0}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              {devTickets.length === 0 && (
                <option value="">No development tickets available</option>
              )}
              {devTickets.map((ticket) => (
                <option key={ticket.key} value={ticket.key}>
                  {ticket.key} - {ticket.title}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-slate-700">
              Title
            </span>
            <input
              required
              maxLength={200}
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-slate-700">
              Description
            </span>
            <textarea
              required
              rows={4}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              className="w-full resize-y rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </label>

          <div className="grid gap-4 sm:grid-cols-3">
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-slate-700">
                Test case status
              </span>
              <select
                value={testCaseStatus}
                onChange={(event) => setTestCaseStatus(event.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              >
                {testCaseStatuses.map((option) => (
                  <option key={option} value={option}>
                    {option.replaceAll("_", " ")}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-slate-700">
                Execution status
              </span>
              <select
                value={executionStatus}
                onChange={(event) => setExecutionStatus(event.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              >
                {executionStatuses.map((option) => (
                  <option key={option} value={option}>
                    {option.replaceAll("_", " ")}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-slate-700">
                Priority
              </span>
              <select
                value={priority}
                onChange={(event) => setPriority(event.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              >
                {priorities.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {error && (
            <p
              role="alert"
              className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
            >
              {error}
            </p>
          )}

          {devTickets.length === 0 && (
            <p className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
              Create a development ticket for this feature before adding a test
              ticket.
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
              disabled={submitting || devTickets.length === 0}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting && (
                <LoaderCircle size={16} className="animate-spin" />
              )}
              Create test ticket
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
