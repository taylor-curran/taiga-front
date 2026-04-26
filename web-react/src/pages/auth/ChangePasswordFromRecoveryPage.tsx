import { useState } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router';
import { postChangePasswordFromRecovery } from '@/api/authApi';
import { useTaigaConfig } from '@/lib/useTaigaConfig';
import { TaigaLogoMark } from '@/components/TaigaLogoMark';
import { authStrings } from '@/pages/auth/authStrings';
import './authLayout.css';

export default function ChangePasswordFromRecoveryPage() {
    const { token } = useParams();
    const { config } = useTaigaConfig();
    const navigate = useNavigate();
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

    if (!token) {
        return <Navigate to="/login" replace />;
    }

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!config) return;
        setError(null);
        setSubmitting(true);
        try {
            await postChangePasswordFromRecovery(config, { token, password });
            navigate('/login', {
                replace: true,
                state: { info: 'Password changed. Sign in with your new password.' },
            });
        } catch (err) {
            const b = (err as { body?: { password?: string[] } })?.body;
            if (b?.password?.length) {
                setError(b.password.join(' '));
            } else {
                setError('Could not change password');
            }
        } finally {
            setSubmitting(false);
        }
    };

    if (!config) {
        return <div className="auth" data-testid="change-password-recovery" />;
    }

    return (
        <div className="auth-wrapper" data-testid="change-password-recovery">
            <div className="auth">
                <div className="auth-container">
                    <div className="logo-svg">
                        <TaigaLogoMark />
                    </div>
                    <h1 className="logo">Taiga</h1>
                    <h2 className="tagline">{authStrings.tagline}</h2>
                    {error && <p className="auth__error">{error}</p>}
                    <form onSubmit={onSubmit}>
                        <fieldset>
                            <input
                                name="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                minLength={4}
                                autoComplete="new-password"
                                placeholder={authStrings.changePasswordRecovery.password}
                            />
                        </fieldset>
                        <fieldset className="end">
                            <button
                                type="submit"
                                className="taiga-btn taiga-btn--primary btn-small full"
                                disabled={submitting}
                            >
                                {authStrings.changePasswordRecovery.submit}
                            </button>
                        </fieldset>
                    </form>
                    <p className="login-text">
                        <Link to="/login">Back to login</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
