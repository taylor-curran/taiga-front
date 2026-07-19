import { useTranslation } from 'react-i18next';

export default function BlockedProjectPage() {
  const { t } = useTranslation();
  return (
    <div className="feature-page">
      <h1>{t('PROJECT.BLOCKED.TITLE')}</h1>
    </div>
  );
}
