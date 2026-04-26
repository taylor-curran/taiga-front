export interface UserSummary {
  id: number;
  username: string;
  full_name?: string;
  full_name_display: string;
  photo: string | null;
  big_photo?: string | null;
  gravatar_id: string;
  is_active: boolean;
}

export interface CurrentUser extends UserSummary {
  auth_token: string;
  refresh: string;
  email: string;
  bio: string;
  color: string;
  lang: string;
  theme: string;
  timezone: string;
  roles: string[];
  total_private_projects: number;
  total_public_projects: number;
  uuid: string;
  date_joined: string;
  read_new_terms: boolean;
  accepted_terms: boolean;
  max_private_projects: number | null;
  max_public_projects: number | null;
  max_memberships_private_projects: number | null;
  max_memberships_public_projects: number | null;
  verified_email: boolean;
}

export interface ProjectListItem {
  id: number;
  name: string;
  slug: string;
  description: string;
  created_date: string;
  modified_date: string;
  owner: UserSummary;
  members: number[];
  total_milestones: number;
  total_story_points: number;
  is_contact_activated: boolean;
  is_epics_activated: boolean;
  is_backlog_activated: boolean;
  is_kanban_activated: boolean;
  is_wiki_activated: boolean;
  is_issues_activated: boolean;
  is_private: boolean;
  is_featured: boolean;
  is_looking_for_people: boolean;
  blocked_code: string | null;
  total_fans: number;
  total_activity: number;
  tags: string[] | null;
  tags_colors: Array<[string, string | null]> | null;
  logo_small_url: string | null;
  logo_big_url: string | null;
  i_am_owner: boolean;
  i_am_admin: boolean;
  i_am_member: boolean;
}

export interface ProjectDetail extends ProjectListItem {
  total_memberships: number;
  us_statuses: ProjectStatus[];
  task_statuses: ProjectStatus[];
  issue_statuses: ProjectStatus[];
  epic_statuses: ProjectStatus[];
  priorities: ProjectStatus[];
  severities: ProjectStatus[];
  issue_types: ProjectStatus[];
  points: Array<{ id: number; name: string; value: number | null; order: number }>;
  default_us_status: number | null;
  default_task_status: number | null;
  default_issue_status: number | null;
  default_epic_status: number | null;
  default_priority: number | null;
  default_severity: number | null;
  default_issue_type: number | null;
  default_points: number | null;
  roles: Role[];
  members: number[];
  videoconferences: string | null;
}

export interface Role {
  id: number;
  name: string;
  slug: string;
  order: number;
  computable: boolean;
}

export interface ProjectStatus {
  id: number;
  name: string;
  color: string;
  order: number;
  is_closed?: boolean;
  slug?: string;
}

export interface Membership {
  id: number;
  user: number | null;
  project: number;
  role: number;
  is_admin: boolean;
  role_name: string;
  full_name: string;
  is_user_active: boolean;
  color: string;
  photo: string | null;
  gravatar_id: string;
  user_email?: string;
}

export interface UserStory {
  id: number;
  ref: number;
  subject: string;
  status: number;
  status_extra_info: { name: string; color: string; is_closed: boolean };
  assigned_to: number | null;
  assigned_to_extra_info?: UserSummary | null;
  is_closed: boolean;
  total_comments: number;
  total_voters: number;
  total_watchers: number;
  tags: Array<[string, string | null]> | null;
  milestone: number | null;
  milestone_name: string | null;
  milestone_slug: string | null;
  points: Record<string, number>;
  total_points: number | null;
  backlog_order: number;
  sprint_order: number;
  kanban_order: number;
  project: number;
  project_extra_info: { name: string; slug: string; id: number };
  due_date: string | null;
}

export interface Task {
  id: number;
  ref: number;
  subject: string;
  status: number;
  status_extra_info: { name: string; color: string; is_closed: boolean };
  assigned_to: number | null;
  assigned_to_extra_info?: UserSummary | null;
  is_closed: boolean;
  total_comments: number;
  user_story: number | null;
  milestone: number | null;
  project: number;
  tags: Array<[string, string | null]> | null;
}

export interface Issue {
  id: number;
  ref: number;
  subject: string;
  status: number;
  status_extra_info: { name: string; color: string; is_closed: boolean };
  type: number;
  priority: number;
  severity: number;
  assigned_to: number | null;
  assigned_to_extra_info?: UserSummary | null;
  is_closed: boolean;
  total_comments: number;
  total_voters: number;
  total_watchers: number;
  project: number;
  tags: Array<[string, string | null]> | null;
}

export interface Epic {
  id: number;
  ref: number;
  subject: string;
  status: number;
  status_extra_info: { name: string; color: string; is_closed: boolean };
  assigned_to: number | null;
  is_closed: boolean;
  total_comments: number;
  project: number;
  tags: Array<[string, string | null]> | null;
  color: string;
}

export interface Milestone {
  id: number;
  name: string;
  slug: string;
  estimated_start: string;
  estimated_finish: string;
  closed: boolean;
  total_points: number | null;
  closed_points: number | null;
  user_stories?: UserStory[];
  project: number;
  project_extra_info: { name: string; slug: string; id: number };
}

export interface HistoryEntry {
  id: string;
  user: { pk: number; username: string; name: string; photo: string | null };
  created_at: string;
  type: number;
  comment: string;
  comment_html: string;
  delete_comment_date: string | null;
  delete_comment_user: { pk: number | null; name: string } | null;
  diff: Record<string, [unknown, unknown]>;
  values_diff: Record<string, [unknown, unknown]>;
  is_hidden: boolean;
  values: Record<string, unknown>;
  key: string;
}
