import { useTranslation } from 'react-i18next';

export default function TaskboardPage() {
  const { t } = useTranslation();
  return (
    <div className="feature-page">
      <h1>{t('TASKBOARD.PAGE_TITLE')}</h1>
    </div>
  );
}
