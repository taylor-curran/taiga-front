import { useTranslation } from 'react-i18next';

export default function MailNotificationsPage() {
  const { t } = useTranslation();
  return (
    <div className="feature-page">
      <h1>{t('USER.SETTINGS.MAIL_NOTIFICATIONS')}</h1>
    </div>
  );
}
