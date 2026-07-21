/**
 * Project sidebar menu.
 *
 * Mirrors `app/modules/components/project-menu/project-menu.jade`. Renders the
 * primary project navigation links (timeline, epics, backlog, kanban, issues,
 * wiki, team, search, admin) for the currently-loaded project. Items are
 * filtered by project permissions / module flags.
 */
import { NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useProject } from "../contexts/project";

interface ProjectMenuItem {
  to: string;
  i18nKey: string;
  visible: boolean;
}

export function ProjectMenu() {
  const { t } = useTranslation();
  const { project, hasPermission, isEpicsDashboardEnabled } = useProject();

  if (!project) return null;

  const slug = project.slug;
  const items: ProjectMenuItem[] = [
    {
      to: `/project/${slug}/timeline`,
      i18nKey: "PROJECT.SECTION.TIMELINE",
      visible: true,
    },
    {
      to: `/project/${slug}/epics`,
      i18nKey: "PROJECT.SECTION.EPICS",
      visible: isEpicsDashboardEnabled() && hasPermission("view_epics"),
    },
    {
      to: `/project/${slug}/backlog`,
      i18nKey: "PROJECT.SECTION.BACKLOG",
      visible: Boolean(project.is_backlog_activated) && hasPermission("view_us"),
    },
    {
      to: `/project/${slug}/kanban`,
      i18nKey: "PROJECT.SECTION.KANBAN",
      visible: Boolean(project.is_kanban_activated) && hasPermission("view_us"),
    },
    {
      to: `/project/${slug}/issues`,
      i18nKey: "PROJECT.SECTION.ISSUES",
      visible:
        Boolean(project.is_issues_activated) && hasPermission("view_issues"),
    },
    {
      to: `/project/${slug}/wiki/home`,
      i18nKey: "PROJECT.SECTION.WIKI",
      visible: Boolean(project.is_wiki_activated) && hasPermission("view_wiki_pages"),
    },
    {
      to: `/project/${slug}/team`,
      i18nKey: "PROJECT.SECTION.TEAM",
      visible: true,
    },
    {
      to: `/project/${slug}/search`,
      i18nKey: "PROJECT.SECTION.SEARCH",
      visible: true,
    },
    {
      to: `/project/${slug}/admin/project-profile/details`,
      i18nKey: "PROJECT.SECTION.ADMIN",
      visible: hasPermission("admin_project_values") || hasPermission("admin_roles"),
    },
  ];

  return (
    <aside className="project-menu">
      <header className="project-menu-header">
        <h2 className="project-name" title={project.name}>
          {project.name}
        </h2>
        {project.description ? (
          <p className="project-description">{project.description}</p>
        ) : null}
      </header>
      <nav className="project-menu-links">
        <ul>
          {items
            .filter((item) => item.visible)
            .map((item) => (
              <li key={item.to}>
                <NavLink to={item.to}>{t(item.i18nKey)}</NavLink>
              </li>
            ))}
        </ul>
      </nav>
    </aside>
  );
}

export default ProjectMenu;
