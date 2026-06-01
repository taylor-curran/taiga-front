import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './auth.scss';

export default function InvitationPage() {
  const { t } = useTranslation();
  const { token } = useParams<{ token: string }>();

  return (
    <div className="auth-page">
      <div className="auth-box">
        <h1 className="auth-title">{t('INVITATION.TITLE')}</h1>
        <p className="auth-text">Invitation token: {token}</p>
        <p className="auth-text">{t('INVITATION.DESCRIPTION')}</p>
      </div>
    </div>
  );
}
