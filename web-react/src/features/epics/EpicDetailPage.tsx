import { useTranslation } from 'react-i18next';

export default function EpicDetailPage() {
  const { t } = useTranslation();
  return (
    <div className="feature-page">
      <h1>{t('EPICS.PAGE_TITLE')}</h1>
    </div>
  );
}
