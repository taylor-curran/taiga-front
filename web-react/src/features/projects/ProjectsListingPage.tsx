import { useTranslation } from 'react-i18next';

export default function ProjectsListingPage() {
  const { t } = useTranslation();
  return (
    <div className="feature-page">
      <h1>{t('PROJECTS.PAGE_TITLE')}</h1>
    </div>
  );
}
