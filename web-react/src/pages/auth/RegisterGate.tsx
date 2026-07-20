import { Navigate } from 'react-router-dom';
import { useTaigaConfig } from '../../contexts/ConfigContext';
import { PlaceholderPage } from '../PlaceholderPage';

export function RegisterGate() {
  const c = useTaigaConfig();
  if (!c.publicRegisterEnabled) {
    return <Navigate to="/not-found" replace />;
  }
  return <PlaceholderPage titleKey="REGISTER.PAGE_TITLE" />;
}
