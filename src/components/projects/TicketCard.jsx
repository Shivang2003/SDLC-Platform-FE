import { LoaderCircle } from "lucide-react";

export default function TicketCard({
  ticket,
  isUpdating,
  onClick,
  ticketType,
}) {
  const ticketName = ticket.name ?? ticket.title ?? "Untitled ticket";

  return (
    <article
      draggable={!isUpdating}
      onDragStart={(event) => {
        event.dataTransfer.setData("text/plain", ticket.key);
        event.dataTransfer.effectAllowed = "move";
      }}
      className={`rounded-lg border border-slate-200 bg-white shadow-sm ${
        isUpdating
          ? "cursor-wait opacity-60"
          : "cursor-grab active:cursor-grabbing"
      }`}
    >
      <button
        type="button"
        onClick={onClick}
        disabled={isUpdating || !onClick}
        className="block w-full rounded-lg p-4 text-left focus-visible:outline-2 focus-visible:outline-blue-500"
        aria-label={
          onClick
            ? `Open details for ${ticket.key}: ${ticketName}`
            : `${ticketType === "test" ? "Test" : "Development"} ticket ${ticket.key}: ${ticketName}`
        }
      >
        <p className="text-xs font-semibold text-blue-700">{ticket.key}</p>
        <h4 className="mt-2 break-words text-sm font-semibold leading-5 text-slate-800">
          {ticketName}
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
      </button>
    </article>
  );
}
