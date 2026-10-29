import { useEffect, useState } from "react";
import { LoaderCircle } from "lucide-react";
import { getBugTicketDetails } from "../../services/projectService";

export default function BugTicketDetailsPanel({ bugKey, onBack }) {
  const [refresh, setRefresh] = useState(0);
  const [result, setResult] = useState(null);
  const requestKey = `${bugKey}:${refresh}`;
  const currentResult =
    result?.requestKey === requestKey ? result : null;

  useEffect(() => {
    if (!bugKey) return undefined;

    let active = true;

    getBugTicketDetails(bugKey)
      .then((data) => {
        if (active) setResult({ requestKey, data });
      })
      .catch((error) => {
        if (active) {
          setResult({
            requestKey,
            error:
              error.response?.data?.error ||
              error.response?.data?.message ||
              error.message ||
              "Unable to load bug ticket details.",
          });
        }
      });

    return () => {
      active = false;
    };
  }, [bugKey, requestKey]);

  const bug = currentResult?.data;
  const error = currentResult?.error;

  return (
    <section className="min-h-0 flex-1 overflow-y-auto p-1">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h4 className="text-base font-bold text-slate-900">Bug details</h4>
        <button
          type="button"
          onClick={onBack}
          className="text-sm font-semibold text-blue-700 hover:text-blue-800"
        >
          Back to bug tickets
        </button>
      </div>
      {!currentResult && (
        <div className="flex min-h-32 items-center justify-center gap-2 text-sm text-slate-500">
          <LoaderCircle size={18} className="animate-spin text-blue-600" />
          Loading bug details...
        </div>
      )}
      {error && (
        <div className="space-y-2">
          <p role="alert" className="text-sm text-red-700">
            {error}
          </p>
          <button
            type="button"
            onClick={() => setRefresh((current) => current + 1)}
            className="text-sm font-semibold text-blue-700 hover:text-blue-800"
          >
            Retry
          </button>
        </div>
      )}
      {bug && (
        <article className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold text-rose-700">{bug.key}</p>
              <h5 className="mt-2 break-words text-lg font-bold text-slate-900">
                {bug.title}
              </h5>
            </div>
            <span className="rounded bg-rose-50 px-2 py-1 text-xs font-semibold text-rose-700">
              {bug.priority}
            </span>
          </div>
          <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-slate-600">
            {bug.description || "No description provided."}
          </p>
          <dl className="mt-5 grid gap-4 text-sm sm:grid-cols-2">
            {[
              ["Steps to reproduce", bug.stepsToReproduce],
              ["Expected result", bug.expectedResult],
              ["Actual result", bug.actualResult],
              ["Status", bug.status?.replaceAll("_", " ")],
              ["Severity", bug.severity],
              ["Revision", bug.currentRevision],
              ["Project", bug.projectName],
              ["Feature", bug.featureName],
            ].map(([label, value]) => (
              <div key={label}>
                <dt className="text-xs font-medium text-slate-500">{label}</dt>
                <dd className="mt-1 whitespace-pre-wrap break-words font-semibold text-slate-800">
                  {value ?? "—"}
                </dd>
              </div>
            ))}
          </dl>
        </article>
      )}
    </section>
  );
}
