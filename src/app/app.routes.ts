// Import Angular router types for route configuration
import { Routes } from '@angular/router';
// Import all the components that will be used in routing
import { HomeComponent } from './home/home.component';
import { ProductsComponent } from './products/products.component';
import { AboutComponent } from './about/about.component';
import { ContactComponent } from './contact/contact.component';
import { ReportsComponent } from './reports/reports.component';

/**
 * Client-Side Routes Configuration
 * 
 * This file defines the routing structure for the Angular application.
 * Each route maps a URL path to a specific component that will be rendered.
 * 
 * In an SSR application, these routes work in conjunction with server routes:
 * - Server routes determine what gets rendered on the server
 * - Client routes enable smooth navigation after the app loads
 * 
 * Route Structure:
 * - '' (empty path) → HomeComponent (default landing page)
 * - 'products' → ProductsComponent (product listing page)
 * - 'about' → AboutComponent (about page)
 * - 'contact' → ContactComponent (contact page)
 * - 'reports' → ReportsComponent (reports page)
 * - '**' → Redirect to home (catch-all for invalid routes)
 */
export const routes: Routes = [
  // Default route - when user visits the root URL
  { path: '', component: HomeComponent },
  
  // Product listing page
  { path: 'products', component: ProductsComponent },
  
  // About page
  { path: 'about', component: AboutComponent },
  
  // Contact page
  { path: 'contact', component: ContactComponent },
  
  // Reports page
  { path: 'reports', component: ReportsComponent },
  
  // Wildcard route - catches any URL that doesn't match the above routes
  // Redirects to the home page (empty path)
  { path: '**', redirectTo: '' }
];
