import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '@/lib/api';

interface TokenLandingProps {
  endpoint: string;
  paramKey: string;
  successTitle: string;
  successMessage: string;
}

/** Generic landing page for /change-email/:token, /verify-email/:token,
 *  /cancel-account/:token, /invitation/:token. Hits the backend with the token
 *  and shows success/failure. */
export function TokenLandingPage({
  endpoint,
  paramKey,
  successTitle,
  successMessage,
}: TokenLandingProps) {
  const params = useParams();
  const token = params[paramKey] || params.token || params.email_token || params.cancel_token;
  const [state, setState] = useState<'pending' | 'ok' | 'err'>('pending');
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function run() {
      try {
        await api.post(endpoint, { token });
        if (!cancelled) setState('ok');
      } catch (err) {
        const detail =
          (err as { response?: { data?: { _error_message?: string } } })?.response?.data
            ?._error_message || 'The token is invalid or has expired.';
        if (!cancelled) {
          setState('err');
          setMessage(detail);
        }
      }
    }
    void run();
    return () => {
      cancelled = true;
    };
  }, [endpoint, token]);

  return (
    <>
      {state === 'pending' && <p>Working…</p>}
      {state === 'ok' && (
        <>
          <h1 className="text-2xl font-semibold mb-4">{successTitle}</h1>
          <p className="text-sm">{successMessage}</p>
          <p className="mt-4 text-sm"><Link to="/">Continue</Link></p>
        </>
      )}
      {state === 'err' && (
        <>
          <h1 className="text-2xl font-semibold mb-4">Something went wrong</h1>
          <p className="text-sm">{message}</p>
        </>
      )}
    </>
  );
}
