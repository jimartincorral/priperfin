import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { api } from '../api/client';

import { i18n } from '../i18n/i18n';

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

  get sortedGoals() {
    const goalsArray = Array.isArray(this.goals) ? this.goals : [];
    return [...goalsArray].sort((a, b) => {
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

  toggleSort(field: string) {
    if (this.sortField === field) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortField = field;
      this.sortDirection = 'asc';
    }
  }

  // New Goal State
  @state() showAddRow = false; // Toggle to show the 'new line'
  @state() newGoal = { name: '', targetAmount: 0, startDate: new Date().toISOString().split('T')[0], targetDate: '', savedAmount: 0, categoryId: '' };

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
    .btn-danger {
        background-color: var(--md-sys-color-error);
        color: var(--md-sys-color-on-error);
        width: 32px; height: 32px; padding: 0;
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

    await this.loadData();
  }

  connectedCallback() {
    super.connectedCallback();
    i18n.addEventListener('lang-change', () => this.requestUpdate());
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    i18n.removeEventListener('lang-change', () => this.requestUpdate());
  }

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
    const now = new Date();
    const target = new Date(g.targetDate);
    if (target <= now) return targetAmount - savedAmount;
    const diffMonths = (target.getFullYear() - now.getFullYear()) * 12 + (target.getMonth() - now.getMonth());
    return (targetAmount - savedAmount) / Math.max(1, diffMonths);
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
    if (!payload.targetDate) { alert('Target Date is required'); return; }

    const startDate = new Date(payload.startDate);
    const targetDate = new Date(payload.targetDate);
    if (targetDate < startDate) {
      alert('Target date cannot be before start date.');
      return;
    }

    // Sanitization
    if (!payload.categoryId) payload.categoryId = null;
    if (isNaN(payload.targetAmount)) payload.targetAmount = 0;
    if (isNaN(payload.savedAmount)) payload.savedAmount = 0;

    // Dates are already strings from input[type=date], but explicit ensure
    // remove empty non-required dates

    try {
      await api.post('/savings-goals', payload);
      // Reset form
      this.newGoal = { name: '', targetAmount: 0, startDate: new Date().toISOString().split('T')[0], targetDate: '', savedAmount: 0, categoryId: '' };
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
      </div>

      <div style="display: flex; justify-content: flex-end; margin-bottom: 1rem;">
        <button class="btn-primary" @click="${() => this.showAddRow = !this.showAddRow}">
            ${this.showAddRow ? i18n.t('common.cancel') : '+ ' + i18n.t('goals.add_goal')}
        </button>
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
                ${this.showAddRow ? html`
                    <tr class="new-line">
                        <td><input type="text" placeholder="${i18n.t('goals.goal_name')}" .value="${this.newGoal.name}" @input="${(e: any) => this.newGoal = { ...this.newGoal, name: e.target.value }}"></td>
                        <td>
                            <select .value="${this.newGoal.categoryId}" @change="${(e: any) => this.newGoal = { ...this.newGoal, categoryId: e.target.value }}">
                                <option value="">${i18n.t('common.uncategorized')}</option>
                                ${this.categories.map(c => html`<option value="${c.id}">${c.name}</option>`)}
                            </select>
                        </td>
                        <td><input type="date" .value="${this.newGoal.startDate}" @input="${(e: any) => this.newGoal = { ...this.newGoal, startDate: e.target.value }}"></td>
                        <td><input type="date" .value="${this.newGoal.targetDate}" @input="${(e: any) => this.newGoal = { ...this.newGoal, targetDate: e.target.value }}"></td>
                        <td><input type="number" placeholder="0" .value="${this.newGoal.targetAmount || ''}" @input="${(e: any) => this.newGoal = { ...this.newGoal, targetAmount: parseFloat(e.target.value) }}"></td>
                        <td></td>
                        <td><input type="number" placeholder="0" .value="${this.newGoal.savedAmount || ''}" @input="${(e: any) => this.newGoal = { ...this.newGoal, savedAmount: parseFloat(e.target.value) }}"></td>
                        <td><button class="btn-primary" @click="${this.createGoal}">${i18n.t('common.save')}</button></td>
                        <td></td>
                    </tr>
                ` : ''}

                ${sorted.length === 0 && !this.showAddRow ? html`<tr><td colspan="9" style="text-align: center; color: #666; padding: 2rem;">${i18n.t('common.no_data')}</td></tr>` : ''}

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
                                                                                                ` : new Date(goal.targetDate).toISOString().split('T')[0]}
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
                                <div class="${isBehind && percent < 100 ? 'status-behind' : 'status-ok'}" style="font-size: 0.75rem;">
                                    ${percent >= 100 ? i18n.t('goals.status.completed') :
          (isBehind ? i18n.t('goals.status.at_risk') + ` (${symbol}${Math.abs(diff).toFixed(0)})` : i18n.t('goals.status.on_track'))}
                                </div>
                            </td>
                            
                            <td>
                                <button class="btn-danger" style="padding: 0.25rem 0.5rem" @click="${() => this.deleteGoal(goal.id)}">✕</button>
                            </td>
                        </tr>
                    `;
    })}

                ${this.goals.length > 0 ? (() => {
        const totalTarget = this.goals.reduce((s, g) => s + Number(g.targetAmount || 0), 0);
        const totalMonthly = this.goals.reduce((s, g) => s + this.getMonthlySaving(g), 0);
        const totalSaved = this.goals.reduce((s, g) => s + Number(g.savedAmount || 0), 0);

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
