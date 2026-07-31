import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/auth';
import api from '../api/client';
import Loader from '../components/common/Loader';

export default function InvitationPage() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    if (!isAuthenticated()) {
      navigate(`/login?next=/invitation/${token}`);
      return;
    }

    api.post('/memberships', { token })
      .then(() => {
        navigate('/');
      })
      .catch(() => {
        setError('Invalid or expired invitation token.');
        setLoading(false);
      });
  }, [token, navigate, isAuthenticated]);

  if (loading) return <Loader />;

  return (
    <div className="error-page">
      <h1>Invitation Error</h1>
      <p>{error}</p>
    </div>
  );
}
