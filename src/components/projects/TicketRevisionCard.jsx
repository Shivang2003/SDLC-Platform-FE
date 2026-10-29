const formatChangeValue = (value) => {
  if (value === null || value === undefined || value === "") return "—";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
};

export default function TicketRevisionCard({ revision }) {
  const changes = revision.changes ?? {};
  const changedFields =
    Array.isArray(revision.changedFields) && revision.changedFields.length > 0
      ? revision.changedFields
      : Object.keys(changes);

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

      {changedFields.length > 0 && (
        <div className="mt-3 space-y-2 text-xs">
          <span className="block font-semibold text-slate-900">
            Changed fields:
          </span>
          {changedFields.map((field) => {
            const change = changes[field];
            const oldValue = formatChangeValue(change?.oldValue);
            const newValue = formatChangeValue(change?.newValue);
            const hasValues =
              change &&
              typeof change === "object" &&
              ("oldValue" in change || "newValue" in change);
            const label = hasValues
              ? `${field}: ${oldValue} → ${newValue}`
              : field;

            return (
              <span
                key={field}
                title={label}
                className="flex w-fit max-w-full items-center gap-1 rounded-full border border-red-200 bg-red-50 px-2.5 py-1 text-red-700"
              >
                {hasValues ? (
                  <>
                    <span className="shrink-0 font-bold">{field}:</span>
                    <span className="max-w-xs truncate">
                      {oldValue} → {newValue}
                    </span>
                  </>
                ) : (
                  <span className="font-bold">{field}</span>
                )}
              </span>
            );
          })}
          </div>
        )}

      <div className="mt-4 flex flex-wrap gap-2 text-[11px] font-medium">
        {revision.status && (
          <span className="rounded bg-slate-100 px-2 py-1 text-slate-600">
            {revision.status.replaceAll("_", " ")}
          </span>
        )}
        {revision.testCaseStatus && (
          <span className="rounded bg-slate-100 px-2 py-1 text-slate-600">
            Test case: {revision.testCaseStatus.replaceAll("_", " ")}
          </span>
        )}
        {revision.executionStatus && (
          <span className="rounded bg-blue-50 px-2 py-1 text-blue-700">
            Execution: {revision.executionStatus.replaceAll("_", " ")}
          </span>
        )}
        {revision.assigneeUserName && (
          <span className="rounded bg-slate-100 px-2 py-1 text-slate-600">
            Assignee: {revision.assigneeUserName}
          </span>
        )}
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
