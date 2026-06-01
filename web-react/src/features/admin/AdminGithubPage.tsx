import { useTranslation } from 'react-i18next';

export default function AdminGithubPage() {
  const { t } = useTranslation();
  return (
    <div className="feature-page">
      <h1>{t('ADMIN.THIRD_PARTIES.GITHUB')}</h1>
    </div>
  );
}
