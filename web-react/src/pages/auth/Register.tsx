import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { auth as apiAuth } from '@/lib/api';
import { ErrorBox } from '@/components/common/ErrorBox';
import { SocialLoginButtons } from '@/components/common/SocialLoginButtons';

export function RegisterPage() {
  const navigate = useNavigate();
  const setUser = useAuth((s) => s.setUser);
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    full_name: '',
    accepted_terms: false,
  });
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await api.post('auth/register', {
        type: 'public',
        ...form,
      });
      const { auth_token, refresh, ...user } = res.data;
      apiAuth.setTokens(auth_token, refresh);
      setUser(user);
      navigate('/');
    } catch (err) {
      const detail =
        (err as { response?: { data?: { _error_message?: string } } })?.response?.data
          ?._error_message || 'Could not create account.';
      setError(detail);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <h1 className="text-2xl font-semibold mb-6">Create your account</h1>
      {error && <div className="mb-4"><ErrorBox message={error} /></div>}
      <form onSubmit={onSubmit} className="space-y-4">
        {(['full_name', 'username', 'email', 'password'] as const).map((field) => (
          <label key={field} className="block">
            <span className="block text-sm font-medium mb-1 capitalize">
              {field.replace('_', ' ')}
            </span>
            <input
              className="input"
              type={field === 'password' ? 'password' : field === 'email' ? 'email' : 'text'}
              value={form[field] as string}
              onChange={(e) => setForm({ ...form, [field]: e.target.value })}
              required
            />
          </label>
        ))}
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.accepted_terms}
            onChange={(e) => setForm({ ...form, accepted_terms: e.target.checked })}
            required
          />
          I accept the terms of service.
        </label>
        <button className="btn-primary w-full" type="submit" disabled={submitting}>
          {submitting ? 'Creating account…' : 'Sign up'}
        </button>
      </form>
      <SocialLoginButtons />
      <div className="mt-6 text-sm text-center">
        Already have an account? <Link to="/login">Sign in</Link>
      </div>
    </>
  );
}
