// Shared Taiga API types. Only the fields the React port reads are typed; the
// rest is preserved as Record<string, unknown> so we don't lose data on
// round-trips.

export interface UserSummary {
  id: number;
  username: string;
  full_name: string;
  full_name_display: string;
  color?: string;
  email?: string;
  photo?: string | null;
  big_photo?: string | null;
  gravatar_id?: string;
  is_active?: boolean;
  bio?: string;
  lang?: string;
  theme?: string;
  timezone?: string;
}

export interface AuthUser extends UserSummary {
  auth_token: string;
  refresh?: string;
  uuid?: string;
  roles?: string[];
  read_new_terms?: boolean;
  accepted_terms?: boolean;
  total_private_projects?: number;
  total_public_projects?: number;
  max_private_projects?: number | null;
  max_public_projects?: number | null;
}

export interface ProjectSummary {
  id: number;
  name: string;
  slug: string;
  description?: string;
  logo_small_url?: string | null;
  logo_big_url?: string | null;
  is_private: boolean;
  is_fan?: boolean;
  is_watcher?: boolean;
  total_fans?: number;
  total_watchers?: number;
  is_backlog_activated?: boolean;
  is_kanban_activated?: boolean;
  is_wiki_activated?: boolean;
  is_issues_activated?: boolean;
  is_epics_activated?: boolean;
  is_contact_activated?: boolean;
  total_milestones?: number;
  total_story_points?: number;
  members?: number[];
  i_am_member?: boolean;
  i_am_admin?: boolean;
  i_am_owner?: boolean;
  my_permissions?: string[];
  anon_permissions?: string[];
  public_permissions?: string[];
  blocked_code?: string | null;
  default_us_status?: number;
  default_task_status?: number;
  default_issue_status?: number;
  default_priority?: number;
  default_severity?: number;
  default_issue_type?: number;
  us_statuses?: ChoiceItem[];
  task_statuses?: ChoiceItem[];
  issue_statuses?: ChoiceItem[];
  priorities?: ChoiceItem[];
  severities?: ChoiceItem[];
  issue_types?: ChoiceItem[];
  epic_statuses?: ChoiceItem[];
  points?: PointItem[];
  roles?: RoleSummary[];
  tags_colors?: [string, string | null][];
  total_milestones_finished?: number;
}

export interface ChoiceItem {
  id: number;
  name: string;
  color?: string | null;
  is_closed?: boolean;
  order?: number;
  project_id?: number;
}

export interface PointItem extends ChoiceItem {
  value: number | null;
}

export interface RoleSummary {
  id: number;
  name: string;
  slug?: string;
  order?: number;
  computable?: boolean;
}

export interface UserStory {
  id: number;
  ref: number;
  subject: string;
  description?: string;
  description_html?: string;
  status: number;
  status_extra_info?: { name: string; color: string; is_closed: boolean };
  is_closed: boolean;
  milestone?: number | null;
  milestone_name?: string | null;
  milestone_slug?: string | null;
  project: number;
  project_extra_info?: { id: number; name: string; slug: string };
  assigned_to?: number | null;
  assigned_to_extra_info?: UserSummary | null;
  assigned_users?: number[];
  owner?: number | null;
  owner_extra_info?: UserSummary | null;
  total_points?: number | null;
  points?: Record<string, number | null>;
  tags?: Array<[string, string | null]> | null;
  is_blocked?: boolean;
  blocked_note?: string;
  is_voter?: boolean;
  total_voters?: number;
  is_watcher?: boolean;
  total_watchers?: number;
  watchers?: number[];
  attachments?: number;
  total_attachments?: number;
  comment?: string | null;
  external_reference?: unknown;
  modified_date?: string;
  finish_date?: string | null;
  due_date?: string | null;
  due_date_reason?: string | null;
  due_date_status?: string | null;
  client_requirement?: boolean;
  team_requirement?: boolean;
  generated_from_issue?: number | null;
  from_issue_extra_info?: unknown;
  generated_from_task?: number | null;
  from_task_extra_info?: unknown;
  origin_issue?: number | null;
  origin_task?: number | null;
  backlog_order?: number;
  sprint_order?: number;
  kanban_order?: number;
  version?: number;
  tribe_gig?: unknown;
  total_comments?: number;
  external_user?: unknown;
}

export interface Task {
  id: number;
  ref: number;
  subject: string;
  description?: string;
  description_html?: string;
  status: number;
  status_extra_info?: { name: string; color: string; is_closed: boolean };
  is_closed: boolean;
  milestone?: number | null;
  user_story?: number | null;
  user_story_extra_info?: { id: number; ref: number; subject: string } | null;
  project: number;
  project_extra_info?: { id: number; name: string; slug: string };
  assigned_to?: number | null;
  assigned_to_extra_info?: UserSummary | null;
  owner?: number | null;
  owner_extra_info?: UserSummary | null;
  is_iocaine?: boolean;
  is_blocked?: boolean;
  blocked_note?: string;
  tags?: Array<[string, string | null]> | null;
  taskboard_order?: number;
  us_order?: number;
  due_date?: string | null;
  due_date_status?: string | null;
  modified_date?: string;
  total_comments?: number;
  attachments?: number;
  total_attachments?: number;
  version?: number;
}

export interface Issue {
  id: number;
  ref: number;
  subject: string;
  description?: string;
  description_html?: string;
  status: number;
  status_extra_info?: { name: string; color: string; is_closed: boolean };
  is_closed: boolean;
  type?: number;
  type_extra_info?: { name: string; color: string };
  priority?: number;
  priority_extra_info?: { name: string; color: string };
  severity?: number;
  severity_extra_info?: { name: string; color: string };
  project: number;
  project_extra_info?: { id: number; name: string; slug: string };
  assigned_to?: number | null;
  assigned_to_extra_info?: UserSummary | null;
  owner?: number | null;
  owner_extra_info?: UserSummary | null;
  milestone?: number | null;
  is_blocked?: boolean;
  blocked_note?: string;
  tags?: Array<[string, string | null]> | null;
  due_date?: string | null;
  due_date_status?: string | null;
  total_comments?: number;
  attachments?: number;
  total_attachments?: number;
  total_voters?: number;
  total_watchers?: number;
  is_voter?: boolean;
  is_watcher?: boolean;
  modified_date?: string;
  finished_date?: string | null;
  external_reference?: unknown;
  version?: number;
}

export interface Epic {
  id: number;
  ref: number;
  subject: string;
  description?: string;
  description_html?: string;
  status: number;
  status_extra_info?: { name: string; color: string; is_closed: boolean };
  is_closed: boolean;
  project: number;
  project_extra_info?: { id: number; name: string; slug: string };
  assigned_to?: number | null;
  assigned_to_extra_info?: UserSummary | null;
  owner?: number | null;
  owner_extra_info?: UserSummary | null;
  color?: string;
  user_stories_counts?: { progress: number; total: number };
  is_blocked?: boolean;
  blocked_note?: string;
  tags?: Array<[string, string | null]> | null;
  total_voters?: number;
  total_watchers?: number;
  is_voter?: boolean;
  is_watcher?: boolean;
  modified_date?: string;
  epics_order?: number;
  client_requirement?: boolean;
  team_requirement?: boolean;
  version?: number;
}

export interface Milestone {
  id: number;
  name: string;
  slug: string;
  estimated_start: string;
  estimated_finish: string;
  closed: boolean;
  disponibility: number;
  user_stories?: UserStory[];
  total_points: number;
  closed_points: number;
  modified_date: string;
  created_date: string;
  project: number;
  project_extra_info?: { id: number; name: string; slug: string };
  owner?: number;
}

export interface Membership {
  id: number;
  project: number;
  role: number;
  role_name?: string;
  user: number | null;
  email?: string;
  is_owner?: boolean;
  is_admin?: boolean;
  is_user_active?: boolean;
  user_email?: string;
  user_order?: number;
  full_name?: string;
  color?: string;
  photo?: string | null;
  gravatar_id?: string;
  invited_by?: UserSummary;
  invitation_extra_text?: string;
  created_at?: string;
  user_extra_info?: UserSummary;
}

export interface WikiPage {
  id: number;
  slug: string;
  content: string;
  html?: string;
  project: number;
  owner: number;
  last_modifier: number;
  modified_date: string;
  created_date: string;
  total_attachments?: number;
  is_voter?: boolean;
  total_voters?: number;
  is_watcher?: boolean;
  total_watchers?: number;
  version?: number;
}

export interface WikiLink {
  id: number;
  title: string;
  href: string;
  order: number;
  project: number;
}

export interface Notification {
  id: number;
  user: { id: number; name: string; photo: string | null; username: string };
  created: string;
  changer_pretty_name?: string;
  events?: string[];
  history_entries?: HistoryEntry[];
  read?: string | null;
}

export interface HistoryEntry {
  id: string;
  user: UserSummary | null;
  created_at: string;
  type: number;
  comment: string;
  comment_html?: string;
  delete_comment_date?: string | null;
  delete_comment_user?: UserSummary | null;
  edit_comment_date?: string | null;
  is_hidden: boolean;
  is_snapshot: boolean;
  values_diff?: Record<string, unknown>;
  diff?: Record<string, unknown>;
  key?: string;
  values?: Record<string, unknown>;
  snapshot?: Record<string, unknown>;
}
