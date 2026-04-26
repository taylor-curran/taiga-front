import { create } from 'zustand';
import {
    clearAuthStorage,
    readSessionFromStorage,
    setTokenPair,
    writeUserInfo,
} from '@/lib/sessionStorage';

/**
 * Subset of Taiga `users` model fields the admin shell needs (mirrors `userInfo` in localStorage).
 */
export type AppUser = {
    id: number;
    username: string;
    email: string;
    fullName: string;
    photo?: string | null;
} | null;

export type AppState = {
    user: AppUser;
    isAuthenticated: boolean;
    setUser: (user: AppUser) => void;
    setAuthenticated: (v: boolean) => void;
    /** Restore from localStorage (e.g. on load). */
    hydrateFromStorage: () => void;
    setSession: (args: { userAttrs: object; token: string; refresh: string | null }) => void;
    clearSession: () => void;
    /** Replace stored user (e.g. after `users/me` refresh) without changing tokens. */
    setUserFromAttrs: (userAttrs: object) => void;
};

function attrsToUser(attrs: Record<string, unknown>): AppUser {
    if (!attrs || typeof attrs.id !== 'number') return null;
    return {
        id: attrs.id,
        username: String(attrs.username ?? ''),
        email: String(attrs.email ?? ''),
        fullName: String(attrs.full_name ?? attrs.fullName ?? ''),
        photo: attrs.photo == null || attrs.photo === '' ? null : String(attrs.photo),
    };
}

function initialAuth(): { user: AppUser; isAuthenticated: boolean } {
    if (typeof localStorage === 'undefined') {
        return { user: null, isAuthenticated: false };
    }
    const { user, token } = readSessionFromStorage();
    return { user, isAuthenticated: Boolean(user && token) };
}

const start = initialAuth();

export const useAppStore = create<AppState>((set) => ({
    user: start.user,
    isAuthenticated: start.isAuthenticated,
    setUser: (user) => set({ user, isAuthenticated: Boolean(user) }),
    setAuthenticated: (isAuthenticated) => set({ isAuthenticated }),
    hydrateFromStorage: () => {
        const { user, token } = readSessionFromStorage();
        set({ user, isAuthenticated: Boolean(user && token) });
    },
    setSession: ({ userAttrs, token, refresh }) => {
        writeUserInfo(userAttrs);
        setTokenPair(token, refresh);
        set({ user: attrsToUser(userAttrs as Record<string, unknown>), isAuthenticated: true });
    },
    clearSession: () => {
        clearAuthStorage();
        set({ user: null, isAuthenticated: false });
    },
    setUserFromAttrs: (userAttrs) => {
        writeUserInfo(userAttrs);
        set({ user: attrsToUser(userAttrs as Record<string, unknown>) });
    },
}));
