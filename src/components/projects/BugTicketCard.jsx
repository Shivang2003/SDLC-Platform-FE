export default function BugTicketCard({ ticket, onClick }) {
  return (
    <article
      onClick={onClick}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onClick?.();
        }
      }}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      className={`rounded-lg border border-slate-200 bg-white p-4 shadow-sm ${
        onClick
          ? "cursor-pointer transition hover:border-blue-300 hover:shadow-md focus-visible:outline-2 focus-visible:outline-blue-500"
          : ""
      }`}
      aria-label={onClick ? `View bug ${ticket.key}: ${ticket.title}` : undefined}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold text-rose-700">{ticket.key}</p>
          <h4 className="mt-2 break-words text-sm font-semibold text-slate-800">
            {ticket.title}
          </h4>
        </div>
        <span className="shrink-0 rounded bg-rose-50 px-2 py-1 text-[11px] font-semibold text-rose-700">
          {ticket.priority}
        </span>
      </div>
      <p className="mt-3 whitespace-pre-wrap text-xs leading-5 text-slate-600">
        {ticket.description || "No description provided."}
      </p>
      <div className="mt-4 flex flex-wrap gap-2 text-[11px] font-medium">
        <span className="rounded bg-slate-100 px-2 py-1 text-slate-600">
          {ticket.status.replaceAll("_", " ")}
        </span>
        <span className="rounded bg-rose-50 px-2 py-1 text-rose-700">
          {ticket.severity}
        </span>
        <span className="rounded bg-slate-100 px-2 py-1 text-slate-600">
          Revision {ticket.currentRevision}
        </span>
      </div>
    </article>
  );
}
