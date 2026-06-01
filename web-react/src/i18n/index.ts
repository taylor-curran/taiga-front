import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import HttpBackend from 'i18next-http-backend';

i18n
  .use(HttpBackend)
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    supportedLngs: [
      'ar', 'ca', 'da', 'de', 'en', 'es', 'eu', 'fa', 'fi', 'fr',
      'he', 'hu', 'id', 'it', 'ja', 'ko', 'lv', 'nb', 'nl', 'pl',
      'pt-br', 'ru', 'sr', 'sv', 'tr', 'uk', 'vi', 'zh-hans', 'zh-hant',
    ],
    interpolation: {
      escapeValue: false,
    },
    backend: {
      loadPath: '/locales/taiga/locale-{{lng}}.json',
    },
    react: {
      useSuspense: true,
    },
  });

export default i18n;
