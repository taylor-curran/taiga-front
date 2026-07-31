import { useMemo } from "react";
import {
  Area,
  ComposedChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import type { BacklogStats } from "../types/backlogStats";

interface BurndownChartProps {
  stats: BacklogStats;
}

interface ChartPoint {
  index: number;
  name: string;
  optimal: number;
  evolution: number | undefined;
  clientIncrement: number;
  teamIncrement: number;
}

const SERIES_LABELS: Record<keyof Omit<ChartPoint, "index" | "name">, string> = {
  optimal: "Optimal",
  evolution: "Real",
  clientIncrement: "Client increment",
  teamIncrement: "Team increment",
};

const SERIES_COLORS = {
  optimal: { stroke: "rgba(216,222,233,1)", fill: "rgba(200,201,196,0.2)" },
  evolution: { stroke: "rgba(168,228,64,1)", fill: "rgba(147,196,0,0.2)" },
  clientIncrement: { stroke: "rgba(216,222,233,1)", fill: "rgba(200,201,196,0.2)" },
  teamIncrement: { stroke: "rgba(255,160,160,1)", fill: "rgba(255,160,160,0.2)" },
} as const;

function formatValue(value: unknown): string {
  if (typeof value !== "number" || !Number.isFinite(value)) return "—";
  return (Math.abs(value * 10) / 10).toFixed(1);
}

interface TooltipPayloadEntry {
  dataKey?: string | number;
  name?: string;
  value?: number;
  color?: string;
  payload?: ChartPoint;
}

function BurndownTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: TooltipPayloadEntry[];
}) {
  if (!active || !payload || payload.length === 0) return null;
  const sprintName = payload[0]?.payload?.name ?? "";
  return (
    <div className="burndown-tooltip">
      <div className="burndown-tooltip-title">{sprintName}</div>
      {payload.map((entry) => {
        const key = entry.dataKey as keyof typeof SERIES_LABELS;
        const label = SERIES_LABELS[key] ?? entry.name ?? String(key);
        return (
          <div key={String(entry.dataKey)} className="burndown-tooltip-row">
            <span className="burndown-tooltip-swatch" style={{ background: entry.color }} />
            <span className="burndown-tooltip-label">{label}:</span>
            <span className="burndown-tooltip-value">{formatValue(entry.value)}</span>
          </div>
        );
      })}
    </div>
  );
}

export default function BurndownChart({ stats }: BurndownChartProps) {
  const chartData = useMemo<ChartPoint[]>(() => {
    return stats.milestones.map((ml, i) => ({
      index: i,
      name: ml.name,
      optimal: ml.optimal,
      evolution: ml.evolution ?? undefined,
      clientIncrement: -(ml["team-increment"] + ml["client-increment"]),
      teamIncrement: -ml["team-increment"],
    }));
  }, [stats.milestones]);

  if (chartData.length === 0) {
    return (
      <div className="burndown-empty">
        No sprint data available for this project yet.
      </div>
    );
  }

  return (
    <div className="burndown-chart">
      <ResponsiveContainer width="100%" aspect={6}>
        <ComposedChart
          data={chartData}
          margin={{ top: 0, right: 20, bottom: 16, left: 5 }}
        >
          <CartesianGrid stroke="#D8DEE9" strokeDasharray="3 3" />
          <XAxis
            dataKey="index"
            tickFormatter={() => ""}
            label={{ value: "Sprints", position: "insideBottom", offset: -8, fill: "#666" }}
            stroke="#D8DEE9"
          />
          <YAxis
            label={{ value: "Points", angle: -90, position: "insideLeft", fill: "#666" }}
            stroke="#D8DEE9"
          />
          <Tooltip content={<BurndownTooltip />} />
          <Area
            type="monotone"
            dataKey="optimal"
            stroke={SERIES_COLORS.optimal.stroke}
            fill={SERIES_COLORS.optimal.fill}
            strokeWidth={2}
            isAnimationActive={false}
            connectNulls
          />
          <Area
            type="monotone"
            dataKey="evolution"
            stroke={SERIES_COLORS.evolution.stroke}
            fill={SERIES_COLORS.evolution.fill}
            strokeWidth={2}
            isAnimationActive={false}
            connectNulls
          />
          <Area
            type="monotone"
            dataKey="clientIncrement"
            stroke={SERIES_COLORS.clientIncrement.stroke}
            fill={SERIES_COLORS.clientIncrement.fill}
            strokeWidth={2}
            isAnimationActive={false}
          />
          <Area
            type="monotone"
            dataKey="teamIncrement"
            stroke={SERIES_COLORS.teamIncrement.stroke}
            fill={SERIES_COLORS.teamIncrement.fill}
            strokeWidth={2}
            isAnimationActive={false}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
