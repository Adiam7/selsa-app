/**
 * Provinces/States database
 * ISO 3166-2 compliant region codes by country
 */

import type { Province } from './types';

type ProvinceMap = Record<string, Record<string, string>>;

const PROVINCES: ProvinceMap = {
  // US States (ISO 3166-2:US)
  'US': {
    'Alabama': 'AL', 'Alaska': 'AK', 'Arizona': 'AZ', 'Arkansas': 'AR',
    'California': 'CA', 'Colorado': 'CO', 'Connecticut': 'CT', 'Delaware': 'DE',
    'Florida': 'FL', 'Georgia': 'GA', 'Hawaii': 'HI', 'Idaho': 'ID',
    'Illinois': 'IL', 'Indiana': 'IN', 'Iowa': 'IA', 'Kansas': 'KS',
    'Kentucky': 'KY', 'Louisiana': 'LA', 'Maine': 'ME', 'Maryland': 'MD',
    'Massachusetts': 'MA', 'Michigan': 'MI', 'Minnesota': 'MN', 'Mississippi': 'MS',
    'Missouri': 'MO', 'Montana': 'MT', 'Nebraska': 'NE', 'Nevada': 'NV',
    'New Hampshire': 'NH', 'New Jersey': 'NJ', 'New Mexico': 'NM', 'New York': 'NY',
    'North Carolina': 'NC', 'North Dakota': 'ND', 'Ohio': 'OH', 'Oklahoma': 'OK',
    'Oregon': 'OR', 'Pennsylvania': 'PA', 'Rhode Island': 'RI', 'South Carolina': 'SC',
    'South Dakota': 'SD', 'Tennessee': 'TN', 'Texas': 'TX', 'Utah': 'UT',
    'Vermont': 'VT', 'Virginia': 'VA', 'Washington': 'WA', 'West Virginia': 'WV',
    'Wisconsin': 'WI', 'Wyoming': 'WY',
  },

  // Netherlands provinces (ISO 3166-2:NL)
  'NL': {
    'Drenthe': 'DR', 'Flevoland': 'FL', 'Friesland': 'FR', 'Gelderland': 'GE',
    'Groningen': 'GR', 'Limburg': 'LI', 'North Brabant': 'NB', 'North Holland': 'NH',
    'Overijssel': 'OV', 'South Holland': 'SH', 'Utrecht': 'UT',
  },

  // Canada provinces/territories
  'CA': {
    'Alberta': 'AB', 'British Columbia': 'BC', 'Manitoba': 'MB', 'New Brunswick': 'NB',
    'Newfoundland and Labrador': 'NL', 'Northwest Territories': 'NT', 'Nova Scotia': 'NS',
    'Nunavut': 'NU', 'Ontario': 'ON', 'Prince Edward Island': 'PE', 'Quebec': 'QC',
    'Saskatchewan': 'SK', 'Yukon': 'YT',
  },

  // Germany states (ISO 3166-2:DE)
  'DE': {
    'Baden-Württemberg': 'BW', 'Bavaria': 'BY', 'Berlin': 'BE', 'Brandenburg': 'BB',
    'Bremen': 'HB', 'Hamburg': 'HH', 'Hesse': 'HE', 'Mecklenburg-Vorpommern': 'MV',
    'Lower Saxony': 'NI', 'North Rhine-Westphalia': 'NW', 'Rhineland-Palatinate': 'RP',
    'Saarland': 'SL', 'Saxony': 'SN', 'Saxony-Anhalt': 'ST', 'Schleswig-Holstein': 'SH',
    'Thuringia': 'TH',
  },

  // France regions
  'FR': {
    'Île-de-France': 'IDF', 'Provence-Alpes-Côte d\'Azur': 'PACA', 'Rhône-Alpes': 'RA',
    'Bretagne': 'BRE', 'Normandy': 'NOR', 'Nouvelle-Aquitaine': 'NAQ', 'Occitania': 'OCC',
    'Pays de la Loire': 'PDL', 'Burgundy': 'BUR',
  },

  // Australia states/territories
  'AU': {
    'New South Wales': 'NSW', 'Queensland': 'QLD', 'South Australia': 'SA',
    'Tasmania': 'TAS', 'Victoria': 'VIC', 'Western Australia': 'WA',
    'Australian Capital Territory': 'ACT', 'Northern Territory': 'NT',
  },

  // Belgium regions
  'BE': {
    'Flanders': 'VLG', 'Wallonia': 'WAL', 'Brussels': 'BRU',
  },

  // United Kingdom
  'GB': {
    'England': 'ENG', 'Scotland': 'SCT', 'Wales': 'WLS', 'Northern Ireland': 'NIR',
  },
};

/**
 * Get provinces for a country
 */
export const getProvinces = (countryCode: string): Province[] => {
  const provincesObj = PROVINCES[countryCode] || {};
  return Object.entries(provincesObj).map(([name, code]) => ({ name, code }));
};

/**
 * Search provinces by country and search term
 */
export const searchProvinces = (countryCode: string, searchTerm: string): Province[] => {
  const provinces = getProvinces(countryCode);
  const term = searchTerm.toLowerCase();
  return provinces.filter(p =>
    p.name.toLowerCase().includes(term) ||
    p.code.toLowerCase().includes(term)
  );
};

/**
 * Get province code from country and province name
 * Returns exact match if found, otherwise returns first 2 chars uppercase
 */
export const getProvinceCode = (countryCode: string, provinceName: string): string => {
  const provinces = PROVINCES[countryCode] || {};
  if (provinces[provinceName]) {
    return provinces[provinceName];
  }
  // Fallback: convert to uppercase (for US states like "NY", "CA")
  return provinceName.toUpperCase().slice(0, 2);
};

/**
 * Get province name from code
 */
export const getProvinceName = (countryCode: string, provinceCode: string): string => {
  const provinces = PROVINCES[countryCode] || {};
  for (const [name, code] of Object.entries(provinces)) {
    if (code === provinceCode) return name;
  }
  return provinceCode;
};
