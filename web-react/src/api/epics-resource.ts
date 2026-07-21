/**
 * Epics resource module.
 *
 * Mirrors `app/modules/resources/epics-resource.service.coffee`.
 */
import { AxiosRequestConfig } from "axios";
import {
  deleteJson,
  getJson,
  patchJson,
  postJson,
  withoutPagination,
} from "./client";
import { Epic, UserStory } from "./types";
import { resolveUrl } from "./urls";

export const epicsResource = {
  list(
    params: Record<string, unknown> = {},
    paginate = false,
  ): Promise<Epic[]> {
    const config: AxiosRequestConfig = paginate ? {} : withoutPagination();
    return getJson<Epic[]>(resolveUrl("epics"), params, config);
  },

  listInProject(projectId: number): Promise<Epic[]> {
    return this.list({ project: projectId });
  },

  get(id: number): Promise<Epic> {
    return getJson<Epic>(`${resolveUrl("epics")}/${id}`);
  },

  getByRef(projectId: number, ref: number): Promise<Epic> {
    return getJson<Epic>(`${resolveUrl("epics")}/by_ref`, {
      project: projectId,
      ref,
    });
  },

  create(data: Partial<Epic>): Promise<Epic> {
    return postJson<Epic, Partial<Epic>>(resolveUrl("epics"), data);
  },

  update(id: number, data: Partial<Epic>): Promise<Epic> {
    return patchJson<Epic, Partial<Epic>>(`${resolveUrl("epics")}/${id}`, data);
  },

  remove(id: number): Promise<void> {
    return deleteJson(`${resolveUrl("epics")}/${id}`);
  },

  upvote(id: number): Promise<void> {
    return postJson(resolveUrl("epic-upvote", id));
  },

  downvote(id: number): Promise<void> {
    return postJson(resolveUrl("epic-downvote", id));
  },

  watch(id: number): Promise<void> {
    return postJson(resolveUrl("epic-watch", id));
  },

  unwatch(id: number): Promise<void> {
    return postJson(resolveUrl("epic-unwatch", id));
  },

  relatedUserstories(id: number): Promise<UserStory[]> {
    return getJson<UserStory[]>(resolveUrl("epic-related-userstories", id));
  },

  bulkCreateRelatedUserstories(
    id: number,
    payload: { project_id: number; bulk_userstories: number[] },
  ): Promise<unknown> {
    return postJson(
      resolveUrl("epic-related-userstories-bulk-create", id),
      payload,
    );
  },
};
