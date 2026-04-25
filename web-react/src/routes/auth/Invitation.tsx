import { FormEvent, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api, apiError } from '../../api/client';
import { useAuth } from '../../api/auth';
import { toast } from '../../components/Toast';

interface Invitation {
  project_name: string;
  project_slug: string;
  role_name?: string;
  existing_user?: boolean;
}

export default function InvitationPage() {
  const { token } = useParams();
  const nav = useNavigate();
  const { user } = useAuth();
  const [invitation, setInvitation] = useState<Invitation | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!token) return;
    api()
      .get<Invitation>(`invitations/${token}`)
      .then((r) => setInvitation(r.data))
      .catch((e) => setError(apiError(e).data?._error_message || 'Invalid invitation'));
  }, [token]);

  const accept = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      const payload: Record<string, unknown> = { token, type: invitation?.existing_user ? 'normal' : 'public' };
      if (invitation?.existing_user) {
        payload.username = username;
        payload.password = password;
      } else {
        payload.username = username;
        payload.password = password;
        payload.full_name = fullName;
        payload.email = email;
      }
      const res = await api().post('auth', payload);
      // Persist the auth result the same way useAuth.login does.
      localStorage.setItem('token', JSON.stringify(res.data.auth_token));
      if (res.data.refresh) localStorage.setItem('refresh', JSON.stringify(res.data.refresh));
      localStorage.setItem('userInfo', JSON.stringify(res.data));
      toast.success(`Welcome to ${invitation?.project_name}!`);
      nav(`/project/${invitation?.project_slug}/`);
    } catch (err) {
      setError(apiError(err).data?._error_message || 'Failed to accept invitation');
    } finally {
      setBusy(false);
    }
  };

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6">
        <div className="max-w-md rounded bg-white p-6 shadow">
          <h1 className="text-lg font-semibold text-red-700">{error}</h1>
          <Link to="/login" className="mt-3 inline-block text-sm text-taiga-700">Go to sign in</Link>
        </div>
      </div>
    );
  }
  if (!invitation) return <div className="p-12 text-center text-slate-500">Loading invitation…</div>;
  if (user) {
    // Already authenticated — accept by joining via API and redirect.
    void api().post(`invitations/${token}/accept`).finally(() => nav(`/project/${invitation.project_slug}/`));
    return <div className="p-12 text-center text-slate-500">Joining {invitation.project_name}…</div>;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-taiga-50 to-white p-6">
      <form onSubmit={accept} className="w-full max-w-md rounded-xl bg-white p-8 shadow-md">
        <h1 className="text-2xl font-bold text-slate-800">You&rsquo;ve been invited to {invitation.project_name}</h1>
        <p className="mt-1 text-sm text-slate-500">
          {invitation.existing_user ? 'Sign in to accept the invitation.' : 'Create an account to accept the invitation.'}
        </p>
        <div className="mt-6 space-y-4">
          <div>
            <label className="label" htmlFor="username">Username</label>
            <input id="username" required className="input" value={username} onChange={(e) => setUsername(e.target.value)} />
          </div>
          {!invitation.existing_user && (
            <>
              <div>
                <label className="label" htmlFor="email">Email</label>
                <input id="email" type="email" required className="input" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div>
                <label className="label" htmlFor="fullName">Full name</label>
                <input id="fullName" required className="input" value={fullName} onChange={(e) => setFullName(e.target.value)} />
              </div>
            </>
          )}
          <div>
            <label className="label" htmlFor="password">Password</label>
            <input id="password" type="password" required className="input" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
        </div>
        <button className="btn-primary mt-6 w-full" disabled={busy}>
          {busy ? 'Working…' : invitation.existing_user ? 'Sign in & accept' : 'Create account & accept'}
        </button>
      </form>
    </div>
  );
}
