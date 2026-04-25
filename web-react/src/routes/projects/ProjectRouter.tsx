import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useProjectBySlug } from '../../api/resources';
import { Loader } from '../../components/Loader';

// AngularJS ProjectRouter sends the user to the project's default landing
// section (timeline/backlog/kanban/issues/wiki).
export default function ProjectRouter() {
  const { pslug } = useParams();
  const { data: project } = useProjectBySlug(pslug);
  const nav = useNavigate();
  useEffect(() => {
    if (!project) return;
    let target = `/project/${pslug}/timeline`;
    if (project.is_backlog_activated) target = `/project/${pslug}/backlog`;
    else if (project.is_kanban_activated) target = `/project/${pslug}/kanban`;
    else if (project.is_issues_activated) target = `/project/${pslug}/issues`;
    else if (project.is_wiki_activated) target = `/project/${pslug}/wiki/home`;
    nav(target, { replace: true });
  }, [project, pslug, nav]);
  return <Loader label="Opening project…" />;
}
