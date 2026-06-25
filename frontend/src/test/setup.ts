import '@testing-library/jest-dom'
import { cleanup } from '@testing-library/react'
import { afterEach, vi } from 'vitest'

// jsdom does not implement IntersectionObserver — provide a no-op stub so hooks
// that call it (e.g. useScrollSpy) don't crash during unit tests.
const IntersectionObserverMock = class {
  observe() {}
  unobserve() {}
  disconnect() {}
};
Object.defineProperty(window, 'IntersectionObserver', {
  writable: true,
  configurable: true,
  value: IntersectionObserverMock,
});

// jsdom v28 introduced --localstorage-file which can break the default Storage API.
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

// IntersectionObserver is not available in jsdom — provide a no-op mock.
class IntersectionObserverMock {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
}
Object.defineProperty(window, 'IntersectionObserver', {
  value: IntersectionObserverMock,
  writable: true,
  configurable: true,
});

afterEach(() => {
  cleanup();
})
