import { STORAGE_REFRESH, STORAGE_TOKEN, STORAGE_USER } from '@/lib/storageKeys';
import type { AppUser } from '@/stores/appStore';
import type { SessionSnapshot } from '@/api/apiClient';

export function readSessionFromStorage() {
    if (typeof localStorage === 'undefined') {
        return {
            token: null as string | null,
            refresh: null as string | null,
            user: null as AppUser,
        };
    }
    const token = localStorage.getItem(STORAGE_TOKEN);
    const refresh = localStorage.getItem(STORAGE_REFRESH);
    const raw = localStorage.getItem(STORAGE_USER);
    let user: AppUser = null;
    if (raw) {
        try {
            const p = JSON.parse(raw) as Record<string, unknown>;
            if (p.id == null) {
                user = null;
            } else {
                const id = Number(p.id);
                user = {
                    id: Number.isFinite(id) ? id : 0,
                    username: String(p.username ?? ''),
                    email: String(p.email ?? ''),
                    fullName: String(p.full_name ?? p.fullName ?? ''),
                    photo: p.photo == null ? null : String(p.photo),
                };
            }
        } catch {
            user = null;
        }
    }
    return { token, refresh, user };
}

export function readSessionSnapshotForApi(): SessionSnapshot {
    if (typeof localStorage === 'undefined') {
        return { token: null, refresh: null, userJson: null };
    }
    return {
        token: localStorage.getItem(STORAGE_TOKEN),
        refresh: localStorage.getItem(STORAGE_REFRESH),
        userJson: localStorage.getItem(STORAGE_USER),
    };
}

export function writeUserInfo(raw: object) {
    if (typeof localStorage === 'undefined') return;
    localStorage.setItem(STORAGE_USER, JSON.stringify(raw));
}

export function clearAuthStorage() {
    if (typeof localStorage === 'undefined') return;
    localStorage.removeItem(STORAGE_TOKEN);
    localStorage.removeItem(STORAGE_REFRESH);
    localStorage.removeItem(STORAGE_USER);
}

export function setTokenPair(token: string, refresh: string | null) {
    if (typeof localStorage === 'undefined') return;
    localStorage.setItem(STORAGE_TOKEN, token);
    if (refresh) {
        localStorage.setItem(STORAGE_REFRESH, refresh);
    } else {
        localStorage.removeItem(STORAGE_REFRESH);
    }
}
