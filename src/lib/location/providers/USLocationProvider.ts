import { LocationProvider, State, City, Address } from '../types'

// Estados dos EUA (50 estados + DC)
const US_STATES: State[] = [
  { id: 'AL', code: 'AL', name: 'Alabama', country: 'US' },
  { id: 'AK', code: 'AK', name: 'Alaska', country: 'US' },
  { id: 'AZ', code: 'AZ', name: 'Arizona', country: 'US' },
  { id: 'AR', code: 'AR', name: 'Arkansas', country: 'US' },
  { id: 'CA', code: 'CA', name: 'California', country: 'US' },
  { id: 'CO', code: 'CO', name: 'Colorado', country: 'US' },
  { id: 'CT', code: 'CT', name: 'Connecticut', country: 'US' },
  { id: 'DE', code: 'DE', name: 'Delaware', country: 'US' },
  { id: 'FL', code: 'FL', name: 'Florida', country: 'US' },
  { id: 'GA', code: 'GA', name: 'Georgia', country: 'US' },
  { id: 'HI', code: 'HI', name: 'Hawaii', country: 'US' },
  { id: 'ID', code: 'ID', name: 'Idaho', country: 'US' },
  { id: 'IL', code: 'IL', name: 'Illinois', country: 'US' },
  { id: 'IN', code: 'IN', name: 'Indiana', country: 'US' },
  { id: 'IA', code: 'IA', name: 'Iowa', country: 'US' },
  { id: 'KS', code: 'KS', name: 'Kansas', country: 'US' },
  { id: 'KY', code: 'KY', name: 'Kentucky', country: 'US' },
  { id: 'LA', code: 'LA', name: 'Louisiana', country: 'US' },
  { id: 'ME', code: 'ME', name: 'Maine', country: 'US' },
  { id: 'MD', code: 'MD', name: 'Maryland', country: 'US' },
  { id: 'MA', code: 'MA', name: 'Massachusetts', country: 'US' },
  { id: 'MI', code: 'MI', name: 'Michigan', country: 'US' },
  { id: 'MN', code: 'MN', name: 'Minnesota', country: 'US' },
  { id: 'MS', code: 'MS', name: 'Mississippi', country: 'US' },
  { id: 'MO', code: 'MO', name: 'Missouri', country: 'US' },
  { id: 'MT', code: 'MT', name: 'Montana', country: 'US' },
  { id: 'NE', code: 'NE', name: 'Nebraska', country: 'US' },
  { id: 'NV', code: 'NV', name: 'Nevada', country: 'US' },
  { id: 'NH', code: 'NH', name: 'New Hampshire', country: 'US' },
  { id: 'NJ', code: 'NJ', name: 'New Jersey', country: 'US' },
  { id: 'NM', code: 'NM', name: 'New Mexico', country: 'US' },
  { id: 'NY', code: 'NY', name: 'New York', country: 'US' },
  { id: 'NC', code: 'NC', name: 'North Carolina', country: 'US' },
  { id: 'ND', code: 'ND', name: 'North Dakota', country: 'US' },
  { id: 'OH', code: 'OH', name: 'Ohio', country: 'US' },
  { id: 'OK', code: 'OK', name: 'Oklahoma', country: 'US' },
  { id: 'OR', code: 'OR', name: 'Oregon', country: 'US' },
  { id: 'PA', code: 'PA', name: 'Pennsylvania', country: 'US' },
  { id: 'RI', code: 'RI', name: 'Rhode Island', country: 'US' },
  { id: 'SC', code: 'SC', name: 'South Carolina', country: 'US' },
  { id: 'SD', code: 'SD', name: 'South Dakota', country: 'US' },
  { id: 'TN', code: 'TN', name: 'Tennessee', country: 'US' },
  { id: 'TX', code: 'TX', name: 'Texas', country: 'US' },
  { id: 'UT', code: 'UT', name: 'Utah', country: 'US' },
  { id: 'VT', code: 'VT', name: 'Vermont', country: 'US' },
  { id: 'VA', code: 'VA', name: 'Virginia', country: 'US' },
  { id: 'WA', code: 'WA', name: 'Washington', country: 'US' },
  { id: 'WV', code: 'WV', name: 'West Virginia', country: 'US' },
  { id: 'WI', code: 'WI', name: 'Wisconsin', country: 'US' },
  { id: 'WY', code: 'WY', name: 'Wyoming', country: 'US' },
  { id: 'DC', code: 'DC', name: 'District of Columbia', country: 'US' }
]

// Principais cidades por estado (fallback - pode ser expandido)
const US_CITIES_BY_STATE: Record<string, string[]> = {
  'CA': ['Los Angeles', 'San Diego', 'San Jose', 'San Francisco', 'Fresno', 'Sacramento', 'Long Beach', 'Oakland', 'Bakersfield', 'Anaheim'],
  'TX': ['Houston', 'San Antonio', 'Dallas', 'Austin', 'Fort Worth', 'El Paso', 'Arlington', 'Corpus Christi', 'Plano', 'Laredo'],
  'FL': ['Jacksonville', 'Miami', 'Tampa', 'Orlando', 'St. Petersburg', 'Hialeah', 'Tallahassee', 'Fort Lauderdale', 'Port St. Lucie', 'Cape Coral'],
  'NY': ['New York', 'Buffalo', 'Rochester', 'Yonkers', 'Syracuse', 'Albany', 'New Rochelle', 'Mount Vernon', 'Schenectady', 'Utica'],
  'IL': ['Chicago', 'Aurora', 'Rockford', 'Joliet', 'Naperville', 'Springfield', 'Peoria', 'Elgin', 'Waukegan', 'Cicero'],
  'PA': ['Philadelphia', 'Pittsburgh', 'Allentown', 'Erie', 'Reading', 'Scranton', 'Bethlehem', 'Lancaster', 'Harrisburg', 'Altoona'],
  'OH': ['Columbus', 'Cleveland', 'Cincinnati', 'Toledo', 'Akron', 'Dayton', 'Parma', 'Canton', 'Youngstown', 'Lorain'],
  'GA': ['Atlanta', 'Augusta', 'Columbus', 'Savannah', 'Athens', 'Sandy Springs', 'Roswell', 'Macon', 'Johns Creek', 'Albany'],
  'NC': ['Charlotte', 'Raleigh', 'Greensboro', 'Durham', 'Winston-Salem', 'Fayetteville', 'Cary', 'Wilmington', 'High Point', 'Concord'],
  'MI': ['Detroit', 'Grand Rapids', 'Warren', 'Sterling Heights', 'Lansing', 'Ann Arbor', 'Flint', 'Dearborn', 'Livonia', 'Troy'],
  'NJ': ['Newark', 'Jersey City', 'Paterson', 'Elizabeth', 'Edison', 'Woodbridge', 'Lakewood', 'Toms River', 'Hamilton', 'Trenton'],
  'VA': ['Virginia Beach', 'Norfolk', 'Chesapeake', 'Richmond', 'Newport News', 'Alexandria', 'Hampton', 'Portsmouth', 'Suffolk', 'Roanoke'],
  'WA': ['Seattle', 'Spokane', 'Tacoma', 'Vancouver', 'Bellevue', 'Kent', 'Everett', 'Renton', 'Yakima', 'Federal Way'],
  'AZ': ['Phoenix', 'Tucson', 'Mesa', 'Chandler', 'Glendale', 'Scottsdale', 'Gilbert', 'Tempe', 'Peoria', 'Surprise'],
  'MA': ['Boston', 'Worcester', 'Springfield', 'Lowell', 'Cambridge', 'New Bedford', 'Brockton', 'Quincy', 'Lynn', 'Fall River'],
  'TN': ['Nashville', 'Memphis', 'Knoxville', 'Chattanooga', 'Clarksville', 'Murfreesboro', 'Franklin', 'Jackson', 'Johnson City', 'Bartlett'],
  'IN': ['Indianapolis', 'Fort Wayne', 'Evansville', 'South Bend', 'Carmel', 'Fishers', 'Bloomington', 'Hammond', 'Gary', 'Muncie'],
  'MO': ['Kansas City', 'St. Louis', 'Springfield', 'Columbia', 'Independence', 'Lee\'s Summit', 'O\'Fallon', 'St. Joseph', 'St. Charles', 'St. Peters'],
  'MD': ['Baltimore', 'Frederick', 'Rockville', 'Gaithersburg', 'Bowie', 'Annapolis', 'College Park', 'Salisbury', 'Laurel', 'Greenbelt'],
  'WI': ['Milwaukee', 'Madison', 'Green Bay', 'Kenosha', 'Racine', 'Appleton', 'Waukesha', 'Oshkosh', 'Eau Claire', 'Janesville'],
  'CO': ['Denver', 'Colorado Springs', 'Aurora', 'Fort Collins', 'Lakewood', 'Thornton', 'Arvada', 'Westminster', 'Pueblo', 'Centennial'],
  'MN': ['Minneapolis', 'St. Paul', 'Rochester', 'Duluth', 'Bloomington', 'Brooklyn Park', 'Plymouth', 'St. Cloud', 'Eagan', 'Woodbury'],
  'SC': ['Charleston', 'Columbia', 'North Charleston', 'Mount Pleasant', 'Rock Hill', 'Greenville', 'Summerville', 'Sumter', 'Hilton Head Island', 'Florence'],
  'AL': ['Birmingham', 'Montgomery', 'Mobile', 'Huntsville', 'Tuscaloosa', 'Hoover', 'Dothan', 'Auburn', 'Decatur', 'Madison'],
  'LA': ['New Orleans', 'Baton Rouge', 'Shreveport', 'Lafayette', 'Lake Charles', 'Kenner', 'Bossier City', 'Monroe', 'Alexandria', 'Houma'],
  'KY': ['Louisville', 'Lexington', 'Bowling Green', 'Owensboro', 'Covington', 'Hopkinsville', 'Richmond', 'Florence', 'Georgetown', 'Henderson'],
  'OR': ['Portland', 'Eugene', 'Salem', 'Gresham', 'Hillsboro', 'Bend', 'Beaverton', 'Medford', 'Springfield', 'Corvallis'],
  'OK': ['Oklahoma City', 'Tulsa', 'Norman', 'Broken Arrow', 'Lawton', 'Edmond', 'Moore', 'Midwest City', 'Enid', 'Stillwater'],
  'CT': ['Bridgeport', 'New Haven', 'Hartford', 'Stamford', 'Waterbury', 'Norwalk', 'Danbury', 'New Britain', 'West Hartford', 'Greenwich'],
  'IA': ['Des Moines', 'Cedar Rapids', 'Davenport', 'Sioux City', 'Iowa City', 'Waterloo', 'Council Bluffs', 'Ames', 'West Des Moines', 'Dubuque'],
  'UT': ['Salt Lake City', 'West Valley City', 'Provo', 'West Jordan', 'Orem', 'Sandy', 'Ogden', 'St. George', 'Layton', 'Taylorsville'],
  'AR': ['Little Rock', 'Fort Smith', 'Fayetteville', 'Jonesboro', 'North Little Rock', 'Pine Bluff', 'Conway', 'Springdale', 'Rogers', 'Hot Springs'],
  'NV': ['Las Vegas', 'Henderson', 'Reno', 'North Las Vegas', 'Sparks', 'Carson City', 'Fernley', 'Elko', 'Mesquite', 'Boulder City'],
  'MS': ['Jackson', 'Gulfport', 'Southaven', 'Hattiesburg', 'Biloxi', 'Meridian', 'Tupelo', 'Greenville', 'Olive Branch', 'Horn Lake'],
  'KS': ['Wichita', 'Overland Park', 'Kansas City', 'Olathe', 'Topeka', 'Lawrence', 'Shawnee', 'Manhattan', 'Lenexa', 'Salina'],
  'NM': ['Albuquerque', 'Las Cruces', 'Rio Rancho', 'Santa Fe', 'Roswell', 'Farmington', 'Clovis', 'Hobbs', 'Alamogordo', 'Carlsbad'],
  'NE': ['Omaha', 'Lincoln', 'Bellevue', 'Grand Island', 'Kearney', 'Fremont', 'Hastings', 'North Platte', 'Norfolk', 'Columbus'],
  'WV': ['Charleston', 'Huntington', 'Parkersburg', 'Morgantown', 'Wheeling', 'Martinsburg', 'Fairmont', 'Beckley', 'Clarksburg', 'South Charleston'],
  'ID': ['Boise', 'Nampa', 'Meridian', 'Idaho Falls', 'Pocatello', 'Caldwell', 'Coeur d\'Alene', 'Twin Falls', 'Lewiston', 'Post Falls'],
  'HI': ['Honolulu', 'Pearl City', 'Hilo', 'Kailua', 'Kaneohe', 'Waipahu', 'Kahului', 'Ewa Beach', 'Mililani', 'Kihei'],
  'NH': ['Manchester', 'Nashua', 'Concord', 'Derry', 'Rochester', 'Dover', 'Salem', 'Merrimack', 'Londonderry', 'Hudson'],
  'ME': ['Portland', 'Lewiston', 'Bangor', 'South Portland', 'Auburn', 'Biddeford', 'Sanford', 'Saco', 'Augusta', 'Westbrook'],
  'RI': ['Providence', 'Warwick', 'Cranston', 'Pawtucket', 'East Providence', 'Woonsocket', 'Newport', 'Central Falls', 'Westerly', 'Cumberland'],
  'MT': ['Billings', 'Missoula', 'Great Falls', 'Bozeman', 'Butte', 'Helena', 'Kalispell', 'Havre', 'Anaconda', 'Miles City'],
  'DE': ['Wilmington', 'Dover', 'Newark', 'Middletown', 'Smyrna', 'Milford', 'Seaford', 'Georgetown', 'Elsmere', 'New Castle'],
  'SD': ['Sioux Falls', 'Rapid City', 'Aberdeen', 'Brookings', 'Watertown', 'Mitchell', 'Yankton', 'Pierre', 'Huron', 'Vermillion'],
  'ND': ['Fargo', 'Bismarck', 'Grand Forks', 'Minot', 'West Fargo', 'Williston', 'Dickinson', 'Mandan', 'Jamestown', 'Wahpeton'],
  'AK': ['Anchorage', 'Fairbanks', 'Juneau', 'Wasilla', 'Sitka', 'Kenai', 'Ketchikan', 'Kodiak', 'Bethel', 'Palmer'],
  'DC': ['Washington'],
  'VT': ['Burlington', 'Essex', 'South Burlington', 'Colchester', 'Rutland', 'Montpelier', 'Barre', 'St. Albans', 'Winooski', 'Brattleboro'],
  'WY': ['Cheyenne', 'Casper', 'Laramie', 'Gillette', 'Rock Springs', 'Sheridan', 'Green River', 'Evanston', 'Riverton', 'Jackson']
}

export class USLocationProvider implements LocationProvider {
  country: 'US' = 'US'

  async getStates(): Promise<State[]> {
    return US_STATES.sort((a, b) => a.name.localeCompare(b.name))
  }

  async getCitiesByState(stateCode: string): Promise<City[]> {
    const cities = US_CITIES_BY_STATE[stateCode] || []
    const state = US_STATES.find(s => s.code === stateCode)
    
    return cities.map((city, index) => ({
      id: `${stateCode}-${index}`,
      name: city,
      stateCode: stateCode,
      stateName: state?.name || stateCode,
      country: 'US'
    }))
  }

  async searchCities(term: string, stateCode?: string): Promise<City[]> {
    let cities: City[] = []
    
    if (stateCode) {
      cities = await this.getCitiesByState(stateCode)
    } else {
      // Buscar em todos os estados
      for (const state of US_STATES) {
        const stateCities = await this.getCitiesByState(state.code)
        cities.push(...stateCities)
      }
    }
    
    if (!term) return cities
    
    const searchTerm = term.toLowerCase()
    return cities.filter(city => 
      city.name.toLowerCase().includes(searchTerm)
    )
  }

  validatePostalCode(code: string): boolean {
    // ZIP Code: 5 dígitos ou 5+4 (12345 ou 12345-6789)
    const cleanCode = code.replace(/\D/g, '')
    return cleanCode.length === 5 || cleanCode.length === 9
  }

  formatPostalCode(code: string): string {
    const cleanCode = code.replace(/\D/g, '')
    if (cleanCode.length === 9) {
      return `${cleanCode.slice(0, 5)}-${cleanCode.slice(5)}`
    }
    return cleanCode
  }

  formatAddress(address: Address): string {
    const parts: string[] = []
    if (address.addressNumber) parts.push(address.addressNumber)
    if (address.address) parts.push(address.address)
    if (address.city) parts.push(address.city)
    if (address.stateCode) parts.push(address.stateCode)
    if (address.zipCode) parts.push(this.formatPostalCode(address.zipCode))
    return parts.join(', ')
  }
}

