// Import Angular core modules for component functionality
import { Component, signal, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
// Import common directives for template functionality
import { CommonModule } from '@angular/common';

/**
 * Product Interface - Defines the structure of product data
 * This interface is used for both SSR (static) and CSR (dynamic) product data
 */
interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  inStock: boolean;
  stockCount?: number;
  originalPrice?: number;
  discount?: number;
  rating?: number;
  reviewCount?: number;
  lastUpdated?: string;
}

/**
 * Live Data Interface - Defines dynamic data that changes in real-time
 * This data is only available on the client-side after hydration
 */
interface LiveData {
  stockCount: number;
  currentPrice: number;
  discount: number;
  rating: number;
  reviewCount: number;
}

/**
 * Products Component - Advanced SSR vs CSR Demonstration
 * 
 * This component demonstrates a complex e-commerce scenario with both
 * server-rendered static content and client-side dynamic features.
 * 
 * SSR Features (Server-Rendered):
 * - Static product catalog (SEO-friendly)
 * - Product categories and basic information
 * - Initial page structure and layout
 * - Server-side filtering and sorting options
 * 
 * CSR Features (Client-Side):
 * - Real-time stock updates
 * - Live pricing changes
 * - Dynamic user interactions (cart, wishlist)
 * - Real-time data streaming
 * - Interactive filtering and sorting
 * 
 * Key SSR/CSR Patterns:
 * 1. Hybrid data approach (static + dynamic)
 * 2. Progressive enhancement
 * 3. Real-time data synchronization
 * 4. User interaction handling
 * 5. Hydration status tracking and visualization
 */
@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './products.component.html',
  styleUrl: './products.component.scss'
})
export class ProductsComponent implements OnInit, OnDestroy, AfterViewInit {
  // ===== SSR SIGNALS (Static data rendered on server) =====
  // These signals contain data that's available immediately on server render
  // and are SEO-friendly for search engines
  
  protected readonly products = signal<Product[]>([]);
  protected readonly categories = signal([
    { id: 'all', name: 'All Products' },
    { id: 'electronics', name: 'Electronics' },
    { id: 'clothing', name: 'Clothing' },
    { id: 'books', name: 'Books' }
  ]);
  
  // ===== CSR SIGNALS (Dynamic data updated on client) =====
  // These signals contain data that's only available after client hydration
  // and provide real-time, interactive features
  
  protected readonly loading = signal(true);
  protected readonly selectedCategory = signal('all');
  protected readonly isServer = signal(typeof window === 'undefined');
  protected readonly renderTime = signal(new Date().toLocaleString());
  protected readonly liveData = signal<Map<number, LiveData>>(new Map());
  protected readonly cartCount = signal(0);
  protected readonly wishlistCount = signal(0);
  protected readonly realTimeStatus = signal('Inactive');
  protected readonly connectionStatus = signal('Connected');
  protected readonly updateCount = signal(0);
  
  // Hydration Status Signals
  protected readonly isHydrated = signal(false);
  protected readonly hydrationTime = signal<number | null>(null);
  protected readonly hydrationDuration = signal<number | null>(null);
  
  // Hydration Animation States
  protected readonly hydrationPhase = signal<'server' | 'loading' | 'hydrated'>('server');
  
  // ===== MIXED SSR/CSR SIGNALS =====
  // These signals work on both server and client, but have different behaviors
  // Server: Initial state rendered
  // Client: Interactive state with real-time updates
  
  protected readonly viewMode = signal<'grid' | 'list'>('grid');
  protected readonly sortBy = signal<'name' | 'price' | 'rating'>('name');
  protected readonly showOnlyInStock = signal(false);
  
  // ===== PRIVATE PROPERTIES =====
  // Interval IDs for cleanup to prevent memory leaks
  private intervalId?: number;
  private liveDataIntervalId?: number;
  
  // Track when component was created (for hydration timing)
  private readonly componentCreated = Date.now();

  /**
   * Component Initialization - Lifecycle Hook
   * 
   * This method demonstrates the SSR/CSR initialization pattern:
   * - Server-side: Load static data only
   * - Client-side: Initialize dynamic features and real-time updates
   */
  ngOnInit() {
    // Load static product data (works on both server and client)
    this.loadProducts();
    
    // Set initial hydration phase based on environment
    if (typeof window === 'undefined') {
      this.hydrationPhase.set('server');
    } else {
      this.hydrationPhase.set('loading');
    }
    
    // Client-side only: Initialize dynamic features
    // This ensures server-side rendering doesn't include client-specific code
    if (typeof window !== 'undefined') {
      this.initializeLiveData();
      this.startRealTimeUpdates();
      this.simulateUserActivity();
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
   * Component Cleanup - Lifecycle Hook
   * 
   * Ensures proper cleanup of intervals to prevent memory leaks
   * This is especially important for CSR features that use timers
   */
  ngOnDestroy() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
    if (this.liveDataIntervalId) {
      clearInterval(this.liveDataIntervalId);
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
    console.log(`🛍️ Products Hydration completed in ${duration}ms`);
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

  /**
   * Load Static Product Data - SSR Method
   * 
   * This method loads static product data that's rendered on the server.
   * The data is SEO-friendly and provides immediate content to users
   * without requiring JavaScript to load.
   */
  private loadProducts() {
    // SSR: Static product data (SEO-friendly, immediate display)
    const mockProducts: Product[] = [
      {
        id: 1,
        name: 'Angular SSR Guide',
        description: 'Complete guide to Server-Side Rendering with Angular 20+',
        price: 29.99,
        category: 'books',
        image: '📚',
        inStock: true,
        originalPrice: 39.99,
        discount: 25,
        rating: 4.8,
        reviewCount: 156,
        lastUpdated: new Date().toISOString()
      },
      {
        id: 2,
        name: 'SSR Performance Monitor',
        description: 'Real-time monitoring tool for SSR performance metrics',
        price: 99.99,
        category: 'electronics',
        image: '📊',
        inStock: true,
        originalPrice: 129.99,
        discount: 23,
        rating: 4.9,
        reviewCount: 89,
        lastUpdated: new Date().toISOString()
      },
      {
        id: 3,
        name: 'Hydration T-Shirt',
        description: 'Comfortable cotton t-shirt with SSR hydration design',
        price: 24.99,
        category: 'clothing',
        image: '👕',
        inStock: false,
        originalPrice: 29.99,
        discount: 17,
        rating: 4.6,
        reviewCount: 234,
        lastUpdated: new Date().toISOString()
      },
      {
        id: 4,
        name: 'SEO Optimizer Pro',
        description: 'Advanced SEO optimization tool for SSR applications',
        price: 149.99,
        category: 'electronics',
        image: '🔍',
        inStock: false,
        originalPrice: 199.99,
        discount: 25,
        rating: 4.7,
        reviewCount: 67,
        lastUpdated: new Date().toISOString()
      },
      {
        id: 5,
        name: 'Server-Side Hoodie',
        description: 'Warm hoodie perfect for server-side developers',
        price: 39.99,
        category: 'clothing',
        image: '🧥',
        inStock: true,
        originalPrice: 49.99,
        discount: 20,
        rating: 4.5,
        reviewCount: 123,
        lastUpdated: new Date().toISOString()
      },
      {
        id: 6,
        name: 'Angular Best Practices',
        description: 'Comprehensive guide to Angular development best practices',
        price: 19.99,
        category: 'books',
        image: '📖',
        inStock: false,
        originalPrice: 24.99,
        discount: 20,
        rating: 4.4,
        reviewCount: 189,
        lastUpdated: new Date().toISOString()
      }
    ];

    // Simulate different load times for SSR vs CSR
    if (typeof window !== 'undefined') {
      // CSR: Simulate API delay
      setTimeout(() => {
        this.products.set(mockProducts);
        this.loading.set(false);
      }, 800);
    } else {
      // SSR: Immediate data
      this.products.set(mockProducts);
      this.loading.set(false);
    }
  }

  private initializeLiveData() {
    const initialLiveData = new Map<number, LiveData>();
    this.products().forEach(product => {
      initialLiveData.set(product.id, {
        stockCount: Math.floor(Math.random() * 50) + 10,
        currentPrice: product.price,
        discount: product.discount || 0,
        rating: product.rating || 4.0,
        reviewCount: product.reviewCount || 100
      });
    });
    this.liveData.set(initialLiveData);
  }

  private startRealTimeUpdates() {
    // Update render time every second
    this.intervalId = window.setInterval(() => {
      this.renderTime.set(new Date().toLocaleString());
    }, 1000);

    // Update live data every 3 seconds
    this.liveDataIntervalId = window.setInterval(() => {
      this.updateLiveData();
      this.updateCount.update(count => count + 1);
      this.realTimeStatus.set('Active');
    }, 3000);

    // Simulate connection status changes
    setInterval(() => {
      this.connectionStatus.set(Math.random() > 0.95 ? 'Reconnecting...' : 'Connected');
    }, 15000);
  }

  private updateLiveData() {
    const currentData = this.liveData();
    const updatedData = new Map(currentData);
    
    updatedData.forEach((data, productId) => {
      // Simulate real-time changes
      const stockChange = (Math.random() - 0.5) * 5;
      const priceChange = (Math.random() - 0.5) * 2;
      const ratingChange = (Math.random() - 0.5) * 0.2;
      
      updatedData.set(productId, {
        stockCount: Math.max(0, Math.floor(data.stockCount + stockChange)),
        currentPrice: Math.max(0, data.currentPrice + priceChange),
        discount: Math.max(0, Math.min(50, data.discount + (Math.random() - 0.5) * 5)),
        rating: Math.max(1, Math.min(5, data.rating + ratingChange)),
        reviewCount: data.reviewCount + Math.floor(Math.random() * 3)
      });
    });
    
    this.liveData.set(updatedData);
  }

  private simulateUserActivity() {
    // Simulate user interactions
    setInterval(() => {
      if (Math.random() > 0.7) {
        this.cartCount.update(count => count + 1);
      }
      if (Math.random() > 0.8) {
        this.wishlistCount.update(count => count + 1);
      }
    }, 10000);
  }

  // Mixed SSR/CSR Methods
  protected filterByCategory(category: string) {
    this.selectedCategory.set(category);
  }

  protected setViewMode(mode: 'grid' | 'list') {
    this.viewMode.set(mode);
  }

  protected setSortBy(sort: 'name' | 'price' | 'rating') {
    this.sortBy.set(sort);
  }

  protected toggleStockFilter() {
    this.showOnlyInStock.update(show => !show);
  }

  protected addToCart(productId: number) {
    this.cartCount.update(count => count + 1);
    // Simulate API call
    console.log(`Added product ${productId} to cart`);
  }

  protected addToWishlist(productId: number) {
    this.wishlistCount.update(count => count + 1);
    // Simulate API call
    console.log(`Added product ${productId} to wishlist`);
  }

  protected get filteredAndSortedProducts() {
    let filtered = this.products();
    
    // Apply category filter
    const category = this.selectedCategory();
    if (category !== 'all') {
      filtered = filtered.filter(product => product.category === category);
    }
    
    // Apply stock filter (CSR feature)
    if (this.showOnlyInStock()) {
      filtered = filtered.filter(product => product.inStock);
    }
    
    // Apply sorting (CSR feature)
    const sortBy = this.sortBy();
    filtered = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'price':
          return a.price - b.price;
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
        case 'name':
        default:
          return a.name.localeCompare(b.name);
      }
    });
    
    return filtered;
  }

  protected getLiveData(productId: number): LiveData | undefined {
    return this.liveData().get(productId);
  }

  protected getDiscountPercentage(originalPrice: number, currentPrice: number): number {
    return Math.round(((originalPrice - currentPrice) / originalPrice) * 100);
  }

  protected formatPrice(price: number): string {
    return `$${price.toFixed(2)}`;
  }

  protected getStockStatus(stockCount: number): { status: string; color: string } {
    if (stockCount === 0) return { status: 'Out of Stock', color: '#dc2626' };
    if (stockCount < 5) return { status: 'Low Stock', color: '#d97706' };
    return { status: 'In Stock', color: '#059669' };
  }
}
