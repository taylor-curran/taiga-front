/**
 * User stories resource module.
 *
 * Mirrors `app/modules/resources/userstories-resource.service.coffee` and the
 * userstories endpoints in `resources.coffee`.
 */
import { AxiosRequestConfig } from "axios";
import {
  deleteJson,
  getJson,
  patchJson,
  postJson,
  withoutPagination,
} from "./client";
import { UserStory } from "./types";
import { resolveUrl } from "./urls";

export const userstoriesResource = {
  list(
    params: Record<string, unknown> = {},
    paginate = false,
  ): Promise<UserStory[]> {
    const config: AxiosRequestConfig = paginate ? {} : withoutPagination();
    return getJson<UserStory[]>(resolveUrl("userstories"), params, config);
  },

  listInProject(
    projectId: number,
    extra: Record<string, unknown> = {},
  ): Promise<UserStory[]> {
    return this.list({ project: projectId, ...extra });
  },

  listInBacklog(projectId: number): Promise<UserStory[]> {
    return this.list({
      project: projectId,
      milestone: "null",
      include_attachments: 1,
      include_tasks: 1,
    });
  },

  listInMilestone(milestoneId: number): Promise<UserStory[]> {
    return this.list({ milestone: milestoneId });
  },

  get(id: number): Promise<UserStory> {
    return getJson<UserStory>(`${resolveUrl("userstories")}/${id}`);
  },

  getByRef(projectId: number, ref: number): Promise<UserStory> {
    return getJson<UserStory>(
      `${resolveUrl("userstories")}/by_ref`,
      { project: projectId, ref },
    );
  },

  create(data: Partial<UserStory>): Promise<UserStory> {
    return postJson<UserStory, Partial<UserStory>>(
      resolveUrl("userstories"),
      data,
    );
  },

  update(id: number, data: Partial<UserStory>): Promise<UserStory> {
    return patchJson<UserStory, Partial<UserStory>>(
      `${resolveUrl("userstories")}/${id}`,
      data,
    );
  },

  remove(id: number): Promise<void> {
    return deleteJson(`${resolveUrl("userstories")}/${id}`);
  },

  bulkCreate(payload: {
    project_id: number;
    bulk_stories: string;
    status_id?: number;
    sprint_id?: number;
    swimlane_id?: number;
  }): Promise<UserStory[]> {
    return postJson<UserStory[]>(resolveUrl("bulk-create-us"), payload);
  },

  bulkUpdateBacklogOrder(
    projectId: number,
    bulkStories: Array<{ us_id: number; order: number }>,
  ): Promise<void> {
    return postJson(resolveUrl("bulk-update-us-backlog-order"), {
      project_id: projectId,
      bulk_stories: bulkStories,
    });
  },

  bulkUpdateMilestone(
    projectId: number,
    milestoneId: number,
    bulkStories: Array<{ us_id: number; order: number }>,
  ): Promise<void> {
    return postJson(resolveUrl("bulk-update-us-milestone"), {
      project_id: projectId,
      milestone_id: milestoneId,
      bulk_stories: bulkStories,
    });
  },

  bulkUpdateSprintOrder(
    projectId: number,
    bulkStories: Array<{ us_id: number; order: number }>,
  ): Promise<void> {
    return postJson(resolveUrl("bulk-update-us-miles-order"), {
      project_id: projectId,
      bulk_stories: bulkStories,
    });
  },

  bulkUpdateKanbanOrder(
    projectId: number,
    bulkStories: Array<{ us_id: number; order: number }>,
  ): Promise<void> {
    return postJson(resolveUrl("bulk-update-us-kanban-order"), {
      project_id: projectId,
      bulk_stories: bulkStories,
    });
  },

  filtersData(projectId: number): Promise<unknown> {
    return getJson(resolveUrl("userstories-filters"), { project: projectId });
  },

  upvote(id: number): Promise<void> {
    return postJson(resolveUrl("userstory-upvote", id));
  },

  downvote(id: number): Promise<void> {
    return postJson(resolveUrl("userstory-downvote", id));
  },

  watch(id: number): Promise<void> {
    return postJson(resolveUrl("userstory-watch", id));
  },

  unwatch(id: number): Promise<void> {
    return postJson(resolveUrl("userstory-unwatch", id));
  },

  csvUuid(projectId: number): Promise<{ uuid: string }> {
    return postJson<{ uuid: string }>(`${resolveUrl("projects")}/${projectId}/regenerate_userstories_csv_uuid`);
  },
};
