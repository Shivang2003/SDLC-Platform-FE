import { LoaderCircle } from "lucide-react";
import DevTicketStatusColumn from "./DevTicketStatusColumn";

export default function DevTicketBoard({
  ticketType,
  featureName,
  statuses,
  tickets,
  loading,
  error,
  actionError,
  pendingTicketKeys,
  dragOverStatus,
  onTicketDrop,
  onTicketClick,
  onDragOverStatus,
  onDragLeaveStatus,
}) {
  return (
    <section aria-labelledby="ticket-board-heading">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2
            id="ticket-board-heading"
            className="text-lg font-semibold text-slate-900"
          >
            {ticketType === "test" ? "Test tickets" : "Development tickets"}
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Tickets for {featureName}
          </p>
        </div>
        {!loading && !error && (
          <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600">
            {tickets.length} {tickets.length === 1 ? "ticket" : "tickets"}
          </span>
        )}
      </div>

      {loading && (
        <div className="flex min-h-48 items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white text-sm text-slate-500">
          <LoaderCircle size={22} className="animate-spin text-blue-600" />
          Loading tickets...
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {actionError && (
        <div
          role="alert"
          className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          {actionError}
        </div>
      )}

      {!loading && !error && statuses.length === 0 && (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white/70 p-8 text-center text-sm text-slate-500">
          No ticket statuses are available for this feature.
        </div>
      )}

      {!loading && !error && statuses.length > 0 && (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {statuses.map((status) => (
            <DevTicketStatusColumn
              key={status}
              status={status}
              tickets={tickets.filter((ticket) => ticket.status === status)}
              pendingTicketKeys={pendingTicketKeys}
              dragOver={dragOverStatus === status}
              onDragOver={(event) => onDragOverStatus(event, status)}
              onDragLeave={() => onDragLeaveStatus(status)}
              onDrop={(event) => onTicketDrop(event, status)}
              onTicketClick={onTicketClick}
              ticketType={ticketType}
            />
          ))}
        </div>
      )}
    </section>
  );
}
