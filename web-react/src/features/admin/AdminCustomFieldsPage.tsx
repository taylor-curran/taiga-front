import { useTranslation } from 'react-i18next';

export default function AdminCustomFieldsPage() {
  const { t } = useTranslation();
  return (
    <div className="feature-page">
      <h1>{t('ADMIN.PROJECT_VALUES.CUSTOM_FIELDS')}</h1>
    </div>
  );
}
