import { LocationProvider, State, City, Address, Country } from './types'
import { IBGEProvider } from './providers/IBGEProvider'
import { USLocationProvider } from './providers/USLocationProvider'

// Cache para providers
const providersCache = new Map<Country, LocationProvider>()

// Factory para criar providers
function createProvider(country: Country): LocationProvider {
  switch (country) {
    case 'BR':
      return new IBGEProvider()
    case 'US':
      return new USLocationProvider()
    default:
      // Fallback para Brasil se país não suportado
      return new IBGEProvider()
  }
}

// Obter provider (com cache)
function getProvider(country: Country): LocationProvider {
  if (!providersCache.has(country)) {
    providersCache.set(country, createProvider(country))
  }
  return providersCache.get(country)!
}

export class LocationService {
  private provider: LocationProvider

  constructor(country: Country = 'BR') {
    this.provider = getProvider(country)
  }

  get country(): Country {
    return this.provider.country
  }

  async getStates(): Promise<State[]> {
    return this.provider.getStates()
  }

  async getCitiesByState(stateCode: string): Promise<City[]> {
    return this.provider.getCitiesByState(stateCode)
  }

  async searchCities(term: string, stateCode?: string): Promise<City[]> {
    return this.provider.searchCities(term, stateCode)
  }

  validatePostalCode(code: string): boolean {
    return this.provider.validatePostalCode(code)
  }

  formatPostalCode(code: string): string {
    return this.provider.formatPostalCode(code)
  }

  formatAddress(address: Address): string {
    return this.provider.formatAddress(address)
  }

  // Método para mudar o país dinamicamente
  setCountry(country: Country): void {
    this.provider = getProvider(country)
  }
}

// Instância singleton padrão (Brasil)
export const locationService = new LocationService('BR')

// Função helper para criar serviço por país
export function createLocationService(country: Country): LocationService {
  return new LocationService(country)
}

