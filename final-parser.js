const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const XLSX = require('xlsx');
const fs = require('fs');

// Excel file URL
const XLSX_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vT3cbMFli_QctPsAmtorrUvpyF5Ff900cDiEjIETFnojL7hmhFjHwgunfWjmzynZAbBNNT-ZJZn-jYr/pub?output=xlsx';

async function parseGoogleSheetsData() {
  try {
    console.log('🔍 Fetching Google Sheets Excel data...');
    console.log('📡 URL:', XLSX_URL);
    
    // Fetch the Excel file
    const response = await fetch(XLSX_URL);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    console.log('✅ Successfully fetched Excel file');
    console.log('📊 File size:', response.headers.get('content-length'), 'bytes');
    
    // Get the file as buffer
    const buffer = await response.arrayBuffer();
    
    // Parse the Excel file
    const workbook = XLSX.read(buffer, { type: 'array' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    // Convert to JSON array
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    
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
    const complaints = [];
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
        const values = {
          level1: row[0] || '',
          level2: row[1] || '',
          level3: row[2] || '',
          complaintText: row[3] || '',
          appStoreReview: row[4] || '',
          appStoreRating: row[5] || ''
        };
        
        const complaint = {
          id: complaintId++,
          instructions: instructions,
          values: values
        };
        
        complaints.push(complaint);
      }
    }
    
    const result = {
      metadata: {
        country: country,
        appStoreLink: appStoreLink,
        appName: appName,
        lastUpdated: new Date().toISOString(),
        totalReports: complaints.length
      },
      complaints: complaints
    };
    
    return result;
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    throw error;
  }
}

function displayResults(result) {
  console.log('\n' + '='.repeat(80));
  console.log('🎉 GOOGLE SHEETS PARSING RESULTS');
  console.log('='.repeat(80));
  
  console.log('\n📊 METADATA:');
  console.log(`   Country: ${result.metadata.country}`);
  console.log(`   App Name: ${result.metadata.appName}`);
  console.log(`   App Store Link: ${result.metadata.appStoreLink}`);
  console.log(`   Total Reports: ${result.metadata.totalReports}`);
  console.log(`   Last Updated: ${result.metadata.lastUpdated}`);
  
  console.log('\n📝 COMPLAINTS SUMMARY:');
  console.log(`   Total Complaints: ${result.complaints.length}`);
  
  // Show first 3 complaints as examples
  console.log('\n📋 SAMPLE COMPLAINTS:');
  result.complaints.slice(0, 3).forEach((complaint, index) => {
    console.log(`\n   Complaint ${complaint.id}:`);
    console.log(`     Instructions: ${complaint.instructions.length} steps`);
    console.log(`     First instruction: ${complaint.instructions[0]}`);
    console.log(`     Values available: ${Object.keys(complaint.values).join(', ')}`);
  });
  
  if (result.complaints.length > 3) {
    console.log(`\n   ... and ${result.complaints.length - 3} more complaints`);
  }
  
  console.log('\n' + '='.repeat(80));
  console.log('✅ PARSING COMPLETE - READY FOR CLOUDFLARE WORKER');
  console.log('='.repeat(80));
}

async function main() {
  try {
    const result = await parseGoogleSheetsData();
    displayResults(result);
    
    // Save the complete result to a JSON file
    fs.writeFileSync('parsed-data-output.json', JSON.stringify(result, null, 2));
    console.log('\n💾 Full JSON result saved to: parsed-data-output.json');
    console.log('📋 Structure: metadata + complaints with instructions (using {variableName} placeholders) + values object');
    console.log('🎯 Ready to proceed with Cloudflare Worker development');
    
  } catch (error) {
    console.error('\n💥 Failed to parse Google Sheets:', error.message);
    process.exit(1);
  }
}

main();
