import { useParams, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { users } from '../api/resources';
import { useEffect, useState } from 'react';

export default function ChangeEmailPage() {
  const { email_token } = useParams<{ email_token: string }>();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'pending' | 'success' | 'error'>('pending');

  const mutation = useMutation({
    mutationFn: () => users.changeEmail({ email_token: email_token! }),
    onSuccess: () => setStatus('success'),
    onError: () => setStatus('error'),
  });

  useEffect(() => {
    if (email_token) {
      mutation.mutate();
    }
  }, [email_token]);

  if (status === 'success') {
    return (
      <div className="auth-page">
        <div className="auth-container">
          <h1>Email Changed</h1>
          <p>Your email address has been updated successfully.</p>
          <button className="btn btn-primary" onClick={() => navigate('/')}>Go to dashboard</button>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="auth-page">
        <div className="auth-container">
          <h1>Invalid Token</h1>
          <p>The email change token is invalid or has expired.</p>
          <button className="btn btn-primary" onClick={() => navigate('/login')}>Go to login</button>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-container">
        <h1>Changing Email...</h1>
        <p>Please wait while we verify your new email address.</p>
      </div>
    </div>
  );
}
