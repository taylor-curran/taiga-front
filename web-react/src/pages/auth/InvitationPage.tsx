import { useEffect, useState, type CSSProperties } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { getInvitation, postLogin, postRegister } from '@/api/authApi';
import { isPublicRegisterEnabled, loginFormType } from '@/lib/taigaConfig';
import { useTaigaConfig } from '@/lib/useTaigaConfig';
import { useAppStore } from '@/stores/appStore';
import { authStrings } from '@/pages/auth/authStrings';
import './authLayout.css';

/**
 * `invitation/:token` — `auth/invitation.html` uses a distinct layout (`.invitation-main`), not the full-screen `.auth` card.
 */
export default function InvitationPage() {
    const { token } = useParams();
    const { config } = useTaigaConfig();
    const navigate = useNavigate();
    const setSession = useAppStore((s) => s.setSession);
    const [invitation, setInvitation] = useState<Record<string, unknown> | null>(null);
    const [loadError, setLoadError] = useState(false);
    const [loginU, setLoginU] = useState('');
    const [loginP, setLoginP] = useState('');
    const [reg, setReg] = useState({ username: '', full_name: '', email: '', password: '' });
    const [accepted, setAccepted] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (!config || !token) return;
        (async () => {
            try {
                const inv = await getInvitation(config, token);
                setInvitation(inv);
            } catch {
                setLoadError(true);
                navigate('/login', { replace: true });
            }
        })();
    }, [config, token, navigate]);

    const onLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!config || !token) return;
        setError(null);
        setSubmitting(true);
        try {
            const ltype = loginFormType(config);
            const res = await postLogin(config, {
                username: loginU,
                password: loginP,
                type: ltype,
                invitation_token: token,
            });
            const t = String(res.auth_token ?? '');
            const ref = (res.refresh as string | undefined) ?? null;
            if (!t) {
                setError('Invalid response');
                return;
            }
            setSession({ userAttrs: res, token: t, refresh: ref });
            const slug = String(invitation?.project_slug ?? '');
            navigate(slug ? `/project/${slug}/` : `/`, { replace: true });
        } catch (err) {
            const m = (err as { body?: { _error_message?: string } })?.body?._error_message;
            setError(m || authStrings.login.errorIncorrect);
        } finally {
            setSubmitting(false);
        }
    };

    const onRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!config || !token) return;
        if (!accepted) {
            setError('You must accept the terms');
            return;
        }
        setError(null);
        setSubmitting(true);
        try {
            const res = await postRegister(config, {
                ...reg,
                token,
                type: 'private',
                accepted_terms: true,
                existing: false,
            });
            const t = String(res.auth_token ?? '');
            const ref = (res.refresh as string | undefined) ?? null;
            if (!t) {
                setError('Invalid response');
                return;
            }
            setSession({ userAttrs: res, token: t, refresh: ref });
            const slug = String(invitation?.project_slug ?? '');
            navigate(slug ? `/project/${slug}/` : `/`, { replace: true });
        } catch (err) {
            const b = (err as { body?: { _error_message?: string } })?.body;
            setError(b?._error_message || 'Registration failed');
        } finally {
            setSubmitting(false);
        }
    };

    if (!config || !token) {
        return <div className="invitation-main" data-testid="invitation" />;
    }

    if (loadError || !invitation) {
        return null;
    }

    const showRegister = isPublicRegisterEnabled(config);
    const projectName = String(invitation.project_name ?? invitation.project ?? 'Project');

    return (
        <div className="invitation-main" data-testid="invitation">
            <div className="centered invitation-container" style={invitationContainerStyle}>
                <span className="invitation-text" style={invTextStyle}>
                    <p>You have been invited to join</p>
                    <p className="project-name" style={{ fontWeight: 700 }}>
                        {projectName}
                    </p>
                </span>
                <div className="invitation-form">
                    <form className="login-form" onSubmit={onLogin}>
                        <p className="form-header" style={headerStyle}>
                            {authStrings.login.signIn}
                        </p>
                        {error && <p className="auth__error">{error}</p>}
                        <fieldset>
                            <input
                                name="username"
                                value={loginU}
                                onChange={(e) => setLoginU(e.target.value)}
                                required
                                autoComplete="username"
                                placeholder={authStrings.login.username}
                            />
                        </fieldset>
                        <fieldset className="login-password">
                            <input
                                name="password"
                                type="password"
                                value={loginP}
                                onChange={(e) => setLoginP(e.target.value)}
                                required
                                autoComplete="current-password"
                                placeholder={authStrings.login.password}
                            />
                            <Link to="/forgot-password" className="forgot-pass">
                                {authStrings.login.forgotPassword}
                            </Link>
                        </fieldset>
                        <fieldset>
                            <button
                                type="submit"
                                className="taiga-btn taiga-btn--primary btn-small full"
                                disabled={submitting}
                            >
                                Enter
                            </button>
                        </fieldset>
                    </form>
                    {showRegister && (
                        <form
                            className="register-form"
                            onSubmit={onRegister}
                            style={{ marginTop: '1.5rem' }}
                        >
                            <p className="form-header" style={headerStyle}>
                                {authStrings.register.title}
                            </p>
                            <fieldset>
                                <input
                                    name="username"
                                    value={reg.username}
                                    onChange={(e) =>
                                        setReg((r) => ({ ...r, username: e.target.value }))
                                    }
                                    required
                                    pattern="^[\w.-]+$"
                                    placeholder="Username"
                                />
                            </fieldset>
                            <fieldset>
                                <input
                                    name="full_name"
                                    value={reg.full_name}
                                    onChange={(e) =>
                                        setReg((r) => ({ ...r, full_name: e.target.value }))
                                    }
                                    required
                                    placeholder="Full name"
                                />
                            </fieldset>
                            <fieldset>
                                <input
                                    name="email"
                                    type="email"
                                    value={reg.email}
                                    onChange={(e) =>
                                        setReg((r) => ({ ...r, email: e.target.value }))
                                    }
                                    required
                                    placeholder="Email"
                                />
                            </fieldset>
                            <fieldset>
                                <input
                                    name="password"
                                    type="password"
                                    value={reg.password}
                                    onChange={(e) =>
                                        setReg((r) => ({ ...r, password: e.target.value }))
                                    }
                                    required
                                    minLength={4}
                                    placeholder="Password"
                                />
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
                            <fieldset>
                                <button
                                    type="submit"
                                    className="taiga-btn taiga-btn--primary btn-small full"
                                    disabled={submitting || !accepted}
                                >
                                    {authStrings.register.submit}
                                </button>
                            </fieldset>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}

const invitationContainerStyle: CSSProperties = {
    maxWidth: 480,
    margin: '0 auto',
    padding: '2rem 1rem',
};

const invTextStyle: CSSProperties = {
    display: 'block',
    textAlign: 'center',
    marginBottom: '1.5rem',
};

const headerStyle: CSSProperties = {
    textAlign: 'center',
    fontWeight: 600,
    marginBottom: '0.75rem',
};
