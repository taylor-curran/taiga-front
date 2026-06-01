import { useTranslation } from 'react-i18next';

export default function AdminGogsPage() {
  const { t } = useTranslation();
  return (
    <div className="feature-page">
      <h1>{t('ADMIN.THIRD_PARTIES.GOGS')}</h1>
    </div>
  );
}
