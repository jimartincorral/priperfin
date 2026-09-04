import { LitElement, html, css, nothing } from 'lit';
import { customElement, state, query } from 'lit/decorators.js';
import { Chart, registerables } from 'chart.js';
import { SankeyController, Flow } from 'chartjs-chart-sankey';
import { api } from '../api/client';
import '../components/filterable-select';
import '../components/rule-editor';
import type { SelectOption } from '../components/filterable-select';
import {
  appBar,
  bottomSheet,
  icon,
  mobileUI,
  monthStepper,
  snackbar,
  watchMobileViewport,
  type SnackbarOptions,
} from '../styles/mobile-ui';

import { i18n } from '../i18n/i18n';

Chart.register(...registerables, SankeyController, Flow);

// Helper function to get text color from CSS variables for dark mode support
function getTextColor(): string {
  const color = getComputedStyle(document.documentElement)
    .getPropertyValue('--md-sys-color-on-surface')
    .trim();
  return color || '#e1e2e6'; // Fallback for dark mode
}

type DateFilterMode = 'month' | 'year' | 'custom' | 'all_time';

const CHART_PALETTE = [
  '#006493', // Primary
  '#65587b', // Tertiary
  '#16a34a', // Green
  '#eab308', // Yellow
  '#0ea5e9', // Sky
  '#8b5cf6', // Violet
  '#f43f5e', // Rose
  '#10b981', // Emerald
  '#f59e0b', // Amber
  '#6366f1', // Indigo
];

@customElement('view-reports')
export class ViewReports extends LitElement {
  @state() loading = false;
  @state() month = new Date().getMonth() + 1;
  @state() year = new Date().getFullYear();
  @state() dateFilterMode: DateFilterMode = 'month';
  @state() customStartDate = '';
  @state() customEndDate = '';
  @state() accounts: any[] = [];
  @state() selectedAccountId = '';
  @state() groupByCategory = false; // Toggle for parent category grouping
  @state() monthlyAverage = false; // Divide amounts by the months in the period
  @state() periodMonths = 1; // Months covered by the current period (for labels)
  @state() breakdownData: any[] = []; // Store raw API response
  @state() legendItems: any[] = []; // For custom legend rendering
  @state() sankeyData: { nodes: { id: string }[]; links: { source: string; target: string; value: number }[] } | null = null;
  @state() costObjectData: any[] = [];

  // --- Mobile layer (<= 600px). The desktop layout above the breakpoint is untouched. ---
  @state() isMobile = false;
  @state() activeTab: 'breakdown' | 'budget' | 'funding' = 'breakdown';
  @state() expandedFamilyId: string | null = null;
  @state() showPeriodSheet = false;
  /** Category (or family) being drilled into, or null for the list. */
  @state() drillCategoryId: string | null = null;
  @state() drillTransactions: any[] = [];
  @state() drillLoading = false;
  @state() showRuleModal = false;
  @state() showAccountSheet = false;
  @state() snack: SnackbarOptions | null = null;
  /** Total spend for the preceding period, for the delta pill. */
  @state() previousTotal: number | null = null;

  // Period sheet holds its edits until Apply
  @state() private sheetMode: DateFilterMode = 'month';
  @state() private sheetYear = new Date().getFullYear();
  @state() private sheetMonth = new Date().getMonth() + 1;
  @state() private sheetStartDate = '';
  @state() private sheetEndDate = '';
  @state() private sheetMonthlyAverage = false;

  private unwatchViewport?: () => void;
  private snackTimer?: number;

  @query('#breakdownChart') breakdownCanvas!: HTMLCanvasElement;
  @query('#sankeyChart') sankeyCanvas!: HTMLCanvasElement;
  @query('#budgetChart') budgetCanvas!: HTMLCanvasElement;
  @query('#costObjectChart') costObjectCanvas!: HTMLCanvasElement;

  private breakdownChart: Chart | null = null;
  private sankeyChart: Chart | null = null;
  private budgetChart: Chart | null = null;
  private costObjectChart: Chart | null = null;

  static styles = [css`
    :host { display: block; }

    .header {
        display: flex; 
        justify-content: space-between; 
        align-items: center; 
        margin-bottom: 24px; 
        flex-wrap: wrap;
        gap: 16px;
    }
    h1 { font: var(--md-sys-typescale-headline-medium); color: var(--md-sys-color-on-surface); margin: 0; }
    
    .controls { display: flex; gap: 16px; align-items: center; }

    select { 
        height: 40px;
        padding: 0 16px; 
        border: 1px solid var(--md-sys-color-outline); 
        border-radius: 4px; 
        background-color: transparent;
        color: var(--md-sys-color-on-surface);
        font: var(--md-sys-typescale-body-large);
        min-width: 120px;
        transition: border-color 0.2s;
    }
    select:focus {
        border-color: var(--md-sys-color-primary);
        outline: 2px solid var(--md-sys-color-primary);
    }

    select option {
        background-color: var(--md-sys-color-surface);
        color: var(--md-sys-color-on-surface);
    }
    
    button {
        height: 40px;
        padding: 0 24px;
        border-radius: 20px;
        border: none;
        font: var(--md-sys-typescale-label-large);
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        transition: background-image 0.2s, box-shadow 0.2s, background-color 0.2s;
        background-color: var(--md-sys-color-secondary-container);
        color: var(--md-sys-color-on-secondary-container);
    }
    button:hover {
        box-shadow: 0 1px 2px rgba(0,0,0,0.12);
        background-image: linear-gradient(rgba(29, 25, 43, 0.08), rgba(29, 25, 43, 0.08));
    }

    .charts-container { display: grid; grid-template-columns: 1fr; gap: 24px; margin-top: 24px; }
    
    .chart-card { 
        background: var(--md-sys-color-surface-container-low); 
        padding: 24px; 
        border-radius: var(--md-sys-shape-corner-medium); 
        box-shadow: 0 1px 3px 0 rgba(0,0,0,0.12), 0 1px 2px 0 rgba(0,0,0,0.24); 
    }
    .chart-card h3 { margin-top: 0; font: var(--md-sys-typescale-title-medium); color: var(--md-sys-color-on-surface-variant); margin-bottom: 24px; }
    
    canvas { width: 100%; height: 100%; }
    
    .chart-with-legend { 
      display: flex; 
      gap: 24px; 
      align-items: flex-start; 
    }
    .chart-canvas { 
      flex: 1; 
      min-width: 0; 
    }
    .custom-legend { 
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 4px 16px;
      min-width: 560px;
      max-width: 700px;
      max-height: 100%;
      overflow-y: auto;
      padding-right: 8px;
    }
    .custom-legend::-webkit-scrollbar {
      width: 6px;
    }
    .custom-legend::-webkit-scrollbar-track {
      background: transparent;
    }
    .custom-legend::-webkit-scrollbar-thumb {
      background: var(--md-sys-color-outline);
      border-radius: 3px;
    }
    .legend-item { 
      display: grid;
      grid-template-columns: 20px 1fr auto auto auto;
      align-items: center; 
      gap: 10px; 
      font-size: 13px;
      padding: 6px 8px;
      border-radius: 6px;
      transition: background-color 0.2s;
    }
    .legend-item.child {
      grid-template-columns: 20px 1fr auto auto;
    }
    .legend-item.parent-header {
      font-weight: 600;
      font-size: 14px;
      padding: 8px 8px 4px 8px;
      margin-top: 12px;
      grid-column: 1 / -1; /* Span all columns */
      grid-template-columns: auto 1fr auto auto auto; /* color picker, name, eye, arrow */
      opacity: 0.9;
      border-bottom: 1px solid var(--md-sys-color-outline-variant);
      background-color: var(--md-sys-color-surface-container);
      gap: 10px;
    }
    .legend-item.parent-header:first-child {
      margin-top: 0;
    }
    .color-picker {
      width: 24px;
      height: 24px;
      border: 2px solid var(--md-sys-color-outline);
      border-radius: 4px;
      cursor: pointer;
      transition: transform 0.2s;
    }
    .color-picker:hover {
      transform: scale(1.1);
    }
    .color-picker::-webkit-color-swatch-wrapper {
      padding: 0;
    }
    .color-picker::-webkit-color-swatch {
      border: none;
      border-radius: 2px;
    }
    .legend-item.child { 
      padding-left: 28px;
      font-size: 12px;
      grid-template-columns: 16px 1fr auto auto;
    }
    .legend-item.child .legend-color {
      width: 16px;
      height: 16px;
    }
    .color-picker-small {
      width: 20px;
      height: 20px;
      border: 1px solid var(--md-sys-color-outline);
      border-radius: 3px;
      cursor: pointer;
      transition: transform 0.2s;
    }
    .color-picker-small:hover {
      transform: scale(1.1);
    }
    .color-picker-small::-webkit-color-swatch-wrapper {
      padding: 0;
    }
    .color-picker-small::-webkit-color-swatch {
      border: none;
      border-radius: 2px;
    }
    .legend-item:hover:not(.parent-header) { 
      background-color: var(--md-sys-color-surface-variant);
    }
    .legend-item.hidden { 
      opacity: 0.4; 
    }
    .legend-color { 
      width: 20px; 
      height: 20px; 
      border-radius: 4px; 
      flex-shrink: 0;
      box-shadow: 0 1px 2px rgba(0,0,0,0.1);
    }
    .legend-text { 
      color: var(--md-sys-color-on-surface);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      line-height: 1.4;
    }
    .legend-icon { 
      cursor: pointer; 
      font-size: 18px;
      width: 28px;
      height: 28px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 4px;
      transition: background-color 0.2s, transform 0.1s;
      user-select: none;
      flex-shrink: 0;
    }
    .legend-icon:hover { 
      background-color: var(--md-sys-color-surface-variant);
      transform: scale(1.05);
    }
    .legend-icon:active {
      transform: scale(0.95);
    }
    .eye-icon { 
      opacity: 0.6; 
    }
    .eye-icon:hover { 
      opacity: 1; 
    }
    .nav-icon {
      opacity: 0.5;
    }
    .nav-icon:hover {
      opacity: 1;
    }
    .empty-hint {
      color: var(--md-sys-color-on-surface-variant);
      font: var(--md-sys-typescale-body-medium);
      margin: 0;
      padding: 16px 0;
    }

    /* ---------- mobile ---------- */

    .r-panel {
      display: flex;
      flex-direction: column;
      gap: 20px;
      padding: 16px 0 0;
    }

    .r-total {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 12px;
    }
    .r-total-figure {
      font: var(--md-sys-typescale-display-small);
      color: var(--md-sys-color-on-surface);
    }

    .r-bar-row {
      display: flex;
      flex-direction: column;
      /* buttons default to align-items: center, which would collapse the
         bar track and stop the head row from spreading */
      align-items: stretch;
      gap: 8px;
      padding: 12px 0;
      border: none;
      border-bottom: 1px solid var(--md-sys-color-surface-container-high);
      background: none;
      width: 100%;
      text-align: left;
      color: inherit;
      font: inherit;
      cursor: pointer;
    }
    .r-bar-head {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .r-bar-icon {
      width: 24px;
      font-size: 18px;
      flex-shrink: 0;
      text-align: center;
    }
    .r-bar-name {
      flex: 1;
      min-width: 0;
      font: var(--md-sys-typescale-body-large);
      color: var(--md-sys-color-on-surface);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .r-bar-amount {
      font: 500 16px/24px 'Roboto', sans-serif;
      color: var(--md-sys-color-on-surface);
      white-space: nowrap;
    }
    .r-bar-pct {
      width: 32px;
      text-align: right;
      font: 500 12px/16px 'Roboto', sans-serif;
      color: var(--md-sys-color-on-surface-variant);
      flex-shrink: 0;
    }
    .r-bar-caption {
      font: 400 12px/16px 'Roboto', sans-serif;
      color: var(--md-sys-color-on-surface-variant);
    }

    .r-children {
      background: var(--md-sys-color-surface-container);
      border-radius: 12px;
      padding: 4px 12px;
      margin: 0 0 12px;
    }
    .r-child {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 10px 0;
    }
    .r-child + .r-child { border-top: 1px solid var(--md-sys-color-surface-container-high); }
    .r-child-icon { width: 20px; font-size: 15px; text-align: center; flex-shrink: 0; }
    .r-child-name {
      flex: 1;
      min-width: 0;
      font: 400 14px/20px 'Roboto', sans-serif;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .r-child-amount { font: 500 14px/20px 'Roboto', sans-serif; white-space: nowrap; }

    .r-month-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 8px;
    }
    .r-month-cell {
      height: 48px;
      border: none;
      border-radius: 12px;
      background: var(--md-sys-color-surface-container);
      color: var(--md-sys-color-on-surface);
      font: var(--md-sys-typescale-body-large);
      cursor: pointer;
    }
    .r-month-cell.selected {
      background: var(--md-sys-color-primary);
      color: var(--md-sys-color-on-primary);
    }
    .r-month-cell.future { color: var(--md-sys-color-on-surface-variant); }

    .r-year-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .r-year-btn {
      width: 44px;
      height: 44px;
      border-radius: 22px;
      border: none;
      background: var(--md-sys-color-surface-container);
      color: var(--md-sys-color-on-surface);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
    }
    .r-year-label { font: 500 16px/24px 'Roboto', sans-serif; }

    .r-drill-total {
      display: flex;
      align-items: flex-end;
      justify-content: space-between;
      gap: 12px;
      padding: 4px 0 12px;
    }
    .r-drill-figure { font: 400 32px/40px 'Roboto', sans-serif; }
  `, mobileUI];

  async firstUpdated() {
    this.loadFiltersFromURL();
    await this.loadAccounts();
    await this.loadData();
  }

  loadFiltersFromURL() {
    const params = new URLSearchParams(window.location.search);
    
    if (params.has('mode')) {
      this.dateFilterMode = params.get('mode') as DateFilterMode;
    }
    if (params.has('month')) {
      this.month = parseInt(params.get('month')!);
    }
    if (params.has('year')) {
      this.year = parseInt(params.get('year')!);
    }
    if (params.has('startDate')) {
      this.customStartDate = params.get('startDate')!;
    }
    if (params.has('endDate')) {
      this.customEndDate = params.get('endDate')!;
    }
    if (params.has('accountId')) {
      this.selectedAccountId = params.get('accountId')!;
    }
    if (params.has('avg')) {
      this.monthlyAverage = params.get('avg') === '1';
    }
  }

  updateURL() {
    const params = new URLSearchParams();
    
    params.set('mode', this.dateFilterMode);
    
    if (this.dateFilterMode === 'month') {
      params.set('month', this.month.toString());
      params.set('year', this.year.toString());
    } else if (this.dateFilterMode === 'year') {
      params.set('year', this.year.toString());
    } else if (this.dateFilterMode === 'custom') {
      if (this.customStartDate) params.set('startDate', this.customStartDate);
      if (this.customEndDate) params.set('endDate', this.customEndDate);
    }
    
    if (this.selectedAccountId) {
      params.set('accountId', this.selectedAccountId);
    }

    if (this.monthlyAverage) {
      params.set('avg', '1');
    }

    const newURL = `${window.location.pathname}?${params.toString()}`;
    window.history.replaceState({}, '', newURL);
  }

  async loadAccounts() {
    try {
      this.accounts = await api.get('/accounts');
    } catch (e) {
      console.error('Failed to load accounts:', e);
    }
  }

  connectedCallback() {
    super.connectedCallback();
    i18n.addEventListener('lang-change', () => this.requestUpdate());
    this.unwatchViewport = watchMobileViewport(this);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    i18n.removeEventListener('lang-change', () => this.requestUpdate());
    this.unwatchViewport?.();
    if (this.snackTimer) window.clearTimeout(this.snackTimer);
  }

  /** Inline snackbar above the nav; replaces alert() on the mobile path. */
  private notify(message: string, action?: { label: string; run: () => void }) {
    if (!this.isMobile) {
      alert(message);
      return;
    }
    if (this.snackTimer) window.clearTimeout(this.snackTimer);
    this.snack = action
      ? { message, actionLabel: action.label, onAction: () => { this.snack = null; action.run(); } }
      : { message };
    this.snackTimer = window.setTimeout(() => { this.snack = null; }, 4000);
  }

  getYearOptions(): number[] {
    const currentYear = new Date().getFullYear();
    const years: number[] = [];
    for (let y = currentYear - 5; y <= currentYear; y++) {
      years.push(y);
    }
    return years;
  }

  getAccountOptions(): SelectOption[] {
    const options: SelectOption[] = [
      { value: '', label: '🏦 All Accounts' }
    ];
    
    this.accounts.forEach(account => {
      options.push({
        value: account.id,
        label: account.name,
        icon: account.type === 'CREDIT' ? '💳' : '🏦'
      });
    });
    
    return options;
  }

  async loadData() {
    this.loading = true;
    this.updateURL(); // Save filters to URL
    try {
      // Build query params based on filter mode
      const params: any = { filterMode: this.dateFilterMode };

      switch (this.dateFilterMode) {
        case 'month':
          params.month = this.month;
          params.year = this.year;
          break;
        case 'year':
          params.year = this.year;
          break;
        case 'custom':
          if (this.customStartDate) params.startDate = this.customStartDate;
          if (this.customEndDate) params.endDate = this.customEndDate;
          break;
        case 'all_time':
          // No date params
          break;
      }

      if (this.selectedAccountId) {
        params.accountId = this.selectedAccountId;
      }

      if (this.monthlyAverage) {
        params.averageMonthly = true;
      }

      // The Sankey chart is dropped on phones, so skip the request entirely there
      const wantsSankey = !this.isMobile;
      // Powers the "vs previous period" delta pill in the mobile total block
      const previousParams = this.getPreviousPeriodParams();

      const [breakdown, sankey, costObjects, periodMonths, previousBreakdown] = await Promise.all([
        api.get('/reports/category-breakdown', params),
        wantsSankey ? api.get('/reports/sankey', params) : Promise.resolve(null),
        // Backend only computes cost objects for a specific account
        this.selectedAccountId
          ? api.get('/reports/cost-object-breakdown', params)
          : Promise.resolve([]),
        // Only needed to label the averaged charts
        this.monthlyAverage
          ? api.get('/reports/period-months', params)
          : Promise.resolve({ months: 1 }),
        this.isMobile && previousParams
          ? api.get('/reports/category-breakdown', previousParams).catch(() => null)
          : Promise.resolve(null),
      ]);

      this.breakdownData = breakdown;
      if (wantsSankey) this.sankeyData = sankey;
      this.costObjectData = costObjects;
      this.periodMonths = periodMonths?.months || 1;
      this.previousTotal = Array.isArray(previousBreakdown)
        ? previousBreakdown.reduce((sum: number, d: any) => sum + Math.max(0, Number(d.spent) || 0), 0)
        : null;

      await this.updateComplete; // Ensure DOM is ready
      this.renderBreakdown();
      if (wantsSankey) this.renderSankey();
      this.renderBudget();
      this.renderCostObjects();
    } catch (e: any) {
      console.error(e);
      this.notify('Failed to load reports: ' + (e.message || e));
    } finally {
      this.loading = false;
    }
  }

  // ------------------------------------------------------------------
  // Period navigation (mobile stepper + period sheet)
  // ------------------------------------------------------------------

  /** Query params for the period immediately before the current one, or null. */
  private getPreviousPeriodParams(): any | null {
    const base: any = { filterMode: this.dateFilterMode };
    if (this.selectedAccountId) base.accountId = this.selectedAccountId;

    switch (this.dateFilterMode) {
      case 'month': {
        const prev = this.month === 1 ? 12 : this.month - 1;
        const prevYear = this.month === 1 ? this.year - 1 : this.year;
        return { ...base, month: prev, year: prevYear };
      }
      case 'year':
        return { ...base, year: this.year - 1 };
      case 'custom': {
        if (!this.customStartDate || !this.customEndDate) return null;
        const start = new Date(`${this.customStartDate}T00:00:00`);
        const end = new Date(`${this.customEndDate}T00:00:00`);
        const span = end.getTime() - start.getTime();
        if (!Number.isFinite(span) || span < 0) return null;
        const prevEnd = new Date(start.getTime() - 86400000);
        const prevStart = new Date(prevEnd.getTime() - span);
        return {
          ...base,
          startDate: prevStart.toISOString().split('T')[0],
          endDate: prevEnd.toISOString().split('T')[0],
        };
      }
      default:
        return null;
    }
  }

  /** Short label for the preceding period, e.g. "Aug" or "2025". */
  private previousPeriodLabel(): string {
    if (this.dateFilterMode === 'year') return String(this.year - 1);
    const prev = this.month === 1 ? 12 : this.month - 1;
    const prevYear = this.month === 1 ? this.year - 1 : this.year;
    return new Date(prevYear, prev - 1, 1)
      .toLocaleString(i18n.getLocale(), { month: 'short' })
      .replace('.', '');
  }

  /** The stepper's centre label for the active period. */
  periodLabel(): string {
    switch (this.dateFilterMode) {
      case 'month': {
        const name = new Date(this.year, this.month - 1, 1)
          .toLocaleString(i18n.getLocale(), { month: 'long' });
        return `${name.charAt(0).toUpperCase()}${name.slice(1)} ${this.year}`;
      }
      case 'year':
        return String(this.year);
      case 'custom':
        return this.customStartDate && this.customEndDate
          ? `${this.customStartDate} – ${this.customEndDate}`
          : i18n.t('filters.mode_custom');
      default:
        return i18n.t('mobile.all_time_label');
    }
  }

  /** Moves the period one step. Custom ranges shift by their own span. */
  stepPeriod(direction: -1 | 1) {
    if (this.dateFilterMode === 'month') {
      const next = this.month + direction;
      if (next < 1) { this.month = 12; this.year -= 1; }
      else if (next > 12) { this.month = 1; this.year += 1; }
      else { this.month = next; }
    } else if (this.dateFilterMode === 'year') {
      this.year += direction;
    } else if (this.dateFilterMode === 'custom') {
      if (!this.customStartDate || !this.customEndDate) return;
      const start = new Date(`${this.customStartDate}T00:00:00`);
      const end = new Date(`${this.customEndDate}T00:00:00`);
      const span = end.getTime() - start.getTime() + 86400000;
      this.customStartDate = new Date(start.getTime() + direction * span).toISOString().split('T')[0];
      this.customEndDate = new Date(end.getTime() + direction * span).toISOString().split('T')[0];
    } else {
      return; // all_time has no steps
    }
    this.expandedFamilyId = null;
    this.loadData();
  }

  /** True once the forward chevron would move past the current month/year. */
  private isAtLatestPeriod(): boolean {
    const now = new Date();
    if (this.dateFilterMode === 'month') {
      return this.year > now.getFullYear()
        || (this.year === now.getFullYear() && this.month >= now.getMonth() + 1);
    }
    if (this.dateFilterMode === 'year') return this.year >= now.getFullYear();
    return this.dateFilterMode === 'all_time';
  }

  openPeriodSheet() {
    this.sheetMode = this.dateFilterMode;
    this.sheetYear = this.year;
    this.sheetMonth = this.month;
    this.sheetStartDate = this.customStartDate;
    this.sheetEndDate = this.customEndDate;
    this.sheetMonthlyAverage = this.monthlyAverage;
    this.showPeriodSheet = true;
  }

  applyPeriodSheet() {
    this.dateFilterMode = this.sheetMode;
    this.year = this.sheetYear;
    this.month = this.sheetMonth;
    this.customStartDate = this.sheetStartDate;
    this.customEndDate = this.sheetEndDate;
    // A single month has nothing to average
    this.monthlyAverage = this.sheetMode === 'month' ? false : this.sheetMonthlyAverage;
    this.showPeriodSheet = false;
    this.expandedFamilyId = null;
    this.loadData();
  }

  renderBreakdown() {
    try {
      if (this.breakdownChart) this.breakdownChart.destroy();
      if (!this.breakdownCanvas) return;

      // Zero-spend categories may be present for the budget report; skip them here
      let data = (this.breakdownData || []).filter((d: any) => d.spent > 0);

      // Aggregation Logic
      if (this.groupByCategory) {
        const familyMap = new Map<string, { id: string, name: string, spent: number, color: string }>();
        
        data.forEach(item => {
          const familyId = item.familyId || item.id; // Fallback to ID if no family
          // Use familyName if available (from Backend update), else item.name
          // If we grouped by parent on backend, we'd have this. 
          // Since we are aggregating on frontend, we need to know the parent name.
          // The updated backend returns 'familyName'.
          const familyName = item.familyName || item.name;
          
          if (!familyMap.has(familyId)) {
            familyMap.set(familyId, {
              id: familyId,
              name: familyName,
              spent: 0,
              color: item.color // Use color of first child (usually they share base hue)
            });
          }
          
          const entry = familyMap.get(familyId)!;
          entry.spent += item.spent;
        });

        data = Array.from(familyMap.values()).sort((a, b) => b.spent - a.spent);
      }

      if (!data || data.length === 0) return;

      const backgroundColors = data.map((d, i) => {
        // Use category color if it exists and isn't default black
        if (d.color && d.color !== '#000000' && d.color !== '#000') return d.color;
        return CHART_PALETTE[i % CHART_PALETTE.length];
      });

      // Store category data for custom legend with parent grouping
      // Group items by family
      const familyGroups = new Map<string, any[]>();
      
      data.forEach((d: any, i: number) => {
        const familyId = d.familyId || d.id;
        if (!familyGroups.has(familyId)) {
          familyGroups.set(familyId, []);
        }
        
        familyGroups.get(familyId)!.push({
          id: d.id,
          name: d.name,
          icon: d.icon || '',
          color: backgroundColors[i],
          hidden: false,
          index: i,
          parentId: d.parentId,
          familyId: d.familyId,
          familyName: d.familyName
        });
      });
      
      // Build legend items with parent headers
      this.legendItems = [];
      familyGroups.forEach((items, familyId) => {
        // Check if this is a parent with children
        const hasChildren = items.some(item => item.parentId);
        
        // Always show as parent header (whether it has children or not)
        const parentItem = items.find(item => !item.parentId);
        const firstItem = items[0];
        
        // Add parent header - familyName already includes icon
        this.legendItems.push({
          id: familyId,
          name: firstItem.familyName || (parentItem ? `${parentItem.icon} ${parentItem.name}` : firstItem.name),
          icon: '', // Don't show icon separately since it's in familyName
          color: 'transparent',
          hidden: false,
          index: -1,
          isParentHeader: true
        });
        
        if (hasChildren) {
          // Add all items as children (including parent if it has data)
          items.forEach(item => {
            this.legendItems.push({
              ...item,
              isChild: true
            });
          });
        } else {
          // Standalone category - add as child under its own header
          items.forEach(item => {
            this.legendItems.push({
              ...item,
              isChild: true
            });
          });
        }
      });

      this.breakdownChart = new Chart(this.breakdownCanvas, {
        type: 'doughnut',
        data: {
          labels: data.map((d: any) => d.name),
          datasets: [{
            data: data.map((d: any) => d.spent),
            backgroundColor: backgroundColors,
          }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false, // Disable default legend, use custom HTML legend
                },
                tooltip: {
                    bodyColor: getTextColor(), // Dynamic color for dark mode
                    titleColor: getTextColor(),
                    callbacks: {
                        label: function(context: any) {
                            let label = context.label || '';
                            if (label) {
                                label += ': ';
                            }
                            const value = context.parsed;
                            const total = context.chart._metasets[context.datasetIndex].total;
                            const percentage = ((value / total) * 100).toFixed(1) + '%';
                            label += value + ' (' + percentage + ')';
                            return label;
                        }
                    }
                }
            }
        }
      });
    } catch (e: any) {
      console.error('Breakdown Chart Error', e);
    }
  }

  private formatAmount(value: number): string {
    return value.toLocaleString(i18n.getLocale(), { maximumFractionDigits: 2 });
  }

  // Suffix appended to chart titles while the monthly average view is active
  private averageSuffix(): string {
    if (!this.monthlyAverage || this.periodMonths <= 1) return '';
    return ` · ${i18n.t('reports.monthly_average_of')} ${this.periodMonths} ${i18n.t('reports.months')}`;
  }

  // Budget comparison needs spending and budget on the same time scale.
  private canCompareBudget(): boolean {
    // Averaged spending is already monthly, so it lines up with the monthly budget in any mode
    if (this.monthlyAverage) return true;
    return this.dateFilterMode === 'month' || this.dateFilterMode === 'year';
  }

  // Budget is a monthly amount; scale it to the selected period.
  // Only month/year modes map cleanly to a number of months.
  getBudgetItems(): { id: string; name: string; spent: number; budget: number; color: string }[] {
    if (!this.canCompareBudget()) return [];
    // Averaged spending is per month, so the monthly budget needs no scaling
    const factor = !this.monthlyAverage && this.dateFilterMode === 'year' ? 12 : 1;

    return (this.breakdownData || [])
      .filter((d: any) => d.budget > 0)
      .map((d: any, i: number) => ({
        id: d.id,
        name: `${d.icon || ''} ${d.name}`.trim(),
        spent: d.spent,
        budget: d.budget * factor,
        color: d.color && d.color !== '#000000' && d.color !== '#000'
          ? d.color
          : CHART_PALETTE[i % CHART_PALETTE.length],
      }))
      .sort((a: any, b: any) => b.spent / b.budget - a.spent / a.budget);
  }

  renderBudget() {
    try {
      if (this.budgetChart) {
        this.budgetChart.destroy();
        this.budgetChart = null;
      }
      if (!this.budgetCanvas) return;

      const items = this.getBudgetItems();
      if (items.length === 0) return;

      const textColor = getTextColor();
      this.budgetChart = new Chart(this.budgetCanvas, {
        type: 'bar',
        data: {
          labels: items.map(i => i.name),
          datasets: [
            {
              label: i18n.t('reports.spent'),
              data: items.map(i => i.spent),
              backgroundColor: items.map(i => (i.spent > i.budget ? '#ef4444' : i.color)),
            },
            {
              label: i18n.t('reports.budget'),
              data: items.map(i => i.budget),
              backgroundColor: 'rgba(148, 163, 184, 0.45)',
            },
          ],
        },
        options: {
          indexAxis: 'y',
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            x: {
              beginAtZero: true,
              ticks: { color: textColor },
              grid: { color: 'rgba(148, 163, 184, 0.2)' },
            },
            y: {
              ticks: { color: textColor },
              grid: { display: false },
            },
          },
          plugins: {
            legend: { labels: { color: textColor } },
            tooltip: {
              bodyColor: textColor,
              titleColor: textColor,
              callbacks: {
                label: (context: any) =>
                  `${context.dataset.label}: ${this.formatAmount(context.parsed.x)}`,
              },
            },
          },
        },
      });
    } catch (e: any) {
      console.error('Budget Chart Error', e);
    }
  }

  renderSankey() {
    try {
      if (this.sankeyChart) {
        this.sankeyChart.destroy();
        this.sankeyChart = null;
      }
      if (!this.sankeyCanvas) return;

      const links = this.sankeyData?.links || [];
      if (links.length === 0) return;

      // Stable color per node: fixed colors for the hub nodes, palette for the rest
      const nodeColors = new Map<string, string>([
        ['Income', '#16a34a'],
        ['Savings', '#0ea5e9'],
      ]);
      let colorIndex = 0;
      links.forEach(link => {
        [link.source, link.target].forEach(id => {
          if (!nodeColors.has(id)) {
            nodeColors.set(id, CHART_PALETTE[colorIndex % CHART_PALETTE.length]);
            colorIndex++;
          }
        });
      });

      this.sankeyChart = new Chart(this.sankeyCanvas, {
        type: 'sankey',
        data: {
          datasets: [
            {
              data: links.map(l => ({ from: l.source, to: l.target, flow: l.value })),
              colorFrom: (c: any) => nodeColors.get(c.dataset.data[c.dataIndex].from) || '#94a3b8',
              colorTo: (c: any) => nodeColors.get(c.dataset.data[c.dataIndex].to) || '#94a3b8',
              colorMode: 'gradient',
              color: getTextColor(),
            } as any,
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              bodyColor: getTextColor(),
              titleColor: getTextColor(),
              callbacks: {
                label: (context: any) => {
                  const item = context.dataset.data[context.dataIndex];
                  return `${item.from} → ${item.to}: ${this.formatAmount(item.flow)}`;
                },
              },
            },
          },
        },
      });
    } catch (e: any) {
      console.error('Sankey Chart Error', e);
    }
  }

  renderCostObjects() {
    try {
      if (this.costObjectChart) {
        this.costObjectChart.destroy();
        this.costObjectChart = null;
      }
      if (!this.costObjectCanvas) return;

      const data = this.costObjectData || [];
      if (data.length === 0) return;

      const textColor = getTextColor();
      this.costObjectChart = new Chart(this.costObjectCanvas, {
        type: 'doughnut',
        data: {
          labels: data.map((d: any) => `${d.icon || ''} ${d.name}`.trim()),
          datasets: [
            {
              data: data.map((d: any) => d.total),
              backgroundColor: data.map(
                (d: any, i: number) => d.color || CHART_PALETTE[i % CHART_PALETTE.length],
              ),
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'right',
              labels: { color: textColor },
            },
            tooltip: {
              bodyColor: textColor,
              titleColor: textColor,
              callbacks: {
                label: (context: any) => {
                  const item = data[context.dataIndex];
                  const total = context.chart._metasets[context.datasetIndex].total;
                  const percentage = ((context.parsed / total) * 100).toFixed(1) + '%';
                  return `${this.formatAmount(context.parsed)} (${percentage}) · ${item.count} ${i18n.t('reports.transactions')}`;
                },
              },
            },
          },
        },
      });
    } catch (e: any) {
      console.error('Cost Object Chart Error', e);
    }
  }

  toggleLegendItem(index: number) {
    if (!this.breakdownChart) return;
    
    const meta = this.breakdownChart.getDatasetMeta(0);
    const element = meta.data[index] as any;
    element.hidden = !element.hidden;
    
    // Update legend items state
    this.legendItems = this.legendItems.map((item, i) => 
      i === index ? { ...item, hidden: !item.hidden } : item
    );
    
    this.breakdownChart.update();
  }

  toggleParentGroup(familyId: string) {
    if (!this.breakdownChart) return;
    
    // Find all children in this family
    const childrenIndices = this.legendItems
      .filter(item => !item.isParentHeader && item.familyId === familyId)
      .map(item => item.index);
    
    if (childrenIndices.length === 0) return;
    
    // Check if any children are visible
    const meta = this.breakdownChart.getDatasetMeta(0);
    const anyVisible = childrenIndices.some(index => {
      const element = meta.data[index] as any;
      return !element.hidden;
    });
    
    // Toggle all children to the opposite state
    const newHiddenState = anyVisible;
    childrenIndices.forEach(index => {
      const element = meta.data[index] as any;
      element.hidden = newHiddenState;
    });
    
    // Update legend items state
    this.legendItems = this.legendItems.map(item => {
      if (!item.isParentHeader && item.familyId === familyId) {
        return { ...item, hidden: newHiddenState };
      }
      return item;
    });
    
    this.breakdownChart.update();
  }

  async updateSingleCategoryColor(categoryId: string, color: string) {
    try {
      await api.patch(`/categories/${categoryId}`, { color });
      await this.loadData();
    } catch (e: any) {
      console.error('Failed to update category color:', e);
      this.notify('Failed to update color: ' + (e.message || e));
    }
  }

  async updateCategoryColor(familyId: string, color: string) {
    try {
      console.log('Updating family color:', familyId, color);
      
      // Find ALL categories in this family (including parent if it has data)
      const familyCategories = this.legendItems.filter(
        item => !item.isParentHeader && item.familyId === familyId
      );
      
      console.log('Found family categories to update:', familyCategories);
      
      if (familyCategories.length === 0) {
        // Maybe the parent itself doesn't have data, just update it directly
        await api.patch(`/categories/${familyId}`, { color });
        await this.loadData();
        return;
      }
      
      // Update each category in the family with a color variation
      for (let i = 0; i < familyCategories.length; i++) {
        const category = familyCategories[i];
        // Create color variations by adjusting brightness
        const variance = (i * 15) % 60;
        const categoryColor = this.adjustBrightness(color, variance - 10);
        console.log(`Updating category ${category.id} (${category.name}) to color ${categoryColor}`);
        await api.patch(`/categories/${category.id}`, { color: categoryColor });
      }
      
      // Also update the parent category itself if it exists
      await api.patch(`/categories/${familyId}`, { color }).catch(() => {
        // Parent might not exist as a real category, ignore error
        console.log('Parent category not found or already updated');
      });
      
      // Reload the data to reflect the new colors
      await this.loadData();
    } catch (e: any) {
      console.error('Failed to update category color:', e);
      this.notify('Failed to update color: ' + (e.message || e));
    }
  }

  private adjustBrightness(col: string, amt: number): string {
    let color = col.replace(/^#/, '');
    if (color.length === 3) {
      color = color[0] + color[0] + color[1] + color[1] + color[2] + color[2];
    }

    let r = parseInt(color.substring(0, 2), 16);
    let g = parseInt(color.substring(2, 4), 16);
    let b = parseInt(color.substring(4, 6), 16);

    r = Math.max(0, Math.min(255, r + amt));
    g = Math.max(0, Math.min(255, g + amt));
    b = Math.max(0, Math.min(255, b + amt));

    const toHex = (c: number) => {
      const hex = c.toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    };

    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  }

  navigateToParentCategory(familyId: string) {
    // Navigate to expenses with all children categories selected
    const params = new URLSearchParams();
    params.set('mode', this.dateFilterMode);
    
    if (this.dateFilterMode === 'month') {
      params.set('month', this.month.toString());
      params.set('year', this.year.toString());
    } else if (this.dateFilterMode === 'year') {
      params.set('year', this.year.toString());
    } else if (this.dateFilterMode === 'custom') {
      if (this.customStartDate) params.set('startDate', this.customStartDate);
      if (this.customEndDate) params.set('endDate', this.customEndDate);
    }
    
    if (this.selectedAccountId) {
      params.set('accountId', this.selectedAccountId);
    }
    
    // Use the parent/family ID for filtering
    if (familyId) {
      params.set('categoryId', familyId);
    }
    
    window.location.href = `/?${params.toString()}`;
  }

  navigateToCategory(categoryId: string) {
    const params = new URLSearchParams();
    params.set('mode', this.dateFilterMode);
    
    if (this.dateFilterMode === 'month') {
      params.set('month', this.month.toString());
      params.set('year', this.year.toString());
    } else if (this.dateFilterMode === 'year') {
      params.set('year', this.year.toString());
    } else if (this.dateFilterMode === 'custom') {
      if (this.customStartDate) params.set('startDate', this.customStartDate);
      if (this.customEndDate) params.set('endDate', this.customEndDate);
    }
    
    if (this.selectedAccountId) {
      params.set('accountId', this.selectedAccountId);
    }
    
    if (categoryId) {
      params.set('categoryId', categoryId);
    }
    
    window.location.href = `/?${params.toString()}`;
  }

  // ------------------------------------------------------------------
  // Mobile layout
  // ------------------------------------------------------------------

  private currencySymbol(): string {
    return localStorage.getItem('priperfin_currency') === 'EUR' ? '€' : '$';
  }

  private money(value: number, decimals = 2): string {
    return `${this.currencySymbol()}${Math.abs(value).toLocaleString(i18n.getLocale(), {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    })}`;
  }

  private barColor(item: any, index: number): string {
    if (item.color && item.color !== '#000000' && item.color !== '#000') return item.color;
    return CHART_PALETTE[index % CHART_PALETTE.length];
  }

  /**
   * Rolls the flat breakdown payload up into one row per family, keeping the
   * members so a tap can expand them inline.
   */
  private getFamilyRows(): {
    id: string;
    name: string;
    icon: string;
    color: string;
    spent: number;
    members: any[];
  }[] {
    const spending = (this.breakdownData || []).filter((d: any) => Number(d.spent) > 0);
    const families = new Map<string, { id: string; name: string; icon: string; color: string; spent: number; members: any[] }>();

    spending.forEach((item: any, index: number) => {
      const familyId = item.familyId || item.id;
      if (!families.has(familyId)) {
        // familyName already carries the parent's icon, so split it back out
        const rawName: string = item.familyName || `${item.icon || ''} ${item.name}`.trim();
        const [maybeIcon, ...rest] = rawName.split(' ');
        const hasLeadingIcon = rest.length > 0 && !/^[\w(]/.test(maybeIcon);
        families.set(familyId, {
          id: familyId,
          name: hasLeadingIcon ? rest.join(' ') : rawName,
          icon: hasLeadingIcon ? maybeIcon : (item.icon || ''),
          color: this.barColor(item, index),
          spent: 0,
          members: [],
        });
      }
      const family = families.get(familyId)!;
      family.spent += Number(item.spent);
      family.members.push({ ...item, _color: this.barColor(item, index) });
    });

    return Array.from(families.values()).sort((a, b) => b.spent - a.spent);
  }

  /** All category ids that roll up into the given family. */
  private familyMemberIds(familyId: string): string[] {
    const ids = (this.breakdownData || [])
      .filter((d: any) => (d.familyId || d.id) === familyId)
      .map((d: any) => d.id);
    return ids.length > 0 ? ids : [familyId];
  }

  private drillLabel(): { icon: string; name: string; parentName: string | null } {
    const item = (this.breakdownData || []).find((d: any) => d.id === this.drillCategoryId);
    if (!item) return { icon: '', name: '', parentName: null };
    const family = item.familyId && item.familyId !== item.id
      ? (this.breakdownData || []).find((d: any) => d.id === item.familyId)
      : null;
    return { icon: item.icon || '', name: item.name, parentName: family ? family.name : null };
  }

  async openDrillDown(categoryId: string) {
    this.drillCategoryId = categoryId;
    this.drillTransactions = [];
    this.drillLoading = true;
    try {
      const params: any = { filterMode: this.dateFilterMode };
      if (this.dateFilterMode === 'month') { params.month = this.month; params.year = this.year; }
      else if (this.dateFilterMode === 'year') { params.year = this.year; }
      else if (this.dateFilterMode === 'custom') {
        if (this.customStartDate) params.startDate = this.customStartDate;
        if (this.customEndDate) params.endDate = this.customEndDate;
      }
      if (this.selectedAccountId) params.accountId = this.selectedAccountId;

      // The API has no category filter, so narrow the period's transactions here
      const all = await api.get('/transactions', params);
      const ids = this.familyMemberIds(categoryId);
      const wanted = new Set(ids.includes(categoryId) ? ids : [categoryId, ...ids]);
      this.drillTransactions = (Array.isArray(all) ? all : [])
        .filter((t: any) => wanted.has(t.categoryId)
          || (t.splits || []).some((s: any) => wanted.has(s.categoryId)))
        .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
    } catch (e: any) {
      console.error('Failed to load category transactions', e);
      this.notify(i18n.t('reports.no_data'));
    } finally {
      this.drillLoading = false;
    }
  }

  /** Short label for the account chip: "🏦 All" or the account's own name. */
  private accountChipLabel(): string {
    const account = this.accounts.find(a => a.id === this.selectedAccountId);
    if (!account) return '🏦 All';
    return `${account.type === 'CREDIT' ? '💳' : '🏦'} ${account.name}`;
  }

  /** Account picker as a sheet, sharing getAccountOptions() with the desktop select. */
  private renderAccountSheet() {
    return bottomSheet({
      open: this.showAccountSheet,
      onDismiss: () => { this.showAccountSheet = false; },
      content: html`
        <div class="m-sheet-title">${i18n.t('reports.all_accounts')}</div>
        <div>
          ${this.getAccountOptions().map(option => html`
            <button
              class="m-row"
              style="${option.value === this.selectedAccountId
                ? 'background: var(--md-sys-color-secondary-container)'
                : ''}"
              @click="${() => {
                this.showAccountSheet = false;
                if (option.value === this.selectedAccountId) return;
                this.selectedAccountId = option.value;
                this.loadData();
              }}">
              ${option.icon ? html`<span class="m-avatar">${option.icon}</span>` : nothing}
              <span class="m-row-main"><span class="m-row-primary">${option.label}</span></span>
              ${option.value === this.selectedAccountId ? icon('check', 20) : nothing}
            </button>
          `)}
        </div>
      `,
    });
  }

  private renderMobileHeader() {
    return html`
      <div class="m-title-row">
        <h1 class="m-title">${i18n.t('mobile.reports_short')}</h1>
        <button class="m-chip" @click="${() => { this.showAccountSheet = true; }}">
          <span>${this.accountChipLabel()}</span>
          ${icon('expand_more', 18)}
        </button>
      </div>

      ${monthStepper({
        label: this.periodLabel(),
        open: this.showPeriodSheet,
        onPrev: () => this.stepPeriod(-1),
        onNext: () => this.stepPeriod(1),
        nextDisabled: this.isAtLatestPeriod(),
        onLabel: () => this.openPeriodSheet(),
      })}
    `;
  }

  private renderBreakdownTab() {
    const families = this.getFamilyRows();
    const total = families.reduce((sum, f) => sum + f.spent, 0);

    if (families.length === 0) {
      return html`<p class="empty-hint">${i18n.t('reports.no_data')}</p>`;
    }

    const delta = this.previousTotal !== null && this.previousTotal > 0
      ? ((total - this.previousTotal) / this.previousTotal) * 100
      : null;

    return html`
      <div class="r-panel">
        <div class="r-total">
          <div>
            <div class="m-section-label">${i18n.t('mobile.spent_this_month')}</div>
            <div class="r-total-figure">${this.money(total)}</div>
          </div>
          ${delta !== null && Math.abs(delta) >= 1 ? html`
            <span class="m-pill ${delta > 0 ? 'up' : 'down'}">
              ${delta > 0 ? '▲' : '▼'} ${Math.abs(Math.round(delta))}%
              ${i18n.t('mobile.vs_previous', { period: this.previousPeriodLabel() })}
            </span>
          ` : nothing}
        </div>

        <div>
          ${families.map(family => {
            const pct = total > 0 ? (family.spent / total) * 100 : 0;
            const spendingMembers = family.members.filter(m => Number(m.spent) > 0);
            const expandable = spendingMembers.length > 1;
            const expanded = this.expandedFamilyId === family.id;

            return html`
              <button
                class="r-bar-row"
                @click="${() => expandable
                  ? (this.expandedFamilyId = expanded ? null : family.id)
                  : this.openDrillDown(spendingMembers[0]?.id ?? family.id)}">
                <div class="r-bar-head">
                  <span class="r-bar-icon">${family.icon}</span>
                  <span class="r-bar-name">${family.name}</span>
                  <span class="r-bar-amount">${this.money(family.spent)}</span>
                  <span class="r-bar-pct">${Math.round(pct)}%</span>
                </div>
                <div class="m-track">
                  <div class="m-track-fill" style="width: ${pct}%; background: ${family.color}"></div>
                </div>
              </button>

              ${expanded ? html`
                <div class="r-children">
                  ${spendingMembers
                    .sort((a, b) => Number(b.spent) - Number(a.spent))
                    .map(member => html`
                      <div class="r-child">
                        <span class="r-child-icon">${member.icon || ''}</span>
                        <span class="r-child-name">${member.name}</span>
                        <span class="r-child-amount">${this.money(Number(member.spent))}</span>
                        <button class="m-link" @click="${() => this.openDrillDown(member.id)}">
                          ${i18n.t('mobile.see')} ›
                        </button>
                      </div>
                    `)}
                </div>
              ` : nothing}
            `;
          })}
        </div>
      </div>
    `;
  }

  private renderBudgetTab() {
    if (!this.canCompareBudget()) {
      return html`<p class="empty-hint">${i18n.t('reports.budget_hint_period')}</p>`;
    }
    const items = this.getBudgetItems();
    if (items.length === 0) {
      return html`<p class="empty-hint">${i18n.t('reports.budget_empty')}</p>`;
    }

    const totalSpent = items.reduce((sum, i) => sum + i.spent, 0);
    const totalBudget = items.reduce((sum, i) => sum + i.budget, 0);
    const usedPct = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0;
    const overCount = items.filter(i => i.spent > i.budget).length;

    return html`
      <div class="r-panel">
        <div class="r-total">
          <div>
            <div class="m-section-label">${i18n.t('mobile.budget_used')}</div>
            <div class="r-total-figure">${usedPct}%</div>
          </div>
          ${overCount > 0 ? html`
            <span class="m-pill behind">${i18n.t('mobile.over_budget_count', { count: overCount })}</span>
          ` : nothing}
        </div>

        <div>
          ${items.map(item => {
            const over = item.spent > item.budget;
            const pct = item.budget > 0 ? Math.min(100, (item.spent / item.budget) * 100) : 0;
            const diff = Math.abs(item.budget - item.spent);
            return html`
              <div class="r-bar-row" style="cursor: default">
                <div class="r-bar-head">
                  <span class="r-bar-name">${item.name}</span>
                  <span class="r-bar-amount" style="${over ? 'color: var(--md-sys-color-error)' : ''}">
                    ${this.money(item.spent, 0)}
                  </span>
                  <span class="r-bar-pct">/ ${this.money(item.budget, 0)}</span>
                </div>
                <div class="m-track">
                  <div
                    class="m-track-fill"
                    style="width: ${pct}%; background: ${over ? 'var(--pf-over-budget)' : item.color}"></div>
                </div>
                <div class="r-bar-caption">
                  ${over
                    ? i18n.t('mobile.over_by', { amount: this.money(diff, 0) })
                    : i18n.t('mobile.left_over', { amount: this.money(diff, 0) })}
                </div>
              </div>
            `;
          })}
        </div>
      </div>
    `;
  }

  private renderFundingTab() {
    if (!this.selectedAccountId) {
      return html`
        <div class="r-panel">
          <p class="empty-hint">${i18n.t('reports.cost_object_hint')}</p>
          <button
            class="m-field"
            style="display: flex; align-items: center; justify-content: space-between; cursor: pointer;"
            @click="${() => { this.showAccountSheet = true; }}">
            <span>${this.accountChipLabel()}</span>
            ${icon('expand_more', 20)}
          </button>
        </div>
      `;
    }

    const data = this.costObjectData || [];
    if (data.length === 0) {
      return html`<p class="empty-hint">${i18n.t('reports.no_data')}</p>`;
    }
    const total = data.reduce((sum: number, d: any) => sum + Number(d.total), 0);

    return html`
      <div class="r-panel">
        <div class="r-total">
          <div>
            <div class="m-section-label">${i18n.t('mobile.spent')}</div>
            <div class="r-total-figure">${this.money(total)}</div>
          </div>
        </div>
        <div>
          ${data.map((co: any, index: number) => {
            const pct = total > 0 ? (Number(co.total) / total) * 100 : 0;
            return html`
              <div class="r-bar-row" style="cursor: default">
                <div class="r-bar-head">
                  <span class="r-bar-icon">${co.icon || ''}</span>
                  <span class="r-bar-name">${co.name}</span>
                  <span class="r-bar-amount">${this.money(Number(co.total))}</span>
                  <span class="r-bar-pct">${Math.round(pct)}%</span>
                </div>
                <div class="m-track">
                  <div
                    class="m-track-fill"
                    style="width: ${pct}%; background: ${co.color || CHART_PALETTE[index % CHART_PALETTE.length]}"></div>
                </div>
                <div class="r-bar-caption">
                  ${i18n.t('mobile.transactions_count', { count: co.count ?? 0 })}
                </div>
              </div>
            `;
          })}
        </div>
      </div>
    `;
  }

  private renderPeriodSheet() {
    const now = new Date();
    const modes: { value: DateFilterMode; label: string }[] = [
      { value: 'month', label: i18n.t('filters.mode_month') },
      { value: 'year', label: i18n.t('filters.mode_year') },
      { value: 'custom', label: i18n.t('filters.mode_custom') },
      { value: 'all_time', label: i18n.t('filters.mode_all_time') },
    ];

    return bottomSheet({
      open: this.showPeriodSheet,
      onDismiss: () => { this.showPeriodSheet = false; },
      content: html`
        <div class="m-sheet-title">${i18n.t('mobile.period')}</div>

        <div style="display: flex; flex-wrap: wrap; gap: 8px;">
          ${modes.map(mode => html`
            <button
              class="m-filter-chip ${this.sheetMode === mode.value ? 'selected' : ''}"
              style="${this.sheetMode === mode.value
                ? 'background: var(--md-sys-color-primary); color: var(--md-sys-color-on-primary)'
                : ''}"
              @click="${() => { this.sheetMode = mode.value; }}">
              ${mode.label}
            </button>
          `)}
        </div>

        ${this.sheetMode === 'month' || this.sheetMode === 'year' ? html`
          <div class="r-year-row">
            <button class="r-year-btn" @click="${() => { this.sheetYear -= 1; }}" aria-label="${i18n.t('mobile.prev_period')}">
              ${icon('chevron_left', 22)}
            </button>
            <span class="r-year-label">${this.sheetYear}</span>
            <button
              class="r-year-btn"
              ?disabled="${this.sheetYear >= now.getFullYear()}"
              @click="${() => { this.sheetYear += 1; }}"
              aria-label="${i18n.t('mobile.next_period')}">
              ${icon('chevron_right', 22)}
            </button>
          </div>
        ` : nothing}

        ${this.sheetMode === 'month' ? html`
          <div class="r-month-grid">
            ${Array.from({ length: 12 }, (_, i) => i + 1).map(m => {
              const name = new Date(this.sheetYear, m - 1, 1)
                .toLocaleString(i18n.getLocale(), { month: 'short' })
                .replace('.', '');
              const future = this.sheetYear > now.getFullYear()
                || (this.sheetYear === now.getFullYear() && m > now.getMonth() + 1);
              return html`
                <button
                  class="r-month-cell ${this.sheetMonth === m ? 'selected' : ''} ${future ? 'future' : ''}"
                  @click="${() => { this.sheetMonth = m; }}">
                  ${name.charAt(0).toUpperCase()}${name.slice(1)}
                </button>
              `;
            })}
          </div>
        ` : nothing}

        ${this.sheetMode === 'custom' ? html`
          <div style="display: flex; gap: 12px;">
            <label class="m-field-with-icon" style="flex: 1">
              <input
                class="m-field"
                type="text"
                inputmode="numeric"
                placeholder="yyyy-mm-dd"
                .value="${this.sheetStartDate}"
                @input="${(e: any) => { this.sheetStartDate = e.target.value; }}" />
              ${icon('calendar_month', 20)}
            </label>
            <label class="m-field-with-icon" style="flex: 1">
              <input
                class="m-field"
                type="text"
                inputmode="numeric"
                placeholder="yyyy-mm-dd"
                .value="${this.sheetEndDate}"
                @input="${(e: any) => { this.sheetEndDate = e.target.value; }}" />
              ${icon('calendar_month', 20)}
            </label>
          </div>
        ` : nothing}

        ${this.sheetMode !== 'month' ? html`
          <label style="display: flex; align-items: center; gap: 12px; cursor: pointer;">
            <button
              class="m-checkbox"
              role="checkbox"
              aria-checked="${this.sheetMonthlyAverage}"
              @click="${(e: Event) => { e.preventDefault(); this.sheetMonthlyAverage = !this.sheetMonthlyAverage; }}">
              ${this.sheetMonthlyAverage ? icon('check', 16) : nothing}
            </button>
            <span>${i18n.t('reports.monthly_average')}</span>
          </label>
        ` : nothing}

        <button class="m-btn block" @click="${() => this.applyPeriodSheet()}">
          ${i18n.t('mobile.apply')}
        </button>
      `,
    });
  }

  private renderDrillDown() {
    const label = this.drillLabel();
    const total = this.drillTransactions.reduce(
      (sum, t) => sum + Math.abs(Math.min(0, Number(t.amount) || 0)), 0);
    const familyTotal = label.parentName
      ? this.getFamilyRows().find(f => f.members.some((m: any) => m.id === this.drillCategoryId))?.spent ?? 0
      : 0;
    const share = familyTotal > 0 ? Math.round((total / familyTotal) * 100) : null;

    return html`
      <div class="m-screen">
        ${appBar({
          title: html`${label.icon} ${label.name}`,
          subtitle: `${this.periodLabel()} · ${i18n.t('mobile.transactions_count', { count: this.drillTransactions.length })}`,
          onBack: () => { this.drillCategoryId = null; this.drillTransactions = []; },
          action: html`
            <button
              class="m-icon-btn"
              title="${i18n.t('mobile.create_rule_from_category')}"
              @click="${() => { this.showRuleModal = true; }}">
              ${icon('rule', 24)}
            </button>
          `,
        })}

        <div class="r-drill-total">
          <div>
            <div class="m-section-label">${i18n.t('mobile.spent')}</div>
            <div class="r-drill-figure">${this.money(total)}</div>
          </div>
          ${share !== null && label.parentName ? html`
            <span class="m-row-value">
              ${i18n.t('mobile.percent_of', { percent: share, name: label.parentName })}
            </span>
          ` : nothing}
        </div>

        ${this.drillLoading
          ? html`<div class="m-progress-bar"></div>`
          : this.drillTransactions.length === 0
            ? html`<p class="empty-hint">${i18n.t('reports.no_data')}</p>`
            : this.drillTransactions.map(tx => html`
              <div class="m-row" style="min-height: 60px; cursor: default">
                <span class="m-avatar" style="width: 36px; height: 36px; border-radius: 18px; font-size: 16px">
                  ${label.icon}
                </span>
                <div class="m-row-main">
                  <div class="m-row-primary">${tx.description}</div>
                  <div class="m-row-secondary">
                    ${new Date(tx.date).toLocaleDateString(i18n.getLocale(), {
                      weekday: 'short', day: 'numeric', month: 'short',
                    })}
                  </div>
                </div>
                <span class="m-amount ${Number(tx.amount) >= 0 ? 'positive' : ''}">
                  ${Number(tx.amount) < 0 ? '−' : '+'}${Math.abs(Number(tx.amount)).toFixed(2)}
                </span>
              </div>
            `)}

        ${this.renderRuleModal()}
        ${snackbar(this.snack)}
      </div>
    `;
  }

  private renderRuleModal() {
    if (!this.showRuleModal) return nothing;
    const label = this.drillLabel();
    return html`
      <rule-editor
        .rule="${{
          name: label.name,
          mode: 'SUGGEST',
          categoryId: this.drillCategoryId,
          conditionsJson: JSON.stringify({
            operator: 'AND',
            conditions: [{ field: 'description', operator: 'contains', value: '' }],
          }),
        }}"
        .categories="${this.breakdownData}"
        @save="${async (e: CustomEvent) => {
          try {
            await api.post('/rules', e.detail);
            this.showRuleModal = false;
            this.notify(i18n.t('rules.rule_applied_count', { count: 0 }));
          } catch (err: any) {
            this.notify(i18n.t('rules.errors.save_failed') + ': ' + (err.message || err));
          }
        }}"
        @cancel="${() => { this.showRuleModal = false; }}">
      </rule-editor>
    `;
  }

  private renderMobile() {
    if (this.drillCategoryId) return this.renderDrillDown();

    const tabs: { id: 'breakdown' | 'budget' | 'funding'; label: string }[] = [
      { id: 'breakdown', label: i18n.t('mobile.tab_breakdown') },
      { id: 'budget', label: i18n.t('mobile.tab_budget') },
      { id: 'funding', label: i18n.t('mobile.tab_funding') },
    ];

    return html`
      <div class="m-screen">
        ${this.renderMobileHeader()}

        <div class="m-tabs" role="tablist">
          ${tabs.map(tab => html`
            <button
              class="m-tab"
              role="tab"
              aria-selected="${this.activeTab === tab.id}"
              @click="${() => { this.activeTab = tab.id; }}">
              ${tab.label}
            </button>
          `)}
        </div>

        ${this.loading
          ? html`<div class="m-progress-bar"></div>`
          : this.activeTab === 'breakdown' ? this.renderBreakdownTab()
            : this.activeTab === 'budget' ? this.renderBudgetTab()
              : this.renderFundingTab()}

        ${this.renderPeriodSheet()}
        ${this.renderAccountSheet()}
        ${snackbar(this.snack)}
      </div>
    `;
  }

  render() {
    if (this.isMobile) return this.renderMobile();

    return html`
      <div class="header">
        <h1>${i18n.t('reports.title')}</h1>
        <div class="controls">
            <filterable-select
              .value="${this.selectedAccountId}"
              .options="${this.getAccountOptions()}"
              .placeholder="${i18n.t('reports.all_accounts')}"
              @change="${(e: CustomEvent) => { this.selectedAccountId = e.detail.value; this.loadData(); }}"
              width="200px">
            </filterable-select>
            <select @change="${(e: any) => {
                this.dateFilterMode = e.target.value as DateFilterMode;
                // A single month has nothing to average
                if (this.dateFilterMode === 'month') this.monthlyAverage = false;
                this.loadData();
            }}" .value="${this.dateFilterMode}">
                <option value="month">${i18n.t('filters.mode_month')}</option>
                <option value="year">${i18n.t('filters.mode_year')}</option>
                <option value="custom">${i18n.t('filters.mode_custom')}</option>
                <option value="all_time">${i18n.t('filters.mode_all_time')}</option>
            </select>
            ${this.dateFilterMode === 'month' ? html`
                <select @change="${(e: any) => { this.month = parseInt(e.target.value); this.loadData(); }}" .value="${this.month}">
                    ${Array.from({ length: 12 }, (_, i) => i + 1).map(m => {
                        const monthName = new Date(this.year, m - 1, 1).toLocaleString(i18n.getLocale(), { month: 'long' });
                        const label = monthName.charAt(0).toUpperCase() + monthName.slice(1);
                        return html`<option value="${m}" ?selected=${this.month === m}>${label}</option>`;
                    })}
                </select>
            ` : ''}
            ${this.dateFilterMode === 'month' || this.dateFilterMode === 'year' ? html`
                <select @change="${(e: any) => { this.year = parseInt(e.target.value); this.loadData(); }}" .value="${this.year}">
                    ${this.getYearOptions().map(y => html`<option value="${y}">${y}</option>`)}
                </select>
            ` : ''}
            ${this.dateFilterMode === 'custom' ? html`
                <input type="date" .value="${this.customStartDate}" @change="${(e: any) => { this.customStartDate = e.target.value; this.loadData(); }}" style="padding: 0.5rem;" />
                <span style="color: var(--md-sys-color-on-surface-variant);">-</span>
                <input type="date" .value="${this.customEndDate}" @change="${(e: any) => { this.customEndDate = e.target.value; this.loadData(); }}" style="padding: 0.5rem;" />
            ` : ''}
            <label style="display: flex; align-items: center; gap: 8px; font-size: 14px; cursor: pointer; color: var(--md-sys-color-on-surface);">
                <input type="checkbox" .checked="${this.groupByCategory}" @change="${(e: any) => { this.groupByCategory = e.target.checked; this.renderBreakdown(); }}" />
                ${i18n.t('reports.group_by_parent') || 'Group by Parent'}
            </label>
            ${this.dateFilterMode !== 'month' ? html`
                <label
                  style="display: flex; align-items: center; gap: 8px; font-size: 14px; cursor: pointer; color: var(--md-sys-color-on-surface);"
                  title="${i18n.t('reports.monthly_average_hint')}">
                    <input type="checkbox" .checked="${this.monthlyAverage}" @change="${(e: any) => { this.monthlyAverage = e.target.checked; this.loadData(); }}" />
                    ${i18n.t('reports.monthly_average')}
                </label>
            ` : ''}
            <button @click="${this.loadData}">${i18n.t('reports.refresh')}</button>
        </div>
      </div>
      
      <div class="charts-container">
        <div class="chart-card">
            <h3>${i18n.t('reports.category_breakdown')}${this.averageSuffix()}</h3>
            <div class="chart-with-legend" style="height: 500px;">
                <div class="chart-canvas" style="position: relative; height: 100%;">
                    <canvas id="breakdownChart"></canvas>
                </div>
                <div class="custom-legend">
                    ${this.legendItems.map(item => {
                      if (item.isParentHeader) {
                        // Check if any children are hidden
                        const children = this.legendItems.filter(child => !child.isParentHeader && child.familyId === item.id);
                        const anyHidden = children.some(child => child.hidden);
                        // Get the color from the first child (they share the same base color)
                        const baseColor = children.length > 0 ? children[0].color : '#cccccc';
                        
                        return html`
                          <div class="legend-item parent-header">
                              <input 
                                type="color" 
                                class="color-picker"
                                .value="${baseColor}"
                                @change="${(e: any) => this.updateCategoryColor(item.id, e.target.value)}"
                                title="Change category color"
                              />
                              <div style="flex: 1;">${item.name}</div>
                              <span class="legend-icon eye-icon" @click="${() => this.toggleParentGroup(item.id)}" title="Toggle all children visibility">
                                  ${anyHidden ? '👁️' : '👁'}
                              </span>
                              <span class="legend-icon nav-icon" @click="${() => this.navigateToParentCategory(item.id)}" title="View all children transactions">
                                  →
                              </span>
                          </div>
                        `;
                      } else {
                        return html`
                          <div class="legend-item ${item.isChild ? 'child' : ''} ${item.hidden ? 'hidden' : ''}">
                              <div class="legend-color" style="background-color: ${item.color}"></div>
                              <div class="legend-text">${item.icon} ${item.name}</div>
                              ${!item.isChild ? html`
                                <input 
                                  type="color" 
                                  class="color-picker-small"
                                  .value="${item.color}"
                                  @change="${(e: any) => this.updateSingleCategoryColor(item.id, e.target.value)}"
                                  title="Change color"
                                />
                              ` : ''}
                              <span class="legend-icon eye-icon" @click="${() => this.toggleLegendItem(item.index)}" title="Toggle visibility">
                                  ${item.hidden ? '👁️' : '👁'}
                              </span>
                              <span class="legend-icon nav-icon" @click="${() => this.navigateToCategory(item.id)}" title="View transactions">
                                  →
                              </span>
                          </div>
                        `;
                      }
                    })}
                </div>
            </div>
        </div>

        <div class="chart-card">
            <h3>${i18n.t('reports.budget_vs_actual')}${this.averageSuffix()}</h3>
            ${(() => {
              const budgetItems = this.getBudgetItems();
              if (!this.canCompareBudget()) {
                return html`<p class="empty-hint">${i18n.t('reports.budget_hint_period')}</p>`;
              }
              if (budgetItems.length === 0) {
                return html`<p class="empty-hint">${i18n.t('reports.budget_empty')}</p>`;
              }
              return html`
                <div style="position: relative; height: ${Math.min(800, Math.max(180, budgetItems.length * 44 + 80))}px;">
                    <canvas id="budgetChart"></canvas>
                </div>
              `;
            })()}
        </div>

        <div class="chart-card">
            <h3>${i18n.t('reports.sankey_chart')}${this.averageSuffix()}</h3>
            ${this.sankeyData && this.sankeyData.links.length > 0 ? html`
                <div style="position: relative; height: 460px;">
                    <canvas id="sankeyChart"></canvas>
                </div>
            ` : html`<p class="empty-hint">${i18n.t('reports.no_data')}</p>`}
        </div>

        <div class="chart-card">
            <h3>${i18n.t('reports.cost_object_breakdown')}${this.averageSuffix()}</h3>
            ${!this.selectedAccountId
              ? html`<p class="empty-hint">${i18n.t('reports.cost_object_hint')}</p>`
              : this.costObjectData.length > 0 ? html`
                <div style="position: relative; height: 400px;">
                    <canvas id="costObjectChart"></canvas>
                </div>
              ` : html`<p class="empty-hint">${i18n.t('reports.no_data')}</p>`}
        </div>
      </div>
    `;
  }
}
