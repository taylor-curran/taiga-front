import { eventsUrl, getConfig } from './config';
import { sessionId } from './sessionId';

type Subscription = {
  routingKey: string;
  callback: (data: unknown) => void;
};

class EventsClient {
  private ws: WebSocket | null = null;
  private subscriptions = new Map<string, Subscription>();
  private pending: unknown[] = [];
  private connected = false;
  private heartbeat: number | null = null;
  private missed = 0;
  private maxMissed = 5;
  private heartbeatMs = 60000;
  private reconnectMs = 10000;
  private reconnectTimer: number | null = null;
  private destroyed = false;
  private listeners = new Map<string, Set<(data: unknown) => void>>();

  start(): void {
    if (this.destroyed) return;
    try {
      const cfg = getConfig();
      this.maxMissed = cfg.eventsMaxMissedHeartbeats || 5;
      this.heartbeatMs = cfg.eventsHeartbeatIntervalTime || 60000;
      this.reconnectMs = cfg.eventsReconnectTryInterval || 10000;
    } catch {
      /* config not loaded yet; defaults are fine */
    }

    const url = eventsUrl();
    if (!url) return;

    this.stop();
    try {
      this.ws = new WebSocket(url);
    } catch {
      this.scheduleReconnect();
      return;
    }
    this.ws.addEventListener('open', this.onOpen);
    this.ws.addEventListener('message', this.onMessage);
    this.ws.addEventListener('error', this.onError);
    this.ws.addEventListener('close', this.onClose);
  }

  stop(): void {
    if (this.heartbeat) {
      window.clearInterval(this.heartbeat);
      this.heartbeat = null;
    }
    if (this.reconnectTimer) {
      window.clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.ws) {
      this.ws.removeEventListener('open', this.onOpen);
      this.ws.removeEventListener('message', this.onMessage);
      this.ws.removeEventListener('error', this.onError);
      this.ws.removeEventListener('close', this.onClose);
      try {
        this.ws.close();
      } catch {
        /* ignore */
      }
      this.ws = null;
    }
    this.connected = false;
  }

  destroy(): void {
    this.destroyed = true;
    this.stop();
  }

  private scheduleReconnect(): void {
    if (this.reconnectTimer || this.destroyed) return;
    this.reconnectTimer = window.setTimeout(() => {
      this.reconnectTimer = null;
      this.start();
    }, this.reconnectMs);
  }

  private onOpen = (): void => {
    this.connected = true;
    this.missed = 0;
    this.startHeartBeat();
    this.flushPending();
    // Re-subscribe everything after reconnect.
    for (const sub of this.subscriptions.values()) {
      this.send({ cmd: 'subscribe', routing_key: sub.routingKey });
    }
  };

  private onMessage = (evt: MessageEvent): void => {
    try {
      const data = JSON.parse(evt.data);
      if (data.cmd === 'pong') {
        this.missed = 0;
        return;
      }
      const routingKey: string | undefined = data.routing_key;
      if (!routingKey) return;
      // Drop our own messages — taiga-events echoes them with the same session.
      if (data.session_id && data.session_id === sessionId) return;
      const listeners = this.listeners.get(routingKey);
      if (listeners) {
        for (const l of listeners) l(data.data ?? data);
      }
    } catch {
      /* ignore parse errors */
    }
  };

  private onError = (): void => {
    this.connected = false;
  };

  private onClose = (): void => {
    this.connected = false;
    if (this.heartbeat) {
      window.clearInterval(this.heartbeat);
      this.heartbeat = null;
    }
    if (!this.destroyed) this.scheduleReconnect();
  };

  private startHeartBeat(): void {
    if (this.heartbeat) window.clearInterval(this.heartbeat);
    this.missed = 0;
    this.heartbeat = window.setInterval(() => {
      if (this.missed >= this.maxMissed) {
        this.start();
        return;
      }
      this.missed++;
      this.send({ cmd: 'ping' });
    }, this.heartbeatMs);
  }

  private flushPending(): void {
    if (!this.connected || !this.ws) return;
    const pending = this.pending;
    this.pending = [];
    for (const m of pending) {
      try {
        this.ws.send(typeof m === 'string' ? m : JSON.stringify(m));
      } catch {
        /* ignore */
      }
    }
  }

  send(message: unknown): void {
    this.pending.push(message);
    if (this.connected) this.flushPending();
  }

  subscribe(routingKey: string, callback: (data: unknown) => void): () => void {
    let listeners = this.listeners.get(routingKey);
    if (!listeners) {
      listeners = new Set();
      this.listeners.set(routingKey, listeners);
      this.subscriptions.set(routingKey, { routingKey, callback });
      this.send({ cmd: 'subscribe', routing_key: routingKey });
    }
    listeners.add(callback);
    return () => {
      const set = this.listeners.get(routingKey);
      if (!set) return;
      set.delete(callback);
      if (set.size === 0) {
        this.listeners.delete(routingKey);
        this.subscriptions.delete(routingKey);
        this.send({ cmd: 'unsubscribe', routing_key: routingKey });
      }
    };
  }
}

export const events = new EventsClient();
