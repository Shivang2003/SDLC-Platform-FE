const executionStatuses = [
  "PASS",
  "FAIL",
  "BLOCKED",
  "SKIPPED",
  "NOT_EXECUTED",
];

export default function TestTicketCard({
  ticket,
  editing = false,
  executionStatus = ticket.executionStatus,
  onExecutionStatusChange,
}) {
  return (
    <article className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold text-blue-700">{ticket.key}</p>
          <h4 className="mt-2 break-words text-sm font-semibold text-slate-800">
            {ticket.title}
          </h4>
        </div>
        <span className="shrink-0 rounded bg-amber-50 px-2 py-1 text-[11px] font-semibold text-amber-700">
          {ticket.priority}
        </span>
      </div>
      <p className="mt-3 whitespace-pre-wrap text-xs leading-5 text-slate-600">
        {ticket.description || "No description provided."}
      </p>
      <div className="mt-4 flex flex-wrap gap-2 text-[11px] font-medium">
        <span className="rounded bg-slate-100 px-2 py-1 text-slate-600">
          {ticket.testCaseStatus.replaceAll("_", " ")}
        </span>
        {editing ? (
          <label className="flex items-center gap-2 rounded bg-slate-100 px-2 py-1 text-slate-600">
            <span className="sr-only">
              Execution status for {ticket.key}
            </span>
            <select
              value={executionStatus}
              onChange={(event) =>
                onExecutionStatusChange(ticket.key, event.target.value)
              }
              className="bg-transparent text-[11px] font-medium outline-none"
            >
              {executionStatuses.map((status) => (
                <option key={status} value={status}>
                  {status.replaceAll("_", " ")}
                </option>
              ))}
            </select>
          </label>
        ) : (
          <span className="rounded bg-slate-100 px-2 py-1 text-slate-600">
            {ticket.executionStatus.replaceAll("_", " ")}
          </span>
        )}
        <span className="rounded bg-slate-100 px-2 py-1 text-slate-600">
          Revision {ticket.currentRevision}
        </span>
      </div>
    </article>
  );
}
