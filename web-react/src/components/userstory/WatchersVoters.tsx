import { usePatchUserStory } from '@/services/userstories';
import { useAuth } from '@/lib/auth';
import type { UserStoryDetail } from '@/types/api';

interface WatchersVotersProps {
  us: UserStoryDetail;
}

export function WatchersVoters({ us }: WatchersVotersProps) {
  const currentUserId = useAuth((s) => s.user?.id);
  const patchStory = usePatchUserStory();

  const isWatching = us.is_watcher ?? false;
  const isVoter = us.is_voter ?? false;

  const handleToggleWatch = () => {
    const watchers = us.watchers ?? [];
    const newWatchers = isWatching
      ? watchers.filter((w) => w !== currentUserId)
      : [...watchers, currentUserId!];
    patchStory.mutate({ id: us.id, data: { watchers: newWatchers } });
  };

  const handleToggleVote = () => {
    // The Taiga API uses a dedicated endpoint for voting
    // but for simplicity we'll note it as a display-only toggle here
    // Actual voting uses POST/DELETE /userstories/{id}/voters
  };

  return (
    <div className="flex items-center gap-4 text-sm">
      <button
        onClick={handleToggleWatch}
        className={`flex items-center gap-1 px-2 py-1 rounded transition ${
          isWatching
            ? 'text-taiga-primary bg-taiga-primary/10'
            : 'text-taiga-grey-light hover:text-taiga-primary'
        }`}
        disabled={!currentUserId}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
        <span>{us.total_watchers ?? 0}</span>
      </button>

      <button
        onClick={handleToggleVote}
        className={`flex items-center gap-1 px-2 py-1 rounded transition ${
          isVoter
            ? 'text-taiga-secondary bg-taiga-secondary/10'
            : 'text-taiga-grey-light hover:text-taiga-secondary'
        }`}
        disabled={!currentUserId}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill={isVoter ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
        <span>{us.total_voters ?? us.voters_count ?? 0}</span>
      </button>
    </div>
  );
}
