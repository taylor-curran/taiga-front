/**
 * Locales resource module.
 *
 * Returns the list of available languages exposed by the Taiga backend.
 */
import { getJson } from "./client";
import { resolveUrl } from "./urls";

export interface BackendLocale {
  code: string;
  name: string;
  bidi?: boolean;
}

export const localesResource = {
  list(): Promise<BackendLocale[]> {
    return getJson<BackendLocale[]>(resolveUrl("locales"));
  },
};
