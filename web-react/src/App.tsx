import { useEffect, useState } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from 'react-router-dom';
import { router } from '@/routes';
import { queryClient } from '@/lib/queryClient';
import { loadConfig } from '@/lib/config';
import { useAuth } from '@/lib/auth';

export default function App() {
  const [bootstrapped, setBootstrapped] = useState(false);
  const hydrate = useAuth((s) => s.hydrate);
  const refreshMe = useAuth((s) => s.refreshMe);

  useEffect(() => {
    let cancelled = false;
    async function boot() {
      hydrate();
      await loadConfig();
      // Best-effort refresh of the current user; ignore errors.
      void refreshMe();
      if (!cancelled) setBootstrapped(true);
    }
    void boot();
    return () => {
      cancelled = true;
    };
  }, [hydrate, refreshMe]);

  if (!bootstrapped) {
    return (
      <div className="h-full flex items-center justify-center text-taiga-grey-light">
        Loading…
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  );
}
