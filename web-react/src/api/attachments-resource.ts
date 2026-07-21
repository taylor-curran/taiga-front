/**
 * Attachments resource module.
 *
 * Mirrors `app/modules/resources/attachments-resource.service.coffee`.
 */
import { deleteJson, getJson, patchJson, postJson } from "./client";
import { resolveUrl, UrlName } from "./urls";

export type AttachmentEntity =
  | "epic"
  | "us"
  | "issue"
  | "task"
  | "wiki_page"
  | "wikipage"
  | "wiki";

export interface Attachment {
  id: number;
  url: string;
  thumbnail_card_url?: string | null;
  preview_url?: string;
  name: string;
  description: string;
  size: number;
  is_deprecated?: boolean;
  from_comment?: boolean;
  attached_file: string;
  modified_date: string;
  project: number;
  object_id: number;
}

function urlFor(entity: AttachmentEntity): string {
  return resolveUrl(`attachments/${entity}` as UrlName);
}

export const attachmentsResource = {
  list(entity: AttachmentEntity, objectId: number): Promise<Attachment[]> {
    return getJson<Attachment[]>(urlFor(entity), { object_id: objectId });
  },

  upload(
    entity: AttachmentEntity,
    formData: FormData,
  ): Promise<Attachment> {
    return postJson<Attachment>(urlFor(entity), formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  update(
    entity: AttachmentEntity,
    id: number,
    data: Partial<Attachment>,
  ): Promise<Attachment> {
    return patchJson<Attachment, Partial<Attachment>>(
      `${urlFor(entity)}/${id}`,
      data,
    );
  },

  remove(entity: AttachmentEntity, id: number): Promise<void> {
    return deleteJson(`${urlFor(entity)}/${id}`);
  },
};
