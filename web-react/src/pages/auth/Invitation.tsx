import { FormEvent, useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { auth as apiAuth } from '@/lib/api';
import { Avatar } from '@/components/common/Avatar';
import { Loading } from '@/components/common/Loading';
import { ErrorBox } from '@/components/common/ErrorBox';
import { SocialLoginButtons } from '@/components/common/SocialLoginButtons';

interface InvitationData {
  id: number;
  project_name: string;
  project_slug: string;
  invited_by: {
    id: number;
    full_name_display: string;
    photo?: string | null;
    username: string;
  };
  email: string;
  role_name: string;
  existing_user?: boolean;
}

export function InvitationPage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const user = useAuth((s) => s.user);
  const setUser = useAuth((s) => s.setUser);

  const [invitation, setInvitation] = useState<InvitationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [acceptError, setAcceptError] = useState<string | null>(null);

  // Login form
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginSubmitting, setLoginSubmitting] = useState(false);

  // Register form
  const [registerForm, setRegisterForm] = useState({
    full_name: '',
    username: '',
    email: '',
    password: '',
    accepted_terms: false,
  });
  const [registerSubmitting, setRegisterSubmitting] = useState(false);

  const [mode, setMode] = useState<'login' | 'register'>('login');

  useEffect(() => {
    if (!token) return;
    api
      .get<InvitationData>(`invitations/${token}`)
      .then((res) => {
        setInvitation(res.data);
        if (res.data.email) {
          setRegisterForm((prev) => ({ ...prev, email: res.data.email }));
        }
      })
      .catch(() => setError('Invalid or expired invitation.'))
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) return <Loading />;
  if (error || !invitation) {
    return (
      <div className="card p-8 max-w-md mx-auto">
        <ErrorBox message={error || 'Invitation not found.'} />
        <Link to="/login" className="btn-primary mt-4 inline-block text-center">
          Go to login
        </Link>
      </div>
    );
  }

  // If already logged in, accept invitation directly
  if (user) {
    return (
      <div className="card p-8 max-w-md mx-auto text-center space-y-4">
        <Avatar
          name={invitation.invited_by.full_name_display}
          src={invitation.invited_by.photo}
          size={64}
        />
        <p className="text-sm">
          <strong>{invitation.invited_by.full_name_display}</strong> invited you to
        </p>
        <p className="text-lg font-semibold">{invitation.project_name}</p>
        <p className="text-sm text-taiga-grey-light">Role: {invitation.role_name}</p>
        {acceptError && <ErrorBox message={acceptError} />}
        <button
          className="btn-primary w-full"
          onClick={async () => {
            setAcceptError(null);
            try {
              await api.post(`memberships/${invitation.id}/accept`, {
                invitation_token: token,
              });
              navigate(`/project/${invitation.project_slug}`);
            } catch {
              setAcceptError('Failed to accept invitation. Please try again.');
            }
          }}
        >
          Accept invitation
        </button>
      </div>
    );
  }

  async function handleLogin(e: FormEvent) {
    e.preventDefault();
    if (!invitation) return;
    setError(null);
    setLoginSubmitting(true);
    try {
      const res = await api.post('auth', {
        type: 'normal',
        username: loginUsername,
        password: loginPassword,
        invitation_token: token,
      });
      const { auth_token, refresh, ...userData } = res.data;
      apiAuth.setTokens(auth_token, refresh);
      setUser(userData);
      navigate(`/project/${invitation.project_slug}`);
    } catch (err) {
      const detail =
        (err as { response?: { data?: { _error_message?: string } } })?.response?.data
          ?._error_message || 'Login failed.';
      setError(detail);
    } finally {
      setLoginSubmitting(false);
    }
  }

  async function handleRegister(e: FormEvent) {
    e.preventDefault();
    if (!invitation) return;
    setError(null);
    setRegisterSubmitting(true);
    try {
      const res = await api.post('auth/register', {
        type: 'public',
        ...registerForm,
        invitation_token: token,
      });
      const { auth_token, refresh, ...userData } = res.data;
      apiAuth.setTokens(auth_token, refresh);
      setUser(userData);
      navigate(`/project/${invitation.project_slug}`);
    } catch (err) {
      const detail =
        (err as { response?: { data?: { _error_message?: string } } })?.response?.data
          ?._error_message || 'Registration failed.';
      setError(detail);
    } finally {
      setRegisterSubmitting(false);
    }
  }

  return (
    <div className="card p-8 max-w-md mx-auto space-y-6">
      <div className="text-center space-y-3">
        <Avatar
          name={invitation.invited_by.full_name_display}
          src={invitation.invited_by.photo}
          size={64}
          className="mx-auto"
        />
        <p className="text-sm">
          <strong>{invitation.invited_by.full_name_display}</strong> invited you to
        </p>
        <p className="text-lg font-semibold">{invitation.project_name}</p>
      </div>

      {error && <ErrorBox message={error} />}

      <div className="flex gap-2 border-b border-taiga-grey-lighter">
        <button
          className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px ${
            mode === 'login'
              ? 'border-taiga-green-dark text-taiga-green-dark'
              : 'border-transparent text-taiga-grey-light'
          }`}
          onClick={() => setMode('login')}
        >
          Sign in
        </button>
        <button
          className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px ${
            mode === 'register'
              ? 'border-taiga-green-dark text-taiga-green-dark'
              : 'border-transparent text-taiga-grey-light'
          }`}
          onClick={() => setMode('register')}
        >
          Create account
        </button>
      </div>

      {mode === 'login' ? (
        <form onSubmit={handleLogin} className="space-y-4">
          <label className="block">
            <span className="block text-sm font-medium mb-1">Username or email</span>
            <input
              className="input"
              value={loginUsername}
              onChange={(e) => setLoginUsername(e.target.value)}
              required
              autoComplete="username"
            />
          </label>
          <label className="block">
            <span className="block text-sm font-medium mb-1">Password</span>
            <input
              className="input"
              type="password"
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </label>
          <button className="btn-primary w-full" type="submit" disabled={loginSubmitting}>
            {loginSubmitting ? 'Signing in...' : 'Sign in & accept'}
          </button>
        </form>
      ) : (
        <form onSubmit={handleRegister} className="space-y-4">
          {(['full_name', 'username', 'email', 'password'] as const).map((field) => (
            <label key={field} className="block">
              <span className="block text-sm font-medium mb-1 capitalize">
                {field.replace('_', ' ')}
              </span>
              <input
                className="input"
                type={field === 'password' ? 'password' : field === 'email' ? 'email' : 'text'}
                value={registerForm[field]}
                onChange={(e) => setRegisterForm({ ...registerForm, [field]: e.target.value })}
                required
              />
            </label>
          ))}
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={registerForm.accepted_terms}
              onChange={(e) =>
                setRegisterForm({ ...registerForm, accepted_terms: e.target.checked })
              }
              required
            />
            I accept the terms of service.
          </label>
          <button className="btn-primary w-full" type="submit" disabled={registerSubmitting}>
            {registerSubmitting ? 'Creating account...' : 'Sign up & accept'}
          </button>
        </form>
      )}

      <SocialLoginButtons invitationToken={token} />
    </div>
  );
}
