import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import LegacyFrame from './LegacyFrame';

/**
 * React shell: mirrors Angular `$routeProvider` paths (see `app/coffee/app.coffee`)
 * by loading the Gulp-built app under `/legacy/` in a full-viewport iframe.
 */
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LegacyFrame />} />
        <Route path="/discover" element={<LegacyFrame />} />
        <Route path="/discover/search" element={<LegacyFrame />} />
        <Route path="/projects/*" element={<LegacyFrame />} />
        <Route path="/project/new/*" element={<LegacyFrame />} />
        <Route path="/project/:pslug/*" element={<LegacyFrame />} />
        <Route path="/user-settings/*" element={<LegacyFrame />} />
        <Route path="/change-email/:email_token" element={<LegacyFrame />} />
        <Route path="/verify-email/:email_token" element={<LegacyFrame />} />
        <Route path="/cancel-account/:cancel_token" element={<LegacyFrame />} />
        <Route path="/profile/*" element={<LegacyFrame />} />
        <Route path="/notifications" element={<LegacyFrame />} />
        <Route path="/login" element={<LegacyFrame />} />
        <Route path="/register" element={<LegacyFrame />} />
        <Route path="/forgot-password" element={<LegacyFrame />} />
        <Route path="/change-password/:token" element={<LegacyFrame />} />
        <Route path="/invitation/:token" element={<LegacyFrame />} />
        <Route path="/external-apps" element={<LegacyFrame />} />
        <Route path="/blocked-project/:pslug/*" element={<LegacyFrame />} />
        <Route path="/error" element={<LegacyFrame />} />
        <Route path="/not-found" element={<LegacyFrame />} />
        <Route path="/permission-denied" element={<LegacyFrame />} />
        <Route path="*" element={<Navigate to="/not-found" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
