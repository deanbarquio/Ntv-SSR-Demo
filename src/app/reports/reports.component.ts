// Import Angular core modules for component functionality
import { Component, signal, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
// Import common directives for template functionality
import { CommonModule } from '@angular/common';

/**
 * Report Data Interface - Defines the structure of report data
 * This interface is used for both SSR (static) and CSR (dynamic) report data
 */
interface ReportData {
  id: number;
  title: string;
  value: number;
  change: number;
  category: string;
  timestamp: string;
}

/**
 * Performance Metric Interface - Defines performance comparison data
 * This interface compares SSR vs CSR performance metrics
 */
interface PerformanceMetric {
  name: string;
  ssr: number;
  csr: number;
  unit: string;
}

/**
 * Reports Component - SSR vs CSR Performance Monitoring Demonstration
 * 
 * This component demonstrates a real-time dashboard scenario with both
 * server-rendered static content and client-side dynamic monitoring.
 * 
 * SSR Features (Server-Rendered):
 * - Static report structure and layout
 * - Initial performance metrics
 * - SEO-friendly dashboard content
 * - Server-side data aggregation
 * 
 * CSR Features (Client-Side):
 * - Real-time data streaming
 * - Live performance monitoring
 * - Dynamic chart updates
 * - Interactive dashboard controls
 * - Connection status monitoring
 * 
 * Key SSR/CSR Patterns:
 * 1. Hybrid dashboard approach
 * 2. Real-time data synchronization
 * 3. Performance comparison (SSR vs CSR)
 * 4. Progressive enhancement of static content
 * 5. Connection resilience and status monitoring
 * 6. Hydration status tracking and visualization
 */
@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './reports.component.html',
  styleUrl: './reports.component.scss'
})
export class ReportsComponent implements OnInit, OnDestroy, AfterViewInit {
  // SSR Detection Signal: Determines execution environment
  protected readonly isServer = signal(typeof window === 'undefined');
  
  // Mixed SSR/CSR Signal: Initial time rendered on server, updated on client
  protected readonly currentTime = signal(new Date().toLocaleString());
  
  // Hydration Status Signals
  protected readonly isHydrated = signal(false);
  protected readonly hydrationTime = signal<number | null>(null);
  protected readonly hydrationDuration = signal<number | null>(null);
  
  // Hydration Animation States
  protected readonly hydrationPhase = signal<'server' | 'loading' | 'hydrated'>('server');
  
  // ===== CSR SIGNALS (Dynamic data updated on client) =====
  // These signals contain data that's only available after client hydration
  // and provide real-time, interactive dashboard features
  
  protected readonly loading = signal(true);
  protected readonly activeTab = signal('overview');
  protected readonly dataUpdateCount = signal(0);
  protected readonly realTimeStatus = signal('Inactive');
  protected readonly liveMetrics = signal<{ name: string; value: number; trend: 'up' | 'down' | 'stable' }[]>([]);
  
  // ===== MIXED SSR/CSR SIGNALS =====
  // These signals work on both server and client, but have different behaviors
  // Server: Initial static data rendered
  // Client: Dynamic data with real-time updates
  
  protected readonly reports = signal<ReportData[]>([]);
  protected readonly performanceMetrics = signal<PerformanceMetric[]>([]);
  protected readonly realTimeData = signal<number[]>([]);
  protected readonly chartData = signal<{ label: string; value: number }[]>([]);
  protected readonly serverLoadTime = signal(0);
  protected readonly clientLoadTime = signal(0);
  protected readonly connectionStatus = signal('Connected');
  protected readonly dataStreamRate = signal(0);
  
  // ===== PRIVATE PROPERTIES =====
  // Interval IDs for cleanup to prevent memory leaks
  private intervalId?: number;
  private realTimeIntervalId?: number;
  private startTime = Date.now();
  private updateCounter = 0;
  
  // Track when component was created (for hydration timing)
  private readonly componentCreated = Date.now();

  /**
   * Component Initialization - Lifecycle Hook
   * 
   * This method demonstrates the SSR/CSR initialization pattern for a dashboard:
   * - Server-side: Load static data and initial metrics
   * - Client-side: Initialize real-time monitoring and data streaming
   */
  ngOnInit() {
    this.startTime = Date.now();
    this.loadInitialData();
    
    // Set initial hydration phase based on environment
    if (typeof window === 'undefined') {
      this.hydrationPhase.set('server');
    } else {
      this.hydrationPhase.set('loading');
    }
    
    // Client-side only: Initialize real-time features
    // This ensures server-side rendering doesn't include client-specific code
    if (typeof window !== 'undefined') {
      // Main updates every 2 seconds - simulates dashboard refresh
      this.intervalId = window.setInterval(() => {
        this.currentTime.set(new Date().toLocaleString());
        this.updateRealTimeData();
        this.dataUpdateCount.update(count => count + 1);
        this.updateCounter++;
      }, 2000);

      // Real-time streaming simulation every 500ms - simulates live data feed
      this.realTimeIntervalId = window.setInterval(() => {
        this.updateLiveMetrics();
        this.dataStreamRate.update(rate => rate + 1);
        this.realTimeStatus.set('Active');
      }, 500);

      // Simulate connection status changes - demonstrates resilience
      setInterval(() => {
        this.connectionStatus.set(Math.random() > 0.95 ? 'Reconnecting...' : 'Connected');
      }, 10000);
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
   * This is especially important for CSR features that use multiple timers
   */
  ngOnDestroy() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
    if (this.realTimeIntervalId) {
      clearInterval(this.realTimeIntervalId);
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
    console.log(`📊 Reports Hydration completed in ${duration}ms`);
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
   * Load Initial Data - SSR/CSR Hybrid Method
   * 
   * This method demonstrates different loading strategies:
   * - Server-side: Immediate data loading (fast initial render)
   * - Client-side: Simulated API delay (realistic user experience)
   */
  private loadInitialData() {
    // Simulate different load times for SSR vs CSR
    const loadTime = Date.now() - this.startTime;
    
    if (typeof window !== 'undefined') {
      // Client-side: simulate API delay for realistic experience
      this.clientLoadTime.set(loadTime);
      setTimeout(() => {
        this.loadData();
        this.loading.set(false);
        this.initializeLiveMetrics();
      }, 800);
    } else {
      // Server-side: immediate data loading for fast initial render
      this.serverLoadTime.set(loadTime);
      this.loadData();
      this.loading.set(false);
    }
  }

  private initializeLiveMetrics() {
    const initialMetrics = [
      { name: 'CPU Usage', value: 45, trend: 'stable' as const },
      { name: 'Memory Usage', value: 62, trend: 'up' as const },
      { name: 'Network Latency', value: 28, trend: 'down' as const },
      { name: 'Active Users', value: 1234, trend: 'up' as const },
      { name: 'Requests/sec', value: 156, trend: 'up' as const },
      { name: 'Error Rate', value: 0.2, trend: 'stable' as const }
    ];
    this.liveMetrics.set(initialMetrics);
  }

  private updateLiveMetrics() {
    const currentMetrics = this.liveMetrics();
    const updatedMetrics = currentMetrics.map(metric => {
      const change = (Math.random() - 0.5) * 10;
      const newValue = Math.max(0, Math.min(100, metric.value + change));
      
      let trend: 'up' | 'down' | 'stable' = 'stable';
      if (change > 2) trend = 'up';
      else if (change < -2) trend = 'down';
      
      return {
        ...metric,
        value: Math.round(newValue * 10) / 10,
        trend
      };
    });
    
    this.liveMetrics.set(updatedMetrics);
  }

  private loadData() {
    // Generate dynamic data based on current time
    const now = new Date();
    const timeBasedSeed = now.getHours() * 60 + now.getMinutes();
    
    const mockReports: ReportData[] = [
      {
        id: 1,
        title: 'Page Load Time',
        value: this.generateDynamicValue(1.0, 2.5, timeBasedSeed),
        change: this.generateDynamicValue(-20, 10, timeBasedSeed + 1),
        category: 'Performance',
        timestamp: now.toISOString()
      },
      {
        id: 2,
        title: 'SEO Score',
        value: this.generateDynamicValue(85, 100, timeBasedSeed + 2),
        change: this.generateDynamicValue(-5, 15, timeBasedSeed + 3),
        category: 'SEO',
        timestamp: now.toISOString()
      },
      {
        id: 3,
        title: 'User Engagement',
        value: this.generateDynamicValue(60, 95, timeBasedSeed + 4),
        change: this.generateDynamicValue(-10, 25, timeBasedSeed + 5),
        category: 'Analytics',
        timestamp: now.toISOString()
      },
      {
        id: 4,
        title: 'Conversion Rate',
        value: this.generateDynamicValue(1.5, 8.0, timeBasedSeed + 6),
        change: this.generateDynamicValue(-3, 12, timeBasedSeed + 7),
        category: 'Business',
        timestamp: now.toISOString()
      },
      {
        id: 5,
        title: 'Core Web Vitals',
        value: this.generateDynamicValue(75, 98, timeBasedSeed + 8),
        change: this.generateDynamicValue(-8, 20, timeBasedSeed + 9),
        category: 'Performance',
        timestamp: now.toISOString()
      },
      {
        id: 6,
        title: 'Accessibility Score',
        value: this.generateDynamicValue(90, 100, timeBasedSeed + 10),
        change: this.generateDynamicValue(-2, 8, timeBasedSeed + 11),
        category: 'Accessibility',
        timestamp: now.toISOString()
      }
    ];

    // Generate dynamic performance metrics
    const mockPerformanceMetrics: PerformanceMetric[] = [
      { 
        name: 'First Contentful Paint', 
        ssr: this.generateDynamicValue(0.5, 1.2, timeBasedSeed + 12), 
        csr: this.generateDynamicValue(1.8, 4.0, timeBasedSeed + 13), 
        unit: 's' 
      },
      { 
        name: 'Largest Contentful Paint', 
        ssr: this.generateDynamicValue(0.8, 1.8, timeBasedSeed + 14), 
        csr: this.generateDynamicValue(2.5, 5.0, timeBasedSeed + 15), 
        unit: 's' 
      },
      { 
        name: 'Cumulative Layout Shift', 
        ssr: this.generateDynamicValue(0.02, 0.08, timeBasedSeed + 16), 
        csr: this.generateDynamicValue(0.08, 0.25, timeBasedSeed + 17), 
        unit: '' 
      },
      { 
        name: 'Time to Interactive', 
        ssr: this.generateDynamicValue(1.0, 2.0, timeBasedSeed + 18), 
        csr: this.generateDynamicValue(3.0, 6.0, timeBasedSeed + 19), 
        unit: 's' 
      },
      { 
        name: 'SEO Indexability', 
        ssr: this.generateDynamicValue(95, 100, timeBasedSeed + 20), 
        csr: this.generateDynamicValue(50, 80, timeBasedSeed + 21), 
        unit: '%' 
      }
    ];

    // Generate dynamic chart data
    const mockChartData = [
      { label: 'SSR', value: this.generateDynamicValue(85, 98, timeBasedSeed + 22) },
      { label: 'CSR', value: this.generateDynamicValue(60, 85, timeBasedSeed + 23) },
      { label: 'Hybrid', value: this.generateDynamicValue(75, 92, timeBasedSeed + 24) }
    ];

    // Generate initial real-time data
    const initialRealTimeData = Array.from({ length: 6 }, (_, i) => 
      this.generateDynamicValue(50, 100, timeBasedSeed + 25 + i)
    );

    this.reports.set(mockReports);
    this.performanceMetrics.set(mockPerformanceMetrics);
    this.chartData.set(mockChartData);
    this.realTimeData.set(initialRealTimeData);
  }

  private generateDynamicValue(min: number, max: number, seed: number): number {
    // Simple pseudo-random generator based on seed
    const x = Math.sin(seed) * 10000;
    const random = x - Math.floor(x);
    return Math.round((min + random * (max - min)) * 10) / 10;
  }

  private updateRealTimeData() {
    const currentData = this.realTimeData();
    const now = Date.now();
    const newData = currentData.map((value, index) => {
      const seed = now + index;
      const change = (Math.sin(seed / 1000) * 10);
      return Math.max(30, Math.min(100, value + change));
    });
    this.realTimeData.set(newData);
  }

  protected setActiveTab(tab: string) {
    this.activeTab.set(tab);
  }

  protected get filteredReports() {
    const tab = this.activeTab();
    if (tab === 'overview') {
      return this.reports();
    }
    return this.reports().filter(report => report.category.toLowerCase() === tab);
  }

  protected getPerformanceDifference(metric: PerformanceMetric) {
    const difference = metric.ssr - metric.csr;
    const percentage = (difference / metric.csr) * 100;
    return {
      value: Math.abs(difference),
      percentage: Math.abs(percentage),
      isBetter: difference < 0
    };
  }

  protected formatTimestamp(timestamp: string): string {
    return new Date(timestamp).toLocaleTimeString();
  }

  protected get loadTimeDifference() {
    const serverTime = this.serverLoadTime();
    const clientTime = this.clientLoadTime();
    if (serverTime > 0 && clientTime > 0) {
      return ((clientTime - serverTime) / serverTime * 100).toFixed(1);
    }
    return '0';
  }

  protected refreshData() {
    this.loading.set(true);
    this.startTime = Date.now();
    setTimeout(() => {
      this.loadData();
      this.loading.set(false);
    }, 500);
  }

  protected getTrendIcon(trend: 'up' | 'down' | 'stable'): string {
    switch (trend) {
      case 'up': return '📈';
      case 'down': return '📉';
      case 'stable': return '➡️';
    }
  }

  protected getTrendColor(trend: 'up' | 'down' | 'stable'): string {
    switch (trend) {
      case 'up': return '#059669';
      case 'down': return '#dc2626';
      case 'stable': return '#64748b';
    }
  }
}
