import { useTranslation } from 'react-i18next';

export default function LiveNotificationsPage() {
  const { t } = useTranslation();
  return (
    <div className="feature-page">
      <h1>{t('USER.SETTINGS.LIVE_NOTIFICATIONS')}</h1>
    </div>
  );
}
