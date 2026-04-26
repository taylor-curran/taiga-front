import { Outlet } from 'react-router';
import { AppHeader } from './AppHeader';
import './shell.css';

export default function AuthLayout() {
  return (
    <div className="app-shell app-shell--simple" data-testid="auth-layout">
      <AppHeader />
      <main className="app-shell__main app-shell__main--centered" data-testid="auth-outlet">
        <Outlet />
      </main>
    </div>
  );
}
