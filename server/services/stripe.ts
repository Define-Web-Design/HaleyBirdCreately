import Stripe from 'stripe';

// Initialize Stripe with API key
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
let stripe: Stripe | null = null;

if (stripeSecretKey) {
  stripe = new Stripe(stripeSecretKey, {
    apiVersion: '2025-02-24.acacia', // Use the latest API version available
  });
} else {
  console.warn('Stripe API key not provided. Payment functionality will be disabled.');
}

export class StripeService {
  /**
   * Create a payment intent
   * @param amount Amount in cents (e.g., 1000 for $10.00)
   * @param currency Currency code (e.g., 'usd')
   * @param description Description of the payment
   * @returns The created payment intent or error
   */
  async createPaymentIntent(amount: number, currency: string = 'usd', description: string): Promise<{ success: boolean; clientSecret?: string; error?: string }> {
    if (!stripe) {
      return { success: false, error: 'Stripe not configured. Check STRIPE_SECRET_KEY environment variable.' };
    }

    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount,
        currency,
        description,
        automatic_payment_methods: { enabled: true },
      });

      return { success: true, clientSecret: paymentIntent.client_secret as string };
    } catch (error) {
      console.error('Failed to create payment intent:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  /**
   * Create a new customer
   * @param email Customer email
   * @param name Customer name
   * @returns The created customer or error
   */
  async createCustomer(email: string, name: string): Promise<{ success: boolean; customerId?: string; error?: string }> {
    if (!stripe) {
      return { success: false, error: 'Stripe not configured. Check STRIPE_SECRET_KEY environment variable.' };
    }

    try {
      const customer = await stripe.customers.create({
        email,
        name,
      });

      return { success: true, customerId: customer.id };
    } catch (error) {
      console.error('Failed to create customer:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  /**
   * Create a product in Stripe
   * @param name Product name
   * @param description Product description
   * @param images Array of image URLs
   * @returns The created product or error
   */
  async createProduct(name: string, description: string, images: string[] = []): Promise<{ success: boolean; productId?: string; error?: string }> {
    if (!stripe) {
      return { success: false, error: 'Stripe not configured. Check STRIPE_SECRET_KEY environment variable.' };
    }

    try {
      const product = await stripe.products.create({
        name,
        description,
        images,
      });

      return { success: true, productId: product.id };
    } catch (error) {
      console.error('Failed to create product:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  /**
   * Create a price for a product
   * @param productId The Stripe product ID
   * @param unitAmount The price in cents (e.g., 1000 for $10.00)
   * @param currency The currency code (e.g., 'usd')
   * @param recurring Set to false for one-time payments, or an object for subscriptions
   * @returns The created price or error
   */
  async createPrice(
    productId: string, 
    unitAmount: number, 
    currency: string = 'usd', 
    recurring: false | { interval: 'day' | 'week' | 'month' | 'year'; interval_count?: number } = false
  ): Promise<{ success: boolean; priceId?: string; error?: string }> {
    if (!stripe) {
      return { success: false, error: 'Stripe not configured. Check STRIPE_SECRET_KEY environment variable.' };
    }

    try {
      const priceData: Stripe.PriceCreateParams = {
        product: productId,
        unit_amount: unitAmount,
        currency,
      };

      if (recurring) {
        priceData.recurring = recurring;
      }

      const price = await stripe.prices.create(priceData);

      return { success: true, priceId: price.id };
    } catch (error) {
      console.error('Failed to create price:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }
}

export default new StripeService();