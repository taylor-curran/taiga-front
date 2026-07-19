import { useTranslation } from 'react-i18next';

export default function KanbanPage() {
  const { t } = useTranslation();
  return (
    <div className="feature-page">
      <h1>{t('KANBAN.PAGE_TITLE')}</h1>
    </div>
  );
}
