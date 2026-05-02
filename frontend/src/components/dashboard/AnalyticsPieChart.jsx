import { useMemo, useState } from "react";
import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Sector,
  Tooltip,
} from "recharts";
import DashboardCardShell from "./DashboardCardShell";

const PIE_COLORS = ["#b98050", "#7b8e71"];

const labelMap = {
  internship: "Internship",
  fulltime: "Full-time",
};

const renderActiveShape = ({
  cx,
  cy,
  innerRadius,
  outerRadius,
  startAngle,
  endAngle,
  fill,
}) => (
  <Sector
    cx={cx}
    cy={cy}
    endAngle={endAngle}
    fill={fill}
    innerRadius={innerRadius}
    outerRadius={outerRadius + 8}
    startAngle={startAngle}
  />
);

const DashboardTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) {
    return null;
  }

  return (
    <div className="dashboard-tooltip">
      <strong>{payload[0].name}</strong>
      <span>{payload[0].value} posts</span>
    </div>
  );
};

const AnalyticsPieChart = ({ placements }) => {
  const [activeIndex, setActiveIndex] = useState(0);

  const chartData = useMemo(
    () =>
      Object.entries(placements || {})
        .map(([key, value]) => ({
          key,
          name: labelMap[key] || key,
          value,
        }))
        .filter((item) => item.value > 0),
    [placements]
  );

  const totalPlacements = chartData.reduce((sum, item) => sum + item.value, 0);

  return (
    <DashboardCardShell
      eyebrow="Placement split"
      subtitle="Internship and full-time post distribution with animated progress fill."
      title="Placement distribution"
    >
      {chartData.length ? (
        <div className="dashboard-pie-layout">
          <div className="dashboard-chart-wrap pie-wrap">
            <ResponsiveContainer height="100%" width="100%">
              <PieChart>
                <Pie
                  activeIndex={activeIndex}
                  activeShape={renderActiveShape}
                  animationBegin={120}
                  animationDuration={1500}
                  animationEasing="ease-in-out"
                  cornerRadius={10}
                  data={chartData}
                  dataKey="value"
                  innerRadius={72}
                  label={({ name, percent }) => `${name} ${Math.round(percent * 100)}%`}
                  labelLine={false}
                  onMouseEnter={(_, index) => setActiveIndex(index)}
                  outerRadius={104}
                  paddingAngle={3}
                >
                  {chartData.map((entry, index) => (
                    <Cell
                      key={entry.key}
                      fill={PIE_COLORS[index % PIE_COLORS.length]}
                      stroke="rgba(255,255,255,0.55)"
                      strokeWidth={2}
                    />
                  ))}
                </Pie>
                <Tooltip content={<DashboardTooltip />} />
                <Legend verticalAlign="bottom" />
              </PieChart>
            </ResponsiveContainer>
            <div className="dashboard-chart-center">
              <strong>{totalPlacements}</strong>
              <span>Total posts</span>
            </div>
          </div>
        </div>
      ) : (
        <p className="muted-text">No placement analytics available yet.</p>
      )}
    </DashboardCardShell>
  );
};

export default AnalyticsPieChart;
