import { useTranslation } from 'react-i18next';

export default function DiscoverSearchPage() {
  const { t } = useTranslation();
  return (
    <div className="feature-page">
      <h1>{t('PROJECT.NAVIGATION.DISCOVER')}</h1>
    </div>
  );
}
