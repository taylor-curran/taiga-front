import { useTranslation } from 'react-i18next';

export default function SearchPage() {
  const { t } = useTranslation();
  return (
    <div className="feature-page">
      <h1>{t('COMMON.SEARCH')}</h1>
    </div>
  );
}
