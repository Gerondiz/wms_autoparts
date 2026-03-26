import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterAll, afterEach, beforeAll, jest } from '@jest/globals';

// ============================================
// Mock для next-intl
// ============================================
jest.mock('next-intl', () => ({
  useTranslations: () => {
    return new Proxy(
      {},
      {
        get: () => (key: string) => key,
      }
    );
  },
  getTranslations: () => {
    return new Proxy(
      {},
      {
        get: () => (key: string) => key,
      }
    );
  },
  IntlProvider: ({ children }: { children: React.ReactNode }) => children,
}));

// ============================================
// Mock для next-auth/react
// ============================================
jest.mock('next-auth/react', () => ({
  useSession: () => ({
    data: null,
    status: 'unauthenticated',
  }),
  signIn: jest.fn(),
  signOut: jest.fn(),
  getSession: jest.fn(),
}));

// ============================================
// Mock для next-auth
// ============================================
jest.mock('next-auth', () => ({
  auth: jest.fn(),
  getSession: jest.fn(),
}));

// ============================================
// Mock для next/navigation
// ============================================
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
  }),
  usePathname: () => '',
  useSearchParams: () => ({
    get: jest.fn(),
    has: jest.fn(),
    toString: jest.fn(),
  }),
  useParams: () => ({}),
  redirect: jest.fn(),
  permanentRedirect: jest.fn(),
  notFound: jest.fn(),
}));

// ============================================
// Mock для window.matchMedia
// ============================================
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// ============================================
// Mock для localStorage
// ============================================
const localStorageMock = {
  store: {} as Record<string, string>,
  clear() {
    this.store = {};
  },
  getItem(key: string) {
    return this.store[key] || null;
  },
  setItem(key: string, value: string) {
    this.store[key] = String(value);
  },
  removeItem(key: string) {
    delete this.store[key];
  },
  key(index: number) {
    return Object.keys(this.store)[index] || null;
  },
  get length() {
    return Object.keys(this.store).length;
  },
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

// ============================================
// Глобальные хелперы для тестов
// ============================================

/**
 * Создать мок сессию пользователя
 */
export function createMockSession(overrides?: Partial<any>) {
  return {
    user: {
      id: 1,
      email: 'test@example.com',
      fullName: 'Test User',
      roleTypeId: 1,
      roleName: 'mechanic',
      permissions: ['order_create', 'order_view', 'parts_view'],
    },
    ...overrides,
  };
}

/**
 * Создать мок ответ API
 */
export function createMockApiResponse<T>(data: T, success = true) {
  return {
    success,
    data,
    error: null,
    timestamp: new Date().toISOString(),
  };
}

// ============================================
// Очистка после каждого теста
// ============================================
afterEach(() => {
  cleanup();
  jest.clearAllMocks();
  localStorageMock.clear();
});

// ============================================
// Глобальные таймауты
// ============================================
beforeAll(() => {
  jest.setTimeout(10000);
});

afterAll(() => {
  jest.restoreAllMocks();
});

// ============================================
// Подавление console.error в тестах (раскомментировать при необходимости)
// ============================================
// const originalConsoleError = console.error;
// console.error = (...args) => {
//   if (args[0]?.includes?.('Warning: An update to')) return;
//   originalConsoleError.apply(console, args);
// };
