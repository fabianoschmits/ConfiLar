import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { CookieConsentBanner } from '../CookieConsentBanner'

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
})

describe('CookieConsentBanner', () => {
  beforeEach(() => {
    localStorageMock.getItem.mockClear()
    localStorageMock.setItem.mockClear()
    localStorageMock.removeItem.mockClear()
    localStorageMock.clear.mockClear()
  })

  it('should show banner when no consent is given', () => {
    localStorageMock.getItem.mockReturnValue(null)
    
    render(<CookieConsentBanner />)
    
    expect(screen.getByText('🍪 Usamos cookies para melhorar sua experiência')).toBeInTheDocument()
    expect(screen.getByText('Aceitar Todos')).toBeInTheDocument()
    expect(screen.getByText('Configurações')).toBeInTheDocument()
  })

  it('should not show banner when consent is already given', () => {
    localStorageMock.getItem.mockReturnValue('true')
    
    render(<CookieConsentBanner />)
    
    expect(screen.queryByText('🍪 Usamos cookies para melhorar sua experiência')).not.toBeInTheDocument()
  })

  it('should accept all cookies when clicking "Aceitar Todos"', async () => {
    localStorageMock.getItem.mockReturnValue(null)
    
    render(<CookieConsentBanner />)
    
    const acceptAllButton = screen.getByText('Aceitar Todos')
    fireEvent.click(acceptAllButton)
    
    await waitFor(() => {
      expect(localStorageMock.setItem).toHaveBeenCalledWith('cookie-consent', 'true')
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'cookie-preferences',
        JSON.stringify({
          essential: true,
          functional: true,
          analytical: true,
          marketing: true,
        })
      )
    })
  })

  it('should show settings modal when clicking "Configurações"', () => {
    localStorageMock.getItem.mockReturnValue(null)
    
    render(<CookieConsentBanner />)
    
    const settingsButton = screen.getByText('Configurações')
    fireEvent.click(settingsButton)
    
    expect(screen.getByText('Configurações de Cookies')).toBeInTheDocument()
    expect(screen.getByText('Cookies Essenciais')).toBeInTheDocument()
    expect(screen.getByText('Cookies Funcionais')).toBeInTheDocument()
    expect(screen.getByText('Cookies Analíticos')).toBeInTheDocument()
    expect(screen.getByText('Cookies de Marketing')).toBeInTheDocument()
  })

  it('should toggle cookie preferences in settings', () => {
    localStorageMock.getItem.mockReturnValue(null)
    
    render(<CookieConsentBanner />)
    
    // Open settings
    const settingsButton = screen.getByText('Configurações')
    fireEvent.click(settingsButton)
    
    // Find functional cookies switch
    const functionalSwitch = screen.getByLabelText('Cookies Funcionais')
    expect(functionalSwitch).not.toBeChecked()
    
    // Toggle the switch
    fireEvent.click(functionalSwitch)
    expect(functionalSwitch).toBeChecked()
  })

  it('should save custom preferences', async () => {
    localStorageMock.getItem.mockReturnValue(null)
    
    render(<CookieConsentBanner />)
    
    // Open settings
    const settingsButton = screen.getByText('Configurações')
    fireEvent.click(settingsButton)
    
    // Toggle functional cookies
    const functionalSwitch = screen.getByLabelText('Cookies Funcionais')
    fireEvent.click(functionalSwitch)
    
    // Save preferences
    const saveButton = screen.getByText('Salvar Preferências')
    fireEvent.click(saveButton)
    
    await waitFor(() => {
      expect(localStorageMock.setItem).toHaveBeenCalledWith('cookie-consent', 'true')
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'cookie-preferences',
        JSON.stringify({
          essential: true,
          functional: true,
          analytical: false,
          marketing: false,
        })
      )
    })
  })

  it('should load saved preferences', () => {
    const savedPreferences = {
      essential: true,
      functional: true,
      analytical: false,
      marketing: true,
    }
    
    localStorageMock.getItem
      .mockReturnValueOnce('true') // cookie-consent
      .mockReturnValueOnce(JSON.stringify(savedPreferences)) // cookie-preferences
    
    render(<CookieConsentBanner />)
    
    // Should not show banner since consent is given
    expect(screen.queryByText('🍪 Usamos cookies para melhorar sua experiência')).not.toBeInTheDocument()
  })
})
