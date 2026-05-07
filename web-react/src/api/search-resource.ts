/**
 * Search resource module.
 *
 * The Taiga `/search` endpoint requires a `project` parameter — there is no
 * cross-project search. See `app/coffee/modules/search.coffee` for context.
 */
import { getJson } from "./client";
import { SearchResults } from "./types";
import { resolveUrl } from "./urls";

export const searchResource = {
  search(projectId: number, text: string): Promise<SearchResults> {
    return getJson<SearchResults>(resolveUrl("search"), {
      project: projectId,
      text,
    });
  },
};
