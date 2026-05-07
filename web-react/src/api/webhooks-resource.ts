/**
 * Webhooks resource module.
 */
import { deleteJson, getJson, patchJson, postJson } from "./client";
import { resolveUrl } from "./urls";

export interface Webhook {
  id: number;
  project: number;
  name: string;
  url: string;
  key: string;
  logs_counter: number;
}

export interface WebhookLog {
  id: number;
  webhook: number;
  url: string;
  status: number;
  request_data: string;
  request_headers: Record<string, string>;
  response_data: string;
  response_headers: Record<string, string>;
  duration: number;
  created: string;
}

export const webhooksResource = {
  list(projectId: number): Promise<Webhook[]> {
    return getJson<Webhook[]>(resolveUrl("webhooks"), { project: projectId });
  },
  create(data: Partial<Webhook>): Promise<Webhook> {
    return postJson<Webhook, Partial<Webhook>>(resolveUrl("webhooks"), data);
  },
  update(id: number, data: Partial<Webhook>): Promise<Webhook> {
    return patchJson<Webhook, Partial<Webhook>>(
      `${resolveUrl("webhooks")}/${id}`,
      data,
    );
  },
  remove(id: number): Promise<void> {
    return deleteJson(`${resolveUrl("webhooks")}/${id}`);
  },
  test(id: number): Promise<unknown> {
    return postJson(resolveUrl("webhooks-test", id));
  },
};

export const webhookLogsResource = {
  list(webhookId: number): Promise<WebhookLog[]> {
    return getJson<WebhookLog[]>(resolveUrl("webhooklogs"), {
      webhook: webhookId,
    });
  },
  resend(id: number): Promise<unknown> {
    return postJson(resolveUrl("webhooklogs-resend", id));
  },
};
