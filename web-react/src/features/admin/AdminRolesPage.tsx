import { useTranslation } from 'react-i18next';

export default function AdminRolesPage() {
  const { t } = useTranslation();
  return (
    <div className="feature-page">
      <h1>{t('ADMIN.ROLES.TITLE')}</h1>
    </div>
  );
}
