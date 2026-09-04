import { LitElement, html, css, nothing } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { api } from '../api/client';
import { i18n } from '../i18n/i18n';
import '../components/filterable-select';
import type { SelectOption } from '../components/filterable-select';
import {
  bottomSheet,
  icon,
  mobileUI,
  snackbar,
  watchMobileViewport,
  type SnackbarOptions,
} from '../styles/mobile-ui';

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

  @state() collapsedParents: Set<string> = new Set();

  // --- Mobile layer (<= 600px). The desktop tables above the breakpoint are untouched. ---
  @state() isMobile = false;
  @state() activeTab: 'EXPENSE' | 'GOAL' = 'EXPENSE';
  /** Category whose Edit / Delete menu is open, or null. */
  @state() menuCategory: any = null;
  @state() snack: SnackbarOptions | null = null;

  private unwatchViewport?: () => void;
  private snackTimer?: number;

  static styles = [mobileUI, css`
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
    
    .collapse-icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 24px;
      height: 24px;
      cursor: pointer;
      user-select: none;
      margin-right: 8px;
      transition: transform 0.2s;
      color: var(--md-sys-color-on-surface-variant);
    }
    
    .collapse-icon:hover {
      color: var(--md-sys-color-on-surface);
    }
    
    .collapse-icon.collapsed {
      transform: rotate(-90deg);
    }
    
    tr.parent-row {
      cursor: pointer;
    }
    
    tr.parent-row:hover .collapse-icon {
      color: var(--md-sys-color-primary);
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

    /* ---------- mobile ---------- */

    .c-screen {
      display: flex;
      flex-direction: column;
      min-height: calc(100dvh - 64px - env(safe-area-inset-bottom, 0px));
    }

    /* grow into the spare space but never shrink the rows */
    .c-list { flex: 1 0 auto; }

    .c-row {
      display: flex;
      align-items: center;
      gap: 12px;
      min-height: 60px;
      padding: 8px 4px 8px 0;
      margin: 0 -16px;
      padding-left: 16px;
      padding-right: 4px;
      width: calc(100% + 32px);
      box-sizing: border-box;
      border-bottom: 1px solid var(--md-sys-color-surface-container-high);
    }
    .c-row.child { min-height: 56px; padding-left: 48px; }

    /* the icon takes the category colour at low alpha, the glyph the full colour */
    .c-icon {
      width: 36px;
      height: 36px;
      border-radius: 18px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
      flex-shrink: 0;
    }
    .c-icon.small { width: 32px; height: 32px; font-size: 15px; }

    .c-name {
      flex: 1;
      min-width: 0;
      font: 600 16px/24px 'Roboto', sans-serif;
      color: var(--md-sys-color-on-surface);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .c-name.child { font: 400 15px/22px 'Roboto', sans-serif; }
    .c-budget {
      font: 400 14px/20px 'Roboto', sans-serif;
      color: var(--md-sys-color-on-surface-variant);
      white-space: nowrap;
    }
    .c-chevron {
      width: 32px;
      border: none;
      background: none;
      color: var(--md-sys-color-on-surface-variant);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      padding: 0;
      flex-shrink: 0;
      margin-left: -8px;
    }
    .c-chevron.collapsed { transform: rotate(-90deg); }
  `];

  async connectedCallback() {
    super.connectedCallback();
    this.unwatchViewport = watchMobileViewport(this);
    await this.loadData();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.unwatchViewport?.();
    if (this.snackTimer) window.clearTimeout(this.snackTimer);
  }

  /** Inline snackbar above the nav; replaces alert() on the mobile path. */
  private notify(message: string) {
    if (!this.isMobile) {
      alert(message);
      return;
    }
    if (this.snackTimer) window.clearTimeout(this.snackTimer);
    this.snack = { message };
    this.snackTimer = window.setTimeout(() => { this.snack = null; }, 4000);
  }

  getParentCategoryOptions(): SelectOption[] {
    const options: SelectOption[] = [
      { value: '', label: 'None (Top Level)' }
    ];
    
    const filtered = this.categories.filter(c => 
      !c.parentId && 
      c.id !== this.editModeId &&
      c.type === this.categoryForm.type
    ).sort((a, b) => a.name.localeCompare(b.name));
    
    filtered.forEach(cat => {
      options.push({
        value: cat.id,
        label: cat.name,
        icon: cat.icon
      });
    });
    
    return options;
  }

  async loadData() {
    this.loading = true;
    try {
      this.categories = await api.get('/categories');
      const currencySetting = await api.get('/settings/currency');
      this.currency = currencySetting?.value || 'USD';
    } catch (e) {
      console.error(e);
      this.notify('Failed to load categories');
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
        this.notify(i18n.t('settings.category_name') + ' is required');
        return;
      }
      if (!this.categoryForm.icon.trim()) {
        this.notify(i18n.t('settings.icon') + ' is required');
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
      this.notify('Failed to save category: ' + (e.message || 'Unknown error'));
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
      this.notify('Failed to delete category: ' + (e.message || 'Unknown error'));
    }
  }

  toggleParentCollapse(parentId: string) {
    const newSet = new Set(this.collapsedParents);
    if (newSet.has(parentId)) {
      newSet.delete(parentId);
    } else {
      newSet.add(parentId);
    }
    this.collapsedParents = newSet;
  }

  renderCategoryTable(categories: any[], showParentChild = false, showBudget = true) {
    const symbol = this.currency === 'EUR' ? '€' : '$';

    let rows = categories;
    if (showParentChild) {
      rows = [];
      const parents = categories.filter(c => !c.parentId).sort((a, b) => a.name.localeCompare(b.name));
      parents.forEach(p => {
        rows.push({ ...p, level: 0, isParent: true });
        // Only add children if parent is not collapsed
        if (!this.collapsedParents.has(p.id)) {
          const children = categories.filter(c => c.parentId === p.id).sort((a, b) => a.name.localeCompare(b.name));
          children.forEach(c => rows.push({ ...c, level: 1, isParent: false }));
        }
      });
    } else {
      rows = categories.sort((a, b) => a.name.localeCompare(b.name));
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
            ${rows.map((cat: any) => {
              const isCollapsed = this.collapsedParents.has(cat.id);
              const hasChildren = showParentChild && cat.level === 0 && categories.some(c => c.parentId === cat.id);
              
              return html`
              <tr class="${cat.isParent && hasChildren ? 'parent-row' : ''}">
                <td>
                  <div style="display: flex; align-items: center; padding-left: ${cat.level ? cat.level * 2 : 0}rem;">
                    ${cat.isParent && hasChildren ? html`
                      <span 
                        class="collapse-icon ${isCollapsed ? 'collapsed' : ''}" 
                        @click="${(e: Event) => { e.stopPropagation(); this.toggleParentCollapse(cat.id); }}"
                        title="${isCollapsed ? 'Expand' : 'Collapse'}">
                        ▼
                      </span>
                    ` : html`
                      <span style="width: 32px; display: inline-block;"></span>
                    `}
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
            `})}
          </tbody>
        </table>
      </div>
    `;
  }

  // ------------------------------------------------------------------
  // Mobile layout
  // ------------------------------------------------------------------

  /** Parent rows with their children, for the active tab. */
  private mobileTree(): { parent: any; children: any[] }[] {
    const scope = this.activeTab === 'GOAL'
      ? this.categories.filter(c => c.type === 'GOAL')
      : this.categories.filter(c => c.type === 'EXPENSE' || !c.type);

    return scope
      .filter(c => !c.parentId)
      .sort((a, b) => a.name.localeCompare(b.name))
      .map(parent => ({
        parent,
        children: scope
          .filter(c => c.parentId === parent.id)
          .sort((a, b) => a.name.localeCompare(b.name)),
      }));
  }

  private renderCategoryRow(cat: any, isChild: boolean, hasChildren: boolean) {
    const symbol = this.currency === 'EUR' ? '€' : '$';
    const collapsed = this.collapsedParents.has(cat.id);
    const showBudget = this.activeTab === 'EXPENSE';

    return html`
      <div class="c-row ${isChild ? 'child' : ''}">
        ${!isChild && hasChildren
          ? html`
            <button
              class="c-chevron ${collapsed ? 'collapsed' : ''}"
              @click="${() => this.toggleParentCollapse(cat.id)}"
              title="${collapsed ? 'Expand' : 'Collapse'}">
              ${icon('expand_more', 22)}
            </button>
          `
          : html`<span class="c-chevron"></span>`}

        <span
          class="c-icon ${isChild ? 'small' : ''}"
          style="color: ${cat.color}; background: ${cat.color}40;">
          ${cat.icon}
        </span>

        <span class="c-name ${isChild ? 'child' : ''}">${cat.name}</span>

        ${showBudget
          ? html`<span class="c-budget">${cat.budget ? `${symbol}${cat.budget}` : '–'}</span>`
          : nothing}

        <button
          class="m-icon-btn"
          title="${i18n.t('common.actions')}"
          @click="${() => { this.menuCategory = cat; }}">
          ${icon('more_vert', 22)}
        </button>
      </div>
    `;
  }

  /** Edit / Delete for one category. */
  private renderCategoryMenu() {
    const cat = this.menuCategory;
    return bottomSheet({
      open: !!cat,
      onDismiss: () => { this.menuCategory = null; },
      content: html`
        <div class="m-sheet-title">${cat?.icon ?? ''} ${cat?.name ?? ''}</div>
        <div>
          <button
            class="m-row"
            @click="${() => { this.menuCategory = null; this.startEdit(cat); }}">
            ${icon('edit', 22)}
            <span class="m-row-main"><span class="m-row-primary">${i18n.t('common.edit')}</span></span>
          </button>
          <button
            class="m-row"
            style="color: var(--md-sys-color-error); border-bottom: none"
            @click="${() => { this.menuCategory = null; this.deleteCategory(cat.id); }}">
            ${icon('delete', 22)}
            <span class="m-row-main"><span class="m-row-primary">${i18n.t('common.delete')}</span></span>
          </button>
        </div>
      `,
    });
  }

  /** Add / edit form as a sheet rather than an inline card. */
  private renderCategoryFormSheet() {
    return bottomSheet({
      open: this.showAddForm,
      onDismiss: () => this.resetForm(),
      content: html`
        <div class="m-sheet-title">
          ${this.editModeId ? i18n.t('settings.edit_category') : i18n.t('settings.new_category')}
        </div>

        <div class="m-field-group">
          <span class="m-section-label">${i18n.t('settings.type')}</span>
          <div style="display: flex; gap: 8px;">
            ${[
              { value: 'EXPENSE', label: i18n.t('mobile.tab_expense') },
              { value: 'GOAL', label: i18n.t('mobile.tab_goal') },
            ].map(option => html`
              <button
                class="m-filter-chip ${this.categoryForm.type === option.value ? 'selected' : ''}"
                @click="${() => {
                  // Available parents change with the type, so drop the selection
                  this.categoryForm = { ...this.categoryForm, type: option.value, parentId: '' };
                }}">
                ${option.label}
              </button>
            `)}
          </div>
        </div>

        <div class="m-field-group">
          <span class="m-section-label">${i18n.t('settings.category_name')}</span>
          <input
            class="m-field form"
            type="text"
            placeholder="e.g. Groceries"
            .value="${this.categoryForm.name}"
            @input="${(e: any) => {
              this.categoryForm = { ...this.categoryForm, name: e.target.value };
            }}" />
        </div>

        <div class="m-field-group">
          <span class="m-section-label">${i18n.t('settings.parent_group')}</span>
          <filterable-select
            .value="${this.categoryForm.parentId}"
            .options="${this.getParentCategoryOptions()}"
            .placeholder="None (Top Level)"
            @change="${(e: CustomEvent) => {
              this.categoryForm = { ...this.categoryForm, parentId: e.detail.value };
            }}">
          </filterable-select>
        </div>

        <div class="m-field-group">
          <span class="m-section-label">${i18n.t('settings.icon')}</span>
          <div style="display: flex; gap: 12px; align-items: center;">
            <input
              class="m-field form"
              style="width: 88px; text-align: center; flex: none"
              type="text"
              placeholder="Emoji"
              .value="${this.categoryForm.icon}"
              @input="${(e: any) => {
                this.categoryForm = { ...this.categoryForm, icon: e.target.value };
              }}" />
            <button
              class="m-btn form outlined"
              style="flex: 1"
              @click="${() => { this.showEmojiPicker = !this.showEmojiPicker; }}">
              😀
            </button>
          </div>
          ${this.showEmojiPicker ? html`
            <emoji-picker
              style="width: 100%"
              @emoji-click="${(e: any) => {
                this.categoryForm = { ...this.categoryForm, icon: e.detail.unicode };
                this.showEmojiPicker = false;
              }}"></emoji-picker>
          ` : nothing}
        </div>

        ${this.categoryForm.type === 'EXPENSE' ? html`
          <div class="m-field-group">
            <span class="m-section-label">${i18n.t('settings.monthly_budget')}</span>
            <input
              class="m-field form"
              type="number"
              inputmode="decimal"
              placeholder="0.00"
              .value="${this.categoryForm.budget ?? ''}"
              @input="${(e: any) => {
                const val = e.target.value;
                this.categoryForm = {
                  ...this.categoryForm,
                  budget: val === '' ? null : parseFloat(val),
                };
              }}" />
          </div>
        ` : nothing}

        <div style="display: flex; gap: 12px;">
          <button class="m-btn form outlined" style="flex: 1" @click="${this.resetForm}">
            ${i18n.t('common.cancel')}
          </button>
          <button class="m-btn form" style="flex: 1" @click="${this.saveCategory}">
            ${i18n.t('common.save')}
          </button>
        </div>
      `,
    });
  }

  private renderDeleteSheet() {
    return bottomSheet({
      open: !!this.categoryToDelete,
      onDismiss: () => { this.categoryToDelete = null; },
      content: html`
        <div class="m-sheet-title">${i18n.t('common.delete')}</div>
        <div class="m-subtitle">${i18n.t('common.confirm_delete')}</div>
        <div style="display: flex; gap: 12px;">
          <button class="m-btn outlined" style="flex: 1" @click="${() => { this.categoryToDelete = null; }}">
            ${i18n.t('common.cancel')}
          </button>
          <button class="m-btn destructive" style="flex: 1" @click="${this.confirmDelete}">
            ${i18n.t('common.delete')}
          </button>
        </div>
      `,
    });
  }

  private renderMobile() {
    const tree = this.mobileTree();

    return html`
      <div class="m-screen c-screen">
        <div class="m-title-row">
          <h1 class="m-title">${i18n.t('settings.categories')}</h1>
        </div>
        <p class="m-subtitle">
          Organize your transactions with categories and subcategories. Set budgets for expense categories.
        </p>

        <div class="m-tabs" role="tablist">
          ${[
            { id: 'EXPENSE' as const, label: i18n.t('mobile.tab_expense') },
            { id: 'GOAL' as const, label: i18n.t('mobile.tab_goal') },
          ].map(tab => html`
            <button
              class="m-tab"
              role="tab"
              aria-selected="${this.activeTab === tab.id}"
              @click="${() => { this.activeTab = tab.id; }}">
              ${tab.label}
            </button>
          `)}
        </div>

        <div class="c-list">
          ${this.loading
            ? html`<div class="m-progress-bar"></div>`
            : tree.length === 0
              ? html`
                <div class="m-empty" style="padding-top: 48px">
                  <div class="m-empty-circle">${icon('category', 40)}</div>
                  <div class="m-empty-title">${i18n.t('common.no_data')}</div>
                </div>
              `
              : tree.map(({ parent, children }) => html`
                ${this.renderCategoryRow(parent, false, children.length > 0)}
                ${this.collapsedParents.has(parent.id)
                  ? nothing
                  : children.map(child => this.renderCategoryRow(child, true, false))}
              `)}
        </div>

        <!-- Pinned so it never covers the last row -->
        <div class="m-pinned">
          <button
            class="m-btn form block"
            @click="${() => {
              this.resetForm();
              this.categoryForm = { ...this.categoryForm, type: this.activeTab };
              this.showAddForm = true;
            }}">
            ${icon('add', 22)} ${i18n.t('mobile.add_category')}
          </button>
        </div>

        ${this.renderCategoryFormSheet()}
        ${this.renderCategoryMenu()}
        ${this.renderDeleteSheet()}
        ${snackbar(this.snack)}
      </div>
    `;
  }

  render() {
    if (this.isMobile) return this.renderMobile();

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
            <filterable-select
              .value="${this.categoryForm.parentId}"
              .options="${this.getParentCategoryOptions()}"
              .placeholder="None (Top Level)"
              @change="${(e: CustomEvent) => this.categoryForm = { ...this.categoryForm, parentId: e.detail.value }}">
            </filterable-select>
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
