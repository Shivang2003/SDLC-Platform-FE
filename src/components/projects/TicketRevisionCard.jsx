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
      <p className="mb-3 text-xs font-semibold text-blue-700">
        Revision {revision.revisionNumber}
      </p>
      {changedFields.length > 0 ? (
        <div className="space-y-2 text-xs">
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
      ) : (
        <p className="text-xs text-slate-500">No changed fields recorded.</p>
      )}

      <div className="mt-4 border-t border-slate-100 pt-3 text-[11px] text-slate-500">
        <p>
          Changed by:{" "}
          {revision.changedByUserName ||
            revision.createdByUserName ||
            "Unknown"}
        </p>
        {revision.createdAt && (
          <time dateTime={revision.createdAt}>
            At {new Date(revision.createdAt).toLocaleString()}
          </time>
        )}
      </div>
    </article>
  );
}
