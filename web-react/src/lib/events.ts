// Lightweight Taiga websocket events client. Mirrors the legacy `$tgEvents`
// service but exposes a minimal subscribe API rather than AngularJS scope
// integration. Connection is lazy — only opened on first subscribe.

import { getConfig } from './config';
import { auth } from './api';

type Listener = (event: TaigaEvent) => void;

export interface TaigaEvent {
  cmd?: string;
  data?: unknown;
  matches?: number;
}

interface Subscription {
  routing: Record<string, string | number>;
  listener: Listener;
}

let _socket: WebSocket | null = null;
let _opening: Promise<void> | null = null;
let _subscriptions: Subscription[] = [];
let _heartbeat: ReturnType<typeof setInterval> | null = null;

function eventsUrl(): string | null {
  const cfg = getConfig();
  if (cfg.eventsUrl) return cfg.eventsUrl;
  if (typeof window === 'undefined') return null;
  const proto = window.location.protocol === 'https:' ? 'wss' : 'ws';
  return `${proto}://${window.location.host}/events`;
}

async function open(): Promise<void> {
  if (_socket && _socket.readyState === WebSocket.OPEN) return;
  if (_opening) return _opening;
  const url = eventsUrl();
  if (!url) return;

  _opening = new Promise((resolve, reject) => {
    const ws = new WebSocket(url);
    _socket = ws;
    ws.onopen = () => {
      const token = auth.getAccessToken();
      if (token) {
        ws.send(JSON.stringify({ cmd: 'auth', data: { token, sessionId: 'web-react' } }));
      }
      _heartbeat = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ cmd: 'ping' }));
        }
      }, 30_000);
      // Re-send any existing subscriptions after reconnect.
      for (const sub of _subscriptions) {
        ws.send(JSON.stringify({ cmd: 'subscribe', routing: sub.routing }));
      }
      resolve();
    };
    ws.onerror = () => reject(new Error('events socket error'));
    ws.onclose = () => {
      if (_heartbeat) clearInterval(_heartbeat);
      _heartbeat = null;
      _socket = null;
      _opening = null;
    };
    ws.onmessage = (msg) => {
      let payload: TaigaEvent;
      try {
        payload = JSON.parse(msg.data) as TaigaEvent;
      } catch {
        return;
      }
      for (const sub of _subscriptions) {
        sub.listener(payload);
      }
    };
  });

  return _opening;
}

export function subscribe(
  routing: Record<string, string | number>,
  listener: Listener,
): () => void {
  const sub: Subscription = { routing, listener };
  _subscriptions.push(sub);
  void open().then(() => {
    if (_socket?.readyState === WebSocket.OPEN) {
      _socket.send(JSON.stringify({ cmd: 'subscribe', routing }));
    }
  });
  return () => {
    _subscriptions = _subscriptions.filter((s) => s !== sub);
    if (_socket?.readyState === WebSocket.OPEN) {
      _socket.send(JSON.stringify({ cmd: 'unsubscribe', routing }));
    }
  };
}

export function disconnect(): void {
  _subscriptions = [];
  if (_socket && _socket.readyState === WebSocket.OPEN) _socket.close();
  if (_heartbeat) clearInterval(_heartbeat);
  _heartbeat = null;
}
