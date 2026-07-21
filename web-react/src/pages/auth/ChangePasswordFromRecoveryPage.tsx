/**
 * Change password from recovery token page.
 *
 * Ports `app/partials/auth/change-password-from-recovery.jade`. Used after a
 * user clicks the link in their password-recovery email — the URL contains a
 * one-time `:token` parameter.
 */
import { FormEvent, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../contexts/auth";

export function ChangePasswordFromRecoveryPage() {
  const { t } = useTranslation();
  const { token = "" } = useParams<{ token: string }>();
  const { changePasswordFromRecovery } = useAuth();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await changePasswordFromRecovery({ token, password });
      navigate("/login", { replace: true });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : (t("CHANGE_PASSWORD.ERROR_CHANGE_PASSWORD") ??
            "Could not change password."),
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="forgot-form-container">
      <h2 className="logo">{t("CHANGE_PASSWORD.TITLE")}</h2>
      <form onSubmit={handleSubmit} noValidate>
        <fieldset>
          <input
            type="password"
            name="password"
            required
            minLength={4}
            placeholder={
              t("CHANGE_PASSWORD.PLACEHOLDER_NEW_PASSWORD") ??
              "New password"
            }
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </fieldset>

        {error ? (
          <div className="form-error" role="alert">
            {error}
          </div>
        ) : null}

        <fieldset>
          <button
            type="submit"
            className="btn-small full"
            disabled={submitting || !password}
          >
            {submitting
              ? t("COMMON.LOADING")
              : t("CHANGE_PASSWORD.ACTION_CHANGE_PASSWORD")}
          </button>
        </fieldset>

        <p className="register-text">
          <Link to="/login">{t("FORGOT_PASSWORD_FORM.LINK_CANCEL")}</Link>
        </p>
      </form>
    </div>
  );
}

export default ChangePasswordFromRecoveryPage;
