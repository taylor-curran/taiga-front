import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { api, ApiError } from '@/api/client';
import { useAuth } from '@/auth/store';

interface FormValues {
  username: string;
  password: string;
}

interface InvitationData {
  project_name: string;
  project_slug: string;
  existing_user: boolean;
  full_name: string;
  email: string;
}

export default function Invitation() {
  const { token } = useParams();
  const navigate = useNavigate();
  const login = useAuth((s) => s.login);
  const [error, setError] = useState<string | null>(null);
  const [invitation, setInvitation] = useState<InvitationData | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ mode: 'onTouched' });

  useEffect(() => {
    if (!token) return;
    api
      .get<InvitationData>(`invitations/${token}`)
      .then((data) => setInvitation(data))
      .catch(() => {
        setError('Invitation not found');
        navigate('/login');
      });
  }, [token, navigate]);

  const onSubmit = handleSubmit(async (values) => {
    setError(null);
    try {
      await login(values);
      if (invitation) navigate(`/project/${invitation.project_slug}/timeline`);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not accept invitation');
    }
  });

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Invitation</h1>
        {invitation ? (
          <p className="tagline">
            You've been invited to <strong>{invitation.project_name}</strong>.
          </p>
        ) : (
          <p className="tagline">Loading invitation…</p>
        )}
        {error && <div className="banner banner-error">{error}</div>}
        <form onSubmit={onSubmit} noValidate data-testid="invitation-form">
          <fieldset>
            <label>Username</label>
            <input {...register('username', { required: true })} aria-invalid={Boolean(errors.username)} />
          </fieldset>
          <fieldset>
            <label>Password</label>
            <input type="password" {...register('password', { required: true })} />
          </fieldset>
          <fieldset className="end" style={{ marginTop: '0.8rem' }}>
            <button className="btn" style={{ width: '100%', justifyContent: 'center' }}>
              Accept invitation
            </button>
          </fieldset>
        </form>
      </div>
    </div>
  );
}
