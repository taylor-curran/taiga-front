import { create } from 'zustand';
import {
  fetchActivityPage,
  fetchComments,
  patchObjectComment,
  postDeleteComment,
  postEditComment,
  postUndeleteComment,
} from '../api/historyApi';
import type { ActivityEntry, HistoryComment, HistoryContentType } from '../api/historyTypes';
import { sortComments as applySort } from './historyCommentSorting';

export type ProjectLike = {
  id: number;
  my_permissions?: string[];
};

type HistoryState = {
  token: string | null;
  contentType: HistoryContentType;
  objectId: number;
  project: ProjectLike | null;
  /** Mirrors Angular tgStorage key orderComments (true = apply .reverse() to API list) */
  reverseOrder: boolean;
  viewComments: boolean;
  comments: HistoryComment[];
  commentsNum: number;
  activities: ActivityEntry[];
  activitiesNum: number | null;
  activityPage: number;
  activityHasNext: boolean;
  loadingComments: boolean;
  loadingActivity: boolean;
  deleting: number | null;
  editing: number | null;
  editMode: Record<number, boolean>;
  postCommentError: string | null;
  postingComment: boolean;
  setToken: (t: string | null) => void;
  init: (opts: {
    contentType: HistoryContentType;
    objectId: number;
    project: ProjectLike | null;
  }) => void;
  loadHistory: () => Promise<void>;
  setViewComments: (v: boolean) => void;
  toggleCommentOrder: () => Promise<void>;
  toggleEditMode: (commentId: number) => void;
  deleteComment: (commentId: number) => Promise<void>;
  editComment: (commentId: number, text: string) => Promise<void>;
  restoreDeletedComment: (commentId: number) => Promise<void>;
  addComment: (markdown: string) => Promise<void>;
  loadMoreActivity: () => Promise<void>;
};

function readOrderCommentsFromStorage(): boolean {
  try {
    const raw = localStorage.getItem('orderComments');
    if (raw == null) return false;
    const v = JSON.parse(raw);
    return Boolean(v);
  } catch {
    return false;
  }
}

function hasPermission(project: ProjectLike | null, perm: string): boolean {
  return !!project?.my_permissions?.includes(perm);
}

async function reloadCommentsSnapshot(
  get: () => HistoryState,
  patch: (p: Partial<HistoryState>) => void,
) {
  const { token, contentType, objectId, reverseOrder } = get();
  const raw = await fetchComments(token, contentType, objectId);
  const sorted = applySort(raw, reverseOrder);
  patch({ comments: sorted, commentsNum: sorted.length });
}

export const useHistoryStore = create<HistoryState>((set, get) => ({
  token: null,
  contentType: 'us',
  objectId: 0,
  project: null,
  reverseOrder: false,
  viewComments: true,
  comments: [],
  commentsNum: 0,
  activities: [],
  activitiesNum: null,
  activityPage: 1,
  activityHasNext: false,
  loadingComments: false,
  loadingActivity: false,
  deleting: null,
  editing: null,
  editMode: {},
  postCommentError: null,
  postingComment: false,

  setToken: (t) => set({ token: t }),

  init: ({ contentType, objectId, project }) =>
    set({
      contentType,
      objectId,
      project,
      reverseOrder: readOrderCommentsFromStorage(),
      viewComments: true,
      comments: [],
      activities: [],
      activityPage: 1,
      activityHasNext: false,
      editMode: {},
      postCommentError: null,
    }),

  loadHistory: async () => {
    const { token, contentType, objectId, reverseOrder } = get();
    set({ loadingComments: true, loadingActivity: true });
    try {
      const rawComments = await fetchComments(token, contentType, objectId);
      const sorted = applySort(rawComments, reverseOrder);
      set({
        comments: sorted,
        commentsNum: sorted.length,
        loadingComments: false,
      });

      const act = await fetchActivityPage(token, contentType, objectId, 1);
      set({
        activities: act.list,
        activitiesNum: act.totalCount,
        activityPage: 1,
        activityHasNext: act.nextPage != null,
        loadingActivity: false,
      });
    } catch (e) {
      set({ loadingComments: false, loadingActivity: false });
      throw e;
    }
  },

  setViewComments: (v) => set({ viewComments: v }),

  toggleCommentOrder: async () => {
    const next = !get().reverseOrder;
    set({ reverseOrder: next });
    try {
      localStorage.setItem('orderComments', JSON.stringify(next));
    } catch {
      /* ignore */
    }
    set({ loadingComments: true });
    try {
      await reloadCommentsSnapshot(get, set);
    } finally {
      set({ loadingComments: false });
    }
  },

  toggleEditMode: (commentId) => {
    const cur = get().editMode[commentId];
    set({ editMode: { ...get().editMode, [commentId]: !cur } });
  },

  deleteComment: async (commentId) => {
    const { token, contentType, objectId } = get();
    set({ deleting: commentId });
    try {
      await postDeleteComment(token, contentType, objectId, commentId);
      await reloadCommentsSnapshot(get, set);
      set({ deleting: null });
    } catch (e) {
      set({ deleting: null });
      throw e;
    }
  },

  editComment: async (commentId, text) => {
    const { token, contentType, objectId } = get();
    set({ editing: commentId });
    try {
      await postEditComment(token, contentType, objectId, commentId, text);
      await reloadCommentsSnapshot(get, set);
      set({
        editing: null,
        editMode: { ...get().editMode, [commentId]: false },
      });
    } catch (e) {
      set({ editing: null });
      throw e;
    }
  },

  restoreDeletedComment: async (commentId) => {
    const { token, contentType, objectId } = get();
    set({ editing: commentId });
    try {
      await postUndeleteComment(token, contentType, objectId, commentId);
      await reloadCommentsSnapshot(get, set);
      set({ editing: null });
    } catch (e) {
      set({ editing: null });
      throw e;
    }
  },

  addComment: async (markdown) => {
    const { token, contentType, objectId } = get();
    set({ postingComment: true, postCommentError: null });
    try {
      await patchObjectComment(token, contentType, objectId, { comment: markdown });
      set({ editMode: {}, editing: null });
      await reloadCommentsSnapshot(get, set);
      set({ postingComment: false });
    } catch (e) {
      set({
        postingComment: false,
        postCommentError: e instanceof Error ? e.message : 'Failed to post comment',
      });
      throw e;
    }
  },

  loadMoreActivity: async () => {
    const { token, contentType, objectId, activityPage, activityHasNext, loadingActivity } = get();
    if (!activityHasNext || loadingActivity) return;
    const nextPage = activityPage + 1;
    set({ loadingActivity: true });
    try {
      const act = await fetchActivityPage(token, contentType, objectId, nextPage);
      set({
        activities: [...get().activities, ...act.list],
        activityPage: nextPage,
        activityHasNext: act.nextPage != null,
        loadingActivity: false,
      });
    } catch (e) {
      set({ loadingActivity: false });
      throw e;
    }
  },
}));

export function showCommentTab(state: Pick<HistoryState, 'commentsNum' | 'project' | 'contentType'>): boolean {
  const perm = `comment_${state.contentType}`;
  return state.commentsNum > 0 || hasPermission(state.project, perm);
}

export function showActivityTab(state: Pick<HistoryState, 'activitiesNum'>): boolean {
  return (state.activitiesNum ?? 0) > 0;
}
