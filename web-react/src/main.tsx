import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App';
import { loadConfig } from './api/config';
import { setUnauthorizedHandler } from './api/client';
import { useAuth } from './auth/store';
import './styles/global.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, refetchOnWindowFocus: false, staleTime: 30_000 },
  },
});

loadConfig().finally(() => {
  useAuth.getState().hydrate();
  setUnauthorizedHandler(() => {
    const { user, logout } = useAuth.getState();
    if (user) {
      logout();
      const next = window.location.pathname + window.location.search;
      window.location.href = `/login?unauthorized=true&next=${encodeURIComponent(next)}`;
    }
  });

  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </QueryClientProvider>
    </React.StrictMode>,
  );
});
