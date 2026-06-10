import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { Router } from '@vaadin/router';
import './views/view-expenses';
import './views/view-goals';
import './views/view-reports';
import './views/view-categories';
import './views/view-rules';
import './views/view-settings';
import './views/view-login';
import './views/view-setup';

import { i18n } from './i18n/i18n';
import { api } from './api/client';
import { getAppBasePath, getAppPath, getCanonicalAppUrl } from './utils/router-paths';

@customElement('priperfin-app')
export class PriPerFinApp extends LitElement {
  static styles = css`
    :host {
      /* Color Palette (Based on a Blue M3 Theme) */
      --md-sys-color-primary: #006493;
      --md-sys-color-on-primary: #ffffff;
      --md-sys-color-primary-container: #cae6ff;
      --md-sys-color-on-primary-container: #001e30;
      
      --md-sys-color-secondary: #50606e;
      --md-sys-color-on-secondary: #ffffff;
      --md-sys-color-secondary-container: #d3e5f5;
      --md-sys-color-on-secondary-container: #0c1d29;
      
      --md-sys-color-tertiary: #65587b;
      --md-sys-color-on-tertiary: #ffffff;
      --md-sys-color-tertiary-container: #ebddff;
      --md-sys-color-on-tertiary-container: #211634;

      --md-sys-color-error: #ba1a1a;
      --md-sys-color-on-error: #ffffff;
      --md-sys-color-error-container: #ffdad6;
      --md-sys-color-on-error-container: #410002;
      
      --md-sys-color-surface: #f8f9ff;
      --md-sys-color-on-surface: #191c20;
      --md-sys-color-surface-variant: #dee3eb;
      --md-sys-color-on-surface-variant: #42474e;
      
      --md-sys-color-surface-container-lowest: #ffffff;
      --md-sys-color-surface-container-low: #f2f4f8;
      --md-sys-color-surface-container: #eceef2;
      --md-sys-color-surface-container-high: #e6e8ec;
      --md-sys-color-surface-container-highest: #e1e3e7;

      --md-sys-color-outline: #72777f;
      --md-sys-color-outline-variant: #c2c7cf;

      /* Typography - Type Scale */
      --md-sys-typescale-display-large: 400 57px/64px 'Roboto', sans-serif;
      --md-sys-typescale-display-medium: 400 45px/52px 'Roboto', sans-serif;
      --md-sys-typescale-display-small: 400 36px/44px 'Roboto', sans-serif;

      --md-sys-typescale-headline-large: 400 32px/40px 'Roboto', sans-serif;
      --md-sys-typescale-headline-medium: 400 28px/36px 'Roboto', sans-serif;
      --md-sys-typescale-headline-small: 400 24px/32px 'Roboto', sans-serif;

      --md-sys-typescale-title-large: 400 22px/28px 'Roboto', sans-serif;
      --md-sys-typescale-title-medium: 500 16px/24px 'Roboto', sans-serif;
      --md-sys-typescale-title-small: 500 14px/20px 'Roboto', sans-serif;

      --md-sys-typescale-label-large: 500 14px/20px 'Roboto', sans-serif;
      --md-sys-typescale-label-medium: 500 12px/16px 'Roboto', sans-serif;
      --md-sys-typescale-label-small: 500 11px/16px 'Roboto', sans-serif;

      --md-sys-typescale-body-large: 400 16px/24px 'Roboto', sans-serif;
      --md-sys-typescale-body-medium: 400 14px/20px 'Roboto', sans-serif;
      --md-sys-typescale-body-small: 400 12px/16px 'Roboto', sans-serif;

      /* Shapes */
      --md-sys-shape-corner-extra-small: 4px;
      --md-sys-shape-corner-small: 8px;
      --md-sys-shape-corner-medium: 12px;
      --md-sys-shape-corner-large: 16px;
      --md-sys-shape-corner-extra-large: 28px;
      --md-sys-shape-corner-full: 999px;

      display: flex;
      height: 100vh; /* Fallback */
      height: 100dvh; /* Dynamic viewport height */
      font-family: 'Roboto', sans-serif;
      background-color: var(--md-sys-color-surface);
      color: var(--md-sys-color-on-surface);
      overflow: hidden;
    }

    /* Dark Mode (System Preferred OR Manual Override) */
    :host([data-theme="dark"]) {
        --md-sys-color-primary: #9ecaff;
        --md-sys-color-on-primary: #003258;
        --md-sys-color-primary-container: #00497d;
        --md-sys-color-on-primary-container: #cae6ff;

        --md-sys-color-secondary: #baccfa;
        --md-sys-color-on-secondary: #213242;
        --md-sys-color-secondary-container: #38495a;
        --md-sys-color-on-secondary-container: #d3e5f5;

        --md-sys-color-tertiary: #d0bcff;
        --md-sys-color-on-tertiary: #381e72;
        --md-sys-color-tertiary-container: #4f378b;
        --md-sys-color-on-tertiary-container: #ebddff;

        --md-sys-color-error: #ffb4ab;
        --md-sys-color-on-error: #690005;
        --md-sys-color-error-container: #93000a;
        --md-sys-color-on-error-container: #ffdad6;

        --md-sys-color-surface: #191c20;
        --md-sys-color-on-surface: #e1e2e6;
        --md-sys-color-surface-variant: #42474e;
        --md-sys-color-on-surface-variant: #c2c7cf;

        --md-sys-color-surface-container-lowest: #0c0f13;
        --md-sys-color-surface-container-low: #191c20;
        --md-sys-color-surface-container: #1d2024;
        --md-sys-color-surface-container-high: #272a2f;
        --md-sys-color-surface-container-highest: #32353a;

        --md-sys-color-outline: #8c9199;
        --md-sys-color-outline-variant: #42474e;
    }

    @media (prefers-color-scheme: dark) {
      :host(:not([data-theme="light"])) {
        --md-sys-color-primary: #9ecaff;
        --md-sys-color-on-primary: #003258;
        --md-sys-color-primary-container: #00497d;
        --md-sys-color-on-primary-container: #cae6ff;

        --md-sys-color-secondary: #baccfa;
        --md-sys-color-on-secondary: #213242;
        --md-sys-color-secondary-container: #38495a;
        --md-sys-color-on-secondary-container: #d3e5f5;

        --md-sys-color-tertiary: #d0bcff;
        --md-sys-color-on-tertiary: #381e72;
        --md-sys-color-tertiary-container: #4f378b;
        --md-sys-color-on-tertiary-container: #ebddff;

        --md-sys-color-error: #ffb4ab;
        --md-sys-color-on-error: #690005;
        --md-sys-color-error-container: #93000a;
        --md-sys-color-on-error-container: #ffdad6;

        --md-sys-color-surface: #191c20;
        --md-sys-color-on-surface: #e1e2e6;
        --md-sys-color-surface-variant: #42474e;
        --md-sys-color-on-surface-variant: #c2c7cf;

        --md-sys-color-surface-container-lowest: #0c0f13;
        --md-sys-color-surface-container-low: #191c20;
        --md-sys-color-surface-container: #1d2024;
        --md-sys-color-surface-container-high: #272a2f;
        --md-sys-color-surface-container-highest: #32353a;

        --md-sys-color-outline: #8c9199;
        --md-sys-color-outline-variant: #42474e;
      }
    }

    /* Desktop: Navigation Rail */
    nav {
      width: 80px;
      background: var(--md-sys-color-surface); /* Nav Rail matches surface in some configs, or surface-container */
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 2rem 0;
      gap: 12px; /* M3 spec gap */
      z-index: 2;
    }
    
    .nav-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 4px;
      text-decoration: none;
      color: var(--md-sys-color-on-surface-variant);
      width: 56px;
      height: 56px; /* Target size */
      padding: 4px 0;
      border-radius: 0; 
      transition: color 0.2s;
    }
    
    .icon-container {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 56px;
        height: 32px;
        border-radius: 16px; /* Stadium shape */
        transition: background-color 0.2s, color 0.2s;
    }

    .nav-item:hover .icon-container {
      background-color: var(--md-sys-color-surface-container-highest);
      color: var(--md-sys-color-on-surface);
    }
    
    .nav-item.active {
      color: var(--md-sys-color-on-surface);
    }

    .nav-item.active .icon-container {
      background-color: var(--md-sys-color-secondary-container);
      color: var(--md-sys-color-on-secondary-container);
    }
    
    .nav-item.active .material-symbols-outlined {
      font-variation-settings: 'FILL' 1;
    }

    .material-symbols-outlined {
      font-family: 'Material Symbols Outlined';
      font-weight: normal;
      font-style: normal;
      font-size: 24px;
      display: inline-block;
      line-height: 1;
      text-transform: none;
      letter-spacing: normal;
      word-wrap: normal;
      white-space: nowrap;
      direction: ltr;
    }
    
    .nav-label {
      font: var(--md-sys-typescale-label-medium);
      text-align: center;
    }

    main {
      flex: 1;
      padding: 1.5rem 2rem;
      overflow-y: auto;
      width: 100%;
      box-sizing: border-box;
      background-color: var(--md-sys-color-surface);
      border-top-left-radius: 28px; /* Optional: distinctive M3 shape for content area if nav is side */
    }

    /* Full width when nav is hidden (login/setup pages) */
    :host(:not([data-show-nav])) main {
      border-radius: 0;
    }

    /* Mobile: Bottom Navigation Bar */
    @media (max-width: 600px) {
      :host {
        flex-direction: column-reverse; /* Nav at bottom */
      }
      
      nav {
        width: 100%;
        height: calc(64px + env(safe-area-inset-bottom, 0px));
        flex-direction: row;
        justify-content: space-evenly; /* Spread evenly */
        padding: 0;
        padding-bottom: env(safe-area-inset-bottom, 0px);
        background: var(--md-sys-color-surface-container);
        box-sizing: border-box;
      }
      
      .nav-item {
        width: auto;
        min-width: 48px;
        padding: 8px 0 10px 0;
        height: auto;
      }
      
      .icon-container {
        width: 64px; 
        height: 32px;
        border-radius: 16px;
      }
      
      main {
        padding: 1rem;
        padding-bottom: 40px; /* Reduced from 100px, 40px is reasonable spacing above the nav */
        border-radius: 0;
      }
    }
  `;

  @property({ type: String }) currentPath = '/';

  private syncCurrentPath(pathname = window.location.pathname) {
    this.currentPath = getAppPath(pathname, document.baseURI);
  }

  connectedCallback() {
    super.connectedCallback();

    const canonicalUrl = getCanonicalAppUrl(
      window.location.href,
      document.baseURI,
    );
    if (canonicalUrl) {
      console.log('[PriPerFin] Normalizing ingress root URL:', canonicalUrl);
      window.history.replaceState(window.history.state, '', canonicalUrl);
    }

    this.syncCurrentPath();
    
    console.log('[PriPerFin] App initialization started');
    console.log('[PriPerFin] Current location:', window.location.href);
    console.log('[PriPerFin] Base URI:', document.baseURI);
    
    // Global error handler
    window.addEventListener('error', (e) => {
      console.error('[PriPerFin] Global error:', e.error);
      console.error('[PriPerFin] Error message:', e.message);
      console.error('[PriPerFin] Error at:', e.filename, e.lineno, e.colno);
    });
    
    // Unhandled promise rejection handler
    window.addEventListener('unhandledrejection', (e) => {
      console.error('[PriPerFin] Unhandled promise rejection:', e.reason);
    });
    
    this.applyTheme(localStorage.getItem('priperfin_theme') || 'auto');
    window.addEventListener('theme-change', (e: any) => this.applyTheme(e.detail.theme));
    
    // Listen for session expiry
    window.addEventListener('session-expired', () => {
      console.log('[PriPerFin] Session expired, redirecting to login');
      const basePath = getAppBasePath(document.baseURI);
      window.location.href = new URL(basePath + 'login', window.location.origin).href;
    });
    
    // Listen for URL changes (including replaceState) to update navigation links
    const originalReplaceState = window.history.replaceState;
    window.history.replaceState = (...args) => {
      originalReplaceState.apply(window.history, args);
      this.syncCurrentPath();
      this.requestUpdate(); // Re-render navigation links with new query params
    };
    
    console.log('[PriPerFin] App initialization complete');
  }

  applyTheme(theme: string) {
    if (theme === 'dark') {
      this.setAttribute('data-theme', 'dark');
    } else if (theme === 'light') {
      this.setAttribute('data-theme', 'light');
    } else {
      this.removeAttribute('data-theme'); // Auto (system)
    }
  }

  // Get current query params to preserve time and account filters across navigation
  private getCurrentQueryParams(): string {
    const params = new URLSearchParams(window.location.search);
    const preservedParams = new URLSearchParams();
    
    // Preserve time-related filters
    if (params.has('mode')) preservedParams.set('mode', params.get('mode')!);
    if (params.has('month')) preservedParams.set('month', params.get('month')!);
    if (params.has('year')) preservedParams.set('year', params.get('year')!);
    if (params.has('startDate')) preservedParams.set('startDate', params.get('startDate')!);
    if (params.has('endDate')) preservedParams.set('endDate', params.get('endDate')!);
    
    // Preserve account filter
    if (params.has('accountId')) preservedParams.set('accountId', params.get('accountId')!);
    
    const queryString = preservedParams.toString();
    return queryString ? `?${queryString}` : '';
  }

  // Auth guard helper
  private authGuard(_context: any, commands: any) {
    const hasSession = api.hasSession();
    console.log('[AuthGuard] Checking session. hasSession =', hasSession, 'token =', localStorage.getItem('session_token'));
    if (!hasSession) {
      console.log('[AuthGuard] Redirecting to /login');
      return commands.redirect('/login');
    }
    console.log('[AuthGuard] Allowing navigation to protected route');
  }

  async firstUpdated() {
    console.log('[PriPerFin] Setting up router');
    const outlet = this.shadowRoot?.querySelector('#outlet');
    console.log('[PriPerFin] Router outlet:', outlet);
    
    if (!outlet) {
      console.error('[PriPerFin] FATAL: Router outlet not found!');
      return;
    }
    
    const router = new Router(outlet);
    router.setRoutes([
      // Public routes (no auth required)
      { path: '/setup', component: 'view-setup' },
      { path: '/login', component: 'view-login' },
      // Protected routes (auth required)
      { path: '', action: this.authGuard.bind(this), component: 'view-expenses' },
      { path: '/', action: this.authGuard.bind(this), component: 'view-expenses' },
      { path: '/goals', action: this.authGuard.bind(this), component: 'view-goals' },
      { path: '/reports', action: this.authGuard.bind(this), component: 'view-reports' },
      { path: '/categories', action: this.authGuard.bind(this), component: 'view-categories' },
      { path: '/rules', action: this.authGuard.bind(this), component: 'view-rules' },
      { path: '/settings', action: this.authGuard.bind(this), component: 'view-settings' },
    ]);

    console.log('[PriPerFin] Router configured successfully');

    // Listen to route changes to update active state and query params
    window.addEventListener('vaadin-router-location-changed', (e: any) => {
      console.log('[PriPerFin] Route changed to:', e.detail.location.pathname);
      this.syncCurrentPath(e.detail.location.pathname);
      this.requestUpdate(); // This will cause links to rebuild with new query params
    });
  }

  render() {
    // Hide navigation on login and setup pages
    const showNav = this.currentPath !== '/login' && this.currentPath !== '/setup';
    
    return html`
      ${showNav ? html`
        <nav>
          <a href="./${this.getCurrentQueryParams()}" class="nav-item ${this.currentPath === '/' ? 'active' : ''}">
              <div class="icon-container"><span class="material-symbols-outlined">receipt_long</span></div>
              <span class="nav-label">${i18n.t('nav.expenses')}</span>
          </a>
          <a href="goals" class="nav-item ${this.currentPath === '/goals' ? 'active' : ''}">
              <div class="icon-container"><span class="material-symbols-outlined">savings</span></div>
              <span class="nav-label">${i18n.t('nav.goals')}</span>
          </a>
          <a href="reports${this.getCurrentQueryParams()}" class="nav-item ${this.currentPath === '/reports' ? 'active' : ''}">
               <div class="icon-container"><span class="material-symbols-outlined">bar_chart</span></div>
               <span class="nav-label">${i18n.t('nav.reports')}</span>
          </a>
          <a href="categories" class="nav-item ${this.currentPath === '/categories' ? 'active' : ''}">
               <div class="icon-container"><span class="material-symbols-outlined">category</span></div>
               <span class="nav-label">${i18n.t('nav.categories')}</span>
          </a>
          <a href="rules" class="nav-item ${this.currentPath === '/rules' ? 'active' : ''}">
               <div class="icon-container"><span class="material-symbols-outlined">rule</span></div>
               <span class="nav-label">${i18n.t('nav.rules')}</span>
          </a>
          <a href="settings" class="nav-item ${this.currentPath === '/settings' ? 'active' : ''}">
               <div class="icon-container"><span class="material-symbols-outlined">settings</span></div>
               <span class="nav-label">${i18n.t('nav.settings')}</span>
          </a>
        </nav>
      ` : ''}
      <main id="outlet"></main>
    `;
  }
}
