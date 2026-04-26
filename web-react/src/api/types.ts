export type TaigaUser = {
  id: number;
  username: string;
  email: string;
  full_name: string;
  full_name_display?: string;
  photo?: string | null;
  name?: string;
  gravatar_id?: string;
  is_active?: boolean;
};

export type TaigaProjectSlight = {
  id: number;
  name: string;
  slug: string;
  i_am_admin?: boolean;
  roles?: TaigaRole[];
  public_permissions?: string[];
  is_private?: boolean;
  total_memberships?: number;
  max_memberships?: number | null;
  description?: string | null;
  is_fan?: boolean;
  is_watcher?: boolean;
  i_am_member?: boolean;
  i_am_owner?: boolean;
  is_looking_for_people?: boolean;
  looking_for_people_note?: string | null;
  blocked_code?: string | null;
  archived_code?: string | null;
  total_fans?: number;
  total_watchers?: number;
  members?: unknown[];
  my_homepage?: string;
};

export type StatusExtra = {
  name: string;
  color?: string;
};

export type DutyLike = {
  id: number;
  ref: number;
  project: number;
  subject: string;
  modified_date: string;
  is_blocked?: boolean;
  status_extra_info?: StatusExtra;
  /** Present on some responses (e.g. watching). */
  assigned_to_extra_info?: (TaigaUser & { full_name_display?: string }) | null;
  _name?: 'epics' | 'userstories' | 'tasks' | 'issues';
};

export type TaigaRole = {
  id?: number;
  name: string;
  slug?: string;
  permissions: string[];
  computable?: boolean;
  order?: number;
  members_count?: number;
  project?: number;
  external_user?: boolean;
};

export type TaigaMembership = {
  id: number;
  project: number;
  role: number;
  is_admin: boolean;
  is_owner: boolean;
  user: number | null;
  user_email: string | null;
  email: string | null;
  full_name: string;
  is_user_active: boolean;
  invited_by: number | null;
  invitation_extra_text: string | null;
};

export type Paginated<T> = {
  models: T[];
  count: number;
  current: number;
  /** Page size; Taiga may omit when not paginated */
  paginatedBy?: number;
};
