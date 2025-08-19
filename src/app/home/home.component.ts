// Import Angular core modules for component functionality
import { Component, signal, inject, OnInit, AfterViewInit } from '@angular/core';
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
 * 5. Hydration status tracking and visualization
 */
@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit, AfterViewInit {
  // SSR Signal: Static title rendered on both server and client
  protected readonly title = signal('Angular SSR Demo');
  
  // Mixed SSR/CSR Signal: Initial time rendered on server, updated on client
  protected readonly serverTime = signal(new Date().toLocaleString());
  
  // SSR Detection Signal: Determines execution environment
  protected readonly isServer = signal(typeof window === 'undefined');
  
  // Hydration Status Signals
  protected readonly isHydrated = signal(false);
  protected readonly hydrationTime = signal<number | null>(null);
  protected readonly hydrationDuration = signal<number | null>(null);
  
  // Hydration Animation States
  protected readonly hydrationPhase = signal<'server' | 'loading' | 'hydrated'>('server');
  
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

  // Track when component was created (for hydration timing)
  private readonly componentCreated = Date.now();

  /**
   * Component Initialization - Lifecycle Hook
   * 
   * This method demonstrates the SSR/CSR pattern where:
   * - Server-side: Only static content is rendered
   * - Client-side: Dynamic features are initialized after hydration
   */
  ngOnInit() {
    // Set initial hydration phase based on environment
    if (typeof window === 'undefined') {
      this.hydrationPhase.set('server');
    } else {
      this.hydrationPhase.set('loading');
    }

    // Client-side only: Initialize dynamic features
    // This ensures server-side rendering doesn't include client-specific code
    if (typeof window !== 'undefined') {
      // Start real-time clock updates (CSR feature)
      setInterval(() => {
        this.serverTime.set(new Date().toLocaleString());
      }, 1000);
    }
  }

  /**
   * After View Init - Lifecycle Hook
   * 
   * This method runs after the view is initialized and is perfect for
   * detecting when hydration is complete and the app is fully interactive.
   */
  ngAfterViewInit() {
    // Only run on client-side
    if (typeof window !== 'undefined') {
      // Use setTimeout to ensure this runs after Angular's change detection
      setTimeout(() => {
        this.markAsHydrated();
      }, 100);
    }
  }

  /**
   * Mark the application as fully hydrated
   * 
   * This method is called when the app has successfully transitioned
   * from server-rendered content to fully interactive client-side mode.
   */
  private markAsHydrated() {
    const now = Date.now();
    const duration = now - this.componentCreated;
    
    // Update hydration status
    this.isHydrated.set(true);
    this.hydrationTime.set(now);
    this.hydrationDuration.set(duration);
    this.hydrationPhase.set('hydrated');

    // Log hydration completion for debugging
    console.log(`🚀 Hydration completed in ${duration}ms`);
  }

  /**
   * Get hydration status message
   */
  protected getHydrationMessage(): string {
    if (this.isServer()) {
      return 'Server-Side Rendering';
    }
    
    if (!this.isHydrated()) {
      return 'Hydrating...';
    }
    
    return 'Fully Hydrated';
  }

  /**
   * Get hydration status color for styling
   */
  protected getHydrationColor(): string {
    if (this.isServer()) {
      return 'server';
    }
    
    if (!this.isHydrated()) {
      return 'loading';
    }
    
    return 'hydrated';
  }

  /**
   * Get hydration duration in a readable format
   */
  protected getHydrationDurationText(): string {
    const duration = this.hydrationDuration();
    if (duration === null) return '';
    
    if (duration < 1000) {
       return `${duration}ms`;
    }
    
    return `${(duration / 1000).toFixed(1)}s`;
  }
}
