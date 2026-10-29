import { LoaderCircle } from "lucide-react";
import Renderer from "../editor/MentionRenderer";

export default function TicketCommentList({
  comments,
  loading,
  error,
  onBack,
}) {
  return (
    <section
      aria-labelledby="ticket-comments-heading"
      className="flex min-h-0 flex-1 flex-col overflow-y-auto p-5 sm:p-7"
    >
      <div className="mb-4 flex items-center justify-between gap-3">
        <h3
          id="ticket-comments-heading"
          className="text-base font-bold text-slate-900"
        >
          Comments
        </h3>
        <button
          type="button"
          onClick={onBack}
          className="text-sm font-semibold text-blue-700 hover:text-blue-800"
        >
          Back to related tickets
        </button>
      </div>

      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto pr-1">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-semibold text-slate-800">
            Ticket comments
          </h4>
          {loading && (
            <LoaderCircle size={15} className="animate-spin text-blue-600" />
          )}
        </div>
        {error && (
          <p
            role="alert"
            className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
          >
            {error}
          </p>
        )}
        {!loading && !error && comments.length === 0 && (
          <p className="rounded-lg border border-dashed border-slate-300 p-4 text-center text-sm text-slate-500">
            No comments on this ticket.
          </p>
        )}
        {comments.map((item) => (
          <article
            key={item.commentId}
            className="rounded-lg border border-slate-200 bg-white"
          >
            <header className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 px-3 py-2">
              <span className="text-sm font-semibold text-slate-800">
                {item.user?.userName ?? "Unknown user"}
              </span>
              <time dateTime={item.time} className="text-xs text-slate-500">
                {item.time ? new Date(item.time).toLocaleString() : ""}
              </time>
            </header>
            <div className="overflow-x-auto [&>div]:!justify-start [&>div>div]:!w-full [&>div>div]:!max-w-full [&>div>div]:!p-3 [&>div>div]:!text-sm">
              <Renderer delta={item.comment.delta} />
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
