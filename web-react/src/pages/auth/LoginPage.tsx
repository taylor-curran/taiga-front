/**
 * Login page.
 *
 * Ports `app/partials/auth/login.jade` and the `tg-login` directive logic
 * (`app/coffee/modules/auth.coffee`). Submits credentials to
 * `POST /auth?type=normal`, stores the token on success, and redirects to
 * the next URL (or `/` if none).
 */
import { FormEvent, useState } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../contexts/auth";

interface LoginFormState {
  username: string;
  password: string;
}

export function LoginPage() {
  const { t } = useTranslation();
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const [form, setForm] = useState<LoginFormState>({
    username: "",
    password: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await login(form);
      const next = searchParams.get("next");
      const fallback = (location.state as { from?: string } | null)?.from ?? "/";
      navigate(next ?? fallback, { replace: true });
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : (t("LOGIN_FORM.ERROR_AUTH_INCORRECT") ??
            "Username or password are incorrect");
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="login-form-container">
      <h2 className="tagline">{t("COMMON.TAG_LINE_2")}</h2>

      <form className="login-form" onSubmit={handleSubmit} noValidate>
        <fieldset>
          <input
            type="text"
            name="username"
            autoComplete="username"
            autoCorrect="off"
            autoCapitalize="none"
            required
            placeholder={
              t("LOGIN_COMMON.PLACEHOLDER_AUTH_NAME") ?? "Username or email"
            }
            value={form.username}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, username: e.target.value }))
            }
          />
        </fieldset>

        <fieldset className="login-password">
          <input
            type="password"
            name="password"
            autoComplete="current-password"
            required
            placeholder={
              t("LOGIN_COMMON.PLACEHOLDER_AUTH_PASSWORD") ?? "Password"
            }
            value={form.password}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, password: e.target.value }))
            }
          />

          <Link
            className="forgot-pass"
            to="/forgot-password"
            title={t("LOGIN_COMMON.TITLE_LINK_FORGOT_PASSWORD") ?? ""}
          >
            {t("LOGIN_COMMON.LINK_FORGOT_PASSWORD")}
          </Link>
        </fieldset>

        {error ? (
          <div className="form-error" role="alert">
            {error}
          </div>
        ) : null}

        <fieldset className="end">
          <button
            type="submit"
            className="btn-small full"
            disabled={submitting || !form.username || !form.password}
            title={t("LOGIN_COMMON.ACTION_SIGN_IN") ?? "Sign in"}
          >
            {submitting
              ? t("COMMON.LOADING")
              : t("LOGIN_COMMON.ACTION_SIGN_IN")}
          </button>
        </fieldset>
      </form>

      <p className="register-cta">
        <Link to="/register">{t("REGISTER_FORM.ACTION_SIGN_UP")}</Link>
      </p>
    </div>
  );
}

export default LoginPage;
