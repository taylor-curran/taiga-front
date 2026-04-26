import { useEffect, useState } from 'react';
import { getTaigaConfig, type PublicTaigaConfig } from '@/lib/taigaConfig';

let cached: PublicTaigaConfig | null = null;

export function useTaigaConfig() {
    const [cfg, setCfg] = useState<PublicTaigaConfig | null>(cached);
    const [err, setErr] = useState<Error | null>(null);
    useEffect(() => {
        if (cached) {
            setCfg(cached);
            return;
        }
        getTaigaConfig()
            .then((c) => {
                cached = c;
                setCfg(c);
            })
            .catch((e) => setErr(e instanceof Error ? e : new Error(String(e))));
    }, []);
    return { config: cfg, error: err };
}
