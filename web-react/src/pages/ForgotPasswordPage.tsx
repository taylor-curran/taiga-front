import { useState, FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { users } from '../api/resources';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await users.passwordRecovery(email);
      setSent(true);
    } catch {
      setError('Could not send recovery email. Please check the email address.');
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <h2>Forgot Password</h2>
        {sent ? (
          <div className="success-message">
            <p>If an account exists with that email, we've sent recovery instructions.</p>
            <Link to="/login">Back to login</Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="auth-form">
            {error && <div className="auth-error">{error}</div>}
            <div className="form-field">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
              />
            </div>
            <button type="submit" className="btn btn-primary btn-full">Send recovery email</button>
            <div className="auth-links">
              <Link to="/login">Back to login</Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
