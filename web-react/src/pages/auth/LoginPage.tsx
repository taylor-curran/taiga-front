import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router';
import { postLogin } from '@/api/authApi';
import { loginFormType, isDefaultLoginEnabled } from '@/lib/taigaConfig';
import { useTaigaConfig } from '@/lib/useTaigaConfig';
import { useAppStore } from '@/stores/appStore';
import { TaigaLogoMark } from '@/components/TaigaLogoMark';
import { authStrings } from '@/pages/auth/authStrings';
import './authLayout.css';

const HOME_PATH = '/';

export default function LoginPage() {
    const { config } = useTaigaConfig();
    const navigate = useNavigate();
    const [search] = useSearchParams();
    const setSession = useAppStore((s) => s.setSession);

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [caps, setCaps] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

    const nextUrl = useMemo(() => {
        const rawNext = search.get('next');
        const forceNext = search.get('force_next');
        if (forceNext) {
            try {
                return decodeURIComponent(forceNext);
            } catch {
                return HOME_PATH;
            }
        }
        if (
            rawNext &&
            rawNext !== '/login' &&
            !rawNext.startsWith('%2Fdiscover') &&
            !rawNext.includes('/discover')
        ) {
            try {
                return decodeURIComponent(rawNext);
            } catch {
                return rawNext;
            }
        }
        return HOME_PATH;
    }, [search]);

    const isAuthed = useAppStore((s) => s.isAuthenticated);
    const forceLogin = search.get('force_login');
    const unauthorized = search.get('unauthorized');

    useEffect(() => {
        if (unauthorized === 'true' && !forceLogin) {
            // LoginPage: clear token when re-entering with unauthorized (Taiga)
            useAppStore.getState().clearSession();
        }
    }, [unauthorized, forceLogin]);

    useEffect(() => {
        if (isAuthed && !forceLogin && !unauthorized && config) {
            navigate(nextUrl, { replace: true });
        }
    }, [isAuthed, forceLogin, unauthorized, config, nextUrl, navigate]);

    const showDefaultLogin = config ? isDefaultLoginEnabled(config) : true;
    const ltype = config ? loginFormType(config) : 'normal';

    const onKeyUp = (e: React.KeyboardEvent<HTMLInputElement>) => {
        const v = e.currentTarget.value;
        setCaps(v.length > 0 && v === v.toUpperCase() && /[A-Z]/.test(v));
    };

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!config) return;
        setError(null);
        setSubmitting(true);
        try {
            const data = {
                username,
                password,
                type: ltype,
            };
            const res = await postLogin(config, data);
            const token = String(res.auth_token ?? '');
            const refresh = (res.refresh as string | undefined) ?? null;
            if (!token) {
                setError('Invalid response from server');
                return;
            }
            setSession({ userAttrs: res, token, refresh });
            if (nextUrl.indexOf('http') === 0) {
                window.location.href = nextUrl;
                return;
            }
            navigate(nextUrl, { replace: true });
        } catch (err) {
            setError(
                (err as { body?: { _error_message?: string } })?.body?._error_message ||
                    authStrings.login.errorIncorrect,
            );
        } finally {
            setSubmitting(false);
        }
    };

    if (!config) {
        return (
            <div className="auth-wrapper" data-testid="login-page-root">
                <div className="auth" data-testid="login-page">
                    <div className="auth-container">
                        <p className="auth__error" role="status">
                            Loading configuration…
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="auth-wrapper" data-testid="login-page-root">
            <div className="auth" data-testid="login-page">
                <div className="auth-container" data-testid="login-form-container">
                    <div className="logo-svg">
                        <TaigaLogoMark />
                    </div>
                    <h1 className="logo">Taiga</h1>
                    <h2 className="tagline">{authStrings.tagline}</h2>
                    {showDefaultLogin && (
                        <form className="login-form" onSubmit={onSubmit} autoComplete="on">
                            {error && (
                                <p className="auth__error" role="alert" data-testid="login-error">
                                    {error}
                                </p>
                            )}
                            <fieldset>
                                <input
                                    name="username"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    type="text"
                                    autoComplete="username"
                                    required
                                    placeholder={authStrings.login.username}
                                />
                            </fieldset>
                            <fieldset className="login-password">
                                <input
                                    name="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    onKeyUp={onKeyUp}
                                    type="password"
                                    autoComplete="current-password"
                                    required
                                    placeholder={authStrings.login.password}
                                />
                                <Link
                                    to={`/forgot-password${search.toString() ? `?${search.toString()}` : ''}`}
                                    className="forgot-pass"
                                    data-testid="link-forgot-password"
                                >
                                    {authStrings.login.forgotPassword}
                                </Link>
                                <span
                                    className="auth__caps"
                                    data-testid="caps-hint"
                                    aria-hidden={!caps}
                                >
                                    {caps ? 'Caps Lock is on' : '\u00a0'}
                                </span>
                            </fieldset>
                            <fieldset className="end">
                                <button
                                    type="submit"
                                    className="taiga-btn taiga-btn--primary btn-small full"
                                    disabled={submitting}
                                    data-testid="login-submit"
                                >
                                    {authStrings.login.signIn}
                                </button>
                            </fieldset>
                        </form>
                    )}
                    <p className="login-text" data-testid="register-cta">
                        {authStrings.login.publicRegister}{' '}
                        <Link to={`/register?next=${encodeURIComponent(nextUrl)}`}>
                            {authStrings.register.title}
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
