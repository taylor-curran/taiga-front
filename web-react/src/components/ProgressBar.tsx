import type { BacklogStats } from "../types/backlogStats";

interface ProgressBarProps {
  stats: BacklogStats;
}

function adjustPercentage(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.round(Math.min(100, Math.max(0, value)));
}

export function computeProgressPercentages(stats: BacklogStats): {
  projectPointsPercentage: number;
  closedPointsPercentage: number;
} {
  const totalPoints = stats.total_points ? stats.total_points : stats.defined_points;
  const definedPoints = stats.defined_points;
  const closedPoints = stats.closed_points;

  let projectPointsPercentage: number;
  let closedPointsPercentage: number;

  if (definedPoints > totalPoints && definedPoints > 0) {
    projectPointsPercentage = (totalPoints * 100) / definedPoints;
    closedPointsPercentage = (closedPoints * 100) / definedPoints;
  } else if (totalPoints > 0) {
    projectPointsPercentage = 100;
    closedPointsPercentage = (closedPoints * 100) / totalPoints;
  } else {
    projectPointsPercentage = 0;
    closedPointsPercentage = 0;
  }

  return {
    projectPointsPercentage: adjustPercentage(projectPointsPercentage - 3),
    closedPointsPercentage: adjustPercentage(closedPointsPercentage - 3),
  };
}

export default function ProgressBar({ stats }: ProgressBarProps) {
  const { projectPointsPercentage, closedPointsPercentage } = computeProgressPercentages(stats);
  return (
    <div className="progress-bar">
      <div className="defined-points" title="Excess of points" />
      <div
        className="project-points-progress"
        title="Pending points"
        style={{ width: `${projectPointsPercentage}%` }}
      />
      <div
        className="closed-points-progress"
        title="Closed points"
        style={{ width: `${closedPointsPercentage}%` }}
      />
    </div>
  );
}
