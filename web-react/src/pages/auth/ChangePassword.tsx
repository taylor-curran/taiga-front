import { FormEvent, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '@/lib/api';
import { ErrorBox } from '@/components/common/ErrorBox';

export function ChangePasswordPage() {
  const { token } = useParams();
  const [password, setPassword] = useState('');
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await api.post('users/change_password_from_recovery', { token, password });
      setDone(true);
    } catch (err) {
      const detail =
        (err as { response?: { data?: { _error_message?: string } } })?.response?.data
          ?._error_message || 'Could not change password.';
      setError(detail);
    }
  }

  return (
    <>
      <h1 className="text-2xl font-semibold mb-4">Set a new password</h1>
      {done ? (
        <p className="text-sm">
          Password updated. <Link to="/login">Sign in</Link>.
        </p>
      ) : (
        <>
          {error && <div className="mb-4"><ErrorBox message={error} /></div>}
          <form onSubmit={onSubmit} className="space-y-4">
            <label className="block">
              <span className="block text-sm font-medium mb-1">New password</span>
              <input
                className="input"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoFocus
              />
            </label>
            <button className="btn-primary w-full" type="submit">
              Update password
            </button>
          </form>
        </>
      )}
    </>
  );
}
