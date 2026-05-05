import { NavLink, useParams } from 'react-router-dom';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { milestones as milestonesApi } from '../../api/resources';
import type { Project, Milestone } from '../../types';

interface Props {
  project: Project;
}

function NavIcon({ d }: { d: string }) {
  return (
    <svg
      className="nav-icon"
      width={16}
      height={16}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d={d} />
    </svg>
  );
}

const ICONS = {
  timeline: 'M3 6h18M3 12h18M3 18h18',
  epic: 'M12 2l3 7h7l-5.5 4 2 8-6.5-5-6.5 5 2-8L2 9h7z',
  scrum: 'M3 5h18v4H3zM3 11h18v4H3zM3 17h18v4H3z',
  kanban: 'M3 4h4v16H3zM10 4h4v10h-4zM17 4h4v7h-4z',
  issues: 'M12 22s8-7 8-13a8 8 0 1 0-16 0c0 6 8 13 8 13z',
  wiki: 'M4 4h12a4 4 0 0 1 4 4v12H8a4 4 0 0 1-4-4z',
  team: 'M17 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2 M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
  search: 'M21 21l-4.35-4.35M11 18a7 7 0 1 1 0-14 7 7 0 0 1 0 14z',
  admin: 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z M19.4 15a7.97 7.97 0 0 0 .1-2.94l2-1.5-2-3.5-2.4 1a8 8 0 0 0-2.5-1.4L14 4h-4l-.6 2.66a8 8 0 0 0-2.5 1.4l-2.4-1-2 3.5 2 1.5a8 8 0 0 0 0 2.94l-2 1.5 2 3.5 2.4-1a8 8 0 0 0 2.5 1.4L10 22h4l.6-2.66a8 8 0 0 0 2.5-1.4l2.4 1 2-3.5z',
};

export default function ProjectNav({ project }: Props) {
  const { pslug } = useParams<{ pslug: string }>();
  const base = `/project/${pslug}`;
  const [collapsed, setCollapsed] = useState(false);
  const [scrumOpen, setScrumOpen] = useState(true);

  const { data: sprints } = useQuery({
    queryKey: ['nav-milestones', project.id],
    queryFn: async () => {
      const res = await milestonesApi.list(project.id, { order_by: '-estimated_start' });
      return res.data as Milestone[];
    },
    enabled: project.is_backlog_activated,
  });

  return (
    <tg-project-navigation
      className={`project-nav main-nav${collapsed ? ' collapsed' : ''}`}
    >
      <div className="project-nav-header">
        <div className="project-logo">
          {project.logo_small_url ? (
            <img src={project.logo_small_url} alt={project.name} />
          ) : (
            <div className="project-logo-placeholder" style={{ backgroundColor: '#4c566a' }}>
              {project.name.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
        <div className="project-name-container">
          <h2 className="project-name">{project.name}</h2>
        </div>
        <button
          type="button"
          className="nav-collapse-btn"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          onClick={() => setCollapsed((v) => !v)}
        >
          {collapsed ? '›' : '‹'} <span className="visually-hidden">Collapse</span>
        </button>
      </div>
      <ul className="project-nav-links">
        <li>
          <NavLink to={`${base}/timeline`} className={({ isActive }) => isActive ? 'active' : ''}>
            <NavIcon d={ICONS.timeline} />
            <span>Timeline</span>
          </NavLink>
        </li>
        {project.is_epics_activated && (
          <li>
            <NavLink to={`${base}/epics`} className={({ isActive }) => isActive ? 'active' : ''}>
              <NavIcon d={ICONS.epic} />
              <span>Epics</span>
            </NavLink>
          </li>
        )}
        {project.is_backlog_activated && (
          <li className={`scrum-section${scrumOpen ? ' open' : ''}`}>
            <button
              type="button"
              className="scrum-toggle"
              onClick={() => setScrumOpen((v) => !v)}
              aria-expanded={scrumOpen}
            >
              <NavIcon d={ICONS.scrum} />
              <span>Scrum</span>
              <span className="scrum-arrow">{scrumOpen ? '▾' : '▸'}</span>
            </button>
            {scrumOpen && (
              <ul className="sprints-nav">
                <li>
                  <NavLink to={`${base}/backlog`} className={({ isActive }) => isActive ? 'active' : ''}>
                    Backlog
                  </NavLink>
                </li>
                {sprints?.slice(0, 8).map((s) => (
                  <li key={s.id}>
                    <NavLink
                      to={`${base}/taskboard/${s.slug}`}
                      className={({ isActive }) => isActive ? 'active' : ''}
                      title={s.name}
                    >
                      {s.name}
                    </NavLink>
                  </li>
                ))}
              </ul>
            )}
          </li>
        )}
        {project.is_kanban_activated && (
          <li>
            <NavLink to={`${base}/kanban`} className={({ isActive }) => isActive ? 'active' : ''}>
              <NavIcon d={ICONS.kanban} />
              <span>Kanban</span>
            </NavLink>
          </li>
        )}
        {project.is_issues_activated && (
          <li>
            <NavLink to={`${base}/issues`} className={({ isActive }) => isActive ? 'active' : ''}>
              <NavIcon d={ICONS.issues} />
              <span>Issues</span>
            </NavLink>
          </li>
        )}
        {project.is_wiki_activated && (
          <li>
            <NavLink to={`${base}/wiki/home`} className={({ isActive }) => isActive ? 'active' : ''}>
              <NavIcon d={ICONS.wiki} />
              <span>Wiki</span>
            </NavLink>
          </li>
        )}
        <li>
          <NavLink to={`${base}/team`} className={({ isActive }) => isActive ? 'active' : ''}>
            <NavIcon d={ICONS.team} />
            <span>Team</span>
          </NavLink>
        </li>
        <li>
          <NavLink to={`${base}/search`} className={({ isActive }) => isActive ? 'active' : ''}>
            <NavIcon d={ICONS.search} />
            <span>Search</span>
          </NavLink>
        </li>
      </ul>
      {project.i_am_admin && (
        <div className="project-nav-admin">
          <NavLink
            to={`${base}/admin/project-profile/details`}
            className={({ isActive }) => isActive ? 'active' : ''}
            title="Settings"
          >
            <NavIcon d={ICONS.admin} />
            <span>Settings</span>
          </NavLink>
        </div>
      )}
    </tg-project-navigation>
  );
}
