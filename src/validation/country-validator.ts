import { ValidationError } from '../types';

// ISO 3166-1 alpha-2 country codes
const VALID_COUNTRY_CODES = [
  'AD', 'AE', 'AF', 'AG', 'AI', 'AL', 'AM', 'AO', 'AQ', 'AR', 'AS', 'AT', 'AU', 'AW', 'AX', 'AZ',
  'BA', 'BB', 'BD', 'BE', 'BF', 'BG', 'BH', 'BI', 'BJ', 'BL', 'BM', 'BN', 'BO', 'BQ', 'BR', 'BS',
  'BT', 'BV', 'BW', 'BY', 'BZ', 'CA', 'CC', 'CD', 'CF', 'CG', 'CH', 'CI', 'CK', 'CL', 'CM', 'CN',
  'CO', 'CR', 'CU', 'CV', 'CW', 'CX', 'CY', 'CZ', 'DE', 'DJ', 'DK', 'DM', 'DO', 'DZ', 'EC', 'EE',
  'EG', 'EH', 'ER', 'ES', 'ET', 'FI', 'FJ', 'FK', 'FM', 'FO', 'FR', 'GA', 'GB', 'GD', 'GE', 'GF',
  'GG', 'GH', 'GI', 'GL', 'GM', 'GN', 'GP', 'GQ', 'GR', 'GS', 'GT', 'GU', 'GW', 'GY', 'HK', 'HM',
  'HN', 'HR', 'HT', 'HU', 'ID', 'IE', 'IL', 'IM', 'IN', 'IO', 'IQ', 'IR', 'IS', 'IT', 'JE', 'JM',
  'JO', 'JP', 'KE', 'KG', 'KH', 'KI', 'KM', 'KN', 'KP', 'KR', 'KW', 'KY', 'KZ', 'LA', 'LB', 'LC',
  'LI', 'LK', 'LR', 'LS', 'LT', 'LU', 'LV', 'LY', 'MA', 'MC', 'MD', 'ME', 'MF', 'MG', 'MH', 'MK',
  'ML', 'MM', 'MN', 'MO', 'MP', 'MQ', 'MR', 'MS', 'MT', 'MU', 'MV', 'MW', 'MX', 'MY', 'MZ', 'NA',
  'NC', 'NE', 'NF', 'NG', 'NI', 'NL', 'NO', 'NP', 'NR', 'NU', 'NZ', 'OM', 'PA', 'PE', 'PF', 'PG',
  'PH', 'PK', 'PL', 'PM', 'PN', 'PR', 'PS', 'PT', 'PW', 'PY', 'QA', 'RE', 'RO', 'RS', 'RU', 'RW',
  'SA', 'SB', 'SC', 'SD', 'SE', 'SG', 'SH', 'SI', 'SJ', 'SK', 'SL', 'SM', 'SN', 'SO', 'SR', 'SS',
  'ST', 'SV', 'SX', 'SY', 'SZ', 'TC', 'TD', 'TF', 'TG', 'TH', 'TJ', 'TK', 'TL', 'TM', 'TN', 'TO',
  'TR', 'TT', 'TV', 'TW', 'TZ', 'UA', 'UG', 'UM', 'US', 'UY', 'UZ', 'VA', 'VC', 'VE', 'VG', 'VI',
  'VN', 'VU', 'WF', 'WS', 'YE', 'YT', 'ZA', 'ZM', 'ZW'
];

/**
 * Validate country code
 * @param countryCode - The country code to validate
 * @returns ValidationError or null if valid
 */
export function validateCountryCode(countryCode: string): ValidationError | null {
  if (!countryCode || typeof countryCode !== 'string') {
    return {
      field: 'country',
      message: 'Country code is required and must be a string',
      value: countryCode
    };
  }

  const upperCaseCode = countryCode.toUpperCase().trim();
  
  if (upperCaseCode !== 'US') {
    return {
      field: 'country',
      message: `Only US country code is supported. Received: ${countryCode}`,
      value: countryCode
    };
  }

  return null;
}

/**
 * Get country name from country code
 * @param countryCode - The country code
 * @returns Country name or the code if not found
 */
export function getCountryName(countryCode: string): string {
  const countryNames: { [key: string]: string } = {
    'US': 'United States',
    'GB': 'United Kingdom',
    'CA': 'Canada',
    'AU': 'Australia',
    'DE': 'Germany',
    'FR': 'France',
    'IT': 'Italy',
    'ES': 'Spain',
    'NL': 'Netherlands',
    'SE': 'Sweden',
    'NO': 'Norway',
    'DK': 'Denmark',
    'FI': 'Finland',
    'CH': 'Switzerland',
    'AT': 'Austria',
    'BE': 'Belgium',
    'IE': 'Ireland',
    'PT': 'Portugal',
    'GR': 'Greece',
    'LU': 'Luxembourg',
    'IS': 'Iceland',
    'MT': 'Malta',
    'CY': 'Cyprus',
    'EE': 'Estonia',
    'LV': 'Latvia',
    'LT': 'Lithuania',
    'PL': 'Poland',
    'CZ': 'Czech Republic',
    'SK': 'Slovakia',
    'HU': 'Hungary',
    'SI': 'Slovenia',
    'HR': 'Croatia',
    'RO': 'Romania',
    'BG': 'Bulgaria',
    'JP': 'Japan',
    'KR': 'South Korea',
    'CN': 'China',
    'IN': 'India',
    'BR': 'Brazil',
    'MX': 'Mexico',
    'AR': 'Argentina',
    'CL': 'Chile',
    'CO': 'Colombia',
    'PE': 'Peru',
    'VE': 'Venezuela',
    'UY': 'Uruguay',
    'PY': 'Paraguay',
    'BO': 'Bolivia',
    'EC': 'Ecuador',
    'GY': 'Guyana',
    'SR': 'Suriname',
    'ZA': 'South Africa',
    'NG': 'Nigeria',
    'EG': 'Egypt',
    'KE': 'Kenya',
    'GH': 'Ghana',
    'MA': 'Morocco',
    'TN': 'Tunisia',
    'DZ': 'Algeria',
    'LY': 'Libya',
    'SD': 'Sudan',
    'ET': 'Ethiopia',
    'UG': 'Uganda',
    'TZ': 'Tanzania',
    'RW': 'Rwanda',
    'BI': 'Burundi',
    'DJ': 'Djibouti',
    'SO': 'Somalia',
    'ER': 'Eritrea',
    'SS': 'South Sudan',
    'CF': 'Central African Republic',
    'TD': 'Chad',
    'CM': 'Cameroon',
    'GQ': 'Equatorial Guinea',
    'GA': 'Gabon',
    'CG': 'Republic of the Congo',
    'CD': 'Democratic Republic of the Congo',
    'AO': 'Angola',
    'ZM': 'Zambia',
    'ZW': 'Zimbabwe',
    'BW': 'Botswana',
    'NA': 'Namibia',
    'SZ': 'Eswatini',
    'LS': 'Lesotho',
    'MG': 'Madagascar',
    'MU': 'Mauritius',
    'SC': 'Seychelles',
    'KM': 'Comoros',
    'YT': 'Mayotte',
    'RE': 'Réunion',
    'MZ': 'Mozambique',
    'MW': 'Malawi',
    'RU': 'Russia',
    'UA': 'Ukraine',
    'BY': 'Belarus',
    'MD': 'Moldova',
    'GE': 'Georgia',
    'AM': 'Armenia',
    'AZ': 'Azerbaijan',
    'KZ': 'Kazakhstan',
    'UZ': 'Uzbekistan',
    'TM': 'Turkmenistan',
    'TJ': 'Tajikistan',
    'KG': 'Kyrgyzstan',
    'MN': 'Mongolia',
    'AF': 'Afghanistan',
    'PK': 'Pakistan',
    'BD': 'Bangladesh',
    'LK': 'Sri Lanka',
    'MV': 'Maldives',
    'BT': 'Bhutan',
    'NP': 'Nepal',
    'MM': 'Myanmar',
    'TH': 'Thailand',
    'LA': 'Laos',
    'KH': 'Cambodia',
    'VN': 'Vietnam',
    'MY': 'Malaysia',
    'SG': 'Singapore',
    'BN': 'Brunei',
    'ID': 'Indonesia',
    'TL': 'East Timor',
    'PH': 'Philippines',
    'TW': 'Taiwan',
    'HK': 'Hong Kong',
    'MO': 'Macau'
  };

  return countryNames[countryCode.toUpperCase()] || countryCode.toUpperCase();
}
