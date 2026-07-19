import { useTranslation } from 'react-i18next';

export default function AdminModulesPage() {
  const { t } = useTranslation();
  return (
    <div className="feature-page">
      <h1>{t('ADMIN.MODULES.TITLE')}</h1>
    </div>
  );
}
