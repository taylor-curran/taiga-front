import { useTranslation } from 'react-i18next';

export default function TransferProjectPage() {
  const { t } = useTranslation();
  return (
    <div className="feature-page">
      <h1>{t('PROJECT.TRANSFER.TITLE')}</h1>
    </div>
  );
}
