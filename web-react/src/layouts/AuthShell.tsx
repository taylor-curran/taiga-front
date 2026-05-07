/**
 * Bare layout for unauthenticated pages (login / register / forgot password).
 *
 * Mirrors `app/partials/auth/login.jade` etc. — no navbar, no project menu.
 */
import { Outlet } from "react-router-dom";

export function AuthShell() {
  return (
    <div className="wrapper">
      <div className="auth">
        <div className="auth-container">
          <h1 className="logo">Taiga</h1>
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export default AuthShell;
