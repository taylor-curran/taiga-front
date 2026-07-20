import { useEffect } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { loadApiBaseFromConf } from './api/config';
import { installFixtureApiInterceptor } from './api/installApiInterceptor';
import { FixtureBanner } from './components/FixtureBanner';
import { AdminLayout } from './layout/AdminLayout';
import { AdminMembershipsPage } from './pages/AdminMembershipsPage';
import { AdminRolesPage } from './pages/AdminRolesPage';
import { HomePage } from './pages/HomePage';
import { ProjectsListingPage } from './pages/ProjectsListingPage';

if (import.meta.env.VITE_USE_DB_JSON) {
  installFixtureApiInterceptor();
}

function AppRoutes() {
  useEffect(() => {
    void loadApiBaseFromConf();
  }, []);

  return (
    <>
      <FixtureBanner />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/projects" element={<ProjectsListingPage />} />
        <Route path="/projects/" element={<ProjectsListingPage />} />
        <Route path="/project/:projectSlug/admin/memberships" element={<AdminLayout section="memberships" />}>
          <Route index element={<AdminMembershipsPage />} />
        </Route>
        <Route path="/project/:projectSlug/admin/roles" element={<AdminLayout section="roles" />}>
          <Route index element={<AdminRolesPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}
