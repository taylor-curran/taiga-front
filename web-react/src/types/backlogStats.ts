export interface MilestoneStats {
  name: string;
  optimal: number;
  evolution: number | null;
  "team-increment": number;
  "client-increment": number;
}

export interface BacklogStats {
  milestones: MilestoneStats[];
  total_points: number | null;
  defined_points: number;
  closed_points: number;
  speed: number;
  total_milestones: number | null;
  completedPercentage?: number;
}

export interface Project {
  id: number;
  name: string;
  slug: string;
  description?: string;
}
