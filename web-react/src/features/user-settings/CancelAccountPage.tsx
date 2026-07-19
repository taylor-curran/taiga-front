import { useTranslation } from 'react-i18next';

export default function CancelAccountPage() {
  const { t } = useTranslation();
  return (
    <div className="feature-page">
      <h1>{t('USER.SETTINGS.CANCEL_ACCOUNT')}</h1>
    </div>
  );
}
