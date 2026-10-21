import DevTicketCard from "./DevTicketCard";

export default function DevTicketStatusColumn({
  status,
  tickets,
  pendingTicketKeys,
  dragOver,
  onDragOver,
  onDragLeave,
  onDrop,
  onTicketClick,
}) {
  const displayStatus = status.replaceAll("_", " ");

  return (
    <section
      aria-label={`${displayStatus} tickets`}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      className={`w-72 shrink-0 rounded-xl p-3 transition-colors ${
        dragOver ? "bg-blue-100 ring-2 ring-blue-300" : "bg-slate-100"
      }`}
    >
      <div className="mb-3 flex items-center justify-between px-1">
        <h3 className="text-xs font-bold uppercase tracking-wide text-slate-700">
          {displayStatus}
        </h3>
        <span className="rounded-full bg-white px-2 py-0.5 text-xs font-semibold text-slate-500">
          {tickets.length}
        </span>
      </div>
      <div className="flex min-h-36 flex-col gap-3">
        {tickets.map((ticket) => (
          <DevTicketCard
            key={ticket.key}
            ticket={ticket}
            isUpdating={pendingTicketKeys.has(ticket.key)}
            onClick={() => onTicketClick(ticket.key)}
          />
        ))}
        {tickets.length === 0 && (
          <p className="py-6 text-center text-xs text-slate-400">
            No tickets
          </p>
        )}
      </div>
    </section>
  );
}
