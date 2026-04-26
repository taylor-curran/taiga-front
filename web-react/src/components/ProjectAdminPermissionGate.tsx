import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router';
import { getProjectBySlug } from '@/api/authApi';
import { getTaigaConfig } from '@/lib/taigaConfig';
import { DEMO_PROJECT_SLUG } from '@/routes/adminRoutePaths';

type Props = { children: ReactNode };

/**
 * Mirrors admin controllers that call `permissionDenied()` when `!project.i_am_admin`
 * (see `app/coffee/modules/admin/project-profile.coffee` `loadProject`).
 */
export function ProjectAdminPermissionGate({ children }: Props) {
    const { pslug = DEMO_PROJECT_SLUG } = useParams();
    const [state, setState] = useState<'loading' | 'ok' | 'denied' | 'error'>('loading');

    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const config = await getTaigaConfig();
                const p = await getProjectBySlug(config, pslug);
                if (cancelled) return;
                const isAdmin = p.i_am_admin === true;
                setState(isAdmin ? 'ok' : 'denied');
            } catch {
                if (!cancelled) setState('error');
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [pslug]);

    if (state === 'loading') {
        return (
            <div className="permission-gate" data-testid="admin-permission-loading">
                <p style={{ textAlign: 'center', color: 'var(--color-text-muted)' }}>
                    Checking project permissions…
                </p>
            </div>
        );
    }

    if (state === 'denied' || state === 'error') {
        return (
            <div
                className="permission-gate"
                data-testid="admin-permission-denied"
                style={{
                    padding: '2rem 1.5rem',
                    textAlign: 'center',
                    maxWidth: 520,
                    margin: '0 auto',
                }}
            >
                <h1 style={{ fontSize: '1.25rem' }}>Permission denied</h1>
                <p style={{ color: 'var(--color-text-muted)' }}>
                    {state === 'error'
                        ? 'Could not load this project, or the session no longer has access.'
                        : 'You need project admin rights to view this area.'}
                </p>
                <p>
                    <Link to="/login">Sign in with a different account</Link> or return to the{' '}
                    <Link to={`/project/${DEMO_PROJECT_SLUG}/admin/project-profile/details`}>
                        admin home
                    </Link>
                    .
                </p>
            </div>
        );
    }

    return <>{children}</>;
}
