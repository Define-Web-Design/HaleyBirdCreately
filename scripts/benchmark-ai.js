/**
 * AI Provider Benchmarking Script
 * 
 * This script runs a standardized set of tests against all configured AI providers
 * to benchmark their performance, response quality, and reliability.
 * 
 * Usage:
 *   node scripts/benchmark-ai.js [--detailed] [--providers=openai,anthropic,perplexity]
 */

const fs = require('fs');
const path = require('path');
const { performance } = require('perf_hooks');
const axios = require('axios');
const { program } = require('commander');

// Parse command line options
program
  .option('-d, --detailed', 'Run detailed benchmarks (more tests, slower)')
  .option('-p, --providers <list>', 'Comma-separated list of providers to test')
  .option('-o, --output <file>', 'Output file for results (defaults to benchmark-results.json)')
  .option('-r, --repeat <number>', 'Number of times to repeat each test', parseInt, 3)
  .option('-q, --quiet', 'Suppress console output')
  .parse();

const options = program.opts();

// Set provider list from options or default
const providers = options.providers 
  ? options.providers.split(',') 
  : ['openai', 'anthropic', 'perplexity'];

// Configure test prompts for benchmarking
const BENCHMARK_PROMPTS = {
  // Text generation benchmarks
  text: [
    {
      name: 'creative_writing',
      prompt: 'Write a short story about a robot discovering emotions for the first time.'
    },
    {
      name: 'factual_explanation',
      prompt: 'Explain how photosynthesis works in simple terms.'
    },
    {
      name: 'code_generation',
      prompt: 'Write a JavaScript function that checks if a string is a palindrome.'
    }
  ],
  
  // JSON generation benchmarks
  json: [
    {
      name: 'product_catalog',
      prompt: 'Generate a JSON array of 5 fictional products with fields for id, name, price, and category.'
    },
    {
      name: 'user_profiles',
      prompt: 'Create JSON data for 3 user profiles with name, age, email, and a list of interests.'
    }
  ],
  
  // Chat completion benchmarks
  chat: [
    {
      name: 'customer_support',
      messages: [
        { role: 'system', content: 'You are a helpful customer support agent.' },
        { role: 'user', content: 'I ordered a product 5 days ago but it hasn\'t arrived yet. My order number is ABC123.' },
        { role: 'assistant', content: 'I apologize for the delay with your order ABC123. Let me check the status for you. Could you please confirm the shipping address?' },
        { role: 'user', content: 'My address is 123 Main St, New York, NY 10001.' }
      ]
    },
    {
      name: 'reasoning',
      messages: [
        { role: 'system', content: 'You are a helpful problem-solving assistant.' },
        { role: 'user', content: 'I need to put 10 gallons of water into a swimming pool using only a 3-gallon bucket and a 5-gallon bucket. How can I do this?' }
      ]
    }
  ],
  
  // Additional detailed tests
  detailed: {
    text: [
      {
        name: 'complex_reasoning',
        prompt: 'Explain the prisoner\'s dilemma and how it applies to climate change negotiations between countries.'
      },
      {
        name: 'multilingual',
        prompt: 'Translate the following to French, Spanish, and German: "The quick brown fox jumps over the lazy dog."'
      }
    ],
    json: [
      {
        name: 'complex_schema',
        prompt: 'Generate a JSON representation of a library database with books, authors, and borrowing records. Include at least 3 books with different authors and borrowing status.'
      }
    ],
    chat: [
      {
        name: 'multi_turn_reasoning',
        messages: [
          { role: 'system', content: 'You are a math tutor helping a student.' },
          { role: 'user', content: 'I need help solving this problem: If f(x) = 2x + 3 and g(x) = x^2, what is f(g(2))?' },
          { role: 'assistant', content: 'To find f(g(2)), we first calculate g(2), then apply f to that result. g(2) = 2^2 = 4. Now we calculate f(4) = 2(4) + 3 = 8 + 3 = 11.' },
          { role: 'user', content: 'Great! Now what if we calculate g(f(2))?' }
        ]
      }
    ]
  }
};

// Set up API client
const apiClient = axios.create({
  baseURL: 'http://localhost:3000', // Adjust to your server URL
  timeout: 30000 // 30 seconds timeout
});

/**
 * Run the benchmark
 */
async function runBenchmark() {
  console.log('Starting AI Provider Benchmark');
  console.log(`Testing providers: ${providers.join(', ')}`);
  console.log(`Repeating each test ${options.repeat} times`);
  
  const results = {
    timestamp: new Date().toISOString(),
    config: {
      providers,
      detailed: options.detailed,
      repeat: options.repeat
    },
    results: {}
  };
  
  // Initialize result structure
  for (const provider of providers) {
    results.results[provider] = {
      text: {},
      json: {},
      chat: {}
    };
  }
  
  // Test text generation
  for (const test of BENCHMARK_PROMPTS.text) {
    await runTest('text', test, results);
  }
  
  // Test JSON generation
  for (const test of BENCHMARK_PROMPTS.json) {
    await runTest('json', test, results);
  }
  
  // Test chat completion
  for (const test of BENCHMARK_PROMPTS.chat) {
    await runTest('chat', test, results);
  }
  
  // Run detailed tests if requested
  if (options.detailed) {
    console.log('\nRunning detailed benchmarks...');
    
    for (const test of BENCHMARK_PROMPTS.detailed.text) {
      await runTest('text', test, results);
    }
    
    for (const test of BENCHMARK_PROMPTS.detailed.json) {
      await runTest('json', test, results);
    }
    
    for (const test of BENCHMARK_PROMPTS.detailed.chat) {
      await runTest('chat', test, results);
    }
  }
  
  // Calculate aggregate metrics
  calculateAggregateMetrics(results);
  
  // Save results
  const outputFile = options.output || 'benchmark-results.json';
  fs.writeFileSync(
    path.join(process.cwd(), outputFile),
    JSON.stringify(results, null, 2)
  );
  
  console.log(`\nBenchmark complete! Results saved to ${outputFile}`);
  
  // Print summary
  console.log('\n=== Benchmark Summary ===');
  for (const provider of providers) {
    const aggregate = results.aggregateMetrics[provider];
    console.log(`\n${provider.toUpperCase()}:`);
    console.log(`  Average latency: ${aggregate.averageLatency.toFixed(2)}ms`);
    console.log(`  Success rate: ${(aggregate.successRate * 100).toFixed(1)}%`);
    console.log(`  Average token ratio: ${aggregate.averageTokenRatio.toFixed(2)}`);
  }
}

/**
 * Run a specific test case
 */
async function runTest(testType, test, results) {
  if (!options.quiet) {
    console.log(`\nRunning ${testType} test: ${test.name}`);
  }
  
  for (const provider of providers) {
    if (!options.quiet) {
      process.stdout.write(`  Testing ${provider}... `);
    }
    
    const testResults = [];
    
    // Run the test multiple times for more reliable results
    for (let i = 0; i < options.repeat; i++) {
      try {
        const startTime = performance.now();
        let response;
        
        // Make the API call based on test type
        switch (testType) {
          case 'text':
            response = await apiClient.post('/api/ai/generate-text', {
              prompt: test.prompt,
              options: { provider }
            });
            break;
            
          case 'json':
            response = await apiClient.post('/api/ai/generate-json', {
              prompt: test.prompt,
              options: { provider }
            });
            break;
            
          case 'chat':
            response = await apiClient.post('/api/ai/chat', {
              messages: test.messages,
              options: { provider }
            });
            break;
        }
        
        const endTime = performance.now();
        const latency = endTime - startTime;
        
        // Extract response data and token usage
        const data = response.data;
        const tokenInfo = data.usage || { promptTokens: 0, completionTokens: 0, totalTokens: 0 };
        
        testResults.push({
          success: true,
          latency,
          tokenInfo,
          responseLength: JSON.stringify(data).length
        });
      } catch (error) {
        testResults.push({
          success: false,
          error: error.message || 'Unknown error',
          errorDetails: error.response?.data || {}
        });
      }
    }
    
    // Calculate aggregate test results
    const successfulTests = testResults.filter(r => r.success);
    const avgLatency = successfulTests.length > 0
      ? successfulTests.reduce((sum, r) => sum + r.latency, 0) / successfulTests.length
      : 0;
    
    const result = {
      successRate: successfulTests.length / testResults.length,
      averageLatency: avgLatency,
      results: testResults
    };
    
    // Store results
    results.results[provider][testType][test.name] = result;
    
    // Print result summary
    if (!options.quiet) {
      if (result.successRate === 1) {
        console.log(`Success (avg: ${avgLatency.toFixed(0)}ms)`);
      } else if (result.successRate === 0) {
        console.log('Failed');
      } else {
        console.log(`Partial success (${(result.successRate * 100).toFixed(0)}%, avg: ${avgLatency.toFixed(0)}ms)`);
      }
    }
  }
}

/**
 * Calculate aggregate metrics across all tests
 */
function calculateAggregateMetrics(results) {
  const aggregateMetrics = {};
  
  for (const provider of providers) {
    const providerResults = results.results[provider];
    let totalLatency = 0;
    let totalTests = 0;
    let successfulTests = 0;
    let totalTokenRatio = 0;
    let tokenTests = 0;
    
    // Process each test category
    for (const category of Object.keys(providerResults)) {
      for (const testName of Object.keys(providerResults[category])) {
        const test = providerResults[category][testName];
        
        // Count tests and successful tests
        const testCount = test.results.length;
        totalTests += testCount;
        
        const testSuccessCount = test.results.filter(r => r.success).length;
        successfulTests += testSuccessCount;
        
        // Sum latencies
        if (test.averageLatency) {
          totalLatency += test.averageLatency * testSuccessCount;
        }
        
        // Calculate token efficiency
        for (const result of test.results) {
          if (result.success && result.tokenInfo && result.tokenInfo.promptTokens > 0) {
            const ratio = result.tokenInfo.completionTokens / result.tokenInfo.promptTokens;
            totalTokenRatio += ratio;
            tokenTests++;
          }
        }
      }
    }
    
    // Calculate final metrics
    aggregateMetrics[provider] = {
      totalTests,
      successfulTests,
      successRate: totalTests > 0 ? successfulTests / totalTests : 0,
      averageLatency: successfulTests > 0 ? totalLatency / successfulTests : 0,
      averageTokenRatio: tokenTests > 0 ? totalTokenRatio / tokenTests : 0
    };
  }
  
  // Add to results
  results.aggregateMetrics = aggregateMetrics;
}

// Run the benchmark
runBenchmark().catch(error => {
  console.error('Benchmark failed:', error);
  process.exit(1);
});