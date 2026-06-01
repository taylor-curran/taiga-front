import { useTranslation } from 'react-i18next';

export default function AdminReportsPage() {
  const { t } = useTranslation();
  return (
    <div className="feature-page">
      <h1>{t('ADMIN.REPORTS.TITLE')}</h1>
    </div>
  );
}
