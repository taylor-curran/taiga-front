/**
 * Top navigation bar.
 *
 * Mirrors `app/modules/navigation-bar/navigation-bar.jade`. Shows public links
 * (login / register) when no user is authenticated and discover / notifications /
 * user dropdown when a user is signed in.
 */
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../contexts/auth";

interface NavigationBarProps {
  publicRegisterEnabled?: boolean;
}

export function NavigationBar({
  publicRegisterEnabled = true,
}: NavigationBarProps) {
  const { t } = useTranslation();
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <div className="nav-left">
        {isAuthenticated ? (
          <Link
            to="/"
            className="logo"
            title={t("PROJECT.NAVIGATION.HOMEPAGE") ?? "Homepage"}
          >
            Taiga
          </Link>
        ) : (
          <a
            href="https://taiga.io/"
            className="logo"
            title={t("PROJECT.NAVIGATION.HOMEPAGE") ?? "Homepage"}
          >
            Taiga
          </a>
        )}
      </div>

      {!isAuthenticated && (
        <div className="nav-right center">
          <Link
            to="/login"
            className="login"
            title={t("LOGIN_COMMON.ACTION_SIGN_IN") ?? "Sign in"}
          >
            {t("LOGIN_COMMON.ACTION_SIGN_IN")}
          </Link>
          {publicRegisterEnabled && (
            <Link
              to="/register"
              className="register"
              title={t("REGISTER_FORM.ACTION_SIGN_UP") ?? "Sign up"}
            >
              {t("REGISTER_FORM.ACTION_SIGN_UP")}
            </Link>
          )}
        </div>
      )}

      {isAuthenticated && (
        <div className="nav-right">
          <NavLink
            to="/discover"
            title={t("PROJECT.NAVIGATION.DISCOVER_TITLE") ?? "Discover"}
          >
            {t("PROJECT.NAVIGATION.DISCOVER")}
          </NavLink>
          <NavLink
            to="/notifications"
            title={t("PROJECT.NAVIGATION.NOTIFICATIONS") ?? "Notifications"}
          >
            {t("PROJECT.NAVIGATION.NOTIFICATIONS")}
          </NavLink>
          <div className="user-menu">
            <span className="user-name">{user?.full_name_display ?? user?.username}</span>
            <button type="button" className="logout-btn" onClick={handleLogout}>
              {t("COMMON.LOGOUT")}
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}

export default NavigationBar;
