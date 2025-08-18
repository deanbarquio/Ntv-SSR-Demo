// Import the bootstrap function for server-side application startup
import { bootstrapApplication } from '@angular/platform-browser';
// Import the main App component
import { App } from './app/app';
// Import the merged server configuration
import { config } from './app/app.config.server';

/**
 * Server Bootstrap Function
 * 
 * This function bootstraps the Angular application on the server side.
 * It uses the merged configuration that includes both client and server
 * providers to ensure the app works correctly in the SSR environment.
 * 
 * The bootstrap function is exported as default to be used by the
 * Angular SSR engine during server-side rendering.
 * 
 * @returns Promise that resolves when the application is bootstrapped
 */
const bootstrap = () => bootstrapApplication(App, config);

// Export the bootstrap function as default for SSR
export default bootstrap;
