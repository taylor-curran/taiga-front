import { useTranslation } from 'react-i18next';

export default function ChangeEmailPage() {
  const { t } = useTranslation();
  return (
    <div className="feature-page">
      <h1>{t('USER.SETTINGS.CHANGE_EMAIL')}</h1>
    </div>
  );
}
