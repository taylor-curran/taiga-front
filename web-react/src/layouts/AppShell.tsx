/**
 * Default authenticated layout — top nav + main content + optional project menu.
 */
import { Outlet, useParams } from "react-router-dom";
import { useEffect } from "react";
import NavigationBar from "./NavigationBar";
import ProjectMenu from "./ProjectMenu";
import { useProject } from "../contexts/project";

export function AppShell() {
  const { pslug } = useParams<{ pslug?: string }>();
  const { project, setProjectBySlug, cleanProject } = useProject();

  useEffect(() => {
    if (pslug && (!project || project.slug !== pslug)) {
      void setProjectBySlug(pslug);
    } else if (!pslug && project) {
      cleanProject();
    }
  }, [pslug, project, setProjectBySlug, cleanProject]);

  return (
    <div className="app-shell">
      <NavigationBar />
      <div className="app-body">
        {pslug ? <ProjectMenu /> : null}
        <main className="app-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AppShell;
