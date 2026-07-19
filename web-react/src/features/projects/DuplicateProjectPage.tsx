import { useTranslation } from 'react-i18next';

export default function DuplicateProjectPage() {
  const { t } = useTranslation();
  return (
    <div className="feature-page">
      <h1>{t('PROJECT.CREATE.TITLE')}</h1>
    </div>
  );
}
