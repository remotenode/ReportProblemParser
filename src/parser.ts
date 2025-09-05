import * as XLSX from 'xlsx';
import { ParsedData, Complaint, ComplaintValues, Metadata } from './types';

// Google Sheets Excel URL
const XLSX_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vT3cbMFli_QctPsAmtorrUvpyF5Ff900cDiEjIETFnojL7hmhFjHwgunfWjmzynZAbBNNT-ZJZn-jYr/pub?output=xlsx';

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
      throw new Error('Could not find data header row');
    }
    
    console.log(`📊 Data starts at row ${dataStartRow}`);
    
    // Process complaints
    const complaints: Complaint[] = [];
    let complaintId = 1;
    
    for (let i = dataStartRow; i < jsonData.length; i++) {
      const row = jsonData[i];
      
      if (row && row.length > 0 && row[0] && row[0].toString().trim() !== '') {
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
        
        // Store the actual values for variable replacement
        const values: ComplaintValues = {
          level1: row[0] || '',
          level2: row[1] || '',
          level3: row[2] || '',
          complaintText: row[3] || '',
          appStoreReview: row[4] || '',
          appStoreRating: row[5] || ''
        };
        
        const complaint: Complaint = {
          id: complaintId++,
          instructions: instructions,
          values: values
        };
        
        complaints.push(complaint);
      }
    }
    
    const metadata: Metadata = {
      country: country,
      appStoreLink: appStoreLink,
      appName: appName,
      lastUpdated: new Date().toISOString(),
      totalReports: complaints.length
    };
    
    const result: ParsedData = {
      metadata: metadata,
      complaints: complaints
    };
    
    console.log(`✅ Successfully parsed ${complaints.length} complaints`);
    
    return result;
    
  } catch (error) {
    console.error('❌ Error parsing Google Sheets:', error);
    throw error;
  }
}
