const summaryMetrics = [
  { key: "totalProjects", label: "Projects" },
  { key: "totalFeatures", label: "Features" },
  { key: "totalDevTickets", label: "Dev tickets" },
  { key: "completedDevTickets", label: "Completed dev tickets" },
  { key: "totalTestTickets", label: "Test tickets" },
  { key: "passedTests", label: "Passed tests" },
  { key: "failedTests", label: "Failed tests" },
  { key: "totalBugTickets", label: "Bug tickets" },
  { key: "openBugs", label: "Open bugs" },
];

export default function OrganizationSummaryCards({ summary, loading = false }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
      {summaryMetrics.map(({ key, label }) => (
        <article
          key={key}
          className="rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-sm"
          aria-busy={loading}
        >
          {loading ? (
            <div className="animate-pulse" aria-hidden="true">
              <div className="h-3 w-24 rounded bg-slate-200" />
              <div className="mt-2 h-7 w-12 rounded bg-slate-200" />
            </div>
          ) : (
            <>
              <p className="text-xs font-medium text-slate-500">{label}</p>
              <p className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
                {summary[key]}
              </p>
            </>
          )}
        </article>
      ))}
    </div>
  );
}
