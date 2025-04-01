/**
 * Color blindness utility functions for applying color transformations
 * to accommodate various types of color vision deficiencies.
 */

export type ColorBlindModeType = 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia' | 'achromatopsia';

// CSS filters to simulate different types of color blindness
const COLOR_BLIND_FILTERS: Record<Exclude<ColorBlindModeType, 'none'>, string> = {
  protanopia: 'filter: url("#protanopia-filter");',
  deuteranopia: 'filter: url("#deuteranopia-filter");',
  tritanopia: 'filter: url("#tritanopia-filter");',
  achromatopsia: 'filter: grayscale(100%);',
};

/**
 * Gets the CSS filter for the specified color blind mode
 */
export function getColorBlindFilter(mode: ColorBlindModeType): string {
  if (mode === 'none') return '';
  return COLOR_BLIND_FILTERS[mode];
}

/**
 * Applies the appropriate color blind mode to the document
 */
export function applyColorBlindMode(mode: ColorBlindModeType): void {
  // Reset any existing filters
  document.documentElement.style.cssText = document.documentElement.style.cssText
    .replace(/filter:[^;]+;?/g, '');
  
  // Add the SVG filters to the document if they don't exist
  ensureSvgFiltersExist();
  
  // Apply the new filter if it's not 'none'
  if (mode !== 'none') {
    document.documentElement.style.cssText += getColorBlindFilter(mode);
  }
}

/**
 * Ensures the SVG filters for color blindness simulation exist in the document
 */
function ensureSvgFiltersExist(): void {
  if (!document.getElementById('color-blind-filters')) {
    const svgFilters = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svgFilters.id = 'color-blind-filters';
    svgFilters.style.display = 'none';
    svgFilters.innerHTML = `
      <defs>
        <!-- Protanopia (red-blind) filter -->
        <filter id="protanopia-filter">
          <feColorMatrix
            in="SourceGraphic"
            type="matrix"
            values="0.567, 0.433, 0,     0, 0
                    0.558, 0.442, 0,     0, 0
                    0,     0.242, 0.758, 0, 0
                    0,     0,     0,     1, 0"/>
        </filter>
        
        <!-- Deuteranopia (green-blind) filter -->
        <filter id="deuteranopia-filter">
          <feColorMatrix
            in="SourceGraphic"
            type="matrix"
            values="0.625, 0.375, 0,   0, 0
                    0.7,   0.3,   0,   0, 0
                    0,     0.3,   0.7, 0, 0
                    0,     0,     0,   1, 0"/>
        </filter>
        
        <!-- Tritanopia (blue-blind) filter -->
        <filter id="tritanopia-filter">
          <feColorMatrix
            in="SourceGraphic"
            type="matrix"
            values="0.95, 0.05,  0,     0, 0
                    0,    0.433, 0.567, 0, 0
                    0,    0.475, 0.525, 0, 0
                    0,    0,     0,     1, 0"/>
        </filter>
      </defs>
    `;
    document.body.appendChild(svgFilters);
  }
}

/**
 * Returns a palette of accessible colors for the given color blind mode
 */
export function getAccessiblePalette(mode: ColorBlindModeType): string[] {
  // These colors are chosen to be distinguishable in each color blind mode
  switch (mode) {
    case 'protanopia':
      return ['#0072B2', '#E69F00', '#56B4E9', '#009E73', '#F0E442', '#000000'];
    case 'deuteranopia':
      return ['#0072B2', '#E69F00', '#56B4E9', '#009E73', '#F0E442', '#000000'];
    case 'tritanopia':
      return ['#0072B2', '#E69F00', '#56B4E9', '#009E73', '#CC79A7', '#000000'];
    case 'achromatopsia':
      return ['#000000', '#525252', '#969696', '#D9D9D9', '#FFFFFF'];
    default:
      return []; // Default palette will be used
  }
}