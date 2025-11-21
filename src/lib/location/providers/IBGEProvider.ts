import { LocationProvider, State, City, Address } from '../types'
import { ibgeService } from '@/lib/ibge'

export class IBGEProvider implements LocationProvider {
  country: 'BR' = 'BR'

  async getStates(): Promise<State[]> {
    try {
      const estados = await ibgeService.getEstados()
      return estados.map(estado => ({
        id: estado.id,
        code: estado.sigla,
        name: estado.nome,
        country: 'BR'
      }))
    } catch (error) {
      console.error('Erro ao buscar estados do IBGE:', error)
      return []
    }
  }

  async getCitiesByState(stateCode: string): Promise<City[]> {
    try {
      const cidades = await ibgeService.getCidadesByEstado(stateCode)
      return cidades.map(cidade => ({
        id: cidade.id,
        name: cidade.nome,
        stateCode: cidade.estadoSigla,
        stateName: cidade.estado,
        country: 'BR'
      }))
    } catch (error) {
      console.error('Erro ao buscar cidades do IBGE:', error)
      return []
    }
  }

  async searchCities(term: string, stateCode?: string): Promise<City[]> {
    try {
      const cidades = await ibgeService.searchCidades(term, stateCode)
      return cidades.map(cidade => ({
        id: cidade.id,
        name: cidade.nome,
        stateCode: cidade.estadoSigla,
        stateName: cidade.estado,
        country: 'BR'
      }))
    } catch (error) {
      console.error('Erro ao buscar cidades do IBGE:', error)
      return []
    }
  }

  validatePostalCode(code: string): boolean {
    // CEP brasileiro: 8 dígitos (pode ter hífen: 12345-678)
    const cleanCode = code.replace(/\D/g, '')
    return cleanCode.length === 8
  }

  formatPostalCode(code: string): string {
    const cleanCode = code.replace(/\D/g, '')
    if (cleanCode.length === 8) {
      return `${cleanCode.slice(0, 5)}-${cleanCode.slice(5)}`
    }
    return cleanCode
  }

  formatAddress(address: Address): string {
    const parts: string[] = []
    if (address.address) parts.push(address.address)
    if (address.addressNumber) parts.push(address.addressNumber)
    if (address.neighborhood) parts.push(address.neighborhood)
    if (address.city) parts.push(address.city)
    if (address.stateCode) parts.push(address.stateCode)
    if (address.zipCode) parts.push(this.formatPostalCode(address.zipCode))
    return parts.join(', ')
  }
}

