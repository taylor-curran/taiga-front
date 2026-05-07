/**
 * Register page.
 *
 * Ports `app/partials/auth/register.jade` and the `tg-register` directive
 * (`app/coffee/modules/auth.coffee`). Submits to `POST /auth/register?type=public`.
 */
import { FormEvent, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../contexts/auth";

interface RegisterFormState {
  username: string;
  full_name: string;
  email: string;
  password: string;
  accepted_terms: boolean;
}

export function RegisterPage() {
  const { t } = useTranslation();
  const { register } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [form, setForm] = useState<RegisterFormState>({
    username: "",
    full_name: "",
    email: "",
    password: "",
    accepted_terms: true,
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await register({
        username: form.username,
        full_name: form.full_name,
        email: form.email,
        password: form.password,
        accepted_terms: form.accepted_terms,
        type: "public",
      });
      const next = searchParams.get("next");
      navigate(next ?? "/", { replace: true });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : (t("REGISTER_FORM.ERROR_REGISTER") ?? "Registration failed"),
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="register-form-container">
      <form className="register-form" onSubmit={handleSubmit} noValidate>
        <fieldset>
          <input
            type="text"
            name="username"
            autoCorrect="off"
            autoCapitalize="none"
            required
            placeholder={
              t("REGISTER_FORM.PLACEHOLDER_NAME") ?? "Username"
            }
            value={form.username}
            onChange={(e) =>
              setForm((p) => ({ ...p, username: e.target.value }))
            }
          />
        </fieldset>
        <fieldset>
          <input
            type="text"
            name="full_name"
            required
            placeholder={
              t("REGISTER_FORM.PLACEHOLDER_FULL_NAME") ?? "Full name"
            }
            value={form.full_name}
            onChange={(e) =>
              setForm((p) => ({ ...p, full_name: e.target.value }))
            }
          />
        </fieldset>
        <fieldset>
          <input
            type="email"
            name="email"
            required
            placeholder={t("REGISTER_FORM.PLACEHOLDER_EMAIL") ?? "Email"}
            value={form.email}
            onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
          />
        </fieldset>
        <fieldset>
          <input
            type="password"
            name="password"
            required
            minLength={4}
            placeholder={
              t("REGISTER_FORM.PLACEHOLDER_PASSWORD") ?? "Password"
            }
            value={form.password}
            onChange={(e) =>
              setForm((p) => ({ ...p, password: e.target.value }))
            }
          />
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
            disabled={submitting || !form.accepted_terms}
            title={t("REGISTER_FORM.ACTION_SIGN_UP") ?? "Sign up"}
          >
            {submitting
              ? t("COMMON.LOADING")
              : t("REGISTER_FORM.ACTION_SIGN_UP")}
          </button>
        </fieldset>

        <Link
          to="/login"
          className="register-text-top"
          title={t("REGISTER_FORM.TITLE_LINK_LOGIN") ?? "Sign in"}
        >
          {t("REGISTER_FORM.LINK_LOGIN")}
        </Link>
      </form>
    </div>
  );
}

export default RegisterPage;
