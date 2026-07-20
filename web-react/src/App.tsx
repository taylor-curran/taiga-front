import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AdminHistoryPage } from './admin/AdminHistoryPage';
import './styles/taiga-theme.css';
import './styles/admin-history.css';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/admin/history/us/1" replace />} />
        <Route path="/admin/history/:contentType/:objectId" element={<AdminHistoryPage />} />
      </Routes>
    </BrowserRouter>
  );
}
