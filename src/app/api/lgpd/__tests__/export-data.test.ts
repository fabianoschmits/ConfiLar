import { NextRequest } from 'next/server'
import { POST } from '../export-data/route'

// Mock do Supabase
const mockSupabase = {
  auth: {
    getUser: jest.fn(),
  },
  from: jest.fn(() => ({
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    or: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    single: jest.fn(),
  })),
}

jest.mock('@/lib/supabase', () => ({
  supabase: mockSupabase,
}))

// Mock headers
jest.mock('next/headers', () => ({
  headers: jest.fn(() => Promise.resolve({
    get: jest.fn().mockReturnValue('Bearer token'),
  })),
}))

describe('/api/lgpd/export-data', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return 401 when user is not authenticated', async () => {
    mockSupabase.auth.getUser.mockResolvedValueOnce({
      data: { user: null },
      error: new Error('Not authenticated'),
    })

    const request = new NextRequest('http://localhost:3000/api/lgpd/export-data', {
      method: 'POST',
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.error).toBe('Usuário não autenticado')
  })

  it('should export user data successfully', async () => {
    const mockUser = { id: 'user-123', email: 'test@example.com' }
    
    mockSupabase.auth.getUser.mockResolvedValueOnce({
      data: { user: mockUser },
      error: null,
    })

    // Mock profile data
    mockSupabase.from().single.mockResolvedValueOnce({
      data: {
        id: 'user-123',
        email: 'test@example.com',
        full_name: 'Test User',
        user_type: 'client',
      },
      error: null,
    })

    // Mock other data (messages, conversations, etc.)
    mockSupabase.from().order.mockResolvedValue({
      data: [],
      error: null,
    })

    const request = new NextRequest('http://localhost:3000/api/lgpd/export-data', {
      method: 'POST',
    })

    const response = await POST(request)

    expect(response.status).toBe(200)
    expect(response.headers.get('Content-Type')).toBe('application/json')
    expect(response.headers.get('Content-Disposition')).toContain('attachment')
    expect(response.headers.get('Content-Disposition')).toContain('confilar-dados-user-123')
  })

  it('should handle database errors gracefully', async () => {
    const mockUser = { id: 'user-123', email: 'test@example.com' }
    
    mockSupabase.auth.getUser.mockResolvedValueOnce({
      data: { user: mockUser },
      error: null,
    })

    // Mock database error
    mockSupabase.from().single.mockResolvedValueOnce({
      data: null,
      error: new Error('Database error'),
    })

    const request = new NextRequest('http://localhost:3000/api/lgpd/export-data', {
      method: 'POST',
    })

    const response = await POST(request)

    expect(response.status).toBe(200)
    // Should still return data even if some queries fail
  })

  it('should include metadata in exported data', async () => {
    const mockUser = { id: 'user-123', email: 'test@example.com' }
    
    mockSupabase.auth.getUser.mockResolvedValueOnce({
      data: { user: mockUser },
      error: null,
    })

    mockSupabase.from().single.mockResolvedValueOnce({
      data: { id: 'user-123', email: 'test@example.com' },
      error: null,
    })

    mockSupabase.from().order.mockResolvedValue({
      data: [],
      error: null,
    })

    const request = new NextRequest('http://localhost:3000/api/lgpd/export-data', {
      method: 'POST',
    })

    const response = await POST(request)
    const data = await response.json()

    expect(data.metadata).toBeDefined()
    expect(data.metadata.userId).toBe('user-123')
    expect(data.metadata.exportDate).toBeDefined()
    expect(data.metadata.dataVersion).toBe('1.0')
    expect(data.metadata.totalRecords).toBeDefined()
  })
})
