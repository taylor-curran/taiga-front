import { Link, useLocation } from "react-router-dom";
import { useCurrentUser } from "../hooks/useCurrentUser";
import { getConfig } from "../config";

type ActiveSection = "dashboard" | "discover" | "notifications" | "projects" | "project" | null;

function getActiveSection(pathname: string): ActiveSection {
  switch (pathname) {
    case "/":
      return "dashboard";
    case "/discover":
    case "/discover/search":
      return "discover";
    case "/notifications":
      return "notifications";
    case "/projects":
      return "projects";
    default:
      if (pathname.startsWith("/project")) return "project";
      return null;
  }
}

export default function NavigationBar() {
  const { user, isAuthenticated } = useCurrentUser();
  const location = useLocation();
  const config = getConfig();
  const active = getActiveSection(location.pathname);

  return (
    <nav className="navbar" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0 1rem", height: 48, background: "#4c566a", color: "#fff" }}>
      <div className="nav-left" style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
        {!isAuthenticated ? (
          <a href="https://taiga.io" className="logo" title="Taiga" style={{ color: "#fff", fontWeight: "bold", textDecoration: "none" }}>
            Taiga
          </a>
        ) : (
          <Link to="/" className="logo" title="Taiga" style={{ color: "#fff", fontWeight: "bold", textDecoration: "none" }}>
            Taiga
          </Link>
        )}

        {isAuthenticated && (
          <div className="project-dropdown-trigger" style={{ opacity: 0.7 }}>
            {/* Project dropdown — stub */}
          </div>
        )}
      </div>

      {!isAuthenticated && (
        <div className="nav-right" style={{ display: "flex", gap: "1rem" }}>
          <Link to="/login" style={{ color: "#fff", textDecoration: "none" }}>Sign In</Link>
          {config.publicRegisterEnabled && (
            <Link to="/register" style={{ color: "#fff", textDecoration: "none" }}>Sign Up</Link>
          )}
        </div>
      )}

      {isAuthenticated && (
        <div className="nav-right" style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <Link
            to="/discover"
            title="Discover"
            style={{ color: "#fff", textDecoration: "none", fontWeight: active === "discover" ? "bold" : "normal" }}
          >
            Discover
          </Link>

          {/* Notifications dropdown — stub */}
          <Link
            to="/notifications"
            title="Notifications"
            style={{ color: "#fff", textDecoration: "none", fontWeight: active === "notifications" ? "bold" : "normal" }}
          >
            Notifications
          </Link>

          {/* User dropdown — stub */}
          <div style={{ opacity: 0.8 }}>
            {user?.full_name || user?.username || "User"}
          </div>
        </div>
      )}
    </nav>
  );
}
