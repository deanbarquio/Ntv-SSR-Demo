// Import Angular core modules for component functionality
import { Component, signal, inject } from '@angular/core';
// Import router modules for navigation
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
// Import common directives for template functionality
import { CommonModule } from '@angular/common';

/**
 * Main Application Component
 * 
 * This is the root component that demonstrates SSR (Server-Side Rendering) vs CSR (Client-Side Rendering)
 * functionality. It shows how the same component behaves differently on server vs client.
 * 
 * SSR Behavior:
 * - Component renders on the server with initial static data
 * - Server sends fully rendered HTML to the client
 * - No client-side interactivity until hydration
 * 
 * CSR Behavior:
 * - After hydration, component becomes fully interactive
 * - Real-time updates work (like the clock)
 * - User interactions are handled immediately
 */
@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  // SSR Signal: Static title that's rendered on both server and client
  protected readonly title = signal('Angular SSR Demo');
  
  // Mixed SSR/CSR Signal: Initial time rendered on server, updated on client
  protected readonly currentTime = signal(new Date().toLocaleString());
  
  // SSR Detection Signal: Determines if code is running on server or client
  // This is crucial for SSR applications to handle server/client differences
  protected readonly isServer = signal(typeof window === 'undefined');
  
  /**
   * Constructor - Handles client-side only functionality
   * 
   * This demonstrates the key principle of SSR: server-side code should not
   * depend on browser APIs. The constructor only runs client-side features
   * when the code is executing in the browser.
   */
  constructor() {
    // Client-side only: Update time every second
    // This won't run on the server, preventing SSR errors
    if (typeof window !== 'undefined') {
      setInterval(() => {
        this.currentTime.set(new Date().toLocaleString());
      }, 1000);
    }
  }
}
