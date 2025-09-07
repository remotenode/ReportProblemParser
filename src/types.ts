// Type definitions for the Google Sheets parser

export interface Metadata {
  countryCode: string;
  maxComplaintsPerDay: number;
  appStoreLink: string;
}

export interface ValueItem {
  name: string;
  value: string | number | null;
}

export interface ComplaintValues {
  iWouldLikeTo: string;
  tellUsMore: string;
  forWhatReason: string;
  describeTheIssue: string;
  appStoreReview: string | null;
  appStoreRating: number | null;
}

export interface Complaint {
  steps: ValueItem[];
}

export interface ParsedData {
  metadata: Metadata;
  complaints: Complaint[];
}

export interface ValidationError {
  field: string;
  message: string;
  value?: any;
}

export interface StructuredError {
  error: string;
  message: string;
  code: string;
  details?: ValidationError[];
  timestamp: string;
}

export interface Env {
  // Add any environment variables here if needed
}
