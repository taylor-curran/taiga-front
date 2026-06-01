import { useTranslation } from 'react-i18next';

export default function TaskDetailPage() {
  const { t } = useTranslation();
  return (
    <div className="feature-page">
      <h1>{t('TASK.PAGE_TITLE')}</h1>
    </div>
  );
}
