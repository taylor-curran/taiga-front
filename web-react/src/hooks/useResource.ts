/**
 * Reusable React Query hooks for Taiga REST resources.
 *
 * Each resource module exposes plain async functions; these hooks wrap them
 * in `useQuery` / `useMutation` with sensible defaults and a stable
 * `queryKey` convention rooted at the resource name.
 */
import {
  useMutation,
  UseMutationOptions,
  useQuery,
  useQueryClient,
  UseQueryOptions,
} from "@tanstack/react-query";
import { authResource } from "../api/auth-resource";
import { epicsResource } from "../api/epics-resource";
import { issuesResource } from "../api/issues-resource";
import { milestonesResource } from "../api/milestones-resource";
import { projectsResource } from "../api/projects-resource";
import { tasksResource } from "../api/tasks-resource";
import {
  membershipsResource,
  rolesResource,
  Role,
} from "../api/memberships-resource";
import { searchResource } from "../api/search-resource";
import {
  notifyPoliciesResource,
  webNotificationsResource,
} from "../api/notifications-resource";
import { userstoriesResource } from "../api/userstories-resource";
import { usersResource } from "../api/users-resource";
import { wikiResource } from "../api/wiki-resource";
import {
  Epic,
  Issue,
  Membership,
  Milestone,
  PaginatedResponse,
  Project,
  ProjectMember,
  SearchResults,
  Task,
  User,
  UserStory,
  WikiPage,
} from "../api/types";

type QueryOpts<T> = Omit<
  UseQueryOptions<T, unknown, T, ReadonlyArray<unknown>>,
  "queryKey" | "queryFn"
>;

/* ---------- Current user / auth ---------- */

export const useCurrentUser = (opts?: QueryOpts<User>) =>
  useQuery({
    queryKey: ["users", "me"],
    queryFn: () => authResource.getMe(),
    staleTime: 5 * 60 * 1000,
    ...opts,
  });

/* ---------- Projects ---------- */

export const useProjectsForUser = (
  userId: number | undefined,
  opts?: QueryOpts<Project[]>,
) =>
  useQuery({
    queryKey: ["projects", "user", userId],
    queryFn: () => projectsResource.listForUser(userId as number),
    enabled: typeof userId === "number",
    ...opts,
  });

export const useProjectBySlug = (
  slug: string | undefined,
  opts?: QueryOpts<Project>,
) =>
  useQuery({
    queryKey: ["projects", "slug", slug],
    queryFn: () => projectsResource.getBySlug(slug as string),
    enabled: typeof slug === "string" && slug.length > 0,
    ...opts,
  });

export const useProjectMembers = (
  projectId: number | undefined,
  opts?: QueryOpts<ProjectMember[]>,
) =>
  useQuery({
    queryKey: ["projects", projectId, "members"],
    queryFn: () => projectsResource.members(projectId as number),
    enabled: typeof projectId === "number",
    ...opts,
  });

export const useProjectTimeline = (
  projectId: number | undefined,
  page: number,
  opts?: QueryOpts<PaginatedResponse<unknown>>,
) =>
  useQuery({
    queryKey: ["projects", projectId, "timeline", page],
    queryFn: () => projectsResource.getTimeline(projectId as number, page),
    enabled: typeof projectId === "number",
    ...opts,
  });

/* ---------- Memberships / roles ---------- */

export const useMemberships = (
  projectId: number | undefined,
  opts?: QueryOpts<Membership[]>,
) =>
  useQuery({
    queryKey: ["memberships", projectId],
    queryFn: () => membershipsResource.list(projectId as number),
    enabled: typeof projectId === "number",
    ...opts,
  });

export const useRoles = (
  projectId: number | undefined,
  opts?: QueryOpts<Role[]>,
) =>
  useQuery({
    queryKey: ["roles", projectId],
    queryFn: () => rolesResource.list(projectId as number),
    enabled: typeof projectId === "number",
    ...opts,
  });

/* ---------- Milestones ---------- */

export const useMilestones = (
  projectId: number | undefined,
  closed?: boolean,
  opts?: QueryOpts<Milestone[]>,
) =>
  useQuery({
    queryKey: ["milestones", projectId, closed ?? null],
    queryFn: () => milestonesResource.listInProject(projectId as number, closed),
    enabled: typeof projectId === "number",
    ...opts,
  });

/* ---------- Epics ---------- */

export const useEpics = (
  projectId: number | undefined,
  opts?: QueryOpts<Epic[]>,
) =>
  useQuery({
    queryKey: ["epics", projectId],
    queryFn: () => epicsResource.listInProject(projectId as number),
    enabled: typeof projectId === "number",
    ...opts,
  });

export const useEpicByRef = (
  projectId: number | undefined,
  ref: number | undefined,
  opts?: QueryOpts<Epic>,
) =>
  useQuery({
    queryKey: ["epics", projectId, "ref", ref],
    queryFn: () =>
      epicsResource.getByRef(projectId as number, ref as number),
    enabled:
      typeof projectId === "number" && typeof ref === "number",
    ...opts,
  });

/* ---------- User stories ---------- */

export const useUserStories = (
  projectId: number | undefined,
  extra?: Record<string, unknown>,
  opts?: QueryOpts<UserStory[]>,
) =>
  useQuery({
    queryKey: ["userstories", projectId, extra ?? null],
    queryFn: () =>
      userstoriesResource.listInProject(projectId as number, extra),
    enabled: typeof projectId === "number",
    ...opts,
  });

export const useUserStoryByRef = (
  projectId: number | undefined,
  ref: number | undefined,
  opts?: QueryOpts<UserStory>,
) =>
  useQuery({
    queryKey: ["userstories", projectId, "ref", ref],
    queryFn: () =>
      userstoriesResource.getByRef(projectId as number, ref as number),
    enabled:
      typeof projectId === "number" && typeof ref === "number",
    ...opts,
  });

/* ---------- Tasks ---------- */

export const useTasks = (
  projectId: number | undefined,
  opts?: QueryOpts<Task[]>,
) =>
  useQuery({
    queryKey: ["tasks", projectId],
    queryFn: () => tasksResource.listInProject(projectId as number),
    enabled: typeof projectId === "number",
    ...opts,
  });

export const useTaskByRef = (
  projectId: number | undefined,
  ref: number | undefined,
  opts?: QueryOpts<Task>,
) =>
  useQuery({
    queryKey: ["tasks", projectId, "ref", ref],
    queryFn: () =>
      tasksResource.getByRef(projectId as number, ref as number),
    enabled:
      typeof projectId === "number" && typeof ref === "number",
    ...opts,
  });

/* ---------- Issues ---------- */

export const useIssues = (
  projectId: number | undefined,
  opts?: QueryOpts<Issue[]>,
) =>
  useQuery({
    queryKey: ["issues", projectId],
    queryFn: () => issuesResource.listInProject(projectId as number),
    enabled: typeof projectId === "number",
    ...opts,
  });

export const useIssueByRef = (
  projectId: number | undefined,
  ref: number | undefined,
  opts?: QueryOpts<Issue>,
) =>
  useQuery({
    queryKey: ["issues", projectId, "ref", ref],
    queryFn: () =>
      issuesResource.getByRef(projectId as number, ref as number),
    enabled:
      typeof projectId === "number" && typeof ref === "number",
    ...opts,
  });

/* ---------- Wiki ---------- */

export const useWikiPages = (
  projectId: number | undefined,
  opts?: QueryOpts<WikiPage[]>,
) =>
  useQuery({
    queryKey: ["wiki", projectId],
    queryFn: () => wikiResource.list(projectId as number),
    enabled: typeof projectId === "number",
    ...opts,
  });

export const useWikiPageBySlug = (
  projectId: number | undefined,
  slug: string | undefined,
  opts?: QueryOpts<WikiPage>,
) =>
  useQuery({
    queryKey: ["wiki", projectId, "slug", slug],
    queryFn: () =>
      wikiResource.getBySlug(projectId as number, slug as string),
    enabled:
      typeof projectId === "number" &&
      typeof slug === "string" &&
      slug.length > 0,
    ...opts,
  });

/* ---------- Search ---------- */

export const useSearch = (
  projectId: number | undefined,
  text: string,
  opts?: QueryOpts<SearchResults>,
) =>
  useQuery({
    queryKey: ["search", projectId, text],
    queryFn: () => searchResource.search(projectId as number, text),
    enabled: typeof projectId === "number" && text.length > 0,
    ...opts,
  });

/* ---------- Users ---------- */

export const useUserByUsername = (
  username: string | undefined,
  opts?: QueryOpts<User>,
) =>
  useQuery({
    queryKey: ["users", "username", username],
    queryFn: () => usersResource.getByUsername(username as string),
    enabled: typeof username === "string" && username.length > 0,
    ...opts,
  });

/* ---------- Notifications ---------- */

export const useNotifyPolicies = () =>
  useQuery({
    queryKey: ["notify-policies"],
    queryFn: () => notifyPoliciesResource.list(),
  });

export const useWebNotifications = (params?: {
  onlyUnread?: boolean;
  page?: number;
}) =>
  useQuery({
    queryKey: ["web-notifications", params ?? {}],
    queryFn: () => webNotificationsResource.list(params),
  });

/* ---------- Helpers for invalidation ---------- */

export function useInvalidateProject() {
  const client = useQueryClient();
  return (projectId: number, slug?: string) => {
    void client.invalidateQueries({ queryKey: ["projects", projectId] });
    if (slug) {
      void client.invalidateQueries({ queryKey: ["projects", "slug", slug] });
    }
  };
}

/** Generic typed mutation factory; use for consistent error/loading semantics. */
export function useTypedMutation<TVars, TResult>(
  mutationFn: (vars: TVars) => Promise<TResult>,
  options?: UseMutationOptions<TResult, unknown, TVars>,
) {
  return useMutation<TResult, unknown, TVars>({ mutationFn, ...options });
}
