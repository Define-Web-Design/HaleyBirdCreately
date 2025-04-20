
/**
 * Environment Scaling Controller
 * 
 * This module provides intelligent environment scaling based on 
 * real-time metrics and configurable thresholds.
 */

import { getConfig, config } from '../../config/globalConfig';
import { Logger } from '../utils/logger';
import { getPerformanceMetrics } from '../middleware/performance';
import fs from 'fs';
import path from 'path';
import { ServiceRegistry } from '../services/registry';

// Scaling configuration
export interface ScalingConfig {
  enabled: boolean;
  checkIntervalMs: number;
  autoScale: boolean;
  metrics: {
    cpu: {
      threshold: number;
      cooldownMinutes: number;
    };
    memory: {
      threshold: number;
      cooldownMinutes: number;
    };
    responseTime: {
      threshold: number;
      cooldownMinutes: number;
    };
  };
  actions: {
    memory: {
      initialMB: number;
      incrementMB: number;
      maxMB: number;
    };
  };
}

// Scaling action
interface ScalingAction {
  type: 'memory' | 'cpu' | 'responseTime';
  action: 'increase' | 'decrease' | 'restart';
  value?: number;
  reason: string;
  timestamp: Date;
}

// Default scaling configuration
const DEFAULT_SCALING_CONFIG: ScalingConfig = {
  enabled: true,
  checkIntervalMs: 60000, // 1 minute
  autoScale: true,
  metrics: {
    cpu: {
      threshold: 0.8,
      cooldownMinutes: 10
    },
    memory: {
      threshold: 0.8,
      cooldownMinutes: 15
    },
    responseTime: {
      threshold: 300, // milliseconds
      cooldownMinutes: 5
    }
  },
  actions: {
    memory: {
      initialMB: 512,
      incrementMB: 256,
      maxMB: 2048
    }
  }
};

/**
 * Environment Scaling Controller
 */
export class EnvironmentController {
  private static instance: EnvironmentController;
  private logger: Logger;
  private config: ScalingConfig;
  private scalingHistory: ScalingAction[] = [];
  private checkInterval: NodeJS.Timeout | null = null;
  
  private constructor() {
    this.logger = new Logger('EnvironmentController');
    this.config = DEFAULT_SCALING_CONFIG;
    
    // Register in service registry
    const registry = ServiceRegistry.getInstance();
    registry.registerService('scaling:controller', this);
    
    // Initialize scaling configuration
    this.initializeConfig();
    
    this.logger.info('Environment controller initialized');
  }
  
  /**
   * Get singleton instance
   */
  public static getInstance(): EnvironmentController {
    if (!EnvironmentController.instance) {
      EnvironmentController.instance = new EnvironmentController();
    }
    return EnvironmentController.instance;
  }
  
  /**
   * Initialize scaling configuration
   */
  private initializeConfig(): void {
    // Check if there's a configuration in globalConfig
    const globalConfig = getConfig();
    
    if (globalConfig.scaling) {
      this.config = {
        ...DEFAULT_SCALING_CONFIG,
        ...globalConfig.scaling
      };
    }
    
    // Subscribe to config changes
    config.subscribe(updatedConfig => {
      if (updatedConfig.scaling) {
        this.config = {
          ...DEFAULT_SCALING_CONFIG,
          ...updatedConfig.scaling
        };
        this.logger.info('Scaling configuration updated');
      }
    });
  }
  
  /**
   * Start automatic environment monitoring
   */
  public startMonitoring(): void {
    if (this.checkInterval) {
      this.logger.warn('Environment monitoring already started');
      return;
    }
    
    this.logger.info('Starting environment monitoring');
    
    // Start monitoring interval
    this.checkInterval = setInterval(() => {
      this.checkEnvironmentHealth();
    }, this.config.checkIntervalMs);
  }
  
  /**
   * Stop automatic environment monitoring
   */
  public stopMonitoring(): void {
    if (!this.checkInterval) {
      this.logger.warn('Environment monitoring not running');
      return;
    }
    
    this.logger.info('Stopping environment monitoring');
    
    // Clear interval
    clearInterval(this.checkInterval);
    this.checkInterval = null;
  }
  
  /**
   * Check environment health and take actions if needed
   */
  public async checkEnvironmentHealth(): Promise<void> {
    if (!this.config.enabled) {
      return;
    }
    
    try {
      // Get current performance metrics
      const metrics = getPerformanceMetrics();
      
      // Check CPU usage
      if (metrics.cpuUsage > this.config.metrics.cpu.threshold) {
        const lastCpuAction = this.getLastActionByType('cpu');
        const cooldownTime = this.config.metrics.cpu.cooldownMinutes * 60 * 1000;
        
        if (!lastCpuAction || (Date.now() - lastCpuAction.timestamp.getTime() > cooldownTime)) {
          this.logger.warn(`High CPU usage detected: ${(metrics.cpuUsage * 100).toFixed(2)}%`);
          
          // Record the action
          this.addScalingAction({
            type: 'cpu',
            action: 'restart',
            reason: `CPU usage exceeded threshold (${(metrics.cpuUsage * 100).toFixed(2)}%)`,
            timestamp: new Date()
          });
          
          // Take action if auto-scaling is enabled
          if (this.config.autoScale) {
            await this.performScalingAction('cpu');
          }
        }
      }
      
      // Check memory usage
      if (metrics.memoryUsage > this.config.metrics.memory.threshold) {
        const lastMemoryAction = this.getLastActionByType('memory');
        const cooldownTime = this.config.metrics.memory.cooldownMinutes * 60 * 1000;
        
        if (!lastMemoryAction || (Date.now() - lastMemoryAction.timestamp.getTime() > cooldownTime)) {
          this.logger.warn(`High memory usage detected: ${(metrics.memoryUsage * 100).toFixed(2)}%`);
          
          // Record the action
          this.addScalingAction({
            type: 'memory',
            action: 'increase',
            value: this.config.actions.memory.incrementMB,
            reason: `Memory usage exceeded threshold (${(metrics.memoryUsage * 100).toFixed(2)}%)`,
            timestamp: new Date()
          });
          
          // Take action if auto-scaling is enabled
          if (this.config.autoScale) {
            await this.performScalingAction('memory');
          }
        }
      }
      
      // Check response time
      if (metrics.avgResponseTime > this.config.metrics.responseTime.threshold) {
        const lastResponseTimeAction = this.getLastActionByType('responseTime');
        const cooldownTime = this.config.metrics.responseTime.cooldownMinutes * 60 * 1000;
        
        if (!lastResponseTimeAction || (Date.now() - lastResponseTimeAction.timestamp.getTime() > cooldownTime)) {
          this.logger.warn(`High average response time detected: ${metrics.avgResponseTime.toFixed(2)}ms`);
          
          // Record the action
          this.addScalingAction({
            type: 'responseTime',
            action: 'increase',
            value: this.config.actions.memory.incrementMB,
            reason: `Response time exceeded threshold (${metrics.avgResponseTime.toFixed(2)}ms)`,
            timestamp: new Date()
          });
          
          // Take action if auto-scaling is enabled
          if (this.config.autoScale) {
            await this.performScalingAction('responseTime');
          }
        }
      }
    } catch (error) {
      this.logger.error('Error checking environment health:', error);
    }
  }
  
  /**
   * Perform scaling action based on type
   */
  private async performScalingAction(type: 'cpu' | 'memory' | 'responseTime'): Promise<boolean> {
    try {
      switch (type) {
        case 'cpu':
          // For CPU issues, we just log since there's not much we can do automatically
          this.logger.info('CPU scaling action: considering a restart or optimization');
          return true;
          
        case 'memory':
          // Increase memory allocation
          return await this.increaseMemoryAllocation();
          
        case 'responseTime':
          // For response time issues, increase memory as it might help
          return await this.increaseMemoryAllocation();
          
        default:
          return false;
      }
    } catch (error) {
      this.logger.error(`Error performing scaling action for ${type}:`, error);
      return false;
    }
  }
  
  /**
   * Increase memory allocation in Node.js
   */
  private async increaseMemoryAllocation(): Promise<boolean> {
    try {
      // Get current memory setting
      const currentMemory = this.getCurrentMemorySetting();
      
      // Calculate new memory value
      let newMemory = currentMemory + this.config.actions.memory.incrementMB;
      
      // Cap at maximum value
      if (newMemory > this.config.actions.memory.maxMB) {
        newMemory = this.config.actions.memory.maxMB;
        this.logger.warn(`Capping memory increase at maximum ${newMemory}MB`);
      }
      
      // If we're already at max, don't do anything
      if (currentMemory >= this.config.actions.memory.maxMB) {
        this.logger.warn(`Already at maximum memory allocation (${currentMemory}MB)`);
        return false;
      }
      
      this.logger.info(`Increasing memory allocation from ${currentMemory}MB to ${newMemory}MB`);
      
      // Update NODE_OPTIONS in .env file
      await this.updateMemoryInEnvFile(newMemory);
      
      return true;
    } catch (error) {
      this.logger.error('Error increasing memory allocation:', error);
      return false;
    }
  }
  
  /**
   * Get current memory setting
   */
  private getCurrentMemorySetting(): number {
    // Check NODE_OPTIONS environment variable
    const nodeOptions = process.env.NODE_OPTIONS || '';
    const memoryMatch = nodeOptions.match(/--max-old-space-size=(\d+)/);
    
    if (memoryMatch && memoryMatch[1]) {
      return parseInt(memoryMatch[1], 10);
    }
    
    // Check .env file
    try {
      const envPath = path.resolve(process.cwd(), '.env');
      if (fs.existsSync(envPath)) {
        const envContent = fs.readFileSync(envPath, 'utf8');
        const envMemoryMatch = envContent.match(/NODE_OPTIONS=.*--max-old-space-size=(\d+)/);
        
        if (envMemoryMatch && envMemoryMatch[1]) {
          return parseInt(envMemoryMatch[1], 10);
        }
      }
    } catch (error) {
      // Ignore error reading .env file
    }
    
    // Return default initial value
    return this.config.actions.memory.initialMB;
  }
  
  /**
   * Update memory setting in .env file
   */
  private async updateMemoryInEnvFile(memoryMB: number): Promise<void> {
    const envPath = path.resolve(process.cwd(), '.env');
    
    try {
      // Create .env file if it doesn't exist
      if (!fs.existsSync(envPath)) {
        fs.writeFileSync(envPath, `NODE_OPTIONS="--max-old-space-size=${memoryMB}"\n`);
        this.logger.info(`Created .env file with memory setting ${memoryMB}MB`);
        return;
      }
      
      // Read existing .env file
      let envContent = fs.readFileSync(envPath, 'utf8');
      
      // Check if NODE_OPTIONS is already set
      if (envContent.includes('NODE_OPTIONS=')) {
        // Update existing NODE_OPTIONS
        const hasMemorySetting = envContent.includes('--max-old-space-size=');
        
        if (hasMemorySetting) {
          // Replace existing memory setting
          envContent = envContent.replace(
            /NODE_OPTIONS=(["']?)(.*)--max-old-space-size=\d+(.*)\1/,
            `NODE_OPTIONS=$1$2--max-old-space-size=${memoryMB}$3$1`
          );
        } else {
          // Add memory setting to existing NODE_OPTIONS
          envContent = envContent.replace(
            /NODE_OPTIONS=(["']?)(.*)\1/,
            `NODE_OPTIONS=$1$2 --max-old-space-size=${memoryMB}$1`
          );
        }
      } else {
        // Add NODE_OPTIONS line
        envContent += `\nNODE_OPTIONS="--max-old-space-size=${memoryMB}"\n`;
      }
      
      // Write updated content back to .env file
      fs.writeFileSync(envPath, envContent);
      this.logger.info(`Updated .env file with memory setting ${memoryMB}MB`);
    } catch (error) {
      this.logger.error('Error updating .env file:', error);
      throw error;
    }
  }
  
  /**
   * Add scaling action to history
   */
  private addScalingAction(action: ScalingAction): void {
    this.scalingHistory.push(action);
    
    // Keep history limited to last 100 actions
    if (this.scalingHistory.length > 100) {
      this.scalingHistory.shift();
    }
    
    // Log the action
    this.logger.info(`Scaling action: ${action.action} ${action.type}`, action);
  }
  
  /**
   * Get last action by type
   */
  private getLastActionByType(type: string): ScalingAction | undefined {
    // Find most recent action of the specified type
    for (let i = this.scalingHistory.length - 1; i >= 0; i--) {
      if (this.scalingHistory[i].type === type) {
        return this.scalingHistory[i];
      }
    }
    
    return undefined;
  }
  
  /**
   * Get scaling history
   */
  public getScalingHistory(): ScalingAction[] {
    return [...this.scalingHistory];
  }
  
  /**
   * Get current scaling configuration
   */
  public getScalingConfig(): ScalingConfig {
    return { ...this.config };
  }
  
  /**
   * Update scaling configuration
   */
  public updateScalingConfig(newConfig: Partial<ScalingConfig>): ScalingConfig {
    this.config = {
      ...this.config,
      ...newConfig
    };
    
    this.logger.info('Scaling configuration updated', this.config);
    return { ...this.config };
  }
}

// Export singleton instance
export const environmentController = EnvironmentController.getInstance();
