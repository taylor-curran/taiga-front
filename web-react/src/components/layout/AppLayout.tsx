import { Outlet } from 'react-router-dom';
import Header from './Header';

export default function AppLayout() {
  return (
    <div className="app-layout">
      <Header />
      <main className="app-content">
        <Outlet />
      </main>
    </div>
  );
}
