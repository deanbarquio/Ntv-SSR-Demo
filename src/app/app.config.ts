// Import Angular core configuration and provider functions
import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection } from '@angular/core';
// Import router provider for client-side routing
import { provideRouter } from '@angular/router';

// Import the client-side routes configuration
import { routes } from './app.routes';
// Import client hydration providers for SSR
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';

/**
 * Client Application Configuration
 * 
 * This configuration sets up the Angular application for client-side execution.
 * It includes providers for routing, error handling, change detection, and
 * client hydration - which is crucial for SSR applications.
 * 
 * Client hydration allows the server-rendered HTML to become interactive
 * once the JavaScript loads in the browser.
 */
export const appConfig: ApplicationConfig = {
  providers: [
    // Global error listeners for better error handling in the browser
    provideBrowserGlobalErrorListeners(),
    
    // Zoneless change detection for better performance
    // This is the modern approach to change detection in Angular
    provideZonelessChangeDetection(),
    
    // Client-side routing configuration
    // This enables navigation between components without page reloads
    provideRouter(routes), 
    
    // Client hydration with event replay
    // This is essential for SSR - it makes server-rendered content interactive
    // Event replay captures user interactions that happen before hydration
    // and replays them once the app is fully loaded
    provideClientHydration(withEventReplay())
  ]
};
