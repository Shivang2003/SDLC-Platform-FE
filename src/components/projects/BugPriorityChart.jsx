import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const priorityColors = {
  CRITICAL: "#dc2626",
  HIGH: "#f97316",
  MEDIUM: "#eab308",
  LOW: "#22c55e",
};

export default function BugPriorityChart({ stats, loading = false }) {
  const chartData = stats
    ? Object.entries(stats).map(([priority, count]) => ({
        priority,
        count,
      }))
    : [];

  return (
    <section
      aria-labelledby="bug-priority-heading"
      className="mt-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
      aria-busy={loading}
    >
      <div className="mb-4">
        <h3
          id="bug-priority-heading"
          className="text-base font-semibold text-slate-900"
        >
          Bugs by priority
        </h3>
        <p className="mt-1 text-sm text-slate-500">
          Bug ticket counts across priority levels.
        </p>
      </div>

      {loading ? (
        <div
          className="flex h-64 animate-pulse items-end gap-5 px-8 pb-8"
          aria-hidden="true"
        >
          {[70, 45, 85, 55].map((height, index) => (
            <div
              key={index}
              className="flex-1 rounded-t bg-slate-200"
              style={{ height: `${height}%` }}
            />
          ))}
        </div>
      ) : (
        <div className="h-64 min-w-0">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 8, right: 12, bottom: 4, left: -12 }}
            >
              <CartesianGrid
                stroke="#e2e8f0"
                strokeDasharray="3 3"
                vertical={false}
              />
              <XAxis
                dataKey="priority"
                tickLine={false}
                axisLine={false}
                tick={{ fill: "#64748b", fontSize: 12 }}
              />
              <YAxis
                allowDecimals={false}
                tickLine={false}
                axisLine={false}
                tick={{ fill: "#64748b", fontSize: 12 }}
              />
              <Tooltip
                formatter={(value) => [value, "Bug tickets"]}
                cursor={{ fill: "#f8fafc" }}
              />
              <Bar dataKey="count" name="Bug tickets" radius={[5, 5, 0, 0]}>
                {chartData.map(({ priority }) => (
                  <Cell
                    key={priority}
                    fill={priorityColors[priority] ?? "#64748b"}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </section>
  );
}
