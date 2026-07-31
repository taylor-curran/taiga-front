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
          <svg width="80" height="80" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
            <polygon points="100,20 120,60 100,50 80,60" fill="#a5d6a7" opacity="0.8"/>
            <polygon points="100,50 130,70 100,100 70,70" fill="#4db6ac" opacity="0.7"/>
            <polygon points="100,50 70,70 50,50 80,60" fill="#c5e1a5" opacity="0.7"/>
            <polygon points="100,50 130,70 150,50 120,60" fill="#80cbc4" opacity="0.6"/>
            <polygon points="70,70 50,100 100,100" fill="#ce93d8" opacity="0.5"/>
            <polygon points="130,70 150,100 100,100" fill="#9575cd" opacity="0.5"/>
            <polygon points="100,100 50,100 70,130 100,120" fill="#78909c" opacity="0.6"/>
            <polygon points="100,100 150,100 130,130 100,120" fill="#90a4ae" opacity="0.5"/>
            <polygon points="100,120 70,130 80,150 100,140" fill="#b39ddb" opacity="0.5"/>
            <polygon points="100,120 130,130 120,150 100,140" fill="#a1887f" opacity="0.4"/>
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
