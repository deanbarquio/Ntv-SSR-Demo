// Import Angular SSR Node.js utilities for server-side rendering
import {
  AngularNodeAppEngine,      // Main engine for rendering Angular apps on Node.js
  createNodeRequestHandler,   // Creates request handler for Node.js environments
  isMainModule,              // Checks if this is the main module being executed
  writeResponseToNodeResponse, // Converts Angular response to Node.js response
} from '@angular/ssr/node';
// Import Express.js for creating the web server
import express from 'express';
// Import Node.js path utilities
import { join } from 'node:path';

/**
 * Path to the browser build folder
 * This contains all the static assets (JS, CSS, images) that will be served
 * directly without going through the Angular rendering engine
 */
const browserDistFolder = join(import.meta.dirname, '../browser');

// Create Express application instance
const app = express();
// Create Angular SSR engine instance for rendering components
const angularApp = new AngularNodeAppEngine();

/**
 * Example Express Rest API endpoints can be defined here.
 * Uncomment and define endpoints as necessary.
 * 
 * These endpoints will be handled by Express directly, bypassing Angular SSR.
 * Useful for API routes, webhooks, or other server-side functionality.
 *
 * Example:
 * ```ts
 * app.get('/api/{*splat}', (req, res) => {
 *   // Handle API request
 * });
 * ```
 */

/**
 * Static File Serving Middleware
 * 
 * Serves static files (JS, CSS, images, etc.) from the browser build folder.
 * These files are served directly without going through Angular rendering
 * for better performance.
 * 
 * Configuration:
 * - maxAge: '1y' - Cache static files for 1 year
 * - index: false - Don't serve index.html automatically
 * - redirect: false - Don't redirect requests
 */
app.use(
  express.static(browserDistFolder, {
    maxAge: '1y',
    index: false,
    redirect: false,
  }),
);

/**
 * Angular SSR Middleware
 * 
 * This middleware handles all requests that aren't static files.
 * It uses the Angular SSR engine to render the appropriate component
 * based on the requested URL and returns the fully rendered HTML.
 * 
 * Flow:
 * 1. Request comes in (e.g., /products)
 * 2. Angular engine renders the ProductsComponent
 * 3. Fully rendered HTML is returned to the client
 * 4. Client receives SEO-friendly HTML with all content
 */
app.use((req, res, next) => {
  // Use Angular SSR engine to handle the request
  angularApp
    .handle(req)
    .then((response) => {
      // If Angular engine returns a response, write it to the Node.js response
      // If no response, continue to next middleware
      response ? writeResponseToNodeResponse(response, res) : next();
    })
    .catch(next); // Pass any errors to Express error handling
});

/**
 * Server Startup Logic
 * 
 * This block only executes when this file is run directly (not imported).
 * It starts the Express server on the specified port.
 * 
 * The server can be started in two ways:
 * 1. Direct execution: node server.js
 * 2. Through Angular CLI: ng serve
 */
if (isMainModule(import.meta.url)) {
  // Use PORT environment variable or default to 4000
  const port = process.env['PORT'] || 4000;
  
  // Start the server
  app.listen(port, (error) => {
    if (error) {
      throw error;
    }

    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

/**
 * Request Handler Export
 * 
 * This exported handler is used by:
 * - Angular CLI during development (ng serve)
 * - Build tools during production builds
 * - Cloud platforms like Firebase Cloud Functions
 * 
 * It provides a standardized way for external tools to handle requests
 * through this Express application.
 */
export const reqHandler = createNodeRequestHandler(app);
