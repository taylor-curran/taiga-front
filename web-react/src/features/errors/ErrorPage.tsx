import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function ErrorPage() {
  const { t } = useTranslation();
  return (
    <div className="error-page">
      <h1>{t('ERROR.GENERIC_TITLE')}</h1>
      <p>{t('ERROR.GENERIC_TEXT')}</p>
      <Link to="/" className="btn btn-primary">{t('ERROR.GO_HOME')}</Link>
    </div>
  );
}
