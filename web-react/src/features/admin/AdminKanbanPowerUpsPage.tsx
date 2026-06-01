import { useTranslation } from 'react-i18next';

export default function AdminKanbanPowerUpsPage() {
  const { t } = useTranslation();
  return (
    <div className="feature-page">
      <h1>{t('ADMIN.PROJECT_VALUES.KANBAN_POWER_UPS')}</h1>
    </div>
  );
}
