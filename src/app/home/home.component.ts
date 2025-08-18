// Import Angular core modules for component functionality
import { Component, signal, inject, OnInit } from '@angular/core';
// Import common directives for template functionality
import { CommonModule } from '@angular/common';

/**
 * Home Component - SSR vs CSR Demonstration
 * 
 * This component showcases the differences between Server-Side Rendering (SSR) and
 * Client-Side Rendering (CSR) in a real-world scenario.
 * 
 * SSR Features (Server-Rendered):
 * - Static content is rendered immediately on the server
 * - SEO-friendly HTML is sent to the client
 * - No JavaScript required for initial content display
 * 
 * CSR Features (Client-Side):
 * - Dynamic content updates after hydration
 * - Real-time clock updates
 * - Interactive features become available
 * 
 * Key SSR/CSR Patterns Demonstrated:
 * 1. Server detection using typeof window === 'undefined'
 * 2. Conditional client-side functionality
 * 3. Static vs dynamic data handling
 * 4. Progressive enhancement approach
 */
@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {
  // SSR Signal: Static title rendered on both server and client
  protected readonly title = signal('Angular SSR Demo');
  
  // Mixed SSR/CSR Signal: Initial time rendered on server, updated on client
  protected readonly serverTime = signal(new Date().toLocaleString());
  
  // SSR Detection Signal: Determines execution environment
  protected readonly isServer = signal(typeof window === 'undefined');
  
  // SSR Signal: Static feature data (SEO-friendly, rendered on server)
  protected readonly features = signal([
    {
      title: 'Server-Side Rendering',
      description: 'Content is rendered on the server for better SEO and faster initial page loads',
      icon: '🚀',
      benefit: 'Improved SEO & Performance'
    },
    {
      title: 'Hydration',
      description: 'Seamless transition from server-rendered content to interactive client-side app',
      icon: '⚡',
      benefit: 'Smooth User Experience'
    },
    {
      title: 'SEO Optimized',
      description: 'Search engines can crawl and index your content effectively',
      icon: '🔍',
      benefit: 'Better Search Rankings'
    },
    {
      title: 'Fast Initial Load',
      description: 'Users see content immediately without waiting for JavaScript to load',
      icon: '⚡',
      benefit: 'Reduced Time to Interactive'
    }
  ]);

  /**
   * Component Initialization - Lifecycle Hook
   * 
   * This method demonstrates the SSR/CSR pattern where:
   * - Server-side: Only static content is rendered
   * - Client-side: Dynamic features are initialized after hydration
   */
  ngOnInit() {
    // Client-side only: Initialize dynamic features
    // This ensures server-side rendering doesn't include client-specific code
    if (typeof window !== 'undefined') {
      // Start real-time clock updates (CSR feature)
      setInterval(() => {
        this.serverTime.set(new Date().toLocaleString());
      }, 1000);
    }
  }
}
