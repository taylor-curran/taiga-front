import { apiJson } from '@/api/apiClient';
import type { PublicTaigaConfig as Cfg } from '@/lib/taigaConfig';

type AuthPostBody = Record<string, unknown>;

/** POST /auth — same payload as Angular `AuthService.login` (see `app/coffee/modules/auth.coffee`). */
export async function postLogin(config: Cfg, body: AuthPostBody) {
    return apiJson<Record<string, unknown>>(config, 'auth', {
        method: 'POST',
        body: JSON.stringify(body),
        skipAuth: true,
    });
}

export async function postRegister(config: Cfg, body: AuthPostBody) {
    return apiJson<Record<string, unknown>>(config, 'auth/register', {
        method: 'POST',
        body: JSON.stringify(body),
        skipAuth: true,
    });
}

export async function postForgotPassword(config: Cfg, body: AuthPostBody) {
    return apiJson<unknown>(config, 'users/password_recovery', {
        method: 'POST',
        body: JSON.stringify(body),
        skipAuth: true,
    });
}

export async function postChangePasswordFromRecovery(config: Cfg, body: AuthPostBody) {
    return apiJson<unknown>(config, 'users/change_password_from_recovery', {
        method: 'POST',
        body: JSON.stringify(body),
        skipAuth: true,
    });
}

export async function getInvitation(config: Cfg, token: string) {
    return apiJson<Record<string, unknown>>(config, `invitations/${encodeURIComponent(token)}`, {
        method: 'GET',
        skipAuth: true,
    });
}

export async function postChangeEmail(config: Cfg, body: AuthPostBody) {
    return apiJson<unknown>(config, 'users/change_email', {
        method: 'POST',
        body: JSON.stringify(body),
        skipAuth: true,
    });
}

export async function postCancelAccount(config: Cfg, body: AuthPostBody) {
    return apiJson<unknown>(config, 'users/cancel', {
        method: 'POST',
        body: JSON.stringify(body),
        skipAuth: true,
    });
}

export async function postAuthRefresh(config: Cfg, refresh: string) {
    return apiJson<{ auth_token: string; refresh: string }>(config, 'auth/refresh', {
        method: 'POST',
        body: JSON.stringify({ refresh }),
        skipAuth: true,
    });
}

export async function getProjectBySlug(config: Cfg, slug: string) {
    const q = new URLSearchParams({ slug });
    return apiJson<Record<string, unknown>>(config, `projects/by_slug?${q.toString()}`, {
        method: 'GET',
    });
}

export async function getUsersMe(config: Cfg) {
    return apiJson<Record<string, unknown>>(config, 'users/me', { method: 'GET' });
}
