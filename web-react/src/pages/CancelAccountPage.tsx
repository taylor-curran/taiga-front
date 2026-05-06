import { useParams, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { users } from '../api/resources';
import { useAuthStore } from '../stores/auth';
import { useState } from 'react';

export default function CancelAccountPage() {
  const { cancel_token } = useParams<{ cancel_token: string }>();
  const navigate = useNavigate();
  const logout = useAuthStore((s) => s.logout);
  const [status, setStatus] = useState<'confirm' | 'success' | 'error'>('confirm');

  const mutation = useMutation({
    mutationFn: () => users.cancelAccount({ cancel_token: cancel_token! }),
    onSuccess: () => {
      logout();
      setStatus('success');
    },
    onError: () => setStatus('error'),
  });

  if (status === 'success') {
    return (
      <div className="auth-page">
        <div className="auth-container">
          <h1>Account Cancelled</h1>
          <p>Your account has been permanently deleted.</p>
          <button className="btn btn-primary" onClick={() => navigate('/login')}>Go to login</button>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="auth-page">
        <div className="auth-container">
          <h1>Error</h1>
          <p>The cancellation token is invalid or has expired.</p>
          <button className="btn btn-primary" onClick={() => navigate('/')}>Go to dashboard</button>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-container">
        <h1>Cancel Account</h1>
        <p>Are you sure you want to permanently delete your account? This action cannot be undone.</p>
        <div className="transfer-actions">
          <button
            className="btn btn-danger"
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending}
          >
            {mutation.isPending ? 'Cancelling...' : 'Yes, delete my account'}
          </button>
          <button className="btn btn-secondary" onClick={() => navigate('/')}>
            No, go back
          </button>
        </div>
      </div>
    </div>
  );
}
