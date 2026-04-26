import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { getUsersMe, postChangeEmail } from '@/api/authApi';
import { useTaigaConfig } from '@/lib/useTaigaConfig';
import { useAppStore } from '@/stores/appStore';
import { TaigaLogoMark } from '@/components/TaigaLogoMark';
import './authLayout.css';

export default function VerifyEmailPage() {
    const { email_token: emailToken } = useParams();
    const { config } = useTaigaConfig();
    const navigate = useNavigate();
    const isAuthed = useAppStore((s) => s.isAuthenticated);
    const setUserFromAttrs = useAppStore((s) => s.setUserFromAttrs);
    const [error, setError] = useState<string | null>(null);
    const [busy, setBusy] = useState(true);
    const homePath = '/';

    useEffect(() => {
        if (!config || !emailToken) {
            setBusy(false);
            return;
        }
        (async () => {
            try {
                await postChangeEmail(config, { email_token: emailToken });
                if (isAuthed) {
                    const u = await getUsersMe(config);
                    setUserFromAttrs(u);
                    navigate(homePath, { replace: true });
                } else {
                    navigate('/login', { replace: true });
                }
            } catch (e) {
                setError('Could not verify email');
                setBusy(false);
            }
        })();
    }, [config, emailToken, isAuthed, homePath, navigate, setUserFromAttrs]);

    if (!emailToken) {
        return <div className="auth__error">Invalid link</div>;
    }

    return (
        <div className="auth-wrapper" data-testid="verify-email">
            <div className="auth">
                <div className="auth-container">
                    <div className="logo-svg">
                        <TaigaLogoMark />
                    </div>
                    <h1 className="logo">Taiga</h1>
                    <h2 className="tagline">SIMPLE, POWERFUL, FREE</h2>
                    <div className="verify-email-form" style={{ textAlign: 'center' }}>
                        <p>
                            <strong>Verify email</strong>
                        </p>
                        {busy && !error && <p>Confirming your address…</p>}
                        {error && <p className="auth__error">{error}</p>}
                    </div>
                </div>
            </div>
        </div>
    );
}
