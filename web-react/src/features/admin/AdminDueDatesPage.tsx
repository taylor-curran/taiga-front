import { useTranslation } from 'react-i18next';

export default function AdminDueDatesPage() {
  const { t } = useTranslation();
  return (
    <div className="feature-page">
      <h1>{t('ADMIN.PROJECT_VALUES.DUE_DATES')}</h1>
    </div>
  );
}
