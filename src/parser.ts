import * as XLSX from 'xlsx';
import { ParsedData, Complaint, ComplaintValues, Metadata, ValidationError, StructuredError } from './types';
import { validateUrl } from './utils/url-utils';
import { validateComplaintValues } from './validation/complaint-validator';
import { validateMetadata } from './validation/metadata-validator';
import { getCountryName } from './validation/country-validator';
import { convertValuesToArray } from './utils/values-converter';

export async function parseGoogleSheetsData(sheetUrl: string): Promise<ParsedData> {
  try {
    // Validate the URL
    if (!validateUrl(sheetUrl)) {
      const structuredError: StructuredError = {
        error: 'InvalidUrl',
        message: 'Invalid Google Sheets URL provided',
        code: 'INVALID_URL',
        details: [{
          field: 'url',
          message: 'URL must be a valid Google Sheets published URL',
          value: sheetUrl
        }],
        timestamp: new Date().toISOString()
      };
      throw structuredError;
    }
    
    // Ensure it's a Google Sheets URL
    if (!sheetUrl.includes('docs.google.com/spreadsheets')) {
      const structuredError: StructuredError = {
        error: 'InvalidUrl',
        message: 'URL must be a Google Sheets URL',
        code: 'INVALID_GOOGLE_SHEETS_URL',
        details: [{
          field: 'url',
          message: 'URL must be from docs.google.com/spreadsheets',
          value: sheetUrl
        }],
        timestamp: new Date().toISOString()
      };
      throw structuredError;
    }
    
    console.log('🔍 Fetching Google Sheets Excel data...');
    console.log('📡 URL:', sheetUrl);
    
    // Fetch the Excel file
    const response = await fetch(sheetUrl);
    
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
    
    // Extract metadata from specific cells
    let countryCode: string | null = null;
    let appStoreLink = '';
    let maxComplaintsPerDay: number | null = null;
    
    // Extract countryCode from B1 (row 0, column 1)
    if (jsonData.length > 0 && jsonData[0] && jsonData[0].length > 1) {
      const value = jsonData[0][1];
      if (value && value.toString().trim() !== '') {
        countryCode = value.toString().trim().toUpperCase();
      }
    }
    
    // Extract appStoreLink from B2 (row 1, column 1)
    if (jsonData.length > 1 && jsonData[1] && jsonData[1].length > 1) {
      const value = jsonData[1][1];
      if (value && value.toString().trim() !== '') {
        appStoreLink = value.toString().trim();
      }
    }
    
    // Extract maxComplaintsPerDay from B3 (row 2, column 1)
    if (jsonData.length > 2 && jsonData[2] && jsonData[2].length > 1) {
      const value = Number(jsonData[2][1]);
      if (!isNaN(value) && Number.isInteger(value) && value > 0 && value <= 50) {
        maxComplaintsPerDay = value;
      }
    }
    
    // Validate that countryCode was found and is 'US'
    if (countryCode === null) {
      const structuredError: StructuredError = {
        error: 'ValidationError',
        message: 'Country code field is required in the Google Sheet',
        code: 'VALIDATION_FAILED',
        details: [{
          field: 'countryCode',
          message: 'Country code field must be present in cell B1',
          value: null
        }],
        timestamp: new Date().toISOString()
      };
      throw structuredError;
    }
    
    if (countryCode !== 'US') {
      const structuredError: StructuredError = {
        error: 'ValidationError',
        message: 'Only US country code is supported',
        code: 'VALIDATION_FAILED',
        details: [{
          field: 'countryCode',
          message: 'Country code must be "US" (only US is supported)',
          value: countryCode
        }],
        timestamp: new Date().toISOString()
      };
      throw structuredError;
    }
    
    // Validate that maxComplaintsPerDay was found
    if (maxComplaintsPerDay === null) {
      const structuredError: StructuredError = {
        error: 'ValidationError',
        message: 'Max Complaints Per Day field is required in the Google Sheet',
        code: 'VALIDATION_FAILED',
        details: [{
          field: 'maxComplaintsPerDay',
          message: 'Max Complaints Per Day field must be present in cell B3',
          value: null
        }],
        timestamp: new Date().toISOString()
      };
      throw structuredError;
    }
    
    // Convert country code to country name for internal use
    const countryName = getCountryName(countryCode);
    
    // Data starts at row 8 (index 7)
    const dataStartRow = 7;
    
    if (jsonData.length <= dataStartRow) {
      throw new Error('Not enough rows in the spreadsheet (data should start at row 8)');
    }
    
    // Verify that row 8 contains the expected header
    const headerRow = jsonData[dataStartRow];
    if (!headerRow || headerRow.length === 0 || headerRow[0] !== 'Report a scam or fraud') {
      throw new Error('Data header row 8 does not contain expected content "Report a scam or fraud"');
    }
    
    console.log(`📊 Data starts at row ${dataStartRow}`);
    
    // Process complaints with validation
    const complaints: Complaint[] = [];
    const allValidationErrors: ValidationError[] = [];
    
    // Start processing from row 9 (index 8) since row 8 is the header
    for (let i = dataStartRow + 1; i < jsonData.length; i++) {
      const row = jsonData[i];
      const sheetRowNumber = i + 1; // Google Sheets row numbers start from 1
      
      if (row && row.length > 0 && row[0] && row[0].toString().trim() !== '') {
        // Validate row has minimum required columns
        if (row.length < 4) {
          allValidationErrors.push({
            field: `row_${sheetRowNumber}`,
            message: `Row ${sheetRowNumber} is missing required columns (need at least 4 columns) (Google Sheet Row ${sheetRowNumber})`,
            value: row
          });
          continue;
        }
        
        // Store the actual values for variable replacement
        const values: ComplaintValues = {
          iWouldLikeTo: row[0] || '',
          tellUsMore: row[1] || '',
          forWhatReason: row[2] || '',
          describeTheIssue: row[3] || '',
          appStoreReview: (row[4] && row[4].toString().trim() !== '') ? row[4] : null,
          appStoreRating: (row[5] && row[5].toString().trim() !== '') ? Number(row[5]) : null
        };
        
        // Validate complaint values with row number
        const validationErrors = validateComplaintValues(values, sheetRowNumber);
        allValidationErrors.push(...validationErrors);
        
        // Only add complaint if validation passes
        if (validationErrors.length === 0) {
          // Convert values object to array format
          const stepsArray = convertValuesToArray(values);
          
          const complaint: Complaint = {
            steps: stepsArray
          };
          
          complaints.push(complaint);
        }
      }
    }
    
    
    // Validate metadata
    const metadata: Metadata = {
      countryCode: countryCode,
      maxComplaintsPerDay: maxComplaintsPerDay,
      appStoreLink: appStoreLink
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
