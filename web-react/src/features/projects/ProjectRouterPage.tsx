import { useTranslation } from 'react-i18next';

export default function ProjectRouterPage() {
  const { t } = useTranslation();
  return (
    <div className="feature-page">
      <h1>{t('COMMON.LOADING')}</h1>
    </div>
  );
}
