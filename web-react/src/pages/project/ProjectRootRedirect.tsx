import { Navigate, useParams } from 'react-router-dom';

/** Mirrors `ProjectRouterController` default: timeline when homepage cannot be resolved. */
export function ProjectRootRedirect() {
  const { pslug } = useParams();
  if (!pslug) return <Navigate to="/not-found" replace />;
  return <Navigate to={`/project/${pslug}/timeline`} replace />;
}
