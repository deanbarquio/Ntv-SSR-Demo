// Import Angular core modules for component functionality
import { Component, signal } from '@angular/core';
// Import common directives for template functionality
import { CommonModule } from '@angular/common';

/**
 * About Component - SSR Static Content Demonstration
 * 
 * This component demonstrates a primarily SSR-focused approach where most
 * content is static and rendered on the server for optimal SEO and performance.
 * 
 * SSR Features (Server-Rendered):
 * - Static content about the application
 * - Technology stack information
 * - Feature descriptions and benefits
 * - SEO-optimized content structure
 * 
 * CSR Features (Client-Side):
 * - Minimal dynamic content (current time display)
 * - Server detection for UI indicators
 * 
 * Key SSR/CSR Patterns:
 * 1. Content-first approach (SSR for SEO)
 * 2. Minimal client-side enhancement
 * 3. Static data with dynamic indicators
 * 4. Progressive disclosure of features
 */
@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './about.component.html',
  styleUrl: './about.component.scss'
})
export class AboutComponent {
  // SSR Detection Signal: Determines execution environment
  protected readonly isServer = signal(typeof window === 'undefined');
  
  // Mixed SSR/CSR Signal: Initial time rendered on server, static on client
  // This demonstrates how static content can be enhanced with minimal client-side features
  protected readonly currentTime = signal(new Date().toLocaleString());
  
  // SSR Signal: Static technology stack information (SEO-friendly)
  // This data is rendered on the server and provides immediate content to users
  protected readonly techStack = signal([
    { name: 'Angular 20+', description: 'Latest version with modern features', icon: '⚡' },
    { name: 'Server-Side Rendering', description: 'Enhanced SEO and performance', icon: '🚀' },
    { name: 'TypeScript', description: 'Type-safe development', icon: '🔒' },
    { name: 'SCSS', description: 'Advanced styling capabilities', icon: '🎨' },
    { name: 'Express.js', description: 'Server-side framework', icon: '🖥️' },
    { name: 'RxJS', description: 'Reactive programming', icon: '🔄' }
  ]);

  // SSR Signal: Static feature descriptions (SEO-friendly)
  // This content is immediately available to search engines and users
  protected readonly features = signal([
    {
      title: 'Server-Side Rendering',
      description: 'Content is pre-rendered on the server for optimal SEO and performance',
      benefits: ['Better SEO', 'Faster Initial Load', 'Improved Accessibility']
    },
    {
      title: 'Hydration',
      description: 'Seamless transition from static server content to interactive client app',
      benefits: ['Smooth UX', 'No Content Flicker', 'Progressive Enhancement']
    },
    {
      title: 'Modern Angular',
      description: 'Built with Angular 20+ featuring signals, standalone components, and more',
      benefits: ['Better Performance', 'Simpler Code', 'Enhanced Developer Experience']
    }
  ]);
}
