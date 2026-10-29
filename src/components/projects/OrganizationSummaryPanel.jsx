import OrganizationSummaryCards from "./OrganizationSummaryCards";
import DevTicketStatusChart from "./DevTicketStatusChart";
import BugPriorityChart from "./BugPriorityChart";

export default function OrganizationSummaryPanel({
  summary,
  summaryLoading,
  summaryError,
  devTicketStats,
  devTicketStatsLoading,
  devTicketStatsError,
  bugStats,
  bugStatsLoading,
  bugStatsError,
}) {
  return (
    <section
      id="organization-panel-summary"
      role="tabpanel"
      aria-labelledby="organization-tab-summary"
      className="pt-6"
    >
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-slate-900">
          Organization summary
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          A snapshot of projects, tickets, tests, and bugs.
        </p>
      </div>

      {summaryLoading && <OrganizationSummaryCards loading />}
      {summaryError && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {summaryError}
        </div>
      )}
      {!summaryLoading && !summaryError && summary && (
        <OrganizationSummaryCards summary={summary} />
      )}

      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        {devTicketStatsError ? (
          <div
            role="alert"
            className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          >
            {devTicketStatsError}
          </div>
        ) : (
          <DevTicketStatusChart
            stats={devTicketStats}
            loading={devTicketStatsLoading}
          />
        )}
        {bugStatsError ? (
          <div
            role="alert"
            className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          >
            {bugStatsError}
          </div>
        ) : (
          <BugPriorityChart stats={bugStats} loading={bugStatsLoading} />
        )}
      </div>
    </section>
  );
}
