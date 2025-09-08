#!/usr/bin/env node

const https = require('https');

// Configuration
const ACCOUNT_ID = 'a872f67a3331071736867b65a7c92f03'; // From wrangler whoami
const WORKER_NAME = 'report-problem-parser';
const CUSTOM_DOMAIN = 'complaints.aso.market';
const ZONE_NAME = 'aso.market';

// Get API token from environment or wrangler config
const API_TOKEN = process.env.CLOUDFLARE_API_TOKEN;

if (!API_TOKEN) {
  console.error('❌ CLOUDFLARE_API_TOKEN environment variable is required');
  console.log('💡 Get your API token from: https://dash.cloudflare.com/profile/api-tokens');
  console.log('💡 Create a token with Zone:Edit and Workers:Edit permissions');
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

async function createCustomDomain(zoneId) {
  console.log(`🚀 Creating custom domain ${CUSTOM_DOMAIN} for worker ${WORKER_NAME}...`);
  
  const data = {
    hostname: CUSTOM_DOMAIN,
    service: WORKER_NAME,
    environment: 'production'
  };

  try {
    const result = await makeRequest('POST', `/client/v4/accounts/${ACCOUNT_ID}/workers/domains`, data);
    console.log(`✅ Custom domain created successfully!`);
    console.log(`📋 Domain ID: ${result.result.id}`);
    return result.result;
  } catch (error) {
    if (error.message.includes('already exists')) {
      console.log(`ℹ️  Custom domain already exists`);
      return null;
    }
    throw error;
  }
}

async function setupDNSRecord(zoneId) {
  console.log(`🔧 Setting up DNS record for ${CUSTOM_DOMAIN}...`);
  
  // Check if record already exists
  try {
    const existing = await makeRequest('GET', `/client/v4/zones/${zoneId}/dns_records?name=${CUSTOM_DOMAIN}`);
    if (existing.result.length > 0) {
      console.log(`ℹ️  DNS record already exists`);
      return existing.result[0];
    }
  } catch (error) {
    // Continue if check fails
  }

  // Create CNAME record
  const data = {
    type: 'CNAME',
    name: CUSTOM_DOMAIN,
    content: `${WORKER_NAME}.${ACCOUNT_ID}.workers.dev`,
    ttl: 1 // Auto TTL
  };

  const result = await makeRequest('POST', `/client/v4/zones/${zoneId}/dns_records`, data);
  console.log(`✅ DNS record created successfully!`);
  console.log(`📋 Record ID: ${result.result.id}`);
  return result.result;
}

async function main() {
  try {
    console.log('🎯 Setting up custom domain for Cloudflare Worker...\n');
    
    // Step 1: Get zone ID
    const zoneId = await getZoneId();
    
    // Step 2: Create custom domain
    await createCustomDomain(zoneId);
    
    // Step 3: Set up DNS record
    await setupDNSRecord(zoneId);
    
    console.log('\n🎉 Custom domain setup complete!');
    console.log(`🌐 Your API is now available at: https://${CUSTOM_DOMAIN}`);
    console.log('⏳ DNS propagation may take a few minutes...');
    
  } catch (error) {
    console.error('❌ Error setting up custom domain:', error.message);
    process.exit(1);
  }
}

main();
