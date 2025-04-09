/**
 * Shared web crawler types
 */

/**
 * Web crawling request interface
 */
export interface WebCrawlingRequest {
  url: string;
  options?: {
    /**
     * Capture a screenshot of the website (default: true)
     */
    captureScreenshot?: boolean;
    
    /**
     * Maximum number of colors to extract (default: 100)
     */
    maxColors?: number;
    
    /**
     * Maximum time to wait for page load in milliseconds (default: 30000)
     */
    timeout?: number;
  };
}

/**
 * Color format information
 */
export interface CSSColorFormat {
  /**
   * The original color string as found in CSS
   */
  original: string;
  
  /**
   * The normalized color string (standardized format)
   */
  normalized: string;
  
  /**
   * The format of the color
   */
  format: 'hex' | 'rgb' | 'rgba' | 'hsl' | 'hsla';
}

/**
 * Web crawling result interface
 */
export interface WebCrawlingResult {
  /**
   * The URL that was crawled
   */
  url: string;
  
  /**
   * The title of the webpage
   */
  title: string;
  
  /**
   * Base64 encoded screenshot (data URL format)
   */
  screenshot?: string;
  
  /**
   * Meta description of the webpage
   */
  description: string;
  
  /**
   * Meta keywords of the webpage
   */
  keywords: string;
  
  /**
   * All colors extracted from the webpage
   */
  colors: CSSColorFormat[];
  
  /**
   * Selected color palette based on the extracted colors
   */
  palette: string[];
  
  /**
   * Timestamp of when the crawling was performed
   */
  timestamp: string;
}