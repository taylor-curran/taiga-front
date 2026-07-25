import { useEffect, useState } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { AppRouter } from './router';
import { loadConfig } from './api/config';
import { useAuth } from './api/auth';
import { events } from './api/events';
import { queryClient } from './api/queryClient';
import { ToastsHost } from './components/Toast';
import { Loader } from './components/Loader';

export default function App() {
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hydrate = useAuth((s) => s.hydrate);

  useEffect(() => {
    let cancelled = false;
    loadConfig()
      .then(() => {
        if (cancelled) return;
        hydrate();
        events.start();
        setReady(true);
      })
      .catch((e) => setError(`Failed to load config: ${e?.message || String(e)}`));
    return () => {
      cancelled = true;
      events.destroy();
    };
  }, [hydrate]);

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center p-12 text-center">
        <div>
          <h1 className="text-xl font-semibold text-red-700">{error}</h1>
          <p className="mt-2 text-sm text-slate-500">
            Make sure the Taiga gateway is reachable on its configured port.
          </p>
        </div>
      </div>
    );
  }
  if (!ready) return <Loader label="Starting Taiga…" />;

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AppRouter />
        <ToastsHost />
      </BrowserRouter>
    </QueryClientProvider>
  );
}
