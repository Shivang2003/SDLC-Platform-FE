import { LoaderCircle } from "lucide-react";

export default function DevTicketCard({ ticket, isUpdating }) {
  return (
    <article
      draggable={!isUpdating}
      onDragStart={(event) => {
        event.dataTransfer.setData("text/plain", ticket.key);
        event.dataTransfer.effectAllowed = "move";
      }}
      className={`rounded-lg border border-slate-200 bg-white p-4 shadow-sm ${
        isUpdating
          ? "cursor-wait opacity-60"
          : "cursor-grab active:cursor-grabbing"
      }`}
    >
      <p className="text-xs font-semibold text-blue-700">{ticket.key}</p>
      <h4 className="mt-2 break-words text-sm font-semibold leading-5 text-slate-800">
        {ticket.name}
      </h4>
      <div className="mt-4 flex items-center justify-between gap-2">
        <span className="rounded bg-amber-50 px-2 py-1 text-[11px] font-semibold text-amber-700">
          {ticket.priority}
        </span>
        {isUpdating && (
          <LoaderCircle
            size={14}
            className="animate-spin text-blue-600"
            aria-label="Updating ticket status"
          />
        )}
        {ticket.updatedAt && (
          <time
            dateTime={ticket.updatedAt}
            className="text-right text-[11px] text-slate-400"
          >
            {new Date(ticket.updatedAt).toLocaleDateString()}
          </time>
        )}
      </div>
    </article>
  );
}
