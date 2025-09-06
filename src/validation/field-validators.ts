import { ValidationError } from '../types';

/**
 * Validate if a required field is present and not empty
 * @param value - The value to validate
 * @param fieldName - The name of the field for error messages
 * @returns ValidationError or null if valid
 */
export function validateRequired(value: any, fieldName: string): ValidationError | null {
  if (!value || (typeof value === 'string' && value.trim() === '')) {
    return {
      field: fieldName,
      message: `${fieldName} is required and cannot be empty`,
      value: value
    };
  }
  return null;
}

/**
 * Validate string length constraints
 * @param value - The string value to validate
 * @param fieldName - The name of the field for error messages
 * @param minLength - Minimum length (default: 1)
 * @param maxLength - Maximum length (default: 1000)
 * @returns ValidationError or null if valid
 */
export function validateStringLength(
  value: string, 
  fieldName: string, 
  minLength: number = 1, 
  maxLength: number = 1000
): ValidationError | null {
  if (typeof value !== 'string') {
    return {
      field: fieldName,
      message: `${fieldName} must be a string`,
      value: value
    };
  }
  
  if (value.length < minLength) {
    return {
      field: fieldName,
      message: `${fieldName} must be at least ${minLength} characters long`,
      value: value
    };
  }
  
  if (value.length > maxLength) {
    return {
      field: fieldName,
      message: `${fieldName} must be no more than ${maxLength} characters long`,
      value: value
    };
  }
  
  return null;
}

/**
 * Validate App Store rating (1-3)
 * @param rating - The rating value to validate
 * @returns ValidationError or null if valid
 */
export function validateRating(rating: any): ValidationError | null {
  if (rating === '' || rating === null || rating === undefined) {
    return null; // Rating is optional
  }
  
  const numRating = Number(rating);
  if (isNaN(numRating)) {
    return {
      field: 'appStoreRating',
      message: 'App Store rating must be a valid number',
      value: rating
    };
  }
  
  if (numRating < 1 || numRating > 3) {
    return {
      field: 'appStoreRating',
      message: 'App Store rating must be between 1 and 3',
      value: rating
    };
  }
  
  return null;
}
