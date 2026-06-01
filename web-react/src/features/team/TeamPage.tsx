import { useTranslation } from 'react-i18next';

export default function TeamPage() {
  const { t } = useTranslation();
  return (
    <div className="feature-page">
      <h1>{t('TEAM.PAGE_TITLE')}</h1>
    </div>
  );
}
