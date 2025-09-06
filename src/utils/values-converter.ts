import { ComplaintValues, ValueItem } from '../types';

/**
 * Convert ComplaintValues object to array of ValueItem objects
 * @param values - The complaint values object
 * @returns Array of ValueItem objects with name and value properties
 */
export function convertValuesToArray(values: ComplaintValues): ValueItem[] {
  return [
    { name: 'level1', value: values.level1 },
    { name: 'level2', value: values.level2 },
    { name: 'level3', value: values.level3 },
    { name: 'complaintText', value: values.complaintText },
    { name: 'appStoreReview', value: values.appStoreReview },
    { name: 'appStoreRating', value: values.appStoreRating },
    { name: 'appName', value: values.appName }
  ];
}
