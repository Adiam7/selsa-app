/**
 * City auto-fill mappings by state
 * These are representative cities for state-to-city auto-fill feature
 */

type CityMap = Record<string, string>;

const STATE_CITY_MAP: Record<string, CityMap> = {
  US: {
    'AL': 'Birmingham', 'AK': 'Anchorage', 'AZ': 'Phoenix', 'AR': 'Little Rock',
    'CA': 'Los Angeles', 'CO': 'Denver', 'CT': 'Bridgeport', 'DE': 'Wilmington',
    'FL': 'Jacksonville', 'GA': 'Atlanta', 'HI': 'Honolulu', 'ID': 'Boise',
    'IL': 'Chicago', 'IN': 'Indianapolis', 'IA': 'Des Moines', 'KS': 'Kansas City',
    'KY': 'Louisville', 'LA': 'New Orleans', 'ME': 'Portland', 'MD': 'Baltimore',
    'MA': 'Boston', 'MI': 'Detroit', 'MN': 'Minneapolis', 'MS': 'Jackson',
    'MO': 'Kansas City', 'MT': 'Billings', 'NE': 'Omaha', 'NV': 'Las Vegas',
    'NH': 'Manchester', 'NJ': 'Newark', 'NM': 'Albuquerque', 'NY': 'New York',
    'NC': 'Charlotte', 'ND': 'Bismarck', 'OH': 'Columbus', 'OK': 'Oklahoma City',
    'OR': 'Portland', 'PA': 'Philadelphia', 'RI': 'Providence', 'SC': 'Charleston',
    'SD': 'Sioux Falls', 'TN': 'Memphis', 'TX': 'Houston', 'UT': 'Salt Lake City',
    'VT': 'Burlington', 'VA': 'Virginia Beach', 'WA': 'Seattle', 'WV': 'Charleston',
    'WI': 'Milwaukee', 'WY': 'Cheyenne',
  },
  CA: {
    'AB': 'Calgary', 'BC': 'Vancouver', 'MB': 'Winnipeg', 'NB': 'Saint John',
    'NL': "St. John's", 'NS': 'Halifax', 'ON': 'Toronto', 'PE': 'Charlottetown',
    'QC': 'Montreal', 'SK': 'Saskatoon',
  },
  NL: {
    'NH': 'Amsterdam', 'SH': 'Rotterdam', 'UT': 'Utrecht', 'FL': 'Lelystad',
    'FR': 'Leeuwarden', 'GR': 'Groningen', 'DR': 'Assen', 'OV': 'Zwolle',
    'GE': 'Arnhem', 'NB': 'Breda', 'LI': 'Maastricht',
  },
  DE: {
    'BW': 'Stuttgart', 'BY': 'Munich', 'BE': 'Berlin', 'BB': 'Potsdam',
    'HB': 'Bremen', 'HH': 'Hamburg', 'HE': 'Frankfurt', 'MV': 'Schwerin',
    'NI': 'Hannover', 'NW': 'Cologne', 'RP': 'Mainz', 'SL': 'Saarbrücken',
    'SN': 'Dresden', 'ST': 'Magdeburg', 'SH': 'Kiel', 'TH': 'Erfurt',
  },
  AU: {
    'NSW': 'Sydney', 'QLD': 'Brisbane', 'SA': 'Adelaide', 'TAS': 'Hobart',
    'VIC': 'Melbourne', 'WA': 'Perth', 'ACT': 'Canberra', 'NT': 'Darwin',
  },
  BE: {
    'VLG': 'Antwerp', 'WAL': 'Charleroi', 'BRU': 'Brussels',
  },
  GB: {
    'ENG': 'London', 'SCT': 'Edinburgh', 'WLS': 'Cardiff', 'NIR': 'Belfast',
  },
};

/**
 * Get city for state code
 */
export const getCityForState = (
  countryCode: string,
  stateCode: string
): string | undefined => {
  return STATE_CITY_MAP[countryCode]?.[stateCode];
};

/**
 * Check if auto-fill city exists for state
 */
export const hasAutoCityForState = (countryCode: string, stateCode: string): boolean => {
  return stateCode in (STATE_CITY_MAP[countryCode] ?? {});
};
