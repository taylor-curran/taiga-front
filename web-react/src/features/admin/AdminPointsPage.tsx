import { useTranslation } from 'react-i18next';

export default function AdminPointsPage() {
  const { t } = useTranslation();
  return (
    <div className="feature-page">
      <h1>{t('ADMIN.PROJECT_VALUES.POINTS')}</h1>
    </div>
  );
}
