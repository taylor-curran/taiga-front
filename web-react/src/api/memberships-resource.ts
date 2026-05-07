/**
 * Memberships, roles and invitations resource module.
 */
import { deleteJson, getJson, patchJson, postJson } from "./client";
import { Membership } from "./types";
import { resolveUrl } from "./urls";

export interface Role {
  id: number;
  project: number;
  name: string;
  permissions: string[];
  order: number;
  computable: boolean;
}

export const membershipsResource = {
  list(projectId: number): Promise<Membership[]> {
    return getJson<Membership[]>(resolveUrl("memberships"), {
      project: projectId,
    });
  },

  get(id: number): Promise<Membership> {
    return getJson<Membership>(`${resolveUrl("memberships")}/${id}`);
  },

  create(data: Partial<Membership>): Promise<Membership> {
    return postJson<Membership, Partial<Membership>>(
      resolveUrl("memberships"),
      data,
    );
  },

  bulkCreate(payload: {
    project_id: number;
    bulk_memberships: Array<{ role_id: number; username: string }>;
    invitation_extra_text?: string;
  }): Promise<Membership[]> {
    return postJson<Membership[]>(
      resolveUrl("bulk-create-memberships"),
      payload,
    );
  },

  update(id: number, data: Partial<Membership>): Promise<Membership> {
    return patchJson<Membership, Partial<Membership>>(
      `${resolveUrl("memberships")}/${id}`,
      data,
    );
  },

  remove(id: number): Promise<void> {
    return deleteJson(`${resolveUrl("memberships")}/${id}`);
  },

  resendInvitation(id: number): Promise<void> {
    return postJson(`${resolveUrl("memberships")}/${id}/resend_invitation`);
  },
};

export const rolesResource = {
  list(projectId: number): Promise<Role[]> {
    return getJson<Role[]>(resolveUrl("roles"), { project: projectId });
  },

  create(data: Partial<Role>): Promise<Role> {
    return postJson<Role, Partial<Role>>(resolveUrl("roles"), data);
  },

  update(id: number, data: Partial<Role>): Promise<Role> {
    return patchJson<Role, Partial<Role>>(`${resolveUrl("roles")}/${id}`, data);
  },

  remove(id: number, moveTo?: number): Promise<void> {
    const params = typeof moveTo === "number" ? { moveTo } : undefined;
    return deleteJson(`${resolveUrl("roles")}/${id}`, { params });
  },
};

export const invitationsResource = {
  get(token: string): Promise<unknown> {
    return getJson(`${resolveUrl("invitations")}/${token}`);
  },
};
