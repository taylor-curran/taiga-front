import { useTranslation } from 'react-i18next';

export default function UserStoryDetailPage() {
  const { t } = useTranslation();
  return (
    <div className="feature-page">
      <h1>{t('USERSTORY.PAGE_TITLE')}</h1>
    </div>
  );
}
