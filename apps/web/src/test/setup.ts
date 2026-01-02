import { vi } from 'vitest';

// Mock localStorage
const localStorageMock = {
  store: {} as Record<string, string>,
  getItem: (key: string) => localStorageMock.store[key] || null,
  setItem: (key: string, value: string) => {
    localStorageMock.store[key] = value;
  },
  removeItem: (key: string) => {
    delete localStorageMock.store[key];
  },
  clear: () => {
    localStorageMock.store = {};
  },
  get length() {
    return Object.keys(localStorageMock.store).length;
  },
  key: (index: number) => {
    const keys = Object.keys(localStorageMock.store);
    return keys[index] || null;
  },
};

Object.defineProperty(globalThis, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

// Mock fetch
globalThis.fetch = vi.fn();

// Reset mocks before each test
beforeEach(() => {
  localStorageMock.clear();
  vi.clearAllMocks();
});

// Mock window.location
Object.defineProperty(globalThis, 'location', {
  value: {
    hostname: 'localhost',
    pathname: '/',
    href: 'http://localhost:3000/',
    origin: 'http://localhost:3000',
  },
  writable: true,
});

// Mock CustomEvent for i18n tests
if (typeof CustomEvent === 'undefined') {
  (globalThis as any).CustomEvent = class CustomEvent extends Event {
    detail: any;
    constructor(type: string, options?: { detail?: any }) {
      super(type);
      this.detail = options?.detail;
    }
  };
}
