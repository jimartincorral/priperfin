import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { api } from '../api/client';
import { i18n } from '../i18n/i18n';

// Load emoji picker  
import 'emoji-picker-element';

@customElement('view-categories')
export class ViewCategories extends LitElement {
  @state() categories: any[] = [];
  @state() loading = false;
  @state() showAddForm = false;
  @state() editModeId: string | null = null;
  @state() categoryToDelete: string | null = null;
  @state() showEmojiPicker = false;
  @state() currency = 'USD';
  
  @state() categoryForm = {
    name: '',
    icon: '',
    color: '#000000',
    budget: null as number | null,
    type: 'EXPENSE',
    parentId: ''
  };

  static styles = css`
    :host {
      display: block;
      padding: 0;
    }
    
    .page-header {
      margin-bottom: 24px;
    }
    
    .page-title {
      font: var(--md-sys-typescale-headline-large);
      margin: 0 0 8px 0;
      color: var(--md-sys-color-on-surface);
    }
    
    .page-subtitle {
      font: var(--md-sys-typescale-body-medium);
      color: var(--md-sys-color-on-surface-variant);
      margin: 0;
    }
    
    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }
    
    .section-title {
      font: var(--md-sys-typescale-title-medium);
      color: var(--md-sys-color-on-surface-variant);
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin: 0;
    }
    
    .card {
      background: var(--md-sys-color-surface-container-low);
      padding: 24px;
      border-radius: var(--md-sys-shape-corner-medium);
      margin-bottom: 24px;
      box-shadow: 0 1px 3px 0 rgba(0,0,0,0.12);
    }
    
    .form-card {
      background: var(--md-sys-color-surface-container-high);
      padding: 20px;
      border-radius: var(--md-sys-shape-corner-medium);
      margin-bottom: 24px;
    }
    
    .form-group {
      margin-bottom: 16px;
    }
    
    .form-group label {
      display: block;
      font: var(--md-sys-typescale-label-medium);
      color: var(--md-sys-color-on-surface);
      margin-bottom: 8px;
    }
    
    .form-group input,
    .form-group select {
      width: 100%;
      padding: 12px;
      border: 1px solid var(--md-sys-color-outline);
      border-radius: var(--md-sys-shape-corner-small);
      font: var(--md-sys-typescale-body-medium);
      background: var(--md-sys-color-surface);
      color: var(--md-sys-color-on-surface);
      box-sizing: border-box;
    }
    
    button {
      height: 40px;
      padding: 0 24px;
      border-radius: 20px;
      border: none;
      font: var(--md-sys-typescale-label-large);
      cursor: pointer;
      background: var(--md-sys-color-primary);
      color: var(--md-sys-color-on-primary);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
    }
    
    button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    
    .btn-secondary {
      background: transparent;
      border: 1px solid var(--md-sys-color-outline);
      color: var(--md-sys-color-primary);
    }
    
    .btn-danger {
      background: var(--md-sys-color-error);
      color: var(--md-sys-color-on-error);
    }
    
    .table-container {
      overflow-x: auto;
      border-radius: var(--md-sys-shape-corner-small);
    }
    
    table {
      width: 100%;
      border-collapse: collapse;
    }
    
    th {
      text-align: left;
      padding: 12px 16px;
      background: var(--md-sys-color-surface-container-highest);
      color: var(--md-sys-color-on-surface-variant);
      font: var(--md-sys-typescale-label-medium);
      border-bottom: 1px solid var(--md-sys-color-outline-variant);
    }
    
    td {
      padding: 12px 16px;
      border-bottom: 1px solid var(--md-sys-color-outline-variant);
    }
    
    tr:hover {
      background: var(--md-sys-color-surface-container);
    }
    
    .category-icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      border-radius: 50%;
      margin-right: 12px;
      font-size: 18px;
    }
    
    .actions {
      display: flex;
      gap: 8px;
    }
    
    .empty-state {
      text-align: center;
      padding: 48px 24px;
      color: var(--md-sys-color-on-surface-variant);
    }
    
    .empty-state-icon {
      font-size: 64px;
      margin-bottom: 16px;
      opacity: 0.5;
    }
    
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }
    
    .modal {
      background: var(--md-sys-color-surface);
      padding: 24px;
      border-radius: var(--md-sys-shape-corner-large);
      min-width: 300px;
      max-width: 500px;
    }
    
    .modal h3 {
      margin-top: 0;
      color: var(--md-sys-color-on-surface);
    }
    
    .modal-actions {
      display: flex;
      gap: 12px;
      justify-content: flex-end;
      margin-top: 24px;
    }
    
    @media (max-width: 600px) {
      .section-header {
        flex-direction: column;
        align-items: stretch;
        gap: 12px;
      }
      
      .actions {
        flex-wrap: wrap;
      }
    }
  `;

  async connectedCallback() {
    super.connectedCallback();
    await this.loadData();
  }

  async loadData() {
    this.loading = true;
    try {
      this.categories = await api.get('/categories');
      const currencySetting = await api.get('/settings/currency');
      this.currency = currencySetting?.value || 'USD';
    } catch (e) {
      console.error(e);
      alert('Failed to load categories');
    } finally {
      this.loading = false;
    }
  }

  resetForm() {
    this.categoryForm = {
      name: '',
      icon: '',
      color: '#000000',
      budget: null,
      type: 'EXPENSE',
      parentId: ''
    };
    this.editModeId = null;
    this.showAddForm = false;
    this.showEmojiPicker = false;
  }

  toggleAddForm() {
    if (this.showAddForm) {
      this.resetForm();
    } else {
      this.resetForm();
      this.showAddForm = true;
    }
  }

  async startEdit(cat: any) {
    this.categoryForm = {
      name: cat.name || '',
      icon: cat.icon || '',
      color: cat.color || '#000000',
      budget: cat.budget !== undefined ? cat.budget : null,
      type: cat.type || 'EXPENSE',
      parentId: cat.parentId || ''
    };
    this.editModeId = cat.id;
    this.showAddForm = true;
    this.showEmojiPicker = false;

    await this.updateComplete;
    const formCard = this.shadowRoot?.querySelector('.form-card');
    if (formCard) {
      formCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  async saveCategory() {
    try {
      // Validation
      if (!this.categoryForm.name.trim()) {
        alert(i18n.t('settings.category_name') + ' is required');
        return;
      }
      if (!this.categoryForm.icon.trim()) {
        alert(i18n.t('settings.icon') + ' is required');
        return;
      }

      const payload: any = {
        name: this.categoryForm.name.trim(),
        icon: this.categoryForm.icon.trim(),
        type: this.categoryForm.type,
      };

      // Only include budget for EXPENSE categories
      if (this.categoryForm.type === 'EXPENSE' && this.categoryForm.budget !== null) {
        payload.budget = this.categoryForm.budget;
      }

      // Only include parentId if it's not empty
      if (this.categoryForm.parentId && this.categoryForm.parentId.trim()) {
        payload.parentId = this.categoryForm.parentId.trim();
      }

      if (this.editModeId) {
        await api.patch(`/categories/${this.editModeId}`, payload);
      } else {
        await api.post('/categories', payload);
      }
      this.resetForm();
      await this.loadData();
    } catch (e: any) {
      console.error('Failed to save category', e);
      alert('Failed to save category: ' + (e.message || 'Unknown error'));
    }
  }

  deleteCategory(id: string) {
    this.categoryToDelete = id;
  }

  async confirmDelete() {
    if (!this.categoryToDelete) return;
    const id = this.categoryToDelete;

    try {
      await api.delete(`/categories/${id}`);
      await this.loadData();
      this.categoryToDelete = null;
    } catch (e: any) {
      console.error('Failed to delete category', e);
      alert('Failed to delete category: ' + (e.message || 'Unknown error'));
    }
  }

  renderCategoryTable(categories: any[], showParentChild = false, showBudget = true) {
    const symbol = this.currency === 'EUR' ? '€' : '$';

    let rows = categories;
    if (showParentChild) {
      rows = [];
      const parents = categories.filter(c => !c.parentId);
      parents.forEach(p => {
        rows.push({ ...p, level: 0 });
        const children = categories.filter(c => c.parentId === p.id);
        children.forEach(c => rows.push({ ...c, level: 1 }));
      });
    }

    if (rows.length === 0) {
      return html`
        <div class="empty-state">
          <div class="empty-state-icon">📂</div>
          <div>${i18n.t('common.no_data')}</div>
        </div>
      `;
    }

    return html`
      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th style="width: ${showBudget ? '50%' : '75%'}">${i18n.t('settings.category_name')}</th>
              ${showBudget ? html`<th style="width: 25%">${i18n.t('settings.monthly_budget')}</th>` : ''}
              <th style="width: 25%">${i18n.t('common.actions')}</th>
            </tr>
          </thead>
          <tbody>
            ${rows.map((cat: any) => html`
              <tr>
                <td>
                  <div style="display: flex; align-items: center; padding-left: ${cat.level ? cat.level * 2 : 0}rem;">
                    <span class="category-icon" style="color: ${cat.color}; background: ${cat.color}20;">
                      ${cat.icon}
                    </span>
                    <span style="font-weight: ${cat.level === 0 ? '600' : '400'}">
                      ${cat.name}
                    </span>
                  </div>
                </td>
                ${showBudget ? html`
                  <td>
                    ${cat.budget ? html`${symbol}${cat.budget}` : html`<span style="color: #ccc">-</span>`}
                  </td>
                ` : ''}
                <td>
                  <div class="actions">
                    <button @click="${() => this.startEdit(cat)}">${i18n.t('common.edit')}</button>
                    <button class="btn-danger" @click="${() => this.deleteCategory(cat.id)}">🗑</button>
                  </div>
                </td>
              </tr>
            `)}
          </tbody>
        </table>
      </div>
    `;
  }

  render() {
    const expenseCategories = this.categories.filter(c => c.type === 'EXPENSE' || !c.type);
    const goalCategories = this.categories.filter(c => c.type === 'GOAL');

    return html`
      <div class="page-header">
        <h1 class="page-title">${i18n.t('settings.categories')}</h1>
        <p class="page-subtitle">
          Organize your transactions with categories and subcategories. Set budgets for expense categories.
        </p>
      </div>

      <div class="section-header">
        <div style="flex: 1;"></div>
        <button @click="${this.toggleAddForm}">
          ${this.showAddForm ? i18n.t('common.cancel') : '+ ' + i18n.t('settings.add_category')}
        </button>
      </div>

      ${this.showAddForm ? html`
        <div class="form-card">
          <h3>${this.editModeId ? i18n.t('settings.edit_category') : i18n.t('settings.new_category')}</h3>
          
          <div class="form-group">
            <label>${i18n.t('settings.type')}</label>
            <select 
              .value="${this.categoryForm.type}" 
              @change="${(e: any) => {
                // Reset parentId when type changes since available parents change
                this.categoryForm = { ...this.categoryForm, type: e.target.value, parentId: '' };
              }}"
            >
              <option value="EXPENSE">${i18n.t('settings.expense_categories')}</option>
              <option value="GOAL">${i18n.t('settings.goal_categories')}</option>
            </select>
          </div>

          <div class="form-group">
            <label>${i18n.t('settings.category_name')}</label>
            <input 
              type="text" 
              placeholder="e.g. Groceries" 
              .value="${this.categoryForm.name}" 
              @input="${(e: any) => this.categoryForm = { ...this.categoryForm, name: e.target.value }}"
            />
          </div>

          <div class="form-group">
            <label>${i18n.t('settings.parent_group')}</label>
            <select 
              .value="${this.categoryForm.parentId}" 
              @change="${(e: any) => this.categoryForm = { ...this.categoryForm, parentId: e.target.value }}"
            >
              <option value="">None (Top Level)</option>
              ${this.categories.filter(c => 
                !c.parentId && 
                c.id !== this.editModeId && 
                c.type === this.categoryForm.type
              ).map(c => html`
                <option value="${c.id}">${c.icon} ${c.name}</option>
              `)}
            </select>
          </div>

          <div style="display: flex; gap: 16px;">
            <div class="form-group" style="flex: 1;">
              <label>${i18n.t('settings.icon')}</label>
              <div style="position: relative;">
                <div style="display: flex; gap: 8px; align-items: center;">
                  <input 
                    type="text" 
                    placeholder="Emoji" 
                    style="width: 80px; text-align: center;" 
                    .value="${this.categoryForm.icon}" 
                    @input="${(e: any) => this.categoryForm = { ...this.categoryForm, icon: e.target.value }}"
                  />
                  <button 
                    type="button"
                    @click="${() => this.showEmojiPicker = !this.showEmojiPicker}" 
                    title="Pick Emoji"
                  >
                    😀
                  </button>
                </div>
                ${this.showEmojiPicker ? html`
                  <div style="position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; z-index: 1000; display: flex; align-items: center; justify-content: center;" 
                    @click="${() => this.showEmojiPicker = false}"
                  >
                    <emoji-picker 
                      style="position: relative; z-index: 1001;"
                      @click="${(e: Event) => e.stopPropagation()}"
                      @emoji-click="${(e: any) => {
                        this.categoryForm = { ...this.categoryForm, icon: e.detail.unicode };
                        this.showEmojiPicker = false;
                      }}"
                    ></emoji-picker>
                  </div>
                ` : ''}
              </div>
            </div>
          </div>

          ${this.categoryForm.type === 'EXPENSE' ? html`
            <div class="form-group">
              <label>${i18n.t('settings.monthly_budget')}</label>
              <input 
                type="number" 
                placeholder="0.00" 
                .value="${this.categoryForm.budget ?? ''}" 
                @input="${(e: any) => {
                  const val = e.target.value;
                  this.categoryForm = { ...this.categoryForm, budget: val === '' ? null : parseFloat(val) };
                }}"
              />
            </div>
          ` : ''}

          <div style="display: flex; gap: 12px;">
            <button @click="${this.saveCategory}">${i18n.t('common.save')}</button>
            <button class="btn-secondary" @click="${this.resetForm}">${i18n.t('common.cancel')}</button>
          </div>
        </div>
      ` : ''}

      <div class="card">
        <h3 class="section-title">${i18n.t('settings.expense_categories')}</h3>
        ${this.renderCategoryTable(expenseCategories, true, true)}
      </div>

      <div class="card">
        <h3 class="section-title">${i18n.t('settings.goal_categories')}</h3>
        ${this.renderCategoryTable(goalCategories, false, false)}
      </div>

      ${this.categoryToDelete ? html`
        <div class="modal-overlay" @click="${() => this.categoryToDelete = null}">
          <div class="modal" @click="${(e: Event) => e.stopPropagation()}">
            <h3>${i18n.t('common.delete')} Category</h3>
            <p>${i18n.t('common.confirm_delete')}</p>
            <div class="modal-actions">
              <button class="btn-secondary" @click="${() => this.categoryToDelete = null}">
                ${i18n.t('common.cancel')}
              </button>
              <button class="btn-danger" @click="${this.confirmDelete}">
                ${i18n.t('common.delete')}
              </button>
            </div>
          </div>
        </div>
      ` : ''}
    `;
  }
}
