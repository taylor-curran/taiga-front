import { useState } from 'react';
import { Link, Navigate, useSearchParams, useNavigate } from 'react-router';
import { postRegister } from '@/api/authApi';
import { isPublicRegisterEnabled } from '@/lib/taigaConfig';
import { useTaigaConfig } from '@/lib/useTaigaConfig';
import { useAppStore } from '@/stores/appStore';
import { TaigaLogoMark } from '@/components/TaigaLogoMark';
import { authStrings } from '@/pages/auth/authStrings';
import './authLayout.css';

const HOME_PATH = '/';

export default function RegisterPage() {
    const { config } = useTaigaConfig();
    const [search] = useSearchParams();
    const navigate = useNavigate();
    const setSession = useAppStore((s) => s.setSession);
    const [username, setUsername] = useState('');
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [accepted, setAccepted] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
    const [submitting, setSubmitting] = useState(false);

    const nextUrl = (() => {
        const n = search.get('next');
        if (n && n !== '/login') {
            try {
                return decodeURIComponent(n);
            } catch {
                return n;
            }
        }
        return HOME_PATH;
    })();

    if (config && !isPublicRegisterEnabled(config)) {
        return <Navigate to="/not-found" replace />;
    }

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!config) return;
        setError(null);
        setFieldErrors({});
        if (!accepted) {
            setError('You must accept the terms');
            return;
        }
        setSubmitting(true);
        try {
            const res = await postRegister(config, {
                username,
                full_name: fullName,
                email,
                password,
                type: 'public',
                accepted_terms: true,
            });
            const token = String(res.auth_token ?? '');
            const refresh = (res.refresh as string | undefined) ?? null;
            if (!token) {
                setError('Invalid response');
                return;
            }
            setSession({ userAttrs: res, token, refresh });
            if (nextUrl.indexOf('http') === 0) {
                window.location.href = nextUrl;
                return;
            }
            navigate(nextUrl, { replace: true });
        } catch (err) {
            const b = (err as { body?: { _error_message?: string; [k: string]: unknown } })?.body;
            if (b?._error_message) {
                setError(String(b._error_message));
            }
            if (b && typeof b === 'object') {
                const fe: Record<string, string> = {};
                for (const [k, v] of Object.entries(b)) {
                    if (k.startsWith('_')) continue;
                    if (Array.isArray(v) && v.length) {
                        fe[k] = v.map(String).join(' ');
                    }
                }
                if (Object.keys(fe).length) setFieldErrors(fe);
            }
            if (!b?._error_message) setError('Registration failed');
        } finally {
            setSubmitting(false);
        }
    };

    if (!config) {
        return (
            <div className="auth" data-testid="register-page">
                <p className="auth__error">Loading…</p>
            </div>
        );
    }

    return (
        <div className="auth-wrapper" data-testid="register-page">
            <div className="auth">
                <div className="auth-container">
                    <div className="logo-svg">
                        <TaigaLogoMark />
                    </div>
                    <h1 className="logo">Taiga</h1>
                    <h2 className="tagline">{authStrings.tagline}</h2>
                    {error && (
                        <p className="auth__error" role="alert" data-testid="register-error">
                            {error}
                        </p>
                    )}
                    <form className="register-form" onSubmit={onSubmit}>
                        <fieldset>
                            <input
                                name="username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                                maxLength={255}
                                pattern="^[\w.-]+$"
                                title="Letters, numbers, . and -"
                                autoComplete="username"
                                placeholder="Username"
                            />
                            {fieldErrors.username && (
                                <p className="auth__error">{fieldErrors.username}</p>
                            )}
                        </fieldset>
                        <fieldset>
                            <input
                                name="full_name"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                required
                                maxLength={256}
                                autoComplete="name"
                                placeholder="Full name"
                            />
                            {fieldErrors.full_name && (
                                <p className="auth__error">{fieldErrors.full_name}</p>
                            )}
                        </fieldset>
                        <fieldset>
                            <input
                                name="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                maxLength={255}
                                autoComplete="email"
                                placeholder="Email"
                            />
                            {fieldErrors.email && (
                                <p className="auth__error">{fieldErrors.email}</p>
                            )}
                        </fieldset>
                        <fieldset>
                            <input
                                name="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                minLength={4}
                                autoComplete="new-password"
                                placeholder="Password"
                            />
                            {fieldErrors.password && (
                                <p className="auth__error">{fieldErrors.password}</p>
                            )}
                        </fieldset>
                        <div className="register-terms">
                            <label>
                                <input
                                    type="checkbox"
                                    checked={accepted}
                                    onChange={(e) => setAccepted(e.target.checked)}
                                />
                                <span>{authStrings.register.termsNote}</span>
                            </label>
                        </div>
                        <fieldset className="end">
                            <button
                                type="submit"
                                className="taiga-btn taiga-btn--primary btn-small full"
                                disabled={submitting || !accepted}
                                data-testid="register-submit"
                            >
                                {authStrings.register.submit}
                            </button>
                        </fieldset>
                    </form>
                    <p className="login-text">
                        <Link to="/login" data-testid="link-to-login">
                            Back to {authStrings.login.signIn}
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
