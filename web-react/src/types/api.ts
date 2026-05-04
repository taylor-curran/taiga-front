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
  total_watchers?: number;
  is_kanban_activated?: boolean;
  is_backlog_activated?: boolean;
  is_wiki_activated?: boolean;
  is_issues_activated?: boolean;
  is_epics_activated?: boolean;
  logo_small_url?: string | null;
  logo_big_url?: string | null;
  tags?: string[] | null;
}

export interface ProjectDetail extends ProjectSummary {
  members?: Membership[];
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
  i_am_owner?: boolean;
  i_am_member?: boolean;
  i_am_admin?: boolean;
  my_permissions?: string[];
  total_story_points?: number;
}

export interface UserStory {
  id: number;
  ref: number;
  subject: string;
  status: number;
  status_extra_info?: { name?: string; color?: string; is_closed?: boolean };
  is_closed?: boolean;
  assigned_to?: number | null;
  assigned_to_extra_info?: { full_name_display?: string; photo?: string | null };
  total_points?: number | null;
  total_comments?: number;
  finish_date?: string | null;
  milestone?: number | null;
  milestone_name?: string | null;
  milestone_slug?: string | null;
  project?: number;
  project_extra_info?: { id: number; slug: string; name: string };
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
  assigned_to_extra_info?: { full_name_display?: string };
  user_story?: number | null;
  user_story_extra_info?: { ref: number; subject: string };
  milestone?: number | null;
  is_iocaine?: boolean;
  description?: string;
  description_html?: string;
  tags?: ([string, string | null] | string)[] | null;
  total_comments?: number;
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
  assigned_to?: number | null;
  assigned_to_extra_info?: { full_name_display?: string };
  description?: string;
  description_html?: string;
  total_comments?: number;
  tags?: ([string, string | null] | string)[] | null;
}

export interface Epic {
  id: number;
  ref: number;
  subject: string;
  status: number;
  status_extra_info?: { name?: string; color?: string };
  is_closed?: boolean;
  assigned_to?: number | null;
  assigned_to_extra_info?: { full_name_display?: string };
  description?: string;
  description_html?: string;
  color?: string;
  user_stories_counts?: { progress?: number; total?: number };
  total_comments?: number;
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
  total_activity?: number;
}

export interface ApiError {
  message?: string;
  detail?: string;
  _error_message?: string;
  _error_type?: string;
}

// --- Backlog & User Stories extended types ---

export interface PointValue {
  id: number;
  name: string;
  value: number | null;
  order?: number;
}

export interface RolePointsEntry {
  [roleId: string]: number; // roleId -> pointId
}

export interface UserStoryDetail extends UserStory {
  points?: RolePointsEntry;
  watchers?: number[];
  voters_count?: number;
  is_voter?: boolean;
  is_watcher?: boolean;
  custom_attributes_values?: Record<string, unknown>;
  attachments?: Attachment[];
  comment?: string;
  version?: number;
  backlog_order?: number;
  sprint_order?: number;
  kanban_order?: number;
  tribe_gig?: unknown;
  due_date?: string | null;
  due_date_reason?: string | null;
  due_date_status?: string | null;
  owner?: number;
  owner_extra_info?: { full_name_display?: string; photo?: string | null; username?: string };
  assigned_users?: number[];
  assigned_users_extra_info?: Array<{ full_name_display?: string; photo?: string | null; id?: number }>;
  epics?: Array<{ id: number; ref: number; subject: string; color?: string; project?: { id: number; slug: string; name: string } }> | null;
  origin_issue?: unknown;
  origin_task?: unknown;
  total_voters?: number;
  total_watchers?: number;
  neighbors?: { previous?: { id: number; ref: number; subject: string }; next?: { id: number; ref: number; subject: string } };
}

export interface Attachment {
  id: number;
  name: string;
  size?: number;
  url?: string;
  thumbnail_card_url?: string | null;
  created_date?: string;
  modified_date?: string;
  object_id?: number;
  project?: number;
  owner?: number;
  attached_file?: string;
  is_deprecated?: boolean;
  description?: string;
  order?: number;
  from_comment?: boolean;
}

export interface Comment {
  id: string;
  user?: { id: number; name?: string; photo?: string | null; username?: string };
  comment?: string;
  comment_html?: string;
  created_at?: string;
  delete_comment_date?: string | null;
}

export interface HistoryEntry {
  id: string;
  user?: { pk?: number; name?: string; photo?: string | null; username?: string };
  created_at?: string;
  comment?: string;
  comment_html?: string;
  type?: number;
  values_diff?: Record<string, unknown>;
  delete_comment_date?: string | null;
  edit_comment_date?: string | null;
}

export interface CustomAttribute {
  id: number;
  name: string;
  description?: string;
  type?: string;
  order?: number;
  project?: number;
  extra?: string | null;
  created_date?: string;
  modified_date?: string;
}

export interface CustomAttributeValue {
  attributes_values?: Record<string, unknown>;
  version?: number;
}

export interface BulkUpdateOrder {
  project_id: number;
  bulk_userstories: Array<[number, number]>; // [usId, order]
}

export interface SprintCreate {
  project: number;
  name: string;
  estimated_start: string;
  estimated_finish: string;
}

export interface SprintUpdate {
  name?: string;
  estimated_start?: string;
  estimated_finish?: string;
  closed?: boolean;
}

export interface MilestoneDetail extends Milestone {
  project?: number;
  disponibility?: number;
  order?: number;
  created_date?: string;
  modified_date?: string;
}
