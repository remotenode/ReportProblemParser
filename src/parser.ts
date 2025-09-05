import * as XLSX from 'xlsx';
import { ParsedData, Complaint, ComplaintValues, Metadata, ValidationError, StructuredError } from './types';

// Google Sheets Excel URL
const XLSX_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vT3cbMFli_QctPsAmtorrUvpyF5Ff900cDiEjIETFnojL7hmhFjHwgunfWjmzynZAbBNNT-ZJZn-jYr/pub?output=xlsx';

// Validation functions
function validateUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function validateRequired(value: any, fieldName: string): ValidationError | null {
  if (!value || (typeof value === 'string' && value.trim() === '')) {
    return {
      field: fieldName,
      message: `${fieldName} is required and cannot be empty`,
      value: value
    };
  }
  return null;
}

function validateStringLength(value: string, fieldName: string, minLength: number = 1, maxLength: number = 1000): ValidationError | null {
  if (typeof value !== 'string') {
    return {
      field: fieldName,
      message: `${fieldName} must be a string`,
      value: value
    };
  }
  
  if (value.length < minLength) {
    return {
      field: fieldName,
      message: `${fieldName} must be at least ${minLength} characters long`,
      value: value
    };
  }
  
  if (value.length > maxLength) {
    return {
      field: fieldName,
      message: `${fieldName} must be no more than ${maxLength} characters long`,
      value: value
    };
  }
  
  return null;
}

function validateRating(rating: any): ValidationError | null {
  if (rating === '' || rating === null || rating === undefined) {
    return null; // Rating is optional
  }
  
  const numRating = Number(rating);
  if (isNaN(numRating)) {
    return {
      field: 'appStoreRating',
      message: 'App Store rating must be a valid number',
      value: rating
    };
  }
  
  if (numRating < 1 || numRating > 5) {
    return {
      field: 'appStoreRating',
      message: 'App Store rating must be between 1 and 5',
      value: rating
    };
  }
  
  return null;
}

function validateComplaintValues(values: any, complaintId: number): ValidationError[] {
  const errors: ValidationError[] = [];
  
  // Validate required fields
  const requiredFields = ['level1', 'level2', 'level3', 'complaintText'];
  for (const field of requiredFields) {
    const error = validateRequired(values[field], field);
    if (error) {
      error.field = `complaint_${complaintId}.${field}`;
      errors.push(error);
    }
  }
  
  // Validate string lengths
  if (values.level1) {
    const error = validateStringLength(values.level1, 'level1', 1, 200);
    if (error) {
      error.field = `complaint_${complaintId}.level1`;
      errors.push(error);
    }
  }
  
  if (values.level2) {
    const error = validateStringLength(values.level2, 'level2', 1, 200);
    if (error) {
      error.field = `complaint_${complaintId}.level2`;
      errors.push(error);
    }
  }
  
  if (values.level3) {
    const error = validateStringLength(values.level3, 'level3', 1, 200);
    if (error) {
      error.field = `complaint_${complaintId}.level3`;
      errors.push(error);
    }
  }
  
  if (values.complaintText) {
    const error = validateStringLength(values.complaintText, 'complaintText', 10, 2000);
    if (error) {
      error.field = `complaint_${complaintId}.complaintText`;
      errors.push(error);
    }
  }
  
  if (values.appStoreReview && values.appStoreReview.trim() !== '') {
    const error = validateStringLength(values.appStoreReview, 'appStoreReview', 10, 1000);
    if (error) {
      error.field = `complaint_${complaintId}.appStoreReview`;
      errors.push(error);
    }
  }
  
  // Validate rating
  const ratingError = validateRating(values.appStoreRating);
  if (ratingError) {
    ratingError.field = `complaint_${complaintId}.appStoreRating`;
    errors.push(ratingError);
  }
  
  return errors;
}

function validateMetadata(metadata: any): ValidationError[] {
  const errors: ValidationError[] = [];
  
  // Validate country
  const countryError = validateRequired(metadata.country, 'country');
  if (countryError) errors.push(countryError);
  
  if (metadata.country && metadata.country !== 'Unknown') {
    const countryLengthError = validateStringLength(metadata.country, 'country', 2, 100);
    if (countryLengthError) errors.push(countryLengthError);
  }
  
  // Validate app store link
  if (metadata.appStoreLink && metadata.appStoreLink !== 'Unknown') {
    if (!validateUrl(metadata.appStoreLink)) {
      errors.push({
        field: 'appStoreLink',
        message: 'App Store link must be a valid URL',
        value: metadata.appStoreLink
      });
    }
  }
  
  // Validate total reports
  if (typeof metadata.totalReports !== 'number' || metadata.totalReports < 0) {
    errors.push({
      field: 'totalReports',
      message: 'Total reports must be a non-negative number',
      value: metadata.totalReports
    });
  }
  
  return errors;
}

export async function parseGoogleSheetsData(): Promise<ParsedData> {
  try {
    console.log('🔍 Fetching Google Sheets Excel data...');
    
    // Fetch the Excel file
    const response = await fetch(XLSX_URL);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    console.log('✅ Successfully fetched Excel file');
    
    // Get the file as buffer
    const buffer = await response.arrayBuffer();
    
    // Parse the Excel file
    const workbook = XLSX.read(buffer, { type: 'array' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    console.log('📄 Using sheet:', sheetName);
    
    // Convert to JSON array
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];
    
    console.log(`📋 Found ${jsonData.length} total rows`);
    
    // Validate that we have data
    if (!jsonData || jsonData.length === 0) {
      throw new Error('No data found in the spreadsheet');
    }
    
    // Extract metadata
    let country = 'Unknown';
    let appStoreLink = '';
    let appName = 'Unknown';
    
    for (let i = 0; i < Math.min(10, jsonData.length); i++) {
      const row = jsonData[i];
      if (row && row.length >= 2) {
        if (row[0] === 'Country' && row[1]) {
          country = row[1];
        } else if (row[0] === 'App Store Link' && row[1]) {
          appStoreLink = row[1];
        } else if (row[0] === 'App Name' && row[1]) {
          appName = row[1];
        }
      }
    }
    
    // Find the data header row
    let dataStartRow = -1;
    for (let i = 0; i < jsonData.length; i++) {
      const row = jsonData[i];
      if (row && row.length > 0 && row[0] === 'Level 1') {
        dataStartRow = i + 1;
        break;
      }
    }
    
    if (dataStartRow === -1) {
      throw new Error('Could not find data header row (missing "Level 1" header)');
    }
    
    console.log(`📊 Data starts at row ${dataStartRow}`);
    
    // Process complaints with validation
    const complaints: Complaint[] = [];
    const allValidationErrors: ValidationError[] = [];
    let complaintId = 1;
    
    for (let i = dataStartRow; i < jsonData.length; i++) {
      const row = jsonData[i];
      
      if (row && row.length > 0 && row[0] && row[0].toString().trim() !== '') {
        // Validate row has minimum required columns
        if (row.length < 4) {
          allValidationErrors.push({
            field: `row_${i + 1}`,
            message: `Row ${i + 1} is missing required columns (need at least 4 columns)`,
            value: row
          });
          continue;
        }
        
        // Store the actual values for variable replacement
        const values: ComplaintValues = {
          level1: row[0] || '',
          level2: row[1] || '',
          level3: row[2] || '',
          complaintText: row[3] || '',
          appStoreReview: row[4] || '',
          appStoreRating: row[5] || ''
        };
        
        // Validate complaint values
        const validationErrors = validateComplaintValues(values, complaintId);
        allValidationErrors.push(...validationErrors);
        
        // Only add complaint if validation passes
        if (validationErrors.length === 0) {
          // Build instructions array with placeholder variables
          const instructions = [
            `Select {level1} from dropdown and click Continue`,
            `Select {level2} from dropdown`,
            `Select {level3} from dropdown`,
            `Write your complaint text: {complaintText}`
          ];
          
          // Add App Store Review instruction if present
          if (row[4] && row[4].toString().trim() !== '') {
            instructions.push(`Write App Store review: {appStoreReview}`);
          }
          
          // Add App Store Rating instruction if present
          if (row[5] && row[5].toString().trim() !== '') {
            instructions.push(`Set App Store rating to {appStoreRating}`);
          }
          
          const complaint: Complaint = {
            id: complaintId++,
            instructions: instructions,
            values: values
          };
          
          complaints.push(complaint);
        }
      }
    }
    
    // Validate metadata
    const metadata: Metadata = {
      country: country,
      appStoreLink: appStoreLink,
      appName: appName,
      lastUpdated: new Date().toISOString(),
      totalReports: complaints.length
    };
    
    const metadataErrors = validateMetadata(metadata);
    allValidationErrors.push(...metadataErrors);
    
    // If we have validation errors, throw a structured error
    if (allValidationErrors.length > 0) {
      const structuredError: StructuredError = {
        error: 'ValidationError',
        message: `Data validation failed with ${allValidationErrors.length} errors`,
        code: 'VALIDATION_FAILED',
        details: allValidationErrors,
        timestamp: new Date().toISOString()
      };
      throw structuredError;
    }
    
    // Validate minimum data requirements
    if (complaints.length === 0) {
      throw new Error('No valid complaints found in the data');
    }
    
    if (complaints.length < 10) {
      console.warn(`⚠️ Warning: Only ${complaints.length} complaints found, expected more`);
    }
    
    const result: ParsedData = {
      metadata: metadata,
      complaints: complaints
    };
    
    console.log(`✅ Successfully parsed ${complaints.length} complaints with validation`);
    
    return result;
    
  } catch (error) {
    console.error('❌ Error parsing Google Sheets:', error);
    
    // If it's already a structured error, re-throw it
    if (error && typeof error === 'object' && 'error' in error) {
      throw error;
    }
    
    // Otherwise, create a structured error
    const structuredError: StructuredError = {
      error: 'ParseError',
      message: error instanceof Error ? error.message : 'Unknown parsing error',
      code: 'PARSE_FAILED',
      timestamp: new Date().toISOString()
    };
    
    throw structuredError;
  }
}
