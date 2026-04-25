import { Outlet, useParams } from 'react-router-dom';
import { useProject } from '../../hooks/useProject';
import ProjectNav from './ProjectNav';
import Loader from '../common/Loader';

export default function ProjectLayout() {
  const { pslug } = useParams<{ pslug: string }>();
  const { data: project, isLoading, error } = useProject(pslug);

  if (isLoading) return <Loader />;
  if (error || !project) {
    return (
      <div className="error-page">
        <h1>Project not found</h1>
        <p>The project "{pslug}" could not be loaded.</p>
      </div>
    );
  }

  return (
    <div className="project-layout">
      <ProjectNav project={project} />
      <main className="project-content">
        <Outlet context={{ project }} />
      </main>
    </div>
  );
}
