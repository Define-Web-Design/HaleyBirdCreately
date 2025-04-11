/**
 * Mistral AI Integration Test Script
 * 
 * This script tests the connection to Mistral AI and Codestral services
 * to ensure that the API keys are working properly.
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

// Check if API keys are set
const MISTRAL_API_KEY = process.env.MISTRAL_API_KEY;
const CODESTRAL_API_KEY = process.env.CODESTRAL_API_KEY;

console.log(`${colors.blue}${colors.bold}==============================================${colors.reset}`);
console.log(`${colors.blue}${colors.bold}     Mistral AI Integration Test Tool         ${colors.reset}`);
console.log(`${colors.blue}${colors.bold}==============================================${colors.reset}`);
console.log('');

// Check API key availability
console.log(`${colors.cyan}Checking API keys...${colors.reset}`);
if (!MISTRAL_API_KEY) {
  console.log(`${colors.red}❌ MISTRAL_API_KEY is not set${colors.reset}`);
  console.log(`${colors.yellow}Set this environment variable to use Mistral AI services${colors.reset}`);
} else {
  console.log(`${colors.green}✅ MISTRAL_API_KEY is set${colors.reset}`);
}

if (!CODESTRAL_API_KEY) {
  console.log(`${colors.red}❌ CODESTRAL_API_KEY is not set${colors.reset}`);
  console.log(`${colors.yellow}Set this environment variable to use Codestral code assistance${colors.reset}`);
} else {
  console.log(`${colors.green}✅ CODESTRAL_API_KEY is set${colors.reset}`);
}

console.log('');

// Import required modules
let axios;
try {
  axios = require('axios');
} catch (error) {
  console.log(`${colors.red}❌ axios package is required for HTTP requests${colors.reset}`);
  console.log(`${colors.yellow}Install it using: npm install axios${colors.reset}`);
  process.exit(1);
}

// Test Mistral API if key is available
async function testMistralAPI() {
  if (!MISTRAL_API_KEY) {
    console.log(`${colors.yellow}Skipping Mistral API test as the API key is not set${colors.reset}`);
    return false;
  }
  
  console.log(`${colors.cyan}Testing Mistral AI Chat API...${colors.reset}`);
  
  try {
    const response = await axios.post(
      'https://api.mistral.ai/v1/chat/completions',
      {
        model: 'mistral-tiny',
        messages: [
          { role: 'user', content: 'Hello, are you working? Please respond in one short sentence.' }
        ],
        max_tokens: 50,
        temperature: 0.7
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${MISTRAL_API_KEY}`
        }
      }
    );
    
    if (response.data && response.data.choices && response.data.choices.length > 0) {
      console.log(`${colors.green}✅ Mistral AI Chat API test successful${colors.reset}`);
      console.log(`${colors.green}Response: ${response.data.choices[0].message.content}${colors.reset}`);
      console.log(`${colors.cyan}Model: ${response.data.model}${colors.reset}`);
      console.log(`${colors.cyan}Usage: ${JSON.stringify(response.data.usage)}${colors.reset}`);
      return true;
    } else {
      console.log(`${colors.red}❌ Mistral AI Chat API test failed: Unexpected response format${colors.reset}`);
      console.log(`${colors.yellow}Response: ${JSON.stringify(response.data)}${colors.reset}`);
      return false;
    }
  } catch (error) {
    console.log(`${colors.red}❌ Mistral AI Chat API test failed: ${error.message}${colors.reset}`);
    if (error.response) {
      console.log(`${colors.yellow}Status: ${error.response.status}${colors.reset}`);
      console.log(`${colors.yellow}Response: ${JSON.stringify(error.response.data)}${colors.reset}`);
    }
    return false;
  }
}

// Test Codestral API if key is available
async function testCodestralAPI() {
  if (!CODESTRAL_API_KEY) {
    console.log(`${colors.yellow}Skipping Codestral API test as the API key is not set${colors.reset}`);
    return false;
  }
  
  console.log(`${colors.cyan}Testing Codestral Code Completion API...${colors.reset}`);
  
  try {
    const response = await axios.post(
      'https://codestral.mistral.ai/v1/chat/completions',
      {
        messages: [
          { role: 'user', content: 'Write a simple JavaScript function to add two numbers.' }
        ],
        max_tokens: 100,
        temperature: 0.2
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${CODESTRAL_API_KEY}`
        }
      }
    );
    
    if (response.data && response.data.choices && response.data.choices.length > 0) {
      console.log(`${colors.green}✅ Codestral API test successful${colors.reset}`);
      console.log(`${colors.green}Response:${colors.reset}`);
      console.log(response.data.choices[0].message.content);
      console.log(`${colors.cyan}Usage: ${JSON.stringify(response.data.usage)}${colors.reset}`);
      return true;
    } else {
      console.log(`${colors.red}❌ Codestral API test failed: Unexpected response format${colors.reset}`);
      console.log(`${colors.yellow}Response: ${JSON.stringify(response.data)}${colors.reset}`);
      return false;
    }
  } catch (error) {
    console.log(`${colors.red}❌ Codestral API test failed: ${error.message}${colors.reset}`);
    if (error.response) {
      console.log(`${colors.yellow}Status: ${error.response.status}${colors.reset}`);
      console.log(`${colors.yellow}Response: ${JSON.stringify(error.response.data)}${colors.reset}`);
    }
    return false;
  }
}

// Run all tests
async function runTests() {
  console.log('');
  const mistralResult = await testMistralAPI();
  
  console.log('');
  const codestralResult = await testCodestralAPI();
  
  console.log('');
  console.log(`${colors.blue}${colors.bold}==============================================${colors.reset}`);
  console.log(`${colors.blue}${colors.bold}                 Test Results                ${colors.reset}`);
  console.log(`${colors.blue}${colors.bold}==============================================${colors.reset}`);
  console.log('');
  
  console.log(`Mistral AI Chat API: ${mistralResult ? colors.green + 'PASS' : colors.red + 'FAIL'}${colors.reset}`);
  console.log(`Codestral Code API:  ${codestralResult ? colors.green + 'PASS' : colors.red + 'FAIL'}${colors.reset}`);
  
  console.log('');
  if (mistralResult && codestralResult) {
    console.log(`${colors.green}${colors.bold}All tests passed! Mistral AI integration is working correctly.${colors.reset}`);
  } else if (!MISTRAL_API_KEY && !CODESTRAL_API_KEY) {
    console.log(`${colors.red}${colors.bold}No API keys are set. Please configure your environment variables.${colors.reset}`);
  } else {
    console.log(`${colors.yellow}${colors.bold}Some tests failed. Check the messages above for details.${colors.reset}`);
  }
  
  console.log('');
  console.log(`${colors.cyan}For more information, visit:${colors.reset}`);
  console.log(`${colors.cyan}- Mistral AI documentation: https://docs.mistral.ai/api/`);
  console.log(`${colors.cyan}- Codestral documentation: https://console.mistral.ai/codestral/`);
}

// Run all tests
runTests().catch(error => {
  console.error(`${colors.red}Unexpected error: ${error.message}${colors.reset}`);
  process.exit(1);
});