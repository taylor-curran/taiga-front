export type TaigaConfig = {
  api: string;
  defaultLanguage?: string;
  publicRegisterEnabled?: boolean;
  [key: string]: unknown;
};

export type TaigaUser = {
  id: number;
  username: string;
  full_name?: string;
  email?: string;
  photo?: string | null;
  gravatar_id?: string | null;
  auth_token?: string;
  refresh?: string;
  [key: string]: unknown;
};

export type DiscoverStats = {
  projects?: { total?: number };
};

export type ProjectSummary = {
  id: number;
  name: string;
  slug: string;
  description?: string;
  is_looking_for_people?: boolean;
  looking_for_people_note?: string;
  is_fan?: boolean;
  is_watcher?: boolean;
  i_am_member?: boolean;
  total_fans?: number;
  total_watchers?: number;
  members?: unknown[];
  my_homepage?: string;
  logo_small_url?: string | null;
};
