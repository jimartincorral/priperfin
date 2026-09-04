import { LitElement, html, css, nothing } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { api } from '../api/client';
import {
  CHART_PALETTE,
  contentWidth,
  desktopUI,
  field as formField,
  footnote,
  rankedBar,
  segmented,
  statusPill,
  watchViewportWidth,
} from '../styles/desktop-ui';

import { i18n } from '../i18n/i18n';
import { getAppBasePath } from '../utils/router-paths';
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

  // --- Desktop layer (> 600px) ---
  /** The month the spend figures cover. */
  @state() private month = new Date().getMonth() + 1;
  @state() private year = new Date().getFullYear();
  /** The month's transactions, for spend, counts and the uncategorised badge. */
  @state() private monthTransactions: any[] = [];
  @state() private categoryQuery = '';
  @state() private parentMenuOpen = false;
  /** Drives the responsive removal of the side column. */
  @state() viewportWidth = window.innerWidth;
  @state() snack: SnackbarOptions | null = null;

  private unwatchViewport?: () => void;
  private unwatchWidth?: () => void;
  private snackTimer?: number;

  static styles = [css`
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
    /* ---------- desktop ---------- */

    .dc-anchor { position: relative; }
    .dc-pop {
      position: absolute;
      top: calc(100% + 6px);
      left: 0;
      z-index: 20;
      padding: 8px;
      background: var(--md-sys-color-surface-container-lowest);
      border: 1px solid var(--md-sys-color-outline-variant);
      border-radius: 12px;
      box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
      box-sizing: border-box;
    }
    .dc-pop.list { min-width: 220px; max-height: 260px; overflow-y: auto; }
    .dc-pop emoji-picker { margin: 0; width: 320px; height: 300px; }
    .dc-pop-row {
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
    .dc-pop-row:hover { background: var(--md-sys-color-surface-container); }
    .dc-pop-row.selected {
      background: var(--md-sys-color-secondary-container);
      color: var(--md-sys-color-on-secondary-container);
    }

    /* Tree rows: parents on white, children on the tinted surface */
    .dc-row { min-height: 48px; height: auto; padding: 6px 16px; }
    .dc-row.child { background: var(--md-sys-color-surface); }
    .dc-row.child:hover { background: var(--md-sys-color-surface-container-low); }
    .dc-name { display: flex; align-items: center; gap: 10px; min-width: 0; }
    .dc-collapse {
      display: inline-flex;
      align-items: center;
      color: var(--md-sys-color-on-surface-variant);
      background: none;
      padding: 0;
      cursor: pointer;
      flex-shrink: 0;
    }
    .dc-label {
      flex: 1 1 auto;
      min-width: 0;
      font: 500 15px/20px 'Roboto', sans-serif;
      color: var(--md-sys-color-on-surface);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .dc-label.child { font: 400 14px/20px 'Roboto', sans-serif; }
    .dc-spent {
      font: 400 13px/18px 'Roboto Mono', ui-monospace, monospace;
      color: var(--md-sys-color-on-surface);
      white-space: nowrap;
    }
    .dc-spent.over { color: var(--md-sys-color-error); }
    .dc-note {
      font: 400 12px/16px 'Roboto', sans-serif;
      color: var(--md-sys-color-outline);
      white-space: nowrap;
    }
    .dc-budget {
      font: 500 14px/20px 'Roboto Mono', ui-monospace, monospace;
      color: var(--md-sys-color-on-surface);
      white-space: nowrap;
    }
    .dc-actions {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: 2px;
      color: var(--md-sys-color-outline);
    }

    .dc-unbudgeted {
      display: flex;
      align-items: center;
      gap: 10px;
      width: 100%;
      height: 40px;
      border-bottom: 1px solid var(--md-sys-color-surface-container-high);
      background: none;
      box-sizing: border-box;
      text-align: left;
      cursor: pointer;
    }
    .dc-unbudgeted:last-child { border-bottom: none; }
    .dc-unbudgeted-name {
      display: block;
      font: 400 13px/18px 'Roboto', sans-serif;
      color: var(--md-sys-color-on-surface);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .dc-unbudgeted-parent {
      display: block;
      font: 400 11px/14px 'Roboto', sans-serif;
      color: var(--md-sys-color-outline);
    }
  `, mobileUI, desktopUI];

  async connectedCallback() {
    super.connectedCallback();
    this.unwatchViewport = watchMobileViewport(this);
    this.unwatchWidth = watchViewportWidth(this);
    await this.loadData();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.unwatchViewport?.();
    this.unwatchWidth?.();
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

      // /settings/:key answers with a bare string, which the client's
      // JSON.parse rejects — so this must not be allowed to fail the whole
      // load, the way the other views already guard it.
      const currencySetting = await api.get('/settings/currency').catch(() => null);
      const currency = typeof currencySetting === 'string'
        ? currencySetting
        : currencySetting?.value;
      this.currency = currency || localStorage.getItem('priperfin_currency') || 'USD';

      // The desktop layout prints spend against budget; the phone list does
      // not, so it does not pay for the request.
      if (!this.isMobile) {
        const transactions = await api
          .get('/transactions', { filterMode: 'month', month: this.month, year: this.year })
          .catch(() => []);
        this.monthTransactions = Array.isArray(transactions) ? [...transactions] : [];
      }
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

  // ------------------------------------------------------------------
  // Desktop layout (> 600px)
  // ------------------------------------------------------------------

  /** The 340px side column only fits while the tree still gets ~620px. */
  private get showSideColumn() {
    return contentWidth(this.viewportWidth) - 356 >= 620;
  }

  private get isExpenseTab() {
    return this.activeTab === 'EXPENSE';
  }

  private get symbol() {
    return this.currency === 'EUR' ? '€' : '$';
  }

  private money(value: number, decimals = 2): string {
    return `${this.symbol}${Math.abs(value).toLocaleString(i18n.getLocale(), {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    })}`;
  }

  /** The month the spend figures cover, e.g. "August". */
  private periodName(): string {
    const name = new Date(this.year, this.month - 1, 1)
      .toLocaleString(i18n.getLocale(), { month: 'long' });
    return `${name.charAt(0).toUpperCase()}${name.slice(1)}`;
  }

  /**
   * Spend and transaction count per category for the current month, counted
   * from the period's own transactions so a split lands on each of its parts.
   */
  private get spendByCategory(): Map<string, { spent: number; count: number }> {
    const map = new Map<string, { spent: number; count: number }>();
    const add = (categoryId: string | null | undefined, amount: number) => {
      const key = categoryId || 'uncategorized';
      const entry = map.get(key) ?? { spent: 0, count: 0 };
      // Refunds net against the category they came back to
      entry.spent += -amount;
      entry.count += 1;
      map.set(key, entry);
    };

    this.monthTransactions.forEach(tx => {
      if (tx.splits && tx.splits.length > 0) {
        tx.splits.forEach((split: any) => add(split.categoryId, Number(split.amount) || 0));
      } else {
        add(tx.categoryId, Number(tx.amount) || 0);
      }
    });

    map.forEach(entry => { entry.spent = Math.max(0, entry.spent); });
    return map;
  }

  /** The categories on the active tab, as parents each with their children. */
  private categoryTree(): { parent: any; children: any[] }[] {
    const query = this.categoryQuery.trim().toLowerCase();
    const scope = this.isExpenseTab
      ? this.categories.filter(c => c.type === 'EXPENSE' || !c.type)
      : this.categories.filter(c => c.type === 'GOAL');
    const matches = (cat: any) => !query || String(cat.name).toLowerCase().includes(query);

    return scope
      .filter(c => !c.parentId)
      .sort((a, b) => a.name.localeCompare(b.name))
      .map(parent => ({
        parent,
        children: scope
          .filter(c => c.parentId === parent.id)
          .sort((a, b) => a.name.localeCompare(b.name)),
      }))
      // A search keeps a group whose own name matches, or any matching child
      .filter(({ parent, children }) => matches(parent) || children.some(matches))
      .map(({ parent, children }) => ({
        parent,
        children: matches(parent) ? children : children.filter(matches),
      }));
  }

  /** Own spend plus every child's, which is what a group's budget caps. */
  private groupSpend(parent: any, children: any[]): number {
    const spend = this.spendByCategory;
    return [parent, ...children]
      .reduce((sum, cat) => sum + (spend.get(cat.id)?.spent ?? 0), 0);
  }

  private closeDesktopMenus() {
    this.parentMenuOpen = false;
  }

  /** Opens a row's inline expand, seeding the shared category form. */
  private toggleRowEdit(cat: any) {
    if (this.editModeId === cat.id) {
      this.resetForm();
      return;
    }
    this.categoryForm = {
      name: cat.name || '',
      icon: cat.icon || '',
      color: cat.color || CHART_PALETTE[0],
      budget: cat.budget ?? null,
      type: cat.type || 'EXPENSE',
      parentId: cat.parentId || '',
    };
    this.editModeId = cat.id;
    this.showAddForm = false;
    this.showEmojiPicker = false;
    this.parentMenuOpen = false;
  }

  private startAdd(parentId = '') {
    this.resetForm();
    this.categoryForm = {
      ...this.categoryForm,
      type: this.activeTab,
      parentId,
      color: CHART_PALETTE[0],
      icon: '📁',
    };
    this.showAddForm = true;
  }

  private toggleCollapseAll() {
    const tree = this.categoryTree();
    const parentsWithChildren = tree.filter(node => node.children.length > 0);
    const anyExpanded = parentsWithChildren.some(node => !this.collapsedParents.has(node.parent.id));
    this.collapsedParents = anyExpanded
      ? new Set(parentsWithChildren.map(node => node.parent.id))
      : new Set();
  }

  private navigateToCategory(categoryId: string) {
    const params = new URLSearchParams({
      mode: 'month',
      month: String(this.month),
      year: String(this.year),
      categoryId,
    });
    window.location.href =
      `${getAppBasePath(document.baseURI)}?${params.toString()}`;
  }

  private renderDesktop() {
    const showSide = this.showSideColumn;

    return html`
      <div class="d-screen" @click="${() => this.closeDesktopMenus()}">
        ${this.renderDesktopHeader()}
        ${this.renderDesktopStrip()}

        <div
          class="d-content scroll top"
          style="grid-template-columns: ${showSide && this.isExpenseTab
            ? 'minmax(0, 1fr) 340px'
            : 'minmax(0, 1fr)'}">
          ${this.renderTreePanel()}
          ${showSide && this.isExpenseTab ? this.renderDesktopSide() : nothing}
        </div>

        ${this.showAddForm ? this.renderDesktopFormModal() : nothing}
        ${this.categoryToDelete ? html`
          <div class="modal-overlay" @click="${() => { this.categoryToDelete = null; }}">
            <div class="modal" @click="${(e: Event) => e.stopPropagation()}">
              <h3 style="margin-top: 0">${i18n.t('common.delete')}</h3>
              <p>${i18n.t('common.confirm_delete')}</p>
              <div class="modal-actions">
                <button @click="${() => { this.categoryToDelete = null; }}">
                  ${i18n.t('common.cancel')}
                </button>
                <button
                  class="danger"
                  style="background: var(--md-sys-color-error-container); color: var(--md-sys-color-on-error-container)"
                  @click="${this.confirmDelete}">
                  ${i18n.t('common.delete')}
                </button>
              </div>
            </div>
          </div>
        ` : nothing}
      </div>
    `;
  }

  private renderDesktopHeader() {
    const expenseCount = this.categories.filter(c => c.type === 'EXPENSE' || !c.type).length;
    const goalCount = this.categories.filter(c => c.type === 'GOAL').length;
    const tree = this.categoryTree();
    const collapsible = tree.filter(node => node.children.length > 0);
    const anyExpanded = collapsible.some(node => !this.collapsedParents.has(node.parent.id));

    return html`
      <div class="d-header">
        <h1>${i18n.t('nav.categories')}</h1>

        ${segmented(
          [
            { value: 'EXPENSE' as const, label: i18n.t('mobile.tab_expense'), count: expenseCount },
            { value: 'GOAL' as const, label: i18n.t('mobile.tab_goal'), count: goalCount },
          ],
          this.activeTab,
          value => {
            if (value === this.activeTab) return;
            this.activeTab = value;
            // Switching tabs closes whatever expand was open
            this.resetForm();
          },
        )}

        <div class="d-search" style="flex: 0 0 220px">
          ${icon('search', 20)}
          <input
            type="text"
            placeholder="${i18n.t('desktop.find_category')}"
            .value="${this.categoryQuery}"
            @input="${(e: any) => { this.categoryQuery = e.target.value; }}" />
        </div>

        <button
          class="d-btn-outlined"
          ?disabled="${collapsible.length === 0}"
          @click="${() => this.toggleCollapseAll()}">
          ${icon(anyExpanded ? 'unfold_less' : 'unfold_more', 16)}
          <span>${anyExpanded ? i18n.t('desktop.collapse_all') : i18n.t('desktop.expand_all')}</span>
        </button>

        <div class="d-spacer"></div>

        <button class="d-btn" @click="${() => this.startAdd()}">
          ${icon('add', 20)}
          <span>${i18n.t('desktop.new_category')}</span>
        </button>
      </div>
    `;
  }

  private renderDesktopStrip() {
    const tree = this.categoryTree();
    const scope = this.isExpenseTab
      ? this.categories.filter(c => c.type === 'EXPENSE' || !c.type)
      : this.categories.filter(c => c.type === 'GOAL');
    const spend = this.spendByCategory;

    const budgetTotal = scope.reduce((sum, cat) => sum + (Number(cat.budget) || 0), 0);
    const spentTotal = scope.reduce((sum, cat) => sum + (spend.get(cat.id)?.spent ?? 0), 0);
    const unbudgeted = scope.filter(cat => !(Number(cat.budget) > 0)).length;
    const uncategorised = spend.get('uncategorized')?.count ?? 0;

    return html`
      <div class="d-strip">
        <div class="d-strip-cell">
          <div>
            <div class="d-strip-label">
              ${this.isExpenseTab
                ? i18n.t('settings.expense_categories')
                : i18n.t('settings.goal_categories')}
            </div>
            <div class="d-strip-value lead">${scope.length}</div>
          </div>
        </div>

        <div class="d-strip-divider"></div>

        <div class="d-strip-cell">
          <div>
            <div class="d-strip-label">${i18n.t('desktop.groups')}</div>
            <div class="d-strip-value">${tree.length}</div>
          </div>
        </div>

        ${this.isExpenseTab ? html`
          <div class="d-strip-cell">
            <div>
              <div class="d-strip-label">${i18n.t('desktop.budgeted')}</div>
              <div class="d-strip-value">${this.money(budgetTotal)}/mo</div>
            </div>
          </div>

          <div class="d-strip-cell">
            <div>
              <div class="d-strip-label">
                ${i18n.t('desktop.spent_in', { period: this.periodName() })}
              </div>
              <div class="d-strip-value ${spentTotal > budgetTotal ? 'negative' : ''}">
                ${this.money(spentTotal)}
              </div>
            </div>
          </div>
        ` : nothing}

        <div class="d-spacer"></div>

        <div class="d-strip-cell tight" style="gap: 8px">
          ${this.isExpenseTab && unbudgeted > 0
            ? statusPill({
                glyph: 'money_off',
                label: i18n.t('desktop.without_budget', { count: unbudgeted }),
              })
            : nothing}
          ${uncategorised > 0
            ? statusPill({
                kind: 'attention',
                glyph: 'help',
                label: i18n.t(
                  uncategorised === 1
                    ? 'desktop.transactions_uncategorised_one'
                    : 'desktop.transactions_uncategorised',
                  { count: uncategorised }),
                onClick: () => this.navigateToCategory('uncategorized'),
              })
            : nothing}
        </div>
      </div>
    `;
  }

  private get rowColumns() {
    // The name column keeps a floor; the meta columns get minmax(0, …) so they
    // shrink first instead of starving it.
    return this.isExpenseTab
      ? 'minmax(160px, 1fr) minmax(0, 240px) minmax(0, 120px) 96px'
      : 'minmax(160px, 1fr) 96px';
  }

  private renderTreePanel() {
    const tree = this.categoryTree();

    return html`
      <div class="d-panel">
        <div class="d-thead short" style="grid-template-columns: ${this.rowColumns}; gap: 16px">
          <div class="d-th plain">${i18n.t('desktop.name_column')}</div>
          ${this.isExpenseTab ? html`
            <div class="d-th plain">
              ${i18n.t('desktop.spent_vs_budget', { period: this.periodName() })}
            </div>
            <div class="d-th plain right">${i18n.t('desktop.monthly_budget')}</div>
          ` : nothing}
          <div></div>
        </div>

        <div>
          ${this.loading
            ? html`<div class="d-empty-row">${i18n.t('common.loading')}</div>`
            : tree.length === 0
              ? html`<div class="d-empty-row">${i18n.t('common.no_data')}</div>`
              : tree.map(({ parent, children }) => html`
                ${this.renderTreeRow(parent, children)}
                ${this.collapsedParents.has(parent.id)
                  ? nothing
                  : children.map(child => this.renderTreeRow(child, []))}
              `)}
        </div>

        <button class="d-add-row" @click="${() => this.startAdd()}">
          ${icon('add', 20)}
          <span>
            ${this.isExpenseTab
              ? i18n.t('desktop.new_expense_category')
              : i18n.t('desktop.new_goal_category')}
          </span>
        </button>
      </div>
    `;
  }

  private renderTreeRow(cat: any, children: any[]) {
    const isChild = !!cat.parentId;
    const hasChildren = children.length > 0;
    const collapsed = this.collapsedParents.has(cat.id);
    const editing = this.editModeId === cat.id;

    const spend = this.spendByCategory;
    const spent = hasChildren || !isChild
      ? this.groupSpend(cat, children)
      : (spend.get(cat.id)?.spent ?? 0);
    const budget = Number(cat.budget) || 0;
    const over = budget > 0 && spent > budget;
    const parentColor = isChild
      ? (this.categories.find(c => c.id === cat.parentId)?.color || cat.color)
      : cat.color;

    return html`
      <div>
        <div
          class="d-row dc-row ${isChild ? 'child' : ''}"
          style="grid-template-columns: ${this.rowColumns}; gap: 16px"
          role="button"
          tabindex="0"
          @click="${() => this.toggleRowEdit(cat)}">
          <div class="dc-name" style="padding-left: ${isChild ? 22 : 0}px">
            ${hasChildren
              ? html`
                <button
                  class="dc-collapse"
                  title="${collapsed ? i18n.t('desktop.expand_all') : i18n.t('desktop.collapse_all')}"
                  @click="${(e: Event) => { e.stopPropagation(); this.toggleParentCollapse(cat.id); }}">
                  ${icon(collapsed ? 'chevron_right' : 'expand_more', 20)}
                </button>
              `
              : html`<span style="width: 20px; flex-shrink: 0"></span>`}

            <span class="d-dot" style="background: ${parentColor || CHART_PALETTE[0]}"></span>
            <span class="d-emoji">${cat.icon || ''}</span>
            <span class="dc-label ${isChild ? 'child' : ''}">${cat.name}</span>
            ${hasChildren ? html`
              <span class="d-tag subcount">
                ${i18n.t(children.length === 1 ? 'desktop.subs_one' : 'desktop.subs', {
                  count: children.length,
                })}
              </span>
            ` : nothing}
          </div>

          ${this.isExpenseTab ? html`
            <div style="min-width: 0">
              <div style="display: flex; align-items: baseline; gap: 6px">
                <span class="dc-spent ${over ? 'over' : ''}">${this.money(spent)}</span>
                <span class="dc-note">
                  ${budget <= 0
                    ? i18n.t('desktop.no_budget')
                    : over
                      ? i18n.t('desktop.over_by_short', { amount: this.money(spent - budget) })
                      : i18n.t('mobile.left_over', { amount: this.money(budget - spent) })}
                </span>
              </div>
              <div class="d-bar" style="margin-top: 4px">
                <div
                  class="d-bar-fill ${over ? 'over' : budget <= 0 ? 'none' : ''}"
                  style="width: ${budget > 0
                    ? Math.min(100, (spent / budget) * 100)
                    : spent > 0 ? 100 : 0}%${budget > 0 && !over
                      ? `; background: ${cat.color || CHART_PALETTE[0]}`
                      : ''}"></div>
              </div>
            </div>

            <div style="text-align: right; min-width: 0">
              ${budget > 0
                ? html`<span class="dc-budget">${this.money(budget, 0)}</span>`
                : html`<span class="d-link small">${i18n.t('desktop.set_budget')}</span>`}
            </div>
          ` : nothing}

          <div class="dc-actions">
            ${!isChild ? html`
              <button
                class="d-icon-btn inline"
                title="${i18n.t('desktop.add_subcategory')}"
                @click="${(e: Event) => { e.stopPropagation(); this.startAdd(cat.id); }}">
                ${icon('add', 18)}
              </button>
            ` : nothing}
            <button
              class="d-icon-btn inline"
              title="${i18n.t('common.edit')}"
              @click="${(e: Event) => { e.stopPropagation(); this.toggleRowEdit(cat); }}">
              ${icon('edit', 18)}
            </button>
            <span class="d-row-chevron">${icon(editing ? 'expand_less' : 'expand_more', 20)}</span>
          </div>
        </div>

        ${editing ? this.renderRowExpand(cat, hasChildren, budget) : nothing}
      </div>
    `;
  }

  private renderRowExpand(cat: any, hasChildren: boolean, budget: number) {
    const form = this.categoryForm;
    const parent = this.categories.find(c => c.id === form.parentId);
    const txCount = this.spendByCategory.get(cat.id)?.count ?? 0;

    const note = hasChildren
      ? i18n.t('desktop.note_group')
      : budget <= 0 && this.isExpenseTab
        ? i18n.t('desktop.note_unbudgeted')
        : i18n.t('desktop.note_rename');

    return html`
      <div class="d-expand" @click="${(e: Event) => e.stopPropagation()}">
        <div class="d-fields">
          ${formField(i18n.t('desktop.name_column'), html`
            <input
              class="d-input"
              type="text"
              .value="${form.name}"
              @input="${(e: any) => { this.categoryForm = { ...form, name: e.target.value }; }}" />
          `)}

          ${formField(i18n.t('settings.icon'), html`
            <div class="dc-anchor" style="display: block">
              <button
                class="d-select"
                @click="${(e: Event) => {
                  e.stopPropagation();
                  this.showEmojiPicker = !this.showEmojiPicker;
                }}">
                <span style="font-size: 16px">${form.icon || '📁'}</span>
                <span class="d-select-value muted">${i18n.t('desktop.change')}</span>
              </button>
              ${this.showEmojiPicker ? html`
                <div class="dc-pop" @click="${(e: Event) => e.stopPropagation()}">
                  <emoji-picker
                    @emoji-click="${(e: any) => {
                      this.categoryForm = { ...this.categoryForm, icon: e.detail.unicode };
                      this.showEmojiPicker = false;
                    }}"></emoji-picker>
                </div>
              ` : nothing}
            </div>
          `)}

          ${formField(i18n.t('settings.color'), html`
            <div class="d-select" style="cursor: default; gap: 6px; padding: 0 10px">
              ${CHART_PALETTE.slice(0, 6).map(color => html`
                <button
                  class="d-swatch ${form.color === color ? 'selected' : ''}"
                  style="background: ${color}"
                  title="${color}"
                  @click="${() => { this.categoryForm = { ...form, color }; }}"></button>
              `)}
            </div>
          `)}

          ${formField(i18n.t('desktop.parent_group'), html`
            <div class="dc-anchor" style="display: block">
              <button
                class="d-select"
                @click="${(e: Event) => {
                  e.stopPropagation();
                  this.parentMenuOpen = !this.parentMenuOpen;
                }}">
                <span class="d-select-value ${parent ? '' : 'muted'}">
                  ${parent ? `${parent.icon ?? ''} ${parent.name}` : i18n.t('desktop.top_level')}
                </span>
                ${icon('expand_more', 20)}
              </button>
              ${this.parentMenuOpen ? html`
                <div class="dc-pop list" @click="${(e: Event) => e.stopPropagation()}">
                  ${this.getParentCategoryOptions().map(option => html`
                    <button
                      class="dc-pop-row ${option.value === form.parentId ? 'selected' : ''}"
                      @click="${() => {
                        this.categoryForm = { ...form, parentId: option.value };
                        this.parentMenuOpen = false;
                      }}">
                      <span class="d-emoji">${option.icon ?? ''}</span>
                      <span>${option.label}</span>
                    </button>
                  `)}
                </div>
              ` : nothing}
            </div>
          `)}

          ${this.isExpenseTab
            ? formField(i18n.t('desktop.monthly_budget'), html`
              <input
                class="d-input amount"
                type="number"
                step="0.01"
                placeholder="0.00"
                .value="${form.budget ?? ''}"
                @input="${(e: any) => {
                  const value = e.target.value;
                  this.categoryForm = {
                    ...this.categoryForm,
                    budget: value === '' ? null : parseFloat(value),
                  };
                }}" />
            `)
            : nothing}
        </div>

        <div class="d-actions">
          <button class="d-btn small plain" @click="${() => this.saveCategory()}">
            ${i18n.t('common.save')}
          </button>
          <button class="d-btn-text" @click="${() => this.resetForm()}">
            ${i18n.t('common.cancel')}
          </button>

          <div class="d-actions-divider"></div>

          <button class="d-btn-tonal" @click="${() => this.navigateToCategory(cat.id)}">
            ${icon('receipt_long', 18)}
            <span>
              ${i18n.t(txCount === 1 ? 'desktop.see_transaction_one' : 'desktop.see_transactions', {
                count: txCount,
              })}
            </span>
          </button>

          <div class="d-spacer"></div>

          <button class="d-btn-text destructive" @click="${() => this.deleteCategory(cat.id)}">
            ${icon('delete', 18)}
            <span>${i18n.t('common.delete')}</span>
          </button>
        </div>

        ${footnote('info', note)}
      </div>
    `;
  }

  private renderDesktopSide() {
    const tree = this.categoryTree();
    const spend = this.spendByCategory;

    const groups = tree
      .map(({ parent, children }) => ({
        parent,
        budget: Number(parent.budget) || 0,
        children,
      }))
      .filter(entry => entry.budget > 0)
      .sort((a, b) => b.budget - a.budget);
    const planTotal = groups.reduce((sum, entry) => sum + entry.budget, 0);

    const scope = this.categories.filter(c => c.type === 'EXPENSE' || !c.type);
    const unbudgeted = scope
      .map(cat => ({ cat, spent: spend.get(cat.id)?.spent ?? 0 }))
      .filter(entry => entry.spent > 0 && !(Number(entry.cat.budget) > 0))
      .sort((a, b) => b.spent - a.spent);

    return html`
      <div style="display: flex; flex-direction: column; gap: 12px; min-width: 0">
        <div class="d-panel pad">
          <div class="d-panel-head">
            <span class="d-panel-title">${i18n.t('desktop.budget_by_group')}</span>
            <div class="d-spacer"></div>
            <span class="dc-budget">${this.money(planTotal)}</span>
          </div>
          <div class="d-panel-caption">${i18n.t('desktop.share_of_plan')}</div>

          <div style="display: flex; flex-direction: column; gap: 11px; margin-top: 14px">
            ${groups.length === 0
              ? html`<div class="d-panel-caption">${i18n.t('desktop.no_budgets_yet')}</div>`
              : groups.map(entry => {
                  const share = planTotal > 0 ? (entry.budget / planTotal) * 100 : 0;
                  return rankedBar({
                    emoji: entry.parent.icon || '',
                    name: entry.parent.name,
                    amount: this.money(entry.budget, 0),
                    percent: share,
                    share: `${Math.round(share)}%`,
                    color: entry.parent.color || CHART_PALETTE[0],
                    onClick: () => this.toggleRowEdit(entry.parent),
                  });
                })}
          </div>
        </div>

        <div class="d-panel pad">
          <div class="d-panel-title">${i18n.t('desktop.no_budget_set')}</div>
          <div class="d-panel-caption">
            ${i18n.t('desktop.no_budget_set_sub', { period: this.periodName() })}
          </div>

          <div style="display: flex; flex-direction: column; margin-top: 10px">
            ${unbudgeted.length === 0
              ? html`<div class="d-panel-caption">${i18n.t('desktop.every_spend_planned')}</div>`
              : unbudgeted.map(entry => html`
                <button class="dc-unbudgeted" @click="${() => this.toggleRowEdit(entry.cat)}">
                  <span class="d-emoji" style="font-size: 13px">${entry.cat.icon || ''}</span>
                  <span style="flex: 1; min-width: 0">
                    <span class="dc-unbudgeted-name">${entry.cat.name}</span>
                    <span class="dc-unbudgeted-parent">
                      ${entry.cat.parentId
                        ? this.categories.find(c => c.id === entry.cat.parentId)?.name ?? ''
                        : i18n.t('desktop.top_level')}
                    </span>
                  </span>
                  <span class="dc-spent">${this.money(entry.spent)}</span>
                </button>
              `)}
          </div>
        </div>
      </div>
    `;
  }

  /** New category / new subcategory as a dialog rather than a card in the flow. */
  private renderDesktopFormModal() {
    const form = this.categoryForm;
    const parent = this.categories.find(c => c.id === form.parentId);

    return html`
      <div class="modal-overlay" @click="${() => this.resetForm()}">
        <div class="modal" style="max-width: 560px" @click="${(e: Event) => e.stopPropagation()}">
          <h3 style="margin-top: 0">${i18n.t('desktop.new_category')}</h3>

          <div class="d-screen" style="display: block; height: auto; padding: 0; overflow: visible">
            <div class="d-fields">
              ${formField(i18n.t('desktop.name_column'), html`
                <input
                  class="d-input"
                  type="text"
                  .value="${form.name}"
                  @input="${(e: any) => { this.categoryForm = { ...form, name: e.target.value }; }}" />
              `, true)}

              ${formField(i18n.t('settings.icon'), html`
                <input
                  class="d-input"
                  type="text"
                  style="text-align: center"
                  .value="${form.icon}"
                  @input="${(e: any) => { this.categoryForm = { ...form, icon: e.target.value }; }}" />
              `)}

              ${formField(i18n.t('settings.color'), html`
                <div class="d-select" style="cursor: default; gap: 6px; padding: 0 10px">
                  ${CHART_PALETTE.slice(0, 6).map(color => html`
                    <button
                      class="d-swatch ${form.color === color ? 'selected' : ''}"
                      style="background: ${color}"
                      @click="${() => { this.categoryForm = { ...form, color }; }}"></button>
                  `)}
                </div>
              `)}

              ${formField(i18n.t('desktop.parent_group'), html`
                <filterable-select
                  .value="${form.parentId}"
                  .options="${this.getParentCategoryOptions()}"
                  .placeholder="${i18n.t('desktop.top_level')}"
                  @change="${(e: CustomEvent) => {
                    this.categoryForm = { ...this.categoryForm, parentId: e.detail.value };
                  }}">
                </filterable-select>
              `)}

              ${form.type === 'EXPENSE'
                ? formField(i18n.t('desktop.monthly_budget'), html`
                  <input
                    class="d-input amount"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    .value="${form.budget ?? ''}"
                    @input="${(e: any) => {
                      const value = e.target.value;
                      this.categoryForm = {
                        ...this.categoryForm,
                        budget: value === '' ? null : parseFloat(value),
                      };
                    }}" />
                `)
                : nothing}
            </div>

            ${parent ? html`
              ${footnote('info', i18n.t('desktop.adding_under', { name: parent.name }))}
            ` : nothing}

            <div class="d-actions">
              <div class="d-spacer"></div>
              <button class="d-btn-text" @click="${() => this.resetForm()}">
                ${i18n.t('common.cancel')}
              </button>
              <button class="d-btn small plain" @click="${() => this.saveCategory()}">
                ${i18n.t('common.save')}
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  render() {
    return this.isMobile ? this.renderMobile() : this.renderDesktop();
  }
}
