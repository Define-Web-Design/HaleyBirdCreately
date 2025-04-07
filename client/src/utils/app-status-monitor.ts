
/**
 * Comprehensive app status monitor for Creately
 * Provides detailed analysis of app performance, health, and user experience
 */

// Import necessary modules and utilities
import { verifyPageLinks, runAccessibilityAudit } from './navigation-tester';
import { validateApiEndpoints } from './api-validator';

// Import logger
const logger = console; // Simplified logger for now

// Define interfaces for app status reporting
export interface AppPerformanceMetrics {
  apiResponseTimes: {
    average: number;
    slowest: {
      endpoint: string;
      time: number;
    };
  };
  pageLoadTimes: {
    average: number;
    slowest: {
      page: string;
      time: number;
    };
  };
  errors: {
    critical: {
      count: number;
      messages: string[];
    };
    warnings: {
      count: number;
      messages: string[];
    };
  };
  memory: {
    usage: number;
    leaks: string[];
  };
}

export interface AppStatusReport {
  timestamp: string;
  overview: {
    status: 'online' | 'degraded' | 'offline';
    statusMessage: string;
    userImpact: string;
  };
  services: {
    frontend: { status: 'online' | 'degraded' | 'offline', issues: string[] };
    backend: { status: 'online' | 'degraded' | 'offline', issues: string[] };
    database: { status: 'online' | 'degraded' | 'offline', issues: string[] };
  };
  performance: AppPerformanceMetrics;
  userExperience: {
    accessibilityScore: number;
    responsiveDesignScore: number;
    brokenLinks: number;
    userFeedback: {
      sentiment: 'positive' | 'neutral' | 'negative';
      recentComments: string[];
    };
  };
  recommendations: {
    critical: string[];
    improvements: string[];
    optimizations: string[];
  };
}

/**
 * Mock security monitor for testing
 */
const securityMonitor = {
  validateAssetIntegrity: async () => {
    return { valid: true, issues: [] };
  }
};

/**
 * Collect performance metrics from the application
 */
async function collectPerformanceMetrics(): Promise<AppPerformanceMetrics> {
  try {
    logger.log('Collecting performance metrics...');
    
    // Validate API endpoints to check response times
    const apiValidation = await validateApiEndpoints();
    
    // Calculate average API response time
    const apiResponseTimes = apiValidation.results
      .filter(result => result.valid)
      .map(result => result.responseTime);
    
    const averageApiResponseTime = apiResponseTimes.length > 0
      ? apiResponseTimes.reduce((sum, time) => sum + time, 0) / apiResponseTimes.length
      : 0;
    
    // Find slowest API endpoint
    const slowestApiEndpoint = apiValidation.results
      .filter(result => result.valid)
      .sort((a, b) => b.responseTime - a.responseTime)[0] || { endpoint: 'unknown', responseTime: 0 };
    
    // Get memory usage
    const memoryUsage = typeof performance !== 'undefined' && 
                       performance.memory ? 
                       performance.memory.usedJSHeapSize : 0;
    
    // Collect error information
    const criticalErrors = apiValidation.results
      .filter(result => !result.valid)
      .map(result => `${result.method} ${result.endpoint}: ${result.error}`);
    
    // Warnings are typically network latency or other non-critical issues
    const warnings = apiValidation.results
      .filter(result => result.valid && result.responseTime > 500)
      .map(result => `Slow response from ${result.method} ${result.endpoint}: ${result.responseTime}ms`);
    
    return {
      apiResponseTimes: {
        average: averageApiResponseTime,
        slowest: {
          endpoint: slowestApiEndpoint.endpoint,
          time: slowestApiEndpoint.responseTime
        }
      },
      pageLoadTimes: {
        average: window.performance ? 
                window.performance.timing.loadEventEnd - window.performance.timing.navigationStart : 0,
        slowest: {
          page: window.location.pathname,
          time: window.performance ? 
                window.performance.timing.loadEventEnd - window.performance.timing.navigationStart : 0
        }
      },
      errors: {
        critical: {
          count: criticalErrors.length,
          messages: criticalErrors
        },
        warnings: {
          count: warnings.length,
          messages: warnings
        }
      },
      memory: {
        usage: memoryUsage,
        leaks: [] // Would require more sophisticated detection
      }
    };
  } catch (error) {
    logger.error('Error collecting performance metrics:', error);
    
    // Return default metrics in case of error
    return {
      apiResponseTimes: { average: 0, slowest: { endpoint: 'unknown', time: 0 } },
      pageLoadTimes: { average: 0, slowest: { page: 'unknown', time: 0 } },
      errors: { 
        critical: { count: 1, messages: ['Error collecting performance metrics'] },
        warnings: { count: 0, messages: [] }
      },
      memory: { usage: 0, leaks: [] }
    };
  }
}

/**
 * Generate a comprehensive status report for the application
 */
export async function generateAppStatusReport(): Promise<AppStatusReport> {
  try {
    logger.log('Generating comprehensive app status report...');
    
    // Run simultaneous validations
    const [
      securityResults,
      accessibilityResults,
      navigationResults,
      performanceMetrics
    ] = await Promise.all([
      securityMonitor.validateAssetIntegrity(),
      runAccessibilityAudit(''),
      verifyPageLinks(''),
      collectPerformanceMetrics()
    ]);
    
    // Determine overall status
    let overallStatus: 'online' | 'degraded' | 'offline' = 'online';
    let statusMessage = 'All systems operational';
    
    if (performanceMetrics.errors.warnings.count > 0) {
      overallStatus = 'degraded';
      statusMessage = 'System experiencing minor issues';
    }
    
    if (performanceMetrics.errors.critical.count > 0) {
      overallStatus = 'degraded';
      statusMessage = 'System experiencing significant issues';
    }
    
    if (performanceMetrics.errors.critical.count > 5) {
      overallStatus = 'offline';
      statusMessage = 'Major system outage';
    }
    
    // Count broken links
    const brokenLinks = (navigationResults.details?.failed?.length || 0);
    
    // Calculate responsive design score (mocked for now)
    const responsiveDesignScore = 85;
    
    // Generate recommendations
    const criticalRecommendations = [];
    const improvementRecommendations = [];
    const optimizationRecommendations = [];
    
    // Critical recommendations based on findings
    if (performanceMetrics.errors.critical.count > 0) {
      criticalRecommendations.push('Fix critical API errors to restore full functionality');
    }
    
    if (brokenLinks > 0) {
      criticalRecommendations.push(`Fix ${brokenLinks} broken navigation links`);
    }
    
    if ((accessibilityResults.score || 0) < 70) {
      criticalRecommendations.push('Address accessibility issues to improve user experience');
    }
    
    // Improvement recommendations
    if (performanceMetrics.apiResponseTimes.average > 300) {
      improvementRecommendations.push('Optimize API response times to improve user experience');
    }
    
    if (responsiveDesignScore < 90) {
      improvementRecommendations.push('Enhance responsive design for better mobile experience');
    }
    
    // Optimization recommendations
    if (performanceMetrics.pageLoadTimes.average > 2000) {
      optimizationRecommendations.push('Improve page load times through code splitting and lazy loading');
    }
    
    optimizationRecommendations.push('Consider implementing a service worker for offline capabilities');
    
    // Determine user impact
    let userImpact = 'Users are experiencing a smooth and responsive application';
    
    if (overallStatus === 'degraded') {
      userImpact = 'Users may experience minor delays or visual inconsistencies';
    }
    
    if (overallStatus === 'offline') {
      userImpact = 'Users are unable to access core functionality of the application';
    }
    
    // Build the complete report
    const report: AppStatusReport = {
      timestamp: new Date().toISOString(),
      overview: {
        status: overallStatus,
        statusMessage,
        userImpact
      },
      services: {
        frontend: {
          status: brokenLinks > 5 ? 'degraded' : 'online',
          issues: navigationResults.success ? [] : ['Navigation issues detected'] 
        },
        backend: {
          status: performanceMetrics.errors.critical.count > 0 ? 'degraded' : 'online',
          issues: performanceMetrics.errors.critical.messages
        },
        database: {
          status: 'online', // Mocked for now
          issues: []
        }
      },
      performance: performanceMetrics,
      userExperience: {
        accessibilityScore: accessibilityResults.score || 0,
        responsiveDesignScore,
        brokenLinks,
        userFeedback: {
          sentiment: 'neutral', // Mocked for now
          recentComments: [] // Would be populated from user feedback system
        }
      },
      recommendations: {
        critical: criticalRecommendations,
        improvements: improvementRecommendations,
        optimizations: optimizationRecommendations
      }
    };
    
    logger.log('App status report generated successfully');
    return report;
  } catch (error) {
    logger.error('Error generating app status report:', error);
    
    // Return a basic report indicating the error
    return {
      timestamp: new Date().toISOString(),
      overview: {
        status: 'degraded',
        statusMessage: 'Error generating status report',
        userImpact: 'Status monitoring system is experiencing issues'
      },
      services: {
        frontend: { status: 'unknown', issues: ['Unable to determine status'] },
        backend: { status: 'unknown', issues: ['Unable to determine status'] },
        database: { status: 'unknown', issues: ['Unable to determine status'] }
      },
      performance: {
        apiResponseTimes: { average: 0, slowest: { endpoint: 'unknown', time: 0 } },
        pageLoadTimes: { average: 0, slowest: { page: 'unknown', time: 0 } },
        errors: { 
          critical: { count: 1, messages: ['Error generating status report'] },
          warnings: { count: 0, messages: [] }
        },
        memory: { usage: 0, leaks: [] }
      },
      userExperience: {
        accessibilityScore: 0,
        responsiveDesignScore: 0,
        brokenLinks: 0,
        userFeedback: {
          sentiment: 'neutral',
          recentComments: []
        }
      },
      recommendations: {
        critical: ['Fix status monitoring system'],
        improvements: [],
        optimizations: []
      }
    };
  }
}

/**
 * Display a comprehensive app status report in a user-friendly format
 */
export function displayAppStatusReport(report: AppStatusReport): void {
  const getStatusEmoji = (status: string): string => {
    switch (status) {
      case 'online': return '✅';
      case 'degraded': return '⚠️';
      case 'offline': return '❌';
      default: return '❓';
    }
  };
  
  console.log('\n=========================================');
  console.log(`🔍 CREATELY APP STATUS REPORT`);
  console.log(`📅 ${new Date(report.timestamp).toLocaleString()}`);
  console.log('=========================================');
  
  console.log(`\n💻 SYSTEM OVERVIEW`);
  console.log(`Status: ${getStatusEmoji(report.overview.status)} ${report.overview.status.toUpperCase()}`);
  console.log(`Message: ${report.overview.statusMessage}`);
  console.log(`User Impact: ${report.overview.userImpact}`);
  
  console.log(`\n🔧 SERVICES`);
  console.log(`Frontend: ${getStatusEmoji(report.services.frontend.status)} ${report.services.frontend.status}`);
  if (report.services.frontend.issues.length > 0) {
    console.log('  Issues:');
    report.services.frontend.issues.forEach(issue => console.log(`  - ${issue}`));
  }
  
  console.log(`Backend: ${getStatusEmoji(report.services.backend.status)} ${report.services.backend.status}`);
  if (report.services.backend.issues.length > 0) {
    console.log('  Issues:');
    report.services.backend.issues.forEach(issue => console.log(`  - ${issue}`));
  }
  
  console.log(`Database: ${getStatusEmoji(report.services.database.status)} ${report.services.database.status}`);
  if (report.services.database.issues.length > 0) {
    console.log('  Issues:');
    report.services.database.issues.forEach(issue => console.log(`  - ${issue}`));
  }
  
  console.log(`\n⚡ PERFORMANCE METRICS`);
  console.log(`API Response Time (avg): ${report.performance.apiResponseTimes.average.toFixed(2)}ms`);
  console.log(`Slowest API: ${report.performance.apiResponseTimes.slowest.endpoint} (${report.performance.apiResponseTimes.slowest.time}ms)`);
  console.log(`Page Load Time (avg): ${report.performance.pageLoadTimes.average.toFixed(2)}ms`);
  console.log(`Memory Usage: ${(report.performance.memory.usage / (1024 * 1024)).toFixed(2)} MB`);
  
  console.log(`\n⚠️ ERRORS`);
  console.log(`Critical: ${report.performance.errors.critical.count}`);
  report.performance.errors.critical.messages.forEach(message => console.log(`  - ${message}`));
  console.log(`Warnings: ${report.performance.errors.warnings.count}`);
  report.performance.errors.warnings.messages.forEach(message => console.log(`  - ${message}`));
  
  console.log(`\n👥 USER EXPERIENCE`);
  console.log(`Accessibility Score: ${report.userExperience.accessibilityScore}/100`);
  console.log(`Responsive Design Score: ${report.userExperience.responsiveDesignScore}/100`);
  console.log(`Broken Links: ${report.userExperience.brokenLinks}`);
  console.log(`User Sentiment: ${report.userExperience.userFeedback.sentiment}`);
  
  console.log(`\n🔍 RECOMMENDATIONS`);
  if (report.recommendations.critical.length > 0) {
    console.log('Critical:');
    report.recommendations.critical.forEach(rec => console.log(`  - ${rec}`));
  }
  
  if (report.recommendations.improvements.length > 0) {
    console.log('Improvements:');
    report.recommendations.improvements.forEach(rec => console.log(`  - ${rec}`));
  }
  
  if (report.recommendations.optimizations.length > 0) {
    console.log('Optimizations:');
    report.recommendations.optimizations.forEach(rec => console.log(`  - ${rec}`));
  }
  
  console.log('\n=========================================');
}

/**
 * Create a concise summary of the app status for quick reference
 */
export function createStatusSummary(report: AppStatusReport): string {
  const getStatusEmoji = (status: string): string => {
    switch (status) {
      case 'online': return '✅';
      case 'degraded': return '⚠️';
      case 'offline': return '❌';
      default: return '❓';
    }
  };
  
  const criticalCount = report.performance.errors.critical.count;
  const warningCount = report.performance.errors.warnings.count;
  const brokenLinks = report.userExperience.brokenLinks;
  const a11yScore = report.userExperience.accessibilityScore;
  
  return `
CREATELY STATUS SUMMARY (${new Date(report.timestamp).toLocaleString()})
${getStatusEmoji(report.overview.status)} Overall: ${report.overview.status.toUpperCase()} - ${report.overview.statusMessage}
${getStatusEmoji(report.services.frontend.status)} Frontend | ${getStatusEmoji(report.services.backend.status)} Backend | ${getStatusEmoji(report.services.database.status)} Database
${criticalCount > 0 ? '❌' : '✅'} Critical Errors: ${criticalCount} | ${warningCount > 0 ? '⚠️' : '✅'} Warnings: ${warningCount}
${brokenLinks > 0 ? '⚠️' : '✅'} Broken Links: ${brokenLinks} | ${a11yScore < 70 ? '⚠️' : '✅'} A11y Score: ${a11yScore}/100
`;
}
