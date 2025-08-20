## SSR vs CSR: Live Code Walkthrough (Angular 20)

Audience: Devs/Product, 15–20 mins. Goal: Show the practical differences between CSR and SSR using this repo’s real code, then run and verify both.

### Agenda
- Why SSR vs CSR (1 min)
- Where CSR/SSR happen in code (5 mins)
- Server setup and routing (4 mins)
- Hydration and SSR-aware components (4 mins)
- Run and verify (3–5 mins)

### 1) What is SSR vs CSR (Say this)
- CSR: Server sends a shell; browser downloads JS and renders everything.
- SSR: Server renders HTML for the route; browser hydrates to add interactivity.

Diagram:
```
Request → [Server renders HTML] → Response (HTML) → [Browser hydrates + takes over]
```

### 2) Entry points: CSR vs SSR (Show + say)
- CSR boots in the browser from `src/main.ts`.
- SSR boots on the server from `src/main.server.ts`.

```1:6:src/main.ts
import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';

bootstrapApplication(App, appConfig)
  .catch((err) => console.error(err));
```

Speaker note: “This is the CSR entry. The browser downloads JS, calls `bootstrapApplication`, and renders the app client-side.”

```1:8:src/main.server.ts
// Import the bootstrap function for server-side application startup
import { bootstrapApplication } from '@angular/platform-browser';
// Import the main App component
import { App } from './app/app';
// Import the merged server configuration
import { config } from './app/app.config.server';

const bootstrap = () => bootstrapApplication(App, config);
export default bootstrap;
```

Speaker note: “This is the SSR entry used by the Angular SSR engine to render HTML on the server.”

### 3) Server: Express + Angular SSR (Show + say)
- `src/server.ts` serves static assets and delegates non-static requests to Angular SSR.

```40:58:src/server.ts
/**
 * Static File Serving Middleware
 */
app.use(
  express.static(browserDistFolder, {
    maxAge: '1y',
    index: false,
    redirect: false,
  }),
);
```

```60:82:src/server.ts
/**
 * Angular SSR Middleware
 */
app.use((req, res, next) => {
  angularApp
    .handle(req)
    .then((response) => {
      response ? writeResponseToNodeResponse(response, res) : next();
    })
    .catch(next);
});
```

Speaker note: “If it isn’t a static file, Angular renders the route and returns fully formed HTML.”

### 4) App configuration: client vs server (Show + say)
- Client config enables routing and hydration with event replay.

```21:39:src/app/app.config.ts
export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(routes),
    provideClientHydration(withEventReplay())
  ]
};
```

- Server config adds SSR providers and merges with the client config.

```19:24:src/app/app.config.server.ts
const serverConfig: ApplicationConfig = {
  providers: [
    provideServerRendering(withRoutes(serverRoutes))
  ]
};
```

```36:36:src/app/app.config.server.ts
export const config = mergeApplicationConfig(appConfig, serverConfig);
```

Speaker note: “Same app, different providers for client and server. SSR uses the merged config.”

### 5) Routing: client and server perspectives (Show + say)
- Client routes (SPA navigation after hydration):

```30:47:src/app/app.routes.ts
export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'products', component: ProductsComponent },
  { path: 'about', component: AboutComponent },
  { path: 'contact', component: ContactComponent },
  { path: 'reports', component: ReportsComponent },
  { path: 'ssr-demo', component: SsrDemoComponent },
  { path: '**', redirectTo: '' }
];
```

- Server routes (what gets rendered on the server):

```14:23:src/app/app.routes.server.ts
export const serverRoutes: ServerRoute[] = [
  {
    path: '**',
    renderMode: RenderMode.Prerender,
  }
];
```

Speaker note: “This setup pre-renders everything for fast, SEO-friendly first paint.”

### 6) Component: SSR-awareness and hydration (Show + say)
- `SsrDemoComponent` demonstrates environment guards and hydration state.

```80:90:src/app/ssr-demo/ssr-demo.component.ts
constructor(private route: ActivatedRoute) {}
protected readonly isServer = signal(typeof window === 'undefined');
private readonly isBrowser = typeof window !== 'undefined';
```

```220:231:src/app/ssr-demo/ssr-demo.component.ts
ngAfterViewInit() {
  if (this.isBrowser) {
    setTimeout(() => {
      this.markAsHydrated();
    }, 100);
  }
}
```

Speaker note: “SSR renders content; after JS loads, we mark the app hydrated and enable interactivity.”

### 7) Run the demo (commands to show)
- CSR (dev, browser rendering only):
```bash
npm start
```

- SSR (production-like):
```bash
npm run build
npm run serve:ssr:angular-ssr-app
```

Speaker notes:
- “With CSR dev, view-source shows an empty `<app-root>` initially.”
- “With SSR, view-source shows fully rendered HTML.”

### 8) Verify SSR quickly
- Disable JavaScript in DevTools, refresh → content still visible (SSR proof).
- Right-click → View Page Source → search for real page content.

### 9) When to use which (Say this)
- SSR for marketing/SEO-critical pages, fast first paint, social embeds.
- CSR for dashboards/internal tools where SEO doesn’t matter.
- Hybrid: SSR first load + CSR SPA navigation for the best of both worlds.

### 10) References in this repo
- `src/main.ts` — CSR entry
- `src/main.server.ts` — SSR entry
- `src/server.ts` — Express + Angular SSR engine
- `src/app/app.config.ts` — client providers + hydration
- `src/app/app.config.server.ts` — server providers + merge
- `src/app/app.routes.ts` and `src/app/app.routes.server.ts` — routing
- `src/app/ssr-demo/ssr-demo.component.*` — SSR-aware UI demo
- See also: `SSR_CSR_SUMMARY.md` for a deeper written guide


