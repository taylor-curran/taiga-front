// WebSocket events service — port of EventsService from events.coffee
// Handles: connection, auth handshake, subscribe/unsubscribe, heartbeat, reconnection

import { useAuthStore } from '../auth/store';

type EventCallback = (data: unknown) => void;

interface Subscription {
  routingKey: string;
  callback: EventCallback;
}

interface EventMessage {
  cmd: string;
  routing_key?: string;
  data?: unknown;
  options?: Record<string, unknown>;
}

const DEFAULT_RECONNECT_INTERVAL = 10000;
const DEFAULT_MAX_ERRORS = 5;
const DEFAULT_MAX_MISSED_HEARTBEATS = 5;
const DEFAULT_HEARTBEAT_INTERVAL = 60000;

class EventsService {
  private ws: WebSocket | null = null;
  private subscriptions: Map<string, Subscription> = new Map();
  private pendingMessages: EventMessage[] = [];
  private connected = false;
  private errors = 0;
  private missedHeartbeats = 0;
  private heartbeatTimer: ReturnType<typeof setInterval> | null = null;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private sessionId: string;
  private eventsUrl: string | null = null;
  private listeners: Set<(routingKey: string, data: unknown) => void> = new Set();

  constructor() {
    this.sessionId = sessionStorage.getItem('taiga-session-id') || this.generateSessionId();
    sessionStorage.setItem('taiga-session-id', this.sessionId);
  }

  private generateSessionId(): string {
    return `${Date.now()}-${Math.floor(Math.random() * 0x9000000).toString(16)}`;
  }

  setEventsUrl(url: string | null) {
    this.eventsUrl = url;
  }

  connect() {
    this.disconnect();

    if (!this.eventsUrl) return;

    let url = this.eventsUrl;
    if (!url.startsWith('ws:') && !url.startsWith('wss:')) {
      const loc = window.location;
      const scheme = loc.protocol === 'https:' ? 'wss:' : 'ws:';
      const path = url.replace(/^\//, '');
      url = `${scheme}//${loc.host}/${path}`;
    }

    this.ws = new WebSocket(url);
    this.ws.addEventListener('open', this.onOpen);
    this.ws.addEventListener('message', this.onMessage);
    this.ws.addEventListener('error', this.onError);
    this.ws.addEventListener('close', this.onClose);
  }

  disconnect() {
    if (this.ws) {
      this.ws.removeEventListener('open', this.onOpen);
      this.ws.removeEventListener('message', this.onMessage);
      this.ws.removeEventListener('error', this.onError);
      this.ws.removeEventListener('close', this.onClose);
      this.stopHeartbeat();
      this.ws.close();
      this.ws = null;
    }
    this.connected = false;
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }

  subscribe(routingKey: string, callback: EventCallback) {
    const sub: Subscription = { routingKey, callback };
    this.subscriptions.set(routingKey, sub);
    this.sendMessage({ cmd: 'subscribe', routing_key: routingKey });
    return () => this.unsubscribe(routingKey);
  }

  unsubscribe(routingKey: string) {
    this.subscriptions.delete(routingKey);
    this.sendMessage({ cmd: 'unsubscribe', routing_key: routingKey });
  }

  addGlobalListener(fn: (routingKey: string, data: unknown) => void) {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  private sendMessage(msg: EventMessage) {
    this.pendingMessages.push(msg);
    if (!this.connected) return;
    this.flushPending();
  }

  private flushPending() {
    for (const msg of this.pendingMessages) {
      this.ws?.send(JSON.stringify(msg));
    }
    this.pendingMessages = [];
  }

  private onOpen = () => {
    this.connected = true;
    this.errors = 0;

    // Auth handshake
    const token = useAuthStore.getState().token;
    this.ws?.send(JSON.stringify({
      cmd: 'auth',
      data: { token, sessionId: this.sessionId },
    }));

    this.flushPending();
    this.startHeartbeat();
  };

  private onMessage = (event: MessageEvent) => {
    let data: { routing_key?: string; data?: unknown; cmd?: string };
    try {
      data = JSON.parse(event.data);
    } catch {
      return;
    }

    // Pong response
    if (data.cmd === 'pong') {
      this.missedHeartbeats = 0;
      return;
    }

    const routingKey = data.routing_key;
    if (!routingKey) return;

    const sub = this.subscriptions.get(routingKey);
    if (sub) sub.callback(data.data);

    for (const fn of this.listeners) {
      fn(routingKey, data.data);
    }
  };

  private onError = () => {
    this.errors++;
  };

  private onClose = () => {
    this.connected = false;
    this.stopHeartbeat();

    if (this.errors < DEFAULT_MAX_ERRORS) {
      this.reconnectTimer = setTimeout(() => {
        this.connect();
      }, DEFAULT_RECONNECT_INTERVAL);
    }
  };

  private startHeartbeat() {
    this.stopHeartbeat();
    this.missedHeartbeats = 0;
    this.heartbeatTimer = setInterval(() => {
      if (this.missedHeartbeats >= DEFAULT_MAX_MISSED_HEARTBEATS) {
        this.connect(); // reconnect
        return;
      }
      this.missedHeartbeats++;
      this.ws?.send(JSON.stringify({ cmd: 'ping' }));
    }, DEFAULT_HEARTBEAT_INTERVAL);
  }

  private stopHeartbeat() {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }
}

export const eventsService = new EventsService();
