/**
 * OpenAI Integration Test Utility
 * 
 * This script tests the OpenAI integration service by making API calls
 * to validate functionality and error handling.
 */

// Use colors for better console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m'
};

// Load environment configuration
try {
  require('dotenv').config();
} catch (error) {
  console.log('dotenv package not available, using environment variables as is');
}

// Load the OpenAI service
try {
  var openaiService = require('./server/services/openai');
  console.log('OpenAI service loaded successfully');
} catch (error) {
  console.error(`${colors.red}Failed to load OpenAI service: ${error.message}${colors.reset}`);
  console.error(`${colors.yellow}Make sure the server/services/openai.js file exists${colors.reset}`);
  process.exit(1);
}

console.log(`${colors.blue}${colors.bold}==============================================${colors.reset}`);
console.log(`${colors.blue}${colors.bold}       OpenAI Integration Test Tool          ${colors.reset}`);
console.log(`${colors.blue}${colors.bold}==============================================${colors.reset}`);
console.log('');

// Check if OpenAI API key is set
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
if (!OPENAI_API_KEY) {
  console.log(`${colors.red}❌ OPENAI_API_KEY is not set${colors.reset}`);
  console.log(`${colors.yellow}Set this environment variable to use the OpenAI integration${colors.reset}`);
  process.exit(1);
} else {
  console.log(`${colors.green}✅ OPENAI_API_KEY is set${colors.reset}`);
}

console.log('');

/**
 * Test chat completion generation
 */
async function testChatCompletion() {
  console.log(`${colors.cyan}Testing OpenAI Chat Completion...${colors.reset}`);
  
  const prompt = 'Explain the concept of color theory in 2-3 sentences.';
  console.log(`${colors.yellow}Prompt: "${prompt}"${colors.reset}`);
  
  try {
    const result = await openaiService.generateChatCompletion(prompt, {
      systemPrompt: 'You are a color design expert. Be concise and informative.',
      maxTokens: 150
    });
    
    console.log(`${colors.green}✅ Successfully generated text response${colors.reset}`);
    console.log(`${colors.green}Model: ${result.model}${colors.reset}`);
    console.log(`${colors.green}Response time: ${result.response_time_ms}ms${colors.reset}`);
    console.log(`${colors.cyan}Response:${colors.reset}`);
    console.log(result.text);
    
    // Display token usage
    if (result.usage) {
      console.log(`${colors.yellow}Token Usage:${colors.reset}`);
      console.log(`  - Prompt tokens: ${result.usage.prompt_tokens}`);
      console.log(`  - Completion tokens: ${result.usage.completion_tokens}`);
      console.log(`  - Total tokens: ${result.usage.total_tokens}`);
    }
    
    return true;
  } catch (error) {
    console.log(`${colors.red}❌ Failed to generate text: ${error.message}${colors.reset}`);
    return false;
  }
}

/**
 * Test JSON output generation
 */
async function testJsonOutput() {
  console.log('');
  console.log(`${colors.cyan}Testing OpenAI JSON Output...${colors.reset}`);
  
  const prompt = 'Generate a color palette with 3 complementary colors. For each color, provide the hex code and a name.';
  console.log(`${colors.yellow}Prompt: "${prompt}"${colors.reset}`);
  
  try {
    const result = await openaiService.generateJsonOutput(prompt, {
      systemPrompt: 'You are a color palette generator. Respond with a JSON object including "colors" array with "hex" and "name" properties for each color.'
    });
    
    console.log(`${colors.green}✅ Successfully generated JSON response${colors.reset}`);
    console.log(`${colors.cyan}JSON Response:${colors.reset}`);
    console.log(JSON.stringify(result, null, 2));
    
    return true;
  } catch (error) {
    console.log(`${colors.red}❌ Failed to generate JSON: ${error.message}${colors.reset}`);
    return false;
  }
}

/**
 * Test API connection
 */
async function testApiConnection() {
  console.log('');
  console.log(`${colors.cyan}Testing OpenAI API Connection...${colors.reset}`);
  
  try {
    const connectionTest = await openaiService.testConnection();
    
    if (connectionTest) {
      console.log(`${colors.green}✅ Successfully connected to OpenAI API${colors.reset}`);
      return true;
    } else {
      console.log(`${colors.red}❌ Failed to connect to OpenAI API${colors.reset}`);
      return false;
    }
  } catch (error) {
    console.log(`${colors.red}❌ Connection test error: ${error.message}${colors.reset}`);
    return false;
  }
}

/**
 * Run all tests
 */
async function runTests() {
  console.log(`${colors.blue}Starting OpenAI integration tests...${colors.reset}`);
  
  const connectionResult = await testApiConnection();
  
  // Only proceed with other tests if connection is successful
  let completionResult = false;
  let jsonResult = false;
  
  if (connectionResult) {
    completionResult = await testChatCompletion();
    jsonResult = await testJsonOutput();
  }
  
  console.log('');
  console.log(`${colors.blue}${colors.bold}==============================================${colors.reset}`);
  console.log(`${colors.blue}${colors.bold}                 Test Results                ${colors.reset}`);
  console.log(`${colors.blue}${colors.bold}==============================================${colors.reset}`);
  console.log('');
  
  console.log(`API Connection:     ${connectionResult ? colors.green + 'PASS' : colors.red + 'FAIL'}${colors.reset}`);
  console.log(`Chat Completion:    ${completionResult ? colors.green + 'PASS' : colors.red + 'FAIL'}${colors.reset}`);
  console.log(`JSON Generation:    ${jsonResult ? colors.green + 'PASS' : colors.red + 'FAIL'}${colors.reset}`);
  
  console.log('');
  if (connectionResult && completionResult && jsonResult) {
    console.log(`${colors.green}${colors.bold}All tests passed! OpenAI integration is working correctly.${colors.reset}`);
  } else {
    console.log(`${colors.yellow}${colors.bold}Some tests failed. Check the messages above for details.${colors.reset}`);
  }
  
  console.log('');
  console.log(`${colors.cyan}To use the OpenAI integration in your application:${colors.reset}`);
  console.log(`${colors.cyan}1. Import the service: const openai = require('./server/services/openai')${colors.reset}`);
  console.log(`${colors.cyan}2. Use the available methods: generateChatCompletion(), generateJsonOutput(), etc.${colors.reset}`);
}

// Run all tests
runTests().catch(error => {
  console.error(`${colors.red}Unexpected error: ${error.message}${colors.reset}`);
  process.exit(1);
});