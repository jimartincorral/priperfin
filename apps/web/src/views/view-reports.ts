import { LitElement, html, css, nothing } from 'lit';
import { customElement, state, query } from 'lit/decorators.js';
import { Chart, registerables } from 'chart.js';
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
  skeleton,
  snackbar,
  watchMobileViewport,
  type SnackbarOptions,
} from '../styles/mobile-ui';
import {
  CHART_PALETTE,
  contentWidth,
  desktopUI,
  paletteColor,
  periodStepper,
  rankedBar,
  statusPill,
  watchViewportWidth,
} from '../styles/desktop-ui';

import { i18n } from '../i18n/i18n';
import { getAppBasePath } from '../utils/router-paths';
import { calculateMonthlyStats } from '../utils/expense-utils';

Chart.register(...registerables);

// Helper function to get text color from CSS variables for dark mode support
function getTextColor(): string {
  const color = getComputedStyle(document.documentElement)
    .getPropertyValue('--md-sys-color-on-surface')
    .trim();
  return color || '#e1e2e6'; // Fallback for dark mode
}

type DateFilterMode = 'month' | 'year' | 'custom' | 'all_time';


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
  @state() groupByCategory = true; // Roll children up into their parent group
  @state() monthlyAverage = false; // Divide amounts by the months in the period
  @state() periodMonths = 1; // Months covered by the current period (for labels)
  @state() breakdownData: any[] = []; // Store raw API response
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
  /** Income for the period, for the desktop strip's income and net cells. */
  @state() periodIncome = 0;

  // --- Desktop layer (> 600px) ---
  /** Families excluded from the doughnut and from every share it drives. */
  @state() hiddenFamilies: Set<string> = new Set();
  @state() private showAccountMenu = false;
  /** Drives the responsive removal of the two side panels. */
  @state() viewportWidth = window.innerWidth;

  // Period sheet holds its edits until Apply
  @state() private sheetMode: DateFilterMode = 'month';
  @state() private sheetYear = new Date().getFullYear();
  @state() private sheetMonth = new Date().getMonth() + 1;
  @state() private sheetStartDate = '';
  @state() private sheetEndDate = '';
  @state() private sheetMonthlyAverage = false;

  private unwatchViewport?: () => void;
  private unwatchWidth?: () => void;
  private snackTimer?: number;

  @query('#breakdownChart') breakdownCanvas!: HTMLCanvasElement;

  private breakdownChart: Chart | null = null;

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
    /* ---------- desktop ---------- */

    .dr-anchor { position: relative; display: flex; flex-shrink: 0; }
    .dr-pop {
      position: absolute;
      top: calc(100% + 6px);
      left: 0;
      z-index: 20;
      min-width: 240px;
      padding: 8px;
      background: var(--md-sys-color-surface-container-lowest);
      border: 1px solid var(--md-sys-color-outline-variant);
      border-radius: 12px;
      box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
      box-sizing: border-box;
    }
    .dr-pop.wide { min-width: 320px; }
    .dr-pop-row {
      display: flex;
      align-items: center;
      gap: 10px;
      width: 100%;
      min-height: 36px;
      padding: 0 10px;
      border-radius: 8px;
      box-sizing: border-box;
      font: 400 13px/18px 'Roboto', sans-serif;
      color: var(--md-sys-color-on-surface);
      cursor: pointer;
    }
    .dr-pop-row:hover { background: var(--md-sys-color-surface-container); }
    .dr-pop-row.selected {
      background: var(--md-sys-color-secondary-container);
      color: var(--md-sys-color-on-secondary-container);
    }
    .dr-pop-title {
      font: 500 13px/18px 'Roboto', sans-serif;
      color: var(--md-sys-color-on-surface);
      padding: 4px 10px 8px;
    }
    .dr-month-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px; padding: 0 6px 6px; }
    .dr-month {
      height: 36px;
      border-radius: 8px;
      background: var(--md-sys-color-surface-container);
      color: var(--md-sys-color-on-surface);
      font: 400 13px/18px 'Roboto', sans-serif;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
    }
    .dr-month.selected { background: var(--md-sys-color-primary); color: var(--md-sys-color-on-primary); }
    .dr-month.future { color: var(--md-sys-color-outline); }
    .dr-year-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 6px 6px;
      font: 500 14px/20px 'Roboto', sans-serif;
    }

    /* Breakdown families, children and the transaction drill-down */
    .dr-family {
      display: flex;
      flex-direction: column;
      gap: 6px;
      padding: 10px 8px;
      margin: 0 -8px;
      border-radius: 8px;
      cursor: pointer;
    }
    .dr-family:hover { background: var(--md-sys-color-surface-container-low); }
    /* A hidden family is dimmed and prints no share, never a >100% figure */
    .dr-family.hidden { opacity: 0.4; }
    .dr-family-head { display: flex; align-items: center; gap: 10px; }
    .dr-family-name {
      flex: 1;
      min-width: 0;
      font: 400 14px/20px 'Roboto', sans-serif;
      color: var(--md-sys-color-on-surface);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .dr-family-amount {
      font: 500 14px/20px 'Roboto Mono', ui-monospace, monospace;
      color: var(--md-sys-color-on-surface);
      white-space: nowrap;
    }
    .dr-family-share {
      width: 38px;
      text-align: right;
      font: 400 12px/16px 'Roboto', sans-serif;
      color: var(--md-sys-color-on-surface-variant);
      flex-shrink: 0;
    }
    .dr-eye {
      display: inline-flex;
      align-items: center;
      color: var(--md-sys-color-outline);
      background: none;
      padding: 0;
      cursor: pointer;
      flex-shrink: 0;
    }
    .dr-eye.static { cursor: default; }
    .dr-eye:hover { color: var(--md-sys-color-on-surface); }

    /* The swatch is the colour input itself, so the value is always the swatch */
    .dr-swatch {
      width: 14px;
      height: 14px;
      padding: 0;
      border: none;
      border-radius: 3px;
      background: none;
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
      -webkit-appearance: none;
      appearance: none;
      cursor: pointer;
      flex-shrink: 0;
    }
    .dr-swatch::-webkit-color-swatch-wrapper { padding: 0; }
    .dr-swatch::-webkit-color-swatch { border: none; border-radius: 3px; }

    .dr-member {
      display: flex;
      align-items: center;
      gap: 10px;
      height: 34px;
      padding: 0 8px;
      border-radius: 8px;
      cursor: pointer;
    }
    .dr-member:hover { background: var(--md-sys-color-surface-container-low); }
    .dr-member-name {
      flex: 1;
      min-width: 0;
      font: 400 13px/18px 'Roboto', sans-serif;
      color: var(--md-sys-color-on-surface-variant);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .dr-member-amount {
      font: 400 13px/18px 'Roboto Mono', ui-monospace, monospace;
      color: var(--md-sys-color-on-surface);
      white-space: nowrap;
    }

    .dr-drill {
      margin: 4px 0 10px 8px;
      padding: 8px 10px;
      border-left: 2px solid var(--md-sys-color-secondary-container);
      background: var(--md-sys-color-surface);
      border-radius: 0 8px 8px 0;
    }
    .dr-tx { display: flex; align-items: center; gap: 12px; height: 28px; }
    .dr-tx-date {
      font: 400 12px/16px 'Roboto Mono', ui-monospace, monospace;
      color: var(--md-sys-color-outline);
      flex-shrink: 0;
    }
    .dr-tx-desc {
      flex: 1;
      min-width: 0;
      font: 400 13px/18px 'Roboto', sans-serif;
      color: var(--md-sys-color-on-surface);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .dr-tx-amount {
      font: 400 13px/18px 'Roboto Mono', ui-monospace, monospace;
      color: var(--md-sys-color-on-surface);
      white-space: nowrap;
    }
    .dr-open { display: inline-flex; align-items: center; gap: 6px; margin-top: 6px; }

    /* Composition */
    .dr-donut-wrap {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 14px 0 12px;
      flex-shrink: 0;
    }
    .dr-donut { position: relative; width: 168px; height: 168px; }
    /* Taken out of flow so Chart.js can never size the panel from the canvas */
    .dr-donut canvas { position: absolute; inset: 0; }
    .dr-donut-hole {
      position: absolute;
      inset: 34px;
      border-radius: 50%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 2px;
      pointer-events: none;
    }
    .dr-donut-total {
      font: 500 16px/20px 'Roboto Mono', ui-monospace, monospace;
      color: var(--md-sys-color-on-surface);
    }
    .dr-legend {
      display: flex;
      flex-shrink: 0;
      align-items: center;
      gap: 10px;
      height: 30px;
      padding: 0 4px;
      border-radius: 6px;
      width: 100%;
      box-sizing: border-box;
      cursor: pointer;
      background: none;
    }
    .dr-legend:hover { background: var(--md-sys-color-surface-container-low); }
    .dr-legend.hidden { opacity: 0.4; }
    .dr-legend-name {
      flex: 1;
      min-width: 0;
      text-align: left;
      font: 400 13px/18px 'Roboto', sans-serif;
      color: var(--md-sys-color-on-surface);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .dr-legend-share {
      font: 400 12px/16px 'Roboto', sans-serif;
      color: var(--md-sys-color-on-surface-variant);
      flex-shrink: 0;
    }

    /* Budget vs actual */
    .dr-budget-name {
      flex: 1;
      min-width: 0;
      font: 400 13px/18px 'Roboto', sans-serif;
      color: var(--md-sys-color-on-surface);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .dr-budget-spent {
      font: 500 13px/18px 'Roboto Mono', ui-monospace, monospace;
      color: var(--md-sys-color-on-surface);
      white-space: nowrap;
    }
    .dr-budget-spent.over { color: var(--md-sys-color-error); }
    .dr-budget-caption {
      font: 400 12px/16px 'Roboto', sans-serif;
      color: var(--md-sys-color-on-surface-variant);
    }
    .dr-budget-caption.over { color: var(--md-sys-color-error); }

    /* Funding sources */
    .dr-owed-label { font: 500 13px/18px 'Roboto', sans-serif; color: var(--md-sys-color-on-surface-variant); }
    .dr-owed {
      font: 500 15px/20px 'Roboto Mono', ui-monospace, monospace;
      color: var(--md-sys-color-error);
    }
  `, mobileUI, desktopUI];

  /**
   * The doughnut is Chart.js, so it has to be redrawn whenever the data behind
   * it changes — including a family being hidden or the grouping toggled, which
   * never go through loadData().
   */
  updated(changed: Map<string, unknown>) {
    super.updated(changed);
    if (this.isMobile) return;
    if (changed.has('breakdownData') || changed.has('hiddenFamilies')
      || changed.has('groupByCategory') || changed.has('viewportWidth')
      || changed.has('isMobile')) {
      this.renderDoughnut();
    }
  }

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
    this.unwatchWidth = watchViewportWidth(this);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    i18n.removeEventListener('lang-change', () => this.requestUpdate());
    this.unwatchViewport?.();
    this.unwatchWidth?.();
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

      // Powers the "vs previous period" delta pill on both layouts
      const previousParams = this.getPreviousPeriodParams();

      const [breakdown, costObjects, periodMonths, previousBreakdown, transactions] = await Promise.all([
        api.get('/reports/category-breakdown', params),
        // Backend only computes cost objects for a specific account
        this.selectedAccountId
          ? api.get('/reports/cost-object-breakdown', params)
          : Promise.resolve([]),
        // Only needed to label the averaged charts
        this.monthlyAverage
          ? api.get('/reports/period-months', params)
          : Promise.resolve({ months: 1 }),
        previousParams
          ? api.get('/reports/category-breakdown', previousParams).catch(() => null)
          : Promise.resolve(null),
        // The breakdown covers spend only; the desktop strip also prints income
        // and net, which come from the period's own transactions.
        this.isMobile ? Promise.resolve([]) : api.get('/transactions', params).catch(() => []),
      ]);

      this.breakdownData = breakdown;
      this.costObjectData = costObjects;
      this.periodMonths = periodMonths?.months || 1;
      this.previousTotal = Array.isArray(previousBreakdown)
        ? previousBreakdown.reduce((sum: number, d: any) => sum + Math.max(0, Number(d.spent) || 0), 0)
        : null;
      this.periodIncome = Array.isArray(transactions)
        ? calculateMonthlyStats(transactions as any[], []).income
        : 0;

      await this.updateComplete; // Ensure DOM is ready
      this.renderDoughnut();
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

  /**
   * The rows the breakdown list and the doughnut share. With "group by parent"
   * on (the default) each row is a family that expands into its children; off,
   * every category is its own row.
   */
  private breakdownRows(): {
    id: string;
    name: string;
    icon: string;
    color: string;
    spent: number;
    members: any[];
  }[] {
    if (this.groupByCategory) return this.getFamilyRows();

    return (this.breakdownData || [])
      .filter((d: any) => Number(d.spent) > 0)
      .map((item: any, index: number) => ({
        id: item.id,
        name: item.name,
        icon: item.icon || '',
        color: this.barColor(item, index),
        spent: Number(item.spent),
        members: [{ ...item, _color: this.barColor(item, index) }],
      }))
      .sort((a, b) => b.spent - a.spent);
  }

  /** Rows still counted in the total: a hidden row is out of every share. */
  private visibleBreakdownRows() {
    return this.breakdownRows().filter(row => !this.hiddenFamilies.has(row.id));
  }

  private toggleFamilyVisibility(familyId: string) {
    const next = new Set(this.hiddenFamilies);
    if (next.has(familyId)) next.delete(familyId);
    else next.add(familyId);
    this.hiddenFamilies = next;
  }

  /**
   * The Composition doughnut. Drawn over the same visible rows as the
   * breakdown list, so the two panels can never disagree.
   */
  renderDoughnut() {
    try {
      if (this.breakdownChart) {
        this.breakdownChart.destroy();
        this.breakdownChart = null;
      }
      if (!this.breakdownCanvas) return;

      const rows = this.visibleBreakdownRows();
      if (rows.length === 0) return;

      this.breakdownChart = new Chart(this.breakdownCanvas, {
        type: 'doughnut',
        data: {
          labels: rows.map(row => row.name),
          datasets: [{
            data: rows.map(row => row.spent),
            backgroundColor: rows.map(row => row.color),
            borderWidth: 0,
          }],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          // The centre hole carries the total, so it has to stay clear
          cutout: '64%',
          plugins: {
            legend: { display: false },
            tooltip: {
              bodyColor: getTextColor(),
              titleColor: getTextColor(),
              callbacks: {
                label: (context: any) => {
                  const total = rows.reduce((sum, row) => sum + row.spent, 0);
                  const share = total > 0 ? Math.round((context.parsed / total) * 100) : 0;
                  return `${context.label}: ${this.money(context.parsed)} (${share}%)`;
                },
              },
            },
          },
        },
      });
    } catch (e: any) {
      console.error('Breakdown Chart Error', e);
    }
  }

  /** Highlights one arc while its legend row is hovered. */
  private highlightArc(index: number | null) {
    if (!this.breakdownChart) return;
    this.breakdownChart.setActiveElements(
      index === null ? [] : [{ datasetIndex: 0, index }]);
    this.breakdownChart.update('none');
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
      
      // Every category that rolls up into this family, the parent included
      const familyCategories = (this.getFamilyRows().find(f => f.id === familyId)?.members ?? [])
        .map((member: any) => ({ id: member.id, name: member.name }));

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
    
    window.location.href = `${getAppBasePath(document.baseURI)}?${params.toString()}`;
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
    
    window.location.href = `${getAppBasePath(document.baseURI)}?${params.toString()}`;
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

  // ------------------------------------------------------------------
  // Desktop layout (> 600px)
  // ------------------------------------------------------------------

  /**
   * The side column needs 380px and the chart panel still needs ~560px; below
   * that the two right-hand panels are removed from the DOM (hiding them would
   * leave their grid tracks reserved) and the grid drops to one column.
   */
  private get showSideCharts() {
    return contentWidth(this.viewportWidth) - 400 >= 560;
  }

  private closeDesktopMenus() {
    this.showAccountMenu = false;
    this.showPeriodSheet = false;
  }

  /** Downloads the visible breakdown, which is what the panel actually shows. */
  private exportBreakdown() {
    const rows = this.visibleBreakdownRows();
    const total = rows.reduce((sum, row) => sum + row.spent, 0);
    const header = ['category', 'spent', 'share'];
    const body = rows.map(row => [
      row.name,
      row.spent.toFixed(2),
      total > 0 ? `${Math.round((row.spent / total) * 100)}%` : '0%',
    ]);
    const csv = [header, ...body]
      .map(line => line.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n');

    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `priperfin-${this.periodLabel().replace(/\s+/g, '-').toLowerCase()}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  private renderDesktop() {
    const showSide = this.showSideCharts;

    return html`
      <div class="d-screen" @click="${() => this.closeDesktopMenus()}">
        ${this.renderDesktopHeader()}
        ${this.renderDesktopStrip()}

        <div
          class="d-content scroll"
          style="grid-template-columns: ${showSide ? 'minmax(0, 1fr) 380px' : 'minmax(0, 1fr)'};
            grid-template-rows: ${showSide
              ? 'minmax(300px, 1.15fr) minmax(260px, 1fr)'
              : 'minmax(320px, 1.2fr) minmax(260px, 1fr)'}">
          ${this.renderBreakdownPanel()}
          ${showSide ? this.renderCompositionPanel() : nothing}
          ${this.renderBudgetPanel()}
          ${showSide ? this.renderFundingPanel() : nothing}
        </div>

        ${this.renderRuleModal()}
      </div>
    `;
  }

  private renderDesktopHeader() {
    const account = this.accounts.find(a => a.id === this.selectedAccountId);
    // A single month has nothing to average over, so the chip is inert there
    const averageDisabled = this.dateFilterMode === 'month';

    return html`
      <div class="d-header">
        <h1>${i18n.t('nav.reports')}</h1>

        <div class="dr-anchor" @click="${(e: Event) => e.stopPropagation()}">
          <button
            class="d-account-chip"
            @click="${() => {
              const open = this.showAccountMenu;
              this.closeDesktopMenus();
              this.showAccountMenu = !open;
            }}">
            ${icon('account_balance', 18)}
            <span>${account ? account.name : i18n.t('reports.all_accounts')}</span>
            ${icon('expand_more', 18)}
          </button>
          ${this.showAccountMenu ? html`
            <div class="dr-pop">
              ${this.getAccountOptions().map(option => html`
                <button
                  class="dr-pop-row ${option.value === this.selectedAccountId ? 'selected' : ''}"
                  @click="${() => {
                    this.showAccountMenu = false;
                    if (option.value === this.selectedAccountId) return;
                    this.selectedAccountId = option.value;
                    this.loadData();
                  }}">
                  <span class="d-emoji">${option.icon ?? ''}</span>
                  <span style="flex: 1; min-width: 0">${option.label}</span>
                  ${option.value === this.selectedAccountId ? icon('check', 18) : nothing}
                </button>
              `)}
            </div>
          ` : nothing}
        </div>

        <div class="dr-anchor" @click="${(e: Event) => e.stopPropagation()}">
          ${periodStepper({
            label: this.periodLabel(),
            open: this.showPeriodSheet,
            onPrev: () => this.stepPeriod(-1),
            onNext: () => this.stepPeriod(1),
            nextDisabled: this.isAtLatestPeriod(),
            prevLabel: i18n.t('mobile.prev_period'),
            nextLabel: i18n.t('mobile.next_period'),
            onLabel: () => {
              const open = this.showPeriodSheet;
              this.closeDesktopMenus();
              if (!open) this.openPeriodSheet();
            },
          })}
          ${this.showPeriodSheet ? this.renderPeriodPopover() : nothing}
        </div>

        <button
          class="d-chip ${this.groupByCategory ? '' : 'outlined'}"
          @click="${() => {
            this.groupByCategory = !this.groupByCategory;
            this.expandedFamilyId = null;
            this.drillCategoryId = null;
          }}">
          ${icon(this.groupByCategory ? 'check' : 'add', 16)}
          <span>${i18n.t('desktop.group_by_parent')}</span>
        </button>

        <button
          class="d-chip ${averageDisabled ? 'muted' : this.monthlyAverage ? '' : 'outlined'}"
          ?disabled="${averageDisabled}"
          title="${averageDisabled
            ? i18n.t('desktop.monthly_average_disabled')
            : i18n.t('reports.monthly_average_hint')}"
          @click="${() => {
            if (averageDisabled) return;
            this.monthlyAverage = !this.monthlyAverage;
            this.loadData();
          }}">
          ${!averageDisabled && this.monthlyAverage ? icon('check', 16) : nothing}
          <span>${i18n.t('reports.monthly_average')}</span>
        </button>

        <div class="d-spacer"></div>

        <button
          class="d-icon-btn"
          title="${i18n.t('desktop.export')}"
          @click="${() => this.exportBreakdown()}">
          ${icon('download', 20)}
        </button>
        <button
          class="d-icon-btn"
          title="${i18n.t('reports.refresh')}"
          @click="${() => this.loadData()}">
          ${icon('refresh', 20)}
        </button>
      </div>
    `;
  }

  /** The month/year/custom picker behind the stepper's centre label. */
  private renderPeriodPopover() {
    const now = new Date();
    const modes: { value: DateFilterMode; label: string }[] = [
      { value: 'month', label: i18n.t('filters.mode_month') },
      { value: 'year', label: i18n.t('filters.mode_year') },
      { value: 'custom', label: i18n.t('filters.mode_custom') },
      { value: 'all_time', label: i18n.t('filters.mode_all_time') },
    ];

    return html`
      <div class="dr-pop wide">
        <div class="dr-pop-title">${i18n.t('mobile.period')}</div>
        <div style="display: flex; flex-wrap: wrap; gap: 6px; padding: 0 6px 8px">
          ${modes.map(mode => html`
            <button
              class="d-chip ${this.sheetMode === mode.value ? '' : 'outlined'}"
              @click="${() => { this.sheetMode = mode.value; }}">
              <span>${mode.label}</span>
            </button>
          `)}
        </div>

        ${this.sheetMode === 'month' || this.sheetMode === 'year' ? html`
          <div class="dr-year-row">
            <button class="d-icon-btn small" @click="${() => { this.sheetYear -= 1; }}">
              ${icon('chevron_left', 20)}
            </button>
            <span>${this.sheetYear}</span>
            <button
              class="d-icon-btn small"
              ?disabled="${this.sheetYear >= now.getFullYear()}"
              @click="${() => { this.sheetYear += 1; }}">
              ${icon('chevron_right', 20)}
            </button>
          </div>
        ` : nothing}

        ${this.sheetMode === 'month' ? html`
          <div class="dr-month-grid">
            ${Array.from({ length: 12 }, (_, i) => i + 1).map(m => {
              const name = new Date(this.sheetYear, m - 1, 1)
                .toLocaleString(i18n.getLocale(), { month: 'short' })
                .replace('.', '');
              const future = this.sheetYear > now.getFullYear()
                || (this.sheetYear === now.getFullYear() && m > now.getMonth() + 1);
              return html`
                <button
                  class="dr-month ${this.sheetMonth === m ? 'selected' : ''} ${future ? 'future' : ''}"
                  @click="${() => { this.sheetMonth = m; }}">
                  ${name.charAt(0).toUpperCase()}${name.slice(1)}
                </button>
              `;
            })}
          </div>
        ` : nothing}

        ${this.sheetMode === 'custom' ? html`
          <div style="display: flex; gap: 8px; padding: 0 6px 8px">
            <input
              class="d-input mono"
              type="date"
              .value="${this.sheetStartDate}"
              @input="${(e: any) => { this.sheetStartDate = e.target.value; }}" />
            <input
              class="d-input mono"
              type="date"
              .value="${this.sheetEndDate}"
              @input="${(e: any) => { this.sheetEndDate = e.target.value; }}" />
          </div>
        ` : nothing}

        <div style="display: flex; justify-content: flex-end; padding: 0 6px 4px">
          <button class="d-btn small plain" @click="${() => this.applyPeriodSheet()}">
            ${i18n.t('mobile.apply')}
          </button>
        </div>
      </div>
    `;
  }

  private renderDesktopStrip() {
    const rows = this.visibleBreakdownRows();
    const total = rows.reduce((sum, row) => sum + row.spent, 0);
    const delta = this.previousTotal !== null && this.previousTotal > 0
      ? ((total - this.previousTotal) / this.previousTotal) * 100
      : null;

    // Averaged spend is per month, so income has to be scaled the same way
    const income = this.monthlyAverage && this.periodMonths > 1
      ? this.periodIncome / this.periodMonths
      : this.periodIncome;
    const net = income - total;

    const budgetItems = this.getBudgetItems();
    const budgetTotal = budgetItems.reduce((sum, item) => sum + item.budget, 0);
    const budgetSpent = budgetItems.reduce((sum, item) => sum + item.spent, 0);
    const usedPct = budgetTotal > 0 ? Math.round((budgetSpent / budgetTotal) * 100) : null;
    const overCount = budgetItems.filter(item => item.spent > item.budget).length;

    return html`
      <div class="d-strip">
        <div class="d-strip-cell" style="gap: 12px">
          <div>
            <div class="d-strip-label">
              ${i18n.t('desktop.spent_in', { period: this.periodLabel() })}
            </div>
            <div class="d-strip-value lead">${this.money(total)}</div>
          </div>
          ${delta !== null && Math.abs(delta) >= 1 ? html`
            <span class="d-pill delta ${delta > 0 ? '' : 'down'}">
              ${icon(delta > 0 ? 'arrow_upward' : 'arrow_downward', 14)}
              <span>
                ${Math.abs(Math.round(delta))}%
                ${i18n.t('mobile.vs_previous', { period: this.previousPeriodLabel() })}
              </span>
            </span>
          ` : nothing}
        </div>

        <div class="d-strip-divider"></div>

        <div class="d-strip-cell">
          <div>
            <div class="d-strip-label">${i18n.t('common.income')}</div>
            <div class="d-strip-value positive">+${this.money(income)}</div>
          </div>
        </div>

        <div class="d-strip-cell">
          <div>
            <div class="d-strip-label">${i18n.t('expenses.net')}</div>
            <div class="d-strip-value ${net >= 0 ? 'positive' : 'negative'}">
              ${net >= 0 ? '+' : '−'}${this.money(net)}
            </div>
          </div>
        </div>

        <div class="d-strip-divider"></div>

        <div class="d-strip-cell">
          <div>
            <div class="d-strip-label">${i18n.t('mobile.budget_used')}</div>
            <div class="d-strip-value ${usedPct === null ? 'muted' : ''}">
              ${usedPct === null ? '—' : `${usedPct}%`}
            </div>
          </div>
        </div>

        <div class="d-spacer"></div>

        ${overCount > 0 ? html`
          <div class="d-strip-cell tight">
            ${statusPill({
              kind: 'warning',
              glyph: 'warning',
              label: i18n.t(
                overCount === 1 ? 'desktop.over_budget_category_one' : 'desktop.over_budget_categories',
                { count: overCount }),
            })}
          </div>
        ` : nothing}
      </div>
    `;
  }

  private renderBreakdownPanel() {
    const rows = this.breakdownRows();
    const visibleTotal = this.visibleBreakdownRows().reduce((sum, row) => sum + row.spent, 0);

    return html`
      <div class="d-panel">
        <div class="d-panel-head">
          <span class="d-panel-title">${i18n.t('desktop.where_money_went')}</span>
          <span class="d-panel-sub">
            ${i18n.t(
              rows.length === 1 ? 'desktop.category_period_one' : 'desktop.categories_period',
              { count: rows.length, period: this.periodLabel() })}${this.averageSuffix()}
          </span>
          <div class="d-spacer"></div>
          <span class="d-panel-hint">${i18n.t('desktop.click_row_hint')}</span>
        </div>

        <div class="d-panel-body">
          ${this.loading
            ? html`
              <div style="display: flex; flex-direction: column; gap: 18px; padding-top: 10px">
                ${Array.from({ length: 6 }, () => html`
                  <div style="display: flex; flex-direction: column; gap: 8px">
                    ${skeleton('45%', '14px')}
                    ${skeleton('100%', '8px', true)}
                  </div>
                `)}
              </div>
            `
            : rows.length === 0
              ? html`<div class="d-empty-row">${i18n.t('reports.no_data')}</div>`
              : rows.map(row => this.renderBreakdownFamily(row, visibleTotal))}
        </div>
      </div>
    `;
  }

  private renderBreakdownFamily(row: {
    id: string; name: string; icon: string; color: string; spent: number; members: any[];
  }, visibleTotal: number) {
    const hidden = this.hiddenFamilies.has(row.id);
    // A hidden family is out of the total, so it has no share to print
    const share = hidden || visibleTotal <= 0 ? 0 : (row.spent / visibleTotal) * 100;
    const members = row.members
      .filter((member: any) => Number(member.spent) > 0)
      .sort((a: any, b: any) => Number(b.spent) - Number(a.spent));
    const expandable = members.length > 1;
    const expanded = this.expandedFamilyId === row.id;

    return html`
      <div style="border-bottom: 1px solid var(--md-sys-color-surface-container-high)">
        <div
          class="dr-family ${hidden ? 'hidden' : ''}"
          role="button"
          tabindex="0"
          @click="${() => {
            if (expandable) this.expandedFamilyId = expanded ? null : row.id;
            else this.openDrillDown(members[0]?.id ?? row.id);
          }}">
          <div class="dr-family-head">
            <input
              class="dr-swatch"
              type="color"
              .value="${row.color}"
              title="${i18n.t('desktop.change_category_colour')}"
              @click="${(e: Event) => e.stopPropagation()}"
              @change="${(e: any) => {
                if (this.groupByCategory) this.updateCategoryColor(row.id, e.target.value);
                else this.updateSingleCategoryColor(row.id, e.target.value);
              }}" />
            <span class="d-emoji">${row.icon}</span>
            <span class="dr-family-name">${row.name}</span>
            <span class="dr-family-amount">${this.money(row.spent)}</span>
            <span class="dr-family-share">${hidden ? '—' : `${Math.round(share)}%`}</span>
            <button
              class="dr-eye"
              title="${i18n.t('desktop.hide_from_chart')}"
              @click="${(e: Event) => { e.stopPropagation(); this.toggleFamilyVisibility(row.id); }}">
              ${icon(hidden ? 'visibility_off' : 'visibility', 18)}
            </button>
            <span class="dr-eye static">
              ${expandable ? icon(expanded ? 'expand_less' : 'expand_more', 18) : icon('chevron_right', 18)}
            </span>
          </div>
          <div class="d-bar thick">
            <div class="d-bar-fill" style="width: ${share}%; background: ${row.color}"></div>
          </div>
        </div>

        ${expanded ? html`
          <div style="padding: 2px 0 12px 32px">
            ${members.map((member: any) => this.renderBreakdownMember(member))}
          </div>
        ` : nothing}
      </div>
    `;
  }

  private renderBreakdownMember(member: any) {
    const drilled = this.drillCategoryId === member.id;

    return html`
      <div>
        <div
          class="dr-member"
          role="button"
          tabindex="0"
          @click="${() => {
            if (drilled) {
              this.drillCategoryId = null;
              this.drillTransactions = [];
            } else {
              this.openDrillDown(member.id);
            }
          }}">
          <span class="d-emoji" style="font-size: 13px">${member.icon || ''}</span>
          <span class="dr-member-name">${member.name}</span>
          <span class="dr-member-amount">${this.money(Number(member.spent))}</span>
          <span class="d-link small">
            ${drilled ? i18n.t('desktop.hide') : `${i18n.t('mobile.see')} ›`}
          </span>
        </div>

        ${drilled ? html`
          <div class="dr-drill">
            ${this.drillLoading
              ? html`<div class="m-progress-bar" style="margin: 0"></div>`
              : this.drillTransactions.length === 0
                ? html`<div class="d-panel-caption">${i18n.t('reports.no_data')}</div>`
                : html`
                  ${this.drillTransactions.slice(0, 8).map(tx => html`
                    <div class="dr-tx">
                      <span class="dr-tx-date">
                        ${new Date(tx.date).toISOString().slice(5, 10)}
                      </span>
                      <span class="dr-tx-desc">${tx.description}</span>
                      <span class="dr-tx-amount">
                        ${Number(tx.amount) < 0 ? '−' : '+'}${this.money(Math.abs(Number(tx.amount)))}
                      </span>
                    </div>
                  `)}
                `}
            <button class="d-link small dr-open" @click="${() => this.navigateToCategory(member.id)}">
              <span>${i18n.t('desktop.open_in_expenses')}</span>
              ${icon('arrow_forward', 14)}
            </button>
          </div>
        ` : nothing}
      </div>
    `;
  }

  private renderCompositionPanel() {
    const rows = this.breakdownRows();
    const visible = this.visibleBreakdownRows();
    const total = visible.reduce((sum, row) => sum + row.spent, 0);

    return html`
      <div class="d-panel pad">
        <div class="d-panel-title">${i18n.t('desktop.composition')}</div>

        <div class="dr-donut-wrap">
          <div class="dr-donut">
            <canvas id="breakdownChart"></canvas>
            <div class="dr-donut-hole">
              <span class="d-micro">${i18n.t('common.total')}</span>
              <span class="dr-donut-total">${this.money(total)}</span>
            </div>
          </div>
        </div>

        <div class="d-panel-body" style="padding: 0; display: flex; flex-direction: column; gap: 2px">
          ${rows.map(row => {
            const hidden = this.hiddenFamilies.has(row.id);
            const share = hidden || total <= 0 ? 0 : (row.spent / total) * 100;
            const arcIndex = visible.findIndex(entry => entry.id === row.id);
            return html`
              <button
                class="dr-legend ${hidden ? 'hidden' : ''}"
                @mouseenter="${() => this.highlightArc(arcIndex === -1 ? null : arcIndex)}"
                @mouseleave="${() => this.highlightArc(null)}"
                @click="${() => this.toggleFamilyVisibility(row.id)}">
                <span class="d-dot" style="background: ${row.color}"></span>
                <span class="dr-legend-name">${row.icon} ${row.name}</span>
                <span class="dr-legend-share">${hidden ? '—' : `${Math.round(share)}%`}</span>
              </button>
            `;
          })}
        </div>
      </div>
    `;
  }

  private renderBudgetPanel() {
    const items = this.getBudgetItems();
    const totalSpent = items.reduce((sum, item) => sum + item.spent, 0);
    const totalBudget = items.reduce((sum, item) => sum + item.budget, 0);

    return html`
      <div class="d-panel">
        <div class="d-panel-head">
          <span class="d-panel-title">${i18n.t('reports.budget_vs_actual')}</span>
          ${items.length > 0 ? html`
            <span class="d-panel-sub">
              ${i18n.t('desktop.of_budget', {
                spent: this.money(totalSpent),
                budget: this.money(totalBudget),
              })}
            </span>
          ` : nothing}
        </div>

        <div class="d-panel-body stack">
          ${!this.canCompareBudget()
            ? html`<div class="d-empty-row">${i18n.t('reports.budget_hint_period')}</div>`
            : items.length === 0
              ? html`<div class="d-empty-row">${i18n.t('reports.budget_empty')}</div>`
              : items.map(item => {
                  const over = item.spent > item.budget;
                  const pct = item.budget > 0 ? Math.min(100, (item.spent / item.budget) * 100) : 0;
                  const diff = Math.abs(item.budget - item.spent);
                  return html`
                    <div style="display: flex; flex-direction: column; gap: 5px">
                      <div style="display: flex; align-items: baseline; gap: 8px">
                        <span class="dr-budget-name">${item.name}</span>
                        <span class="dr-budget-spent ${over ? 'over' : ''}">${this.money(item.spent)}</span>
                        <span class="d-panel-hint">
                          ${i18n.t('desktop.of_amount', { amount: this.money(item.budget) })}
                        </span>
                      </div>
                      <div class="d-bar thick">
                        <div
                          class="d-bar-fill ${over ? 'over' : ''}"
                          style="width: ${pct}%${over ? '' : `; background: ${item.color}`}"></div>
                      </div>
                      <div class="dr-budget-caption ${over ? 'over' : ''}">
                        ${over
                          ? i18n.t('desktop.over_by', { amount: this.money(diff) })
                          : i18n.t('mobile.left_over', { amount: this.money(diff) })}
                      </div>
                    </div>
                  `;
                })}
        </div>
      </div>
    `;
  }

  private renderFundingPanel() {
    const data = this.costObjectData || [];
    const total = data.reduce((sum: number, entry: any) => sum + Number(entry.total), 0);

    return html`
      <div class="d-panel pad">
        <div class="d-panel-title">${i18n.t('cost_objects.title')}</div>
        <div class="d-panel-caption">${i18n.t('desktop.funding_sub')}</div>

        <div class="d-panel-body stack">
          ${!this.selectedAccountId
            ? html`<div class="d-panel-caption">${i18n.t('reports.cost_object_hint')}</div>`
            : data.length === 0
              ? html`<div class="d-panel-caption">${i18n.t('reports.no_data')}</div>`
              : data.map((entry: any, index: number) => {
                  const share = total > 0 ? (Number(entry.total) / total) * 100 : 0;
                  return rankedBar({
                    emoji: entry.icon || '',
                    name: entry.name,
                    amount: this.money(Number(entry.total)),
                    percent: share,
                    share: `${Math.round(share)}%`,
                    color: entry.color || paletteColor(index),
                  });
                })}
        </div>

        ${this.selectedAccountId && data.length > 0 ? html`
          <div class="d-panel-foot">
            <span class="dr-owed-label">${i18n.t('cost_objects.total_owed')}</span>
            <span class="dr-owed">${this.money(total)}</span>
          </div>
        ` : nothing}
      </div>
    `;
  }

  render() {
    return this.isMobile ? this.renderMobile() : this.renderDesktop();
  }
}
