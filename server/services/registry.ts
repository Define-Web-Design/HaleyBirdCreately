/**
 * Service Registry - A simple service locator implementation
 * Allows registering and retrieving services by name
 */
export class ServiceRegistry {
  private static instance: ServiceRegistry;
  private services: Map<string, any>;

  private constructor() {
    this.services = new Map();
  }

  /**
   * Get the singleton instance of the ServiceRegistry
   */
  public static getInstance(): ServiceRegistry {
    if (!ServiceRegistry.instance) {
      ServiceRegistry.instance = new ServiceRegistry();
    }
    return ServiceRegistry.instance;
  }

  /**
   * Register a service with the registry
   * @param name The name of the service
   * @param service The service instance
   */
  public registerService(name: string, service: any): void {
    if (this.services.has(name)) {
      console.warn(`Service '${name}' is already registered. It will be overwritten.`);
    }
    this.services.set(name, service);
  }

  /**
   * Get a service from the registry
   * @param name The name of the service
   * @returns The service instance or null if not found
   */
  public getService<T>(name: string): T | null {
    return this.services.get(name) || null;
  }

  /**
   * Check if a service exists in the registry
   * @param name The name of the service
   * @returns True if the service exists, false otherwise
   */
  public hasService(name: string): boolean {
    return this.services.has(name);
  }

  /**
   * Remove a service from the registry
   * @param name The name of the service
   * @returns True if the service was removed, false if it didn't exist
   */
  public removeService(name: string): boolean {
    return this.services.delete(name);
  }

  /**
   * Clear all services from the registry
   */
  public clearServices(): void {
    this.services.clear();
  }

  /**
   * Get all registered service names
   * @returns Array of service names
   */
  public getServiceNames(): string[] {
    return Array.from(this.services.keys());
  }
}