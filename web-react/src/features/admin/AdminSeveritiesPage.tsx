import { useTranslation } from 'react-i18next';

export default function AdminSeveritiesPage() {
  const { t } = useTranslation();
  return (
    <div className="feature-page">
      <h1>{t('ADMIN.PROJECT_VALUES.SEVERITIES')}</h1>
    </div>
  );
}
