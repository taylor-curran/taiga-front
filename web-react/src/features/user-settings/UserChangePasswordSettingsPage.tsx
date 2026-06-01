import { useTranslation } from 'react-i18next';

export default function UserChangePasswordSettingsPage() {
  const { t } = useTranslation();
  return (
    <div className="feature-page">
      <h1>{t('USER.SETTINGS.CHANGE_PASSWORD')}</h1>
    </div>
  );
}
