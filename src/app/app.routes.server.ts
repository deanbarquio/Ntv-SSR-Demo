// Import SSR-specific types for server-side routing configuration
import { RenderMode, ServerRoute } from '@angular/ssr';

/**
 * Server Routes Configuration for SSR (Server-Side Rendering)
 * 
 * This file defines which routes should be rendered on the server side.
 * The server routes work in conjunction with client routes to provide
 * a complete SSR experience.
 * 
 * RenderMode.Prerender: Routes are pre-rendered on the server during build time
 * RenderMode.Dynamic: Routes are rendered dynamically on each request
 */
export const serverRoutes: ServerRoute[] = [
  {
    // '**' means all routes - this will prerender every route in the application
    // This ensures that all pages are server-rendered for better SEO and initial load performance
    path: '**',
    renderMode: RenderMode.Prerender,
    
    /* Can be Prerender, Server, or Client just check the view page source to see the render mode*/
  }
];
