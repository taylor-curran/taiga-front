/**
 * Projects resource module.
 *
 * Mirrors `app/modules/resources/projects-resource.service.coffee`. Returns
 * plain JSON objects (not Immutable maps); React Query handles caching and
 * memoisation, so we don't need the legacy Immutable layer.
 */
import { AxiosRequestConfig } from "axios";
import {
  deleteJson,
  getJson,
  patchJson,
  postJson,
  putJson,
  withLazyPagination,
  withoutPagination,
} from "./client";
import {
  Project,
  ProjectMember,
  PaginatedResponse,
} from "./types";
import { resolveUrl } from "./urls";

export const projectsResource = {
  list(
    params: Record<string, unknown> = {},
    pagination = true,
  ): Promise<Project[]> {
    const config: AxiosRequestConfig = pagination ? {} : withoutPagination();
    return getJson<Project[]>(resolveUrl("projects"), params, config);
  },

  listForUser(userId: number, paginate = false): Promise<Project[]> {
    const config: AxiosRequestConfig = paginate ? {} : withoutPagination();
    return getJson<Project[]>(
      resolveUrl("projects"),
      { member: userId, order_by: "user_order" },
      config,
    );
  },

  /** Slim project listing used by dropdowns (`slight=true`). */
  listForUserSlim(userId: number, paginate = false): Promise<Project[]> {
    const config: AxiosRequestConfig = paginate ? {} : withoutPagination();
    return getJson<Project[]>(
      resolveUrl("projects"),
      { member: userId, order_by: "user_order", slight: true },
      config,
    );
  },

  get(id: number): Promise<Project> {
    return getJson<Project>(`${resolveUrl("projects")}/${id}`);
  },

  getBySlug(slug: string): Promise<Project> {
    return getJson<Project>(`${resolveUrl("projects")}/by_slug`, { slug });
  },

  create(data: Partial<Project>): Promise<Project> {
    return postJson<Project, Partial<Project>>(resolveUrl("projects"), data);
  },

  update(id: number, data: Partial<Project>): Promise<Project> {
    return patchJson<Project, Partial<Project>>(
      `${resolveUrl("projects")}/${id}`,
      data,
    );
  },

  replace(id: number, data: Partial<Project>): Promise<Project> {
    return putJson<Project, Partial<Project>>(
      `${resolveUrl("projects")}/${id}`,
      data,
    );
  },

  remove(id: number): Promise<void> {
    return deleteJson(`${resolveUrl("projects")}/${id}`);
  },

  duplicate(
    id: number,
    data: {
      name: string;
      description?: string;
      is_private?: boolean;
      users: number[];
    },
  ): Promise<Project> {
    return postJson<Project>(`${resolveUrl("projects")}/${id}/duplicate`, {
      name: data.name,
      description: data.description,
      is_private: data.is_private,
      users: data.users.map((id) => ({ id })),
    });
  },

  bulkUpdateOrder(
    bulkData: Array<{ project_id: number; order: number }>,
  ): Promise<void> {
    return postJson(resolveUrl("bulk-update-projects-order"), bulkData);
  },

  getTimeline(
    projectId: number,
    page: number,
  ): Promise<PaginatedResponse<unknown>> {
    return getJson<PaginatedResponse<unknown>>(
      `${resolveUrl("timeline-project")}/${projectId}`,
      { page, only_relevant: true },
      withLazyPagination(),
    );
  },

  like(projectId: number): Promise<void> {
    return postJson(resolveUrl("project-like", projectId));
  },

  unlike(projectId: number): Promise<void> {
    return postJson(resolveUrl("project-unlike", projectId));
  },

  watch(projectId: number, notifyLevel: number): Promise<void> {
    return postJson(resolveUrl("project-watch", projectId), {
      notify_level: notifyLevel,
      live_notify_level: notifyLevel,
    });
  },

  unwatch(projectId: number): Promise<void> {
    return postJson(resolveUrl("project-unwatch", projectId));
  },

  contact(projectId: number, message: string): Promise<void> {
    return postJson(resolveUrl("project-contact"), {
      project: projectId,
      comment: message,
    });
  },

  modules(id: number): Promise<unknown> {
    return getJson(resolveUrl("project-modules", id));
  },

  members(projectId: number): Promise<ProjectMember[]> {
    return getJson<ProjectMember[]>(resolveUrl("memberships"), {
      project: projectId,
    });
  },

  transferValidateToken(projectId: number, token: string): Promise<unknown> {
    return postJson(resolveUrl("project-transfer-validate-token", projectId), {
      token,
    });
  },

  transferAccept(
    projectId: number,
    token: string,
    reason?: string,
  ): Promise<unknown> {
    return postJson(resolveUrl("project-transfer-accept", projectId), {
      token,
      reason,
    });
  },

  transferReject(
    projectId: number,
    token: string,
    reason?: string,
  ): Promise<unknown> {
    return postJson(resolveUrl("project-transfer-reject", projectId), {
      token,
      reason,
    });
  },

  transferRequest(projectId: number): Promise<unknown> {
    return postJson(resolveUrl("project-transfer-request", projectId));
  },

  transferStart(
    projectId: number,
    userId: number,
    reason?: string,
  ): Promise<unknown> {
    return postJson(resolveUrl("project-transfer-start", projectId), {
      user: userId,
      reason,
    });
  },

  templates(): Promise<unknown[]> {
    return getJson<unknown[]>(resolveUrl("project-templates"));
  },
};
