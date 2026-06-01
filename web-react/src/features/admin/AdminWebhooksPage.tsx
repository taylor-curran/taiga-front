import { useTranslation } from 'react-i18next';

export default function AdminWebhooksPage() {
  const { t } = useTranslation();
  return (
    <div className="feature-page">
      <h1>{t('ADMIN.THIRD_PARTIES.WEBHOOKS')}</h1>
    </div>
  );
}
