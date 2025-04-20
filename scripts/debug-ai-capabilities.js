
/**
 * AI Provider Capabilities Diagnostic Tool
 * 
 * This script tests and reports on the capabilities of configured AI providers,
 * helping to identify feature support, performance characteristics, and 
 * compatibility across different environments.
 */

const path = require('path');
const fs = require('fs');
const { featureRegistry } = require('../server/ai/adapters/featureDetection');
const { adapterRegistry } = require('../server/ai/adapters/adapterRegistry');

// Set of test prompts for capability detection
const CAPABILITY_TEST_PROMPTS = {
  textGeneration: "Generate a short paragraph about cloud computing.",
  jsonGeneration: "Generate a JSON object representing a user profile with name, age, and interests.",
  functionCalling: "Call a function that calculates the distance between two coordinates.",
  imageAnalysis: "Describe what you see in this image: [image placeholder]",
  streaming: "Tell me a story about an AI assistant, streaming the response word by word."
};

// Sample function definitions for testing function calling
const FUNCTION_DEFINITIONS = [
  {
    name: "calculate_distance",
    description: "Calculate the distance between two geographic coordinates",
    parameters: {
      type: "object",
      properties: {
        lat1: { type: "number", description: "Latitude of first point" },
        lon1: { type: "number", description: "Longitude of first point" },
        lat2: { type: "number", description: "Latitude of second point" },
        lon2: { type: "number", description: "Longitude of second point" }
      },
      required: ["lat1", "lon1", "lat2", "lon2"]
    }
  }
];

/**
 * Run comprehensive capability tests across all providers
 */
async function testProviderCapabilities() {
  console.log('🔍 Testing AI Provider Capabilities...\n');
  
  // Get all registered adapters
  const registry = adapterRegistry;
  const adapters = Array.from(registry.getAvailableAdapters());
  
  if (adapters.length === 0) {
    console.error('❌ No AI providers available for testing');
    return {
      status: 'error',
      message: 'No AI providers available'
    };
  }
  
  console.log(`📊 Found ${adapters.length} available AI providers\n`);
  
  const results = {};
  
  // Test each adapter
  for (const adapter of adapters) {
    const adapterName = adapter.constructor.name;
    console.log(`\n🧪 Testing provider: ${adapterName}`);
    
    try {
      // Get adapter status
      const status = adapter.getStatus();
      
      // Run feature detection
      const detectionResult = await featureRegistry.detectFeatures(adapterName.toLowerCase(), adapter);
      
      // Performance test (basic latency)
      const latencyStart = Date.now();
      const latencyTestResult = await adapter.generateText(
        "Hello, this is a simple latency test.", 
        { temperature: 0.7, maxTokens: 50 }
      ).catch(err => ({ error: err.message }));
      const latency = Date.now() - latencyStart;
      
      // Extract models from adapter if available
      let models = [];
      if (adapter.getModels && typeof adapter.getModels === 'function') {
        models = await adapter.getModels().catch(() => []);
      }
      
      // Compile results
      results[adapterName] = {
        status: status.available ? 'available' : 'unavailable',
        features: {
          supported: Array.from(detectionResult.supportedFeatures),
          unsupported: Array.from(detectionResult.unsupportedFeatures),
          indeterminate: Array.from(detectionResult.indeterminateFeatures)
        },
        performance: {
          latency: latency,
          unit: 'ms'
        },
        models: models.length > 0 ? models : 'unknown',
        rawCapabilities: status.capabilities || {}
      };
      
      console.log(`✅ Completed tests for ${adapterName}`);
      console.log(`   - Supported features: ${Array.from(detectionResult.supportedFeatures).join(', ')}`);
      console.log(`   - Base latency: ${latency}ms`);
    } catch (error) {
      console.error(`❌ Error testing ${adapterName}:`, error);
      results[adapterName] = {
        status: 'error',
        error: error.message
      };
    }
  }
  
  return {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    providerResults: results,
    summary: {
      tested: adapters.length,
      available: Object.values(results).filter(r => r.status === 'available').length,
      unavailable: Object.values(results).filter(r => r.status === 'unavailable').length,
      errors: Object.values(results).filter(r => r.status === 'error').length
    }
  };
}

/**
 * Generate comprehensive report and save to file
 */
async function generateCapabilityReport() {
  try {
    const results = await testProviderCapabilities();
    
    // Create report directory if it doesn't exist
    const reportDir = path.join(__dirname, '../logs/ai-capabilities');
    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true });
    }
    
    // Generate report filename with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const reportPath = path.join(reportDir, `capability-report-${timestamp}.json`);
    
    // Write report to file
    fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
    console.log(`\n📝 Capability report saved to: ${reportPath}`);
    
    return results;
  } catch (error) {
    console.error('Failed to generate capability report:', error);
    return { error: error.message };
  }
}

// Run directly or export for use in other modules
if (require.main === module) {
  generateCapabilityReport()
    .then(results => {
      console.log('\n✨ AI Provider Capability Analysis Complete');
      
      // Display summary table
      console.log('\n📊 Summary:');
      console.table(results.summary);
      
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ Error running capability tests:', error);
      process.exit(1);
    });
} else {
  module.exports = {
    testProviderCapabilities,
    generateCapabilityReport
  };
}
