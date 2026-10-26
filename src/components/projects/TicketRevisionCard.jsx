export default function TicketRevisionCard({ revision }) {
  return (
    <article className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold text-blue-700">
            Revision {revision.revisionNumber}
          </p>
          <h4 className="mt-2 break-words text-sm font-semibold text-slate-800">
            {revision.title}
          </h4>
        </div>
        <span className="rounded bg-amber-50 px-2 py-1 text-[11px] font-semibold text-amber-700">
          {revision.priority}
        </span>
      </div>

      <p className="mt-3 whitespace-pre-wrap text-xs leading-5 text-slate-600">
        {revision.description || "No description provided."}
      </p>

      <div className="mt-4 flex flex-wrap gap-2 text-[11px] font-medium">
        <span className="rounded bg-slate-100 px-2 py-1 text-slate-600">
          {revision.status.replaceAll("_", " ")}
        </span>
        <span className="rounded bg-slate-100 px-2 py-1 text-slate-600">
          Assignee: {revision.assigneeUserName || "Unassigned"}
        </span>
      </div>

      <div className="mt-4 border-t border-slate-100 pt-3 text-[11px] text-slate-500">
        <p>
          Changed by:{" "}
          {revision.changedByUserName ||
            revision.createdByUserName ||
            "Unknown"}
        </p>
        {revision.createdAt && (
          <time dateTime={revision.createdAt}>
            {new Date(revision.createdAt).toLocaleString()}
          </time>
        )}
      </div>
    </article>
  );
}
