/**
 * AI Service Benchmarking Script
 * 
 * This script runs benchmarks against different AI providers to compare
 * performance, quality, and reliability.
 */

// Import required modules
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { AIService } = require('../dist/server/ai/aiService');
const { initAdapters } = require('../dist/server/ai/initAdapters');
const { createSimpleFallbackStrategy } = require('../dist/server/ai/fallbackStrategies');

// Benchmark configuration
const BENCHMARK_CONFIG = {
  // Number of iterations for each test
  iterations: 5,
  
  // Timeout for each request in ms
  timeout: 30000,
  
  // Test cases for text generation
  textPrompts: [
    'Explain quantum computing in simple terms.',
    'Write a short poem about technology.',
    'What are the key differences between REST and GraphQL?',
    'Describe the process of photosynthesis.',
    'List five strategies for effective time management.'
  ],
  
  // Test cases for JSON generation
  jsonPrompts: [
    'Generate a JSON structure for a blog post with title, author, date, content, and tags.',
    'Create a JSON representation of a product catalog item with name, price, description, and categories.',
    'Build a JSON schema for a user profile with personal details, preferences, and privacy settings.',
    'Design a JSON structure for a recipe with ingredients, instructions, and nutritional information.',
    'Create a JSON format for a calendar event with time, location, attendees, and reminders.'
  ],
  
  // Test cases for chat completion
  chatPrompts: [
    [
      { role: 'system', content: 'You are a helpful assistant.' },
      { role: 'user', content: 'What is the capital of France?' }
    ],
    [
      { role: 'system', content: 'You are a helpful assistant.' },
      { role: 'user', content: 'How does a car engine work?' }
    ],
    [
      { role: 'system', content: 'You are a helpful assistant.' },
      { role: 'user', content: 'Can you explain the concept of machine learning?' }
    ]
  ],
  
  // AI providers to benchmark
  providers: [
    'openai',
    'anthropic',
    'perplexity'
  ]
};

// Results storage
const results = {
  text: {},
  json: {},
  chat: {},
  summary: {}
};

/**
 * Run text generation benchmark
 */
async function runTextBenchmark(aiService, provider) {
  console.log(`\nRunning text generation benchmark for ${provider}...`);
  
  const providerResults = {
    latency: [],
    tokenCounts: [],
    errors: 0
  };
  
  for (const prompt of BENCHMARK_CONFIG.textPrompts) {
    for (let i = 0; i < BENCHMARK_CONFIG.iterations; i++) {
      try {
        console.log(`  Running prompt ${BENCHMARK_CONFIG.textPrompts.indexOf(prompt) + 1}, iteration ${i + 1}...`);
        
        const startTime = Date.now();
        const response = await aiService.generateText(prompt, {
          provider,
          maxTokens: 200
        });
        const endTime = Date.now();
        
        providerResults.latency.push(endTime - startTime);
        
        if (response.usage) {
          providerResults.tokenCounts.push({
            promptTokens: response.usage.promptTokens,
            completionTokens: response.usage.completionTokens,
            totalTokens: response.usage.totalTokens
          });
        }
      } catch (error) {
        console.error(`    Error: ${error.message}`);
        providerResults.errors++;
      }
    }
  }
  
  results.text[provider] = {
    avgLatency: providerResults.latency.length > 0 
      ? providerResults.latency.reduce((a, b) => a + b, 0) / providerResults.latency.length 
      : null,
    medianLatency: providerResults.latency.length > 0 
      ? calculateMedian(providerResults.latency) 
      : null,
    maxLatency: providerResults.latency.length > 0 
      ? Math.max(...providerResults.latency) 
      : null,
    minLatency: providerResults.latency.length > 0 
      ? Math.min(...providerResults.latency) 
      : null,
    errorRate: providerResults.errors / (BENCHMARK_CONFIG.textPrompts.length * BENCHMARK_CONFIG.iterations),
    avgTokenUsage: providerResults.tokenCounts.length > 0
      ? {
          promptTokens: providerResults.tokenCounts.reduce((a, b) => a + b.promptTokens, 0) / providerResults.tokenCounts.length,
          completionTokens: providerResults.tokenCounts.reduce((a, b) => a + b.completionTokens, 0) / providerResults.tokenCounts.length,
          totalTokens: providerResults.tokenCounts.reduce((a, b) => a + b.totalTokens, 0) / providerResults.tokenCounts.length
        }
      : null
  };
  
  console.log(`  Results for ${provider}:`);
  console.log(`    Avg Latency: ${results.text[provider].avgLatency?.toFixed(2)}ms`);
  console.log(`    Error Rate: ${(results.text[provider].errorRate * 100).toFixed(2)}%`);
}

/**
 * Run JSON generation benchmark
 */
async function runJsonBenchmark(aiService, provider) {
  console.log(`\nRunning JSON generation benchmark for ${provider}...`);
  
  const providerResults = {
    latency: [],
    tokenCounts: [],
    errors: 0,
    validJson: 0
  };
  
  for (const prompt of BENCHMARK_CONFIG.jsonPrompts) {
    for (let i = 0; i < BENCHMARK_CONFIG.iterations; i++) {
      try {
        console.log(`  Running prompt ${BENCHMARK_CONFIG.jsonPrompts.indexOf(prompt) + 1}, iteration ${i + 1}...`);
        
        const startTime = Date.now();
        const response = await aiService.generateJson(prompt, {
          provider,
          maxTokens: 500
        });
        const endTime = Date.now();
        
        providerResults.latency.push(endTime - startTime);
        
        if (response.usage) {
          providerResults.tokenCounts.push({
            promptTokens: response.usage.promptTokens,
            completionTokens: response.usage.completionTokens,
            totalTokens: response.usage.totalTokens
          });
        }
        
        // Check if output is valid JSON
        if (response.result && typeof response.result === 'object') {
          providerResults.validJson++;
        }
      } catch (error) {
        console.error(`    Error: ${error.message}`);
        providerResults.errors++;
      }
    }
  }
  
  results.json[provider] = {
    avgLatency: providerResults.latency.length > 0 
      ? providerResults.latency.reduce((a, b) => a + b, 0) / providerResults.latency.length 
      : null,
    medianLatency: providerResults.latency.length > 0 
      ? calculateMedian(providerResults.latency) 
      : null,
    maxLatency: providerResults.latency.length > 0 
      ? Math.max(...providerResults.latency) 
      : null,
    minLatency: providerResults.latency.length > 0 
      ? Math.min(...providerResults.latency) 
      : null,
    errorRate: providerResults.errors / (BENCHMARK_CONFIG.jsonPrompts.length * BENCHMARK_CONFIG.iterations),
    validJsonRate: providerResults.validJson / (BENCHMARK_CONFIG.jsonPrompts.length * BENCHMARK_CONFIG.iterations),
    avgTokenUsage: providerResults.tokenCounts.length > 0
      ? {
          promptTokens: providerResults.tokenCounts.reduce((a, b) => a + b.promptTokens, 0) / providerResults.tokenCounts.length,
          completionTokens: providerResults.tokenCounts.reduce((a, b) => a + b.completionTokens, 0) / providerResults.tokenCounts.length,
          totalTokens: providerResults.tokenCounts.reduce((a, b) => a + b.totalTokens, 0) / providerResults.tokenCounts.length
        }
      : null
  };
  
  console.log(`  Results for ${provider}:`);
  console.log(`    Avg Latency: ${results.json[provider].avgLatency?.toFixed(2)}ms`);
  console.log(`    Error Rate: ${(results.json[provider].errorRate * 100).toFixed(2)}%`);
  console.log(`    Valid JSON Rate: ${(results.json[provider].validJsonRate * 100).toFixed(2)}%`);
}

/**
 * Run chat completion benchmark
 */
async function runChatBenchmark(aiService, provider) {
  console.log(`\nRunning chat completion benchmark for ${provider}...`);
  
  const providerResults = {
    latency: [],
    tokenCounts: [],
    errors: 0
  };
  
  for (const messages of BENCHMARK_CONFIG.chatPrompts) {
    for (let i = 0; i < BENCHMARK_CONFIG.iterations; i++) {
      try {
        console.log(`  Running prompt ${BENCHMARK_CONFIG.chatPrompts.indexOf(messages) + 1}, iteration ${i + 1}...`);
        
        const startTime = Date.now();
        const response = await aiService.chatCompletion(messages, {
          provider,
          maxTokens: 200
        });
        const endTime = Date.now();
        
        providerResults.latency.push(endTime - startTime);
        
        if (response.usage) {
          providerResults.tokenCounts.push({
            promptTokens: response.usage.promptTokens,
            completionTokens: response.usage.completionTokens,
            totalTokens: response.usage.totalTokens
          });
        }
      } catch (error) {
        console.error(`    Error: ${error.message}`);
        providerResults.errors++;
      }
    }
  }
  
  results.chat[provider] = {
    avgLatency: providerResults.latency.length > 0 
      ? providerResults.latency.reduce((a, b) => a + b, 0) / providerResults.latency.length 
      : null,
    medianLatency: providerResults.latency.length > 0 
      ? calculateMedian(providerResults.latency) 
      : null,
    maxLatency: providerResults.latency.length > 0 
      ? Math.max(...providerResults.latency) 
      : null,
    minLatency: providerResults.latency.length > 0 
      ? Math.min(...providerResults.latency) 
      : null,
    errorRate: providerResults.errors / (BENCHMARK_CONFIG.chatPrompts.length * BENCHMARK_CONFIG.iterations),
    avgTokenUsage: providerResults.tokenCounts.length > 0
      ? {
          promptTokens: providerResults.tokenCounts.reduce((a, b) => a + b.promptTokens, 0) / providerResults.tokenCounts.length,
          completionTokens: providerResults.tokenCounts.reduce((a, b) => a + b.completionTokens, 0) / providerResults.tokenCounts.length,
          totalTokens: providerResults.tokenCounts.reduce((a, b) => a + b.totalTokens, 0) / providerResults.tokenCounts.length
        }
      : null
  };
  
  console.log(`  Results for ${provider}:`);
  console.log(`    Avg Latency: ${results.chat[provider].avgLatency?.toFixed(2)}ms`);
  console.log(`    Error Rate: ${(results.chat[provider].errorRate * 100).toFixed(2)}%`);
}

/**
 * Calculate median of an array of numbers
 */
function calculateMedian(values) {
  if (values.length === 0) return 0;
  
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  
  if (sorted.length % 2 === 0) {
    return (sorted[middle - 1] + sorted[middle]) / 2;
  }
  
  return sorted[middle];
}

/**
 * Generate summary of benchmark results
 */
function generateSummary() {
  const summary = {
    textGeneration: {},
    jsonGeneration: {},
    chatCompletion: {},
    overall: {}
  };
  
  // Calculate average latency and error rate for each provider
  for (const provider of BENCHMARK_CONFIG.providers) {
    const textResults = results.text[provider];
    const jsonResults = results.json[provider];
    const chatResults = results.chat[provider];
    
    if (textResults) {
      summary.textGeneration[provider] = {
        avgLatency: textResults.avgLatency,
        errorRate: textResults.errorRate
      };
    }
    
    if (jsonResults) {
      summary.jsonGeneration[provider] = {
        avgLatency: jsonResults.avgLatency,
        errorRate: jsonResults.errorRate,
        validJsonRate: jsonResults.validJsonRate
      };
    }
    
    if (chatResults) {
      summary.chatCompletion[provider] = {
        avgLatency: chatResults.avgLatency,
        errorRate: chatResults.errorRate
      };
    }
    
    // Calculate overall metrics
    const avgLatencies = [];
    const errorRates = [];
    
    if (textResults?.avgLatency) avgLatencies.push(textResults.avgLatency);
    if (jsonResults?.avgLatency) avgLatencies.push(jsonResults.avgLatency);
    if (chatResults?.avgLatency) avgLatencies.push(chatResults.avgLatency);
    
    if (textResults?.errorRate) errorRates.push(textResults.errorRate);
    if (jsonResults?.errorRate) errorRates.push(jsonResults.errorRate);
    if (chatResults?.errorRate) errorRates.push(chatResults.errorRate);
    
    summary.overall[provider] = {
      avgLatency: avgLatencies.length > 0 ? avgLatencies.reduce((a, b) => a + b, 0) / avgLatencies.length : null,
      errorRate: errorRates.length > 0 ? errorRates.reduce((a, b) => a + b, 0) / errorRates.length : null
    };
  }
  
  results.summary = summary;
}

/**
 * Save benchmark results to file
 */
function saveResultsToFile(timestamp) {
  const resultsDir = path.join(__dirname, '../logs/benchmarks');
  
  // Create logs directory if it doesn't exist
  if (!fs.existsSync(resultsDir)) {
    fs.mkdirSync(resultsDir, { recursive: true });
  }
  
  const filePath = path.join(resultsDir, `ai-benchmark-${timestamp}.json`);
  fs.writeFileSync(filePath, JSON.stringify(results, null, 2));
  
  console.log(`\nResults saved to ${filePath}`);
}

/**
 * Main benchmark function
 */
async function runBenchmark() {
  console.log('Starting AI service benchmark...');
  console.log(`Configuration: ${BENCHMARK_CONFIG.iterations} iterations for each test case`);
  
  const timestamp = new Date().toISOString().replace(/:/g, '-').replace(/\..+/, '');
  
  try {
    // Initialize AI service
    const registry = initAdapters();
    const aiService = new AIService(registry);
    
    // Run benchmarks for each provider
    for (const provider of BENCHMARK_CONFIG.providers) {
      // Skip providers that don't have API keys configured
      const hasApiKey = process.env[`${provider.toUpperCase()}_API_KEY`];
      if (!hasApiKey) {
        console.log(`\nSkipping ${provider} (no API key found)`);
        continue;
      }
      
      console.log(`\n===== Testing ${provider} =====`);
      
      // Run text generation benchmark
      await runTextBenchmark(aiService, provider);
      
      // Run JSON generation benchmark
      await runJsonBenchmark(aiService, provider);
      
      // Run chat completion benchmark  
      await runChatBenchmark(aiService, provider);
    }
    
    // Generate summary
    generateSummary();
    
    // Display summary
    console.log('\n===== Benchmark Summary =====');
    console.log(JSON.stringify(results.summary, null, 2));
    
    // Save results to file
    saveResultsToFile(timestamp);
    
  } catch (error) {
    console.error('Benchmark failed:', error);
  }
}

// Run the benchmark
if (require.main === module) {
  runBenchmark().catch(console.error);
}

module.exports = {
  runBenchmark,
  BENCHMARK_CONFIG
};