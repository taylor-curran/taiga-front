import { useTranslation } from 'react-i18next';

export default function IssuesListPage() {
  const { t } = useTranslation();
  return (
    <div className="feature-page">
      <h1>{t('ISSUES.PAGE_TITLE')}</h1>
    </div>
  );
}
