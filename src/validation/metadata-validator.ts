import { ValidationError, Metadata } from '../types';
import { validateRequired, validateStringLength } from './field-validators';
import { validateUrl } from '../utils/url-utils';

/**
 * Validate metadata object
 * @param metadata - The metadata to validate
 * @returns Array of validation errors
 */
export function validateMetadata(metadata: any): ValidationError[] {
  const errors: ValidationError[] = [];
  
  // Validate country
  const countryError = validateRequired(metadata.country, 'country');
  if (countryError) {
    countryError.message = `${countryError.message} (Check metadata rows 1-10 in Google Sheet)`;
    errors.push(countryError);
  }
  
  if (metadata.country && metadata.country !== 'Unknown') {
    const countryLengthError = validateStringLength(metadata.country, 'country', 2, 100);
    if (countryLengthError) {
      countryLengthError.message = `${countryLengthError.message} (Check metadata rows 1-10 in Google Sheet)`;
      errors.push(countryLengthError);
    }
  }
  
  // Validate app store link
  if (metadata.appStoreLink && metadata.appStoreLink !== 'Unknown') {
    if (!validateUrl(metadata.appStoreLink)) {
      errors.push({
        field: 'appStoreLink',
        message: 'App Store link must be a valid URL (Check metadata rows 1-10 in Google Sheet)',
        value: metadata.appStoreLink
      });
    }
  }
  
  // Validate total reports
  if (typeof metadata.totalReports !== 'number' || metadata.totalReports < 0) {
    errors.push({
      field: 'totalReports',
      message: 'Total reports must be a non-negative number (Calculated from data rows)',
      value: metadata.totalReports
    });
  }
  
  return errors;
}
