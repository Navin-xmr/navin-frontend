import '@testing-library/jest-dom'
import { cleanup } from '@testing-library/react'
import { afterEach, vi } from 'vitest'

Object.defineProperty(globalThis, 'IS_REACT_ACT_ENVIRONMENT', {
  value: true,
  writable: true,
  configurable: true,
});

// jsdom does not implement IntersectionObserver — provide a no-op stub.
// The mock methods live on the prototype (not instance fields) so tests can
// reset call history with `IntersectionObserver.prototype.observe.mockClear()`.
// NOTE: no `observe/unobserve/disconnect` class fields may be declared next to
// these — with `useDefineForClassFields`, a field without an initializer would
// shadow the prototype method with `undefined` on every instance.
type IOMock = IntersectionObserverMock & {
  observe: ReturnType<typeof vi.fn>;
  unobserve: ReturnType<typeof vi.fn>;
  disconnect: ReturnType<typeof vi.fn>;
};
class IntersectionObserverMock {
  static lastOptions: IntersectionObserverInit | undefined;
  callback: IntersectionObserverCallback;
  options?: IntersectionObserverInit;
  constructor(callback: IntersectionObserverCallback, options?: IntersectionObserverInit) {
    this.callback = callback;
    this.options = options;
    IntersectionObserverMock.lastOptions = options;
  }
}
const ioProto = IntersectionObserverMock.prototype as IOMock;
ioProto.observe = vi.fn();
ioProto.unobserve = vi.fn();
ioProto.disconnect = vi.fn();
Object.defineProperty(window, 'IntersectionObserver', {
  value: IntersectionObserverMock,
  writable: true,
  configurable: true,
});

// Replace localStorage/sessionStorage with reliable in-memory implementations.
const makeStorage = () => {
  const store: Record<string, string> = {};
  return {
    getItem: (key: string) => Object.prototype.hasOwnProperty.call(store, key) ? store[key] : null,
    setItem: (key: string, value: string) => { store[key] = String(value); },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { Object.keys(store).forEach(k => delete store[k]); },
    get length() { return Object.keys(store).length; },
    key: (index: number) => Object.keys(store)[index] ?? null,
  };
};

Object.defineProperty(window, 'localStorage', { value: makeStorage(), writable: true, configurable: true });
Object.defineProperty(window, 'sessionStorage', { value: makeStorage(), writable: true, configurable: true });

// i18n reads localStorage at import time, so it must load after the storage
// mocks above are in place — a static top-level import would be hoisted
// ahead of them and crash against jsdom's unconfigured localStorage.
await import('../i18n');

afterEach(() => {
  cleanup();
})
