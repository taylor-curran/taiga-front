import { useAppStore } from '@/stores/appStore';
import { HistorySection } from '@/components/history/HistorySection';
import { DEMO_PROJECT_SLUG } from '@/routes/adminRoutePaths';

type Props = { pslug: string; usid: string };

/**
 * Admin-context slice of user story “history” (comments + activity) from `tg-history-section`.
 * Object id and moderation flags are passed via search params in dev for parity with sample data.
 */
export function UserStoryAdminHistoryPage({ pslug, usid }: Props) {
  const user = useAppStore((s) => s.user);
  const objectId = parseInt(usid, 10);
  const isDemo = pslug === DEMO_PROJECT_SLUG;
  const canComment = isDemo; // open for the scaffold demo user story; tighten when auth exists
  const canModerate = isDemo;
  const currentUserId = user?.id ?? 1;

  if (!Number.isFinite(objectId) || objectId < 1) {
    return <p className="taiga-history-error">Invalid user story id.</p>;
  }

  return (
    <div data-e2e-us-history>
      <h1 className="app-shell__page-title" style={{ marginTop: 0 }}>
        {`User story #${objectId} — comments`}
      </h1>
      <p className="app-shell__lede" style={{ color: 'var(--color-text-muted)', marginTop: 0 }}>
        Project <code>{pslug}</code> · object id <code>{objectId}</code> (set <code>?us=</code> in URL for
        other ids).
      </p>
      <HistorySection
        name="us"
        objectId={objectId}
        canComment={canComment}
        canModerate={canModerate}
        currentUserId={currentUserId}
      />
    </div>
  );
}
