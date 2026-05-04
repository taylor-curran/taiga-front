import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { storage } from './storage';

const LOCALE_STORAGE_KEY = 'taiga.locale';

const AVAILABLE_LOCALES: Record<string, () => Promise<Record<string, unknown>>> = {
  ar: () => import('../../../app/locales/taiga/locale-ar.json'),
  ca: () => import('../../../app/locales/taiga/locale-ca.json'),
  da: () => import('../../../app/locales/taiga/locale-da.json'),
  de: () => import('../../../app/locales/taiga/locale-de.json'),
  en: () => import('../../../app/locales/taiga/locale-en.json'),
  es: () => import('../../../app/locales/taiga/locale-es.json'),
  eu: () => import('../../../app/locales/taiga/locale-eu.json'),
  fa: () => import('../../../app/locales/taiga/locale-fa.json'),
  fi: () => import('../../../app/locales/taiga/locale-fi.json'),
  fr: () => import('../../../app/locales/taiga/locale-fr.json'),
  he: () => import('../../../app/locales/taiga/locale-he.json'),
  hu: () => import('../../../app/locales/taiga/locale-hu.json'),
  id: () => import('../../../app/locales/taiga/locale-id.json'),
  it: () => import('../../../app/locales/taiga/locale-it.json'),
  ja: () => import('../../../app/locales/taiga/locale-ja.json'),
  ko: () => import('../../../app/locales/taiga/locale-ko.json'),
  lv: () => import('../../../app/locales/taiga/locale-lv.json'),
  nb: () => import('../../../app/locales/taiga/locale-nb.json'),
  nl: () => import('../../../app/locales/taiga/locale-nl.json'),
  pl: () => import('../../../app/locales/taiga/locale-pl.json'),
  'pt-br': () => import('../../../app/locales/taiga/locale-pt-br.json'),
  ru: () => import('../../../app/locales/taiga/locale-ru.json'),
  sr: () => import('../../../app/locales/taiga/locale-sr.json'),
  sv: () => import('../../../app/locales/taiga/locale-sv.json'),
  tr: () => import('../../../app/locales/taiga/locale-tr.json'),
  uk: () => import('../../../app/locales/taiga/locale-uk.json'),
  vi: () => import('../../../app/locales/taiga/locale-vi.json'),
  'zh-hans': () => import('../../../app/locales/taiga/locale-zh-hans.json'),
  'zh-hant': () => import('../../../app/locales/taiga/locale-zh-hant.json'),
};

export const LOCALE_OPTIONS = Object.keys(AVAILABLE_LOCALES).map((code) => ({
  value: code,
  label: new Intl.DisplayNames([code, 'en'], { type: 'language' }).of(code) ?? code,
}));

async function loadLocale(lng: string): Promise<void> {
  const loader = AVAILABLE_LOCALES[lng];
  if (!loader) return;
  const mod = await loader();
  const resource = (mod as { default?: Record<string, unknown> }).default ?? mod;
  i18n.addResourceBundle(lng, 'translation', resource, true, true);
}

export function getSavedLocale(): string {
  return storage.get<string>(LOCALE_STORAGE_KEY) ?? 'en';
}

export function saveLocale(lng: string): void {
  storage.set(LOCALE_STORAGE_KEY, lng);
}

export async function changeLanguage(lng: string): Promise<void> {
  await loadLocale(lng);
  await i18n.changeLanguage(lng);
  saveLocale(lng);
}

export async function initI18n(): Promise<void> {
  const lng = getSavedLocale();

  try {
    await i18n.use(initReactI18next).init({
      lng,
      fallbackLng: 'en',
      interpolation: { escapeValue: false },
      returnNull: false,
      react: { useSuspense: false },
    });

    await loadLocale(lng);
    if (lng !== 'en') {
      await loadLocale('en');
    }
  } catch (err) {
    console.error('i18n init failed, continuing without translations:', err);
  }
}

export default i18n;
