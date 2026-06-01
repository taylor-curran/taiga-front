import { useTranslation } from 'react-i18next';

export default function AdminExportPage() {
  const { t } = useTranslation();
  return (
    <div className="feature-page">
      <h1>{t('ADMIN.EXPORT.TITLE')}</h1>
    </div>
  );
}
