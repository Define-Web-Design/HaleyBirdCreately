/**
 * Utility for validating API endpoints and integration points
 */

export interface ApiEndpointValidation {
  endpoint: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  status: number;
  responseTime: number;
  valid: boolean;
  error?: string;
}

/**
 * Validate API endpoints to ensure they are functioning correctly
 * Includes improved error handling and TypeScript compatibility
 */
export async function validateApiEndpoints(): Promise<{
  success: boolean;
  results: ApiEndpointValidation[];
}> {
  console.log('Starting API endpoint validation...');

  // Define endpoints to test
  // These should match your actual API endpoints
  const endpointsToTest = [
    { endpoint: '/api/mood-capsules', method: 'GET' },
    { endpoint: '/api/mood-capsules', method: 'POST' },
    { endpoint: '/api/color-palettes', method: 'GET' },
    { endpoint: '/api/content-library', method: 'GET' },
    { endpoint: '/api/ai/enhance/caption', method: 'POST' },
    { endpoint: '/api/user/preferences', method: 'GET' },
    { endpoint: '/api/security/verify-ownership', method: 'POST' }
  ];

  const results: ApiEndpointValidation[] = [];
  let success = true;

  // Test each endpoint
  for (const { endpoint, method } of endpointsToTest) {
    console.log(`Testing ${method} ${endpoint}...`);

    try {
      const startTime = performance.now();

      // Make the request based on the method
      let response;
      if (method === 'GET') {
        response = await fetch(endpoint);
      } else {
        // For POST/PUT/DELETE, we need to send some mock data
        response = await fetch(endpoint, {
          method,
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            // Mock data for testing
            test: true,
            timestamp: new Date().toISOString()
          })
        });
      }

      const endTime = performance.now();
      const responseTime = Math.round(endTime - startTime);

      // Check if response is in the 200-299 range (success)
      const valid = response.status >= 200 && response.status < 300;

      if (!valid) {
        success = false;
      }

      results.push({
        endpoint,
        method,
        status: response.status,
        responseTime,
        valid,
        error: valid ? undefined : `HTTP ${response.status}: ${response.statusText}`
      });

    } catch (error) {
      console.error(`Error testing ${method} ${endpoint}:`, error);
      success = false;
      results.push({
        endpoint,
        method,
        status: 0,
        responseTime: 0,
        valid: false,
        error: error.message || 'Unknown error'
      });
    }
  }

  console.log('API endpoint validation complete');
  return { success, results };
}

/**
 * Generate a report of API validation results
 * @param results The validation results
 * @returns Formatted report string
 */
export function generateApiValidationReport(results: ApiEndpointValidation[]): string {
  const validEndpoints = results.filter(r => r.valid);
  const invalidEndpoints = results.filter(r => !r.valid);

  let report = `# API Endpoint Validation Report\n\n`;
  report += `## Summary\n`;
  report += `- Total endpoints: ${results.length}\n`;
  report += `- Valid: ${validEndpoints.length}\n`;
  report += `- Invalid: ${invalidEndpoints.length}\n\n`;

  if (invalidEndpoints.length > 0) {
    report += `## Failed Endpoints\n`;

    invalidEndpoints.forEach(endpoint => {
      report += `### ${endpoint.method} ${endpoint.endpoint}\n`;
      report += `- Status: ${endpoint.status}\n`;
      report += `- Error: ${endpoint.error}\n`;
      report += `- Response Time: ${endpoint.responseTime}ms\n\n`;
    });
  }

  report += `## All Endpoints\n`;
  results.forEach(endpoint => {
    report += `### ${endpoint.method} ${endpoint.endpoint}\n`;
    report += `- Status: ${endpoint.status === 0 ? 'Connection Error' : endpoint.status}\n`;
    report += `- Valid: ${endpoint.valid ? 'Yes' : 'No'}\n`;
    report += `- Response Time: ${endpoint.responseTime}ms\n`;
    if (endpoint.error) {
      report += `- Error: ${endpoint.error}\n`;
    }
    report += `\n`;
  });

  return report;
}