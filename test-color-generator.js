/**
 * Color Generator Test Script
 * 
 * This script tests the color generation service that uses Mistral AI.
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

// Load the color generator service
try {
  var colorGenerator = require('./server/services/color-generator');
  console.log('Color generator service loaded successfully');
} catch (error) {
  console.error(`${colors.red}Failed to load color generator service: ${error.message}${colors.reset}`);
  console.error(`${colors.yellow}Make sure the server/services/color-generator.js file exists${colors.reset}`);
  process.exit(1);
}

console.log(`${colors.blue}${colors.bold}==============================================${colors.reset}`);
console.log(`${colors.blue}${colors.bold}       Color Generator Test Tool              ${colors.reset}`);
console.log(`${colors.blue}${colors.bold}==============================================${colors.reset}`);
console.log('');

// Check if Mistral API key is set
const MISTRAL_API_KEY = process.env.MISTRAL_API_KEY;
if (!MISTRAL_API_KEY) {
  console.log(`${colors.red}❌ MISTRAL_API_KEY is not set${colors.reset}`);
  console.log(`${colors.yellow}Set this environment variable to use the Color Generator${colors.reset}`);
  process.exit(1);
} else {
  console.log(`${colors.green}✅ MISTRAL_API_KEY is set${colors.reset}`);
}

console.log('');

/**
 * Test color palette generation
 */
async function testPaletteGeneration() {
  console.log(`${colors.cyan}Testing Color Palette Generation...${colors.reset}`);
  
  const moodDescriptions = [
    'calming and peaceful',
    'energetic and vibrant',
    'professional and trustworthy'
  ];
  
  // Test a random mood from the list
  const randomMood = moodDescriptions[Math.floor(Math.random() * moodDescriptions.length)];
  console.log(`${colors.yellow}Generating palette for mood: "${randomMood}"${colors.reset}`);
  
  try {
    const result = await colorGenerator.generatePalette(randomMood, 5);
    
    if (!result.error) {
      console.log(`${colors.green}✅ Successfully generated color palette${colors.reset}`);
      console.log(`${colors.green}Theme: ${result.theme}${colors.reset}`);
      console.log(`${colors.green}Description: ${result.description}${colors.reset}`);
      console.log(`${colors.cyan}Colors:${colors.reset}`);
      
      result.colors.forEach(color => {
        console.log(`  - ${color.name} (${color.hex}) - ${color.role}`);
      });
      
      return true;
    } else {
      console.log(`${colors.red}❌ Failed to generate color palette: ${result.message}${colors.reset}`);
      if (result.rawResponse) {
        console.log(`${colors.yellow}Raw response: ${result.rawResponse}${colors.reset}`);
      }
      return false;
    }
  } catch (error) {
    console.log(`${colors.red}❌ Error during palette generation: ${error.message}${colors.reset}`);
    return false;
  }
}

/**
 * Test design scheme generation
 */
async function testDesignSchemeGeneration() {
  console.log('');
  console.log(`${colors.cyan}Testing Design Scheme Generation...${colors.reset}`);
  
  const designTypes = ['website', 'mobile app', 'presentation'];
  
  // Test a random design type from the list
  const randomType = designTypes[Math.floor(Math.random() * designTypes.length)];
  console.log(`${colors.yellow}Generating design scheme for: "${randomType}"${colors.reset}`);
  
  try {
    const result = await colorGenerator.generateDesignScheme(randomType);
    
    if (!result.error) {
      console.log(`${colors.green}✅ Successfully generated design scheme${colors.reset}`);
      console.log(`${colors.green}Design Type: ${result.designType}${colors.reset}`);
      console.log(`${colors.green}Description: ${result.description}${colors.reset}`);
      console.log(`${colors.cyan}Color Scheme:${colors.reset}`);
      
      Object.entries(result.scheme).forEach(([role, hex]) => {
        console.log(`  - ${role}: ${hex}`);
      });
      
      console.log(`${colors.cyan}Recommendations:${colors.reset}`);
      result.recommendations.forEach(tip => {
        console.log(`  - ${tip}`);
      });
      
      return true;
    } else {
      console.log(`${colors.red}❌ Failed to generate design scheme: ${result.message}${colors.reset}`);
      if (result.rawResponse) {
        console.log(`${colors.yellow}Raw response: ${result.rawResponse}${colors.reset}`);
      }
      return false;
    }
  } catch (error) {
    console.log(`${colors.red}❌ Error during design scheme generation: ${error.message}${colors.reset}`);
    return false;
  }
}

/**
 * Test accessible color suggestions
 */
async function testAccessibleColors() {
  console.log('');
  console.log(`${colors.cyan}Testing Accessible Color Suggestions...${colors.reset}`);
  
  const baseColor = '#3366CC';
  const purpose = 'background';
  
  console.log(`${colors.yellow}Suggesting accessible variations for ${baseColor} as ${purpose}${colors.reset}`);
  
  try {
    const result = await colorGenerator.suggestAccessibleColors(baseColor, purpose);
    
    if (!result.error) {
      console.log(`${colors.green}✅ Successfully generated accessible colors${colors.reset}`);
      console.log(`${colors.green}Base Color: ${result.baseColor}${colors.reset}`);
      console.log(`${colors.green}Purpose: ${result.purpose}${colors.reset}`);
      console.log(`${colors.green}WCAG Rating: ${result.wcagRating}${colors.reset}`);
      
      console.log(`${colors.cyan}Variations:${colors.reset}`);
      Object.entries(result.variations).forEach(([type, hex]) => {
        console.log(`  - ${type}: ${hex}`);
      });
      
      console.log(`${colors.cyan}Complementary Colors:${colors.reset}`);
      Object.entries(result.complementaryColors).forEach(([role, hex]) => {
        console.log(`  - ${role}: ${hex}`);
      });
      
      console.log(`${colors.cyan}Accessibility Tips:${colors.reset}`);
      result.tips.forEach(tip => {
        console.log(`  - ${tip}`);
      });
      
      return true;
    } else {
      console.log(`${colors.red}❌ Failed to suggest accessible colors: ${result.message}${colors.reset}`);
      if (result.rawResponse) {
        console.log(`${colors.yellow}Raw response: ${result.rawResponse}${colors.reset}`);
      }
      return false;
    }
  } catch (error) {
    console.log(`${colors.red}❌ Error during accessible colors suggestion: ${error.message}${colors.reset}`);
    return false;
  }
}

/**
 * Run all tests
 */
async function runTests() {
  console.log(`${colors.blue}Starting color generator tests...${colors.reset}`);
  
  const paletteResult = await testPaletteGeneration();
  const schemeResult = await testDesignSchemeGeneration();
  const accessibleResult = await testAccessibleColors();
  
  console.log('');
  console.log(`${colors.blue}${colors.bold}==============================================${colors.reset}`);
  console.log(`${colors.blue}${colors.bold}                 Test Results                ${colors.reset}`);
  console.log(`${colors.blue}${colors.bold}==============================================${colors.reset}`);
  console.log('');
  
  console.log(`Color Palette Generation:     ${paletteResult ? colors.green + 'PASS' : colors.red + 'FAIL'}${colors.reset}`);
  console.log(`Design Scheme Generation:     ${schemeResult ? colors.green + 'PASS' : colors.red + 'FAIL'}${colors.reset}`);
  console.log(`Accessible Color Suggestions: ${accessibleResult ? colors.green + 'PASS' : colors.red + 'FAIL'}${colors.reset}`);
  
  console.log('');
  if (paletteResult && schemeResult && accessibleResult) {
    console.log(`${colors.green}${colors.bold}All tests passed! Color generator is working correctly.${colors.reset}`);
  } else {
    console.log(`${colors.yellow}${colors.bold}Some tests failed. Check the messages above for details.${colors.reset}`);
  }
  
  console.log('');
  console.log(`${colors.cyan}To use the color generator in your application:${colors.reset}`);
  console.log(`${colors.cyan}1. Make a POST request to /api/colors/generate-palette${colors.reset}`);
  console.log(`${colors.cyan}2. Include a "description" in the request body${colors.reset}`);
  console.log(`${colors.cyan}3. Optionally specify the number of "colors" (default: 5)${colors.reset}`);
}

// Run all tests
runTests().catch(error => {
  console.error(`${colors.red}Unexpected error: ${error.message}${colors.reset}`);
  process.exit(1);
});