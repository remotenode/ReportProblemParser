// Type definitions for the Google Sheets parser

export interface Metadata {
  country: string;
  appStoreLink: string;
  appName: string;
  appId: string;
  storeRegion: string;
  lastUpdated: string;
  totalReports: number;
}

export interface ComplaintValues {
  level1: string;
  level2: string;
  level3: string;
  complaintText: string;
  appStoreReview: string | null;
  appStoreRating: string | number | null;
}

export interface Complaint {
  id: number;
  instructions: string[];
  values: ComplaintValues;
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
