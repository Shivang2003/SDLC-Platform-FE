import { LoaderCircle } from "lucide-react";
import TicketRevisionCard from "./TicketRevisionCard";

export default function TicketRevisionPanel({
  revisions,
  loading,
  error,
  onBack,
}) {
  return (
    <section
      aria-labelledby="previous-revisions-heading"
      className="flex min-h-0 flex-1 flex-col p-5 sm:p-7"
    >
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h3
            id="previous-revisions-heading"
            className="text-base font-bold text-slate-900"
          >
            Previous revisions
          </h3>
          <p className="mt-1 text-xs text-slate-500">
            {revisions.length} {revisions.length === 1 ? "revision" : "revisions"}
          </p>
        </div>
        <button
          type="button"
          onClick={onBack}
          className="text-sm font-semibold text-blue-700 hover:text-blue-800"
        >
          Back to ticket details
        </button>
      </div>
      {loading && (
        <div className="flex min-h-40 items-center justify-center gap-2 text-sm text-slate-500">
          <LoaderCircle size={18} className="animate-spin text-blue-600" />
          Loading previous revisions...
        </div>
      )}
      {error && (
        <p
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
        >
          {error}
        </p>
      )}
      {!loading && !error && (
        <div className="min-h-0 flex-1 space-y-3 overflow-y-auto pr-1">
          {[...revisions]
            .sort(
              (first, second) =>
                second.revisionNumber - first.revisionNumber
            )
            .map((revision) => (
              <TicketRevisionCard
                key={revision.revisionNumber}
                revision={revision}
              />
            ))}
          {revisions.length === 0 && (
            <p className="rounded-lg border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">
              No previous revisions found.
            </p>
          )}
        </div>
      )}
    </section>
  );
}
