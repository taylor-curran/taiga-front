import { useTranslation } from 'react-i18next';
import { LOCALE_OPTIONS, changeLanguage, getSavedLocale } from '@/lib/i18n';
import { Dropdown } from './Dropdown';

export function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const current = i18n.language || getSavedLocale();

  const currentLabel = LOCALE_OPTIONS.find((o) => o.value === current)?.label ?? current;

  return (
    <Dropdown
      align="right"
      trigger={
        <span className="nav-link cursor-pointer text-xs flex items-center gap-1">
          {currentLabel} {'\u25BE'}
        </span>
      }
      items={LOCALE_OPTIONS.map((opt) => ({
        key: opt.value,
        label: opt.label,
        onClick: () => void changeLanguage(opt.value),
      }))}
    />
  );
}
