import { ComplaintValues } from '../types';

/**
 * Build enhanced instructions for complaint submission
 * @param values - The complaint values
 * @returns Array of instruction strings
 */
export function buildInstructions(values: ComplaintValues): string[] {
  // Build enhanced instructions array with app download and usage flow
  const instructions = [
    `Download the app '{appName}' from App Store`,
    `Open the app and use it for 10 minutes to experience the issues`,
    `After 10 minutes, go to App Store and find '{appName}'`,
    `Navigate to the app page and scroll down`,
    `Find and click 'Report a Problem' button`,
    `Select {level1} from dropdown and click Continue`,
    `Select {level2} from dropdown`,
    `Select {level3} from dropdown`,
    `Write your complaint text: {complaintText}`,
    `Submit the report`
  ];
  
  // Add App Store Review and Rating instructions if present
  if (values.appStoreReview !== null || values.appStoreRating !== null) {
    instructions.push(`Go back to the app page and scroll to 'Reviews' section`);
    instructions.push(`Click 'Write a Review' button`);
    
    if (values.appStoreReview !== null) {
      instructions.push(`Write App Store review: {appStoreReview}`);
    }
    
    if (values.appStoreRating !== null) {
      instructions.push(`Set App Store rating to {appStoreRating}`);
    }
    
    instructions.push(`Submit the review`);
  }
  
  return instructions;
}
