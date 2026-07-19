import { useTranslation } from 'react-i18next';

export default function AdminTagsPage() {
  const { t } = useTranslation();
  return (
    <div className="feature-page">
      <h1>{t('ADMIN.PROJECT_VALUES.TAGS')}</h1>
    </div>
  );
}
