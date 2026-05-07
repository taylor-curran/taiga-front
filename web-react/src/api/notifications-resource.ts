/**
 * Notifications resource module.
 *
 * Important: Taiga uses `/notify-policies` for project-level notification
 * settings and `/web-notifications` for the in-app inbox. There is no
 * `/notifications` endpoint.
 */
import { getJson, patchJson, postJson } from "./client";
import { resolveUrl } from "./urls";

export interface NotifyPolicy {
  id: number;
  project: number;
  notify_level: number;
  live_notify_level: number;
  web_notify_level: boolean;
}

export interface WebNotification {
  id: number;
  user: number;
  created: string;
  read: string | null;
  event_type: number;
  data: Record<string, unknown>;
}

export interface WebNotificationListResponse {
  objects: WebNotification[];
  total: number;
}

export const notifyPoliciesResource = {
  list(): Promise<NotifyPolicy[]> {
    return getJson<NotifyPolicy[]>(resolveUrl("notify-policies"));
  },

  update(id: number, data: Partial<NotifyPolicy>): Promise<NotifyPolicy> {
    return patchJson<NotifyPolicy, Partial<NotifyPolicy>>(
      `${resolveUrl("notify-policies")}/${id}`,
      data,
    );
  },
};

export const webNotificationsResource = {
  list(
    params: { onlyUnread?: boolean; page?: number } = {},
  ): Promise<WebNotificationListResponse> {
    return getJson<WebNotificationListResponse>(resolveUrl("notifications"), {
      only_unread: params.onlyUnread,
      page: params.page,
    });
  },

  setAsRead(id: number): Promise<WebNotification> {
    return postJson<WebNotification>(
      `${resolveUrl("notifications")}/${id}/set_as_read`,
    );
  },

  setAllAsRead(): Promise<void> {
    return postJson(`${resolveUrl("notifications")}/set_all_as_read`);
  },
};
