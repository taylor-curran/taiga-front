import { useTranslation } from 'react-i18next';

export default function UserProjectSettingsPage() {
  const { t } = useTranslation();
  return (
    <div className="feature-page">
      <h1>{t('USER.SETTINGS.PROJECT_SETTINGS')}</h1>
    </div>
  );
}
