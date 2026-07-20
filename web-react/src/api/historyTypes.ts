export type HistoryContentType = 'us' | 'issue' | 'task' | 'epic' | 'wiki';

export type TaigaUserRef = {
  pk: number;
  name?: string;
  username?: string;
  photo?: string | null;
};

export type HistoryComment = {
  id: number;
  comment: string;
  created_at: string;
  edit_comment_date?: string | null;
  delete_comment_date?: string | null;
  delete_comment_user?: TaigaUserRef | null;
  user: TaigaUserRef;
};

export type ActivityEntry = {
  id: number;
  created_at: string;
  user: TaigaUserRef;
  values_diff: Record<string, unknown>;
};
