import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export function ErrorPage({ status = 500, message }: { status?: number; message?: string }) {
  const { t } = useTranslation();
  const defaultMessage =
    status === 404
      ? t('ERROR.NOT_FOUND_TEXT', "The page you're looking for doesn't exist.")
      : status === 403
        ? t('ERROR.FORBIDDEN', 'You do not have permission to access this resource.')
        : t('ERROR.DEFAULT', 'An unexpected error occurred.');

  return (
    <div className="card p-10 max-w-xl mx-auto mt-10 text-center">
      <h1 className="text-3xl font-semibold mb-2">
        {status === 404 ? t('ERROR.PAGE_NOT_FOUND', 'Page not found')
          : status === 403 ? t('ERROR.FORBIDDEN_TITLE', 'Forbidden')
          : `Error ${status}`}
      </h1>
      <p className="text-gray-600 mb-4">{message || defaultMessage}</p>
      <Link to="/" className="btn-primary">
        {t('COMMON.GO_HOME', 'Go home')}
      </Link>
    </div>
  );
}

export function NotFoundPage() {
  return <ErrorPage status={404} />;
}

export function ForbiddenPage() {
  return <ErrorPage status={403} />;
}

export function BlockedProjectPage() {
  const { t } = useTranslation();
  return (
    <div className="card p-10 max-w-xl mx-auto mt-10 text-center">
      <h1 className="text-3xl font-semibold mb-2">
        {t('ERROR.BLOCKED_PROJECT', 'Project is blocked')}
      </h1>
      <p className="text-gray-600 mb-4">
        {t('ERROR.BLOCKED_PROJECT_MESSAGE', 'Access to this project has been temporarily disabled.')}
      </p>
      <Link to="/" className="btn-primary">
        {t('COMMON.GO_HOME', 'Back to home')}
      </Link>
    </div>
  );
}
