import { useTranslation } from 'react-i18next';

export default function WikiPage() {
  const { t } = useTranslation();
  return (
    <div className="feature-page">
      <h1>{t('WIKI.PAGE_TITLE')}</h1>
    </div>
  );
}
