import { ValidationError, ComplaintValues } from '../types';
import { validateRequired, validateStringLength, validateRating } from './field-validators';

/**
 * Validate complaint values with row number context
 * @param values - The complaint values to validate
 * @param complaintId - The complaint ID for error context
 * @param sheetRowNumber - The Google Sheet row number for error context
 * @returns Array of validation errors
 */
export function validateComplaintValues(
  values: any, 
  complaintId: number, 
  sheetRowNumber: number
): ValidationError[] {
  const errors: ValidationError[] = [];
  
  // Validate required fields
  const requiredFields = ['level1', 'level2', 'level3', 'complaintText'];
  for (const field of requiredFields) {
    const error = validateRequired(values[field], field);
    if (error) {
      error.field = `complaint_${complaintId}.${field}`;
      error.message = `${error.message} (Google Sheet Row ${sheetRowNumber})`;
      errors.push(error);
    }
  }
  
  // Validate string lengths
  if (values.level1) {
    const error = validateStringLength(values.level1, 'level1', 1, 200);
    if (error) {
      error.field = `complaint_${complaintId}.level1`;
      error.message = `${error.message} (Google Sheet Row ${sheetRowNumber})`;
      errors.push(error);
    }
  }
  
  if (values.level2) {
    const error = validateStringLength(values.level2, 'level2', 1, 200);
    if (error) {
      error.field = `complaint_${complaintId}.level2`;
      error.message = `${error.message} (Google Sheet Row ${sheetRowNumber})`;
      errors.push(error);
    }
  }
  
  if (values.level3) {
    const error = validateStringLength(values.level3, 'level3', 1, 200);
    if (error) {
      error.field = `complaint_${complaintId}.level3`;
      error.message = `${error.message} (Google Sheet Row ${sheetRowNumber})`;
      errors.push(error);
    }
  }
  
  if (values.complaintText) {
    const error = validateStringLength(values.complaintText, 'complaintText', 10, 2000);
    if (error) {
      error.field = `complaint_${complaintId}.complaintText`;
      error.message = `${error.message} (Google Sheet Row ${sheetRowNumber})`;
      errors.push(error);
    }
  }
  
  if (values.appStoreReview !== null && values.appStoreReview.trim() !== '') {
    const error = validateStringLength(values.appStoreReview, 'appStoreReview', 10, 1000);
    if (error) {
      error.field = `complaint_${complaintId}.appStoreReview`;
      error.message = `${error.message} (Google Sheet Row ${sheetRowNumber})`;
      errors.push(error);
    }
  }
  
  // Validate rating
  const ratingError = validateRating(values.appStoreRating);
  if (ratingError) {
    ratingError.field = `complaint_${complaintId}.appStoreRating`;
    ratingError.message = `${ratingError.message} (Google Sheet Row ${sheetRowNumber})`;
    errors.push(ratingError);
  }
  
  return errors;
}
