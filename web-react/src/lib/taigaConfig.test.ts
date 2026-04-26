import { describe, expect, it } from 'vitest';
import { apiV1Base, type PublicTaigaConfig } from '@/lib/taigaConfig';

describe('apiV1Base', () => {
    it('normalizes api root with single trailing slash', () => {
        const c = { api: 'http://localhost:9000/api/v1' } as PublicTaigaConfig;
        expect(apiV1Base(c)).toBe('http://localhost:9000/api/v1/');
    });
});
