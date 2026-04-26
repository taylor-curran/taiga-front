import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { I18nextProvider } from 'react-i18next';
import i18n from './i18n/i18n';
import { ConfigProvider } from './contexts/ConfigContext';
import { AppRoutes } from './routes';
import { useSessionUser } from './hooks/useSessionUser';
import './styles/taiga-port.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, refetchOnWindowFocus: false },
  },
});

function AppShell() {
  const user = useSessionUser();
  return <AppRoutes user={user} />;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <I18nextProvider i18n={i18n}>
        <ConfigProvider>
          <BrowserRouter>
            <AppShell />
          </BrowserRouter>
        </ConfigProvider>
      </I18nextProvider>
    </QueryClientProvider>
  );
}
