import { checkEmailExists, checkCpfExists, checkDuplicates } from '../checkDuplicates'

// Mock do Supabase
jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      maybeSingle: jest.fn(),
    })),
  },
}))

describe('checkDuplicates', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('checkEmailExists', () => {
    it('should return false for empty email', async () => {
      const result = await checkEmailExists('')
      expect(result).toBe(false)
    })

    it('should return false for null email', async () => {
      const result = await checkEmailExists(null as any)
      expect(result).toBe(false)
    })

    it('should return true when email exists', async () => {
      const { supabase } = require('@/lib/supabase')
      supabase.from().maybeSingle.mockResolvedValueOnce({
        data: { id: '123' },
        error: null,
      })

      const result = await checkEmailExists('test@example.com')
      expect(result).toBe(true)
    })

    it('should return false when email does not exist', async () => {
      const { supabase } = require('@/lib/supabase')
      supabase.from().maybeSingle.mockResolvedValueOnce({
        data: null,
        error: null,
      })

      const result = await checkEmailExists('test@example.com')
      expect(result).toBe(false)
    })

    it('should handle email with different case', async () => {
      const { supabase } = require('@/lib/supabase')
      supabase.from().maybeSingle.mockResolvedValueOnce({
        data: { id: '123' },
        error: null,
      })

      const result = await checkEmailExists('TEST@EXAMPLE.COM')
      expect(result).toBe(true)
      expect(supabase.from().eq).toHaveBeenCalledWith('email', 'test@example.com')
    })
  })

  describe('checkCpfExists', () => {
    it('should return false for empty CPF', async () => {
      const result = await checkCpfExists('')
      expect(result).toBe(false)
    })

    it('should return false for CPF with less than 11 digits', async () => {
      const result = await checkCpfExists('1234567890')
      expect(result).toBe(false)
    })

    it('should clean CPF and check if exists', async () => {
      const { supabase } = require('@/lib/supabase')
      supabase.from().maybeSingle.mockResolvedValueOnce({
        data: { id: '123' },
        error: null,
      })

      const result = await checkCpfExists('123.456.789-01')
      expect(result).toBe(true)
      expect(supabase.from().eq).toHaveBeenCalledWith('cpf_cnpj', '12345678901')
    })

    it('should return false when CPF does not exist', async () => {
      const { supabase } = require('@/lib/supabase')
      supabase.from().maybeSingle.mockResolvedValueOnce({
        data: null,
        error: null,
      })

      const result = await checkCpfExists('12345678901')
      expect(result).toBe(false)
    })
  })

  describe('checkDuplicates', () => {
    it('should check both email and CPF', async () => {
      const { supabase } = require('@/lib/supabase')
      supabase.from().maybeSingle
        .mockResolvedValueOnce({ data: { id: '123' }, error: null }) // email exists
        .mockResolvedValueOnce({ data: null, error: null }) // cpf does not exist

      const result = await checkDuplicates('test@example.com', '12345678901')
      
      expect(result).toEqual({
        emailExists: true,
        cpfExists: false,
      })
    })

    it('should handle null CPF', async () => {
      const { supabase } = require('@/lib/supabase')
      supabase.from().maybeSingle.mockResolvedValueOnce({
        data: null,
        error: null,
      })

      const result = await checkDuplicates('test@example.com', null)
      
      expect(result).toEqual({
        emailExists: false,
        cpfExists: false,
      })
    })
  })
})
