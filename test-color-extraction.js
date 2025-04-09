/**
 * Test script to extract colors from a website using our web crawler service
 */
import puppeteer from 'puppeteer';
import * as cheerio from 'cheerio';
import fs from 'fs';

// Functions from our web crawler service
const isValidUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch (e) {
    return false;
  }
};

// Extract colors from CSS 
const extractColorsFromCSS = async (page) => {
  return await page.evaluate(() => {
    const colors = [];
    const colorRegex = {
      hex: /#([0-9a-f]{3}|[0-9a-f]{6})\b/gi,
      rgb: /rgb\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)/gi,
      rgba: /rgba\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*([01]?\.?\d*)\s*\)/gi,
      hsl: /hsl\(\s*(\d{1,3})\s*,\s*(\d{1,3})%\s*,\s*(\d{1,3})%\s*\)/gi,
      hsla: /hsla\(\s*(\d{1,3})\s*,\s*(\d{1,3})%\s*,\s*(\d{1,3})%\s*,\s*([01]?\.?\d*)\s*\)/gi
    };

    // Extract colors from stylesheets
    const styleSheets = Array.from(document.styleSheets);
    styleSheets.forEach(sheet => {
      try {
        const rules = sheet.cssRules || sheet.rules;
        if (!rules) return;
        
        Array.from(rules).forEach(rule => {
          try {
            const css = rule.cssText;
            if (!css) return;
            
            // Extract hex colors
            const hexMatches = css.match(colorRegex.hex);
            if (hexMatches) {
              hexMatches.forEach(color => {
                colors.push({
                  original: color,
                  normalized: color.toLowerCase(),
                  format: 'hex'
                });
              });
            }
            
            // Extract rgb colors
            const rgbMatches = css.match(colorRegex.rgb);
            if (rgbMatches) {
              rgbMatches.forEach(color => {
                colors.push({
                  original: color,
                  normalized: color,
                  format: 'rgb'
                });
              });
            }
            
            // Extract rgba colors
            const rgbaMatches = css.match(colorRegex.rgba);
            if (rgbaMatches) {
              rgbaMatches.forEach(color => {
                colors.push({
                  original: color,
                  normalized: color,
                  format: 'rgba'
                });
              });
            }
            
            // Extract hsl colors
            const hslMatches = css.match(colorRegex.hsl);
            if (hslMatches) {
              hslMatches.forEach(color => {
                colors.push({
                  original: color,
                  normalized: color,
                  format: 'hsl'
                });
              });
            }
            
            // Extract hsla colors
            const hslaMatches = css.match(colorRegex.hsla);
            if (hslaMatches) {
              hslaMatches.forEach(color => {
                colors.push({
                  original: color,
                  normalized: color,
                  format: 'hsla'
                });
              });
            }
          } catch (error) {
            // Skip inaccessible rules
          }
        });
      } catch (error) {
        // Skip inaccessible stylesheets (CORS)
      }
    });

    // Extract colors from inline styles
    document.querySelectorAll('[style]').forEach(el => {
      const style = el.getAttribute('style');
      if (!style) return;
      
      // Check for hex colors
      const hexMatches = style.match(colorRegex.hex);
      if (hexMatches) {
        hexMatches.forEach(color => {
          colors.push({
            original: color,
            normalized: color.toLowerCase(),
            format: 'hex'
          });
        });
      }
      
      // Extract other color formats similarly...
    });

    // Extract colors from color property values
    document.querySelectorAll('*').forEach(el => {
      const computedStyle = window.getComputedStyle(el);
      const colorProps = ['color', 'background-color', 'border-color', 'border-top-color', 
                         'border-right-color', 'border-bottom-color', 'border-left-color'];
      
      colorProps.forEach(prop => {
        const value = computedStyle.getPropertyValue(prop);
        if (value && value !== 'transparent' && value !== 'rgba(0, 0, 0, 0)') {
          // Normalize to rgb/rgba format
          colors.push({
            original: value,
            normalized: value,
            format: value.startsWith('rgb(') ? 'rgb' : 
                  value.startsWith('rgba(') ? 'rgba' : 
                  value.startsWith('hsl(') ? 'hsl' : 
                  value.startsWith('hsla(') ? 'hsla' : 'hex'
          });
        }
      });
    });

    // Remove duplicates
    const uniqueColors = [];
    const seen = new Set();
    
    colors.forEach(color => {
      if (!seen.has(color.normalized)) {
        seen.add(color.normalized);
        uniqueColors.push(color);
      }
    });
    
    return uniqueColors;
  });
};

// Process colors to create a palette
const processColors = (colors) => {
  // For simplicity, just return the normalized colors
  return colors.map(color => color.normalized);
};

// Main extraction function
const extractColorsFromWebsite = async (url) => {
  console.log(`Starting color extraction from: ${url}`);
  
  if (!isValidUrl(url)) {
    throw new Error('Invalid URL format');
  }
  
  try {
    // Launch headless browser with system Chrome
    const browser = await puppeteer.launch({
      headless: true,
      executablePath: '/nix/store/zi4f80l169xlmivz8vja8wlphq74qqk0-chromium-125.0.6422.141/bin/chromium',
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
    });
    
    // Create a new page
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });
    
    // Navigate to URL
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
    
    // Get page title
    const title = await page.title();
    
    // Extract CSS and extract colors
    const cssColors = await extractColorsFromCSS(page);
    
    // Take a screenshot
    const screenshot = await page.screenshot({ encoding: 'base64', type: 'jpeg', quality: 80 });
    
    // Get the HTML content for further parsing
    const html = await page.content();
    const $ = cheerio.load(html);
    
    // Extract meta information
    const description = $('meta[name="description"]').attr('content') || '';
    const keywords = $('meta[name="keywords"]').attr('content') || '';
    
    // Extract Swift code examples with UIColor references
    const swiftColors = [];
    $('pre, code').each((i, el) => {
      const codeText = $(el).text();
      const uiColorMatches = codeText.match(/UIColor\.[a-zA-Z]+|UIColor\([^)]+\)|\.system[A-Z][a-zA-Z]+/g);
      if (uiColorMatches) {
        swiftColors.push(...uiColorMatches);
      }
    });
    
    // Close browser
    await browser.close();
    
    // Process the extracted colors to create a palette
    const processedPalette = processColors(cssColors);
    
    // Add Swift colors to the output
    const result = {
      url,
      title,
      screenshot: `data:image/jpeg;base64,${screenshot}`,
      description,
      keywords,
      colors: cssColors,
      palette: processedPalette,
      swiftColors: swiftColors, // Added Swift color references
      timestamp: new Date().toISOString()
    };
    
    console.log('Extracted colors:', result.colors.length);
    console.log('Swift color references:', result.swiftColors.length);
    
    return result;
  } catch (error) {
    console.error('Error extracting colors:', error);
    throw error;
  }
};

// Run the extraction
const url = 'https://developer.apple.com/documentation/uikit/color-creation';
extractColorsFromWebsite(url)
  .then(result => {
    console.log('Color extraction complete!');
    console.log('Title:', result.title);
    console.log('Description:', result.description);
    console.log('Number of colors found:', result.colors.length);
    console.log('Color palette (first 20 colors):'); 
    result.palette.slice(0, 20).forEach((color, index) => console.log(`${index + 1}. ${color}`));
    
    // Save the color data to a file
    // Save the full results to a JSON file
    fs.writeFileSync('apple-colors.json', JSON.stringify(result, null, 2));
    console.log('\nSaved full color data to apple-colors.json');
    
    // Save just the color palette to a text file for easy reference
    const colorListText = result.palette.map((color, index) => `${index + 1}. ${color}`).join('\n');
    fs.writeFileSync('apple-color-palette.txt', colorListText);
    console.log('Saved color palette to apple-color-palette.txt');
    
    if (result.swiftColors.length > 0) {
      console.log('\nSwift color references:');
      result.swiftColors.forEach(color => console.log(' -', color));
    }
  })
  .catch(error => {
    console.error('Failed to extract colors:', error);
  });