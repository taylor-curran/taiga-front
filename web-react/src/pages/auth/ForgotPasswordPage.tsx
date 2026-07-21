/**
 * Forgot password page.
 *
 * Ports `app/partials/auth/forgot-password.jade` and `tg-forgot-password`.
 * Submits a username/email to `POST /users/password_recovery` and shows a
 * confirmation message.
 */
import { FormEvent, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../contexts/auth";

export function ForgotPasswordPage() {
  const { t } = useTranslation();
  const { forgotPassword } = useAuth();
  const [username, setUsername] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await forgotPassword({ username });
      setSubmitted(true);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : (t("FORGOT_PASSWORD_FORM.ERROR_RECOVERY") ??
            "Could not start password recovery."),
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="forgot-form-container">
        <p className="forgot-text">{t("FORGOT_PASSWORD_FORM.SUCCESS")}</p>
        <Link to="/login">{t("FORGOT_PASSWORD_FORM.LINK_CANCEL")}</Link>
      </div>
    );
  }

  return (
    <div className="forgot-form-container">
      <p className="forgot-text">
        <span>{t("FORGOT_PASSWORD_FORM.TITLE")}</span>
        <br />
        <span>{t("FORGOT_PASSWORD_FORM.SUBTITLE")}</span>
      </p>

      <form onSubmit={handleSubmit} noValidate>
        <fieldset>
          <input
            type="text"
            name="username"
            autoCorrect="off"
            autoCapitalize="none"
            required
            placeholder={
              t("FORGOT_PASSWORD_FORM.PLACEHOLDER_FIELD") ?? "Username or email"
            }
            value={username}
            onChange={(e) => setUsername(e.target.value)}
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
            disabled={submitting || !username}
            title={t("FORGOT_PASSWORD_FORM.ACTION_RESET_PASSWORD") ?? ""}
          >
            {submitting
              ? t("COMMON.LOADING")
              : t("FORGOT_PASSWORD_FORM.ACTION_RESET_PASSWORD")}
          </button>
        </fieldset>

        <p className="register-text">
          <Link to="/login">{t("FORGOT_PASSWORD_FORM.LINK_CANCEL")}</Link>
        </p>
      </form>
    </div>
  );
}

export default ForgotPasswordPage;
