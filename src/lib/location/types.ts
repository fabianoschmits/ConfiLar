// Tipos comuns para sistema de localização multi-país

export interface State {
  id: string | number;
  code: string; // Sigla (ex: "SP", "CA")
  name: string;
  country: string;
}

export interface City {
  id: string | number;
  name: string;
  stateCode: string;
  stateName: string;
  country: string;
}

export interface Address {
  country: string;
  state?: string;
  stateCode?: string;
  city?: string;
  neighborhood?: string;
  address?: string;
  addressNumber?: string;
  zipCode?: string;
}

export type Country = "BR" | "US" | "CA" | "MX" | "GB" | "AU";

// Interface base para providers de localização
export interface LocationProvider {
  country: Country;
  getStates(): Promise<State[]>;
  getCitiesByState(stateCode: string): Promise<City[]>;
  searchCities(term: string, stateCode?: string): Promise<City[]>;
  validatePostalCode(code: string): boolean;
  formatPostalCode(code: string): string;
  formatAddress(address: Address): string;
}
