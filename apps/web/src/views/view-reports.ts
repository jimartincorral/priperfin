import { LitElement, html, css } from 'lit';
import { customElement, state, query } from 'lit/decorators.js';
import { Chart, registerables } from 'chart.js';
import { api } from '../api/client';

import { i18n } from '../i18n/i18n';

Chart.register(...registerables);

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
  @state() breakdownData: any[] = []; // Store raw API response
  @state() legendItems: any[] = []; // For custom legend rendering

  @query('#breakdownChart') breakdownCanvas!: HTMLCanvasElement;

  private breakdownChart: Chart | null = null;

  static styles = css`
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
  `;

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
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    i18n.removeEventListener('lang-change', () => this.requestUpdate());
  }

  getYearOptions(): number[] {
    const currentYear = new Date().getFullYear();
    const years: number[] = [];
    for (let y = currentYear - 5; y <= currentYear; y++) {
      years.push(y);
    }
    return years;
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

      const breakdown = await api.get('/reports/category-breakdown', params);

      this.breakdownData = breakdown;
      
      await this.updateComplete; // Ensure DOM is ready
      this.renderBreakdown();
    } catch (e: any) {
      console.error(e);
      alert('Failed to load reports: ' + (e.message || e));
    } finally {
      this.loading = false;
    }
  }

  renderBreakdown() {
    try {
      if (this.breakdownChart) this.breakdownChart.destroy();
      if (!this.breakdownCanvas) return;

      let data = this.breakdownData || [];

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
      alert('Failed to update color: ' + (e.message || e));
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
      alert('Failed to update color: ' + (e.message || e));
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

  render() {
    return html`
      <div class="header">
        <h1>${i18n.t('reports.title')}</h1>
        <div class="controls">
            <select @change="${(e: any) => { this.selectedAccountId = e.target.value; this.loadData(); }}" .value="${this.selectedAccountId}" style="min-width: 150px;">
                <option value="">🏦 ${i18n.t('reports.all_accounts')}</option>
                ${this.accounts.map(a => html`<option value="${a.id}">${a.type === 'CREDIT' ? '💳' : '🏦'} ${a.name}</option>`)}
            </select>
            <select @change="${(e: any) => { this.dateFilterMode = e.target.value as DateFilterMode; this.loadData(); }}" .value="${this.dateFilterMode}">
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
            <button @click="${this.loadData}">${i18n.t('reports.refresh')}</button>
        </div>
      </div>
      
      <div class="charts-container">
        <div class="chart-card">
            <h3>${i18n.t('reports.category_breakdown')}</h3>
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
      </div>
    `;
  }
}
