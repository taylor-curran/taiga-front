import { useState, FormEvent } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { users } from '../api/resources';

export default function ChangePasswordPage() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await users.changePasswordFromRecovery({ token: token || '', password });
      navigate('/login');
    } catch {
      setError('Failed to change password. The link may have expired.');
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <h2>Change Password</h2>
        <form onSubmit={handleSubmit} className="auth-form">
          {error && <div className="auth-error">{error}</div>}
          <div className="form-field">
            <label htmlFor="password">New password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoFocus
            />
          </div>
          <button type="submit" className="btn btn-primary btn-full">Change password</button>
        </form>
      </div>
    </div>
  );
}
