import { useTranslation } from 'react-i18next';

export default function ProfilePage() {
  const { t } = useTranslation();
  return (
    <div className="feature-page">
      <h1>{t('USER.MY_PROFILE')}</h1>
    </div>
  );
}
