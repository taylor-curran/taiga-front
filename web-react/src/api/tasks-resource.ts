/**
 * Tasks resource module.
 *
 * Mirrors `app/modules/resources/tasks-resource.service.coffee`.
 */
import { AxiosRequestConfig } from "axios";
import {
  deleteJson,
  getJson,
  patchJson,
  postJson,
  withoutPagination,
} from "./client";
import { Task } from "./types";
import { resolveUrl } from "./urls";

export const tasksResource = {
  list(
    params: Record<string, unknown> = {},
    paginate = false,
  ): Promise<Task[]> {
    const config: AxiosRequestConfig = paginate ? {} : withoutPagination();
    return getJson<Task[]>(resolveUrl("tasks"), params, config);
  },

  listInProject(projectId: number): Promise<Task[]> {
    return this.list({ project: projectId });
  },

  listInUserStory(userStoryId: number): Promise<Task[]> {
    return this.list({ user_story: userStoryId });
  },

  get(id: number): Promise<Task> {
    return getJson<Task>(`${resolveUrl("tasks")}/${id}`);
  },

  getByRef(projectId: number, ref: number): Promise<Task> {
    return getJson<Task>(`${resolveUrl("tasks")}/by_ref`, {
      project: projectId,
      ref,
    });
  },

  create(data: Partial<Task>): Promise<Task> {
    return postJson<Task, Partial<Task>>(resolveUrl("tasks"), data);
  },

  update(id: number, data: Partial<Task>): Promise<Task> {
    return patchJson<Task, Partial<Task>>(`${resolveUrl("tasks")}/${id}`, data);
  },

  remove(id: number): Promise<void> {
    return deleteJson(`${resolveUrl("tasks")}/${id}`);
  },

  bulkCreate(payload: {
    project_id: number;
    bulk_tasks: string;
    sprint_id?: number;
    us_id?: number;
    status_id?: number;
  }): Promise<Task[]> {
    return postJson<Task[]>(resolveUrl("bulk-create-tasks"), payload);
  },

  bulkUpdateTaskboardOrder(
    projectId: number,
    bulkTasks: Array<{ task_id: number; order: number }>,
  ): Promise<void> {
    return postJson(resolveUrl("bulk-update-task-taskboard-order"), {
      project_id: projectId,
      bulk_tasks: bulkTasks,
    });
  },

  bulkUpdateMilestone(
    projectId: number,
    milestoneId: number,
    bulkTasks: Array<{ task_id: number; order: number }>,
  ): Promise<void> {
    return postJson(resolveUrl("bulk-update-task-milestone"), {
      project_id: projectId,
      milestone_id: milestoneId,
      bulk_tasks: bulkTasks,
    });
  },

  filtersData(projectId: number): Promise<unknown> {
    return getJson(resolveUrl("task-filters"), { project: projectId });
  },

  upvote(id: number): Promise<void> {
    return postJson(resolveUrl("task-upvote", id));
  },

  downvote(id: number): Promise<void> {
    return postJson(resolveUrl("task-downvote", id));
  },

  watch(id: number): Promise<void> {
    return postJson(resolveUrl("task-watch", id));
  },

  unwatch(id: number): Promise<void> {
    return postJson(resolveUrl("task-unwatch", id));
  },

  promoteToUserStory(id: number, projectId: number): Promise<unknown> {
    return postJson(resolveUrl("promote-task-to-us", id), {
      project_id: projectId,
    });
  },
};
