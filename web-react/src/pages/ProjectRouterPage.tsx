import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProject } from '../hooks/useProject';
import Loader from '../components/common/Loader';

export default function ProjectRouterPage() {
  const { pslug } = useParams<{ pslug: string }>();
  const { data: project, isLoading, error } = useProject(pslug);
  const navigate = useNavigate();

  useEffect(() => {
    if (!project) return;
    if (project.is_backlog_activated) {
      navigate(`/project/${pslug}/backlog`, { replace: true });
    } else if (project.is_kanban_activated) {
      navigate(`/project/${pslug}/kanban`, { replace: true });
    } else {
      navigate(`/project/${pslug}/timeline`, { replace: true });
    }
  }, [project, pslug, navigate]);

  if (isLoading) return <Loader />;
  if (error) return <div className="error-page"><h1>Project not found</h1></div>;
  return <Loader />;
}
