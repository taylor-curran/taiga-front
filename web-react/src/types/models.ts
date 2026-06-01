// Core Taiga API model types

export interface User {
  id: number;
  username: string;
  full_name: string;
  full_name_display: string;
  email: string;
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
  date_joined: string;
  max_private_projects: number | null;
  max_public_projects: number | null;
  max_memberships_private_projects: number | null;
  max_memberships_public_projects: number | null;
  auth_token: string;
  refresh: string;
  read_new_terms: boolean;
  accepted_terms: boolean;
  verified_email: boolean;
}

export interface Project {
  id: number;
  name: string;
  slug: string;
  description: string;
  created_date: string;
  modified_date: string;
  owner: UserBasic;
  members: number[];
  total_fans: number;
  total_watchers: number;
  total_activity: number;
  total_activity_last_month: number;
  total_activity_last_week: number;
  total_activity_last_year: number;
  is_private: boolean;
  is_looking_for_people: boolean;
  looking_for_people_note: string;
  is_featured: boolean;
  is_backlog_activated: boolean;
  is_kanban_activated: boolean;
  is_wiki_activated: boolean;
  is_issues_activated: boolean;
  is_epics_activated: boolean;
  videoconferences: string | null;
  videoconferences_extra_data: string | null;
  logo_small_url: string | null;
  logo_big_url: string | null;
  tags: string[];
  tags_colors: Record<string, string>;
  my_permissions: string[];
  i_am_admin: boolean;
  i_am_member: boolean;
  i_am_owner: boolean;
  notify_level: number | null;
  total_closed_milestones: number;
  total_milestones: number;
  us_statuses: Status[];
  points: Point[];
  task_statuses: Status[];
  issue_statuses: Status[];
  issue_types: IssueType[];
  priorities: Priority[];
  severities: Severity[];
  epic_statuses: Status[];
  roles: Role[];
  milestones: MilestoneBasic[];
  swimlanes: Swimlane[];
}

export interface UserBasic {
  id: number;
  username: string;
  full_name: string;
  full_name_display: string;
  photo: string | null;
  big_photo: string | null;
  gravatar_id: string;
  is_active: boolean;
  color: string;
}

export interface Status {
  id: number;
  name: string;
  slug: string;
  color: string;
  is_closed: boolean;
  is_archived: boolean;
  order: number;
  project: number;
}

export interface Point {
  id: number;
  name: string;
  order: number;
  value: number | null;
  project: number;
}

export interface IssueType {
  id: number;
  name: string;
  color: string;
  order: number;
  project: number;
}

export interface Priority {
  id: number;
  name: string;
  color: string;
  order: number;
  project: number;
}

export interface Severity {
  id: number;
  name: string;
  color: string;
  order: number;
  project: number;
}

export interface Role {
  id: number;
  name: string;
  slug: string;
  order: number;
  computable: boolean;
  project: number;
  permissions: string[];
}

export interface MilestoneBasic {
  id: number;
  name: string;
  slug: string;
  closed: boolean;
}

export interface Swimlane {
  id: number;
  name: string;
  order: number;
  project: number;
}

export interface Milestone {
  id: number;
  name: string;
  slug: string;
  project: number;
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
  milestone: number | null;
  subject: string;
  description: string;
  description_html: string;
  status: number;
  is_closed: boolean;
  order: number;
  assigned_to: number | null;
  assigned_users: number[];
  points: Record<string, number>;
  total_points: number;
  tags: Array<[string, string | null]>;
  watchers: number[];
  total_watchers: number;
  total_voters: number;
  total_comments: number;
  total_attachments: number;
  created_date: string;
  modified_date: string;
  finish_date: string | null;
  due_date: string | null;
  due_date_reason: string;
  due_date_status: string;
  backlog_order: number;
  sprint_order: number;
  kanban_order: number;
  epic_order: number | null;
  epics: EpicRef[] | null;
  is_blocked: boolean;
  blocked_note: string;
  custom_attributes_values: Record<string, unknown>;
  tribe_gig: unknown | null;
  external_reference: unknown | null;
  swimlane: number | null;
  status_extra_info: StatusExtraInfo;
  assigned_to_extra_info: UserBasic | null;
  owner: number;
  owner_extra_info: UserBasic;
}

export interface EpicRef {
  id: number;
  ref: number;
  subject: string;
  color: string;
  project: { id: number; name: string; slug: string };
}

export interface StatusExtraInfo {
  name: string;
  color: string;
  is_closed: boolean;
}

export interface Task {
  id: number;
  ref: number;
  project: number;
  milestone: number | null;
  user_story: number | null;
  subject: string;
  description: string;
  status: number;
  is_closed: boolean;
  order: number;
  assigned_to: number | null;
  tags: Array<[string, string | null]>;
  watchers: number[];
  created_date: string;
  modified_date: string;
  finished_date: string | null;
  due_date: string | null;
  due_date_reason: string;
  due_date_status: string;
  is_blocked: boolean;
  blocked_note: string;
  is_iocaine: boolean;
  us_order: number;
  taskboard_order: number;
  status_extra_info: StatusExtraInfo;
  assigned_to_extra_info: UserBasic | null;
  owner: number;
  owner_extra_info: UserBasic;
  total_comments: number;
  total_voters: number;
  total_watchers: number;
  total_attachments: number;
  external_reference: unknown | null;
}

export interface Issue {
  id: number;
  ref: number;
  project: number;
  milestone: number | null;
  subject: string;
  description: string;
  status: number;
  severity: number;
  priority: number;
  type: number;
  is_closed: boolean;
  order: number;
  assigned_to: number | null;
  tags: Array<[string, string | null]>;
  watchers: number[];
  created_date: string;
  modified_date: string;
  finished_date: string | null;
  due_date: string | null;
  due_date_reason: string;
  due_date_status: string;
  is_blocked: boolean;
  blocked_note: string;
  status_extra_info: StatusExtraInfo;
  assigned_to_extra_info: UserBasic | null;
  owner: number;
  owner_extra_info: UserBasic;
  total_voters: number;
  total_watchers: number;
  total_comments: number;
  total_attachments: number;
  external_reference: unknown | null;
}

export interface Epic {
  id: number;
  ref: number;
  project: number;
  subject: string;
  description: string;
  status: number;
  is_closed: boolean;
  order: number;
  assigned_to: number | null;
  tags: Array<[string, string | null]>;
  watchers: number[];
  created_date: string;
  modified_date: string;
  color: string;
  epics_order: number;
  status_extra_info: StatusExtraInfo;
  assigned_to_extra_info: UserBasic | null;
  owner: number;
  owner_extra_info: UserBasic;
  total_voters: number;
  total_watchers: number;
  total_comments: number;
  total_attachments: number;
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
  watchers: number[];
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
  attached_file: string;
  thumbnail_card_url: string | null;
  description: string;
  is_deprecated: boolean;
  created_date: string;
  modified_date: string;
  owner: UserBasic;
  from_comment: boolean;
  order: number;
}

export interface HistoryEntry {
  id: string;
  user: UserBasic;
  created_at: string;
  type: number;
  key: string;
  diff: Record<string, unknown>;
  snapshot: unknown | null;
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
  email: string;
  created_at: string;
  invitation_extra_text: string;
  is_user_active: boolean;
  user_order: number;
}

export interface Webhook {
  id: number;
  project: number;
  name: string;
  url: string;
  key: string;
  logs_counter: number;
}

export interface NotifyPolicy {
  id: number;
  project: number;
  project_name: string;
  notify_level: number;
  live_notify_level: number;
  web_notify_level: boolean;
}

export interface WebNotification {
  id: number;
  event_type: number;
  data: Record<string, unknown>;
  created: string;
  read: string | null;
}

export interface SearchResults {
  count: number;
  userstories: UserStory[];
  tasks: Task[];
  issues: Issue[];
  wikipages: WikiPage[];
  epics: Epic[];
}

export interface TaigaConfig {
  api: string;
  eventsUrl: string;
  tribeHost: string | null;
  eventsMaxMissedHeartbeats: number;
  eventsHeartbeatIntervalTime: number;
  eventsReconnectTryInterval: number;
  debug: boolean;
  debugInfo: boolean;
  defaultLanguage: string;
  themes: string[];
  defaultTheme: string;
  publicRegisterEnabled: boolean;
  feedbackEnabled: boolean;
  supportUrl: string;
  privacyPolicyUrl: string | null;
  termsOfServiceUrl: string | null;
  maxUploadFileSize: number | null;
  contribPlugins: string[];
  tagManager: { accountId: string } | null;
  enabledImporters: string[];
  gravatar: boolean;
  rtlLanguages: string[];
}

export interface ProjectStats {
  total_points: number;
  assigned_points: number;
  assigned_points_per_role: Record<string, number>;
  closed_points: number;
  closed_points_per_role: Record<string, number>;
  defined_points: number;
  defined_points_per_role: Record<string, number>;
  milestones: MilestoneStats[];
  total_milestones: number;
  total_points_per_role: Record<string, number>;
  speed: number;
  name: string;
}

export interface MilestoneStats {
  name: string;
  optimal: number;
  evolution: number;
  team_increment: number;
  client_increment: number;
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

export interface DiscoverProject {
  id: number;
  name: string;
  slug: string;
  description: string;
  logo_small_url: string | null;
  is_private: boolean;
  is_looking_for_people: boolean;
  looking_for_people_note: string;
  tags: string[];
  tags_colors: Record<string, string>;
  total_fans: number;
  total_fans_last_week: number;
  total_fans_last_month: number;
  total_fans_last_year: number;
  total_activity: number;
  total_activity_last_week: number;
  total_activity_last_month: number;
  total_activity_last_year: number;
  is_featured: boolean;
  is_backlog_activated: boolean;
  is_kanban_activated: boolean;
}
