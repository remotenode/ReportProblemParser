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
  level1: string;
  level2: string;
  level3: string;
  complaintText: string;
  appStoreReview: string | null;
  appStoreRating: number | null;
}

export interface Complaint {
  id: number;
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
