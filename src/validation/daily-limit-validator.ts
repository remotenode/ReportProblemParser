import { ValidationError } from '../types';

const MIN_COMPLAINTS_PER_DAY = 5;
const MAX_COMPLAINTS_PER_DAY = 50;

/**
 * Validate daily complaint limits
 * @param totalReports - Total number of complaints in the sheet
 * @returns Object with validation result and message
 */
export function validateDailyLimits(totalReports: number): {
  maxComplaintsPerDay: number;
  dailyLimitValid: boolean;
  dailyLimitMessage: string;
  validationErrors: ValidationError[];
} {
  const validationErrors: ValidationError[] = [];
  let dailyLimitValid = true;
  let dailyLimitMessage = '';

  if (totalReports < MIN_COMPLAINTS_PER_DAY) {
    dailyLimitValid = false;
    dailyLimitMessage = `Too few complaints: ${totalReports}. Minimum required: ${MIN_COMPLAINTS_PER_DAY} per day.`;
    validationErrors.push({
      field: 'totalReports',
      message: `Sheet contains only ${totalReports} complaints, but minimum ${MIN_COMPLAINTS_PER_DAY} complaints per day are required`,
      value: totalReports
    });
  } else if (totalReports > MAX_COMPLAINTS_PER_DAY) {
    dailyLimitValid = false;
    dailyLimitMessage = `Too many complaints: ${totalReports}. Maximum allowed: ${MAX_COMPLAINTS_PER_DAY} per day.`;
    validationErrors.push({
      field: 'totalReports',
      message: `Sheet contains ${totalReports} complaints, but maximum ${MAX_COMPLAINTS_PER_DAY} complaints per day are allowed`,
      value: totalReports
    });
  } else {
    dailyLimitMessage = `Valid complaint count: ${totalReports} complaints (within daily limits of ${MIN_COMPLAINTS_PER_DAY}-${MAX_COMPLAINTS_PER_DAY})`;
  }

  return {
    maxComplaintsPerDay: totalReports,
    dailyLimitValid,
    dailyLimitMessage,
    validationErrors
  };
}
