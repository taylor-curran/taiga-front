import { useTranslation } from 'react-i18next';

export default function BacklogPage() {
  const { t } = useTranslation();
  return (
    <div className="feature-page">
      <h1>{t('BACKLOG.PAGE_TITLE')}</h1>
    </div>
  );
}
