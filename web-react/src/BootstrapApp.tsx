import { useEffect, useState } from 'react';
import App from './App';
import { loadConf } from './lib/conf';
import { useAuthStore } from './auth/authStore';

export function BootstrapApp() {
  const [ready, setReady] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    useAuthStore.getState().hydrateFromStorage();
    loadConf()
      .then(() => setReady(true))
      .catch(() => setErr('Could not load conf.json'));
  }, []);

  if (err) {
    return (
      <div style={{ padding: '2rem', fontFamily: 'system-ui' }}>
        <p>{err}</p>
        <p>Ensure the dev server can proxy /conf.json to Taiga.</p>
      </div>
    );
  }

  if (!ready) {
    return (
      <div style={{ padding: '2rem', fontFamily: 'system-ui' }} role="status">
        Loading…
      </div>
    );
  }

  return <App />;
}
