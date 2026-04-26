import { useState } from 'react';
import { Link } from 'react-router';
import { postForgotPassword } from '@/api/authApi';
import { useTaigaConfig } from '@/lib/useTaigaConfig';
import { TaigaLogoMark } from '@/components/TaigaLogoMark';
import { authStrings } from '@/pages/auth/authStrings';
import './authLayout.css';

export default function ForgotPasswordPage() {
    const { config } = useTaigaConfig();
    const [email, setEmail] = useState('');
    const [done, setDone] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!config) return;
        setError(null);
        setSubmitting(true);
        try {
            await postForgotPassword(config, { email });
            setDone(true);
        } catch {
            setError('Could not process request. Check your email address.');
        } finally {
            setSubmitting(false);
        }
    };

    if (!config) {
        return (
            <div className="auth" data-testid="forgot-password">
                <p className="auth__error">Loading…</p>
            </div>
        );
    }

    return (
        <div className="auth-wrapper" data-testid="forgot-password">
            <div className="auth">
                <div className="auth-container">
                    <div className="logo-svg">
                        <TaigaLogoMark />
                    </div>
                    <h1 className="logo">Taiga</h1>
                    <h2 className="tagline">{authStrings.tagline}</h2>
                    {done ? (
                        <p className="register-text" data-testid="forgot-success">
                            If the address is registered, a recovery link has been sent.{' '}
                            <Link to="/login">{authStrings.forgotPassword.backToLogin}</Link>
                        </p>
                    ) : (
                        <div className="forgot-form-container">
                            <p
                                className="forgot-text"
                                style={{ textAlign: 'center', marginBottom: '1rem' }}
                            >
                                <span>{authStrings.forgotPassword.title}</span>
                                <br />
                                <span
                                    style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)' }}
                                >
                                    We will email you a reset link
                                </span>
                            </p>
                            {error && (
                                <p className="auth__error" role="alert">
                                    {error}
                                </p>
                            )}
                            <form onSubmit={onSubmit}>
                                <fieldset>
                                    <input
                                        type="email"
                                        name="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        autoComplete="email"
                                        placeholder={authStrings.forgotPassword.email}
                                        data-testid="forgot-email"
                                    />
                                </fieldset>
                                <fieldset className="end">
                                    <button
                                        type="submit"
                                        className="taiga-btn taiga-btn--primary btn-small full"
                                        disabled={submitting}
                                        data-testid="forgot-submit"
                                    >
                                        {authStrings.forgotPassword.request}
                                    </button>
                                </fieldset>
                            </form>
                            <p className="login-text">
                                <Link to="/login">{authStrings.forgotPassword.backToLogin}</Link>
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
