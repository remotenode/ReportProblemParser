import { ValidationError, Metadata } from '../types';
import { validateUrl } from '../utils/url-utils';
import { validateCountryCode } from './country-validator';

export function validateMetadata(metadata: any): ValidationError[] {
  const errors: ValidationError[] = [];

  // Validate country code
  const countryError = validateCountryCode(metadata.countryCode);
  if (countryError && typeof countryError === 'object') {
    countryError.message = `${countryError.message} (Check metadata rows 1-10 in Google Sheet)`;
    errors.push(countryError);
  }

  // Validate maxComplaintsPerDay
  const maxComplaintsError = validateMaxComplaintsPerDay(metadata.maxComplaintsPerDay);
  if (maxComplaintsError && typeof maxComplaintsError === 'object') {
    maxComplaintsError.message = `${maxComplaintsError.message} (Check metadata rows 1-10 in Google Sheet)`;
    errors.push(maxComplaintsError);
  }

  // Validate appStoreLink
  const urlError = validateUrl(metadata.appStoreLink);
  if (urlError && typeof urlError === 'object') {
    urlError.message = `${urlError.message} (Check metadata rows 1-10 in Google Sheet)`;
    errors.push(urlError);
  }

  return errors;
}

function validateMaxComplaintsPerDay(value: any): ValidationError | null {
  if (value === null || value === undefined || value === '') {
    return {
      field: 'maxComplaintsPerDay',
      message: 'Max complaints per day is required and cannot be empty',
      value: value
    };
  }

  const numValue = Number(value);
  if (isNaN(numValue)) {
    return {
      field: 'maxComplaintsPerDay',
      message: 'Max complaints per day must be a valid number',
      value: value
    };
  }

  if (!Number.isInteger(numValue)) {
    return {
      field: 'maxComplaintsPerDay',
      message: 'Max complaints per day must be an integer',
      value: value
    };
  }

  if (numValue < 1) {
    return {
      field: 'maxComplaintsPerDay',
      message: 'Max complaints per day must be at least 1',
      value: value
    };
  }

  if (numValue > 50) {
    return {
      field: 'maxComplaintsPerDay',
      message: 'Max complaints per day cannot exceed 50',
      value: value
    };
  }

  return null;
}