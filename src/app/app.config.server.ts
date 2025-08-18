// Import necessary Angular core modules for configuration merging
import { mergeApplicationConfig, ApplicationConfig } from '@angular/core';
// Import SSR-specific providers for server-side rendering
import { provideServerRendering, withRoutes } from '@angular/ssr';
// Import the base client configuration
import { appConfig } from './app.config';
// Import the server routes configuration
import { serverRoutes } from './app.routes.server';

/**
 * Server Configuration for SSR
 * 
 * This configuration extends the base client configuration with server-specific
 * providers and settings needed for server-side rendering.
 * 
 * The server config is merged with the client config to create a complete
 * configuration that works both on server and client.
 */
const serverConfig: ApplicationConfig = {
  providers: [
    // Enable server-side rendering with the defined server routes
    // This tells Angular how to handle routing on the server side
    provideServerRendering(withRoutes(serverRoutes))
  ]
};

/**
 * Merged Configuration
 * 
 * Combines the client configuration (appConfig) with the server configuration
 * (serverConfig) to create a unified configuration that supports both
 * client-side and server-side rendering.
 * 
 * This merged config is used by the server bootstrap process.
 */
export const config = mergeApplicationConfig(appConfig, serverConfig);
