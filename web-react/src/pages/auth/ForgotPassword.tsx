import { FormEvent, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '@/lib/api';
import { ErrorBox } from '@/components/common/ErrorBox';

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await api.post('users/password_recovery', { username: email });
      setDone(true);
    } catch (err) {
      const detail =
        (err as { response?: { data?: { _error_message?: string } } })?.response?.data
          ?._error_message || 'Could not start recovery.';
      setError(detail);
    }
  }

  return (
    <>
      <h1 className="text-2xl font-semibold mb-4">Forgot your password?</h1>
      {done ? (
        <p className="text-sm">
          If an account exists for <span className="font-mono">{email}</span>, we've sent
          you password recovery instructions.
        </p>
      ) : (
        <>
          {error && <div className="mb-4"><ErrorBox message={error} /></div>}
          <form onSubmit={onSubmit} className="space-y-4">
            <label className="block">
              <span className="block text-sm font-medium mb-1">Username or email</span>
              <input
                className="input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
              />
            </label>
            <button className="btn-primary w-full" type="submit">
              Send recovery link
            </button>
          </form>
        </>
      )}
      <div className="mt-6 text-sm text-center">
        <Link to="/login">Back to sign in</Link>
      </div>
    </>
  );
}
