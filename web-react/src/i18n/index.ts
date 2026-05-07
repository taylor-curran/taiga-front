/**
 * i18next setup.
 *
 * Loads locale JSON files from the legacy AngularJS app at
 * `app/locales/taiga/locale-<code>.json`. The Vite dev/build configs map
 * `/app/locales/**` so the React build can consume the same translations.
 *
 * Resources are lazily fetched via i18next-http-backend so we don't bundle
 * 30 languages into the React build by default. The user's preferred
 * language is read from `localStorage.userInfo.lang`, falling back to
 * `navigator.language` and finally to "en".
 */
import i18n from "i18next";
import HttpBackend from "i18next-http-backend";
import { initReactI18next } from "react-i18next";
import { tokenStorage } from "../api/token-storage";

export const SUPPORTED_LOCALES = [
  "ar",
  "ca",
  "da",
  "de",
  "en",
  "es",
  "eu",
  "fa",
  "fi",
  "fr",
  "he",
  "hu",
  "id",
  "it",
  "ja",
  "ko",
  "lv",
  "nb",
  "nl",
  "pl",
  "pt-br",
  "ru",
  "sr",
  "sv",
  "tr",
  "uk",
  "vi",
  "zh-hans",
  "zh-hant",
] as const;

export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

function detectInitialLanguage(): string {
  // 1. Cached user profile
  const cached = tokenStorage.getUserInfo<{ lang?: string }>();
  if (cached?.lang && SUPPORTED_LOCALES.includes(cached.lang as SupportedLocale)) {
    return cached.lang;
  }
  // 2. Browser language
  if (typeof navigator !== "undefined") {
    const navLang = navigator.language.toLowerCase();
    if (SUPPORTED_LOCALES.includes(navLang as SupportedLocale)) return navLang;
    const baseLang = navLang.split("-")[0];
    if (SUPPORTED_LOCALES.includes(baseLang as SupportedLocale)) return baseLang;
  }
  // 3. Config defaultLanguage
  if (typeof window !== "undefined" && window.taigaConfig?.defaultLanguage) {
    const cfg = window.taigaConfig.defaultLanguage;
    if (SUPPORTED_LOCALES.includes(cfg as SupportedLocale)) return cfg;
  }
  return "en";
}

void i18n
  .use(HttpBackend)
  .use(initReactI18next)
  .init({
    lng: detectInitialLanguage(),
    fallbackLng: "en",
    supportedLngs: SUPPORTED_LOCALES as unknown as string[],
    nonExplicitSupportedLngs: true,
    ns: ["taiga"],
    defaultNS: "taiga",
    debug: false,
    interpolation: {
      escapeValue: false, // React already escapes
    },
    backend: {
      // Vite serves files under `app/locales` via the alias defined in
      // vite.config.ts (publicDir / fs.allow). The url uses `{{lng}}` from i18next.
      loadPath: "/locales/taiga/locale-{{lng}}.json",
    },
    react: {
      useSuspense: false,
    },
  });

export default i18n;
