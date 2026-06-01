import { useTranslation } from 'react-i18next';

export default function AdminGitlabPage() {
  const { t } = useTranslation();
  return (
    <div className="feature-page">
      <h1>{t('ADMIN.THIRD_PARTIES.GITLAB')}</h1>
    </div>
  );
}
