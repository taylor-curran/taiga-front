import { getConfig } from './client';
import { useAuthStore } from '../stores/auth';

type EventCallback = (data: Record<string, unknown>) => void;

interface Subscription {
  scope: string;
  callback: EventCallback;
}

class EventsService {
  private ws: WebSocket | null = null;
  private subscriptions: Map<string, Subscription> = new Map();
  private connected = false;
  private errors = 0;
  private maxErrors = 5;
  private reconnectInterval = 10000;
  private heartbeatInterval: ReturnType<typeof setInterval> | null = null;
  private missedHeartbeats = 0;
  private maxMissedHeartbeats = 5;
  private heartbeatIntervalTime = 60000;
  private pendingMessages: string[] = [];
  private sessionId: string;

  constructor() {
    this.sessionId = Date.now().toString(36) + Math.random().toString(36).slice(2);
  }

  initialize() {
    const config = getConfig();
    if (config) {
      this.reconnectInterval = config.eventsReconnectTryInterval || 10000;
      this.maxMissedHeartbeats = config.eventsMaxMissedHeartbeats || 5;
      this.heartbeatIntervalTime = config.eventsHeartbeatIntervalTime || 60000;
    }
  }

  setupConnection() {
    this.stopExistingConnection();
    const config = getConfig();
    if (!config?.eventsUrl) return;

    let url = config.eventsUrl;
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

  stopExistingConnection() {
    if (!this.ws) return;
    this.connected = false;
    this.ws.removeEventListener('open', this.onOpen);
    this.ws.removeEventListener('message', this.onMessage);
    this.ws.removeEventListener('error', this.onError);
    this.ws.removeEventListener('close', this.onClose);
    this.stopHeartbeat();
    this.ws.close();
    this.ws = null;
  }

  private onOpen = () => {
    this.connected = true;
    this.errors = 0;
    this.startHeartbeat();

    // Send pending messages
    for (const msg of this.pendingMessages) {
      this.ws?.send(msg);
    }
    this.pendingMessages = [];

    // Re-subscribe all
    for (const [routingKey, sub] of this.subscriptions) {
      this.sendSubscribe(routingKey);
      void sub;
    }
  };

  private onMessage = (event: MessageEvent) => {
    this.missedHeartbeats = 0;
    try {
      const data = JSON.parse(event.data as string);
      if (data.routing_key) {
        const sub = this.subscriptions.get(data.routing_key);
        if (sub) {
          sub.callback(data.data);
        }
      }
    } catch {
      // ignore parse errors
    }
  };

  private onError = () => {
    this.errors++;
    if (this.errors >= this.maxErrors) {
      this.stopExistingConnection();
    }
  };

  private onClose = () => {
    this.connected = false;
    this.stopHeartbeat();
    if (this.errors < this.maxErrors) {
      setTimeout(() => this.setupConnection(), this.reconnectInterval);
    }
  };

  private startHeartbeat() {
    this.missedHeartbeats = 0;
    this.heartbeatInterval = setInterval(() => {
      this.missedHeartbeats++;
      if (this.missedHeartbeats > this.maxMissedHeartbeats) {
        this.stopExistingConnection();
        this.setupConnection();
      }
    }, this.heartbeatIntervalTime);
  }

  private stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  private sendSubscribe(routingKey: string) {
    const token = useAuthStore.getState().token;
    const msg = JSON.stringify({
      command: 'subscribe',
      routing_key: routingKey,
      session_id: this.sessionId,
      ...(token ? { auth_token: token } : {}),
    });
    if (this.connected && this.ws) {
      this.ws.send(msg);
    } else {
      this.pendingMessages.push(msg);
    }
  }

  subscribe(scope: string, routingKey: string, callback: EventCallback) {
    const key = routingKey;
    this.subscriptions.set(key, { scope, callback });
    this.sendSubscribe(key);
  }

  unsubscribe(routingKey: string) {
    this.subscriptions.delete(routingKey);
    if (this.connected && this.ws) {
      this.ws.send(JSON.stringify({ command: 'unsubscribe', routing_key: routingKey }));
    }
  }

  unsubscribeAll() {
    for (const key of this.subscriptions.keys()) {
      this.unsubscribe(key);
    }
    this.subscriptions.clear();
  }

  disconnect() {
    this.unsubscribeAll();
    this.stopExistingConnection();
  }
}

export const eventsService = new EventsService();
