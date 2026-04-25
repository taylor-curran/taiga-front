import { describe, expect, it, vi, beforeEach } from 'vitest';
import { apiBase, eventsUrl, loadConfig } from '../config';

const sampleConfig = {
  api: 'http://localhost:9000/api/v1/',
  eventsUrl: 'ws://localhost:9000/events',
  baseHref: '/',
  eventsMaxMissedHeartbeats: 5,
  eventsHeartbeatIntervalTime: 60000,
  eventsReconnectTryInterval: 10000,
  debug: false,
  debugInfo: false,
  defaultLanguage: 'en',
  themes: ['taiga'],
  defaultTheme: 'taiga',
  defaultLoginEnabled: true,
  publicRegisterEnabled: false,
  feedbackEnabled: true,
  supportUrl: null,
  privacyPolicyUrl: null,
  termsOfServiceUrl: null,
  maxUploadFileSize: null,
  contribPlugins: [],
  gitHubClientId: '',
  gitLabClientId: '',
  gitLabUrl: '',
  tagManager: { accountId: null },
  tribeHost: null,
  enableAsanaImporter: false,
  enableGithubImporter: false,
  enableJiraImporter: false,
  enableTrelloImporter: false,
  gravatar: false,
  rtlLanguages: [],
};

describe('config loader', () => {
  beforeEach(() => {
    // @ts-expect-error reset internal cache
    globalThis.__configCache = undefined;
  });

  it('fetches /conf.json once and exposes API base path', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify(sampleConfig), { status: 200, headers: { 'Content-Type': 'application/json' } })
    );
    const cfg = await loadConfig();
    expect(cfg.api).toBe('http://localhost:9000/api/v1/');
    expect(apiBase()).toBe('/api/v1/');
    expect(eventsUrl()).toContain('/events');
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
