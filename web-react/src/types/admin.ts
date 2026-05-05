// Types for admin / project-settings API surfaces.

export interface Role {
  id: number;
  name: string;
  slug?: string;
  order: number;
  computable: boolean;
  project: number;
  permissions: string[];
  members_count?: number;
}

export interface MembershipDetail {
  id: number;
  user: number | null;
  project: number;
  role: number;
  role_name?: string;
  full_name?: string;
  user_email?: string;
  email?: string;
  color?: string;
  photo?: string | null;
  is_admin?: boolean;
  is_active?: boolean;
  is_user_active?: boolean;
  is_owner?: boolean;
  username?: string;
  invitation_extra_text?: string;
  created_at?: string;
  invited_by?: { id: number; username: string; full_name?: string } | null;
}

export interface Webhook {
  id: number;
  project: number;
  name: string;
  url: string;
  key: string;
  logs_counter: number;
}

export interface WebhookLog {
  id: number;
  webhook: number;
  url: string;
  status: number;
  request_data: Record<string, unknown>;
  request_headers: Record<string, string>;
  response_data: string;
  response_headers: Record<string, string>;
  duration: number;
  created: string;
}

export interface ProjectModule {
  bitbucket?: { secret: string; valid_origin_ips: string; webhooks_url: string };
  github?: { secret: string; webhooks_url: string };
  gitlab?: { secret: string; valid_origin_ips: string; webhooks_url: string };
  gogs?: { secret: string; webhooks_url: string };
  [key: string]: unknown;
}

export interface CustomAttribute {
  id: number;
  name: string;
  description?: string;
  type: string;
  order: number;
  project: number;
  extra?: string | null;
  created_date?: string;
  modified_date?: string;
}

export interface ProjectExportStatus {
  id?: number;
  url?: string;
  status?: string;
}

export interface CsvReport {
  csv_uuid?: string;
  url?: string;
}

export type ValueItem = {
  id: number;
  name: string;
  color?: string;
  is_closed?: boolean;
  is_archived?: boolean;
  order: number;
  project?: number;
  value?: number | null;
  wip_limit?: number | null;
};

export interface TagItem {
  name: string;
  color: string | null;
}

export interface DueDateEntry {
  id: number;
  name: string;
  order: number;
  days_to_finish?: number;
  color?: string;
  by_default?: boolean;
  project?: number;
}

export interface Swimlane {
  id: number;
  name: string;
  order: number;
  project: number;
  statuses_extra_info?: Record<string, unknown>;
}

export const PERMISSION_CATEGORIES = [
  {
    key: 'epic',
    label: 'Epics',
    perms: ['view_epics', 'add_epic', 'modify_epic', 'comment_epic', 'delete_epic'],
  },
  {
    key: 'us',
    label: 'User Stories',
    perms: ['view_us', 'add_us', 'modify_us', 'comment_us', 'delete_us'],
  },
  {
    key: 'task',
    label: 'Tasks',
    perms: ['view_tasks', 'add_task', 'modify_task', 'comment_task', 'delete_task'],
  },
  {
    key: 'issue',
    label: 'Issues',
    perms: ['view_issues', 'add_issue', 'modify_issue', 'comment_issue', 'delete_issue'],
  },
  {
    key: 'wiki',
    label: 'Wiki',
    perms: ['view_wiki_pages', 'add_wiki_page', 'modify_wiki_page', 'delete_wiki_page', 'view_wiki_links', 'add_wiki_link', 'modify_wiki_link', 'delete_wiki_link'],
  },
  {
    key: 'milestone',
    label: 'Milestones',
    perms: ['view_milestones', 'add_milestone', 'modify_milestone', 'delete_milestone'],
  },
] as const;
