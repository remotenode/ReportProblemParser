// Type definitions for the Google Sheets parser

export interface Metadata {
  country: string;
  appStoreLink: string;
  appName: string;
  lastUpdated: string;
  totalReports: number;
}

export interface ComplaintValues {
  level1: string;
  level2: string;
  level3: string;
  complaintText: string;
  appStoreReview: string;
  appStoreRating: string | number;
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

export interface Env {
  // Add any environment variables here if needed
}
