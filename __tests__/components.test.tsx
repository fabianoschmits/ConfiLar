import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from '@/contexts/AuthContext'
import { UserAvatar } from '@/components/ui/UserAvatar'
import { LoginForm } from '@/components/forms/LoginForm'
import { Logger } from '@/lib/logger'

// Helper para criar wrapper com providers
function createTestWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })

  return function TestWrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </QueryClientProvider>
    )
  }
}

describe('UserAvatar Component', () => {
  it('should display fallback when no image provided', () => {
    render(<UserAvatar fallback="JD" />, {
      wrapper: createTestWrapper(),
    })
    
    expect(screen.getByText('JD')).toBeInTheDocument()
  })

  it('should display image when src is provided', () => {
    render(
      <UserAvatar 
        src="https://example.com/avatar.jpg" 
        alt="User Avatar" 
        fallback="JD" 
      />,
      { wrapper: createTestWrapper() }
    )
    
    const image = screen.getByRole('img', { name: /user avatar/i })
    expect(image).toBeInTheDocument()
    expect(image).toHaveAttribute('src', 'https://example.com/avatar.jpg')
  })

  it('should handle different sizes correctly', () => {
    const { rerender } = render(
      <UserAvatar fallback="JD" size="sm" />,
      { wrapper: createTestWrapper() }
    )
    
    expect(screen.getByText('JD')).toBeInTheDocument()

    rerender(<UserAvatar fallback="JD" size="lg" />)
    expect(screen.getByText('JD')).toBeInTheDocument()
  })

  it('should apply custom className', () => {
    render(
      <UserAvatar fallback="JD" className="custom-class" />,
      { wrapper: createTestWrapper() }
    )
    
    const avatar = screen.getByText('JD').closest('div')
    expect(avatar).toHaveClass('custom-class')
  })
})

describe('LoginForm Component', () => {
  const user = userEvent.setup()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render login form correctly', () => {
    render(<LoginForm />, { wrapper: createTestWrapper() })
    
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/senha/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /entrar/i })).toBeInTheDocument()
  })

  it('should show validation errors for empty fields', async () => {
    render(<LoginForm />, { wrapper: createTestWrapper() })
    
    const submitButton = screen.getByRole('button', { name: /entrar/i })
    
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText(/email deve ter um formato válido/i)).toBeInTheDocument()
    })
  })

  it('should show validation error for invalid email', async () => {
    render(<LoginForm />, { wrapper: createTestWrapper() })
    
    const emailInput = screen.getByLabelText(/email/i)
    const submitButton = screen.getByRole('button', { name: /entrar/i })
    
    await user.type(emailInput, 'invalid-email')
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText(/email deve ter um formato válido/i)).toBeInTheDocument()
    })
  })

  it('should submit form with valid data', async () => {
    const mockSignIn = jest.fn().mockResolvedValue({ error: null })
    
    // Mock do contexto de auth
    jest.mock('@/contexts/AuthContext', () => ({
      useAuthContext: () => ({
        signIn: mockSignIn,
        loading: false,
      }),
    }))

    render(<LoginForm />, { wrapper: createTestWrapper() })
    
    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/senha/i)
    const submitButton = screen.getByRole('button', { name: /entrar/i })
    
    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, 'password123')
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith('test@example.com', 'password123')
    })
  })
})

describe('Validation Functions', () => {
  it('should validate CPF correctly', () => {
    const { ValidationUtils } = require('@/lib/validation')
    
    // CPF válido
    expect(ValidationUtils.isValidCPF('123.456.789-09')).toBe(false) // CPF de teste inválido
    
    // CPF inválido
    expect(ValidationUtils.isValidCPF('123.456.789-00')).toBe(false)
    expect(ValidationUtils.isValidCPF('111.111.111-11')).toBe(false) // Sequência
    expect(ValidationUtils.isValidCPF('123')).toBe(false) // Muito curto
  })

  it('should format phone number correctly', () => {
    const { ValidationUtils } = require('@/lib/validation')
    
    expect(ValidationUtils.formatPhone('11999999999')).toBe('(11) 99999-9999')
    expect(ValidationUtils.formatPhone('1199999999')).toBe('(11) 9999-9999')
    expect(ValidationUtils.formatPhone('invalid')).toBe('invalid')
  })

  it('should format CPF correctly', () => {
    const { ValidationUtils } = require('@/lib/validation')
    
    expect(ValidationUtils.formatCPF('12345678909')).toBe('123.456.789-09')
    expect(ValidationUtils.formatCPF('123')).toBe('123')
  })
})

describe('Logger', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should log debug messages in development', () => {
    const consoleSpy = jest.spyOn(console, 'groupCollapsed').mockImplementation()
    
    Logger.debug('test-context', 'Test debug message', { test: true })
    
    expect(consoleSpy).toHaveBeenCalled()
    
    consoleSpy.mockRestore()
  })

  it('should log auth events correctly', () => {
    const consoleSpy = jest.spyOn(console, 'groupCollapsed').mockImplementation()
    
    Logger.auth.login('test@example.com', true)
    Logger.auth.logout('user-id')
    
    expect(consoleSpy).toHaveBeenCalledTimes(2)
    
    consoleSpy.mockRestore()
  })

  it('should log API requests correctly', () => {
    const consoleSpy = jest.spyOn(console, 'groupCollapsed').mockImplementation()
    
    Logger.api.request('/test-endpoint', 'GET', 150)
    Logger.api.cacheHit('test-cache-key')
    Logger.api.cacheMiss('test-cache-key')
    
    expect(consoleSpy).toHaveBeenCalledTimes(3)
    
    consoleSpy.mockRestore()
  })

  it('should handle errors correctly', () => {
    const consoleSpy = jest.spyOn(console, 'groupCollapsed').mockImplementation()
    
    const testError = new Error('Test error')
    Logger.error('test-context', testError, { additional: 'data' })
    
    expect(consoleSpy).toHaveBeenCalled()
    
    consoleSpy.mockRestore()
  })
})

