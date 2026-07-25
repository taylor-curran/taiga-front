import { Outlet, useLocation } from 'react-router-dom';
import { NavBar } from './NavBar';

const HEADERLESS = [
  '/login',
  '/register',
  '/forgot-password',
  '/change-password',
  '/invitation',
  '/external-apps',
];

export function AppLayout() {
  const loc = useLocation();
  const hide = HEADERLESS.some((p) => loc.pathname === p || loc.pathname.startsWith(p + '/'));
  return (
    <div className="flex min-h-screen flex-col">
      {!hide && <NavBar />}
      <Outlet />
    </div>
  );
}
