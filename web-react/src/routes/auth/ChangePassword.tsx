import { FormEvent, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../api/auth';
import { toast } from '../../components/Toast';

export default function ChangePassword() {
  const { token } = useParams();
  const { changePasswordFromRecovery, loading } = useAuth();
  const nav = useNavigate();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match');
      return;
    }
    try {
      await changePasswordFromRecovery({ token: token!, password });
      toast.success('Password updated. You can now sign in.');
      nav('/login');
    } catch (err: unknown) {
      const ax = err as { response?: { data?: { _error_message?: string } } };
      setError(ax?.response?.data?._error_message || 'Could not change password.');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-taiga-50 to-white p-6">
      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-md">
        <Link to="/login" className="text-sm text-taiga-700">← Back to sign in</Link>
        <h1 className="mt-3 text-2xl font-bold text-slate-800">Set a new password</h1>
        <form className="mt-6 space-y-4" onSubmit={onSubmit}>
          <div>
            <label className="label" htmlFor="password">New password</label>
            <input
              id="password"
              type="password"
              required
              className="input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div>
            <label className="label" htmlFor="confirm">Confirm password</label>
            <input
              id="confirm"
              type="password"
              required
              className="input"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
            />
          </div>
          {error && <div className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
          <button className="btn-primary w-full" disabled={loading} type="submit">
            {loading ? 'Updating…' : 'Update password'}
          </button>
        </form>
      </div>
    </div>
  );
}
