import { useTranslation } from 'react-i18next';

export default function WebNotificationsPage() {
  const { t } = useTranslation();
  return (
    <div className="feature-page">
      <h1>{t('USER.SETTINGS.WEB_NOTIFICATIONS')}</h1>
    </div>
  );
}
