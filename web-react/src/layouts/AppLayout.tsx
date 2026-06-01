// Main app shell layout — nav bar + content area
// Mirrors the legacy navigation-bar module

import { Outlet } from 'react-router-dom';
import { Suspense } from 'react';
import { NavigationBar } from './NavigationBar';
import { Loader } from '../components/Loader';
import './AppLayout.scss';

interface AppLayoutProps {
  hideHeader?: boolean;
}

export function AppLayout({ hideHeader }: AppLayoutProps) {
  return (
    <div className="app-layout">
      {!hideHeader && <NavigationBar />}
      <main className="app-layout-content">
        <Suspense fallback={<Loader />}>
          <Outlet />
        </Suspense>
      </main>
    </div>
  );
}
