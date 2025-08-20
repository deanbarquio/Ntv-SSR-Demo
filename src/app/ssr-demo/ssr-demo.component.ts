// Import Angular core modules for component functionality
import { Component, signal, OnInit, AfterViewInit } from '@angular/core';
// Import common directives for template functionality
import { CommonModule } from '@angular/common';
// Import router for route resolver data access
import { ActivatedRoute } from '@angular/router';
// ApexCharts (SSR-safe usage; only initialize in browser)
import { NgApexchartsModule, ApexAxisChartSeries, ApexChart, ApexXAxis, ApexDataLabels, ApexStroke, ApexTitleSubtitle, ApexTooltip, ApexNonAxisChartSeries, ApexResponsive, ApexLegend, ApexFill } from 'ng-apexcharts';

/**
 * Performance Graph Data Interface
 */
interface GraphData {
  label: string;
  value: number;
  color: string;
  trend: 'up' | 'down' | 'stable';
}

/**
 * Animation State Interface
 */
interface AnimationState {
  id: string;
  isActive: boolean;
  duration: number;
  delay: number;
}

/**
 * Error State Interface
 */
interface ErrorState {
  hasError: boolean;
  errorMessage: string;
  errorType: 'network' | 'server' | 'client' | 'none';
  retryCount: number;
}

// Chart options types
type LineChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  xaxis: ApexXAxis;
  stroke: ApexStroke;
  dataLabels: ApexDataLabels;
  title: ApexTitleSubtitle;
  tooltip: ApexTooltip;
  fill: ApexFill;
};

type DonutChartOptions = {
  series: ApexNonAxisChartSeries;
  chart: ApexChart;
  labels: string[];
  responsive: ApexResponsive[];
  legend: ApexLegend;
  title: ApexTitleSubtitle;
};

/**
 * SSR Demo Component - Server-Side Rendering Showcase
 * 
 * HOW SSR HANDLES THIS COMPONENT (high-level):
 * - Structure & Content (HTML) are rendered on the server so crawlers/users see complete content immediately.
 * - Animations are expressed via CSS classes. SSR outputs the classes, but the actual animation plays in the browser after hydration.
 * - Graphs render as regular HTML/CSS bars. Values are part of the server-rendered HTML → SEO-friendly, no JS needed to see them.
 * - Error fallback can be rendered by SSR (if an error state is present at render time), and is progressively enhanced on the client.
 * - After hydration, the client takes over interactivity (tab switching, toggles, retries) and live updates.
 */
@Component({
  selector: 'app-ssr-demo',
  standalone: true,
  imports: [CommonModule, NgApexchartsModule],
  templateUrl: './ssr-demo.component.html',
  styleUrl: './ssr-demo.component.scss'
})
export class SsrDemoComponent implements OnInit, AfterViewInit {

  constructor(private route: ActivatedRoute) {}

  /**
   * SSR DETECTION
   * - true during server-side render, false in the browser.
   * - Use this to guard any browser-only code (window, setInterval, etc.).
   */
  protected readonly isServer = signal(typeof window === 'undefined');
  private readonly isBrowser = typeof window !== 'undefined';
  
  /**
   * HYDRATION STATE
   * - SSR renders an initial HTML snapshot.
   * - During hydration the client re-binds events to that HTML.
   * - When isHydrated becomes true, the page is fully interactive.
   */
  protected readonly isHydrated = signal(false);
  protected readonly hydrationTime = signal<number | null>(null);
  protected readonly hydrationDuration = signal<number | null>(null);
  protected readonly hydrationPhase = signal<'server' | 'loading' | 'hydrated'>('server');
  
  /**
   * METRICS
   * - serverRenderTime can be known at request time (server).
   * - clientHydrationTime is measured in the browser after hydration starts.
   */
  protected readonly serverRenderTime = signal(0);
  protected readonly clientHydrationTime = signal(0);
  protected readonly totalLoadTime = signal(0);
  protected readonly seoScore = signal(100);
  protected readonly accessibilityScore = signal(95);
  protected readonly performanceScore = signal(88);
  
  /**
   * ANIMATIONS
   * - We only store flags/timing as data. SSR outputs these flags into HTML as classes.
   * - The visual animation is pure CSS and runs in the browser once styles apply (post-hydration).
   * - This keeps SSR deterministic (no timers/raf required on server to "play" anything).
   * - NOTE: Set isActive=true by default so animations are present in SSR HTML and play even with JS disabled.
   */
  protected readonly animationStates = signal<AnimationState[]>([
    { id: 'fade-in',  isActive: true, duration: 800, delay: 0 },
    { id: 'slide-up', isActive: true, duration: 600, delay: 200 },
    { id: 'scale-in', isActive: true, duration: 500, delay: 400 },
    { id: 'rotate-in',isActive: true, duration: 700, delay: 600 }
  ]);
  
  /**
   * GRAPHS (SSR fallback)
   * - Values are rendered into the DOM as numeric text and inline widths.
   * - SSR sends fully formed bars and labels: readable without JS and crawlable.
   * - SSR: resolver already has data → HTML contains the bars and values
   */
  protected readonly graphData = signal<GraphData[]>([]);

  /**
   * ApexCharts (client-only enhancement)
   * - We expose a flag hasApex for the template to switch from SSR fallback to Apex charts when in browser.
   */
  protected readonly hasApex = signal(false);
  protected lineChartOptions!: LineChartOptions;
  protected donutChartOptions!: DonutChartOptions;
  
  /**
   * ERROR FALLBACK
   * - If you set hasError=true on the server, SSR will output the fallback UI immediately.
   * - On the client, we enhance it with retry/dismiss actions post-hydration.
   */
  protected readonly errorState = signal<ErrorState>({
    hasError: false,
    errorMessage: '',
    errorType: 'none',
    retryCount: 0
  });
  
  // Loading UX shown during client-side hydration; SSR can directly output a "completed" state
  protected readonly isLoading = signal(true);
  protected readonly loadingProgress = signal(0);
  protected readonly loadingMessage = signal('Initializing SSR Demo...');
  
  // Client-only interactivity controls (tabs/toggles); SSR renders their initial state
  // Default the tab to 'animations' so animations are visible without any click and even when JS is disabled.
  protected readonly activeTab = signal('graphs');
  protected readonly showAnimations = signal(true);
  protected readonly showGraphs = signal(true);
  protected readonly showErrors = signal(false);
  
  // Component creation time for hydration timing
  private readonly componentCreated = Date.now();

  /**
   * Lifecycle (runs on server AND client)
   * - Keep this deterministic for SSR: do not depend on browser-only APIs without guards.
   * - We set initial states that SSR can serialize into HTML.
   */
  ngOnInit() {
    // SSR Normal example
    // SSR: resolver already has data → HTML contains the bars and values
    //rows = signal<{label:string; value:number}[]>(this.route.snapshot.data['data'] ?? []);

    /**
     * this.route.snapshot.data['data']
     * 👉 This gets the data fetched by the resolver (on the server, during SSR).
     * Example: [ {label: 'Alpha', value: 72}, {label: 'Beta', value: 35} ]
     * ?? []
     * 👉 Means “if there’s no data, use an empty array instead.”

     * signal<{label:string; value:number}[]>(...)
     * 👉 Wraps the data in an Angular signal, so the template can reactively update if the data changes.

     * rows
     * 👉 A variable holding the list of graph rows (each row = one bar with a label and a value).
     */

    //So in simple explanation
    // “Take the server-fetched data (the bars with values). If it’s missing, use an empty list. 
    // Store it in a reactive variable called rows so the HTML can show it.”

    // SSR: resolver already has data → HTML contains the bars and values
    const resolverData = this.route?.snapshot?.data['graphData'] ?? [
      { label: 'SSR Performance', value: 95, color: '#3b82f6', trend: 'up' },
      { label: 'SEO Optimization', value: 100, color: '#10b981', trend: 'stable' },
      { label: 'Initial Load', value: 88, color: '#f59e0b', trend: 'up' },
      { label: 'Core Web Vitals', value: 92, color: '#8b5cf6', trend: 'up' },
      { label: 'Accessibility', value: 97, color: '#06b6d4', trend: 'stable' },
      { label: 'Mobile Performance', value: 85, color: '#ef4444', trend: 'down' }
    ];
    this.graphData.set(resolverData);

    this.initializeComponent();
    this.simulateServerRendering();
    this.setupErrorHandling();

    // Initialize ApexCharts options in browser only
    if (this.isBrowser) {
      this.initCharts();
      this.hasApex.set(true);
    }
  }

  /**
   * Lifecycle (client-only execution)
   * - After the view is attached in the browser, mark hydration complete.
   * - From this point forward, the page behaves like a CSR app.
   */
  ngAfterViewInit() {
    if (this.isBrowser) {
      setTimeout(() => {
        this.markAsHydrated();
      }, 100);
    }
  }

  /** SSR-safe initialization **/
  private initializeComponent() {
    if (this.isServer()) {
      this.hydrationPhase.set('server');
    } else {
      this.hydrationPhase.set('loading');
    }

    if (this.isBrowser) {
      this.simulateLoading();
    } else {
      this.isLoading.set(false);
      this.loadingProgress.set(100);
      this.loadingMessage.set('Server rendering complete');
    }
  }

  /**
   * Initialize ApexCharts configs (browser only)
   */
  private initCharts() {
    this.lineChartOptions = {
      series: [
        {
          name: 'TTFB (ms)',
          data: [120, 110, 98, 140, 105, 90, 95]
        },
        {
          name: 'LCP (ms)',
          data: [950, 880, 820, 860, 790, 760, 730]
        }
      ],
      chart: {
        type: 'line',
        height: 320,
        toolbar: { show: false },
        background: 'whitesmoke'
      },
      dataLabels: { enabled: false },
      stroke: { curve: 'smooth', width: 3 },
      xaxis: { categories: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] },
      title: { text: 'Performance Over Time', style: { color: '#0f172a' } },
      tooltip: { theme: 'dark' },
      fill: { type: 'gradient', gradient: { shadeIntensity: 1, opacityFrom: 0.4, opacityTo: 0.1, stops: [0, 90, 100] } }
    };

    this.donutChartOptions = {
      series: [44, 55, 13, 33],
      chart: { type: 'donut', height: 320 },
      labels: ['SSR', 'CSR', 'Hybrid', 'Other'],
      responsive: [
        {
          breakpoint: 768,
          options: { chart: { width: '100%' }, legend: { position: 'bottom' } }
        }
      ],
      legend: { position: 'right', labels: { colors: '#e2e8f0' } },
      title: { text: 'Rendering Mix', style: { color: '#e2e8f0' } }
    };
  }

  /** Server render simulation (timings as data only) **/
  private simulateServerRendering() {
    const startTime = Date.now();
    setTimeout(() => {
      const renderTime = Date.now() - startTime;
      this.serverRenderTime.set(renderTime);
      this.activateAnimations();
      if (this.isBrowser) {
        this.simulateClientHydration();
      }
    }, 300);
  }

  /** Client hydration timing (client-only) **/
  private simulateClientHydration() {
    const startTime = Date.now();
    setTimeout(() => {
      const hydrationTime = Date.now() - startTime;
      this.clientHydrationTime.set(hydrationTime);
      this.totalLoadTime.set(this.serverRenderTime() + hydrationTime);
    }, 500);
  }

  /** Client-only loading bar polish **/
  private simulateLoading() {
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 15;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        this.isLoading.set(false);
        this.loadingMessage.set('SSR Demo ready!');
      }
      this.loadingProgress.set(Math.round(progress));
      if (progress < 30) this.loadingMessage.set('Initializing server rendering...');
      else if (progress < 60) this.loadingMessage.set('Generating static content...');
      else if (progress < 90) this.loadingMessage.set('Preparing client hydration...');
      else this.loadingMessage.set('Finalizing SSR demo...');
    }, 100);
  }

  /** Mark animation flags as active **/
  private activateAnimations() {
    // Reset animations first to ensure they trigger
    const animations = this.animationStates();
    const resetAnimations = animations.map((animation) => ({ ...animation, isActive: false }));
    this.animationStates.set(resetAnimations);
    
    // Then activate them with a small delay to ensure CSS classes are updated
    setTimeout(() => {
      const updatedAnimations = animations.map((animation) => ({ ...animation, isActive: true }));
      this.animationStates.set(updatedAnimations);
    }, 100);
  }

  /** Error handling hooks **/
  private setupErrorHandling() {
    if (this.isBrowser) {
      setTimeout(() => {
        if (Math.random() > 0.8) {
          this.simulateError();
        }
      }, 2000);
    }
  }

  /** Simulated error injection (client-only in this demo) **/
  private simulateError() {
    const errorTypes = ['network', 'server', 'client'] as const;
    const randomType = errorTypes[Math.floor(Math.random() * errorTypes.length)];
    this.errorState.set({
      hasError: true,
      errorMessage: this.getErrorMessage(randomType),
      errorType: randomType,
      retryCount: this.errorState().retryCount + 1
    });
  }

  private getErrorMessage(type: 'network' | 'server' | 'client'): string {
    switch (type) {
      case 'network': return 'Network connection error. Please check your internet connection.';
      case 'server': return 'Server temporarily unavailable. Please try again later.';
      case 'client': return 'Client-side error occurred. Refreshing the page may help.';
      default: return 'An unexpected error occurred.';
    }
  }

  /** Hydration boundary crossed (client-only) **/
  private markAsHydrated() {
    const now = Date.now();
    const duration = now - this.componentCreated;
    this.isHydrated.set(true);
    this.hydrationTime.set(now);
    this.hydrationDuration.set(duration);
    this.hydrationPhase.set('hydrated');
    console.log(`🎭 SSR Demo Hydration completed in ${duration}ms`);
    
    // Trigger animations after hydration if animations tab is active
    if (this.activeTab() === 'animations' && this.showAnimations()) {
      setTimeout(() => {
        this.activateAnimations();
      }, 500);
    }
  }

  // --- Client interactivity (CSR-only behaviors) ---
  protected retryOperation() {
    this.errorState.set({ hasError: false, errorMessage: '', errorType: 'none', retryCount: this.errorState().retryCount });
    setTimeout(() => { this.loadingMessage.set('Operation retried successfully!'); }, 1000);
  }

  protected toggleAnimations() { 
    this.showAnimations.update(show => !show); 
    // Trigger animations when showing
    if (this.showAnimations()) {
      setTimeout(() => {
        this.activateAnimations();
      }, 200);
    }
  }
  protected toggleGraphs() { this.showGraphs.update(show => !show); }

  protected toggleErrorDemo() {
    if (this.showErrors()) {
      this.showErrors.set(false);
      this.errorState.set({ hasError: false, errorMessage: '', errorType: 'none', retryCount: 0 });
    } else {
      this.showErrors.set(true);
      this.simulateError();
    }
  }

  protected setActiveTab(tab: string) { 
    this.activeTab.set(tab); 
    // Trigger animations when animations tab is selected
    if (tab === 'animations' && this.showAnimations()) {
      setTimeout(() => {
        this.activateAnimations();
      }, 300);
    }
  }

  protected getHydrationMessage(): string { if (this.isServer()) return 'Server-Side Rendering'; if (!this.isHydrated()) return 'Hydrating...'; return 'Fully Hydrated'; }
  protected getHydrationColor(): string { if (this.isServer()) return 'server'; if (!this.isHydrated()) return 'loading'; return 'hydrated'; }
  protected getHydrationDurationText(): string { const d = this.hydrationDuration(); if (d === null) return ''; return d < 1000 ? `${d}ms` : `${(d / 1000).toFixed(1)}s`; }

  protected getTrendIcon(trend: 'up' | 'down' | 'stable'): string { switch (trend) { case 'up': return '📈'; case 'down': return '📉'; case 'stable': return '➡️'; } }
  protected getTrendColor(trend: 'up' | 'down' | 'stable'): string { switch (trend) { case 'up': return '#10b981'; case 'down': return '#ef4444'; case 'stable': return '#6b7280'; } }
  protected getPerformanceStatus(score: number): { status: string; color: string } { 
    if (score >= 90) return { status: 'Excellent', color: '#10b981' }; 
    if (score >= 80) return { status: 'Good', color: '#f59e0b' }; 
    if (score >= 70) return { status: 'Fair', color: '#ef4444' }; 
    return { status: 'Poor', color: '#dc2626' }; 
  }
}
