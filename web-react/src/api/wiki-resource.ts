/**
 * Wiki resource module.
 *
 * Mirrors the wiki endpoints declared in `resources.coffee`.
 */
import { deleteJson, getJson, patchJson, postJson } from "./client";
import { WikiPage } from "./types";
import { resolveUrl } from "./urls";

export interface WikiLink {
  id: number;
  project: number;
  href: string;
  title: string;
  order: number;
}

export const wikiResource = {
  list(projectId: number): Promise<WikiPage[]> {
    return getJson<WikiPage[]>(resolveUrl("wiki"), { project: projectId });
  },

  get(id: number): Promise<WikiPage> {
    return getJson<WikiPage>(`${resolveUrl("wiki")}/${id}`);
  },

  getBySlug(projectId: number, slug: string): Promise<WikiPage> {
    return getJson<WikiPage>(`${resolveUrl("wiki")}/by_slug`, {
      project: projectId,
      slug,
    });
  },

  create(data: Partial<WikiPage>): Promise<WikiPage> {
    return postJson<WikiPage, Partial<WikiPage>>(resolveUrl("wiki"), data);
  },

  update(id: number, data: Partial<WikiPage>): Promise<WikiPage> {
    return patchJson<WikiPage, Partial<WikiPage>>(
      `${resolveUrl("wiki")}/${id}`,
      data,
    );
  },

  remove(id: number): Promise<void> {
    return deleteJson(`${resolveUrl("wiki")}/${id}`);
  },

  restore(id: number): Promise<WikiPage> {
    return postJson<WikiPage>(resolveUrl("wiki-restore", id));
  },

  links: {
    list(projectId: number): Promise<WikiLink[]> {
      return getJson<WikiLink[]>(resolveUrl("wiki-links"), {
        project: projectId,
      });
    },
    create(data: Partial<WikiLink>): Promise<WikiLink> {
      return postJson<WikiLink, Partial<WikiLink>>(
        resolveUrl("wiki-links"),
        data,
      );
    },
    update(id: number, data: Partial<WikiLink>): Promise<WikiLink> {
      return patchJson<WikiLink, Partial<WikiLink>>(
        `${resolveUrl("wiki-links")}/${id}`,
        data,
      );
    },
    remove(id: number): Promise<void> {
      return deleteJson(`${resolveUrl("wiki-links")}/${id}`);
    },
  },
};
