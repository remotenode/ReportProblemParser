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
  const requiredFields = ['iWouldLikeTo', 'tellUsMore', 'forWhatReason', 'describeTheIssue'];
  for (const field of requiredFields) {
    const error = validateRequired(values[field], field);
    if (error && typeof error === 'object') {
      error.field = `complaint_${complaintId}.${field}`;
      error.message = `${error.message} (Google Sheet Row ${sheetRowNumber})`;
      errors.push(error);
    }
  }
  
  // Validate string lengths
  if (values.iWouldLikeTo) {
    const error = validateStringLength(values.iWouldLikeTo, 'iWouldLikeTo', 1, 200);
    if (error && typeof error === 'object') {
      error.field = `complaint_${complaintId}.iWouldLikeTo`;
      error.message = `${error.message} (Google Sheet Row ${sheetRowNumber})`;
      errors.push(error);
    }
  }
  
  if (values.tellUsMore) {
    const error = validateStringLength(values.tellUsMore, 'tellUsMore', 1, 200);
    if (error && typeof error === 'object') {
      error.field = `complaint_${complaintId}.tellUsMore`;
      error.message = `${error.message} (Google Sheet Row ${sheetRowNumber})`;
      errors.push(error);
    }
  }
  
  if (values.forWhatReason) {
    const error = validateStringLength(values.forWhatReason, 'forWhatReason', 1, 200);
    if (error && typeof error === 'object') {
      error.field = `complaint_${complaintId}.forWhatReason`;
      error.message = `${error.message} (Google Sheet Row ${sheetRowNumber})`;
      errors.push(error);
    }
  }
  
  if (values.describeTheIssue) {
    const error = validateStringLength(values.describeTheIssue, 'describeTheIssue', 10, 2000);
    if (error && typeof error === 'object') {
      error.field = `complaint_${complaintId}.describeTheIssue`;
      error.message = `${error.message} (Google Sheet Row ${sheetRowNumber})`;
      errors.push(error);
    }
  }
  
  if (values.appStoreReview !== null && values.appStoreReview.trim() !== '') {
    const error = validateStringLength(values.appStoreReview, 'appStoreReview', 10, 1000);
    if (error && typeof error === 'object') {
      error.field = `complaint_${complaintId}.appStoreReview`;
      error.message = `${error.message} (Google Sheet Row ${sheetRowNumber})`;
      errors.push(error);
    }
  }
  
  // Validate rating
  const ratingError = validateRating(values.appStoreRating);
  if (ratingError && typeof ratingError === 'object') {
    ratingError.field = `complaint_${complaintId}.appStoreRating`;
    ratingError.message = `${ratingError.message} (Google Sheet Row ${sheetRowNumber})`;
    errors.push(ratingError);
  }
  
  return errors;
}
