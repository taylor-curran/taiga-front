/**
 * History resource module.
 *
 * Mirrors the history endpoints in `resources.coffee`. Each entity type has
 * its own URL, but they share the same response shape.
 */
import { getJson, postJson } from "./client";
import { resolveUrl, UrlName } from "./urls";

export type HistoryEntity = "epic" | "us" | "issue" | "task" | "wiki";

export interface HistoryEntry {
  id: string;
  type: number;
  user: { pk: number; username: string; name: string; photo: string } | null;
  comment: string;
  comment_html: string;
  delete_comment_date: string | null;
  delete_comment_user: unknown | null;
  edit_comment_date: string | null;
  diff?: Record<string, [unknown, unknown]>;
  values_diff?: Record<string, unknown>;
  created_at: string;
}

function urlFor(entity: HistoryEntity): string {
  return resolveUrl(`history/${entity}` as UrlName);
}

export const historyResource = {
  get(entity: HistoryEntity, objectId: number): Promise<HistoryEntry[]> {
    return getJson<HistoryEntry[]>(`${urlFor(entity)}/${objectId}`);
  },

  editComment(
    entity: HistoryEntity,
    objectId: number,
    historyId: string,
    comment: string,
  ): Promise<HistoryEntry> {
    return postJson<HistoryEntry>(
      `${urlFor(entity)}/${objectId}/edit_comment`,
      { id: historyId, comment },
    );
  },

  deleteComment(
    entity: HistoryEntity,
    objectId: number,
    historyId: string,
  ): Promise<void> {
    return postJson(`${urlFor(entity)}/${objectId}/delete_comment`, {
      id: historyId,
    });
  },

  undeleteComment(
    entity: HistoryEntity,
    objectId: number,
    historyId: string,
  ): Promise<void> {
    return postJson(`${urlFor(entity)}/${objectId}/undelete_comment`, {
      id: historyId,
    });
  },
};
