import { useTranslation } from 'react-i18next';

export default function ProjectTimelinePage() {
  const { t } = useTranslation();
  return (
    <div className="feature-page">
      <h1>{t('PROJECT.NAVIGATION.TIMELINE')}</h1>
    </div>
  );
}
