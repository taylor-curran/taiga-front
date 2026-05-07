/**
 * Shared API entity types.
 *
 * These cover the most common fields returned by the Taiga REST API. They are
 * intentionally permissive (most fields optional) so resource modules can use
 * them without locking us into a particular shape; tighten them as the React
 * app's needs become clearer.
 */

export interface User {
  id: number;
  username: string;
  email: string;
  full_name: string;
  full_name_display: string;
  is_active?: boolean;
  bio?: string;
  lang?: string;
  theme?: string;
  timezone?: string;
  photo?: string | null;
  big_photo?: string | null;
  gravatar_id?: string;
  uuid?: string;
  date_joined?: string;
  read_new_terms?: boolean;
  accepted_terms?: boolean;
  total_private_projects?: number;
  total_public_projects?: number;
}

export interface AuthenticatedUser extends User {
  auth_token: string;
  refresh: string;
}

export interface Project {
  id: number;
  name: string;
  slug: string;
  description?: string;
  created_date?: string;
  modified_date?: string;
  owner?: { id: number; username: string; full_name_display: string };
  is_private?: boolean;
  is_kanban_activated?: boolean;
  is_backlog_activated?: boolean;
  is_wiki_activated?: boolean;
  is_issues_activated?: boolean;
  is_epics_activated?: boolean;
  archived_code?: string | null;
  blocked_code?: string | null;
  my_permissions?: string[];
  members?: ProjectMember[];
  default_points?: number | null;
  default_us_status?: number | null;
  default_task_status?: number | null;
  default_priority?: number | null;
  default_severity?: number | null;
  default_issue_status?: number | null;
  default_issue_type?: number | null;
  default_epic_status?: number | null;
  total_milestones?: number;
  total_story_points?: number;
}

export interface ProjectMember {
  id: number;
  username?: string;
  full_name?: string;
  full_name_display?: string;
  is_active?: boolean;
  is_admin?: boolean;
  role?: number;
  role_name?: string;
  photo?: string | null;
}

export interface Membership {
  id: number;
  project: number;
  role: number;
  role_name?: string;
  user?: number | null;
  email?: string;
  is_admin?: boolean;
  user_email?: string;
  user_full_name?: string;
  invitation_extra_text?: string;
}

export interface Milestone {
  id: number;
  name: string;
  slug: string;
  project: number;
  estimated_start: string;
  estimated_finish: string;
  closed: boolean;
  total_points?: number;
  closed_points?: number;
  user_stories?: UserStory[];
}

export interface Epic {
  id: number;
  ref: number;
  subject: string;
  project: number;
  status?: number;
  is_closed?: boolean;
  color?: string;
  description?: string;
  assigned_to?: number | null;
  owner?: number;
  tags?: Array<[string, string | null]>;
}

export interface UserStory {
  id: number;
  ref: number;
  subject: string;
  project: number;
  milestone?: number | null;
  status?: number;
  is_closed?: boolean;
  description?: string;
  assigned_to?: number | null;
  owner?: number;
  total_points?: number | null;
  tags?: Array<[string, string | null]>;
  backlog_order?: number;
  sprint_order?: number;
  kanban_order?: number;
}

export interface Task {
  id: number;
  ref: number;
  subject: string;
  project: number;
  user_story?: number | null;
  milestone?: number | null;
  status?: number;
  is_closed?: boolean;
  assigned_to?: number | null;
  owner?: number;
  taskboard_order?: number;
}

export interface Issue {
  id: number;
  ref: number;
  subject: string;
  project: number;
  status?: number;
  type?: number;
  priority?: number;
  severity?: number;
  is_closed?: boolean;
  assigned_to?: number | null;
  owner?: number;
}

export interface WikiPage {
  id: number;
  slug: string;
  project: number;
  content: string;
  modified_date?: string;
  last_modifier?: number;
}

export interface SearchResults {
  count: number;
  epics: Epic[];
  userstories: UserStory[];
  tasks: Task[];
  issues: Issue[];
  wikipages: WikiPage[];
}

export interface PaginatedResponse<T> {
  results: T[];
  count: number;
  next: string | null;
  previous: string | null;
}

export interface LoginPayload {
  username: string;
  password: string;
  type?: "normal" | "github" | "ldap" | "private";
  invitation_token?: string;
}

export interface RegisterPayload {
  username: string;
  email?: string;
  full_name: string;
  password: string;
  accepted_terms?: boolean;
  type?: "public" | "private";
  existing?: boolean;
  token?: string;
}

export interface PasswordRecoveryPayload {
  username: string;
}

export interface ChangePasswordFromRecoveryPayload {
  token: string;
  password: string;
}
