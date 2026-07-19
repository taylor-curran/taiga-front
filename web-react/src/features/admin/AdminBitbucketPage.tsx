import { useTranslation } from 'react-i18next';

export default function AdminBitbucketPage() {
  const { t } = useTranslation();
  return (
    <div className="feature-page">
      <h1>{t('ADMIN.THIRD_PARTIES.BITBUCKET')}</h1>
    </div>
  );
}
