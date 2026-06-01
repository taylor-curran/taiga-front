import { useTranslation } from 'react-i18next';

export default function AdminMembershipsPage() {
  const { t } = useTranslation();
  return (
    <div className="feature-page">
      <h1>{t('ADMIN.MEMBERSHIPS.TITLE')}</h1>
    </div>
  );
}
