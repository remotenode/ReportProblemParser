#!/usr/bin/env node

const https = require('https');

// Configuration
const ZONE_NAME = 'aso.market';
const CNAME_NAME = 'complaints';
const CNAME_TARGET = 'report-problem-parser.artsyom-avanesov.workers.dev';

// Get API token from environment
const API_TOKEN = process.env.CLOUDFLARE_API_TOKEN;

if (!API_TOKEN) {
  console.error('❌ CLOUDFLARE_API_TOKEN environment variable is required');
  console.log('💡 Get your API token from: https://dash.cloudflare.com/profile/api-tokens');
  console.log('💡 Create a token with Zone:Edit permissions');
  process.exit(1);
}

async function makeRequest(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.cloudflare.com',
      port: 443,
      path: path,
      method: method,
      headers: {
        'Authorization': `Bearer ${API_TOKEN}`,
        'Content-Type': 'application/json'
      }
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(body);
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(result);
          } else {
            reject(new Error(`API Error: ${res.statusCode} - ${JSON.stringify(result)}`));
          }
        } catch (e) {
          reject(new Error(`Parse Error: ${e.message}`));
        }
      });
    });

    req.on('error', reject);

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function getZoneId() {
  console.log(`🔍 Looking up zone ID for ${ZONE_NAME}...`);
  const result = await makeRequest('GET', `/client/v4/zones?name=${ZONE_NAME}`);
  
  if (result.result.length === 0) {
    throw new Error(`Zone ${ZONE_NAME} not found`);
  }
  
  const zoneId = result.result[0].id;
  console.log(`✅ Found zone ID: ${zoneId}`);
  return zoneId;
}

async function addCNAMERecord(zoneId) {
  console.log(`🔧 Adding CNAME record: ${CNAME_NAME}.${ZONE_NAME} -> ${CNAME_TARGET}...`);
  
  // Check if record already exists
  try {
    const existing = await makeRequest('GET', `/client/v4/zones/${zoneId}/dns_records?name=${CNAME_NAME}.${ZONE_NAME}`);
    if (existing.result.length > 0) {
      console.log(`ℹ️  CNAME record already exists`);
      console.log(`📋 Record ID: ${existing.result[0].id}`);
      console.log(`🎯 Target: ${existing.result[0].content}`);
      return existing.result[0];
    }
  } catch (error) {
    // Continue if check fails
  }

  // Create CNAME record
  const data = {
    type: 'CNAME',
    name: CNAME_NAME,
    content: CNAME_TARGET,
    ttl: 1 // Auto TTL
  };

  const result = await makeRequest('POST', `/client/v4/zones/${zoneId}/dns_records`, data);
  console.log(`✅ CNAME record created successfully!`);
  console.log(`📋 Record ID: ${result.result.id}`);
  console.log(`🎯 Target: ${result.result.content}`);
  return result.result;
}

async function main() {
  try {
    console.log('🎯 Adding CNAME record for custom domain...\n');
    
    // Step 1: Get zone ID
    const zoneId = await getZoneId();
    
    // Step 2: Add CNAME record
    await addCNAMERecord(zoneId);
    
    console.log('\n🎉 CNAME record setup complete!');
    console.log(`🌐 Your API will be available at: https://${CNAME_NAME}.${ZONE_NAME}`);
    console.log('⏳ DNS propagation may take a few minutes...');
    console.log('\n💡 Next steps:');
    console.log('1. Wait for DNS propagation (usually 1-5 minutes)');
    console.log('2. Test the domain: curl "https://complaints.aso.market/?url=YOUR_SHEET_URL"');
    
  } catch (error) {
    console.error('❌ Error adding CNAME record:', error.message);
    process.exit(1);
  }
}

main();
