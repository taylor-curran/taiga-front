import { Navigate, useParams } from 'react-router-dom';

export function WikiHomeRedirect() {
  const { pslug } = useParams();
  if (!pslug) return <Navigate to="/not-found" replace />;
  return <Navigate to={`/project/${pslug}/wiki/home`} replace />;
}
