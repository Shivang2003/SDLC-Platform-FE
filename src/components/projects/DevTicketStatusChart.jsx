import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

const statusColors = {
  TODO: "#64748b",
  IN_PROGRESS: "#3b82f6",
  BLOCKED: "#f97316",
  IN_REVIEW: "#8b5cf6",
  DONE: "#10b981",
  CANCELLED: "#94a3b8",
};

export default function DevTicketStatusChart({
  stats,
  loading = false,
}) {
  const chartData = stats
    ? Object.entries(stats).map(([status, count]) => ({
        status,
        count,
      }))
    : [];
  const total = chartData.reduce((sum, item) => sum + item.count, 0);

  return (
    <section
      aria-labelledby="dev-ticket-status-heading"
      className="mt-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
      aria-busy={loading}
    >
      <div className="mb-4">
        <h3
          id="dev-ticket-status-heading"
          className="text-base font-semibold text-slate-900"
        >
          Development tickets by status
        </h3>
        <p className="mt-1 text-sm text-slate-500">
          Current ticket distribution across workflow statuses.
        </p>
      </div>

      {loading ? (
        <div
          className="flex min-h-56 animate-pulse items-center justify-center"
          aria-hidden="true"
        >
          <div className="h-44 w-44 rounded-full border-[22px] border-slate-200" />
        </div>
      ) : (
        <div className="grid items-center gap-4 sm:grid-cols-[minmax(0,1fr)_minmax(180px,0.8fr)]">
          <div className="h-56 min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  dataKey="count"
                  nameKey="status"
                  innerRadius="62%"
                  outerRadius="88%"
                  paddingAngle={chartData.length > 1 ? 3 : 0}
                  stroke="none"
                >
                  {chartData.map((entry) => (
                    <Cell
                      key={entry.status}
                      fill={statusColors[entry.status] ?? "#0ea5e9"}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value, _name, item) => [
                    value,
                    item.payload.status.replaceAll("_", " "),
                  ]}
                />
                <text
                  x="50%"
                  y="50%"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="fill-slate-900 text-2xl font-bold"
                >
                  {total}
                </text>
                <text
                  x="50%"
                  y="59%"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="fill-slate-500 text-xs"
                >
                  tickets
                </text>
              </PieChart>
            </ResponsiveContainer>
          </div>

          <ul className="grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-1">
            {chartData.map(({ status, count }) => (
              <li key={status} className="flex items-center gap-2 text-sm">
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{
                    backgroundColor: statusColors[status] ?? "#0ea5e9",
                  }}
                  aria-hidden="true"
                />
                <span className="min-w-0 flex-1 truncate text-slate-600">
                  {status.replaceAll("_", " ")}
                </span>
                <span className="font-semibold text-slate-900">{count}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
