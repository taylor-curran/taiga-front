import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { api, ApiError, setUnauthorizedHandler, getApiBase } from '@/api/client';
import { storage } from '@/api/storage';
import { loadConfig } from '@/api/config';

describe('api client', () => {
  beforeEach(async () => {
    localStorage.clear();
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ ok: 1 }), { status: 200, headers: { 'Content-Type': 'application/json' } }),
    );
    // Force config to load fallback
    await loadConfig();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('uses /api/v1 base by default', () => {
    expect(getApiBase()).toBe('/api/v1');
  });

  it('GET sends Authorization when token is set', async () => {
    storage.set('token', 'tok');
    await api.get('users/me');
    const args = (globalThis.fetch as unknown as ReturnType<typeof vi.fn>).mock.calls[0];
    const init = args[1] as RequestInit;
    expect((init.headers as Record<string, string>).Authorization).toBe('Bearer tok');
    expect(args[0]).toContain('/api/v1/users/me');
  });

  it('POST sends JSON body', async () => {
    await api.post('userstories/3', { subject: 'x', version: 4 });
    const args = (globalThis.fetch as unknown as ReturnType<typeof vi.fn>).mock.calls[0];
    const init = args[1] as RequestInit;
    expect(init.method).toBe('POST');
    expect((init.headers as Record<string, string>)['Content-Type']).toBe('application/json');
    expect(JSON.parse(init.body as string)).toEqual({ subject: 'x', version: 4 });
  });

  it('builds query strings', async () => {
    await api.get('projects', { query: { member: 5, slight: true } });
    const args = (globalThis.fetch as unknown as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(args[0]).toContain('member=5');
    expect(args[0]).toContain('slight=true');
  });

  it('throws ApiError with status and message on non-2xx', async () => {
    (globalThis.fetch as unknown as ReturnType<typeof vi.fn>).mockImplementation(
      async () => new Response(JSON.stringify({ _error_message: 'nope' }), { status: 400 }),
    );
    await expect(api.get('boom')).rejects.toMatchObject({
      status: 400,
      message: 'nope',
    });
    try {
      await api.get('boom');
    } catch (e) {
      expect(e).toBeInstanceOf(ApiError);
    }
  });

  it('invokes the onUnauthorized handler on 401', async () => {
    const handler = vi.fn();
    setUnauthorizedHandler(handler);
    (globalThis.fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(
      new Response('', { status: 401 }),
    );
    await expect(api.get('protected')).rejects.toBeInstanceOf(ApiError);
    expect(handler).toHaveBeenCalled();
    setUnauthorizedHandler(() => {});
  });
});
