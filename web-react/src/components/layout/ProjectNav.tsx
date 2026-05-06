import { NavLink, useParams } from 'react-router-dom';
import type { Project } from '../../types';

interface Props {
  project: Project;
}

export default function ProjectNav({ project }: Props) {
  const { pslug } = useParams<{ pslug: string }>();
  const base = `/project/${pslug}`;

  return (
    <nav className="project-nav">
      <div className="project-nav-header">
        <div className="project-logo">
          {project.logo_small_url ? (
            <img src={project.logo_small_url} alt={project.name} />
          ) : (
            <div className="project-logo-placeholder">
              {project.name.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
        <div className="project-name-container">
          <h2 className="project-name">{project.name}</h2>
        </div>
      </div>
      <ul className="project-nav-links">
        <li>
          <NavLink to={`${base}/timeline`} className={({ isActive }) => isActive ? 'active' : ''}>
            Timeline
          </NavLink>
        </li>
        {project.is_epics_activated && (
          <li>
            <NavLink to={`${base}/epics`} className={({ isActive }) => isActive ? 'active' : ''}>
              Epics
            </NavLink>
          </li>
        )}
        {project.is_backlog_activated && (
          <li>
            <NavLink to={`${base}/backlog`} className={({ isActive }) => isActive ? 'active' : ''}>
              Backlog
            </NavLink>
          </li>
        )}
        {project.is_kanban_activated && (
          <li>
            <NavLink to={`${base}/kanban`} className={({ isActive }) => isActive ? 'active' : ''}>
              Kanban
            </NavLink>
          </li>
        )}
        {project.is_issues_activated && (
          <li>
            <NavLink to={`${base}/issues`} className={({ isActive }) => isActive ? 'active' : ''}>
              Issues
            </NavLink>
          </li>
        )}
        {project.is_wiki_activated && (
          <li>
            <NavLink to={`${base}/wiki/home`} className={({ isActive }) => isActive ? 'active' : ''}>
              Wiki
            </NavLink>
          </li>
        )}
        <li>
          <NavLink to={`${base}/team`} className={({ isActive }) => isActive ? 'active' : ''}>
            Team
          </NavLink>
        </li>
        <li>
          <NavLink to={`${base}/search`} className={({ isActive }) => isActive ? 'active' : ''}>
            Search
          </NavLink>
        </li>
      </ul>
      {project.i_am_admin && (
        <div className="project-nav-admin">
          <NavLink to={`${base}/admin/project-profile/details`} className={({ isActive }) => isActive ? 'active' : ''}>
            Admin
          </NavLink>
        </div>
      )}
    </nav>
  );
}
