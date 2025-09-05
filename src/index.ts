import { Env, StructuredError } from './types';
import { parseGoogleSheetsData } from './parser';

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json'
};

function createErrorResponse(error: any, status: number = 500): Response {
  let errorResponse: StructuredError;
  
  if (error && typeof error === 'object' && 'error' in error) {
    // It's already a structured error
    errorResponse = error as StructuredError;
  } else {
    // Create a structured error from a generic error
    errorResponse = {
      error: 'InternalServerError',
      message: error instanceof Error ? error.message : 'Unknown error occurred',
      code: 'INTERNAL_ERROR',
      timestamp: new Date().toISOString()
    };
  }
  
  return new Response(JSON.stringify(errorResponse), {
    status: status,
    headers: corsHeaders
  });
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    try {
      // Handle preflight requests
      if (request.method === 'OPTIONS') {
        return new Response(null, { headers: corsHeaders });
      }

      // Only allow GET requests
      if (request.method !== 'GET') {
        const errorResponse: StructuredError = {
          error: 'MethodNotAllowed',
          message: 'Only GET requests are allowed',
          code: 'METHOD_NOT_ALLOWED',
          timestamp: new Date().toISOString()
        };
        
        return new Response(JSON.stringify(errorResponse), {
          status: 405,
          headers: corsHeaders
        });
      }

      console.log('🔍 Processing request to parse Google Sheets data...');
      
      // Extract URL from query parameters
      const url = new URL(request.url);
      const sheetUrl = url.searchParams.get('url');
      
      console.log('📡 Sheet URL:', sheetUrl || 'Using default URL');
      
      // Parse the Google Sheets data
      const result = await parseGoogleSheetsData(sheetUrl || undefined);
      
      console.log('✅ Successfully parsed data, returning response');
      
      return new Response(JSON.stringify(result), {
        headers: corsHeaders
      });
      
    } catch (error) {
      console.error('❌ Error processing request:', error);
      
      // Determine appropriate status code based on error type
      let status = 500;
      if (error && typeof error === 'object' && 'code' in error) {
        const structuredError = error as StructuredError;
        switch (structuredError.code) {
          case 'VALIDATION_FAILED':
            status = 422; // Unprocessable Entity
            break;
          case 'PARSE_FAILED':
            status = 400; // Bad Request
            break;
          case 'INVALID_URL':
          case 'INVALID_GOOGLE_SHEETS_URL':
            status = 400; // Bad Request
            break;
          case 'METHOD_NOT_ALLOWED':
            status = 405;
            break;
          default:
            status = 500;
        }
      }
      
      return createErrorResponse(error, status);
    }
  }
};
