/**
 * Layout for routes nested under `/project/:pslug/*`.
 *
 * In React Router v6, `useParams()` only sees params matched by the current
 * route and its ancestors — not by descendants. Mounting this component as the
 * `element` of the `project/:pslug` route lets us read `pslug` here, drive the
 * project context, and render the project menu alongside the nested route's
 * content.
 */
import { Outlet, useParams } from "react-router-dom";
import { useEffect } from "react";
import ProjectMenu from "./ProjectMenu";
import { useProject } from "../contexts/project";

export function ProjectShell() {
  const { pslug } = useParams<{ pslug: string }>();
  const { project, setProjectBySlug, cleanProject } = useProject();

  useEffect(() => {
    if (pslug && (!project || project.slug !== pslug)) {
      void setProjectBySlug(pslug);
    }
    return () => {
      cleanProject();
    };
  }, [pslug, project, setProjectBySlug, cleanProject]);

  return (
    <>
      <ProjectMenu />
      <main className="app-content">
        <Outlet />
      </main>
    </>
  );
}

export default ProjectShell;
