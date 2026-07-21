export interface TaigaConfig {
  api: string;
  eventsUrl: string;
  baseHref: string;
  eventsMaxMissedHeartbeats: number;
  eventsHeartbeatIntervalTime: number;
  eventsReconnectTryInterval: number;
  debug: boolean;
  debugInfo: boolean;
  defaultLanguage: string;
  themes: string[];
  defaultTheme: string;
  defaultLoginEnabled: boolean;
  publicRegisterEnabled: boolean;
  feedbackEnabled: boolean;
  supportUrl: string;
  privacyPolicyUrl: string | null;
  termsOfServiceUrl: string | null;
  maxUploadFileSize: number | null;
  contribPlugins: string[];
  gitHubClientId: string;
  gitLabClientId: string;
  gitLabUrl: string;
  tribeHost: string | null;
  gravatar: boolean;
}

export interface User {
  id: number;
  username: string;
  full_name: string;
  full_name_display: string;
  color: string;
  bio: string;
  lang: string;
  theme: string;
  timezone: string;
  is_active: boolean;
  photo: string | null;
  big_photo: string | null;
  gravatar_id: string;
  roles: string[];
  total_private_projects: number;
  total_public_projects: number;
  email: string;
  uuid: string;
  date_joined: string;
  read_new_terms: boolean;
  accepted_terms: boolean;
  max_private_projects: number | null;
  max_public_projects: number | null;
  max_memberships_private_projects: number | null;
  max_memberships_public_projects: number | null;
  auth_token: string;
  refresh: string;
}

export interface ProjectListEntry {
  id: number;
  name: string;
  slug: string;
  description: string;
  created_date: string;
  modified_date: string;
  owner: ProjectMember;
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
  is_looking_for_people: boolean;
  looking_for_people_note: string;
  tags: string[];
  tags_colors: Record<string, string>;
  logo_small_url: string | null;
  logo_big_url: string | null;
  i_am_admin: boolean;
  i_am_member: boolean;
  i_am_owner: boolean;
  my_permissions: string[];
  total_fans: number;
  total_watchers: number;
  total_activity: number;
  total_activity_last_month: number;
  total_activity_last_year: number;
  is_fan: boolean;
  is_watcher: boolean;
  notify_level: number | null;
}

export interface Project extends Omit<ProjectListEntry, 'members'> {
  videoconferences: string | null;
  videoconferences_extra_data: string | null;
  total_closed_milestones: number;
  is_featured: boolean;
  blocked_code: string | null;
  anon_permissions: string[];
  public_permissions: string[];
  us_statuses: Status[];
  points: PointDefinition[];
  task_statuses: Status[];
  issue_statuses: Status[];
  issue_types: Status[];
  priorities: Status[];
  severities: Status[];
  epic_statuses: Status[];
  userstory_custom_attributes: CustomAttribute[];
  task_custom_attributes: CustomAttribute[];
  issue_custom_attributes: CustomAttribute[];
  epic_custom_attributes: CustomAttribute[];
  roles: Role[];
  milestones: MilestoneSummary[];
  members: ProjectMember[];
  us_duedates: DueDate[];
  task_duedates: DueDate[];
  issue_duedates: DueDate[];
  swimlanes: Swimlane[];
  default_epic_status: number;
  default_us_status: number;
  default_task_status: number;
  default_issue_status: number;
  default_issue_type: number;
  default_priority: number;
  default_severity: number;
  default_points: number;
  default_swimlane: number | null;
}

export interface Status {
  id: number;
  name: string;
  slug: string;
  color: string;
  is_closed: boolean;
  order: number;
  project: number;
}

export interface PointDefinition {
  id: number;
  name: string;
  order: number;
  value: number | null;
  project: number;
}

export interface CustomAttribute {
  id: number;
  name: string;
  description: string;
  type: string;
  order: number;
  project: number;
  extra: string | null;
  created_date: string;
  modified_date: string;
}

export interface Role {
  id: number;
  name: string;
  slug: string;
  order: number;
  project: number;
  computable: boolean;
  permissions: string[];
  members_count: number;
}

export interface MilestoneSummary {
  id: number;
  name: string;
  slug: string;
  closed: boolean;
}

export interface ProjectMember {
  id: number;
  username: string;
  full_name: string;
  full_name_display: string;
  color: string;
  photo: string | null;
  big_photo: string | null;
  gravatar_id: string;
  is_active: boolean;
  role: number;
  role_name: string;
}

export interface Swimlane {
  id: number;
  name: string;
  order: number;
  project: number;
}

export interface DueDate {
  id: number;
  name: string;
  color: string;
  days_to_due: number | null;
  by_default: boolean;
  order: number;
  project: number;
}

export interface Milestone {
  id: number;
  name: string;
  slug: string;
  project: number;
  project_extra_info: { id: number; slug: string; name: string; logo_small_url: string | null };
  owner: number;
  estimated_start: string;
  estimated_finish: string;
  created_date: string;
  modified_date: string;
  closed: boolean;
  disponibility: number;
  order: number;
  user_stories: UserStory[];
  total_points: number;
  closed_points: number;
}

export interface UserStory {
  id: number;
  ref: number;
  project: number;
  project_extra_info: { id: number; slug: string; name: string; logo_small_url: string | null };
  milestone: number | null;
  milestone_slug: string | null;
  milestone_name: string | null;
  created_date: string;
  modified_date: string;
  finish_date: string | null;
  subject: string;
  description: string;
  description_html: string;
  client_requirement: boolean;
  team_requirement: boolean;
  is_closed: boolean;
  is_blocked: boolean;
  blocked_note: string;
  blocked_note_html: string;
  status: number;
  status_extra_info: { name: string; color: string; is_closed: boolean };
  assigned_to: number | null;
  assigned_to_extra_info: { id: number; username: string; full_name_display: string; photo: string | null; big_photo: string | null; gravatar_id: string; is_active: boolean; color: string } | null;
  assigned_users: number[];
  points: Record<string, number>;
  total_points: number;
  tags: Array<[string, string | null]>;
  watchers: number[];
  total_watchers: number;
  total_voters: number;
  total_comments: number;
  total_attachments: number;
  owner: number;
  owner_extra_info: { id: number; username: string; full_name_display: string; photo: string | null; big_photo: string | null; gravatar_id: string; is_active: boolean; color: string };
  epic_order: number | null;
  epics: Array<{ id: number; ref: number; subject: string; color: string; project: { id: number; name: string; slug: string } }> | null;
  swimlane: number | null;
  due_date: string | null;
  due_date_reason: string;
  due_date_status: string;
  tasks?: Task[];
  tribe_gig: string | null;
  version: number;
  kanban_order: number;
  backlog_order: number;
  sprint_order: number;
  external_reference: string | null;
}

export interface Task {
  id: number;
  ref: number;
  project: number;
  project_extra_info: { id: number; slug: string; name: string; logo_small_url: string | null };
  milestone: number | null;
  milestone_slug: string | null;
  user_story: number | null;
  user_story_extra_info: { id: number; ref: number; subject: string; epics: Array<{ id: number; ref: number; subject: string; color: string; project: { id: number; name: string; slug: string } }> | null } | null;
  created_date: string;
  modified_date: string;
  finished_date: string | null;
  subject: string;
  description: string;
  description_html: string;
  is_closed: boolean;
  is_blocked: boolean;
  blocked_note: string;
  blocked_note_html: string;
  status: number;
  status_extra_info: { name: string; color: string; is_closed: boolean };
  assigned_to: number | null;
  assigned_to_extra_info: { id: number; username: string; full_name_display: string; photo: string | null; big_photo: string | null; gravatar_id: string; is_active: boolean; color: string } | null;
  tags: Array<[string, string | null]>;
  watchers: number[];
  total_watchers: number;
  total_voters: number;
  total_comments: number;
  total_attachments: number;
  owner: number;
  owner_extra_info: { id: number; username: string; full_name_display: string; photo: string | null; big_photo: string | null; gravatar_id: string; is_active: boolean; color: string };
  is_iocaine: boolean;
  due_date: string | null;
  due_date_reason: string;
  due_date_status: string;
  taskboard_order: number;
  us_order: number;
  version: number;
  external_reference: string | null;
}

export interface Issue {
  id: number;
  ref: number;
  project: number;
  project_extra_info: { id: number; slug: string; name: string; logo_small_url: string | null };
  milestone: number | null;
  created_date: string;
  modified_date: string;
  finished_date: string | null;
  subject: string;
  description: string;
  description_html: string;
  is_closed: boolean;
  is_blocked: boolean;
  blocked_note: string;
  blocked_note_html: string;
  status: number;
  status_extra_info: { name: string; color: string; is_closed: boolean };
  assigned_to: number | null;
  assigned_to_extra_info: { id: number; username: string; full_name_display: string; photo: string | null; big_photo: string | null; gravatar_id: string; is_active: boolean; color: string } | null;
  type: number;
  severity: number;
  priority: number;
  tags: Array<[string, string | null]>;
  watchers: number[];
  total_watchers: number;
  total_voters: number;
  total_comments: number;
  total_attachments: number;
  owner: number;
  owner_extra_info: { id: number; username: string; full_name_display: string; photo: string | null; big_photo: string | null; gravatar_id: string; is_active: boolean; color: string };
  due_date: string | null;
  due_date_reason: string;
  due_date_status: string;
  version: number;
  external_reference: string | null;
}

export interface Epic {
  id: number;
  ref: number;
  project: number;
  project_extra_info: { id: number; slug: string; name: string; logo_small_url: string | null };
  created_date: string;
  modified_date: string;
  subject: string;
  description: string;
  description_html: string;
  status: number;
  status_extra_info: { name: string; color: string; is_closed: boolean };
  assigned_to: number | null;
  assigned_to_extra_info: { id: number; username: string; full_name_display: string; photo: string | null; big_photo: string | null; gravatar_id: string; is_active: boolean; color: string } | null;
  color: string;
  epics_order: number;
  client_requirement: boolean;
  team_requirement: boolean;
  tags: Array<[string, string | null]>;
  watchers: number[];
  total_watchers: number;
  total_voters: number;
  owner: number;
  owner_extra_info: { id: number; username: string; full_name_display: string; photo: string | null; big_photo: string | null; gravatar_id: string; is_active: boolean; color: string };
  version: number;
  user_stories_counts: { total: number; progress: number };
}

export interface WikiPage {
  id: number;
  project: number;
  slug: string;
  content: string;
  html: string;
  owner: number;
  last_modifier: number;
  created_date: string;
  modified_date: string;
  editions: number;
  version: number;
}

export interface WikiLink {
  id: number;
  project: number;
  title: string;
  href: string;
  order: number;
}

export interface Attachment {
  id: number;
  project: number;
  object_id: number;
  name: string;
  size: number;
  url: string;
  thumbnail_card_url: string | null;
  attached_file: string;
  description: string;
  is_deprecated: boolean;
  created_date: string;
  modified_date: string;
  owner: number;
  from_comment: boolean;
  order: number;
}

export interface History {
  id: string;
  user: { pk: number; username: string; name: string; photo: string | null; is_active: boolean; gravatar_id: string };
  created_at: string;
  type: number;
  key: string;
  diff: Record<string, unknown>;
  snapshot: Record<string, unknown> | null;
  values: Record<string, unknown>;
  values_diff: Record<string, unknown>;
  comment: string;
  comment_html: string;
  delete_comment_date: string | null;
  delete_comment_user: Record<string, unknown> | null;
  edit_comment_date: string | null;
  is_hidden: boolean;
  is_snapshot: boolean;
}

export interface TimelineEntry {
  id: number;
  content_type: number;
  object_id: number;
  namespace: string;
  event_type: string;
  project: number;
  data: Record<string, unknown>;
  data_content_type: number;
  created: string;
}

export interface SearchResults {
  count: number;
  userstories: UserStory[];
  issues: Issue[];
  tasks: Task[];
  wikipages: WikiPage[];
  epics: Epic[];
}

export interface Membership {
  id: number;
  user: number;
  project: number;
  role: number;
  role_name: string;
  full_name: string;
  is_admin: boolean;
  color: string;
  photo: string | null;
  project_name: string;
  project_slug: string;
  invited_by: number | null;
  email: string;
  created_at: string;
  invitation_extra_text: string;
  user_order: number;
  is_user_active: boolean;
}

export interface WebNotification {
  id: number;
  event_type: number;
  created: string;
  read: boolean | null;
  data: Record<string, unknown>;
}
