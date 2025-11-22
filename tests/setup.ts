import { afterEach, beforeEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Create a proper localStorage mock that supports Object.keys()
const createStorageMock = () => {
  let store: Record<string, string> = {};
  
  const mockStorage = {
    getItem(key: string) {
      return store[key] || null;
    },
    setItem(key: string, value: string) {
      store[key] = value.toString();
    },
    removeItem(key: string) {
      delete store[key];
    },
    clear() {
      store = {};
    },
    get length() {
      return Object.keys(store).length;
    },
    key(index: number) {
      const keys = Object.keys(store);
      return keys[index] || null;
    },
  };

  // Make Object.keys(localStorage) work by making store keys enumerable
  return new Proxy(mockStorage, {
    ownKeys: () => Object.keys(store),
    getOwnPropertyDescriptor: (target, prop) => {
      if (typeof prop === 'string' && prop in store) {
        return { enumerable: true, configurable: true, value: store[prop] };
      }
      return Object.getOwnPropertyDescriptor(target, prop);
    }
  });
};

global.localStorage = createStorageMock() as Storage;
global.sessionStorage = createStorageMock() as Storage;

// Reset storage before each test
beforeEach(() => {
  localStorage.clear();
  sessionStorage.clear();
});
