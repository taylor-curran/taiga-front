/**
 * Users resource module.
 *
 * Mirrors the user-related endpoints from `app/coffee/modules/resources.coffee`
 * and `app/modules/resources/users-resource.service.coffee`.
 */
import { deleteJson, getJson, patchJson, postJson } from "./client";
import { User } from "./types";
import { resolveUrl } from "./urls";

export const usersResource = {
  list(params?: Record<string, unknown>): Promise<User[]> {
    return getJson<User[]>(resolveUrl("users"), params);
  },

  get(id: number): Promise<User> {
    return getJson<User>(`${resolveUrl("users")}/${id}`);
  },

  getByUsername(username: string): Promise<User> {
    return getJson<User>(resolveUrl("by_username"), { username });
  },

  me(): Promise<User> {
    return getJson<User>(resolveUrl("user-me"));
  },

  update(id: number, data: Partial<User>): Promise<User> {
    return patchJson<User, Partial<User>>(`${resolveUrl("users")}/${id}`, data);
  },

  remove(id: number): Promise<void> {
    return deleteJson(`${resolveUrl("users")}/${id}`);
  },

  contacts(id: number): Promise<User[]> {
    return getJson<User[]>(resolveUrl("user-contacts", id));
  },

  stats(id: number): Promise<unknown> {
    return getJson(resolveUrl("user-stats", id));
  },

  liked(id: number, params?: Record<string, unknown>): Promise<unknown[]> {
    return getJson(resolveUrl("user-liked", id), params);
  },

  voted(id: number, params?: Record<string, unknown>): Promise<unknown[]> {
    return getJson(resolveUrl("user-voted", id), params);
  },

  watched(id: number, params?: Record<string, unknown>): Promise<unknown[]> {
    return getJson(resolveUrl("user-watched", id), params);
  },

  changeAvatar(id: number, formData: FormData): Promise<User> {
    return postJson<User>(`${resolveUrl("users")}/${id}/change_avatar`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
};
