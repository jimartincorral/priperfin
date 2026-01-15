import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { api } from '../api/client';
import '../components/filterable-select';
import type { SelectOption } from '../components/filterable-select';

import { i18n } from '../i18n/i18n';

interface Filter {
  id: string;
  field: string;
  operator: string;
  value: string;
}

@customElement('view-goals')
export class ViewGoals extends LitElement {
  @state() goals: any[] = [];
  @state() categories: any[] = [];
  @state() loading = false;
  @state() currency = 'USD';

  @state() totalSavings: number = 0;
  @state() unassigned: number = 0;

  // Inline Editing State
  @state() editingCell: { id: string, field: string } | null = null;
  @state() editValue: any = null;

  @state() sortField = 'targetDate';
  @state() sortDirection: 'asc' | 'desc' = 'asc';

  @state() filters: Filter[] = [];
  @state() filterField: string = 'name';
  @state() filterOperator: string = 'contains';
  @state() filterValue: string = '';

  @state() showDistributeMenu: 'unassigned' | 'all' | null = null;
  
  @state() showAddRow = false;
  @state() newGoal: any = { name: '', categoryId: '', startDate: '', targetDate: '', targetAmount: 0, isEvergreen: false, targetMonths: null };

  get sortedGoals() {
    let goalsArray = Array.isArray(this.goals) ? [...this.goals] : [];

    // Apply Filters
    if (this.filters.length > 0) {
      goalsArray = goalsArray.filter(g => this.checkFilter(g));
    }

    return goalsArray.sort((a, b) => {
      let valA = a[this.sortField];
      let valB = b[this.sortField];

      if (this.sortField === 'categoryId') {
        const catA = this.categories.find(c => c.id === a.categoryId);
        const catB = this.categories.find(c => c.id === b.categoryId);
        valA = catA ? catA.name : '';
        valB = catB ? catB.name : '';
      } else if (this.sortField === 'status') {
        const getDiff = (g: any) => Number(g.savedAmount || 0) - Number(g.shouldHaveSaved || 0);
        valA = getDiff(a);
        valB = getDiff(b);
      }

      if (valA < valB) return this.sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return this.sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }

  checkFilter(goal: any) {
      return this.filters.every(filter => {
          let goalValue = goal[filter.field];
          
          if (filter.field === 'categoryId') {
             const cat = this.categories.find(c => c.id === goal.categoryId);
             goalValue = cat ? cat.name : ''; 
          } else if (filter.field === 'status') {
             const targetAmount = Number(goal.targetAmount || 0);
             const savedAmount = Number(goal.savedAmount || 0);
             const percent = targetAmount > 0 ? (savedAmount / targetAmount) * 100 : 0;
             const shouldHave = Number(goal.shouldHaveSaved || 0);
             const diff = savedAmount - shouldHave;
             
             if (percent >= 100) goalValue = 'completed';
             else if (diff < 0) goalValue = 'at_risk';
             else goalValue = 'on_track';
          }

          let filterVal: any = filter.value;
          let itemVal: any = goalValue;

          // Numeric handling
          if (['targetAmount', 'savedAmount'].includes(filter.field)) {
             itemVal = Number(itemVal || 0);
             filterVal = Number(filterVal);
          } else if (['startDate', 'targetDate'].includes(filter.field)) {
             itemVal = itemVal ? new Date(itemVal).getTime() : 0;
             filterVal = filterVal ? new Date(filterVal).getTime() : 0;
          } else {
             itemVal = String(itemVal || '').toLowerCase();
             filterVal = String(filterVal).toLowerCase();
          }

          switch (filter.operator) {
            case 'contains': return typeof itemVal === 'string' && itemVal.includes(filterVal);
            case 'equals': return itemVal == filterVal;
            case 'gt': return itemVal > filterVal;
            case 'lt': return itemVal < filterVal;
            case 'gte': return itemVal >= filterVal;
            case 'lte': return itemVal <= filterVal;
            default: return true;
          }
      });
  }

  addFilter() {
    // Basic validation
    if (!this.filterValue && this.filterOperator === 'contains') return;

    this.filters = [
      ...this.filters,
      {
        id: Math.random().toString(36).substring(7),
        field: this.filterField,
        operator: this.filterOperator,
        value: this.filterValue
      }
    ];
    this.filterValue = ''; 
    this.saveFilters();
  }

  removeFilter(id: string) {
    this.filters = this.filters.filter(f => f.id !== id);
    this.saveFilters();
  }

  clearFilters() {
    this.filters = [];
    this.saveFilters();
  }

  saveFilters() {
      localStorage.setItem('priperfin_goals_filters', JSON.stringify(this.filters));
  }

  getFieldLabel(field: string) {
      switch(field) {
          case 'name': return i18n.t('goals.goal_name');
          case 'categoryId': return i18n.t('common.category');
          case 'startDate': return i18n.t('goals.start_date');
          case 'targetDate': return i18n.t('goals.target_date');
          case 'targetAmount': return i18n.t('goals.target_amount');
          case 'savedAmount': return i18n.t('goals.current_saved');
          case 'status': return i18n.t('goals.status.on_track');
          default: return field;
      }
  }

  getOperatorLabel(op: string) {
      return i18n.t(`goals.filter.op.${op}`) || op;
  }

  toggleSort(field: string) {
    if (this.sortField === field) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortField = field;
      this.sortDirection = 'asc';
    }
  }

  getCategoryOptions(): SelectOption[] {
    const options: SelectOption[] = [
      { value: '', label: i18n.t('common.uncategorized') }
    ];
    
    // Goals use simple category list (no hierarchy)
    const goalCategories = this.categories.filter(c => c.type === 'GOAL').sort((a, b) => a.name.localeCompare(b.name));
    
    goalCategories.forEach(cat => {
      options.push({
        value: cat.id,
        label: cat.name,
        icon: cat.icon
      });
    });
    
    return options;
  }

  static styles = css`
    :host { display: block; }
    
    .header-controls { 
        display: flex; 
        align-items: center; 
        gap: 2rem; 
        margin-bottom: 24px; 
        background: var(--md-sys-color-surface-container-low); 
        padding: 24px; 
        border-radius: var(--md-sys-shape-corner-medium); 
        box-shadow: 0 1px 3px 0 rgba(0,0,0,0.12), 0 1px 2px 0 rgba(0,0,0,0.24); 
    }
    h1 { font: var(--md-sys-typescale-headline-medium); color: var(--md-sys-color-on-surface); margin: 0; }
    
    .savings-input { display: flex; flex-direction: column; gap: 8px; }
    .savings-input label { font: var(--md-sys-typescale-label-medium); color: var(--md-sys-color-on-surface-variant); text-transform: uppercase; letter-spacing: 0.05em; }
    .savings-input input { 
        font: var(--md-sys-typescale-headline-small); 
        padding: 8px 0;
        border: none;
        border-bottom: 1px solid var(--md-sys-color-outline); 
        border-radius: 4px 4px 0 0; 
        color: var(--md-sys-color-on-surface); 
        width: 140px; 
        background: transparent;
        transition: border-color 0.2s, background-color 0.2s;
    }
    .savings-input input:focus { border-bottom: 2px solid var(--md-sys-color-primary); outline: none; background-color: var(--md-sys-color-surface-container-highest); }
    
    select option {
        background-color: var(--md-sys-color-surface);
        color: var(--md-sys-color-on-surface);
    }

    .unassigned-badge { padding: 8px 16px; border-radius: 20px; font: var(--md-sys-typescale-label-large); display: inline-flex; align-items: center; }
    .unassigned-badge.positive { background: #dcfce7; color: #14532d; }
    .unassigned-badge.negative { background: var(--md-sys-color-error-container); color: var(--md-sys-color-on-error-container); }

    /* Buttons */
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
        transition: background-image 0.2s, box-shadow 0.2s;
    }
    .btn-primary {
        background-color: var(--md-sys-color-primary);
        color: var(--md-sys-color-on-primary);
        box-shadow: 0 1px 2px rgba(0,0,0,0.12);
    }
    .btn-primary:hover {
        box-shadow: 0 1px 3px 1px rgba(0,0,0,0.15);
        background-image: linear-gradient(rgba(255,255,255,0.08), rgba(255,255,255,0.08));
    }
    .btn-secondary {
        background-color: var(--md-sys-color-surface-container-high);
        color: var(--md-sys-color-on-surface);
        box-shadow: 0 1px 2px rgba(0,0,0,0.12);
    }
    .btn-secondary:hover {
        box-shadow: 0 1px 3px 1px rgba(0,0,0,0.15);
        background-image: linear-gradient(rgba(0,0,0,0.05), rgba(0,0,0,0.05));
    }
    .btn-secondary:disabled {
        opacity: 0.4;
        cursor: not-allowed;
    }
    .btn-warning {
        background-color: var(--md-sys-color-error-container);
        color: var(--md-sys-color-on-error-container);
        box-shadow: 0 1px 2px rgba(0,0,0,0.12);
    }
    .btn-warning:hover {
        box-shadow: 0 1px 3px 1px rgba(0,0,0,0.15);
        background-image: linear-gradient(rgba(0,0,0,0.08), rgba(0,0,0,0.08));
    }
    .btn-danger {
        background-color: var(--md-sys-color-error);
        color: var(--md-sys-color-on-error);
        width: 32px; height: 32px; padding: 0;
    }

    /* Distribute Menu */
    .distribute-menu {
        position: absolute;
        top: 100%;
        right: 0;
        margin-top: 4px;
        background: var(--md-sys-color-surface);
        border: 1px solid var(--md-sys-color-outline);
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 100;
        min-width: 320px;
    }
    .distribute-menu .menu-item {
        padding: 12px 16px;
        cursor: pointer;
        display: flex;
        flex-direction: column;
        gap: 4px;
        border-bottom: 1px solid var(--md-sys-color-outline-variant);
    }
    .distribute-menu .menu-item:last-child {
        border-bottom: none;
    }
    .distribute-menu .menu-item:hover {
        background: var(--md-sys-color-surface-container-highest);
    }
    .distribute-menu .menu-item strong {
        color: var(--md-sys-color-on-surface);
        font: var(--md-sys-typescale-label-large);
    }
    .distribute-menu .menu-item span {
        font-size: 0.75rem;
        color: var(--md-sys-color-on-surface-variant);
        font: var(--md-sys-typescale-body-small);
    }


    /* Tables */
    .table-container { 
        overflow-x: auto; -webkit-overflow-scrolling: touch; 
        border-radius: var(--md-sys-shape-corner-large); 
        border: 1px solid var(--md-sys-color-outline-variant);
        margin-bottom: 2rem;
        background: var(--md-sys-color-surface);
    }
    table { width: 100%; min-width: 800px; border-collapse: separate; border-spacing: 0; background: var(--md-sys-color-surface); }
    th, td { padding: 12px 16px; text-align: left; border-bottom: 1px solid var(--md-sys-color-outline-variant); vertical-align: middle; color: var(--md-sys-color-on-surface); }
    th { background: var(--md-sys-color-surface-container); font: var(--md-sys-typescale-title-small); color: var(--md-sys-color-on-surface-variant); text-transform: none; letter-spacing: 0.1px; }
    td { font: var(--md-sys-typescale-body-medium); }
    tr:last-child td { border-bottom: none; }
    tr:hover { background-color: var(--md-sys-color-surface-container-highest); }
    
    .progress-bar { height: 8px; background: var(--md-sys-color-surface-variant); border-radius: 4px; overflow: hidden; width: 100px; display: inline-block; vertical-align: middle; margin-right: 0.5rem; }
    .progress-fill { height: 100%; background: var(--md-sys-color-primary); }
    .status-ok { color: #166534; font: var(--md-sys-typescale-label-medium); }
    .status-behind { color: var(--md-sys-color-error); font: var(--md-sys-typescale-label-medium); }
    .category-tag { display: inline-block; padding: 4px 12px; border-radius: 8px; font: var(--md-sys-typescale-label-small); background: var(--md-sys-color-secondary-container); color: var(--md-sys-color-on-secondary-container); }
    
    .col-date { white-space: nowrap; }

    td.editable { cursor: pointer; position: relative; }
    td.editable:hover { background-color: var(--md-sys-color-surface-container-highest); }
    td.editable input, td.editable select { width: 100%; height: 100%; box-sizing: border-box; padding: 4px; font: inherit; border: none; background: transparent; }
    td.editable input:focus, td.editable select:focus { outline: none; border-bottom: 2px solid var(--md-sys-color-primary); }
    
    /* New Line specific styles */
    tr.new-line { background-color: var(--md-sys-color-surface-container-high); }
    tr.new-line input, tr.new-line select { 
        width: 100%; 
        padding: 8px 12px; 
        border: 1px solid var(--md-sys-color-outline); 
        border-radius: 4px; 
        background: var(--md-sys-color-surface);
        color: var(--md-sys-color-on-surface);
        font: var(--md-sys-typescale-body-medium);
    }
    .totals-row { 
        background-color: var(--md-sys-color-surface-container-highest); 
    }
    .totals-row td { 
        border-top: 2px solid var(--md-sys-color-outline);
        color: var(--md-sys-color-primary);
        font: var(--md-sys-typescale-title-small);
    }

    /* Filter Styles */
    .card {
        background: var(--md-sys-color-surface-container-low);
        border-radius: var(--md-sys-shape-corner-medium);
        box-shadow: 0 1px 3px 0 rgba(0,0,0,0.12), 0 1px 2px 0 rgba(0,0,0,0.24);
    }
    
    .filter-controls {
        margin-bottom: 1rem;
        background: var(--md-sys-color-surface-container);
        padding: 16px;
        border-radius: var(--md-sys-shape-corner-medium);
        display: flex;
        flex-direction: column;
        gap: 12px;
    }
    .filter-row {
        display: flex;
        gap: 12px;
        align-items: center;
        flex-wrap: wrap;
    }
    .filter-row select, .filter-row input {
        height: 36px;
        padding: 0 12px;
        border: 1px solid var(--md-sys-color-outline);
        border-radius: 4px;
        background: var(--md-sys-color-surface);
        color: var(--md-sys-color-on-surface);
    }
    .chip-container {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
    }
    .chip {
        display: inline-flex;
        align-items: center;
        background: var(--md-sys-color-secondary-container);
        color: var(--md-sys-color-on-secondary-container);
        padding: 4px 12px;
        border-radius: 16px;
        font: var(--md-sys-typescale-label-medium);
        gap: 8px;
    }
    .chip button {
        background: none;
        border: none;
        color: inherit;
        cursor: pointer;
        padding: 0;
        font-size: 16px;
        width: auto;
        height: auto;
        display: flex;
    }
    .chip button:hover {
        opacity: 0.7;
        box-shadow: none;
        background: none;
    }

    @media (max-width: 768px) {
        .header-controls {
            flex-direction: column;
            align-items: stretch;
            gap: 16px;
            padding: 16px;
        }
        .table-container {
            border-top-right-radius: 0;
            border-bottom-right-radius: 0;
            border-right: none;
            margin-right: -1rem;
        }
    }
  `;


  async firstUpdated() {
    const savedTotal = localStorage.getItem('priperfin_total_savings');
    if (savedTotal) this.totalSavings = parseFloat(savedTotal);

    const storedCurrency = localStorage.getItem('priperfin_currency');
    if (storedCurrency) this.currency = storedCurrency;

    const savedFilters = localStorage.getItem('priperfin_goals_filters');
    if (savedFilters) {
        try {
            this.filters = JSON.parse(savedFilters);
        } catch (e) {
            console.error('Failed to parse filters', e);
        }
    }

    await this.loadData();
  }

  connectedCallback() {
    super.connectedCallback();
    i18n.addEventListener('lang-change', () => this.requestUpdate());
    document.addEventListener('click', this.handleOutsideClick);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    i18n.removeEventListener('lang-change', () => this.requestUpdate());
    document.removeEventListener('click', this.handleOutsideClick);
  }

  handleOutsideClick = () => {
    if (this.showDistributeMenu) {
      this.showDistributeMenu = null;
    }
  };

  async loadData() {
    this.loading = true;
    try {
      const [goals, allCats] = await Promise.all([
        api.get('/savings-goals'),
        api.get('/categories')
      ]);
      this.goals = (Array.isArray(goals) ? goals : []) as any[];
      this.categories = allCats.filter((c: any) => c.type === 'GOAL');
      this.calculateUnassigned();
    } catch (e) {
      console.error('loadData error:', e);
    } finally {
      this.loading = false;
    }
  }

  getMonthlySaving(g: any) {
    const targetAmount = Number(g.targetAmount || 0);
    const savedAmount = Number(g.savedAmount || 0);
    if (targetAmount <= savedAmount) return 0;
    
    if (g.isEvergreen && g.targetMonths) {
      // For evergreen goals, use targetMonths
      return (targetAmount - savedAmount) / g.targetMonths;
    } else if (g.targetDate) {
      // For timed goals, calculate based on target date
      const now = new Date();
      const target = new Date(g.targetDate);
      if (target <= now) return targetAmount - savedAmount;
      const diffMonths = (target.getFullYear() - now.getFullYear()) * 12 + (target.getMonth() - now.getMonth());
      return (targetAmount - savedAmount) / Math.max(1, diffMonths);
    }
    
    return 0;
  }

  calculateUnassigned() {
    const allocated = this.goals.reduce((sum, goal) => sum + Number(goal.savedAmount), 0);
    this.unassigned = this.totalSavings - allocated;
  }

  handleTotalSavingsChange(e: Event) {
    const val = parseFloat((e.target as HTMLInputElement).value) || 0;
    this.totalSavings = val;
    localStorage.setItem('priperfin_total_savings', val.toString());
    this.calculateUnassigned();
  }

  // --- Inline Editing Logic ---

  startEditing(id: string, field: string, value: any) {
    this.editingCell = { id, field };
    this.editValue = value;
    // Delay focus to let render happen
    setTimeout(() => {
      const input = this.shadowRoot?.querySelector(`#edit-${id}-${field}`) as HTMLElement;
      if (input) input.focus();
    }, 0);
  }

  cancelEditing() {
    this.editingCell = null;
    this.editValue = null;
  }

  // Save a single cell update
  async saveCell(id: string, field: string) {
    if (this.editValue === null) return;

    // Optimistic / Sanitization
    let payload: any = {};

    if (field === 'targetAmount' || field === 'savedAmount') {
      payload[field] = isNaN(parseFloat(this.editValue)) ? 0 : parseFloat(this.editValue);
    } else if (field === 'categoryId') {
      payload[field] = this.editValue === '' || this.editValue === 'uncategorized' ? null : this.editValue;
    } else if (field === 'startDate' || field === 'targetDate') {
      if (!this.editValue) {
        // For required fields, we might want to prevent empty saving or revert
        // But for now, we just don't send updates if it's invalid for required fields
        if (field === 'targetDate') { this.cancelEditing(); return; } // Target date required
        payload[field] = null; // Start date optional
      } else {
        payload[field] = new Date(this.editValue).toISOString();
      }
    } else {
      payload[field] = this.editValue;
    }

    try {
      await api.patch(`/savings-goals/${id}`, payload);
      this.editingCell = null;
      this.editValue = null;
      await this.loadData();
    } catch (e: any) {
      console.error('Failed to update cell', e);
      alert('Update failed: ' + (e.message || 'Unknown error'));
      this.cancelEditing();
    }
  }

  handleKeyDown(e: KeyboardEvent, id: string, field: string) {
    if (e.key === 'Enter') {
      this.saveCell(id, field);
    } else if (e.key === 'Escape') {
      this.cancelEditing();
    }
  }

  // --- New Goal Creation ---

  async createGoal() {
    const payload: any = { ...this.newGoal };

    // Validation
    if (!payload.name) { alert('Name is required'); return; }
    if (!payload.targetAmount) { alert('Target Amount is required'); return; }
    
    if (payload.isEvergreen) {
      // Evergreen goal validation
      if (!payload.targetMonths || payload.targetMonths <= 0) {
        alert('Target months is required for evergreen goals');
        return;
      }
      // Clear targetDate for evergreen goals
      payload.targetDate = null;
    } else {
      // Timed goal validation
      if (!payload.targetDate) { alert('Target Date is required'); return; }
      
      const startDate = new Date(payload.startDate);
      const targetDate = new Date(payload.targetDate);
      if (targetDate < startDate) {
        alert('Target date cannot be before start date.');
        return;
      }
      // Clear targetMonths for timed goals
      payload.targetMonths = null;
    }

    // Sanitization
    if (!payload.categoryId) payload.categoryId = null;
    if (isNaN(payload.targetAmount)) payload.targetAmount = 0;
    if (isNaN(payload.savedAmount)) payload.savedAmount = 0;

    try {
      await api.post('/savings-goals', payload);
      // Reset form
      this.newGoal = { name: '', targetAmount: 0, startDate: new Date().toISOString().split('T')[0], targetDate: '', savedAmount: 0, categoryId: '', isEvergreen: false, targetMonths: 12 };
      this.showAddRow = false;
      await this.loadData();
    } catch (e: any) {
      console.error('Failed to create goal', e);
      alert('Failed to create goal: ' + (e.message || 'Unknown error'));
    }
  }

  async deleteGoal(id: string) {
    if (!confirm(i18n.t('common.confirm_delete'))) return;
    try {
      await api.delete(`/savings-goals/${id}`);
      await this.loadData();
    } catch (e: any) {
      alert('Failed to delete: ' + (e.message || 'Error'));
    }
  }

  getCategoryName(id: string) {
    const cat = this.categories.find(c => c.id === id);
    return cat ? cat.name : '';
  }

  // --- Distribution Helper Methods ---

  getEffectiveTargetDate(goal: any): Date {
    if (goal.isEvergreen && goal.targetMonths) {
      const start = goal.startDate ? new Date(goal.startDate) : new Date();
      start.setMonth(start.getMonth() + goal.targetMonths);
      return start;
    }
    return goal.targetDate ? new Date(goal.targetDate) : new Date('9999-12-31');
  }

  getEffectiveShouldHaveSaved(goal: any): number {
    // If backend already calculated it (timed goals)
    if (goal.shouldHaveSaved !== null && goal.shouldHaveSaved !== undefined) {
      return Number(goal.shouldHaveSaved);
    }
    
    // For evergreen goals, calculate based on elapsed time vs targetMonths
    if (goal.isEvergreen && goal.targetMonths) {
      const start = goal.startDate ? new Date(goal.startDate) : new Date();
      const now = new Date();
      const elapsedMs = now.getTime() - start.getTime();
      const totalMs = goal.targetMonths * 30.44 * 24 * 60 * 60 * 1000; // Average month duration
      const progress = Math.min(1, Math.max(0, elapsedMs / totalMs));
      return Number(goal.targetAmount) * progress;
    }
    
    return 0;
  }

  getDistributableGoals(): any[] {
    return this.goals.filter(g => {
      const target = Number(g.targetAmount || 0);
      const saved = Number(g.savedAmount || 0);
      return target > saved; // Not completed
    });
  }

  // --- Distribution Methods ---

  async distributeByDate(availableFunds: number, resetFirst: boolean) {
    // If resetting, we need to reset ALL goals first, then distribute to distributable ones
    let updates: { id: string; savedAmount: number }[] = [];
    
    if (resetFirst) {
      // Reset all goals to 0
      updates = this.goals.map(g => ({ id: g.id, savedAmount: 0 }));
      // Apply resets first
      for (const { id, savedAmount } of updates) {
        await api.patch(`/savings-goals/${id}`, { savedAmount });
      }
      // Reload data to get fresh state
      await this.loadData();
      updates = [];
    }
    
    const goals = this.getDistributableGoals()
      .sort((a, b) => this.getEffectiveTargetDate(a).getTime() - this.getEffectiveTargetDate(b).getTime());
    
    let remaining = availableFunds;
    let totalAllocated = 0;
    
    for (let i = 0; i < goals.length; i++) {
      const goal = goals[i];
      const isLast = i === goals.length - 1;
      
      if (remaining <= 0) break;
      
      const currentSaved = Number(goal.savedAmount || 0);
      const target = Number(goal.targetAmount);
      const needed = target - currentSaved;
      
      if (needed > 0) {
        let toAdd: number;
        if (isLast) {
          // Last goal gets exactly what's remaining to ensure total = availableFunds
          toAdd = Math.round((availableFunds - totalAllocated) * 100) / 100;
        } else {
          toAdd = Math.min(remaining, needed);
          toAdd = Math.round(toAdd * 100) / 100; // Round to 2 decimals
        }
        
        const newAmount = Math.round((currentSaved + toAdd) * 100) / 100;
        updates.push({ id: goal.id, savedAmount: newAmount });
        remaining -= toAdd;
        totalAllocated += toAdd;
      }
    }
    
    await this.applyDistribution(updates);
  }

  async distributeToOnTrackByDate(availableFunds: number, resetFirst: boolean) {
    // If resetting, we need to reset ALL goals first, then distribute to distributable ones
    let updates: { id: string; savedAmount: number }[] = [];
    
    if (resetFirst) {
      // Reset all goals to 0
      updates = this.goals.map(g => ({ id: g.id, savedAmount: 0 }));
      // Apply resets first
      for (const { id, savedAmount } of updates) {
        await api.patch(`/savings-goals/${id}`, { savedAmount });
      }
      // Reload data to get fresh state
      await this.loadData();
      updates = [];
    }
    
    const goals = this.getDistributableGoals()
      .sort((a, b) => this.getEffectiveTargetDate(a).getTime() - this.getEffectiveTargetDate(b).getTime());
    
    let remaining = availableFunds;
    let totalAllocated = 0;
    
    for (let i = 0; i < goals.length; i++) {
      const goal = goals[i];
      const isLast = i === goals.length - 1;
      
      if (remaining <= 0) break;
      
      const currentSaved = Number(goal.savedAmount || 0);
      const shouldHave = this.getEffectiveShouldHaveSaved(goal);
      const needed = Math.max(0, shouldHave - currentSaved);
      
      if (needed > 0) {
        let toAdd: number;
        if (isLast) {
          // Last goal gets exactly what's remaining to ensure total = availableFunds
          toAdd = Math.round((availableFunds - totalAllocated) * 100) / 100;
        } else {
          toAdd = Math.min(remaining, needed);
          toAdd = Math.round(toAdd * 100) / 100; // Round to 2 decimals
        }
        
        const newAmount = Math.round((currentSaved + toAdd) * 100) / 100;
        updates.push({ id: goal.id, savedAmount: newAmount });
        remaining -= toAdd;
        totalAllocated += toAdd;
      }
    }
    
    await this.applyDistribution(updates);
  }

  async distributeProportional(availableFunds: number, resetFirst: boolean) {
    // If resetting, we need to reset ALL goals first, then distribute to distributable ones
    let updates: { id: string; savedAmount: number }[] = [];
    
    if (resetFirst) {
      // Reset all goals to 0
      updates = this.goals.map(g => ({ id: g.id, savedAmount: 0 }));
      // Apply resets first
      for (const { id, savedAmount } of updates) {
        await api.patch(`/savings-goals/${id}`, { savedAmount });
      }
      // Reload data to get fresh state
      await this.loadData();
      updates = [];
    }
    
    const goals = this.getDistributableGoals();
    
    // Calculate total shortfall
    const shortfalls = goals.map(goal => {
      const currentSaved = Number(goal.savedAmount || 0);
      const shouldHave = this.getEffectiveShouldHaveSaved(goal);
      return {
        goal,
        currentSaved,
        shortfall: Math.max(0, shouldHave - currentSaved)
      };
    }).filter(s => s.shortfall > 0);
    
    const totalShortfall = shortfalls.reduce((sum, s) => sum + s.shortfall, 0);
    
    if (totalShortfall === 0) {
      alert(i18n.t('goals.distribute.no_goals'));
      this.showDistributeMenu = null;
      return;
    }
    
    let totalAllocated = 0;
    
    // Allocate proportionally, keeping track of remaining funds
    for (let i = 0; i < shortfalls.length; i++) {
      const { goal, currentSaved, shortfall } = shortfalls[i];
      const isLast = i === shortfalls.length - 1;
      
      let allocation: number;
      if (isLast) {
        // Last goal gets exactly what's remaining to avoid rounding errors
        allocation = Math.round((availableFunds - totalAllocated) * 100) / 100;
      } else {
        const proportion = shortfall / totalShortfall;
        allocation = availableFunds * proportion;
        allocation = Math.round(allocation * 100) / 100; // Round to 2 decimals
      }
      
      const newAmount = Math.round((currentSaved + allocation) * 100) / 100;
      updates.push({ id: goal.id, savedAmount: newAmount });
      totalAllocated += allocation;
    }
    
    await this.applyDistribution(updates);
  }

  async applyDistribution(updates: { id: string; savedAmount: number }[]) {
    try {
      for (const { id, savedAmount } of updates) {
        await api.patch(`/savings-goals/${id}`, { savedAmount });
      }
      await this.loadData();
      this.showDistributeMenu = null;
      alert(i18n.t('goals.distribute.success'));
    } catch (e) {
      console.error('Distribution failed:', e);
      alert('Distribution failed');
    }
  }

  handleDistribute(mode: 'byDate' | 'toOnTrack' | 'proportional') {
    const isRedistributeAll = this.showDistributeMenu === 'all';
    
    if (isRedistributeAll) {
      const confirmed = confirm(i18n.t('goals.distribute.confirm_redistribute'));
      if (!confirmed) {
        this.showDistributeMenu = null;
        return;
      }
    }
    
    const availableFunds = isRedistributeAll ? this.totalSavings : this.unassigned;
    
    if (availableFunds <= 0 && !isRedistributeAll) {
      alert(i18n.t('goals.distribute.no_unassigned'));
      this.showDistributeMenu = null;
      return;
    }
    
    if (this.getDistributableGoals().length === 0) {
      alert(i18n.t('goals.distribute.no_goals'));
      this.showDistributeMenu = null;
      return;
    }
    
    switch (mode) {
      case 'byDate':
        this.distributeByDate(availableFunds, isRedistributeAll);
        break;
      case 'toOnTrack':
        this.distributeToOnTrackByDate(availableFunds, isRedistributeAll);
        break;
      case 'proportional':
        this.distributeProportional(availableFunds, isRedistributeAll);
        break;
    }
  }

  render() {
    if (this.loading) {
      return html`<p>${i18n.t('common.loading')}</p>`;
    }

    const symbol = this.currency === 'EUR' ? '€' : '$';
    const sorted = this.sortedGoals;

    return html`
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
        <h1>${i18n.t('goals.title')}</h1>
      </div>

      <div class="header-controls">
        <div class="savings-input">
          <label>${i18n.t('goals.current_saved')}</label>
          <input type="number" .value="${this.totalSavings}" @input="${this.handleTotalSavingsChange}" placeholder="0.00">
        </div>
        
        <div class="savings-input">
             <label>${i18n.t('goals.unassigned_savings')}</label>
             <div class="unassigned-badge ${this.unassigned >= 0 ? 'positive' : 'negative'}">
                ${this.unassigned >= 0 ? '' : '-'}${symbol}${Math.abs(this.unassigned).toFixed(2)}
             </div>
        </div>

        <div style="position: relative; display: flex; flex-direction: column; gap: 8px;">
          <button class="btn-secondary" 
                  @click="${(e: Event) => { e.stopPropagation(); this.showDistributeMenu = this.showDistributeMenu === 'unassigned' ? null : 'unassigned'; }}"
                  ?disabled="${this.unassigned <= 0}">
            ${i18n.t('goals.distribute.distribute_unassigned')}
          </button>
          
          <button class="btn-warning" 
                  @click="${(e: Event) => { e.stopPropagation(); this.showDistributeMenu = this.showDistributeMenu === 'all' ? null : 'all'; }}">
            ${i18n.t('goals.distribute.redistribute_all')}
          </button>
          
          ${this.showDistributeMenu ? html`
            <div class="distribute-menu" @click="${(e: Event) => e.stopPropagation()}">
              <div class="menu-item" @click="${() => this.handleDistribute('byDate')}">
                <strong>${i18n.t('goals.distribute.fill_by_date')}</strong>
                <span>${i18n.t('goals.distribute.fill_by_date_desc')}</span>
              </div>
              <div class="menu-item" @click="${() => this.handleDistribute('toOnTrack')}">
                <strong>${i18n.t('goals.distribute.fill_to_on_track')}</strong>
                <span>${i18n.t('goals.distribute.fill_to_on_track_desc')}</span>
              </div>
              <div class="menu-item" @click="${() => this.handleDistribute('proportional')}">
                <strong>${i18n.t('goals.distribute.proportional')}</strong>
                <span>${i18n.t('goals.distribute.proportional_desc')}</span>
              </div>
            </div>
          ` : ''}
        </div>
      </div>

      <div style="display: flex; justify-content: flex-end; margin-bottom: 1rem;">
        <button class="btn-primary" @click="${() => this.showAddRow = !this.showAddRow}">
            ${this.showAddRow ? i18n.t('common.cancel') : '+ ' + i18n.t('goals.add_goal')}
        </button>
      </div>

      ${this.showAddRow ? html`
        <div class="card" style="margin-bottom: 1rem; padding: 20px;">
          <h3 style="margin: 0 0 16px 0; color: var(--md-sys-color-on-surface);">${i18n.t('goals.add_goal')}</h3>
          <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px;">
            <div>
              <label style="display: block; margin-bottom: 4px; font-size: 0.875rem; color: var(--md-sys-color-on-surface-variant);">${i18n.t('goals.goal_name')}</label>
              <input type="text" placeholder="${i18n.t('goals.goal_name')}" .value="${this.newGoal.name}" @input="${(e: any) => this.newGoal = { ...this.newGoal, name: e.target.value }}" style="width: 100%; padding: 8px; border: 1px solid var(--md-sys-color-outline); border-radius: 4px; background: var(--md-sys-color-surface); color: var(--md-sys-color-on-surface); box-sizing: border-box;">
            </div>
            
            <div>
              <label style="display: block; margin-bottom: 4px; font-size: 0.875rem; color: var(--md-sys-color-on-surface-variant);">${i18n.t('common.category')}</label>
              <filterable-select
                .value="${this.newGoal.categoryId || ''}"
                .options="${this.getCategoryOptions()}"
                .placeholder="${i18n.t('common.category')}"
                @change="${(e: CustomEvent) => this.newGoal = { ...this.newGoal, categoryId: e.detail.value }}">
              </filterable-select>
            </div>
            
            <div>
              <label style="display: block; margin-bottom: 4px; font-size: 0.875rem; color: var(--md-sys-color-on-surface-variant);">${i18n.t('goals.start_date')}</label>
              <input type="text" pattern="\d{4}-\d{2}-\d{2}" placeholder="yyyy-mm-dd" title="Format: yyyy-mm-dd" .value="${this.newGoal.startDate}" @input="${(e: any) => this.newGoal = { ...this.newGoal, startDate: e.target.value }}" style="width: 100%; padding: 8px; border: 1px solid var(--md-sys-color-outline); border-radius: 4px; background: var(--md-sys-color-surface); color: var(--md-sys-color-on-surface); box-sizing: border-box;">
            </div>
            
            <div>
              <label style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px; font-size: 0.875rem; color: var(--md-sys-color-on-surface-variant);">
                <input type="checkbox" .checked="${this.newGoal.isEvergreen}" @change="${(e: any) => this.newGoal = { ...this.newGoal, isEvergreen: e.target.checked }}" style="width: auto; height: auto;">
                ${i18n.t('goals.evergreen_goal')}
              </label>
              <label style="display: block; margin-bottom: 4px; font-size: 0.75rem; color: var(--md-sys-color-on-surface-variant); font-weight: 500;">
                ${this.newGoal.isEvergreen ? i18n.t('goals.target_months') : i18n.t('goals.target_date')}
              </label>
              ${this.newGoal.isEvergreen ? html`
                <input type="number" placeholder="${i18n.t('goals.target_months')}" .value="${this.newGoal.targetMonths || ''}" @input="${(e: any) => this.newGoal = { ...this.newGoal, targetMonths: parseInt(e.target.value) }}" style="width: 100%; padding: 8px; border: 1px solid var(--md-sys-color-outline); border-radius: 4px; background: var(--md-sys-color-surface); color: var(--md-sys-color-on-surface); box-sizing: border-box;">
              ` : html`
                <input type="text" pattern="\d{4}-\d{2}-\d{2}" placeholder="yyyy-mm-dd" .value="${this.newGoal.targetDate}" @input="${(e: any) => this.newGoal = { ...this.newGoal, targetDate: e.target.value }}" style="width: 100%; padding: 8px; border: 1px solid var(--md-sys-color-outline); border-radius: 4px; background: var(--md-sys-color-surface); color: var(--md-sys-color-on-surface); box-sizing: border-box;">
              `}
            </div>
            
            <div>
              <label style="display: block; margin-bottom: 4px; font-size: 0.875rem; color: var(--md-sys-color-on-surface-variant);">${i18n.t('goals.target_amount')}</label>
              <input type="number" placeholder="0" .value="${this.newGoal.targetAmount || ''}" @input="${(e: any) => this.newGoal = { ...this.newGoal, targetAmount: parseFloat(e.target.value) }}" style="width: 100%; padding: 8px; border: 1px solid var(--md-sys-color-outline); border-radius: 4px; background: var(--md-sys-color-surface); color: var(--md-sys-color-on-surface); box-sizing: border-box;">
            </div>
            
            <div>
              <label style="display: block; margin-bottom: 4px; font-size: 0.875rem; color: var(--md-sys-color-on-surface-variant);">${i18n.t('goals.current_saved')}</label>
              <input type="number" placeholder="0" .value="${this.newGoal.savedAmount || ''}" @input="${(e: any) => this.newGoal = { ...this.newGoal, savedAmount: parseFloat(e.target.value) }}" style="width: 100%; padding: 8px; border: 1px solid var(--md-sys-color-outline); border-radius: 4px; background: var(--md-sys-color-surface); color: var(--md-sys-color-on-surface); box-sizing: border-box;">
            </div>
          </div>
          <div style="display: flex; gap: 12px; margin-top: 16px; justify-content: flex-end;">
            <button class="btn-secondary" @click="${() => this.showAddRow = false}">${i18n.t('common.cancel')}</button>
            <button class="btn-primary" @click="${this.createGoal}">${i18n.t('common.save')}</button>
          </div>
        </div>
      ` : ''}

      <div class="filter-controls">
          <div class="filter-row">
              <span style="font-weight: 500">${i18n.t('goals.filter.filter_by')}:</span>
              
              <select .value="${this.filterField}" @change="${(e: any) => this.filterField = e.target.value}">
                  <option value="name">${i18n.t('goals.goal_name')}</option>
                  <option value="categoryId">${i18n.t('common.category')}</option>
                  <option value="startDate">${i18n.t('goals.start_date')}</option>
                  <option value="targetDate">${i18n.t('goals.target_date')}</option>
                  <option value="targetAmount">${i18n.t('goals.target_amount')}</option>
                  <option value="savedAmount">${i18n.t('goals.current_saved')}</option>
                  <option value="status">${i18n.t('goals.status.on_track')}</option>
              </select>

              <select .value="${this.filterOperator}" @change="${(e: any) => this.filterOperator = e.target.value}">
                  <option value="contains">${i18n.t('goals.filter.op.contains')}</option>
                  <option value="equals">${i18n.t('goals.filter.op.equals')}</option>
                  <option value="gt">${i18n.t('goals.filter.op.gt')}</option>
                  <option value="lt">${i18n.t('goals.filter.op.lt')}</option>
                  <option value="gte">${i18n.t('goals.filter.op.gte')}</option>
                  <option value="lte">${i18n.t('goals.filter.op.lte')}</option>
              </select>

              <input type="text" 
                  placeholder="${i18n.t('goals.filter.value')}" 
                  .value="${this.filterValue}" 
                  @input="${(e: any) => this.filterValue = e.target.value}"
                  @keydown="${(e: KeyboardEvent) => e.key === 'Enter' && this.addFilter()}">
              
              <button class="btn-primary" style="height: 36px; padding: 0 16px;" @click="${this.addFilter}">
                  ${i18n.t('goals.filter.add')}
              </button>
              
              ${this.filters.length > 0 ? html`
                  <button style="height: 36px; padding: 0 16px; background: transparent; color: var(--md-sys-color-error);" @click="${this.clearFilters}">
                      ${i18n.t('goals.filter.clear_all')}
                  </button>
              ` : ''}
          </div>

          ${this.filters.length > 0 ? html`
              <div class="chip-container">
                  ${this.filters.map(f => html`
                      <div class="chip">
                          <span>
                            ${this.getFieldLabel(f.field)} 
                            <b>${this.getOperatorLabel(f.operator)}</b> 
                            "${f.value}"
                          </span>
                          <button @click="${() => this.removeFilter(f.id)}">✕</button>
                      </div>
                  `)}
              </div>
          ` : ''}
      </div>

      <div class="table-container">
        <table>
            <thead>
                <tr>
                    <th @click="${() => this.toggleSort('name')}" style="cursor: pointer; width: 20%">
                        ${i18n.t('goals.goal_name')} ${this.sortField === 'name' ? (this.sortDirection === 'asc' ? '↑' : '↓') : ''}
                    </th>
                    <th @click="${() => this.toggleSort('categoryId')}" style="cursor: pointer; width: 15%">
                        ${i18n.t('common.category')} ${this.sortField === 'categoryId' ? (this.sortDirection === 'asc' ? '↑' : '↓') : ''}
                    </th>
                    <th @click="${() => this.toggleSort('startDate')}" style="cursor: pointer; width: 12%">
                        ${i18n.t('goals.start_date')} ${this.sortField === 'startDate' ? (this.sortDirection === 'asc' ? '↑' : '↓') : ''}
                    </th>
                    <th @click="${() => this.toggleSort('targetDate')}" style="cursor: pointer; width: 12%">
                        ${i18n.t('goals.target_date')} ${this.sortField === 'targetDate' ? (this.sortDirection === 'asc' ? '↑' : '↓') : ''}
                    </th>
                    <th @click="${() => this.toggleSort('targetAmount')}" style="cursor: pointer; width: 10%">
                        ${i18n.t('goals.target_amount')} ${this.sortField === 'targetAmount' ? (this.sortDirection === 'asc' ? '↑' : '↓') : ''}
                    </th>
                    <th style="width: 10%">
                        ${i18n.t('goals.monthly_saving_needed')}
                    </th>
                    <th @click="${() => this.toggleSort('savedAmount')}" style="cursor: pointer; width: 10%">
                        ${i18n.t('goals.current_saved')} ${this.sortField === 'savedAmount' ? (this.sortDirection === 'asc' ? '↑' : '↓') : ''}
                    </th>
                    <th @click="${() => this.toggleSort('status')}" style="cursor: pointer; width: 15%">
                        ${i18n.t('goals.status.on_track')} ${this.sortField === 'status' ? (this.sortDirection === 'asc' ? '↑' : '↓') : ''}
                    </th>
                    <th style="width: 10%">${i18n.t('common.actions')}</th>
                </tr>
            </thead>
            <tbody>
                ${sorted.length === 0 ? html`<tr><td colspan="9" style="text-align: center; color: #666; padding: 2rem;">${i18n.t('common.no_data')}</td></tr>` : ''}

                ${sorted.map(goal => {
      const targetAmount = Number(goal.targetAmount || 0);
      const savedAmount = Number(goal.savedAmount || 0);
      const percent = targetAmount > 0 ? Math.min(100, (savedAmount / targetAmount) * 100) : 0;
      const shouldHave = Number(goal.shouldHaveSaved || 0);
      const diff = savedAmount - shouldHave;
      const isBehind = diff < 0;

      const isEditingName = this.editingCell?.id === goal.id && this.editingCell?.field === 'name';
      const isEditingCat = this.editingCell?.id === goal.id && this.editingCell?.field === 'categoryId';
      const isEditingStartDate = this.editingCell?.id === goal.id && this.editingCell?.field === 'startDate';
      const isEditingDate = this.editingCell?.id === goal.id && this.editingCell?.field === 'targetDate';
      const isEditingTarget = this.editingCell?.id === goal.id && this.editingCell?.field === 'targetAmount';
      const isEditingSaved = this.editingCell?.id === goal.id && this.editingCell?.field === 'savedAmount';

      const monthly = this.getMonthlySaving(goal);

      return html`
                        <tr>
                            <td class="editable" @click="${() => !isEditingName && this.startEditing(goal.id, 'name', goal.name)}">
                                ${isEditingName ? html`
                                    <input id="edit-${goal.id}-name" type="text" .value="${this.editValue}" 
                                        @input="${(e: any) => this.editValue = e.target.value}"
                                        @blur="${() => this.saveCell(goal.id, 'name')}"
                                        @keydown="${(e: any) => this.handleKeyDown(e, goal.id, 'name')}">
                                ` : goal.name}
                            </td>
                            
                            <td class="editable" @click="${() => !isEditingCat && this.startEditing(goal.id, 'categoryId', goal.categoryId)}">
                                ${isEditingCat ? html`
                                    <select id="edit-${goal.id}-categoryId" .value="${this.editValue || ''}"
                                        @change="${(e: any) => { this.editValue = e.target.value; this.saveCell(goal.id, 'categoryId'); }}"
                                        @blur="${() => this.cancelEditing()}">
                                        <option value="">${i18n.t('common.uncategorized')}</option>
                                        ${this.categories.map(c => html`<option value="${c.id}" ?selected="${this.editValue === c.id}">${c.name}</option>`)}
                                    </select>
                                ` : (goal.categoryId ? html`<span class="category-tag">${this.getCategoryName(goal.categoryId)}</span>` : '-')}
                            </td>

                            <td class="editable col-date" @click="${() => !isEditingStartDate && this.startEditing(goal.id, 'startDate', goal.startDate ? new Date(goal.startDate).toISOString().split('T')[0] : '')}">
                                ${isEditingStartDate ? html`
                                    <input id="edit-${goal.id}-startDate" type="date" .value="${this.editValue}"
                                                                                                        @input="${(e: any) => this.editValue = e.target.value}"
                                                                                                        @blur="${() => this.saveCell(goal.id, 'startDate')}"
                                                                                                        @keydown="${(e: any) => this.handleKeyDown(e, goal.id, 'startDate')}">
                                                                                                ` : (goal.startDate ? new Date(goal.startDate).toISOString().split('T')[0] : '-')}
                                                                                            </td>                            <td class="editable col-date" @click="${() => !isEditingDate && this.startEditing(goal.id, 'targetDate', new Date(goal.targetDate).toISOString().split('T')[0])}">
                                ${isEditingDate ? html`
                                    <input id="edit-${goal.id}-targetDate" type="date" .value="${this.editValue}"
                                                                                                        @input="${(e: any) => this.editValue = e.target.value}"
                                                                                                        @blur="${() => this.saveCell(goal.id, 'targetDate')}"
                                                                                                        @keydown="${(e: any) => this.handleKeyDown(e, goal.id, 'targetDate')}">
                                                                                                ` : (goal.isEvergreen ? html`<span style="color: var(--md-sys-color-tertiary);">∞ ${i18n.t('goals.evergreen')}${percent < 100 ? ` (${goal.targetMonths || 12}mo)` : ''}</span>` : (goal.targetDate ? new Date(goal.targetDate).toISOString().split('T')[0] : '-'))}
                                                                                            </td>                            <td class="editable" @click="${() => !isEditingTarget && this.startEditing(goal.id, 'targetAmount', goal.targetAmount)}">
                                ${isEditingTarget ? html`
                                    <input id="edit-${goal.id}-targetAmount" type="number" .value="${this.editValue}"
                                        @input="${(e: any) => this.editValue = parseFloat(e.target.value)}"
                                        @blur="${() => this.saveCell(goal.id, 'targetAmount')}"
                                        @keydown="${(e: any) => this.handleKeyDown(e, goal.id, 'targetAmount')}">
                                ` : html`${symbol}${targetAmount}`}
                            </td>

                            <td>
                                ${symbol}${monthly.toFixed(2)}
                            </td>

                            <td class="editable" @click="${() => !isEditingSaved && this.startEditing(goal.id, 'savedAmount', goal.savedAmount)}">
                                ${isEditingSaved ? html`
                                    <input id="edit-${goal.id}-savedAmount" type="number" .value="${this.editValue}"
                                        @input="${(e: any) => this.editValue = parseFloat(e.target.value)}"
                                        @blur="${() => this.saveCell(goal.id, 'savedAmount')}"
                                        @keydown="${(e: any) => this.handleKeyDown(e, goal.id, 'savedAmount')}">
                                ` : html`<b>${symbol}${savedAmount}</b>`}
                            </td>

                            <td>
                                <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 2px;">
                                    <div class="progress-bar"><div class="progress-fill" style="width: ${percent}%"></div></div>
                                    <span style="font-size: 0.8rem; font-weight: 500; min-width: 35px;">${percent.toFixed(0)}%</span>
                                </div>
                                <div class="${isBehind && percent < 100 && !goal.isEvergreen ? 'status-behind' : 'status-ok'}" style="font-size: 0.75rem;">
                                    ${percent >= 100 ? i18n.t('goals.status.completed') :
          (goal.isEvergreen ? i18n.t('goals.building') : (isBehind ? i18n.t('goals.status.at_risk') + ` (${symbol}${Math.abs(diff).toFixed(0)})` : i18n.t('goals.status.on_track')))}
                                </div>
                            </td>
                            
                            <td>
                                <button class="btn-danger" style="padding: 0.25rem 0.5rem" @click="${() => this.deleteGoal(goal.id)}">✕</button>
                            </td>
                        </tr>
                    `;
    })}

                ${sorted.length > 0 ? (() => {
        const totalTarget = sorted.reduce((s, g) => s + Number(g.targetAmount || 0), 0);
        const totalMonthly = sorted.reduce((s, g) => s + this.getMonthlySaving(g), 0);
        const totalSaved = sorted.reduce((s, g) => s + Number(g.savedAmount || 0), 0);

        return html`
                          <tr class="totals-row">
                              <td colspan="4" style="text-align: right; padding-right: 2rem;">${i18n.t('common.total')}</td>
                              <td>${symbol}${totalTarget.toFixed(2)}</td>
                              <td>${symbol}${totalMonthly.toFixed(2)}</td>
                              <td>${symbol}${totalSaved.toFixed(2)}</td>
                              <td colspan="2"></td>
                          </tr>
                      `;
      })() : ''}
            </tbody>
        </table>
        </div>
    `;
  }
}
