export type TaigaUserRef = {
  pk?: number;
  name?: string;
  username?: string;
  photo?: string | null;
};

export type HistoryComment = {
  id: number;
  user: TaigaUserRef;
  comment: string;
  created_at: string;
  edit_comment_date?: string | null;
  delete_comment_date?: string | null;
  delete_comment_user?: TaigaUserRef | null;
};

export type ValueDiff = Record<string, unknown>;

export type ActivityEntry = {
  id: number;
  user: TaigaUserRef;
  created_at: string;
  values_diff: ValueDiff | null;
};

export type TimelineEvent = {
  id?: string | number;
  event_type: string;
  data: {
    user?: TaigaUserRef;
    project?: { slug?: string; name?: string; id?: number };
    value_diff?: { key: string; value: unknown } | null;
    values_diff?: Record<string, unknown> | null;
    obj?: { ref?: string; name?: string } | { slug?: string };
    [k: string]: unknown;
  };
  created?: string;
};
