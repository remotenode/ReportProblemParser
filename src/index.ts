import { Env } from './types';
import { parseGoogleSheetsData } from './parser';

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json'
};

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    try {
      // Handle preflight requests
      if (request.method === 'OPTIONS') {
        return new Response(null, { headers: corsHeaders });
      }

      // Only allow GET requests
      if (request.method !== 'GET') {
        return new Response(JSON.stringify({ error: 'Method not allowed' }), {
          status: 405,
          headers: corsHeaders
        });
      }

      console.log('🔍 Processing request to parse Google Sheets data...');
      
      // Parse the Google Sheets data
      const result = await parseGoogleSheetsData();
      
      console.log('✅ Successfully parsed data, returning response');
      
      return new Response(JSON.stringify(result), {
        headers: corsHeaders
      });
      
    } catch (error) {
      console.error('❌ Error processing request:', error);
      
      return new Response(JSON.stringify({ 
        error: 'Failed to parse Google Sheets data',
        message: error instanceof Error ? error.message : 'Unknown error'
      }), {
        status: 500,
        headers: corsHeaders
      });
    }
  }
};
