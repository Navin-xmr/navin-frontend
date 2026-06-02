import '@testing-library/jest-dom'
import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'

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

afterEach(() => {
  cleanup();
})
