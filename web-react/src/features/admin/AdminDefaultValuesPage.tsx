import { useTranslation } from 'react-i18next';

export default function AdminDefaultValuesPage() {
  const { t } = useTranslation();
  return (
    <div className="feature-page">
      <h1>{t('ADMIN.DEFAULT_VALUES.TITLE')}</h1>
    </div>
  );
}
