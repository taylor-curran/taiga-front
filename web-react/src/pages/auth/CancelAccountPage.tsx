import { useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { postCancelAccount } from '@/api/authApi';
import { useTaigaConfig } from '@/lib/useTaigaConfig';
import { useAppStore } from '@/stores/appStore';
import { TaigaLogoMark } from '@/components/TaigaLogoMark';
import './authLayout.css';

export default function CancelAccountPage() {
    const { cancel_token: cancelToken } = useParams();
    const { config } = useTaigaConfig();
    const navigate = useNavigate();
    const clearSession = useAppStore((s) => s.clearSession);
    const [error, setError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const homePath = '/';

    if (!cancelToken) {
        return (
            <div className="auth__error" data-testid="cancel-account-error">
                Invalid link
            </div>
        );
    }

    const onConfirm = async () => {
        if (!config) return;
        setError(null);
        setSubmitting(true);
        try {
            await postCancelAccount(config, { cancel_token: cancelToken });
            clearSession();
            navigate(homePath, { replace: true });
        } catch {
            setError('Could not cancel account');
        } finally {
            setSubmitting(false);
        }
    };

    if (!config) {
        return <div className="auth" data-testid="cancel-account" />;
    }

    return (
        <div className="auth-wrapper cancel-account" data-testid="cancel-account">
            <div className="auth">
                <div className="auth-container">
                    <div className="logo-svg">
                        <TaigaLogoMark />
                    </div>
                    <h1 className="logo">Taiga</h1>
                    <h2 className="tagline">SIMPLE, POWERFUL, FREE</h2>
                    <p style={{ textAlign: 'center' }}>
                        <strong>Delete your account</strong>
                    </p>
                    <p style={{ textAlign: 'center', color: 'var(--color-text-muted)' }}>
                        This action cannot be undone.
                    </p>
                    {error && <p className="auth__error">{error}</p>}
                    <fieldset className="end" style={{ border: 0, marginTop: '1rem' }}>
                        <button
                            type="button"
                            className="taiga-btn taiga-btn--primary btn-small full"
                            onClick={() => {
                                void onConfirm();
                            }}
                            disabled={submitting}
                            data-testid="cancel-account-confirm"
                        >
                            Confirm cancellation
                        </button>
                    </fieldset>
                </div>
            </div>
        </div>
    );
}
