import { beforeEach, describe, expect, it } from 'vitest';
import { useAppStore } from '@/stores/appStore';
import { STORAGE_TOKEN, STORAGE_USER } from '@/lib/storageKeys';

describe('appStore', () => {
    beforeEach(() => {
        localStorage.clear();
        useAppStore.setState({ user: null, isAuthenticated: false });
    });

    it('setSession stores token and user', () => {
        useAppStore.getState().setSession({
            userAttrs: { id: 1, username: 'a', email: 'a@a.com', full_name: 'A' },
            token: 'tok',
            refresh: 'ref',
        });
        expect(localStorage.getItem(STORAGE_TOKEN)).toBe('tok');
        expect(useAppStore.getState().isAuthenticated).toBe(true);
        expect(useAppStore.getState().user?.username).toBe('a');
    });

    it('clearSession removes storage keys', () => {
        localStorage.setItem(STORAGE_TOKEN, 't');
        localStorage.setItem(STORAGE_USER, JSON.stringify({ id: 1, username: 'u' }));
        useAppStore.getState().hydrateFromStorage();
        useAppStore.getState().clearSession();
        expect(localStorage.getItem(STORAGE_TOKEN)).toBeNull();
        expect(useAppStore.getState().isAuthenticated).toBe(false);
    });
});
