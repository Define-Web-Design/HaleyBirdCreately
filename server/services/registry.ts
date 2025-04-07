/**
 * Service Registry for dependency injection
 * This registry manages service instances, allowing dependencies to be injected across the application.
 */
export class ServiceRegistry {
  private services: Map<string, any>;

  constructor() {
    this.services = new Map<string, any>();
  }

  /**
   * Register a service with the registry
   * @param name The name of the service
   * @param service The service instance
   */
  registerService(name: string, service: any): void {
    this.services.set(name, service);
  }

  /**
   * Get a service from the registry
   * @param name The name of the service to retrieve
   * @returns The service instance, or undefined if not found
   */
  getService(name: string): any {
    return this.services.get(name);
  }

  /**
   * Check if a service is registered
   * @param name The name of the service to check
   * @returns True if the service is registered, false otherwise
   */
  hasService(name: string): boolean {
    return this.services.has(name);
  }

  /**
   * Remove a service from the registry
   * @param name The name of the service to remove
   */
  removeService(name: string): void {
    this.services.delete(name);
  }

  /**
   * Get all registered service names
   * @returns Array of service names
   */
  getServiceNames(): string[] {
    return Array.from(this.services.keys());
  }

  /**
   * Clear all services from the registry
   */
  clearServices(): void {
    this.services.clear();
  }
}

// Create and export a singleton instance
const serviceRegistry = new ServiceRegistry();
export default serviceRegistry;