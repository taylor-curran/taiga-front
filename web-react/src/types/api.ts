// Subset of the Taiga API surface used by the React port. Fields are
// intentionally permissive (`?` everywhere) since the API returns broad
// payloads; we only annotate what the UI actually reads.

export interface ProjectStatus {
  id: number;
  name: string;
  color?: string;
  is_closed?: boolean;
  order?: number;
  slug?: string;
  wip_limit?: number | null;
}

export interface Membership {
  id: number;
  user?: number;
  user_email?: string;
  full_name?: string;
  photo?: string | null;
  role?: number;
  role_name?: string;
  is_admin?: boolean;
  is_active?: boolean;
  color?: string;
  username?: string;
}

export interface ProjectSummary {
  id: number;
  slug: string;
  name: string;
  description?: string;
  is_private?: boolean;
  total_milestones?: number;
  total_story_points?: number;
  default_points?: number;
  total_fans?: number;
  total_fans_last_week?: number;
  total_fans_last_month?: number;
  total_fans_last_year?: number;
  total_watchers?: number;
  total_activity?: number;
  total_activity_last_week?: number;
  total_activity_last_month?: number;
  total_activity_last_year?: number;
  is_fan?: boolean;
  is_watcher?: boolean;
  is_kanban_activated?: boolean;
  is_backlog_activated?: boolean;
  is_wiki_activated?: boolean;
  is_issues_activated?: boolean;
  is_epics_activated?: boolean;
  is_featured?: boolean;
  is_looking_for_people?: boolean;
  looking_for_people_note?: string;
  logo_small_url?: string | null;
  logo_big_url?: string | null;
  tags?: string[] | null;
  colorized_tags?: { name: string; color: string }[];
  members?: Membership[];
  i_am_member?: boolean;
  i_am_owner?: boolean;
  blocked_code?: string | null;
  my_homepage?: string;
  created_date?: string;
  modified_date?: string;
}

export interface ProjectDetail extends ProjectSummary {
  us_statuses?: ProjectStatus[];
  task_statuses?: ProjectStatus[];
  issue_statuses?: ProjectStatus[];
  epic_statuses?: ProjectStatus[];
  priorities?: { id: number; name: string; color?: string }[];
  severities?: { id: number; name: string; color?: string }[];
  issue_types?: { id: number; name: string; color?: string }[];
  points?: { id: number; name: string; value?: number | null; order?: number }[];
  total_milestones?: number;
  is_admin?: boolean;
  i_am_admin?: boolean;
  my_permissions?: string[];
  total_story_points?: number;
  total_closed_milestones?: number;
  total_memberships?: number;
  roles?: { id: number; name: string; order?: number; computable?: boolean }[];
}

export interface UserStory {
  id: number;
  ref: number;
  subject: string;
  status: number;
  status_extra_info?: { name?: string; color?: string; is_closed?: boolean };
  is_closed?: boolean;
  assigned_to?: number | null;
  assigned_to_extra_info?: { full_name_display?: string; photo?: string | null; username?: string };
  total_points?: number | null;
  total_comments?: number;
  finish_date?: string | null;
  milestone?: number | null;
  milestone_name?: string | null;
  milestone_slug?: string | null;
  project?: number;
  project_extra_info?: { id: number; slug: string; name: string; logo_small_url?: string | null };
  tags?: ([string, string | null] | string)[] | null;
  is_blocked?: boolean;
  blocked_note?: string | null;
  description?: string;
  description_html?: string;
  generated_from_issue?: number | null;
  generated_from_task?: number | null;
  modified_date?: string;
  created_date?: string;
}

export interface Task {
  id: number;
  ref: number;
  subject: string;
  status: number;
  status_extra_info?: { name?: string; color?: string };
  is_closed?: boolean;
  assigned_to?: number | null;
  assigned_to_extra_info?: { full_name_display?: string; photo?: string | null; username?: string };
  user_story?: number | null;
  user_story_extra_info?: { ref: number; subject: string };
  milestone?: number | null;
  is_iocaine?: boolean;
  is_blocked?: boolean;
  blocked_note?: string | null;
  description?: string;
  description_html?: string;
  tags?: ([string, string | null] | string)[] | null;
  total_comments?: number;
  project?: number;
  project_extra_info?: { id: number; slug: string; name: string; logo_small_url?: string | null };
  modified_date?: string;
}

export interface Issue {
  id: number;
  ref: number;
  subject: string;
  status: number;
  status_extra_info?: { name?: string; color?: string };
  priority: number;
  severity: number;
  type: number;
  is_closed?: boolean;
  is_blocked?: boolean;
  blocked_note?: string | null;
  assigned_to?: number | null;
  assigned_to_extra_info?: { full_name_display?: string; photo?: string | null; username?: string };
  description?: string;
  description_html?: string;
  total_comments?: number;
  tags?: ([string, string | null] | string)[] | null;
  project?: number;
  project_extra_info?: { id: number; slug: string; name: string; logo_small_url?: string | null };
  modified_date?: string;
}

export interface Epic {
  id: number;
  ref: number;
  subject: string;
  status: number;
  status_extra_info?: { name?: string; color?: string };
  is_closed?: boolean;
  is_blocked?: boolean;
  blocked_note?: string | null;
  assigned_to?: number | null;
  assigned_to_extra_info?: { full_name_display?: string; photo?: string | null; username?: string };
  description?: string;
  description_html?: string;
  color?: string;
  user_stories_counts?: { progress?: number; total?: number };
  total_comments?: number;
  project?: number;
  project_extra_info?: { id: number; slug: string; name: string; logo_small_url?: string | null };
  modified_date?: string;
}

export interface Milestone {
  id: number;
  name: string;
  slug?: string;
  estimated_start?: string;
  estimated_finish?: string;
  closed?: boolean;
  total_points?: number;
  closed_points?: number;
  user_stories?: UserStory[];
}

export interface WikiPage {
  id: number;
  slug: string;
  content?: string;
  html?: string;
  modified_date?: string;
  owner?: number;
  last_modifier?: number;
  version?: number;
}

export interface TimelineEntry {
  id: number;
  created: string;
  event_type: string;
  data: Record<string, unknown>;
  obj_id?: number;
}

export interface Notification {
  id: number;
  read?: string | null;
  changer?: { id: number; full_name?: string };
  created?: string;
}

export interface DiscoverProject extends ProjectSummary {
}

export interface ProjectStats {
  name?: string;
  total_milestones?: number;
  total_points?: number;
  closed_points?: number;
  defined_points?: number;
  assigned_points?: number;
  speed?: number;
}

export interface DiscoverStats {
  projects?: { total?: number };
}

export interface DutyItem {
  id: number;
  ref: number;
  subject: string;
  status_extra_info?: { name?: string; color?: string };
  is_blocked?: boolean;
  blocked_note?: string | null;
  assigned_to_extra_info?: { full_name_display?: string; photo?: string | null };
  project?: number;
  project_extra_info?: { id: number; slug: string; name: string; logo_small_url?: string | null };
  modified_date?: string;
  _type: 'userstory' | 'task' | 'issue' | 'epic';
}

export interface ApiError {
  message?: string;
  detail?: string;
  _error_message?: string;
  _error_type?: string;
}
