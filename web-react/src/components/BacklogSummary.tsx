import type { BacklogStats } from "../types/backlogStats";
import ProgressBar from "./ProgressBar";

interface BacklogSummaryProps {
  stats: BacklogStats;
  onToggleBurndown?: () => void;
  burndownVisible?: boolean;
}

function formatNumber(value: number | null | undefined, decimals = 0): string {
  if (value === null || value === undefined || !Number.isFinite(value)) return "—";
  return value.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

export default function BacklogSummary({
  stats,
  onToggleBurndown,
  burndownVisible,
}: BacklogSummaryProps) {
  const totalPoints = stats.total_points ?? 0;
  const closedPoints = stats.closed_points;
  const completedPercentage =
    totalPoints > 0 ? Math.round((100 * closedPoints) / totalPoints) : 0;

  return (
    <div className="summary">
      <div className="summary-progress-bar">
        <ProgressBar stats={stats} />
      </div>

      <div className="data">
        <span className="number">{completedPercentage}%</span>
      </div>

      {stats.total_points !== null && stats.total_points !== undefined ? (
        <div className="summary-stats">
          <span className="number">{formatNumber(stats.total_points)}</span>
          <span className="description">Total points</span>
        </div>
      ) : null}
      <div className="summary-stats">
        <span className="number">{formatNumber(stats.defined_points)}</span>
        <span className="description">Defined points</span>
      </div>
      <div className="summary-stats">
        <span className="number">{formatNumber(stats.closed_points)}</span>
        <span className="description">Closed points</span>
      </div>
      <div className="summary-stats">
        <span className="number">{formatNumber(stats.speed)}</span>
        <span className="description">Points per sprint</span>
      </div>

      {onToggleBurndown ? (
        <button
          type="button"
          className={`stats js-toggle-burndown-visibility-button${
            burndownVisible ? " active" : ""
          }`}
          title="Toggle burndown graph"
          onClick={onToggleBurndown}
        >
          {burndownVisible ? "Hide chart" : "Show chart"}
        </button>
      ) : null}
    </div>
  );
}
