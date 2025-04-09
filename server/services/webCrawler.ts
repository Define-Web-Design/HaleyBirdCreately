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
      args: ['--no-sandbox', '--disable-setuid-sandbox']
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
    
    // Close browser
    await browser.close();
    
    // Process the extracted colors to create a palette
    const processedPalette = processColors(cssColors);
    
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
 * Extract colors from CSS of a webpage
 */
async function extractColorsFromCSS(page: any): Promise<CSSColorFormat[]> {
  return await page.evaluate(() => {
    const colors: CSSColorFormat[] = [];
    const colorMap = new Map<string, CSSColorFormat>();
    
    // Helper function to parse colors
    const parseColor = (color: string): CSSColorFormat | null => {
      // Normalize the color format
      color = color.toLowerCase().trim();
      
      // Skip if color is already processed
      if (colorMap.has(color)) return null;
      
      let format: 'hex' | 'rgb' | 'rgba' | 'hsl' | 'hsla' = 'hex';
      let normalized = color;
      
      // Determine color format and normalize
      if (color.startsWith('#')) {
        format = 'hex';
        // Ensure hex colors are 6 digits
        if (color.length === 4) {
          const r = color[1];
          const g = color[2];
          const b = color[3];
          normalized = `#${r}${r}${g}${g}${b}${b}`;
        }
      } else if (color.startsWith('rgb(')) {
        format = 'rgb';
      } else if (color.startsWith('rgba(')) {
        format = 'rgba';
      } else if (color.startsWith('hsl(')) {
        format = 'hsl';
      } else if (color.startsWith('hsla(')) {
        format = 'hsla';
      } else {
        // Not a recognized color format
        return null;
      }
      
      const colorObj: CSSColorFormat = {
        original: color,
        normalized,
        format
      };
      
      colorMap.set(color, colorObj);
      return colorObj;
    };
    
    // Function to extract colors from computed styles
    const extractColorsFromElement = (element: Element) => {
      const computedStyle = window.getComputedStyle(element);
      
      // Check background color
      const backgroundColor = computedStyle.backgroundColor;
      if (backgroundColor && backgroundColor !== 'rgba(0, 0, 0, 0)' && backgroundColor !== 'transparent') {
        const colorObj = parseColor(backgroundColor);
        if (colorObj) colors.push(colorObj);
      }
      
      // Check text color
      const color = computedStyle.color;
      if (color) {
        const colorObj = parseColor(color);
        if (colorObj) colors.push(colorObj);
      }
      
      // Check border color
      const borderColor = computedStyle.borderColor;
      if (borderColor && borderColor !== 'rgba(0, 0, 0, 0)' && borderColor !== 'transparent') {
        const colorObj = parseColor(borderColor);
        if (colorObj) colors.push(colorObj);
      }
    };
    
    // Traverse all elements in the DOM
    const elements = document.querySelectorAll('*');
    elements.forEach(extractColorsFromElement);
    
    return Array.from(colorMap.values());
  });
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