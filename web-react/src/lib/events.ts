import { getConfig } from './config';
import { auth } from './api';

type Listener = (event: TaigaEvent) => void;

export interface TaigaEvent {
  cmd?: string;
  data?: unknown;
  matches?: number;
  routing?: Record<string, string | number>;
}

interface Subscription {
  routing: Record<string, string | number>;
  listener: Listener;
}

let _socket: WebSocket | null = null;
let _opening: Promise<void> | null = null;
let _subscriptions: Subscription[] = [];
let _heartbeat: ReturnType<typeof setInterval> | null = null;
let _reconnectTimer: ReturnType<typeof setTimeout> | null = null;
let _missedHeartbeats = 0;
let _closed = false;

function eventsUrl(): string | null {
  const cfg = getConfig();
  if (cfg.eventsUrl) return cfg.eventsUrl;
  if (typeof window === 'undefined') return null;
  const proto = window.location.protocol === 'https:' ? 'wss' : 'ws';
  return `${proto}://${window.location.host}/events`;
}

function getHeartbeatInterval(): number {
  return getConfig().eventsHeartbeatIntervalTime ?? 30_000;
}

function getMaxMissedHeartbeats(): number {
  return getConfig().eventsMaxMissedHeartbeats ?? 5;
}

function getReconnectInterval(): number {
  return getConfig().eventsReconnectTryInterval ?? 5_000;
}

function scheduleReconnect(): void {
  if (_closed) return;
  if (_reconnectTimer) return;
  _reconnectTimer = setTimeout(() => {
    _reconnectTimer = null;
    if (_subscriptions.length > 0 && !_closed) {
      void open();
    }
  }, getReconnectInterval());
}

async function open(): Promise<void> {
  if (_socket && _socket.readyState === WebSocket.OPEN) return;
  if (_opening) return _opening;
  const url = eventsUrl();
  if (!url) return;

  _opening = new Promise<void>((resolve, reject) => {
    const ws = new WebSocket(url);
    _socket = ws;
    _missedHeartbeats = 0;

    ws.onopen = () => {
      const token = auth.getAccessToken();
      if (token) {
        ws.send(JSON.stringify({ cmd: 'auth', data: { token, sessionId: 'web-react' } }));
      }

      _heartbeat = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
          _missedHeartbeats++;
          if (_missedHeartbeats > getMaxMissedHeartbeats()) {
            ws.close();
            return;
          }
          ws.send(JSON.stringify({ cmd: 'ping' }));
        }
      }, getHeartbeatInterval());

      for (const sub of _subscriptions) {
        ws.send(JSON.stringify({ cmd: 'subscribe', routing: sub.routing }));
      }
      resolve();
    };

    ws.onerror = () => {
      _opening = null;
      reject(new Error('events socket error'));
    };

    ws.onclose = () => {
      if (_heartbeat) clearInterval(_heartbeat);
      _heartbeat = null;
      _socket = null;
      _opening = null;
      scheduleReconnect();
    };

    ws.onmessage = (msg) => {
      let payload: TaigaEvent;
      try {
        payload = JSON.parse(msg.data) as TaigaEvent;
      } catch {
        return;
      }
      if (payload.cmd === 'pong') {
        _missedHeartbeats = 0;
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
  _closed = false;
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
  _closed = true;
  _subscriptions = [];
  if (_reconnectTimer) {
    clearTimeout(_reconnectTimer);
    _reconnectTimer = null;
  }
  if (_socket && _socket.readyState === WebSocket.OPEN) _socket.close();
  if (_heartbeat) clearInterval(_heartbeat);
  _heartbeat = null;
}

export function useProjectEvents(
  projectId: number | undefined,
  listener: Listener,
): () => void {
  if (!projectId) return () => {};
  return subscribe({ project: projectId }, listener);
}
