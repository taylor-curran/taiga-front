import i18n from 'i18next';
import ICU from 'i18next-icu';
import { initReactI18next } from 'react-i18next';
import localeEn from '../locales/locale-en.json';

void i18n.use(ICU).use(initReactI18next).init({
  lng: 'en',
  fallbackLng: 'en',
  resources: {
    en: { translation: localeEn as Record<string, unknown> },
  },
  interpolation: { escapeValue: false },
  react: { useSuspense: false },
});

export default i18n;
