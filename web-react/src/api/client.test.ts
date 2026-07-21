import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import { loadConfig, getConfig } from './client';

vi.mock('axios', async () => {
  const actual = await vi.importActual('axios');
  return {
    ...actual,
    default: {
      ...(actual as Record<string, unknown>),
      get: vi.fn(),
      create: vi.fn(() => ({
        interceptors: {
          request: { use: vi.fn() },
          response: { use: vi.fn() },
        },
      })),
    },
  };
});

describe('client config', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('getConfig returns null before loadConfig', () => {
    expect(getConfig()).toBeNull();
  });

  it('loadConfig fetches /conf.json', async () => {
    const mockConfig = {
      api: 'http://localhost:9000/api/v1/',
      eventsUrl: 'ws://localhost:9000/events',
      baseHref: '/',
      defaultLanguage: 'en',
      debug: false,
    };
    (axios.get as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ data: mockConfig });

    const config = await loadConfig();
    expect(config.api).toBe('http://localhost:9000/api/v1/');
    expect(config.eventsUrl).toBe('ws://localhost:9000/events');
    expect(axios.get).toHaveBeenCalledWith('/conf.json');
  });
});
