import { useTranslation } from 'react-i18next';

export default function NotificationsPage() {
  const { t } = useTranslation();
  return (
    <div className="feature-page">
      <h1>{t('NOTIFICATIONS.PAGE_TITLE')}</h1>
    </div>
  );
}
