import { useEffect } from "react";
import { LoaderCircle, X } from "lucide-react";
import BugTicketCard from "./BugTicketCard";
import TestTicketCard from "./TestTicketCard";

export default function TicketDetailsDialog({
  ticketType,
  ticketKey,
  loading,
  error,
  details,
  onClose,
}) {
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const isTestTicket = ticketType === "test";
  const ticket = isTestTicket ? details?.testTicket : details?.devTicket;
  const relatedTickets = isTestTicket
    ? details?.bugTickets
    : details?.testTickets;
  const relatedTicketType = isTestTicket ? "Bug tickets" : "Test tickets";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="dev-ticket-dialog-title"
        className="flex max-h-[90vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
      >
        <header className="flex items-center justify-between border-b border-slate-200 px-5 py-4 sm:px-7">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-blue-600">
              {isTestTicket ? "Test ticket" : "Development ticket"}
            </p>
            <h2
              id="dev-ticket-dialog-title"
              className="mt-1 text-lg font-bold text-slate-900"
            >
              {ticket?.key ?? ticketKey}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close ticket details"
            className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
          >
            <X size={20} />
          </button>
        </header>

        {loading && (
          <div className="flex min-h-64 items-center justify-center gap-3 text-sm text-slate-500">
            <LoaderCircle size={22} className="animate-spin text-blue-600" />
            Loading ticket details...
          </div>
        )}

        {error && (
          <div role="alert" className="m-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {!loading && !error && ticket && (
          <div className="grid min-h-0 flex-1 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
            <article className="overflow-y-auto border-b border-slate-200 p-5 md:border-b-0 md:border-r sm:p-7">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold text-blue-700">
                    {ticket.key}
                  </p>
                  <h3 className="mt-2 text-xl font-bold text-slate-900">
                    {ticket.title}
                  </h3>
                </div>
                <span className="rounded bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">
                  {ticket.priority}
                </span>
              </div>

              <p className="mt-5 whitespace-pre-wrap text-sm leading-6 text-slate-600">
                {ticket.description || "No description provided."}
              </p>

              <dl className="mt-7 grid grid-cols-2 gap-4 text-sm">
                <div>
                  <dt className="text-xs font-medium text-slate-500">Status</dt>
                  <dd className="mt-1 font-semibold text-slate-800">
                    {(isTestTicket
                      ? ticket.executionStatus
                      : ticket.status
                    ).replaceAll("_", " ")}
                  </dd>
                </div>
                {isTestTicket && (
                  <div>
                    <dt className="text-xs font-medium text-slate-500">
                      Test case status
                    </dt>
                    <dd className="mt-1 font-semibold text-slate-800">
                      {ticket.testCaseStatus.replaceAll("_", " ")}
                    </dd>
                  </div>
                )}
                <div>
                  <dt className="text-xs font-medium text-slate-500">
                    Revision
                  </dt>
                  <dd className="mt-1 font-semibold text-slate-800">
                    {ticket.currentRevision}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-slate-500">
                    Project
                  </dt>
                  <dd className="mt-1 break-all font-semibold text-slate-800">
                    {ticket.projectId}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-slate-500">
                    Feature
                  </dt>
                  <dd className="mt-1 break-all font-semibold text-slate-800">
                    {ticket.featureId}
                  </dd>
                </div>
              </dl>
            </article>

            <section
              aria-labelledby="test-tickets-heading"
              className="flex min-h-0 flex-col p-5 sm:p-7"
            >
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <h3
                    id="test-tickets-heading"
                    className="text-base font-bold text-slate-900"
                  >
                    {relatedTicketType}
                  </h3>
                  <p className="mt-1 text-xs text-slate-500">
                    {relatedTickets.length}{" "}
                    {relatedTickets.length === 1 ? "ticket" : "tickets"}
                  </p>
                </div>
              </div>

              <div className="min-h-0 flex-1 space-y-3 overflow-y-auto pr-1">
                {relatedTickets.map((relatedTicket) =>
                  isTestTicket ? (
                    <BugTicketCard
                      key={relatedTicket.key}
                      ticket={relatedTicket}
                    />
                  ) : (
                    <TestTicketCard
                      key={relatedTicket.key}
                      ticket={relatedTicket}
                    />
                  )
                )}
                {relatedTickets.length === 0 && (
                  <p className="rounded-lg border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">
                    No {isTestTicket ? "bug" : "test"} tickets are linked to
                    this ticket.
                  </p>
                )}
              </div>
            </section>
          </div>
        )}
      </section>
    </div>
  );
}
