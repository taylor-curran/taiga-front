/**
 * Issues resource module.
 *
 * Mirrors `app/modules/resources/issues-resource.service.coffee`.
 */
import { AxiosRequestConfig } from "axios";
import {
  deleteJson,
  getJson,
  patchJson,
  postJson,
  withoutPagination,
} from "./client";
import { Issue } from "./types";
import { resolveUrl } from "./urls";

export const issuesResource = {
  list(
    params: Record<string, unknown> = {},
    paginate = true,
  ): Promise<Issue[]> {
    const config: AxiosRequestConfig = paginate ? {} : withoutPagination();
    return getJson<Issue[]>(resolveUrl("issues"), params, config);
  },

  listInProject(projectId: number): Promise<Issue[]> {
    return this.list({ project: projectId });
  },

  get(id: number): Promise<Issue> {
    return getJson<Issue>(`${resolveUrl("issues")}/${id}`);
  },

  getByRef(projectId: number, ref: number): Promise<Issue> {
    return getJson<Issue>(`${resolveUrl("issues")}/by_ref`, {
      project: projectId,
      ref,
    });
  },

  create(data: Partial<Issue>): Promise<Issue> {
    return postJson<Issue, Partial<Issue>>(resolveUrl("issues"), data);
  },

  update(id: number, data: Partial<Issue>): Promise<Issue> {
    return patchJson<Issue, Partial<Issue>>(
      `${resolveUrl("issues")}/${id}`,
      data,
    );
  },

  remove(id: number): Promise<void> {
    return deleteJson(`${resolveUrl("issues")}/${id}`);
  },

  bulkCreate(payload: {
    project_id: number;
    bulk_issues: string;
    status_id?: number;
    type_id?: number;
    priority_id?: number;
    severity_id?: number;
  }): Promise<Issue[]> {
    return postJson<Issue[]>(resolveUrl("bulk-create-issues"), payload);
  },

  bulkUpdateMilestone(
    projectId: number,
    milestoneId: number,
    bulkIssues: Array<{ issue_id: number; order: number }>,
  ): Promise<void> {
    return postJson(resolveUrl("bulk-update-issue-milestone"), {
      project_id: projectId,
      milestone_id: milestoneId,
      bulk_issues: bulkIssues,
    });
  },

  filtersData(projectId: number): Promise<unknown> {
    return getJson(resolveUrl("issues-filters"), { project: projectId });
  },

  upvote(id: number): Promise<void> {
    return postJson(resolveUrl("issue-upvote", id));
  },

  downvote(id: number): Promise<void> {
    return postJson(resolveUrl("issue-downvote", id));
  },

  watch(id: number): Promise<void> {
    return postJson(resolveUrl("issue-watch", id));
  },

  unwatch(id: number): Promise<void> {
    return postJson(resolveUrl("issue-unwatch", id));
  },

  promoteToUserStory(id: number, projectId: number): Promise<unknown> {
    return postJson(resolveUrl("promote-issue-to-us", id), {
      project_id: projectId,
    });
  },
};
