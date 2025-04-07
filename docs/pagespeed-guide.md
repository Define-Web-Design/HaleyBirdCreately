# Google PageSpeed Insights Integration Guide

This guide explains how to use our integrated PageSpeed Insights tools to optimize Creately's performance.

## Overview

Creately now includes built-in integration with Google PageSpeed Insights, which helps identify performance bottlenecks and provides recommendations for improving user experience. This integration is especially valuable for ensuring mobile optimization while maintaining desktop adaptability.

## Prerequisites

To use the PageSpeed Insights integration, you need:

1. A Google PageSpeed Insights API key (stored in `.env` as `PAGESPEED_INSIGHTS_API_KEY`)
2. Node.js (already included in the Creately development environment)
3. A deployed application URL to analyze

## Getting Started

### Running PageSpeed Analysis

We've created two easy ways to run performance analysis:

#### 1. Using the Bash Script (Recommended)

For a streamlined experience, use our bash script:

```bash
# Analyze for mobile (default)
./scripts/pagespeed.sh https://your-app-url.replit.app

# Analyze for desktop
./scripts/pagespeed.sh -d https://your-app-url.replit.app

# Show help
./scripts/pagespeed.sh -h
```

#### 2. Using Node.js Directly

You can also run the Node.js script directly:

```bash
# Basic usage
node scripts/pagespeed-insights.js https://your-app-url.replit.app

# Specify device (mobile or desktop)
node scripts/pagespeed-insights.js https://your-app-url.replit.app desktop
```

### Understanding Analysis Results

The analysis generates two types of output:

1. **Console output** - A human-readable summary of key metrics and recommendations
2. **Log files** (saved in `logs/pagespeed/`):
   - `pagespeed-{device}-{hostname}-{timestamp}.json` - Complete analysis data in JSON format
   - `pagespeed-summary-{device}-{timestamp}.txt` - Human-readable summary in text format

## Key Performance Metrics

When optimizing Creately, focus on these critical metrics:

### Core Web Vitals

| Metric | Description | Target |
|--------|-------------|--------|
| **Largest Contentful Paint (LCP)** | Time to render the largest content element | < 2.5 seconds |
| **First Input Delay (FID)** | Time from first user interaction to response | < 100 milliseconds |
| **Cumulative Layout Shift (CLS)** | Visual stability measure | < 0.1 |

### Additional Important Metrics

| Metric | Description | Target |
|--------|-------------|--------|
| **First Contentful Paint (FCP)** | Time until first content is rendered | < 1.8 seconds |
| **Time to Interactive (TTI)** | Time until page becomes fully interactive | < 3.8 seconds |
| **Total Blocking Time (TBT)** | Total time main thread is blocked | < 200 milliseconds |

## Mobile Optimization Focus Areas

Since Creately prioritizes mobile optimization while remaining desktop-adaptable, pay special attention to:

### Touch Interactions

- Ensure swipe gestures don't interfere with native scrolling
- Maintain sufficient button size (minimum 44×44px) for touch targets 
- Implement responsive touch feedback with minimal delay
- Optimize the innovative finger trail effects for performance

### Visual Elements

- Ensure text remains readable with sufficient contrast ratios
- Compress and optimize images for faster loading on mobile connections
- Test animations and transitions for smoothness on mobile processors
- Consider reduced motion options for accessibility

### Responsive Layout

- Verify the condensed headers and footers display correctly on various screen sizes
- Ensure sidebar navigation appears and functions correctly across devices
- Test color palette features on both high and low-resolution displays

## Common Optimization Techniques

Based on PageSpeed Insights recommendations, implement these strategies:

### Image Optimization

- Use modern formats (WebP, AVIF)
- Properly size images for their display dimensions
- Implement lazy loading for off-screen images
- Use responsive images with the `srcset` attribute

### JavaScript Optimization

- Code-split large bundles
- Defer non-critical JavaScript
- Optimize event handlers, especially for touch interactions
- Remove unused code

### CSS Optimization

- Extract critical CSS for above-the-fold content
- Optimize animations with hardware acceleration
- Minimize render-blocking CSS
- Use CSS containment to improve rendering performance

## Integration with Development Workflow

Make performance testing a regular part of the development cycle:

1. Run PageSpeed analysis after implementing new features
2. Analyze both mobile and desktop experiences
3. Focus improvements on Core Web Vitals first
4. Address the highest-impact opportunities identified in the analysis
5. Re-test after implementing optimizations to measure improvements

## Security Considerations

The PageSpeed Insights API key is stored securely in environment variables. Never expose this key in client-side code or public repositories.

## Further Resources

- [Google PageSpeed Insights Documentation](https://developers.google.com/speed/docs/insights/v5/get-started)
- [Web Vitals](https://web.dev/vitals/)
- [Mobile-Friendly Test](https://search.google.com/test/mobile-friendly)