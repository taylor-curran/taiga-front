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
  const { setProjectBySlug, cleanProject } = useProject();

  // Load (or switch) the project whenever the URL slug changes. The context
  // exposes `setProjectBySlug` with a stable identity (it reads the current
  // project from a ref), so this effect only fires on actual slug changes —
  // not every time the project object is replaced.
  useEffect(() => {
    if (pslug) {
      void setProjectBySlug(pslug);
    }
  }, [pslug, setProjectBySlug]);

  // Clear the project on unmount only. Putting `cleanProject()` in the
  // previous effect's cleanup would tear the project down on every slug
  // change and create an infinite fetch → clean → refetch loop.
  useEffect(() => {
    return () => {
      cleanProject();
    };
  }, [cleanProject]);

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
