
/**
 * AI Provider Diagnostics Utility
 * 
 * This script analyzes all registered AI adapters and generates a capability
 * matrix to help with debugging and feature planning.
 */

const { adapterRegistry } = require('../server/ai/adapters/adapterRegistry');
const { config } = require('../config/globalConfig');
const { Logger } = require('../server/utils/logger');

const logger = new Logger('AI-Diagnostics');

async function runAIProviderDiagnostics() {
  logger.info('Starting AI provider diagnostics');
  
  // Get all registered adapters
  const adapters = adapterRegistry.getAvailableAdapters();
  
  if (adapters.length === 0) {
    logger.warn('No AI providers are available');
    return { 
      status: 'warning',
      message: 'No AI providers are available'
    };
  }
  
  // Generate capability matrix
  const capabilityMatrix = {};
  const healthStatus = {};
  
  // Check health of all adapters
  const healthResults = await adapterRegistry.checkAllAdaptersHealth();
  
  // Gather information about each adapter
  for (const adapter of adapters) {
    const status = adapter.getStatus();
    const adapterName = status.name;
    
    capabilityMatrix[adapterName] = {
      capabilities: status.capabilities || {
        textGeneration: true,
        jsonGeneration: true,
        imageGeneration: false,
        streaming: false,
        functionCalling: false
      },
      priority: (adapter._priority !== undefined) ? adapter._priority : 999,
      models: [], // Would need to extend adapter interface to expose this
      healthy: healthResults.get(adapterName) || false
    };
    
    healthStatus[adapterName] = healthResults.get(adapterName) 
      ? 'healthy' 
      : 'unhealthy';
  }
  
  // Print results
  logger.info('AI Provider Capability Matrix:', capabilityMatrix);
  logger.info('AI Provider Health Status:', healthStatus);
  
  // Return diagnostics result
  return {
    status: 'success',
    adapters: adapters.length,
    capabilityMatrix,
    healthStatus,
    timestamp: new Date().toISOString()
  };
}

// Run diagnostics if called directly
if (require.main === module) {
  runAIProviderDiagnostics()
    .then(result => {
      console.log(JSON.stringify(result, null, 2));
      process.exit(0);
    })
    .catch(error => {
      console.error('AI diagnostics failed:', error);
      process.exit(1);
    });
}

module.exports = { runAIProviderDiagnostics };
