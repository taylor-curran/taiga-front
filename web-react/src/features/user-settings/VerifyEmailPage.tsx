import { useTranslation } from 'react-i18next';

export default function VerifyEmailPage() {
  const { t } = useTranslation();
  return (
    <div className="feature-page">
      <h1>{t('USER.SETTINGS.VERIFY_EMAIL')}</h1>
    </div>
  );
}
