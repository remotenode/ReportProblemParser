import { ComplaintValues, ValueItem } from '../types';

/**
 * Convert ComplaintValues object to array of ValueItem objects
 * @param values - The complaint values object
 * @returns Array of ValueItem objects with name and value properties
 */
export function convertValuesToArray(values: ComplaintValues): ValueItem[] {
  return [
    { name: 'iWouldLikeTo', value: values.iWouldLikeTo },
    { name: 'tellUsMore', value: values.tellUsMore },
    { name: 'forWhatReason', value: values.forWhatReason },
    { name: 'describeTheIssue', value: values.describeTheIssue },
    { name: 'appStoreReview', value: values.appStoreReview },
    { name: 'appStoreRating', value: values.appStoreRating }
  ];
}
