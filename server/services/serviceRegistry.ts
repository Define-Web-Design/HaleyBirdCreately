
/**
 * Service Registry - Centralizes service initialization and configuration
 */

import { AuthService } from './auth';
import { TwilioService } from './twilio';
import { StripeService } from './stripe';
import { IStorage } from '../storage';

export class ServiceRegistry {
  private static instance: ServiceRegistry;
  
  auth: AuthService;
  twilio: TwilioService;
  stripe: StripeService;
  
  private constructor(storage: IStorage) {
    // Initialize services
    this.auth = new AuthService(storage);
    this.twilio = new TwilioService();
    this.stripe = new StripeService();
    
    // Log service status
    this.logServiceStatus();
  }
  
  private logServiceStatus() {
    console.log('======= Service Status =======');
    console.log(`Auth Service: Active`);
    
    const twilioStatus = process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN 
      ? 'Active' : 'Disabled (missing credentials)';
    console.log(`Twilio Service: ${twilioStatus}`);
    
    const stripeStatus = process.env.STRIPE_SECRET_KEY 
      ? 'Active' : 'Disabled (missing API key)';
    console.log(`Stripe Service: ${stripeStatus}`);
    console.log('==============================');
  }
  
  public static getInstance(storage: IStorage): ServiceRegistry {
    if (!ServiceRegistry.instance) {
      ServiceRegistry.instance = new ServiceRegistry(storage);
    }
    return ServiceRegistry.instance;
  }
}
