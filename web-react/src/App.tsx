import { useEffect, useState } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from 'react-router-dom';
import { router } from '@/routes';
import { queryClient } from '@/lib/queryClient';
import { loadConfig } from '@/lib/config';
import { useAuth } from '@/lib/auth';
import { initI18n } from '@/lib/i18n';
import { ToastContainer } from '@/components/common/Toast';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';

export default function App() {
  const [bootstrapped, setBootstrapped] = useState(false);
  const hydrate = useAuth((s) => s.hydrate);
  const refreshMe = useAuth((s) => s.refreshMe);

  useEffect(() => {
    let cancelled = false;
    async function boot() {
      hydrate();
      await Promise.all([loadConfig(), initI18n()]);
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
      <div className="h-full flex items-center justify-center text-gray-600">
        Loading\u2026
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
        <ToastContainer />
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
