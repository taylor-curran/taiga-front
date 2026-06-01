import { useTranslation } from 'react-i18next';

export default function UserProfileSettingsPage() {
  const { t } = useTranslation();
  return (
    <div className="feature-page">
      <h1>{t('USER.SETTINGS.PROFILE')}</h1>
    </div>
  );
}
