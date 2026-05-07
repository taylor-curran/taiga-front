/**
 * Default authenticated layout — top nav and main content area.
 *
 * Project-scoped chrome (the project menu, project context loading) lives in
 * `ProjectShell`, which is mounted inside the `project/:pslug` route so it can
 * actually read `pslug` via `useParams()`.
 */
import { Outlet } from "react-router-dom";
import NavigationBar from "./NavigationBar";

export function AppShell() {
  return (
    <div className="app-shell">
      <NavigationBar />
      <div className="app-body">
        <Outlet />
      </div>
    </div>
  );
}

export default AppShell;
