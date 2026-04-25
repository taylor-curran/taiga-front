import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';

// jsdom doesn't implement WebSocket fully; stub.
// @ts-expect-error – intentionally undefined for tests
globalThis.WebSocket = class FakeWS {
  onopen: () => void = () => undefined;
  onmessage: () => void = () => undefined;
  onerror: () => void = () => undefined;
  onclose: () => void = () => undefined;
  addEventListener = vi.fn();
  removeEventListener = vi.fn();
  send = vi.fn();
  close = vi.fn();
} as unknown as typeof WebSocket;

if (!('matchMedia' in globalThis)) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: () => ({ matches: false, addListener: () => undefined, removeListener: () => undefined, addEventListener: () => undefined, removeEventListener: () => undefined, dispatchEvent: () => false }),
  });
}
