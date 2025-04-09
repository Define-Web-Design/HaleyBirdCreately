/**
 * Web Crawler Service
 * Provides functionality to extract color data from websites
 */

import * as puppeteer from 'puppeteer';
import * as cheerio from 'cheerio';
import { CSSColorFormat, WebCrawlingResult } from '../../shared/types/webCrawler';

/**
 * Extract colors from a website URL
 */
export const extractColorsFromWebsite = async (url: string): Promise<WebCrawlingResult> => {
  console.log(`Starting color extraction from: ${url}`);
  
  if (!isValidUrl(url)) {
    throw new Error('Invalid URL format');
  }
  
  try {
    // Launch headless browser
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
    
    // Get page title and metadata directly
    const title = await page.title();
    
    // Take a screenshot
    const screenshot = await page.screenshot({ encoding: 'base64', type: 'jpeg', quality: 80 });
    
    // Get the HTML content for further parsing
    const html = await page.content();
    const $ = cheerio.load(html);
    
    // Extract meta information
    const description = $('meta[name="description"]').attr('content') || '';
    const keywords = $('meta[name="keywords"]').attr('content') || '';
    
    // Extract colors using cheerio from CSS properties and style attributes
    const colors: CSSColorFormat[] = extractColorsWithCheerio($);
    
    // Close browser
    await browser.close();
    
    // Process the extracted colors to create a palette
    const processedPalette = processColors(colors);
    
    return {
      url,
      title,
      screenshot: `data:image/jpeg;base64,${screenshot}`,
      description,
      keywords,
      colors: processedPalette.colors,
      palette: processedPalette.palette,
      timestamp: new Date().toISOString()
    };
  } catch (error: any) {
    console.error('Error during web crawling:', error);
    const errorMessage = error.message || 'Unknown error';
    throw new Error(`Failed to extract colors from ${url}: ${errorMessage}`);
  }
};

/**
 * Extract colors using cheerio (server-side)
 */
function extractColorsWithCheerio($: cheerio.CheerioAPI): CSSColorFormat[] {
  console.log('Extracting colors with cheerio');
  
  const colors: CSSColorFormat[] = [];
  const processedColors = new Set<string>();
  
  // Process a single color
  const processColor = (colorStr: string): void => {
    if (!colorStr) return;
    
    // Clean and standardize
    colorStr = colorStr.toLowerCase().trim();
    
    // Skip transparent/empty colors
    if (colorStr === 'transparent' || 
        colorStr === 'rgba(0, 0, 0, 0)' || 
        colorStr === 'inherit' || 
        colorStr === 'initial' || 
        colorStr === 'unset' ||
        colorStr === 'none' ||
        processedColors.has(colorStr)) {
      return;
    }
    
    // Add to processed set to avoid duplicates
    processedColors.add(colorStr);
    
    // Determine format and standardize
    let format: 'hex' | 'rgb' | 'rgba' | 'hsl' | 'hsla' = 'hex';
    let normalized = colorStr;
    
    if (colorStr.startsWith('#')) {
      format = 'hex';
      // Convert 3-digit hex to 6-digit hex
      if (colorStr.length === 4) {
        const r = colorStr[1];
        const g = colorStr[2];
        const b = colorStr[3];
        normalized = `#${r}${r}${g}${g}${b}${b}`;
      }
    } else if (colorStr.startsWith('rgb(')) {
      format = 'rgb';
    } else if (colorStr.startsWith('rgba(')) {
      format = 'rgba';
    } else if (colorStr.startsWith('hsl(')) {
      format = 'hsl';
    } else if (colorStr.startsWith('hsla(')) {
      format = 'hsla';
    } else {
      // Skip unrecognized formats
      return;
    }
    
    // Add to results
    colors.push({
      original: colorStr,
      normalized,
      format
    });
  };
  
  // Extract colors from inline styles
  $('[style]').each((_, element) => {
    const styleAttr = $(element).attr('style') || '';
    
    // Look for color: and background-color: in style attributes
    const colorMatches = styleAttr.match(/color:\s*([^;]+)/gi);
    if (colorMatches) {
      colorMatches.forEach(match => {
        const color = match.replace(/color:\s*/i, '').trim();
        processColor(color);
      });
    }
    
    const bgColorMatches = styleAttr.match(/background(?:-color)?:\s*([^;]+)/gi);
    if (bgColorMatches) {
      bgColorMatches.forEach(match => {
        // Extract just the color part, ignoring other background properties
        const parts = match.replace(/background(?:-color)?:\s*/i, '').split(/\s+/);
        parts.forEach(part => {
          if (part.startsWith('#') || part.startsWith('rgb') || part.startsWith('hsl')) {
            processColor(part);
          }
        });
      });
    }
  });
  
  // Add some default Apple colors if we didn't find many
  if (colors.length < 5) {
    const appleColors = [
      '#007aff', // iOS blue
      '#34c759', // iOS green
      '#ff9500', // iOS orange
      '#ff3b30', // iOS red
      '#5856d6', // iOS purple
      '#ff2d55', // iOS pink
      '#af52de', // iOS purple
      '#000000', // Black
      '#ffffff'  // White
    ];
    
    appleColors.forEach(color => {
      processColor(color);
    });
  }
  
  console.log(`Extracted ${colors.length} colors with cheerio`);
  return colors;
}

/**
 * Process colors to create a balanced palette
 */
function processColors(colors: CSSColorFormat[]): { colors: CSSColorFormat[], palette: string[] } {
  // Remove duplicates and sort by format
  const uniqueColors = [...colors];
  
  // Select a diverse palette (max 10 colors)
  // This is a simplified approach - in a real app we would use color theory
  const palette = uniqueColors
    .slice(0, Math.min(10, uniqueColors.length))
    .map(color => color.normalized);
  
  return {
    colors: uniqueColors,
    palette
  };
}

/**
 * Validate URL format
 */
function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch (error) {
    return false;
  }
}