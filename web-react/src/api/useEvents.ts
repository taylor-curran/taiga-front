import { useEffect } from 'react';
import { events } from './events';

export function useEvents(routingKey: string | null | undefined, callback: (data: unknown) => void) {
  useEffect(() => {
    if (!routingKey) return;
    return events.subscribe(routingKey, callback);
    // We intentionally don't put callback in deps; consumers should keep a
    // stable reference via useCallback if they care.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [routingKey]);
}
