import { useEffect, useRef, useState } from 'react';

type AsyncState<T> = {
  data: T | null;
  error: string | null;
  loading: boolean;
};

/**
 * Fetches on mount and whenever `key` or `deps` change; `reload` repeats the last load.
 */
export function useAsyncResource<T>(
  key: string,
  load: () => Promise<T>,
  deps: ReadonlyArray<unknown> = [],
): AsyncState<T> & { reload: () => void } {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [version, setVersion] = useState(0);
  const loadRef = useRef(load);
  loadRef.current = load;

  useEffect(() => {
    setLoading(true);
    setError(null);
    let cancelled = false;
    void loadRef
      .current()
      .then((d) => {
        if (!cancelled) {
          setData(d);
          setError(null);
        }
      })
      .catch((e: unknown) => {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : String(e));
          setData(null);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [key, version, ...deps]);

  return {
    data,
    error,
    loading,
    reload: () => setVersion((v) => v + 1),
  };
}
