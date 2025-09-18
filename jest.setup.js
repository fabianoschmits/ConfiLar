import '@testing-library/jest-dom'

// Mock do Next.js router
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
    }
  },
  usePathname() {
    return '/'
  },
  useSearchParams() {
    return {
      get: jest.fn(),
    }
  },
}))

// Mock do Supabase
jest.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: jest.fn(),
      getUser: jest.fn(),
      signInWithPassword: jest.fn(),
      signUp: jest.fn(),
      signOut: jest.fn(),
      onAuthStateChange: jest.fn(() => ({
        data: { subscription: { unsubscribe: jest.fn() } }
      })),
    },
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn(),
      order: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
    })),
  },
  createServerSupabaseClient: jest.fn(),
}))

// Mock do Logger
jest.mock('@/lib/logger', () => ({
  Logger: {
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    metric: jest.fn(),
    auth: {
      login: jest.fn(),
      logout: jest.fn(),
      profileFetch: jest.fn(),
      sessionTimeout: jest.fn(),
    },
    api: {
      request: jest.fn(),
      error: jest.fn(),
      cacheHit: jest.fn(),
      cacheMiss: jest.fn(),
    },
    ui: {
      pageView: jest.fn(),
      userAction: jest.fn(),
      errorBoundary: jest.fn(),
    },
    performance: {
      webVital: jest.fn(),
      renderTime: jest.fn(),
      bundleSize: jest.fn(),
    },
  },
  useLogger: jest.fn(() => ({
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    metric: jest.fn(),
  })),
}))

// Mock de Intersection Observer para lazy loading
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  observe() {
    return null
  }
  disconnect() {
    return null
  }
  unobserve() {
    return null
  }
}

// Mock de ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  observe() {
    return null
  }
  disconnect() {
    return null
  }
  unobserve() {
    return null
  }
}

// Limpar todos os mocks após cada teste
afterEach(() => {
  jest.clearAllMocks()
})

