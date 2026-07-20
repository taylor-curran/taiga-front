import { Outlet } from 'react-router';
import { AppHeader } from './AppHeader';
import './shell.css';

export default function ShellLayout() {
  return (
    <div className="app-shell app-shell--simple" data-testid="shell-layout">
      <AppHeader />
      <main className="app-shell__main app-shell__main--padded" data-testid="shell-outlet">
        <Outlet />
      </main>
    </div>
  );
}
