/**
 * Milestones (sprints) resource module.
 *
 * Mirrors the milestones endpoints in `app/coffee/modules/resources.coffee`.
 */
import { AxiosRequestConfig } from "axios";
import {
  deleteJson,
  getJson,
  patchJson,
  postJson,
  withoutPagination,
} from "./client";
import { Milestone } from "./types";
import { resolveUrl } from "./urls";

export const milestonesResource = {
  list(
    params: Record<string, unknown> = {},
    paginate = false,
  ): Promise<Milestone[]> {
    const config: AxiosRequestConfig = paginate ? {} : withoutPagination();
    return getJson<Milestone[]>(resolveUrl("milestones"), params, config);
  },

  listInProject(
    projectId: number,
    closed?: boolean,
  ): Promise<Milestone[]> {
    const params: Record<string, unknown> = { project: projectId };
    if (typeof closed === "boolean") {
      params.closed = closed;
    }
    return this.list(params);
  },

  get(id: number): Promise<Milestone> {
    return getJson<Milestone>(`${resolveUrl("milestones")}/${id}`);
  },

  getBySlug(projectId: number, slug: string): Promise<Milestone> {
    return getJson<Milestone>(`${resolveUrl("milestones")}/by_slug`, {
      project: projectId,
      slug,
    });
  },

  create(data: Partial<Milestone>): Promise<Milestone> {
    return postJson<Milestone, Partial<Milestone>>(
      resolveUrl("milestones"),
      data,
    );
  },

  update(id: number, data: Partial<Milestone>): Promise<Milestone> {
    return patchJson<Milestone, Partial<Milestone>>(
      `${resolveUrl("milestones")}/${id}`,
      data,
    );
  },

  remove(id: number): Promise<void> {
    return deleteJson(`${resolveUrl("milestones")}/${id}`);
  },

  stats(id: number): Promise<unknown> {
    return getJson(`${resolveUrl("milestones")}/${id}/stats`);
  },

  moveUserStories(milestoneId: number, payload: unknown): Promise<unknown> {
    return postJson(
      resolveUrl("move-userstories-to-milestone", milestoneId),
      payload,
    );
  },

  moveTasks(milestoneId: number, payload: unknown): Promise<unknown> {
    return postJson(
      resolveUrl("move-tasks-to-milestone", milestoneId),
      payload,
    );
  },

  moveIssues(milestoneId: number, payload: unknown): Promise<unknown> {
    return postJson(
      resolveUrl("move-issues-to-milestone", milestoneId),
      payload,
    );
  },
};
