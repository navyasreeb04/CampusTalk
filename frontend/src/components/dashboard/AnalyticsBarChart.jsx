import { useMemo } from "react";
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
import DashboardCardShell from "./DashboardCardShell";

const prettifySkillLabel = (value = "") =>
  value
    .split(" ")
    .map((word) =>
      word.length <= 4 ? word.toUpperCase() : word.charAt(0).toUpperCase() + word.slice(1)
    )
    .join(" ");

const DashboardTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) {
    return null;
  }

  return (
    <div className="dashboard-tooltip">
      <strong>{payload[0].payload.displaySkill}</strong>
      <span>{payload[0].value} students</span>
    </div>
  );
};

const AnalyticsBarChart = ({
  title,
  subtitle,
  eyebrow,
  items,
  className = "",
  colors = ["#b98050", "#d59f72"],
}) => {
  const chartData = useMemo(
    () =>
      (items || []).map((item) => ({
        ...item,
        displaySkill: prettifySkillLabel(item.skill),
      })),
    [items]
  );

  return (
    <DashboardCardShell className={className} eyebrow={eyebrow} subtitle={subtitle} title={title}>
      {chartData.length ? (
        <div className="dashboard-chart-wrap">
          <ResponsiveContainer height="100%" width="100%">
            <BarChart data={chartData} margin={{ top: 12, right: 8, left: 0, bottom: 8 }}>
              <CartesianGrid stroke="rgba(121, 95, 75, 0.09)" strokeDasharray="3 3" vertical={false} />
              <XAxis
                axisLine={false}
                dataKey="displaySkill"
                tick={{ fill: "currentColor", fontSize: 12 }}
                tickLine={false}
              />
              <YAxis
                allowDecimals={false}
                axisLine={false}
                tick={{ fill: "currentColor", fontSize: 12 }}
                tickLine={false}
              />
              <Tooltip content={<DashboardTooltip />} cursor={{ fill: "rgba(185, 128, 80, 0.08)" }} />
              <Bar
                activeBar={{
                  fill: colors[0],
                  radius: [14, 14, 0, 0],
                  stroke: "rgba(255,255,255,0.85)",
                  strokeWidth: 1.5,
                }}
                animationBegin={100}
                animationDuration={1200}
                animationEasing="ease-in-out"
                dataKey="count"
                maxBarSize={52}
                radius={[14, 14, 0, 0]}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`${entry.skill}-${index}`} fill={colors[index % colors.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <p className="muted-text">No skill analytics available yet.</p>
      )}
    </DashboardCardShell>
  );
};

export default AnalyticsBarChart;
