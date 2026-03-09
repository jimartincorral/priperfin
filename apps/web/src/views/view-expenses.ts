import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { api } from '../api/client';
import '../components/csv-wizard';
import '../components/split-transaction-modal';
import '../components/rule-editor';
import '../components/filterable-select';
import 'emoji-picker-element';
import type { SelectOption } from '../components/filterable-select';

import { i18n } from '../i18n/i18n';


type DateFilterMode = 'month' | 'year' | 'custom' | 'all_time';

@customElement('view-expenses')
export class ViewExpenses extends LitElement {
  @state() transactions: any[] = [];
  @state() categories: any[] = [];
  @state() month = new Date().getMonth() + 1;
  @state() year = new Date().getFullYear();
  @state() dateFilterMode: DateFilterMode = 'month';
  @state() customStartDate = '';
  @state() customEndDate = '';
  @state() loading = false;

  @state() totalBalance = 0;
  @state() verifiedBalance = 0;
  @state() startingBalance = 0;
  @state() balanceLoading = false;
  @state() showSetBalanceDateModal = false;
  @state() newBalanceDate = new Date().toISOString().split('T')[0];
  @state() newBalanceAmount = 0;
  @state() newBalanceNotes = '';
  @state() accountBalances: any[] = [];

  @state() accounts: any[] = [];
  @state() selectedAccountId: string = ''; // Empty = All Accounts

  // Cost Objects (for credit cards)
  @state() costObjects: any[] = [];
  @state() costObjectBreakdown: any[] = [];

  get selectedAccount() {
    return this.accounts.find(a => a.id === this.selectedAccountId) || null;
  }

  get isCredit() {
    return this.selectedAccount?.type === 'CREDIT';
  }

  getYearOptions(): number[] {
    const currentYear = new Date().getFullYear();
    const years: number[] = [];
    // Show years from 5 years ago to current year
    for (let y = currentYear - 5; y <= currentYear; y++) {
      years.push(y);
    }
    return years;
  }

  getCategoryOptions(includeAddNew = false): SelectOption[] {
    const options: SelectOption[] = [
      { value: 'uncategorized', label: i18n.t('common.uncategorized') }
    ];
    
    const expenseCategories = this.categories.filter(c => c.type === 'EXPENSE' || !c.type);
    const parents = expenseCategories.filter(c => !c.parentId).sort((a, b) => a.name.localeCompare(b.name));
    
    parents.forEach(parent => {
      options.push({
        value: parent.id,
        label: parent.name,
        icon: parent.icon,
        indent: 0
      });
      
      const children = expenseCategories.filter(c => c.parentId === parent.id).sort((a, b) => a.name.localeCompare(b.name));
      children.forEach(child => {
        options.push({
          value: child.id,
          label: child.name,
          icon: child.icon,
          indent: 1
        });
      });
    });
    
    if (includeAddNew) {
      options.push({
        value: 'new_category_inline',
        label: `+ ${i18n.t('settings.add_category')}`,
        indent: 0
      });
    }
    
    return options;
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

  getCostObjectOptions(): SelectOption[] {
    const options: SelectOption[] = [
      { value: '', label: `-- ${i18n.t('cost_objects.unassigned')} --` }
    ];
    
    this.costObjects.forEach(co => {
      options.push({
        value: co.id,
        label: co.name,
        icon: co.icon
      });
    });
    
    return options;
  }

  @state() currency = 'USD';

  @state() showAddForm = false;
  @state() newTransaction = { date: new Date().toISOString().split('T')[0], description: '', amount: 0, categoryId: '', costObjectId: '', notes: '' };
  @state() showWizard = false;
  @state() transactionToDelete: string | null = null;
  @state() showAddCategoryModal = false;
  @state() categoryForm = { name: '', icon: '📁', color: '', type: 'EXPENSE', parentId: '' };
  @state() showEmojiPicker = false;

  @state() showSplitModal = false;
  @state() splitTransaction: any = null;

  @state() showRuleModal = false;
  @state() ruleTransaction: any = null;

  @state() editingCell: { id: string, field: string } | null = null;

  @state() editValue: any = null;

  @state() sortField = 'date';
  @state() sortDirection: 'asc' | 'desc' = 'desc';

  @state() filterText = '';
  @state() filterMinAmount: number | null = null;
  @state() filterMaxAmount: number | null = null;
  @state() filterCategoryId = '';
  @state() filterDateFrom = '';
  @state() filterDateTo = '';

  @state() currentPage = 1;
  @state() pageSize = 20;

  @state() selectedTransactions: Set<string> = new Set();

  @state() showColumnModal = false;

  // Non-reactive property to preserve scroll position across renders
  private _preservedScrollY: number | null = null;
  @state() columnConfig: { id: string, label: string, visible: boolean }[] = [
    { id: 'select', label: 'Select', visible: true },
    { id: 'date', label: 'common.date', visible: true },
    { id: 'description', label: 'common.description', visible: true },
    { id: 'categoryId', label: 'common.category', visible: true },
    { id: 'costObjectId', label: 'cost_objects.funding_source', visible: false },
    { id: 'amount', label: 'common.amount', visible: true },
    { id: 'budget', label: 'expenses.budget_remaining', visible: true },
    { id: 'notes', label: 'common.notes', visible: true },
    { id: 'actions', label: 'common.actions', visible: true }
  ];

  normalizeColumnConfig(rawConfig: any) {
    const defaultConfig = [
      { id: 'select', label: 'Select', visible: true },
      { id: 'date', label: 'common.date', visible: true },
      { id: 'description', label: 'common.description', visible: true },
      { id: 'categoryId', label: 'common.category', visible: true },
      { id: 'costObjectId', label: 'cost_objects.funding_source', visible: false },
      { id: 'amount', label: 'common.amount', visible: true },
      { id: 'budget', label: 'expenses.budget_remaining', visible: true },
      { id: 'notes', label: 'common.notes', visible: true },
      { id: 'actions', label: 'common.actions', visible: true },
    ];

    if (!Array.isArray(rawConfig)) return defaultConfig;

    const defaultsById = new Map(defaultConfig.map(col => [col.id, col]));
    const mergedById = new Map(defaultConfig.map(col => [col.id, { ...col }]));

    rawConfig.forEach((item: any) => {
      if (!item || typeof item.id !== 'string') return;
      const defaultCol = defaultsById.get(item.id);
      if (!defaultCol) return;

      const isProtected = item.id === 'select' || item.id === 'actions';
      const nextVisible = isProtected ? true : (typeof item.visible === 'boolean' ? item.visible : defaultCol.visible);

      mergedById.set(item.id, {
        ...defaultCol,
        visible: nextVisible,
      });
    });

    const orderedIds = rawConfig
      .map((item: any) => item?.id)
      .filter((id: any, index: number, arr: any[]) => typeof id === 'string' && defaultsById.has(id) && arr.indexOf(id) === index);

    const missingIds = defaultConfig
      .map(col => col.id)
      .filter(id => !orderedIds.includes(id));

    return [...orderedIds, ...missingIds].map(id => mergedById.get(id)!);
  }

  get filteredTransactions() {
    let filtered = this.transactions;

    if (this.filterText) {
      const lower = this.filterText.toLowerCase();
      filtered = filtered.filter(t =>
        t.description.toLowerCase().includes(lower) ||
        (t.notes && t.notes.toLowerCase().includes(lower))
      );
    }

    if (this.filterMinAmount !== null) {
      filtered = filtered.filter(t => Math.abs(t.amount) >= this.filterMinAmount!);
    }

    if (this.filterMaxAmount !== null) {
      filtered = filtered.filter(t => Math.abs(t.amount) <= this.filterMaxAmount!);
    }

    if (this.isValidIsoDate(this.filterDateFrom)) {
      filtered = filtered.filter(t => new Date(t.date).toISOString().split('T')[0] >= this.filterDateFrom);
    }

    if (this.isValidIsoDate(this.filterDateTo)) {
      filtered = filtered.filter(t => new Date(t.date).toISOString().split('T')[0] <= this.filterDateTo);
    }

    if (this.filterCategoryId) {
      if (this.filterCategoryId === 'uncategorized') {
        filtered = filtered.filter(t => !t.categoryId || t.categoryId === 'uncategorized');
      } else {
        const isParent = this.categories.some(c => c.id === this.filterCategoryId && !c.parentId);
        if (isParent) {
          const children = this.categories.filter(c => c.parentId === this.filterCategoryId).map(c => c.id);
          const ids = [this.filterCategoryId, ...children];
          filtered = filtered.filter(t => ids.includes(t.categoryId));
        } else {
          filtered = filtered.filter(t => t.categoryId === this.filterCategoryId);
        }
      }
    }

    return filtered.sort((a, b) => {
      // 1. Primary Sort
      let result = this.compare(a, b, this.sortField, this.sortDirection);
      if (result !== 0) return result;

      // 2. Secondary Sort: Date (Always Descending for latest first)
      if (this.sortField !== 'date') {
        result = this.compare(a, b, 'date', 'desc');
        if (result !== 0) return result;
      }

      // 3. Tertiary Sort: Description (Alphabetical)
      if (this.sortField !== 'description') {
        result = this.compare(a, b, 'description', 'asc');
        if (result !== 0) return result;
      }

      return 0;
    });
  }

  get pagedTransactions() {
    const total = this.filteredTransactions.length;
    const safePageSize = Number.isFinite(this.pageSize) && this.pageSize > 0 ? Math.floor(this.pageSize) : 20;
    if (safePageSize !== this.pageSize) this.pageSize = safePageSize;

    const safeCurrentPage = Number.isFinite(this.currentPage) && this.currentPage > 0 ? Math.floor(this.currentPage) : 1;
    if (safeCurrentPage !== this.currentPage) this.currentPage = safeCurrentPage;

    const maxPage = Math.ceil(total / safePageSize) || 1;
    if (this.currentPage > maxPage) this.currentPage = 1;

    const start = (this.currentPage - 1) * safePageSize;
    return this.filteredTransactions.slice(start, start + safePageSize);
  }

  get sortedTransactions() {
    // Legacy getter, replaced by pagedTransactions for render
    return this.pagedTransactions;
  }

  connectedCallback() {
    super.connectedCallback();
    this.showWizard = false;
    i18n.addEventListener('lang-change', () => this.requestUpdate());
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    i18n.removeEventListener('lang-change', () => this.requestUpdate());
  }

  toggleSelection(id: string) {
    const newSet = new Set(this.selectedTransactions);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    this.selectedTransactions = newSet;
    this.requestUpdate();
  }

  toggleSelectAll(e: Event) {
    const checked = (e.target as HTMLInputElement).checked;
    if (checked) {
      this.selectedTransactions = new Set(this.pagedTransactions.map(t => t.id));
    } else {
      this.selectedTransactions = new Set();
    }
    // Force update to reflect state change if Lit doesn't detect Set mutation (it usually doesn't deeply watch Sets)
    this.requestUpdate();
  }

  async deleteSelected() {
    if (!confirm(`Are you sure you want to delete ${this.selectedTransactions.size} transactions?`)) return;

    try {
      for (const id of this.selectedTransactions) {
        await api.delete(`/transactions/${id}`);
      }
      this.selectedTransactions = new Set();
      await this.loadData(true);
    } catch (e: any) {
      alert('Failed to delete selected: ' + e.message);
    }
  }

  async bulkUpdateCategory(categoryId: string) {
    if (!categoryId) return;
    try {
      for (const id of this.selectedTransactions) {
        await api.patch(`/transactions/${id}`, { categoryId });
      }
      this.selectedTransactions = new Set();
      await this.loadData(true);
    } catch (e: any) {
      alert('Failed to update category: ' + e.message);
    }
  }

  async bulkUpdateAccount(accountId: string) {
    if (!accountId) return;
    try {
      await api.post('/transactions/bulk-assign-account', {
        transactionIds: Array.from(this.selectedTransactions),
        accountId: accountId === 'unassigned' ? null : accountId,
      });
      this.selectedTransactions = new Set();
      await this.loadData(true);
    } catch (e: any) {
      alert(i18n.t('bulk_actions.assign_account_failed') + ': ' + e.message);
    }
  }

  renderPaginationControls() {
    return html`
        <div class="pagination-controls" style="margin-bottom: 1rem;">
            <span style="font-size: 0.875rem; color: var(--md-sys-color-on-surface-variant);">${i18n.t('table.rows_per_page')}:</span>
            <select style="width: auto; height: 32px; padding: 0 8px;" 
                .value="${this.pageSize}" 
                @change="${(e: any) => {
                  const nextPageSize = parseInt(e.target.value, 10);
                  if (Number.isNaN(nextPageSize) || nextPageSize <= 0) return;
                  this.pageSize = nextPageSize;
                  this.currentPage = 1;
                }}">
                ${this.getPageSizeOptions().map(size => html`
                    <option value="${size}">${size}${size === this.filteredTransactions.length ? ` (${i18n.t('common.total')})` : ''}</option>
                `)}
            </select>

            <button class="btn-secondary" style="width: auto; height: 32px; padding: 0 12px;" @click="${() => this.showColumnModal = true}">${i18n.t('filters.columns')}</button>

            <span style="font-size: 0.875rem; color: var(--md-sys-color-on-surface-variant);">
                ${(this.currentPage - 1) * this.pageSize + 1}-${Math.min(this.currentPage * this.pageSize, this.filteredTransactions.length)} of ${this.filteredTransactions.length}
            </span>

            <div style="display: flex; gap: 8px;">
                <button class="btn-secondary" 
                    ?disabled="${this.currentPage === 1}"
                    @click="${() => this.currentPage--}">
                    <
                </button>
                <button class="btn-secondary" 
                    ?disabled="${this.currentPage * this.pageSize >= this.filteredTransactions.length}"
                    @click="${() => this.currentPage++}">
                    >
                </button>
            </div>
        </div>
      `;
  }

  async loadBalances() {
    this.balanceLoading = true;
    const { year: balanceYear, month: balanceMonth } = this.getBalanceReferenceMonthYear();
    const monthKey = `${balanceYear}-${String(balanceMonth).padStart(2, '0')}`;
    const startBalanceKey = `starting_balance_all_${monthKey}`;
    const accountKey = this.selectedAccountId || 'all';
    const verifiedBalanceKey = `balance_verified_${accountKey}_${balanceYear}_${balanceMonth}`;

    try {
      const [balData, settingData, monthlyRecord, allAccountsStartSetting] = await Promise.all([
        api.get('/transactions/balance', this.selectedAccountId ? { accountId: this.selectedAccountId } : {}),
        api.get(`/settings/${verifiedBalanceKey}`).catch(() => null),
        this.selectedAccountId
          ? api.get(
          `/monthly-balances/${monthKey}`,
          this.selectedAccountId ? { accountId: this.selectedAccountId } : {},
        ).catch(() => null)
          : Promise.resolve(null),
        !this.selectedAccountId
          ? api.get(`/settings/${startBalanceKey}`).catch(() => null)
          : Promise.resolve(null),
      ]);

      this.totalBalance = balData.total ?? balData.balance ?? 0;
      this.verifiedBalance = settingData ? parseFloat(settingData) : 0;

      if (monthlyRecord) {
        this.startingBalance = Number(monthlyRecord.balance);
      } else if (allAccountsStartSetting !== null && allAccountsStartSetting !== undefined) {
        this.startingBalance = Number(allAccountsStartSetting);
      } else {
        await this.suggestStartingBalance(balanceMonth, balanceYear);
      }
    } catch (e) {
      console.error('Failed to load balances', e);
    } finally {
      this.balanceLoading = false;
    }
  }

  getBalanceReferenceMonthYear() {
    if (this.dateFilterMode === 'all_time' && this.transactions.length > 0) {
      const latestTxDate = this.transactions
        .map((t: any) => new Date(t.date))
        .sort((a, b) => b.getTime() - a.getTime())[0];
      return {
        month: latestTxDate.getMonth() + 1,
        year: latestTxDate.getFullYear(),
      };
    }

    return { month: this.month, year: this.year };
  }

  async suggestStartingBalance(targetMonth = this.month, targetYear = this.year) {
    // Calculate previous month
    let prevMonth = targetMonth - 1;
    let prevYear = targetYear;
    if (prevMonth === 0) {
      prevMonth = 12;
      prevYear--;
    }
    const prevKey = `${prevYear}-${String(prevMonth).padStart(2, '0')}`;
    const prevAllAccountsStartBalanceKey = `starting_balance_all_${prevKey}`;

    try {
      // Get previous starting balance
      const [prevRecord, prevAllAccountsStartSetting] = await Promise.all([
        this.selectedAccountId
          ? api.get(
            `/monthly-balances/${prevKey}`,
            this.selectedAccountId ? { accountId: this.selectedAccountId } : {},
          ).catch(() => null)
          : Promise.resolve(null),
        !this.selectedAccountId
          ? api.get(`/settings/${prevAllAccountsStartBalanceKey}`).catch(() => null)
          : Promise.resolve(null),
      ]);
      const prevStart = prevRecord
        ? Number(prevRecord.balance)
        : (prevAllAccountsStartSetting !== null && prevAllAccountsStartSetting !== undefined
          ? Number(prevAllAccountsStartSetting)
          : 0);

      // Get previous transactions to calc net change
      const prevTxs = await api.get('/transactions', {
        month: prevMonth,
        year: prevYear,
        ...(this.selectedAccountId ? { accountId: this.selectedAccountId } : {}),
      });

      let income = 0;
      let expense = 0;

      prevTxs.forEach((t: any) => {
        const cat = this.categories.find(c => c.id === t.categoryId);
        const amount = Number(t.amount);
        if (cat?.type === 'INCOME' || amount > 0) income += amount;
        else expense += amount;
      });

      this.startingBalance = prevStart + income - expense;
      // Auto-save inferred balance? Maybe better to let user confirm. 
      // User request says "suggest". So filling it but not saving is safer until they interact or we decide.
      // But if we don't save, next refresh it will recalc. That's fine.
    } catch (e) {
      console.warn('Failed to suggest balance', e);
    }
  }

  async handleStartingBalanceChange(e: any) {
    const newVal = parseFloat(e.target.value);
    if (isNaN(newVal)) return;

    this.startingBalance = newVal;
    const monthKey = `${this.year}-${String(this.month).padStart(2, '0')}`;
    const startBalanceKey = `starting_balance_all_${monthKey}`;
    try {
      if (this.selectedAccountId) {
        await api.post('/monthly-balances', {
          month: monthKey,
          balance: newVal,
          accountId: this.selectedAccountId,
        });
      } else {
        await api.post(`/settings/${startBalanceKey}`, { value: newVal.toString() });
      }
    } catch (e) {
      console.error('Failed to save monthly balance', e);
    }
  }

  getMonthKey(dateValue: string) {
    const date = new Date(dateValue);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
  }

  async setStartingBalanceFromTransaction(tx: any) {
    const currentPrompt = `${i18n.t('expenses.set_from_movement_prompt')} (${new Date(tx.date).toISOString().split('T')[0]})`;
    const entered = window.prompt(currentPrompt, (this.verifiedBalance || 0).toFixed(2));
    if (entered === null) return;

    const anchorBalanceAfter = parseFloat(entered.replace(',', '.'));
    if (!Number.isFinite(anchorBalanceAfter)) {
      alert(i18n.t('expenses.set_from_movement_invalid'));
      return;
    }

    try {
      const allTxs = await api.get('/transactions', {
        filterMode: 'all_time',
        ...(this.selectedAccountId ? { accountId: this.selectedAccountId } : {}),
      });

      const sortedTxs = [...allTxs].sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());
      const anchorIndex = sortedTxs.findIndex((item: any) => item.id === tx.id);
      if (anchorIndex === -1) {
        alert(i18n.t('expenses.set_from_movement_failed'));
        return;
      }

      const anchorMonth = this.getMonthKey(tx.date);
      const txUntilAnchorInMonth = sortedTxs.filter((item: any, index: number) => index <= anchorIndex && this.getMonthKey(item.date) === anchorMonth);
      const movementUntilAnchor = txUntilAnchorInMonth.reduce((sum: number, item: any) => sum + Number(item.amount || 0), 0);
      const anchorMonthStart = anchorBalanceAfter - movementUntilAnchor;

      const monthKeys = Array.from(new Set(sortedTxs
        .slice(anchorIndex)
        .map((item: any) => this.getMonthKey(item.date))))
        .sort();

      let rollingMonthStart = anchorMonthStart;
      for (const monthKey of monthKeys) {
        if (this.selectedAccountId) {
          await api.post('/monthly-balances', {
            month: monthKey,
            balance: rollingMonthStart,
            accountId: this.selectedAccountId,
          });
        } else {
          await api.post(`/settings/starting_balance_all_${monthKey}`, {
            value: rollingMonthStart.toString(),
          });
        }

        const monthlyNet = sortedTxs
          .filter((item: any) => this.getMonthKey(item.date) === monthKey)
          .reduce((sum: number, item: any) => sum + Number(item.amount || 0), 0);

        rollingMonthStart += monthlyNet;
      }

      await this.loadData(true);
      alert(i18n.t('expenses.set_from_movement_done'));
    } catch (e: any) {
      console.error('Failed to set balances from movement', e);
      alert(`${i18n.t('expenses.set_from_movement_failed')}: ${e.message || i18n.t('common.unknown_error')}`);
    }
  }

  async saveNewCategory() {
    if (!this.categoryForm.name) {
      alert('Please enter a category name');
      return;
    }

    try {
      const payload = {
        name: this.categoryForm.name,
        icon: this.categoryForm.icon,
        // color: this.categoryForm.color, // Color is optional/removed from UI
        type: this.categoryForm.type,
        parentId: this.categoryForm.parentId || null
      };
      await api.post('/categories', payload);
      this.showAddCategoryModal = false;
      this.categoryForm = { name: '', icon: '📁', color: '#006493', type: 'EXPENSE', parentId: '' };
      await this.loadData(true);
    } catch (e: any) {
      console.error('Failed to save category', e);
      alert('Failed to save category: ' + (e.message || 'Unknown error'));
    }
  }

  get monthlyStats() {
    let income = 0;
    let expense = 0;

    this.transactions.forEach(t => {
      // Handle split transactions
      if (t.splits && t.splits.length > 0) {
        t.splits.forEach((split: any) => {
          if (!split.categoryId) return;
          const splitCat = this.categories.find(c => c.id === split.categoryId);
          const splitAmt = Number(split.amount);

          // Income if category type is INCOME OR amount is positive
          const isIncome = (splitCat?.type === 'INCOME') || splitAmt > 0;

          if (isIncome) {
            income += splitAmt;
          } else {
            // Expenses are stored as negative, so subtract to get positive magnitude
            expense -= splitAmt;
          }
        });
      } else {
        // No splits, use parent transaction
        const cat = this.categories.find(c => c.id === t.categoryId);
        const amt = Number(t.amount);

        // Income if category type is INCOME OR amount is positive
        const isIncome = (cat?.type === 'INCOME') || amt > 0;

        if (isIncome) {
          income += amt;
        } else {
          // Expenses are stored as negative, so subtract to get positive magnitude
          expense -= amt;
        }
      }
    });
    return { income, expense };
  }

  getPageSizeOptions() {
    const defaultSizes = [20, 50, 100, 200];
    const totalRows = this.filteredTransactions.length;
    const currentPageSize = Number(this.pageSize);
    const sizes = [
      ...defaultSizes,
      totalRows,
      currentPageSize,
    ].filter(size => Number.isFinite(size) && size > 0) as number[];
    return Array.from(new Set(sizes)).sort((a, b) => a - b);
  }

  isValidIsoDate(value: string) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
    const parsed = new Date(`${value}T00:00:00`);
    if (Number.isNaN(parsed.getTime())) return false;
    return parsed.toISOString().slice(0, 10) === value;
  }

  normalizeDateInput(value: string) {
    return value
      .trim()
      .replace(/[./\s]+/g, '-')
      .replace(/[^\d-]/g, '')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }

  async updateVerifiedBalance(e: any) {
    const newVal = parseFloat(e.target.value);
    if (isNaN(newVal)) return;

    this.verifiedBalance = newVal;
    const accountKey = this.selectedAccountId || 'all';
    const verifiedBalanceKey = `balance_verified_${accountKey}_${this.year}_${this.month}`;

    try {
      await api.post(`/settings/${verifiedBalanceKey}`, { value: newVal.toString() });
    } catch (e) {
      console.error('Failed to save balance', e);
    }
  }

  async handleDescriptionBlur(e: any) {
    const desc = e.target.value;
    if (!desc || this.newTransaction.categoryId) return; // Don't overwrite if set

    try {
      const suggestion = await api.get('/transactions/suggest', { description: desc });
      if (suggestion && suggestion.categoryId) {
        this.newTransaction = { ...this.newTransaction, categoryId: suggestion.categoryId };
      }
    } catch (e) {
      console.error('Failed to get suggestion', e);
    }
  }

  compare(a: any, b: any, field: string, direction: 'asc' | 'desc') {
    let valA = a[field];
    let valB = b[field];

    if (field === 'categoryId') {
      const catA = this.categories.find(c => c.id === a.categoryId);
      const catB = this.categories.find(c => c.id === b.categoryId);
      valA = catA ? catA.name : '';
      valB = catB ? catB.name : '';
    }

    // Handle numeric fields (amount)
    if (field === 'amount') {
      valA = Number(valA) || 0;
      valB = Number(valB) || 0;
    }
    // Safe lowercasing for strings
    else if (typeof valA === 'string') {
      valA = valA.toLowerCase();
    }
    if (typeof valB === 'string' && field !== 'amount') {
      valB = valB.toLowerCase();
    }

    if (valA < valB) return direction === 'asc' ? -1 : 1;
    if (valA > valB) return direction === 'asc' ? 1 : -1;
    return 0;
  }

  toggleSort(field: string) {
    if (this.sortField === field) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortField = field;
      this.sortDirection = 'asc';
    }
  }

  static styles = css`
    :host { display: block; color-scheme: dark; }
    
    .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
    h1 { font: var(--md-sys-typescale-headline-medium); color: var(--md-sys-color-on-surface); margin: 0; }

    /* Filters: Outlined inputs */
    .filters { display: flex; gap: 12px; align-items: center; flex-wrap: wrap; }
    select, input {
        height: 36px;
        padding: 0 12px;
        border: 1px solid var(--md-sys-color-outline);
        border-radius: 4px;
        background-color: var(--md-sys-color-surface-container);
        color: var(--md-sys-color-on-surface);
        font-size: 14px;
        box-sizing: border-box;
        transition: border-color 0.2s;
    }
    input:focus, select:focus {
        border-color: var(--md-sys-color-primary);
        outline: 1px solid var(--md-sys-color-primary);
    }

    input[type="checkbox"] {
        accent-color: var(--md-sys-color-primary);
    }

    .form-group { margin-bottom: 16px; }
    label { display: block; margin-bottom: 8px; font: var(--md-sys-typescale-label-medium); color: var(--md-sys-color-on-surface-variant); }

    /* Force dark mode for select dropdowns */
    select {
        color-scheme: dark;
    }
    
    select option {
        background-color: var(--md-sys-color-surface-container) !important;
        color: var(--md-sys-color-on-surface) !important;
    }
    
    /* Target the dropdown list container for browsers that support it */
    select:not([multiple]):not([size]) {
        background-image: none;
    }
    
    /* Buttons: MD3 configurations */
    button {
        height: 36px;
        padding: 0 20px;
        border-radius: 18px; /* Stadium shape */
        border: none;
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        transition: background-image 0.2s, box-shadow 0.2s, background-color 0.2s;
    }
    
    /* Filled Button (Primary) */
    .btn-primary {
        background-color: var(--md-sys-color-primary);
        color: var(--md-sys-color-on-primary);
        box-shadow: 0 1px 2px rgba(0,0,0,0.12); /* Elevation 1 */
    }
    .btn-primary:hover {
        box-shadow: 0 1px 3px 1px rgba(0,0,0,0.15); /* Elevation 2 */
        background-image: linear-gradient(rgba(255,255,255,0.08), rgba(255,255,255,0.08));
    }
    
    /* Tonal Button (Secondary) */
    .btn-secondary {
        background-color: var(--md-sys-color-secondary-container);
        color: var(--md-sys-color-on-secondary-container);
    }
    .btn-secondary:hover {
        box-shadow: 0 1px 2px rgba(0,0,0,0.12);
        background-image: linear-gradient(rgba(29, 25, 43, 0.08), rgba(29, 25, 43, 0.08));
    }

    .btn-danger {
        background-color: var(--md-sys-color-error);
        color: var(--md-sys-color-on-error);
        width: 32px; height: 32px; padding: 0;
    }

    .action-buttons {
        display: flex;
        align-items: center;
        gap: 6px;
        flex-wrap: wrap;
    }

    .action-icon {
        width: 32px;
        height: 32px;
        min-width: 32px;
        padding: 0;
        border-radius: 16px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
    }

    /* Cards: Elevated */
    .card {
        background: var(--md-sys-color-surface-container-low);
        border-radius: var(--md-sys-shape-corner-medium);
        padding: 16px;
        box-shadow: 0 1px 3px 0 rgba(0,0,0,0.12), 0 1px 2px 0 rgba(0,0,0,0.24); /* Elevation 1 */
        margin-bottom: 16px;
        display: flex; gap: 20px; align-items: center;
        overflow: hidden; /* Prevent overflow causing scrollbars */
    }
    .card h2 { margin: 0; font: var(--md-sys-typescale-title-small); color: var(--md-sys-color-on-surface-variant); }
    .card .balance { font: var(--md-sys-typescale-display-small); color: var(--md-sys-color-on-surface); line-height: 1.2; margin-top: 4px; }
    
    /* Badges */
    .category-badge { display: inline-flex; align-items: center; gap: 0.5rem; padding: 6px 12px; border-radius: 8px; font: var(--md-sys-typescale-label-medium); color: white; }
    
    /* Table */
    .table-container { 
        overflow-x: auto; -webkit-overflow-scrolling: touch; 
        border-radius: var(--md-sys-shape-corner-large); 
        border: 1px solid var(--md-sys-color-outline-variant);
        background: var(--md-sys-color-surface);
    }
    table { width: 100%; min-width: 600px; border-collapse: separate; border-spacing: 0; background: var(--md-sys-color-surface); table-layout: auto; }
    th, td { padding: 6px 10px; text-align: left; border-bottom: 1px solid var(--md-sys-color-outline-variant); vertical-align: middle; position: relative; color: var(--md-sys-color-on-surface); font-size: 14px; }
    th { background: var(--md-sys-color-surface-container); font: var(--md-sys-typescale-title-small); color: var(--md-sys-color-on-surface-variant); text-transform: none; letter-spacing: 0.1px; font-size: 14px; font-weight: 500; }
    
    td { font: var(--md-sys-typescale-body-medium); }

    .resizer { position: absolute; right: 0; top: 0; height: 100%; width: 5px; background: transparent; cursor: col-resize; user-select: none; touch-action: none; }
    .resizer:hover, .resizing .resizer { background: var(--md-sys-color-primary); }
    tr:last-child td { border-bottom: none; }
    tr:nth-child(even) { background-color: var(--md-sys-color-surface-container-high); } /* Striped rows */
    tr:hover { background-color: var(--md-sys-color-surface-container-highest); }

    .amount { font-family: 'Roboto Mono', monospace; font-weight: 500; white-space: nowrap; }
    .amount.negative { color: var(--md-sys-color-on-surface); } /* Neutral for negative */
    .amount.positive { color: #16a34a; } /* Custom green for income still ok */
    
    .col-description { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 300px; }
    .col-date { white-space: nowrap; }
    .col-notes { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 200px; }

    .pagination-controls { display: flex; justify-content: flex-end; align-items: center; gap: 12px; margin-top: 12px; }
    .pagination-controls button { width: 32px; height: 32px; padding: 0; border-radius: 16px; min-width: 32px; }

    @media (max-width: 768px) {
        .header { flex-direction: column; align-items: flex-start; gap: 16px; }
        .filters { flex-wrap: wrap; width: 100%; gap: 12px; }
        .filters button, .filters select { flex-grow: 1; }
        .card { flex-wrap: wrap; gap: 16px !important; padding: 16px; }
        .card > div { flex: 1 1 auto; }
        .card .balance { font-size: 28px; }
        .col-description { max-width: 150px; } 
        .table-container {
            border-top-right-radius: 0;
            border-bottom-right-radius: 0;
            border-right: none;
            margin-right: -1rem; /* Bleed into the padding area */
        }
    }
    
    td.editable { cursor: pointer; position: relative; transition: background-color 0.2s; }
    td.editable:hover { background-color: var(--md-sys-color-surface-container-highest); }
    td.editable input, td.editable select { width: 100%; height: 100%; box-sizing: border-box; background: transparent; border: none; padding: 0; font: inherit; }
    td.editable input:focus, td.editable select:focus { outline: none; border-bottom: 2px solid var(--md-sys-color-primary); border-radius: 0; }
    td.editable filterable-select { display: block; }

    .modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; }
    .modal { background: var(--md-sys-color-surface-container-high); padding: 24px; border-radius: 28px; box-shadow: 0 4px 8px rgba(0,0,0,0.2); max-width: 400px; width: 100%; color: var(--md-sys-color-on-surface); }
    .modal h3 { font: var(--md-sys-typescale-headline-small); margin-top: 0; color: var(--md-sys-color-on-surface); margin-bottom: 16px; }
    .modal p { color: var(--md-sys-color-on-surface-variant); font: var(--md-sys-typescale-body-medium); margin-bottom: 24px; }
    .modal-actions { display: flex; justify-content: flex-end; gap: 8px; }

    .vertical-divider { width: 1px; height: 40px; background: var(--md-sys-color-outline-variant); }
    .amount-input { font: var(--md-sys-typescale-headline-medium); color: var(--md-sys-color-on-surface); border: none; border-bottom: 1px solid var(--md-sys-color-outline); width: 140px; padding: 4px; outline: none; background: transparent; height: auto; }
    .amount-input:focus { border-bottom: 2px solid var(--md-sys-color-primary); }
    .alert-error { margin-left: auto; padding: 1rem; background: var(--md-sys-color-error-container); border-radius: 8px; color: var(--md-sys-color-on-error-container); display: flex; align-items: center; gap: 1rem; }
    .alert-success { margin-left: auto; padding: 1rem; background: #dcfce7; border-radius: 8px; color: #14532d; display: flex; align-items: center; gap: 1rem; }

    emoji-picker { 
        position: relative;
        width: 350px; 
        height: 300px; 
        margin-top: 8px; 
        --emoji-size: 1.5rem; 
        background: var(--md-sys-color-surface-container-high);
        border: 1px solid var(--md-sys-color-outline-variant);
        border-radius: 8px;
    }
  `;

  async firstUpdated() {
    const storedCurrency = localStorage.getItem('priperfin_currency');
    if (storedCurrency) this.currency = storedCurrency;

    const storedColumns = localStorage.getItem('priperfin_column_config');
    if (storedColumns) {
      try {
        const parsedColumns = JSON.parse(storedColumns);
        this.columnConfig = this.normalizeColumnConfig(parsedColumns);
      } catch (e) { console.error('Failed to parse column config', e); }
    }

    this.loadFiltersFromURL();
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
    if (params.has('categoryId')) {
      this.filterCategoryId = params.get('categoryId')!;
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
    
    if (this.filterCategoryId) {
      params.set('categoryId', this.filterCategoryId);
    }
    
    const newURL = `${window.location.pathname}?${params.toString()}`;
    window.history.replaceState({}, '', newURL);
  }

  updated(changedProperties: Map<string, any>) {
    super.updated(changedProperties);

    // Restore scroll position if preserved
    if (this._preservedScrollY !== null) {
      const scrollTarget = this._preservedScrollY;
      console.log('[ViewExpenses] Restoring scroll to:', scrollTarget);

      // Use multiple RAFs and setTimeout to ensure DOM is fully settled
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setTimeout(() => {
            window.scrollTo(0, scrollTarget);
            console.log('[ViewExpenses] Scroll restored. Current scrollY:', window.scrollY);
          }, 10);
        });
      });
      this._preservedScrollY = null;
    }
  }

  saveColumnConfig() {
    localStorage.setItem('priperfin_column_config', JSON.stringify(this.columnConfig));
    this.showColumnModal = false;
  }

  moveColumn(index: number, direction: 'up' | 'down') {
    const newConfig = [...this.columnConfig];
    if (direction === 'up' && index > 0) {
      [newConfig[index], newConfig[index - 1]] = [newConfig[index - 1], newConfig[index]];
    } else if (direction === 'down' && index < newConfig.length - 1) {
      [newConfig[index], newConfig[index + 1]] = [newConfig[index + 1], newConfig[index]];
    }
    this.columnConfig = newConfig;
  }

  toggleColumnVisibility(id: string) {
    this.columnConfig = this.columnConfig.map(c => c.id === id ? { ...c, visible: !c.visible } : c);
  }

  renderColumnModal() {
    if (!this.showColumnModal) return '';
    return html`
        <div class="modal-overlay" @click="${() => this.showColumnModal = false}">
            <div class="modal" @click="${(e: Event) => e.stopPropagation()}" style="max-width: 500px;">
                <h3>${i18n.t('table.columns_title')}</h3>
                <div style="display: flex; flex-direction: column; gap: 8px; max-height: 400px; overflow-y: auto;">
                    ${this.columnConfig.map((col, i) => html`
                        <div style="display: flex; align-items: center; justify-content: space-between; padding: 8px; background: var(--md-sys-color-surface-container-high); border-radius: 4px;">
                            <label style="display: flex; align-items: center; gap: 8px; flex-grow: 1;">
                                <input type="checkbox" .checked="${col.visible}" ?disabled="${col.id === 'select' || col.id === 'actions'}" 
                                    @change="${() => this.toggleColumnVisibility(col.id)}" />
                                ${i18n.t(col.label) || col.label}
                            </label>
                            <div style="display: flex; gap: 4px;">
                                <button class="btn-secondary" style="height: 24px; padding: 0 8px;" @click="${() => this.moveColumn(i, 'up')}" ?disabled="${i === 0}">↑</button>
                                <button class="btn-secondary" style="height: 24px; padding: 0 8px;" @click="${() => this.moveColumn(i, 'down')}" ?disabled="${i === this.columnConfig.length - 1}">↓</button>
                            </div>
                        </div>
                    `)}
                </div>
                <div class="modal-actions">
                    <button class="btn-primary" @click="${this.saveColumnConfig}">${i18n.t('common.save')}</button>
                </div>
            </div>
        </div>
      `;
  }

  renderAddCategoryModal() {
    if (!this.showAddCategoryModal) return '';
    return html`
        <div class="modal-overlay" @click="${() => this.showAddCategoryModal = false}">
            <div class="modal" @click="${(e: Event) => e.stopPropagation()}" style="max-width: 450px;">
                <h3>${i18n.t('settings.new_category')}</h3>
                <div style="display: grid; gap: 1rem;">
                    <div class="form-group">
                        <label>${i18n.t('settings.type')}</label>
                        <select .value="${this.categoryForm.type}" 
                            @change="${(e: any) => this.categoryForm = { ...this.categoryForm, type: e.target.value }}">
                            <option value="EXPENSE">${i18n.t('settings.expense_categories')}</option>
                            <option value="GOAL">${i18n.t('settings.goal_categories')}</option>
                            <option value="INCOME">${i18n.t('expenses.filter_income')}</option>
                        </select>
                    </div>

                    <div class="form-group">
                        <label>${i18n.t('settings.category_name')}</label>
                        <input type="text" placeholder="e.g. Groceries" .value="${this.categoryForm.name}" 
                            @input="${(e: any) => this.categoryForm = { ...this.categoryForm, name: e.target.value }}" />
                    </div>

                    <div class="form-group">
                        <label>${i18n.t('settings.parent_group')}</label>
                        <select .value="${this.categoryForm.parentId}" 
                            @change="${(e: any) => this.categoryForm = { ...this.categoryForm, parentId: e.target.value }}">
                            <option value="">None (Top Level)</option>
                            ${this.categories.filter(c => !c.parentId && (c.type === this.categoryForm.type || !c.type)).map(c => html`
                                <option value="${c.id}">${c.icon} ${c.name}</option>
                            `)}
                        </select>
                    </div>
                    
                    <div style="display: flex; gap: 1rem;">
                        <div class="form-group">
                            <label>${i18n.t('settings.icon')}</label>
                            <div style="position: relative;">
                                <div style="display: flex; gap: 0.5rem; align-items: center;">
                                    <input type="text" placeholder="Emoji" style="width: 60px; text-align: center;" .value="${this.categoryForm.icon}" 
                                        @input="${(e: any) => this.categoryForm = { ...this.categoryForm, icon: e.target.value }}" />
                                    <button type="button" @click="${() => this.showEmojiPicker = !this.showEmojiPicker}" title="Pick Emoji">😀</button>
                                </div>
                                ${this.showEmojiPicker ? html`
                                    <div style="position: absolute; z-index: 2000; bottom: 100%; left: 0; margin-bottom: 8px;">
                                        <div style="position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; z-index: 1000;" @click="${() => this.showEmojiPicker = false}"></div>
                                        <emoji-picker style="position: relative; z-index: 1001;" @click="${(e: Event) => e.stopPropagation()}" @emoji-click="${(e: any) => {
          console.log('Expense Emoji clicked:', e.detail);
          this.categoryForm = { ...this.categoryForm, icon: e.detail.unicode };
          this.showEmojiPicker = false;
        }}"></emoji-picker>
                                    </div>
                                ` : ''}
                            </div>
                        </div>
                        
                        <!-- Color input removed -->
                    </div>
                </div>
                <div class="modal-actions" style="margin-top: 1rem;">
                    <button class="btn-secondary" @click="${() => this.showAddCategoryModal = false}">${i18n.t('common.cancel')}</button>
                    <button class="btn-primary" @click="${this.saveNewCategory}">${i18n.t('common.save')}</button>
                </div>
            </div>
        </div>
      `;
  }

  computeSuggestions() {
    console.log('[ViewExpenses] Computing suggestions for', this.transactions.length, 'transactions');
    // Apply suggestions to uncategorized items based on Backend Rules
    this.transactions = this.transactions.map(t => {
      if (t.suggestedRule && (!t.categoryId || t.categoryId === 'uncategorized')) {
         console.log(`[ViewExpenses] Suggestion found for "${t.description}": ${t.suggestedRule.name} -> ${t.suggestedRule.categoryId}`);
         return { 
             ...t, 
             _suggestion: t.suggestedRule.categoryId,
             _suggestionRuleName: t.suggestedRule.name,
             _suggestionConditionsJson: t.suggestedRule.conditionsJson,
             _suggestionRuleId: t.suggestedRule.id
         };
      }
      return t;
    });
  }


  @state() columnWidths: { [key: string]: number } = {};
  private resizingColumn: string | null = null;
  private startX: number = 0;
  private startWidth: number = 0;

  startResize(e: MouseEvent, column: string) {
    e.preventDefault();
    this.resizingColumn = column;
    this.startX = e.pageX;
    this.startWidth = this.columnWidths[column] || (e.target as HTMLElement).parentElement!.offsetWidth;

    document.addEventListener('mousemove', this.onMouseMove);
    document.addEventListener('mouseup', this.onMouseUp);
    document.body.style.cursor = 'col-resize';
  }

  onMouseMove = (e: MouseEvent) => {
    if (this.resizingColumn) {
      const currentWidth = this.startWidth + (e.pageX - this.startX);
      if (currentWidth > 50) { // Min width
        this.columnWidths = { ...this.columnWidths, [this.resizingColumn]: currentWidth };
      }
    }
  }

  onMouseUp = () => {
    this.resizingColumn = null;
    document.removeEventListener('mousemove', this.onMouseMove);
    document.removeEventListener('mouseup', this.onMouseUp);
    document.body.style.cursor = '';
  }

  async loadData(preserveScroll = false, isBackground = false) {
    const scrollPos = window.scrollY;
    if (!isBackground) this.loading = true;
    this.updateURL(); // Save filters to URL
    try {
      // Build query params based on filter mode
      const txQuery: any = { filterMode: this.dateFilterMode };

      switch (this.dateFilterMode) {
        case 'month':
          txQuery.month = this.month;
          txQuery.year = this.year;
          break;
        case 'year':
          txQuery.year = this.year;
          break;
        case 'custom':
          if (this.customStartDate) txQuery.startDate = this.customStartDate;
          if (this.customEndDate) txQuery.endDate = this.customEndDate;
          break;
        case 'all_time':
          // No date params
          break;
      }

      if (this.selectedAccountId) {
        txQuery.accountId = this.selectedAccountId;
      }

      // Fetch data independently to prevent one failure from blocking others
      const [txsResult, catsResult, acctsResult, costObjsResult] = await Promise.allSettled([
        api.get('/transactions', txQuery),
        api.get('/categories'),
        api.get('/accounts'),
        api.get('/cost-objects')
      ]);

      if (txsResult.status === 'fulfilled') {
        this.transactions = txsResult.value;
      } else {
        console.error('Failed to load transactions', txsResult.reason);
        alert('Failed to load transactions. Check console for details.');
      }

      if (catsResult.status === 'fulfilled') this.categories = catsResult.value;
      if (acctsResult.status === 'fulfilled') this.accounts = acctsResult.value;
      if (costObjsResult.status === 'fulfilled') this.costObjects = costObjsResult.value;

      await this.loadBalances();

      // Load cost object breakdown for credit accounts
      if (this.selectedAccountId && this.isCredit) {
        this.costObjectBreakdown = await api.get('/reports/cost-object-breakdown', {
          accountId: this.selectedAccountId
        });
      } else {
        this.costObjectBreakdown = [];
      }

      // Calculate and update totalBalance to match monthly ending balance
      // This will use the already loaded this.transactions and this.categories
      const safeStartingBalance = Number.isFinite(this.startingBalance) ? this.startingBalance : 0;
      const { year: balanceYear, month: balanceMonth } = this.getBalanceReferenceMonthYear();
      const periodNet = this.dateFilterMode === 'all_time'
        ? this.transactions
          .filter((t: any) => {
            const txDate = new Date(t.date);
            return txDate.getFullYear() === balanceYear && txDate.getMonth() + 1 === balanceMonth;
          })
          .reduce((sum: number, t: any) => sum + Number(t.amount || 0), 0)
        : this.transactions.reduce((sum: number, t: any) => sum + Number(t.amount || 0), 0);
      const monthlyEndingBalance = safeStartingBalance + periodNet;
      this.totalBalance = monthlyEndingBalance;

      if (preserveScroll) {
        await this.updateComplete;
        // Use double RAF to ensure DOM is fully painted
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            window.scrollTo(0, scrollPos);
          });
        });
      }
      this.computeSuggestions();
      this.computeBudgetBalances();
    } catch (e) {
      console.error('Failed to load data', e);
    } finally {
      if (!isBackground) this.loading = false;
    }
  }

  computeBudgetBalances() {
    // Group tx by category (with split support)
    const byCat: { [key: string]: any[] } = {};

    this.transactions.forEach(t => {
      // If transaction has splits, create pseudo-transactions for each split
      if (t.splits && t.splits.length > 0) {
        t.splits.forEach((split: any) => {
          if (!split.categoryId) return;
          if (!byCat[split.categoryId]) byCat[split.categoryId] = [];
          byCat[split.categoryId].push({
            ...t,
            amount: split.amount,
            categoryId: split.categoryId,
            _isSplit: true,
          });
        });
      } else {
        // No splits, use parent transaction
        if (!t.categoryId) return;
        if (!byCat[t.categoryId]) byCat[t.categoryId] = [];
        byCat[t.categoryId].push(t);
      }
    });

    Object.keys(byCat).forEach(catId => {
      const cat = this.categories.find(c => c.id === catId);
      if (!cat || !cat.budget || Number(cat.budget) === 0) return;

      const budget = Number(cat.budget);
      // Sort asc by date for calculation
      // We clone to sort so we don't mess up original order if it matters,
      // though typically we just need the logic to be chronological
      const sorted = [...byCat[catId]].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      let currentBalance = budget;
      sorted.forEach(t => {
        // Add signed amount (Expense is negative, so it subtracts from budget. Income adds to it)
        currentBalance += Number(t.amount);
        t._budgetRemaining = currentBalance;
      });
    });

    this.requestUpdate();
  }

  async updateCategory(txId: string, categoryId: string) {
    console.log('[ViewExpenses] updateCategory called:', txId, categoryId);
    try {
      await api.patch(`/transactions/${txId}`, { categoryId });
      console.log('[ViewExpenses] Category updated via API');

      // Check for potential bulk update
      let tx = this.transactions.find(t => t.id === txId);
      console.log('[ViewExpenses] Found transaction:', tx ? 'yes' : 'no', 'categoryId check:', categoryId !== 'uncategorized');
      if (tx && categoryId !== 'uncategorized') {
        console.log('[ViewExpenses] Inside bulk update check');
        // Update local transaction object with new category
        tx = { ...tx, categoryId };
        const others = this.transactions.filter(t =>
          t.description.toLowerCase() === tx.description.toLowerCase() &&
          // Check if category is null (uncategorized) or explicitly 'uncategorized' if that ID exists
          (!t.categoryId || t.categoryId === 'uncategorized') &&
          t.id !== txId
        );

        if (others.length > 0) {
          console.log('[ViewExpenses] Found similar transactions:', others.length);
          if (confirm(`Found ${others.length} other uncategorized transactions for "${tx.description}".Apply "${this.categories.find(c => c.id === categoryId)?.name}" to them too ? `)) {
            await api.post('/transactions/propagate', { description: tx.description, categoryId });
          }
        }
        
        // NEW: Offer to create a rule for this pattern
        // Check if a rule already exists or was rejected for this transaction
        console.log('[ViewExpenses] About to check for suggestions');
        try {
          console.log('[ViewExpenses] Calling suggestions API for:', txId);
          const suggestion = await api.get(`/rules/suggestions/for-transaction/${txId}`);
          console.log('[ViewExpenses] Suggestion response:', suggestion);
          
          // Check if suggestion has actual data (not just empty object)
          if (suggestion && suggestion.conditionsJson && Object.keys(suggestion).length > 0) {
            // Pattern detected and no existing rule - ask if user wants to create a rule
            const categoryName = this.categories.find(c => c.id === categoryId)?.name;
            const shouldCreateRule = confirm(i18n.t('rules.create_rule_prompt').replace('{category}', categoryName || ''));
            
            if (shouldCreateRule) {
              // Pre-fill the rule editor with suggestion data
              this.ruleTransaction = {
                ...tx,
                _suggestionData: suggestion
              };
              this.showRuleModal = true;
            } else {
              // User declined - persist rejection
              await api.post('/rules/suggestions/reject-prompt', {
                conditionsJson: suggestion.conditionsJson,
                categoryId: categoryId
              });
            }
          } else if (!suggestion) {
          // No suggestion - either not enough data OR rule already exists
          // Let's check if a rule exists for this category
          try {
            const allRules = await api.get('/rules');
            const existingRulesForCategory = allRules.filter((r: any) => r.categoryId === categoryId);
            
            if (existingRulesForCategory.length > 0) {
              const categoryName = this.categories.find(c => c.id === categoryId)?.name;
              const ruleNames = existingRulesForCategory.map((r: any) => r.name).join(', ');
              
              if (confirm(i18n.t('rules.rule_exists').replace('{category}', categoryName || '').replace('{rules}', ruleNames))) {
                // Navigate to rules page
                window.location.hash = '#/rules';
              }
            }
          } catch (err) {
            console.error('Failed to check existing rules:', err);
          }
        } else {
          console.log('[ViewExpenses] No suggestion and no conditions (not enough similar transactions)');
        }
        } catch (err) {
          console.error('[ViewExpenses] Failed to get suggestion:', err);
        }
      }

      await this.loadData(true, true);
    } catch (e) {
      console.error('Failed to update category', e);
    }
  }

  async deleteTransaction(id: string) {
    this.transactionToDelete = id;
  }

  async confirmDelete() {
    if (!this.transactionToDelete) return;
    const id = this.transactionToDelete;

    console.log('[ViewExpenses] Confirming delete for:', id);
    try {
      await api.delete(`/transactions/${id}`);
      console.log('[ViewExpenses] API delete success');
      await this.loadData(true);
      this.transactionToDelete = null;
    } catch (e: any) {
      console.error('Failed to delete transaction', e);
      alert('Failed to delete: ' + (e.message || 'Unknown error'));
    }
  }

  openSplitModal(transaction: any) {
    this.splitTransaction = transaction;
    this.showSplitModal = true;
  }

  closeSplitModal() {
    this.showSplitModal = false;
    this.splitTransaction = null;
  }

  async handleSplitSave() {
    await this.loadData(true);
    this.closeSplitModal();
  }

  async handleWizardImport(e: CustomEvent) {
    const { result } = e.detail;
    console.log('[View Expenses] Import result:', result);

    const count = result.count ?? result.newCount ?? 0;
    alert(`Successfully imported ${count} transactions.`);
    await this.loadData(true);
  }

  // Helper to handle select change
  async handleCategoryChange(e: Event, tx: any) {
    const select = e.target as HTMLSelectElement;
    let catId: string | null = select.value;
    if (catId === 'uncategorized' || catId === '') {
      catId = null;
    }

    await this.updateCategory(tx.id, catId as string);
  }

  async createTransaction() {
    try {
      await api.post('/transactions', {
        ...this.newTransaction,
        date: new Date(this.newTransaction.date).toISOString(),
        accountId: this.selectedAccountId || null
      });
      this.showAddForm = false;
      this.newTransaction = { date: new Date().toISOString().split('T')[0], description: '', amount: 0, categoryId: '', costObjectId: '', notes: '' };
      await this.loadData(true);
    } catch (e) {
      console.error('Failed to create transaction', e);
      alert('Failed to create transaction');
    }
  }

  startEditing(id: string, field: string, value: any) {
    // Capture scroll position at the start of editing
    this._preservedScrollY = window.scrollY;
    console.log('[ViewExpenses] Starting edit, captured scrollY:', this._preservedScrollY);

    // Soft lock for imported transactions
    const tx = this.transactions.find(t => t.id === id);
    if (tx && tx.externalId) {
      // Only lock fields that are imported (Date, Amount, Description)
      if (['date', 'amount', 'description'].includes(field)) {
        if (!confirm(`This transaction was imported from CSV(Locked).\nAre you sure you want to edit the ${field}?`)) {
          this._preservedScrollY = null; // Clear if user cancels
          return;
        }
      }
    }

    this.editingCell = { id, field };
    this.editValue = value;
    // Wait for update then focus (prevent scroll)
    setTimeout(() => {
      const input = this.shadowRoot?.querySelector(`#edit-${id}-${field}`) as HTMLElement;
      if (input) {
        input.focus({ preventScroll: true });
      }
    }, 0);
  }

  cancelEditing() {
    this.editingCell = null;
    this.editValue = null;
    this._preservedScrollY = null; // Clear preserved scroll on cancel
  }

  async saveCell(id: string, field: string) {
    if (this.editValue === null) return;

    try {
      let payload: any = {};
      let localValue: any = this.editValue;

      if (field === 'date') {
        payload[field] = new Date(this.editValue).toISOString();
        localValue = payload[field];
      } else if (field === 'amount') {
        payload[field] = parseFloat(this.editValue);
        localValue = payload[field];
      } else if (field === 'categoryId' && (this.editValue === 'uncategorized' || this.editValue === '')) {
        payload[field] = null;
        localValue = null;
      } else if (field === 'costObjectId' && this.editValue === '') {
        payload[field] = null;
        localValue = null;
      } else {
        payload[field] = this.editValue;
      }

      await api.patch(`/transactions/${id}`, payload);

      // Update local state directly instead of reloading
      const txIndex = this.transactions.findIndex(t => t.id === id);
      if (txIndex !== -1) {
        this.transactions = this.transactions.map((t, i) =>
          i === txIndex ? { ...t, [field]: localValue } : t
        );
      }

      this.editingCell = null;
      this.editValue = null;
      this._preservedScrollY = null;

      // Recompute budget balances if needed
      if (field === 'categoryId' || field === 'amount') {
        this.computeBudgetBalances();
      }

      // If category was changed, check for rule suggestions
      if (field === 'categoryId' && localValue && localValue !== 'uncategorized') {
        console.log('[ViewExpenses] saveCell: category changed, checking for suggestions');
        try {
          const suggestion = await api.get(`/rules/suggestions/for-transaction/${id}`);
          console.log('[ViewExpenses] saveCell: suggestion response:', suggestion);
          console.log('[ViewExpenses] saveCell: has conditionsJson?', !!suggestion?.conditionsJson);
          console.log('[ViewExpenses] saveCell: keys:', Object.keys(suggestion || {}));
          
          // Check if suggestion has conditionsJson (backend returns null as {} when no suggestion)
          if (suggestion?.conditionsJson) {
            const categoryName = this.categories.find(c => c.id === localValue)?.name;
            const shouldCreateRule = confirm(i18n.t('rules.create_rule_prompt').replace('{category}', categoryName || ''));
            
            if (shouldCreateRule) {
              const tx = this.transactions.find(t => t.id === id);
              this.ruleTransaction = {
                ...tx,
                _suggestionData: suggestion
              };
              this.showRuleModal = true;
            } else {
              await api.post('/rules/suggestions/reject-prompt', {
                conditionsJson: suggestion.conditionsJson,
                categoryId: localValue
              });
            }
          } else {
            console.log('[ViewExpenses] saveCell: No suggestion returned (not enough similar transactions or rule already exists)');
          }
        } catch (err) {
          console.error('[ViewExpenses] saveCell: failed to get suggestion:', err);
        }
      }
    } catch (e: any) {
      console.error('Failed to save cell', e);
      alert('Failed to save changes: ' + (e.message || JSON.stringify(e)));
      this._preservedScrollY = null;
    }
  }

  handleKeyDown(e: KeyboardEvent, id: string, field: string) {
    if (e.key === 'Enter') {
      this.saveCell(id, field);
    } else if (e.key === 'Escape') {
      this.cancelEditing();
    }
  }

  async checkDatabase() {
    try {
      const result = await api.get('/admin/diagnostics');
      const msg = `Database Diagnostics:
Transactions: ${result.counts?.transactions}
Categories: ${result.counts?.categories}
Accounts: ${result.counts?.accounts}
Cost Objects: ${result.counts?.costObjects}
Splits: ${result.counts?.splits}

Tables: ${result.tables?.join(', ')}`;
      alert(msg);
      console.log('Diagnostics:', result);
    } catch (e: any) {
      alert('Failed to check database: ' + e.message);
    }
  }

  openCreateRuleModal(transaction: any) {
      this.ruleTransaction = transaction;
      this.showRuleModal = true;
  }

  async handleRuleSave(e: CustomEvent) {
      try {
          // Create the rule
          const rule = await api.post('/rules', e.detail);
          
          // Ask if user wants to apply to historical transactions
          if (confirm(i18n.t('rules.rule_created'))) {
              try {
                  const result = await api.post(`/rules/${rule.id}/apply`, {});
                  const count = result.matchCount || result.matched || 0;
                  if (count > 0) {
                      alert(i18n.t('rules.rule_applied_count').replace('{count}', count.toString()));
                  } else {
                      alert(i18n.t('rules.no_matches'));
                  }
              } catch (err) {
                  console.error('Failed to apply rule', err);
                  alert(i18n.t('rules.errors.apply_failed'));
              }
          }
          
          this.showRuleModal = false;
          await this.loadData(true);
      } catch (e: any) {
          console.error(e);
          alert(i18n.t('rules.errors.save_failed') + ': ' + e.message);
      }
  }


  render() {
    const symbol = this.currency === 'EUR' ? '€' : '$';
    const totalBalance = Number.isFinite(this.totalBalance) ? this.totalBalance : null;
    const verifiedBalance = Number.isFinite(this.verifiedBalance) ? this.verifiedBalance : null;
    const difference = totalBalance !== null && verifiedBalance !== null ? verifiedBalance - totalBalance : null;
    const isBalanced = difference !== null && Math.abs(difference) < 0.01;
    const movementNet = this.monthlyStats.income - this.monthlyStats.expense;

    return html`
        <div class="header">
            <h1>${i18n.t('nav.expenses')}</h1>
            <div class="filters">
                <filterable-select
                    .value="${this.selectedAccountId}"
                    .options="${this.getAccountOptions()}"
                    .placeholder="Select Account"
                    @change="${(e: CustomEvent) => { this.selectedAccountId = e.detail.value; this.loadData(true); }}"
                    width="200px">
                </filterable-select>
                <select @change="${(e: any) => { this.dateFilterMode = e.target.value as DateFilterMode; this.loadData(true); }}" .value="${this.dateFilterMode}">
                    <option value="month">${i18n.t('filters.mode_month')}</option>
                    <option value="year">${i18n.t('filters.mode_year')}</option>
                    <option value="custom">${i18n.t('filters.mode_custom')}</option>
                    <option value="all_time">${i18n.t('filters.mode_all_time')}</option>
                </select>
                ${this.dateFilterMode === 'month' ? html`
                    <select @change="${(e: any) => { this.month = parseInt(e.target.value); this.loadData(true); }}" .value="${this.month}">
                        ${Array.from({ length: 12 }, (_, i) => i + 1).map(m => {
                            const date = new Date(this.year, m - 1, 1);
                            const monthName = new Intl.DateTimeFormat(i18n.getLocale(), { month: 'long' }).format(date);
                            const capitalized = monthName.charAt(0).toUpperCase() + monthName.slice(1);
                            return html`<option value="${m}" ?selected=${this.month === m}>${capitalized}</option>`;
                        })}
                    </select>
                ` : ''}
                ${this.dateFilterMode === 'month' || this.dateFilterMode === 'year' ? html`
                    <select @change="${(e: any) => { this.year = parseInt(e.target.value); this.loadData(true); }}" .value="${this.year}">
                        ${this.getYearOptions().map(y => html`<option value="${y}">${y}</option>`)}
                    </select>
                ` : ''}
                ${this.dateFilterMode === 'custom' ? html`
                    <input type="date" .value="${this.customStartDate}" @change="${(e: any) => { this.customStartDate = e.target.value; this.loadData(true); }}" style="padding: 0.5rem;" />
                    <span style="color: var(--md-sys-color-on-surface-variant);">-</span>
                    <input type="date" .value="${this.customEndDate}" @change="${(e: any) => { this.customEndDate = e.target.value; this.loadData(true); }}" style="padding: 0.5rem;" />
                ` : ''}
                <button class="btn-secondary" @click="${() => this.loadData(true)}">${i18n.t('reports.refresh')}</button>
            </div>
        </div>

        <div class="card" style="display: flex; flex-direction: column; gap: 12px; align-items: stretch;">
            <div style="display: flex; align-items: center; justify-content: space-between; gap: 12px;">
                <div style="font-size: 0.9rem; color: var(--md-sys-color-on-surface-variant); font-weight: 500;">${i18n.t('expenses.reconciliation_status')}</div>
                <span style="font-size: 0.75rem; font-weight: 600; padding: 4px 10px; border-radius: 999px; background: ${isBalanced ? 'rgba(22, 163, 74, 0.16)' : 'var(--md-sys-color-error-container)'}; color: ${isBalanced ? '#16a34a' : 'var(--md-sys-color-on-error-container)'};">
                    ${isBalanced ? i18n.t('expenses.balanced') : i18n.t('expenses.review')}
                </span>
            </div>
            <div style="display: grid; grid-template-columns: repeat(3, minmax(180px, 1fr)); gap: 16px; align-items: center;">
            <div>
                <div style="font-size: 0.875rem; color: var(--md-sys-color-secondary); margin-bottom: 0.25rem;">${i18n.t('expenses.verified_balance')}</div>
                <div style="display: flex; align-items: center; gap: 0.5rem;">
                    <span style="font-size: 1.5rem; font-weight: 600; color: var(--md-sys-color-on-surface);">${symbol}</span>
                    <input type="number" step="0.01" class="amount-input" .value="${verifiedBalance ?? ''}" @change="${this.updateVerifiedBalance}" />
                </div>
            </div>

            <div>
                <div style="font-size: 0.875rem; color: var(--md-sys-color-secondary); margin-bottom: 0.25rem;">${this.isCredit ? i18n.t('expenses.amount_owed') : i18n.t('expenses.system_balance')}</div>
                <div class="balance" style="color: ${totalBalance === null ? 'var(--md-sys-color-on-surface-variant)' : totalBalance >= 0 ? '#16a34a' : 'var(--md-sys-color-error)'}">
                    ${totalBalance === null ? '—' : `${totalBalance >= 0 ? '+' : '-'}${symbol}${Math.abs(totalBalance).toFixed(2)}`}
                </div>
            </div>

            <div>
                <div style="font-size: 0.875rem; color: var(--md-sys-color-secondary); margin-bottom: 0.25rem;">${i18n.t('expenses.discrepancy')}</div>
                <div class="balance" style="color: ${difference === null ? 'var(--md-sys-color-on-surface-variant)' : Math.abs(difference) < 0.01 ? '#16a34a' : 'var(--md-sys-color-error)'}">
                    ${difference === null ? '—' : `${Math.abs(difference) < 0.01 ? '' : (difference > 0 ? '+' : '-')}${symbol}${Math.abs(difference).toFixed(2)}`}
                </div>
            </div>
            </div>
            </div>
            <div style="font-size: 0.8rem; color: var(--md-sys-color-on-surface-variant);">${i18n.t('expenses.reconciliation_hint')}</div>
        </div>

        <div class="card" style="display: flex; flex-direction: column; gap: 1rem; align-items: stretch;">
            <div style="font-size: 0.9rem; color: var(--md-sys-color-on-surface-variant); font-weight: 500;">${i18n.t('expenses.net_breakdown')}</div>
            <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 1rem;">

                <!-- Income -->
                <div>
                    <div style="font-size: 0.75rem; color: var(--md-sys-color-secondary); margin-bottom: 4px;">${i18n.t('common.income')}</div>
                    <div style="color: #16a34a; font-weight: 500; font-size: 1rem;">
                        +${symbol}${this.monthlyStats.income.toFixed(2)}
                    </div>
                </div>

                <!-- Expense -->
                <div>
                    <div style="font-size: 0.75rem; color: var(--md-sys-color-secondary); margin-bottom: 4px;">${i18n.t('common.expenses')}</div>
                    <div style="color: var(--md-sys-color-error); font-weight: 500; font-size: 1rem;">
                        -${symbol}${Math.abs(this.monthlyStats.expense).toFixed(2)}
                    </div>
                </div>

                <!-- Balance (Income - Expenses) -->
                <div>
                    <div style="font-size: 0.75rem; color: var(--md-sys-color-secondary); margin-bottom: 4px;">${i18n.t('expenses.net_movements')}</div>
                    <div style="color: ${movementNet >= 0 ? '#16a34a' : 'var(--md-sys-color-error)'}; font-weight: 500; font-size: 1rem;">
                        ${movementNet >= 0 ? '+' : '-'}${symbol}${Math.abs(movementNet).toFixed(2)}
                    </div>
                </div>
            </div>
            <div style="font-size: 0.78rem; color: var(--md-sys-color-on-surface-variant);">
                ${i18n.t('expenses.net_formula')} · ${i18n.t('expenses.net_calculation_hint')}
            </div>
        </div>

      ${this.isCredit && this.costObjectBreakdown.length > 0 ? html`
        <div class="card" style="margin-bottom: 1rem;">
          <h3 style="margin: 0 0 1rem 0; font-size: 1rem; color: var(--md-sys-color-on-surface);">
            💼 ${i18n.t('cost_objects.breakdown_title')}
          </h3>
          <div style="display: flex; flex-direction: column; gap: 0.75rem;">
            ${this.costObjectBreakdown.map(co => {
              const total = this.costObjectBreakdown.reduce((sum, c) => sum + c.total, 0);
              const pct = total > 0 ? ((co.total / total) * 100).toFixed(0) : 0;
              return html`
                <div style="display: flex; align-items: center; gap: 0.75rem;">
                  <span style="font-size: 1.25rem;">${co.icon}</span>
                  <span style="flex: 1; font-weight: 500;">${co.name}</span>
                  <span style="color: var(--md-sys-color-on-surface-variant);">${pct}%</span>
                  <span style="font-weight: 600; min-width: 80px; text-align: right;">
                    ${this.currency === 'EUR' ? '€' : '$'}${co.total.toFixed(2)}
                  </span>
                </div>
              `;
            })}
            <div style="border-top: 1px solid var(--md-sys-color-outline-variant); padding-top: 0.75rem; margin-top: 0.5rem; display: flex; justify-content: space-between;">
              <span style="font-weight: 600;">${i18n.t('cost_objects.total_owed')}</span>
              <span style="font-weight: 700; color: var(--md-sys-color-error);">
                ${this.currency === 'EUR' ? '€' : '$'}${this.costObjectBreakdown.reduce((sum, c) => sum + c.total, 0).toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      ` : ''}

      ${this.showAddForm ? html`
        <div class="card" style="margin-bottom: 2rem; padding: 1rem; border-radius: 8px;">
            <h3>${i18n.t('expenses.add_manual_title')}</h3>
            <div style="display: flex; gap: 1rem; align-items: flex-end; flex-wrap: wrap;">
                <label>
                    ${i18n.t('common.date')}
                    <input type="date"
                        .value="${this.newTransaction.date}"
                        @input="${(e: any) => this.newTransaction = { ...this.newTransaction, date: e.target.value }}"
                        style="display: block; padding: 0.5rem; border: 1px solid var(--md-sys-color-outline); border-radius: 4px; background: var(--md-sys-color-surface-container); color: var(--md-sys-color-on-surface);"
                    />
                </label>
                <label>
                    ${i18n.t('common.description')}
                    <input type="text" placeholder="${i18n.t('common.description')}"
                        .value="${this.newTransaction.description}"
                        @input="${(e: any) => this.newTransaction = { ...this.newTransaction, description: e.target.value }}"
                        @blur="${this.handleDescriptionBlur}"
                        style="display: block; padding: 0.5rem; border: 1px solid var(--md-sys-color-outline); border-radius: 4px; background: var(--md-sys-color-surface-container); color: var(--md-sys-color-on-surface);"
                    />
                </label>
                <label>
                    ${i18n.t('common.amount')}
                    <input type="number" placeholder="-10.00"
                        .value="${this.newTransaction.amount || ''}"
                        @input="${(e: any) => this.newTransaction = { ...this.newTransaction, amount: parseFloat(e.target.value) }}"
                        style="display: block; padding: 0.5rem; border: 1px solid var(--md-sys-color-outline); border-radius: 4px; background: var(--md-sys-color-surface-container); color: var(--md-sys-color-on-surface);"
                    />
                </label>
                <label>
                    ${i18n.t('common.category')}
                    <filterable-select
                        .value="${this.newTransaction.categoryId || 'uncategorized'}"
                        .options="${this.getCategoryOptions(true)}"
                        .placeholder="${i18n.t('common.category')}"
                        @change="${(e: CustomEvent) => {
          if (e.detail.value === 'new_category_inline') {
            this.showAddCategoryModal = true;
            return;
          }
          this.newTransaction = { ...this.newTransaction, categoryId: e.detail.value === 'uncategorized' ? '' : e.detail.value };
        }}"
                        style="display: block;">
                    </filterable-select>
                </label>
                ${this.isCredit && this.costObjects.length > 0 ? html`
                <label>
                    ${i18n.t('cost_objects.funding_source')}
                    <filterable-select
                        .value="${this.newTransaction.costObjectId || ''}"
                        .options="${this.getCostObjectOptions()}"
                        .placeholder="${i18n.t('cost_objects.funding_source')}"
                        @change="${(e: CustomEvent) => this.newTransaction = { ...this.newTransaction, costObjectId: e.detail.value }}"
                        style="display: block;">
                    </filterable-select>
                </label>
                ` : ''}
                <label style="flex-grow: 1;">
                    ${i18n.t('common.notes')}
                    <input type="text" placeholder="${i18n.t('common.notes')}"
                        .value="${this.newTransaction.notes || ''}"
                        @input="${(e: any) => this.newTransaction = { ...this.newTransaction, notes: e.target.value }}"
                        style="display: block; padding: 0.5rem; border: 1px solid var(--md-sys-color-outline); border-radius: 4px; width: 100%; background: var(--md-sys-color-surface-container); color: var(--md-sys-color-on-surface);"
                    />
                </label>
                <button @click="${this.createTransaction}" style="background: var(--md-sys-color-primary); color: var(--md-sys-color-on-primary); border: none; padding: 0.6rem 1rem; border-radius: 4px; cursor: pointer;">${i18n.t('common.save')}</button>
            </div>
        </div>
      ` : ''
      }

<div style="display: flex; flex-direction: column; gap: 16px; margin-bottom: 1rem;">

            <!-- Simple search always visible -->
            <input type="text" placeholder="${i18n.t('filters.search')}" .value="${this.filterText}" @input="${(e: any) => { this.filterText = e.target.value; this.currentPage = 1; }}" style="width: 100%; max-width: 400px; border-radius: 20px; padding: 0 20px;" />
        </div>

        <!-- Advanced Filters Row -->
        <div style="display: flex; gap: 16px; align-items: center; flex-wrap: wrap; padding: 12px; background: var(--md-sys-color-surface-container); border-radius: 12px;">
            <div style="display: flex; gap: 1rem;">
                <button class="btn-primary" @click="${() => this.showAddForm = !this.showAddForm}">
                    ${this.showAddForm ? i18n.t('common.cancel') : '+ ' + i18n.t('expenses.add_transaction')}
                </button>
                <button class="btn-secondary" @click="${() => this.showWizard = true}">${i18n.t('expenses.import_csv')}</button>
            </div>

            <div style="width: 1px; height: 32px; background: var(--md-sys-color-outline-variant);"></div>

            <span style="font-size: 0.875rem; font-weight: 500;">${i18n.t('filters.filters')}:</span>
            <select .value="${this.filterCategoryId}" @change="${(e: any) => { this.filterCategoryId = e.target.value; this.currentPage = 1; }}" style="width: 180px;">
                <option value="">${i18n.t('filters.all_categories')}</option>
                <option value="uncategorized">${i18n.t('common.uncategorized')}</option>
                  ${this.categories.filter(c => !c.parentId && (c.type === 'EXPENSE' || !c.type)).map(parent => html`
                      <option value="${parent.id}">${parent.icon} ${parent.name}</option>
                      ${this.categories.filter(c => c.parentId === parent.id).map(child => html`
                          <option value="${child.id}">&nbsp;&nbsp;&nbsp;&nbsp;${child.icon} ${child.name}</option>
                      `)}
                  `)}
</select>
  <input type="number" placeholder="${i18n.t('filters.min_amount')}" .value="${this.filterMinAmount ?? ''}" @input="${(e: any) => { this.filterMinAmount = e.target.value ? parseFloat(e.target.value) : null; this.currentPage = 1; }}" style="width: 120px;" />
    <input type="number" placeholder="${i18n.t('filters.max_amount')}" .value="${this.filterMaxAmount ?? ''}" @input="${(e: any) => { this.filterMaxAmount = e.target.value ? parseFloat(e.target.value) : null; this.currentPage = 1; }}" style="width: 120px;" />
      <div style="display: flex; align-items: center; gap: 8px;">
        <div style="position: relative; width: 150px;">
          <input type="text" inputmode="numeric" placeholder="yyyy-mm-dd" .value="${this.filterDateFrom}" @input="${(e: any) => { this.filterDateFrom = this.normalizeDateInput(e.target.value); this.currentPage = 1; }}" style="width: 100%; padding-right: 34px;" title="${i18n.t('filters.from_date')}" />
          <span style="position: absolute; right: 10px; top: 50%; transform: translateY(-50%); pointer-events: none; color: var(--md-sys-color-on-surface-variant);">📅</span>
          <input type="date" .value="${this.filterDateFrom}" @input="${(e: any) => { this.filterDateFrom = e.target.value; this.currentPage = 1; }}" style="position: absolute; top: 0; right: 0; width: 34px; height: 100%; opacity: 0; cursor: pointer; border: none; padding: 0;" title="${i18n.t('filters.from_date')}" />
        </div>
          <span style="color: var(--md-sys-color-on-surface-variant);"> -</span>
        <div style="position: relative; width: 150px;">
          <input type="text" inputmode="numeric" placeholder="yyyy-mm-dd" .value="${this.filterDateTo}" @input="${(e: any) => { this.filterDateTo = this.normalizeDateInput(e.target.value); this.currentPage = 1; }}" style="width: 100%; padding-right: 34px;" title="${i18n.t('filters.to_date')}" />
          <span style="position: absolute; right: 10px; top: 50%; transform: translateY(-50%); pointer-events: none; color: var(--md-sys-color-on-surface-variant);">📅</span>
          <input type="date" .value="${this.filterDateTo}" @input="${(e: any) => { this.filterDateTo = e.target.value; this.currentPage = 1; }}" style="position: absolute; top: 0; right: 0; width: 34px; height: 100%; opacity: 0; cursor: pointer; border: none; padding: 0;" title="${i18n.t('filters.to_date')}" />
        </div>
      </div>
              <button class="btn-secondary" style="height: 32px; padding: 0 12px;" @click="${() => { this.filterCategoryId = ''; this.filterMinAmount = null; this.filterMaxAmount = null; this.filterText = ''; this.filterDateFrom = ''; this.filterDateTo = ''; }}">${i18n.t('filters.clear')}</button>
                  </div>

                  <!--Bulk Actions-->
                    ${this.selectedTransactions.size > 0 ? html`
            <div style="display: flex; gap: 16px; align-items: center; padding: 12px; background: var(--md-sys-color-primary-container); color: var(--md-sys-color-on-primary-container); border-radius: 12px; flex-wrap: wrap;">
                <span style="font-weight: 500;">${this.selectedTransactions.size} ${i18n.t('bulk_actions.selected')}</span>
                <button class="btn-secondary" @click="${this.deleteSelected}" style="background: var(--md-sys-color-error-container); color: var(--md-sys-color-on-error-container); border: none;">${i18n.t('bulk_actions.delete_selected')}</button>

                <div style="display: flex; align-items: center; gap: 8px; margin-left: auto;">
                    <span style="font-size: 0.875rem;">${i18n.t('bulk_actions.move_to')}:</span>
                    <filterable-select
                        .value=""
                        .options="${[
                          { value: '', label: i18n.t('bulk_actions.select_category') },
                          ...this.getCategoryOptions(false).filter(opt => opt.value !== 'uncategorized')
                        ]}"
                        .placeholder="${i18n.t('bulk_actions.select_category')}"
                        @change="${(e: CustomEvent) => this.bulkUpdateCategory(e.detail.value)}"
                        width="200px">
                    </filterable-select>

                    <span style="font-size: 0.875rem; margin-left: 16px;">${i18n.t('bulk_actions.assign_to')}:</span>
                    <filterable-select
                        .value=""
                        .options="${[
                          { value: '', label: i18n.t('bulk_actions.select_account') },
                          { value: 'unassigned', label: i18n.t('bulk_actions.unassign') },
                          ...this.accounts.map(account => ({
                            value: account.id,
                            label: account.name,
                            icon: account.type === 'CREDIT' ? '💳' : '🏦'
                          }))
                        ]}"
                        .placeholder="${i18n.t('bulk_actions.select_account')}"
                        @change="${(e: CustomEvent) => this.bulkUpdateAccount(e.detail.value)}"
                        width="200px">
                    </filterable-select>
                </div>
            </div>
          ` : ''
      }
</div>

      ${this.renderColumnModal()}
        ${this.renderAddCategoryModal()}

        <csv-wizard
            ?open="${this.showWizard}"
            .accounts="${this.accounts}"
            @close="${() => this.showWizard = false}"
            @import="${this.handleWizardImport}">
        </csv-wizard>

        <split-transaction-modal
            ?open="${this.showSplitModal}"
            .transaction="${this.splitTransaction}"
            .categories="${this.categories}"
            .costObjects="${this.costObjects}"
            @close="${this.closeSplitModal}"
            @save="${this.handleSplitSave}">
        </split-transaction-modal>

        ${this.showRuleModal ? html`
            <rule-editor
                .rule="${this.ruleTransaction ? {
                    name: this.ruleTransaction._suggestionData?.name || `Rule for ${this.ruleTransaction.description}`,
                    mode: 'SUGGEST',
                    categoryId: this.ruleTransaction._suggestionData?.categoryId || this.ruleTransaction.categoryId,
                    conditionsJson: this.ruleTransaction._suggestionData?.conditionsJson || JSON.stringify({
                        operator: 'AND',
                        conditions: [
                            { field: 'description', operator: 'contains', value: this.ruleTransaction.description }
                        ]
                    })
                } : null}"
                .categories="${this.categories}"
                @save="${this.handleRuleSave}"
                @cancel="${() => this.showRuleModal = false}"
            ></rule-editor>
        ` : ''}


      ${this.transactionToDelete ? html`
          <div class="modal-overlay" @click="${() => this.transactionToDelete = null}">
              <div class="modal" @click="${(e: Event) => e.stopPropagation()}">
                  <h3 style="margin-top: 0;">${i18n.t('common.delete')} Transaction</h3>
                  <p>${i18n.t('common.confirm_delete')}</p>
                  <div class="modal-actions">
                      <button @click="${() => this.transactionToDelete = null}">${i18n.t('common.cancel')}</button>
                      <button class="danger" style="background: var(--md-sys-color-error-container); color: var(--md-sys-color-on-error-container);" @click="${this.confirmDelete}">${i18n.t('common.delete')}</button>
                  </div>
              </div>
          </div>
      ` : ''
      }

      ${this.loading ? html`<p>${i18n.t('common.loading')}</p>` : html`
        ${this.renderPaginationControls()}
        <div class="table-container">
            <table>
              <thead>
                <tr>
                  ${this.columnConfig.map(col => {
        if (!col.visible) return '';

        switch (col.id) {
          case 'select':
            return html`<th style="width: 40px;"><input type="checkbox" @change="${this.toggleSelectAll}" .checked="${this.selectedTransactions.size === this.pagedTransactions.length && this.pagedTransactions.length > 0}" /></th>`;
          case 'date':
            return html`<th @click="${() => this.toggleSort('date')}" style="cursor: pointer; position: relative; width: ${this.columnWidths['date'] ? this.columnWidths['date'] + 'px' : 'auto'}">
                          ${i18n.t('common.date')} ${this.sortField === 'date' ? (this.sortDirection === 'asc' ? '↑' : '↓') : ''}
                          <div class="resizer" @mousedown="${(e: MouseEvent) => this.startResize(e, 'date')}" @click="${(e: Event) => e.stopPropagation()}"></div>
                        </th>`;
          case 'description':
            return html`<th @click="${() => this.toggleSort('description')}" style="cursor: pointer; position: relative; width: ${this.columnWidths['description'] ? this.columnWidths['description'] + 'px' : 'auto'}">
                          ${i18n.t('common.description')} ${this.sortField === 'description' ? (this.sortDirection === 'asc' ? '↑' : '↓') : ''}
                          <div class="resizer" @mousedown="${(e: MouseEvent) => this.startResize(e, 'description')}" @click="${(e: Event) => e.stopPropagation()}"></div>
                        </th>`;
          case 'categoryId':
            return html`<th @click="${() => this.toggleSort('categoryId')}" style="cursor: pointer; position: relative; width: ${this.columnWidths['categoryId'] ? this.columnWidths['categoryId'] + 'px' : 'auto'}">
                          ${i18n.t('common.category')} ${this.sortField === 'categoryId' ? (this.sortDirection === 'asc' ? '↑' : '↓') : ''}
                          <div class="resizer" @mousedown="${(e: MouseEvent) => this.startResize(e, 'categoryId')}" @click="${(e: Event) => e.stopPropagation()}"></div>
                        </th>`;
          case 'costObjectId':
            return html`<th style="position: relative; width: ${this.columnWidths['costObjectId'] ? this.columnWidths['costObjectId'] + 'px' : 'auto'}">
                          ${i18n.t('cost_objects.funding_source')}
                          <div class="resizer" @mousedown="${(e: MouseEvent) => this.startResize(e, 'costObjectId')}" @click="${(e: Event) => e.stopPropagation()}"></div>
                        </th>`;
          case 'amount':
            return html`<th @click="${() => this.toggleSort('amount')}" style="cursor: pointer; position: relative; width: ${this.columnWidths['amount'] ? this.columnWidths['amount'] + 'px' : 'auto'}">
                          ${i18n.t('common.amount')} ${this.sortField === 'amount' ? (this.sortDirection === 'asc' ? '↑' : '↓') : ''}
                          <div class="resizer" @mousedown="${(e: MouseEvent) => this.startResize(e, 'amount')}" @click="${(e: Event) => e.stopPropagation()}"></div>
                        </th>`;
          case 'budget':
            return html`<th style="width: ${this.columnWidths['budget'] ? this.columnWidths['budget'] + 'px' : 'auto'}">
                          ${i18n.t('expenses.budget_remaining')}
                        </th>`;
          case 'notes':
            return html`<th @click="${() => this.toggleSort('notes')}" style="cursor: pointer; position: relative; width: ${this.columnWidths['notes'] ? this.columnWidths['notes'] + 'px' : 'auto'}">
                          ${i18n.t('common.notes')} ${this.sortField === 'notes' ? (this.sortDirection === 'asc' ? '↑' : '↓') : ''}
                          <div class="resizer" @mousedown="${(e: MouseEvent) => this.startResize(e, 'notes')}" @click="${(e: Event) => e.stopPropagation()}"></div>
                        </th>`;
          case 'actions':
            return html`<th>${i18n.t('common.actions')}</th>`;
          default:
            return '';
        }
      })}
                </tr>
              </thead>
              <tbody>
                ${this.pagedTransactions.map(tx => {
        const isEditingDate = this.editingCell?.id === tx.id && this.editingCell?.field === 'date';
        const isEditingDesc = this.editingCell?.id === tx.id && this.editingCell?.field === 'description';
        const isEditingCat = this.editingCell?.id === tx.id && this.editingCell?.field === 'categoryId';
        const isEditingAmount = this.editingCell?.id === tx.id && this.editingCell?.field === 'amount';
        const txDate = new Date(tx.date).toISOString().split('T')[0];

        return html`
                    <tr>
                        ${this.columnConfig.map(col => {
          if (!col.visible) return '';

          switch (col.id) {
            case 'select':
              return html`<td><input type="checkbox" .checked="${this.selectedTransactions.has(tx.id)}" @change="${() => this.toggleSelection(tx.id)}" /></td>`;
            case 'date':
              return html`
                                        <td class="editable col-date" @click="${() => !isEditingDate && this.startEditing(tx.id, 'date', txDate)}">
                                            ${isEditingDate ? html`<input type="date" id="edit-${tx.id}-date" .value="${this.editValue}" @input="${(e: any) => this.editValue = e.target.value}" @blur="${() => this.saveCell(tx.id, 'date')}" @keydown="${(e: KeyboardEvent) => this.handleKeyDown(e, tx.id, 'date')}" />` : txDate}
                                        </td>`;
            case 'description':
              return html`
                                        <td class="${!tx.externalId ? 'editable' : ''} col-description" title="${tx.description}" @click="${() => !tx.externalId && !isEditingDesc && this.startEditing(tx.id, 'description', tx.description)}">
                                            ${isEditingDesc ? html`<input type="text" id="edit-${tx.id}-description" .value="${this.editValue}" @input="${(e: any) => this.editValue = e.target.value}" @blur="${() => this.saveCell(tx.id, 'description')}" @keydown="${(e: KeyboardEvent) => this.handleKeyDown(e, tx.id, 'description')}" />` : html`${tx.description}${tx.externalId ? html`<span title="${i18n.t('common.verified_locked')}" style="cursor: help; margin-left: 4px; font-size: 0.8em; opacity: 0.5;">🔒</span>` : ''}`}
                                        </td>`;
            case 'categoryId':
              return html`
                                        <td class="editable" @click="${() => !isEditingCat && this.startEditing(tx.id, 'categoryId', tx.categoryId)}">
                                            ${isEditingCat ? html`
                                                <filterable-select
                                                  id="edit-${tx.id}-categoryId"
                                                  .value="${this.editValue || 'uncategorized'}"
                                                  .options="${this.getCategoryOptions(true)}"
                                                  .placeholder="${i18n.t('common.category')}"
                                                  .compact="${true}"
                                                  @change="${async (e: CustomEvent) => {
                    if (e.detail.value === 'new_category_inline') {
                      this.cancelEditing();
                      this.showAddCategoryModal = true;
                      return;
                    }
                    this.editValue = e.detail.value === 'uncategorized' ? null : e.detail.value;
                    await this.saveCell(tx.id, 'categoryId');
                  }}"
                                                  width="100%">
                                                </filterable-select>
                                            ` : html`${(() => {
                  // Show split indicator if transaction has splits
                  if (tx.splits && tx.splits.length > 0) {
                    return html`<span style="cursor: pointer;" @click="${(e: Event) => { e.stopPropagation(); this.openSplitModal(tx); }}">🔀 Split (${tx.splits.length} items)</span>`;
                  }
                  const c = this.categories.find(c => c.id === tx.categoryId);
                  if (c) { if (c.parentId) { const p = this.categories.find(cat => cat.id === c.parentId); return html`<small style="opacity: 0.7">${p?.name} ></small> ${c.icon} ${c.name}`; } return html`${c.icon} ${c.name}`; }
                  if (tx._suggestion) { const sugg = this.categories.find(c => c.id === tx._suggestion); return html`<div style="display: flex; align-items: center; gap: 0.5rem; justify-content: flex-start;"><span style="opacity: 0.6; font-style: italic;">? ${sugg?.name}</span><div style="display: flex; gap: 2px;"><button @click="${(e: Event) => { e.stopPropagation(); this.updateCategory(tx.id, tx._suggestion); }}" title="Accept Suggestion" style="padding: 2px 6px; background: #22c55e; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 0.8rem;">✔</button><button @click="${async (e: Event) => { e.stopPropagation(); if (tx._suggestionConditionsJson) { try { await api.post('/rules/suggestions/reject-prompt', { conditionsJson: tx._suggestionConditionsJson, categoryId: tx._suggestion }); } catch (err) { console.error('Failed to reject suggestion:', err); } } tx._suggestion = null; this.requestUpdate(); }}" title="Reject" style="padding: 2px 6px; background: #94a3b8; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 0.8rem;">✖</button></div></div>`; }
                  return html`<span style="color: #cbd5e1; font-style: italic;">${i18n.t('common.uncategorized')}</span>`;
                })()}`}
                                        </td>`;
            case 'costObjectId':
              const isEditingCostObj = this.editingCell?.id === tx.id && this.editingCell?.field === 'costObjectId';
              return html`
                                        <td class="editable" @click="${() => !isEditingCostObj && this.startEditing(tx.id, 'costObjectId', tx.costObjectId)}">
                                            ${isEditingCostObj ? html`
                                                <filterable-select
                                                  id="edit-${tx.id}-costObjectId"
                                                  .value="${this.editValue || ''}"
                                                  .options="${this.getCostObjectOptions()}"
                                                  .placeholder="${i18n.t('cost_objects.funding_source')}"
                                                  .compact="${true}"
                                                  @change="${async (e: CustomEvent) => {
                    this.editValue = e.detail.value;
                    await this.saveCell(tx.id, 'costObjectId');
                  }}"
                                                  width="100%">
                                                </filterable-select>
                                            ` : html`${(() => {
                  const co = this.costObjects.find(c => c.id === tx.costObjectId);
                  if (co) return html`${co.icon} ${co.name}`;
                  return html`<span style="color: #cbd5e1; font-style: italic;">${i18n.t('cost_objects.unassigned')}</span>`;
                })()}`}
                                        </td>`;
            case 'amount':
              const symbol = this.currency === 'EUR' ? '€' : '$';
              return html`
                                        <td class="editable amount ${tx.amount < 0 ? 'negative' : 'positive'}" @click="${() => !isEditingAmount && this.startEditing(tx.id, 'amount', tx.amount)}">
                                            ${isEditingAmount ? html`<input type="number" id="edit-${tx.id}-amount" step="0.01" .value="${this.editValue}" @input="${(e: any) => this.editValue = parseFloat(e.target.value)}" @blur="${() => this.saveCell(tx.id, 'amount')}" @keydown="${(e: KeyboardEvent) => this.handleKeyDown(e, tx.id, 'amount')}" />` : html`${tx.amount < 0 ? '-' : '+'}${symbol}${Math.abs(tx.amount).toFixed(2)}`}
                                        </td>`;
            case 'budget':
              const budgetSymbol = this.currency === 'EUR' ? '€' : '$';
              return html`
                                        <td class="amount" style="color: var(--md-sys-color-on-surface-variant);">
                                            ${(() => {
                  if (tx._budgetRemaining === undefined) return '';
                  const cat = this.categories.find(c => c.id === tx.categoryId);
                  const budget = cat ? Number(cat.budget) : 0;
                  return html`${budgetSymbol}${tx._budgetRemaining.toFixed(2)} / ${budget.toFixed(0)}`;
                })()}
                                        </td>`;
            case 'notes':
              return html`
                                        <td class="editable col-notes" @click="${() => !this.editingCell && this.startEditing(tx.id, 'notes', tx.notes)}">
                                            ${this.editingCell?.id === tx.id && this.editingCell?.field === 'notes' ? html`<input type="text" id="edit-${tx.id}-notes" .value="${this.editValue || ''}" @input="${(e: any) => this.editValue = e.target.value}" @blur="${() => this.saveCell(tx.id, 'notes')}" @keydown="${(e: KeyboardEvent) => this.handleKeyDown(e, tx.id, 'notes')}" />` : (tx.notes || '-')}
                                        </td>`;
            case 'actions':
              return html`<td><div class="action-buttons"><button class="btn-secondary action-icon" @click="${(e: Event) => { e.stopPropagation(); this.setStartingBalanceFromTransaction(tx); }}" title="${i18n.t('table.set_balance_from_here')}">⚓</button><button class="btn-secondary action-icon" @click="${(e: Event) => { e.stopPropagation(); this.openCreateRuleModal(tx); }}" title="${i18n.t('table.create_rule')}">📏</button><button class="btn-secondary action-icon" @click="${(e: Event) => { e.stopPropagation(); this.openSplitModal(tx); }}" title="${i18n.t('table.split_transaction')}">🔀</button><button class="btn-danger action-icon" @click="${() => this.deleteTransaction(tx.id)}" title="${i18n.t('table.delete_transaction')}">✕</button></div></td>`;

            default:
              return '';
          }
        })}
                    </tr>
                    `;
      })}
              </tbody>
            </table>
        </div>

        <div class="pagination-controls">
            <span style="font-size: 0.875rem; color: var(--md-sys-color-on-surface-variant);">${i18n.t('table.rows_per_page')}:</span>
            <select style="width: auto; height: 32px; padding: 0 8px;" 
                .value="${this.pageSize}" 
                @change="${(e: any) => {
                  const nextPageSize = parseInt(e.target.value, 10);
                  if (Number.isNaN(nextPageSize) || nextPageSize <= 0) return;
                  this.pageSize = nextPageSize;
                  this.currentPage = 1;
                }}">
                ${this.getPageSizeOptions().map(size => html`
                    <option value="${size}">${size}${size === this.filteredTransactions.length ? ` (${i18n.t('common.total')})` : ''}</option>
                `)}
            </select>

            <button class="btn-secondary" style="width: auto; height: 32px; padding: 0 12px;" @click="${() => this.showColumnModal = true}">${i18n.t('filters.columns')}</button>

            <span style="font-size: 0.875rem; color: var(--md-sys-color-on-surface-variant);">
                ${(this.currentPage - 1) * this.pageSize + 1}-${Math.min(this.currentPage * this.pageSize, this.filteredTransactions.length)} of ${this.filteredTransactions.length}
            </span>

            <div style="display: flex; gap: 8px;">
                <button class="btn-secondary" 
                    ?disabled="${this.currentPage === 1}"
                    @click="${() => this.currentPage--}">
                    &lt;
                </button>
                <button class="btn-secondary" 
                    ?disabled="${this.currentPage * this.pageSize >= this.filteredTransactions.length}"
                    @click="${() => this.currentPage++}">
                    &gt;
                </button>
            </div>
        </div>
      `}
`;
  }
}
