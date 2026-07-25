import { FormEvent, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../api/auth';

export default function ForgotPassword() {
  const { forgotPassword, loading } = useAuth();
  const [username, setUsername] = useState('');
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await forgotPassword({ username });
      setDone(true);
    } catch (err: unknown) {
      const ax = err as { response?: { data?: { _error_message?: string } } };
      setError(ax?.response?.data?._error_message || 'Could not send recovery email.');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-taiga-50 to-white p-6">
      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-md">
        <Link to="/login" className="text-sm text-taiga-700">← Back to sign in</Link>
        <h1 className="mt-3 text-2xl font-bold text-slate-800">Forgot your password?</h1>
        <p className="mt-1 text-sm text-slate-500">Enter your username or email and we&rsquo;ll send you instructions to reset it.</p>
        {done ? (
          <div className="mt-6 rounded border border-taiga-200 bg-taiga-50 p-4 text-sm text-taiga-800">
            If the user exists, a recovery email has been sent. Check your inbox.
          </div>
        ) : (
          <form className="mt-6 space-y-4" onSubmit={onSubmit}>
            <div>
              <label className="label" htmlFor="username">Username or email</label>
              <input
                id="username"
                required
                className="input"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            {error && <div className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
            <button className="btn-primary w-full" disabled={loading} type="submit">
              {loading ? 'Sending…' : 'Send instructions'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
