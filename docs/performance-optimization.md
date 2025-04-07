# Performance Optimization Guide

This guide outlines the performance optimization workflow for the Creately application, using Google PageSpeed Insights and other best practices.

## Table of Contents
1. [PageSpeed Insights Integration](#pagespeed-insights-integration)
2. [Key Performance Metrics](#key-performance-metrics)
3. [Common Optimization Techniques](#common-optimization-techniques)
4. [Periodic Performance Testing](#periodic-performance-testing)
5. [Mobile-Specific Optimizations](#mobile-specific-optimizations)

## PageSpeed Insights Integration

We've integrated Google PageSpeed Insights into our development workflow to continuously monitor and improve application performance.

### Using the PageSpeed Script

The `pagespeed-insights.js` script in the `scripts` folder automates performance analysis and provides actionable recommendations.

```bash
# Analyze the deployed application (default: mobile device)
node scripts/pagespeed-insights.js https://your-app-url.replit.app

# Analyze for desktop devices
node scripts/pagespeed-insights.js https://your-app-url.replit.app desktop
```

### Understanding the Results

The script generates two files in the `logs/pagespeed` directory:
- `pagespeed-{device}-{timestamp}.json` - Complete analysis data
- `pagespeed-summary-{device}-{timestamp}.txt` - Human-readable summary

Additionally, it displays a summary of the analysis in the console with:
- Overall performance scores
- Core Web Vitals measurements
- Top optimization opportunities
- Key diagnostics

## Key Performance Metrics

The following metrics are crucial for a good user experience:

### Core Web Vitals
- **Largest Contentful Paint (LCP)**: Measures loading performance. Target: < 2.5 seconds
- **First Input Delay (FID)**: Measures interactivity. Target: < 100 milliseconds
- **Cumulative Layout Shift (CLS)**: Measures visual stability. Target: < 0.1

### Additional Important Metrics
- **First Contentful Paint (FCP)**: First content rendering. Target: < 1.8 seconds
- **Time to Interactive (TTI)**: When the page becomes fully interactive. Target: < 3.8 seconds
- **Total Blocking Time (TBT)**: Sum of time when main thread is blocked. Target: < 200 milliseconds

## Common Optimization Techniques

Based on PageSpeed Insights recommendations, implement these strategies:

### Image Optimization
- Properly size images for their display dimensions
- Use modern formats (WebP, AVIF)
- Implement lazy loading for off-screen images
- Use responsive images with the `srcset` attribute

```jsx
// Example of responsive and lazy-loaded image
<img 
  src="small.jpg"
  srcSet="small.jpg 500w, medium.jpg 1000w, large.jpg 1500w"
  sizes="(max-width: 600px) 500px, (max-width: 1200px) 1000px, 1500px"
  loading="lazy"
  alt="Description"
/>
```

### JavaScript Optimization
- Code-split large bundles
- Defer non-critical JavaScript
- Remove unused code
- Minify and compress resources

### CSS Optimization
- Extract critical CSS for above-the-fold content
- Remove unused CSS
- Minify CSS files

### Font Optimization
- Use `font-display: swap` to prevent font-blocking
- Preload important fonts
- Use variable fonts where appropriate

### Caching Strategy
- Implement appropriate caching headers
- Use service workers for assets caching
- Consider using a CDN for static assets

## Periodic Performance Testing

Make performance testing a regular part of your development workflow:

1. Run PageSpeed analysis after significant changes
2. Maintain a performance budget for key metrics
3. Compare results over time to track improvements
4. Address regressions immediately

## Mobile-Specific Optimizations

Mobile performance is especially important for our application:

### Touch Interactions
- Optimize swipe gestures to not interfere with scrolling
- Ensure buttons and interactive elements have sufficient size (min 44×44px)
- Implement proper touch feedback with minimal delay

### Network Considerations
- Reduce payload size for mobile networks
- Implement progressive loading patterns
- Consider offline capabilities for key features

### Rendering Performance
- Reduce DOM complexity for mobile views
- Optimize animations to use compositor-only properties
- Implement view recycling for long lists

---

By following this performance optimization workflow, we can ensure that Creately provides an excellent user experience on all devices and network conditions.