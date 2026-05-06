import { useState, FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { auth } from '../api/resources';
import { useAuthStore } from '../stores/auth';

export default function RegisterPage() {
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { setUser } = useAuthStore();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await auth.register({
        full_name: fullName,
        username,
        email,
        password,
        accepted_terms: true,
      });
      setUser(res.data);
      navigate('/', { replace: true });
    } catch {
      setError('Registration failed. Please check the form and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-logo">
          <svg width="90" height="90" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="40" y="130" width="120" height="24" rx="6" fill="url(#crownGradR)" />
            <rect x="44" y="134" width="112" height="16" rx="4" fill="none" stroke="#FFD700" strokeWidth="1" opacity="0.4" />
            <path d="M40 130 L30 70 L65 100 L100 50 L135 100 L170 70 L160 130 Z" fill="url(#crownGradR)" />
            <path d="M50 125 L42 82 L65 100" fill="none" stroke="#FFD700" strokeWidth="1.5" opacity="0.5" />
            <path d="M150 125 L158 82 L135 100" fill="none" stroke="#FFD700" strokeWidth="1.5" opacity="0.5" />
            <circle cx="100" cy="58" r="7" fill="#FFD700" />
            <circle cx="100" cy="58" r="4" fill="#FFF3B0" opacity="0.8" />
            <circle cx="65" cy="105" r="5" fill="#FF6EB4" />
            <circle cx="135" cy="105" r="5" fill="#FF6EB4" />
            <circle cx="35" cy="75" r="4" fill="#E91E8C" />
            <circle cx="165" cy="75" r="4" fill="#E91E8C" />
            <circle cx="70" cy="142" r="4" fill="#FFD700" opacity="0.7" />
            <circle cx="100" cy="142" r="5" fill="#FF6EB4" />
            <circle cx="130" cy="142" r="4" fill="#FFD700" opacity="0.7" />
            <defs>
              <linearGradient id="crownGradR" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FF6EB4" />
                <stop offset="50%" stopColor="#E91E8C" />
                <stop offset="100%" stopColor="#D63384" />
              </linearGradient>
            </defs>
          </svg>
          <h1>Taiga</h1>
        </div>
        <p className="auth-tagline">Love your project</p>
        <form onSubmit={handleSubmit} className="auth-form">
          <h2>Register</h2>
          {error && <div className="auth-error">{error}</div>}
          <div className="form-field">
            <label htmlFor="fullName">Full name</label>
            <input id="fullName" type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} required placeholder="Full name" />
          </div>
          <div className="form-field">
            <label htmlFor="reg-username">Username</label>
            <input id="reg-username" type="text" value={username} onChange={(e) => setUsername(e.target.value)} required placeholder="Username" />
          </div>
          <div className="form-field">
            <label htmlFor="reg-email">Email</label>
            <input id="reg-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="Email" />
          </div>
          <div className="form-field">
            <label htmlFor="reg-password">Password</label>
            <input id="reg-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="Password" />
          </div>
          <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
            {loading ? 'Registering...' : 'Register'}
          </button>
          <div className="auth-links">
            <Link to="/login">Already have an account? Sign in</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
