/**
 * Performance Monitoring Routes
 * 
 * This module provides API endpoints for collecting and analyzing 
 * application performance metrics from both client and server.
 */

import express, { Request, Response } from 'express';
import { logger } from '../utils/logger';
import fs from 'fs';
import path from 'path';
import { getMetrics, resetMetrics } from '../middleware/performance';

// Create router
const router = express.Router();

// In-memory storage for recent client metrics
// For production, consider using a database or time-series DB
const clientMetrics: any[] = [];
const MAX_CLIENT_METRICS = 10000; // Cap to prevent memory issues

/**
 * GET /api/performance/status
 * Get overall performance status and summary
 */
router.get('/status', (req: Request, res: Response) => {
  try {
    // Get server metrics
    const serverMetrics = getMetrics();
    
    // Summarize client metrics
    const clientSummary = summarizeClientMetrics();
    
    // Combine into a summary
    const summary = {
      timestamp: new Date().toISOString(),
      server: {
        ...serverMetrics,
        memoryUsage: process.memoryUsage(),
        uptime: process.uptime()
      },
      client: clientSummary,
      status: determineOverallStatus(serverMetrics, clientSummary)
    };
    
    res.json(summary);
  } catch (error) {
    logger.error('Error getting performance status', { 
      error: error instanceof Error ? error.message : String(error)
    });
    res.status(500).json({ error: 'Failed to get performance status' });
  }
});

/**
 * GET /api/performance/server
 * Get detailed server-side metrics
 */
router.get('/server', (req: Request, res: Response) => {
  try {
    const metrics = getMetrics();
    res.json(metrics);
  } catch (error) {
    logger.error('Error getting server metrics', { 
      error: error instanceof Error ? error.message : String(error)
    });
    res.status(500).json({ error: 'Failed to get server metrics' });
  }
});

/**
 * GET /api/performance/client
 * Get recent client-side metrics
 */
router.get('/client', (req: Request, res: Response) => {
  try {
    // Get query parameters for filtering
    const limit = parseInt(req.query.limit as string) || 100;
    const page = parseInt(req.query.page as string) || 1;
    const metricType = req.query.type as string;
    
    // Filter and paginate metrics
    let filteredMetrics = [...clientMetrics];
    
    if (metricType) {
      filteredMetrics = filteredMetrics.filter(m => m.name === metricType);
    }
    
    const startIndex = (page - 1) * limit;
    const paginatedMetrics = filteredMetrics.slice(startIndex, startIndex + limit);
    
    // Return with pagination metadata
    res.json({
      metrics: paginatedMetrics,
      pagination: {
        total: filteredMetrics.length,
        page,
        limit,
        pages: Math.ceil(filteredMetrics.length / limit)
      }
    });
  } catch (error) {
    logger.error('Error getting client metrics', { 
      error: error instanceof Error ? error.message : String(error)
    });
    res.status(500).json({ error: 'Failed to get client metrics' });
  }
});

/**
 * POST /api/performance/metrics
 * Receive client-side metrics from Web Vitals
 */
router.post('/metrics', (req: Request, res: Response) => {
  try {
    const metric = req.body;
    
    // Validate the metric
    if (!metric || !metric.name || typeof metric.value !== 'number') {
      return res.status(400).json({ error: 'Invalid metric format' });
    }
    
    // Add reception timestamp and client IP
    const enhancedMetric = {
      ...metric,
      receivedAt: new Date().toISOString(),
      clientIp: getClientIp(req)
    };
    
    // Store metric
    clientMetrics.unshift(enhancedMetric);
    
    // Cap the metrics array to prevent memory issues
    if (clientMetrics.length > MAX_CLIENT_METRICS) {
      clientMetrics.length = MAX_CLIENT_METRICS;
    }
    
    // Log important metrics
    if (
      metric.name === 'LCP' || 
      metric.name === 'FID' || 
      metric.name === 'CLS' ||
      metric.name === 'JS-Error' ||
      metric.name === 'API-Error'
    ) {
      logger.info(`Client metric: ${metric.name}`, { 
        value: metric.value,
        page: metric.page
      });
    }
    
    // Return success
    res.status(202).json({ success: true });
  } catch (error) {
    logger.error('Error processing client metric', { 
      error: error instanceof Error ? error.message : String(error)
    });
    res.status(500).json({ error: 'Failed to process metric' });
  }
});

/**
 * POST /api/performance/reset
 * Reset performance metrics
 */
router.post('/reset', (req: Request, res: Response) => {
  try {
    // Reset server metrics
    resetMetrics();
    
    // Reset client metrics
    clientMetrics.length = 0;
    
    logger.info('Performance metrics reset');
    res.json({ success: true });
  } catch (error) {
    logger.error('Error resetting metrics', { 
      error: error instanceof Error ? error.message : String(error)
    });
    res.status(500).json({ error: 'Failed to reset metrics' });
  }
});

/**
 * POST /api/performance/benchmark-result
 * Receive benchmark results from the AI benchmark script
 */
router.post('/benchmark-result', (req: Request, res: Response) => {
  try {
    const benchmarkResult = req.body;
    
    // Validate the benchmark result
    if (!benchmarkResult || !benchmarkResult.timestamp) {
      return res.status(400).json({ error: 'Invalid benchmark result format' });
    }
    
    // Ensure the logs directory exists
    const logsDir = path.join(process.cwd(), 'logs');
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true });
    }
    
    // Save the benchmark result to a file
    const timestamp = new Date().toISOString().replace(/:/g, '-');
    const fileName = `benchmark-result-${timestamp}.json`;
    fs.writeFileSync(
      path.join(logsDir, fileName),
      JSON.stringify(benchmarkResult, null, 2)
    );
    
    // Log the benchmark
    logger.info('AI benchmark result received', {
      timestamp: benchmarkResult.timestamp,
      providers: benchmarkResult.config?.providers || [],
      path: path.join(logsDir, fileName)
    });
    
    // Return success
    res.status(201).json({ 
      success: true,
      fileName
    });
  } catch (error) {
    logger.error('Error saving benchmark result', { 
      error: error instanceof Error ? error.message : String(error)
    });
    res.status(500).json({ error: 'Failed to save benchmark result' });
  }
});

/**
 * GET /api/performance/benchmarks
 * Get list of available benchmark files
 */
router.get('/benchmarks', (req: Request, res: Response) => {
  try {
    const logsDir = path.join(process.cwd(), 'logs');
    
    // Check if logs directory exists
    if (!fs.existsSync(logsDir)) {
      return res.json({ benchmarks: [] });
    }
    
    // Get all benchmark files
    const files = fs.readdirSync(logsDir)
      .filter(file => file.startsWith('benchmark-result-') && file.endsWith('.json'))
      .map(file => {
        const filePath = path.join(logsDir, file);
        const stats = fs.statSync(filePath);
        
        // Try to extract basic info from the file
        let info: any = { fileName: file };
        try {
          const content = fs.readFileSync(filePath, 'utf8');
          const data = JSON.parse(content);
          info = {
            ...info,
            timestamp: data.timestamp,
            providers: data.config?.providers || [],
            config: data.config || {}
          };
        } catch (e) {
          // Ignore errors reading benchmark files
        }
        
        return {
          fileName: file,
          path: filePath,
          size: stats.size,
          createdAt: stats.birthtime,
          info
        };
      })
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    
    res.json({ benchmarks: files });
  } catch (error) {
    logger.error('Error listing benchmark files', { 
      error: error instanceof Error ? error.message : String(error)
    });
    res.status(500).json({ error: 'Failed to list benchmark files' });
  }
});

/**
 * GET /api/performance/benchmarks/:fileName
 * Get contents of a specific benchmark file
 */
router.get('/benchmarks/:fileName', (req: Request, res: Response) => {
  try {
    const fileName = req.params.fileName;
    const filePath = path.join(process.cwd(), 'logs', fileName);
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Benchmark file not found' });
    }
    
    // Read and parse the file
    const content = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(content);
    
    res.json(data);
  } catch (error) {
    logger.error('Error reading benchmark file', { 
      error: error instanceof Error ? error.message : String(error),
      fileName: req.params.fileName
    });
    res.status(500).json({ error: 'Failed to read benchmark file' });
  }
});

/**
 * Helper function to get client IP
 */
function getClientIp(req: Request): string {
  return (
    req.headers['x-forwarded-for'] as string || 
    req.socket.remoteAddress || 
    'unknown'
  );
}

/**
 * Summarize client metrics
 */
function summarizeClientMetrics() {
  // Group metrics by name
  const metricsByName: Record<string, any[]> = {};
  
  clientMetrics.forEach(metric => {
    if (!metricsByName[metric.name]) {
      metricsByName[metric.name] = [];
    }
    metricsByName[metric.name].push(metric);
  });
  
  // Calculate averages and percentiles
  const summary: Record<string, any> = {};
  
  Object.entries(metricsByName).forEach(([name, metrics]) => {
    if (metrics.length === 0) return;
    
    // Sort values for percentile calculation
    const values = metrics.map(m => m.value).sort((a, b) => a - b);
    
    // Calculate statistics
    const sum = values.reduce((acc, val) => acc + val, 0);
    const avg = sum / values.length;
    const p50 = values[Math.floor(values.length * 0.5)];
    const p90 = values[Math.floor(values.length * 0.9)];
    const p95 = values[Math.floor(values.length * 0.95)];
    const min = values[0];
    const max = values[values.length - 1];
    
    summary[name] = {
      count: metrics.length,
      avg,
      min,
      max,
      p50,
      p90,
      p95,
      recentValue: metrics[0].value,
      recentTimestamp: metrics[0].timestamp
    };
  });
  
  return summary;
}

/**
 * Determine overall system status from metrics
 */
function determineOverallStatus(serverMetrics: any, clientSummary: any): string {
  // Check server error rate
  const serverErrorRate = serverMetrics.errors?.rate || 0;
  if (serverErrorRate > 0.05) { // More than 5% errors
    return 'critical';
  } else if (serverErrorRate > 0.01) { // More than 1% errors
    return 'warning';
  }
  
  // Check client LCP (Largest Contentful Paint)
  const lcp = clientSummary.LCP?.avg;
  if (lcp && lcp > 4000) { // More than 4 seconds
    return 'warning';
  }
  
  // Check client FID (First Input Delay)
  const fid = clientSummary.FID?.avg;
  if (fid && fid > 300) { // More than 300ms
    return 'warning';
  }
  
  // Check client CLS (Cumulative Layout Shift)
  const cls = clientSummary.CLS?.avg;
  if (cls && cls > 0.25) { // More than 0.25
    return 'warning';
  }
  
  // Check for JS errors
  const jsErrors = clientSummary['JS-Error']?.count || 0;
  if (jsErrors > 10) { // More than 10 JS errors
    return 'warning';
  }
  
  // Check for API errors
  const apiErrors = clientSummary['API-Error']?.count || 0;
  if (apiErrors > 5) { // More than 5 API errors
    return 'warning';
  }
  
  // Everything looks good
  return 'healthy';
}

export default router;