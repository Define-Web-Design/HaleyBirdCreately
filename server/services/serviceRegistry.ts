
/**
 * Service Registry - Centralizes service initialization and configuration
 */

import { AuthService } from './auth';
import { TwilioService } from './twilio';
import { StripeService } from './stripe';
import { IStorage } from '../storage';

export interface ServiceStatus {
  name: string;
  status: 'active' | 'disabled' | 'error';
  message?: string;
  lastChecked: Date;
}

export class ServiceRegistry {
  private static instance: ServiceRegistry;
  
  auth: AuthService;
  twilio: TwilioService;
  stripe: StripeService;
  
  private servicesStatus: Map<string, ServiceStatus> = new Map();
  private healthCheckInterval: NodeJS.Timeout | null = null;
  
  private constructor(storage: IStorage) {
    // Initialize services
    this.auth = new AuthService(storage);
    this.twilio = new TwilioService();
    this.stripe = new StripeService();
    
    // Initial service status check
    this.checkServicesStatus();
    
    // Setup periodic health checks
    this.startHealthChecks();
  }
  
  private checkServicesStatus() {
    const now = new Date();
    
    // Check Auth Service
    this.servicesStatus.set('auth', {
      name: 'Authentication Service',
      status: 'active',
      lastChecked: now
    });
    
    // Check Twilio Service
    const twilioStatus = process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN 
      ? 'active' as const
      : 'disabled' as const;
      
    this.servicesStatus.set('twilio', {
      name: 'Twilio Communication Service',
      status: twilioStatus,
      message: twilioStatus === 'disabled' ? 'Missing credentials' : undefined,
      lastChecked: now
    });
    
    // Check Stripe Service
    const stripeStatus = process.env.STRIPE_SECRET_KEY 
      ? 'active' as const
      : 'disabled' as const;
      
    this.servicesStatus.set('stripe', {
      name: 'Stripe Payment Service',
      status: stripeStatus,
      message: stripeStatus === 'disabled' ? 'Missing API key' : undefined,
      lastChecked: now
    });
    
    // Log current status
    this.logServiceStatus();
  }
  
  private startHealthChecks() {
    // Check services every 5 minutes
    this.healthCheckInterval = setInterval(() => {
      this.checkServicesStatus();
    }, 5 * 60 * 1000);
  }
  
  private logServiceStatus() {
    console.log('======= Service Status =======');
    
    this.servicesStatus.forEach((status) => {
      const statusText = status.status === 'active' 
        ? '\x1b[32mActive\x1b[0m' // Green text
        : status.status === 'disabled'
          ? '\x1b[33mDisabled\x1b[0m' // Yellow text
          : '\x1b[31mError\x1b[0m'; // Red text
          
      console.log(`${status.name}: ${statusText}${status.message ? ` (${status.message})` : ''}`);
    });
    
    console.log('==============================');
  }
  
  public getServiceStatus(serviceName: string): ServiceStatus | undefined {
    return this.servicesStatus.get(serviceName);
  }
  
  public getAllServicesStatus(): ServiceStatus[] {
    return Array.from(this.servicesStatus.values());
  }
  
  public static getInstance(storage: IStorage): ServiceRegistry {
    if (!ServiceRegistry.instance) {
      ServiceRegistry.instance = new ServiceRegistry(storage);
    }
    return ServiceRegistry.instance;
  }
  
  // Cleanup resources on shutdown
  public shutdown() {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
    }
    
    console.log('Service Registry shutdown complete');
  }
}
