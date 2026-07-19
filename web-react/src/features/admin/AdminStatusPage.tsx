import { useTranslation } from 'react-i18next';

export default function AdminStatusPage() {
  const { t } = useTranslation();
  return (
    <div className="feature-page">
      <h1>{t('ADMIN.PROJECT_VALUES.STATUS')}</h1>
    </div>
  );
}
