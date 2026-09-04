import { LitElement, html, css, nothing } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { api, bankSyncApi } from '../api/client';
import '../components/csv-wizard';
import '../components/split-transaction-modal';
import '../components/rule-editor';
import '../components/filterable-select';
import 'emoji-picker-element';
import type { SelectOption } from '../components/filterable-select';
import {
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
  contentWidth,
  desktopUI,
  field as formField,
  footnote,
  periodStepper,
  rankedBar,
  statusPill,
  watchViewportWidth,
} from '../styles/desktop-ui';

import { i18n } from '../i18n/i18n';
import { calculateMonthlyStats } from '../utils/expense-utils';
import { getAppBasePath } from '../utils/router-paths';


type DateFilterMode = 'month' | 'year' | 'custom' | 'all_time';

/** Rows appended each time the mobile list reaches its scroll sentinel. */
const MOBILE_PAGE_SIZE = 30;

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
  @state() bankSyncing = false;

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

  // --- Desktop layer (> 600px) ---
  /** Row whose inline expand is open; only one at a time. */
  @state() private openRowId: string | null = null;
  /** Edits held by the open row until Save. */
  @state() private rowDraft: { categoryId: string; date: string; amount: string; notes: string } | null = null;
  /** Category dropdown inside the open row's expand. */
  @state() private rowCatMenu = false;
  @state() private rowCatQuery = '';
  /** Account / period / filter popovers in the header. */
  @state() private showAccountMenu = false;
  @state() private showFilterMenu = false;
  @state() private showPageSizeMenu = false;
  /** Transaction whose in-row category dropdown is open, or null. */
  @state() private catCellFor: string | null = null;
  /** 44px rows comfortable, 36px compact. Remembered per device. */
  @state() private density: 'comfortable' | 'compact' = 'comfortable';
  /** Drives the responsive drop of the side column; kept in sync on resize. */
  @state() viewportWidth = window.innerWidth;

  // --- Mobile layer (<= 600px). ---
  @state() isMobile = false;
  /** Transaction whose category sheet is open, or null. */
  @state() sheetTx: any = null;
  @state() sheetCategoryQuery = '';
  @state() showFilterSheet = false;
  @state() showReconciliationSheet = false;
  @state() showAccountSheet = false;
  @state() showPeriodSheet = false;
  @state() searchMode = false;
  @state() bulkMode = false;
  /** 'review' shows only rows needing a category; '' shows everything. */
  @state() quickFilter: '' | 'review' | 'uncategorized' = '';
  /** Which bulk picker sheet is open, if any. */
  @state() bulkTarget: 'category' | 'account' | null = null;
  /** How many rows the list currently shows; grows as the sentinel scrolls in. */
  @state() mobileVisibleCount = MOBILE_PAGE_SIZE;
  @state() snack: SnackbarOptions | null = null;

  // Period sheet holds its edits until Apply
  @state() private sheetMode: DateFilterMode = 'month';
  @state() private sheetYear = new Date().getFullYear();
  @state() private sheetMonth = new Date().getMonth() + 1;
  @state() private sheetStartDate = '';
  @state() private sheetEndDate = '';

  private unwatchViewport?: () => void;
  private unwatchWidth?: () => void;
  private snackTimer?: number;
  private longPressTimer?: number;
  private listObserver?: IntersectionObserver;
  private observedSentinel?: Element;

  // Non-reactive property to preserve scroll position across renders
  private _preservedScrollY: number | null = null;
  private _autoPageSizeToTotalOnNextLoad = false;
  private _allTimePageSizeSuggested = false;
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
    this.unwatchViewport = watchMobileViewport(this);
    this.unwatchWidth = watchViewportWidth(this);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    i18n.removeEventListener('lang-change', () => this.requestUpdate());
    this.unwatchViewport?.();
    this.unwatchWidth?.();
    if (this.snackTimer) window.clearTimeout(this.snackTimer);
    if (this.longPressTimer) window.clearTimeout(this.longPressTimer);
    this.listObserver?.disconnect();
    this.listObserver = undefined;
    this.observedSentinel = undefined;
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

  @state() private pendingConfirm: { message: string; confirmLabel: string } | null = null;
  private confirmResolver: ((ok: boolean) => void) | null = null;

  /**
   * Same contract as window.confirm(), but on mobile it resolves through a
   * bottom sheet instead of a native dialog.
   */
  private askConfirm(message: string, confirmLabel?: string): Promise<boolean> {
    if (!this.isMobile) return Promise.resolve(confirm(message));
    return new Promise<boolean>(resolve => {
      this.confirmResolver?.(false); // only one dialog at a time
      this.confirmResolver = resolve;
      this.pendingConfirm = { message, confirmLabel: confirmLabel || i18n.t('common.save') };
    });
  }

  private settleConfirm(ok: boolean) {
    this.pendingConfirm = null;
    const resolve = this.confirmResolver;
    this.confirmResolver = null;
    resolve?.(ok);
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
    const confirmed = await this.askConfirm(
      `Are you sure you want to delete ${this.selectedTransactions.size} transactions?`,
      i18n.t('common.delete'),
    );
    if (!confirmed) return;

    try {
      for (const id of this.selectedTransactions) {
        await api.delete(`/transactions/${id}`);
      }
      this.selectedTransactions = new Set();
      await this.loadData(true);
    } catch (e: any) {
      this.notify('Failed to delete selected: ' + e.message);
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
      this.notify('Failed to update category: ' + e.message);
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
      this.notify(i18n.t('bulk_actions.assign_account_failed') + ': ' + e.message);
    }
  }

  async loadBalances() {
    this.balanceLoading = true;
    const { year: balanceYear, month: balanceMonth } = this.getBalanceReferenceMonthYear();
    const monthKey = `${balanceYear}-${String(balanceMonth).padStart(2, '0')}`;
    const startBalanceKey = `starting_balance_all_${monthKey}`;
    const accountKey = this.selectedAccountId || 'all';
    const verifiedBalanceKey = this.getVerifiedBalanceSettingKey();
    const legacyVerifiedBalanceKey = `balance_verified_${accountKey}_${balanceYear}_${balanceMonth}`;

    try {
      const [balData, settingData, legacySettingData, monthlyRecord, allAccountsStartSetting] = await Promise.all([
        api.get('/transactions/balance', this.selectedAccountId ? { accountId: this.selectedAccountId } : {}),
        api.get(`/settings/${verifiedBalanceKey}`).catch(() => null),
        api.get(`/settings/${legacyVerifiedBalanceKey}`).catch(() => null),
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
      const verifiedRaw = settingData ?? legacySettingData;
      this.verifiedBalance = verifiedRaw ? parseFloat(verifiedRaw) : 0;

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

  getVerifiedBalanceSettingKey() {
    const accountKey = this.selectedAccountId || 'all';
    return `balance_verified_account_${accountKey}`;
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
      this.notify(i18n.t('expenses.set_from_movement_invalid'));
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
        this.notify(i18n.t('expenses.set_from_movement_failed'));
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
      this.notify(i18n.t('expenses.set_from_movement_done'));
    } catch (e: any) {
      console.error('Failed to set balances from movement', e);
      this.notify(`${i18n.t('expenses.set_from_movement_failed')}: ${e.message || i18n.t('common.unknown_error')}`);
    }
  }

  async saveNewCategory() {
    if (!this.categoryForm.name) {
      this.notify('Please enter a category name');
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
      this.notify('Failed to save category: ' + (e.message || 'Unknown error'));
    }
  }

  get monthlyStats() {
    return calculateMonthlyStats(this.transactions, this.categories);
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
    const verifiedBalanceKey = this.getVerifiedBalanceSettingKey();

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

  static styles = [css`
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

    /* ---------- mobile ---------- */

    .x-screen {
      display: flex;
      flex-direction: column;
      min-height: calc(100dvh - 64px - env(safe-area-inset-bottom, 0px));
    }

    .x-summary {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 12px;
      padding: 4px 0;
    }
    .x-summary-label { font: 500 12px/16px 'Roboto', sans-serif; color: var(--md-sys-color-on-surface-variant); }
    .x-summary-net { font: 500 20px/28px 'Roboto', sans-serif; }
    .x-summary-right {
      text-align: right;
      border: none;
      background: none;
      padding: 0;
      cursor: pointer;
      color: inherit;
      font: inherit;
    }
    .x-summary-diff { font: 500 14px/20px 'Roboto', sans-serif; color: var(--md-sys-color-error); }

    /* Reserve room for the FAB so no row sits underneath it.
       flex: 1 0 auto grows into spare space without shrinking the rows. */
    .x-list { padding-bottom: 88px; flex: 1 0 auto; }

    .x-date-header {
      position: sticky;
      top: 0;
      z-index: 1;
      margin: 0 -16px;
      padding: 8px 16px 4px;
      background: var(--md-sys-color-surface);
      font: 500 12px/16px 'Roboto', sans-serif;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      color: var(--md-sys-color-outline);
    }

    .x-row {
      display: flex;
      align-items: center;
      gap: 12px;
      min-height: 64px;
      padding: 12px 16px;
      margin: 0 -16px;
      width: calc(100% + 32px);
      box-sizing: border-box;
      border: none;
      border-bottom: 1px solid var(--md-sys-color-surface-container-high);
      background: none;
      text-align: left;
      color: inherit;
      font: inherit;
      cursor: pointer;
      -webkit-tap-highlight-color: transparent;
    }
    .x-row.highlight { background: var(--md-sys-color-surface-container); }
    .x-row-main { flex: 1; min-width: 0; }
    .x-row-desc {
      font: var(--md-sys-typescale-body-large);
      color: var(--md-sys-color-on-surface);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .x-row-cat {
      font: 500 13px/16px 'Roboto', sans-serif;
      color: var(--md-sys-color-on-surface-variant);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .x-suggestion {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-top: 2px;
    }
    .x-suggestion-name {
      font: italic 500 13px/16px 'Roboto', sans-serif;
      color: var(--md-sys-color-primary);
    }
    .x-accept {
      height: 32px;
      padding: 0 12px;
      border: none;
      border-radius: 16px;
      background: var(--md-sys-color-primary);
      color: var(--md-sys-color-on-primary);
      font: 500 13px/16px 'Roboto', sans-serif;
      display: inline-flex;
      align-items: center;
      gap: 4px;
      cursor: pointer;
      flex-shrink: 0;
    }
    .x-avatar-suggest {
      background: var(--md-sys-color-secondary-container);
      color: var(--md-sys-color-on-secondary-container);
      font: 500 18px/1 'Roboto', sans-serif;
    }

    /* bulk select */
    .x-bulk-bar {
      display: flex;
      align-items: center;
      gap: 8px;
      margin: -12px -16px 0;
      padding: 4px 8px;
      min-height: 56px;
      background: var(--md-sys-color-secondary-container);
      color: var(--md-sys-color-on-secondary-container);
    }
    .x-bulk-bar .m-icon-btn { color: inherit; width: 48px; height: 48px; }
    .x-bulk-title { flex: 1; font: 500 18px/24px 'Roboto', sans-serif; }
    .x-bulk-action {
      background: none;
      border: none;
      color: inherit;
      font: 500 14px/20px 'Roboto', sans-serif;
      cursor: pointer;
      padding: 0 12px;
    }
    .x-check {
      width: 40px;
      height: 40px;
      border-radius: 20px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      box-sizing: border-box;
      border: 2px solid var(--md-sys-color-outline);
    }
    .x-check.on {
      background: var(--md-sys-color-primary);
      color: var(--md-sys-color-on-primary);
      border-color: var(--md-sys-color-primary);
    }
    .x-bulk-actions {
      position: sticky;
      bottom: 0;
      display: flex;
      gap: 12px;
      margin: 8px -16px 0;
      padding: 12px 16px calc(12px + env(safe-area-inset-bottom, 0px));
      /* The handoff names #001e30, which is the light palette's
         on-primary-container; primary-container is the equivalent deep blue in
         the dark palette and stays sane when the theme flips. */
      background: var(--md-sys-color-primary-container);
      border-top: 1px solid var(--md-sys-color-outline-variant);
    }

    /* transaction sheet */
    .x-sheet-header {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .x-sheet-header .m-avatar { width: 44px; height: 44px; border-radius: 22px; font-size: 20px; }
    .x-sheet-desc { font: 500 18px/24px 'Roboto', sans-serif; color: var(--md-sys-color-on-surface); }
    .x-sheet-meta { font: 400 13px/20px 'Roboto', sans-serif; color: var(--md-sys-color-on-surface-variant); }
    .x-cat-row {
      display: flex;
      align-items: center;
      gap: 12px;
      min-height: 56px;
      padding: 0 12px;
      border: none;
      border-radius: 12px;
      background: none;
      width: 100%;
      box-sizing: border-box;
      text-align: left;
      color: var(--md-sys-color-on-surface);
      font: var(--md-sys-typescale-body-large);
      cursor: pointer;
    }
    .x-cat-row.selected {
      background: var(--md-sys-color-secondary-container);
      color: var(--md-sys-color-on-secondary-container);
    }
    .x-cat-row.child { padding-left: 32px; }

    .x-recon-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      min-height: 52px;
      border-bottom: 1px solid var(--md-sys-color-surface-container-highest);
    }

    /* skeletons */
    .x-skeleton-row {
      display: flex;
      align-items: center;
      gap: 12px;
      min-height: 64px;
      padding: 12px 0;
      border-bottom: 1px solid var(--md-sys-color-surface-container-high);
    }
    .x-skeleton-main { flex: 1; display: flex; flex-direction: column; gap: 8px; }

    /* ---------- desktop ---------- */

    /* Anchored popovers replace the phone's bottom sheets: account picker,
       period picker, the filter panel and the category dropdown. */
    .dx-anchor { position: relative; display: flex; flex-shrink: 0; }
    .dx-pop {
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
    .dx-pop.right { left: auto; right: 0; }
    .dx-pop.wide { min-width: 320px; }
    .dx-pop-list { max-height: 268px; overflow-y: auto; }
    .dx-pop-row {
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
    .dx-pop-row:hover { background: var(--md-sys-color-surface-container); }
    .dx-pop-row.selected {
      background: var(--md-sys-color-secondary-container);
      color: var(--md-sys-color-on-secondary-container);
    }
    .dx-pop-row.child { padding-left: 26px; }
    .dx-pop-search {
      display: flex;
      align-items: center;
      gap: 8px;
      height: 38px;
      padding: 0 10px;
      border-bottom: 1px solid var(--md-sys-color-surface-container-high);
      margin-bottom: 4px;
    }
    .dx-pop-search .m-icon { color: var(--md-sys-color-on-surface-variant); }
    .dx-pop-search input {
      flex: 1;
      min-width: 0;
      border: none;
      background: transparent;
      outline: none;
      font: 400 13px/18px 'Roboto', sans-serif;
      color: var(--md-sys-color-on-surface);
    }
    .dx-pop-title {
      font: 500 13px/18px 'Roboto', sans-serif;
      color: var(--md-sys-color-on-surface);
      padding: 4px 10px 8px;
    }
    .dx-month-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px; padding: 0 6px 6px; }
    .dx-month {
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
    .dx-month.selected { background: var(--md-sys-color-primary); color: var(--md-sys-color-on-primary); }
    .dx-month.future { color: var(--md-sys-color-outline); }
    .dx-year-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 6px 6px;
      font: 500 14px/20px 'Roboto', sans-serif;
    }

    /* The category cell doubles as a one-click editor, as the row expand does
       for everything else. */
    .dx-cat-cell {
      position: relative;
      display: flex;
      align-items: center;
      gap: 8px;
      min-width: 0;
      height: 100%;
      margin-right: 12px;
      padding: 0 8px;
      border-radius: 8px;
      box-sizing: border-box;
      cursor: pointer;
      background: none;
      font: inherit;
      color: inherit;
      text-align: left;
    }
    .dx-cat-cell:hover { background: var(--md-sys-color-surface-container-highest); }
    .dx-cat-name {
      font: 400 14px/18px 'Roboto', sans-serif;
      color: var(--md-sys-color-on-surface);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .dx-cat-empty {
      font: italic 400 14px/18px 'Roboto', sans-serif;
      color: var(--md-sys-color-outline);
    }
    .dx-suggestion {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      height: 26px;
      padding: 0 4px 0 10px;
      border-radius: 13px;
      background: var(--md-sys-color-tertiary-container);
      color: var(--md-sys-color-on-tertiary-container);
      font: 500 12px/16px 'Roboto', sans-serif;
      white-space: nowrap;
      max-width: 100%;
    }
    .dx-suggestion > span:first-child { overflow: hidden; text-overflow: ellipsis; }
    .dx-suggestion button { display: inline-flex; padding: 0; }
    .dx-accept { color: var(--pf-positive); }
    .dx-reject { color: var(--md-sys-color-outline); }
  `, mobileUI, desktopUI];

  async firstUpdated() {
    const storedCurrency = localStorage.getItem('priperfin_currency');
    if (storedCurrency) this.currency = storedCurrency;

    const storedDensity = localStorage.getItem('priperfin_row_density');
    if (storedDensity === 'compact' || storedDensity === 'comfortable') {
      this.density = storedDensity;
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

    if (this.isMobile) this.setupInfiniteScroll();

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

        const shouldSuggestAllTimePageSize =
          this.dateFilterMode === 'all_time' &&
          (this._autoPageSizeToTotalOnNextLoad || !this._allTimePageSizeSuggested);

        if (shouldSuggestAllTimePageSize) {
          const totalRows = this.filteredTransactions.length;
          if (totalRows > 0) {
            this.pageSize = totalRows;
            this.currentPage = 1;
          }
          this._allTimePageSizeSuggested = true;
          this._autoPageSizeToTotalOnNextLoad = false;
        } else if (this.dateFilterMode !== 'all_time') {
          this._allTimePageSizeSuggested = false;
        }
      } else {
        console.error('Failed to load transactions', txsResult.reason);
        this.notify('Failed to load transactions. Check console for details.');
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
          const propagate = await this.askConfirm(
            `Found ${others.length} other uncategorized transactions for "${tx.description}".Apply "${this.categories.find(c => c.id === categoryId)?.name}" to them too ? `,
            i18n.t('mobile.apply'),
          );
          if (propagate) {
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
            const shouldCreateRule = await this.askConfirm(
              i18n.t('rules.create_rule_prompt').replace('{category}', categoryName || ''),
              i18n.t('mobile.rule'),
            );

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
              
              const viewRules = await this.askConfirm(
                i18n.t('rules.rule_exists').replace('{category}', categoryName || '').replace('{rules}', ruleNames),
                i18n.t('rules.title'),
              );
              if (viewRules) {
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
      this.notify('Failed to delete: ' + (e.message || 'Unknown error'));
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
    this.notify(`Successfully imported ${count} transactions.`);
    await this.loadData(true);
  }

  async handleBankSync() {
    this.bankSyncing = true;
    try {
      const result = await bankSyncApi.syncTransactions(this.selectedAccountId || undefined);
      const newCount = result?.newCount ?? 0;
      const duplicateCount = result?.duplicateCount ?? 0;
      const expiredAcc = result?.accountsSynced?.find((a: any) => a.status === 'EXPIRED');
      const errorAcc = result?.accountsSynced?.find((a: any) => a.status === 'ERROR');

      if (expiredAcc) {
        this.notify(`⚠️ ${expiredAcc.accountName}: ${expiredAcc.message || 'La sesión del banco ha expirado. Por favor, ve a Configuración para re-autenticar.'}`);
      } else if (errorAcc && newCount === 0 && duplicateCount === 0) {
        this.notify(`⚠️ ${errorAcc.accountName}: ${errorAcc.message || 'Error al sincronizar con el banco.'}`);
      } else {
        const msg = i18n.t('bank_sync.sync_success')
          .replace('{newCount}', String(newCount))
          .replace('{duplicateCount}', String(duplicateCount));
        this.notify(msg);
      }
      await this.loadData(true);
    } catch (e: any) {
      console.error('Bank sync failed', e);
      this.notify(i18n.t('bank_sync.sync_failed') + ': ' + (e.message || 'Unknown error'));
    } finally {
      this.bankSyncing = false;
    }
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
        // The DTO validates these as UUIDs unless they are explicitly null,
        // so empty strings from the form have to be normalised away
        categoryId: this.newTransaction.categoryId || null,
        costObjectId: this.newTransaction.costObjectId || null,
        accountId: this.selectedAccountId || null
      });
      this.showAddForm = false;
      this.newTransaction = { date: new Date().toISOString().split('T')[0], description: '', amount: 0, categoryId: '', costObjectId: '', notes: '' };
      await this.loadData(true);
    } catch (e) {
      console.error('Failed to create transaction', e);
      this.notify('Failed to create transaction');
    }
  }

  /**
   * Writes one field of one transaction and patches local state in place, then
   * offers a rule when a category was set. Shared by the inline row expand and
   * the mobile transaction sheet.
   */
  async saveField(id: string, field: string, value: any) {
    if (value === null || value === undefined) return;

    try {
      const payload: any = {};
      let localValue: any = value;

      if (field === 'date') {
        payload[field] = new Date(value).toISOString();
        localValue = payload[field];
      } else if (field === 'amount') {
        payload[field] = parseFloat(value);
        localValue = payload[field];
      } else if (field === 'categoryId' && (value === 'uncategorized' || value === '')) {
        payload[field] = null;
        localValue = null;
      } else if (field === 'costObjectId' && value === '') {
        payload[field] = null;
        localValue = null;
      } else {
        payload[field] = value;
      }

      await api.patch(`/transactions/${id}`, payload);

      // Update local state directly instead of reloading
      const txIndex = this.transactions.findIndex(t => t.id === id);
      if (txIndex !== -1) {
        this.transactions = this.transactions.map((t, i) =>
          i === txIndex ? { ...t, [field]: localValue } : t
        );
      }

      this._preservedScrollY = null;

      // Recompute budget balances if needed
      if (field === 'categoryId' || field === 'amount') {
        this.computeBudgetBalances();
      }

      // If category was changed, check for rule suggestions
      if (field === 'categoryId' && localValue && localValue !== 'uncategorized') {
        console.log('[ViewExpenses] saveField: category changed, checking for suggestions');
        try {
          const suggestion = await api.get(`/rules/suggestions/for-transaction/${id}`);
          console.log('[ViewExpenses] saveField: suggestion response:', suggestion);
          console.log('[ViewExpenses] saveField: has conditionsJson?', !!suggestion?.conditionsJson);
          console.log('[ViewExpenses] saveField: keys:', Object.keys(suggestion || {}));
          
          // Check if suggestion has conditionsJson (backend returns null as {} when no suggestion)
          if (suggestion?.conditionsJson) {
            const categoryName = this.categories.find(c => c.id === localValue)?.name;
            const shouldCreateRule = await this.askConfirm(
              i18n.t('rules.create_rule_prompt').replace('{category}', categoryName || ''),
              i18n.t('mobile.rule'),
            );

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
            console.log('[ViewExpenses] saveField: No suggestion returned (not enough similar transactions or rule already exists)');
          }
        } catch (err) {
          console.error('[ViewExpenses] saveField: failed to get suggestion:', err);
        }
      }
    } catch (e: any) {
      console.error('Failed to save field', e);
      this.notify('Failed to save changes: ' + (e.message || JSON.stringify(e)));
      this._preservedScrollY = null;
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
      this.notify(msg);
      console.log('Diagnostics:', result);
    } catch (e: any) {
      this.notify('Failed to check database: ' + e.message);
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
          if (await this.askConfirm(i18n.t('rules.rule_created'), i18n.t('rules.apply_rule'))) {
              try {
                  const result = await api.post(`/rules/${rule.id}/apply`, {});
                  const count = result.matchCount || result.matched || 0;
                  if (count > 0) {
                      this.notify(i18n.t('rules.rule_applied_count').replace('{count}', count.toString()));
                  } else {
                      this.notify(i18n.t('rules.no_matches'));
                  }
              } catch (err) {
                  console.error('Failed to apply rule', err);
                  this.notify(i18n.t('rules.errors.apply_failed'));
              }
          }
          
          this.showRuleModal = false;
          await this.loadData(true);
      } catch (e: any) {
          console.error(e);
          this.notify(i18n.t('rules.errors.save_failed') + ': ' + e.message);
      }
  }


  // ==================================================================
  // Mobile layout
  // ==================================================================

  private get symbol() {
    return this.currency === 'EUR' ? '€' : '$';
  }

  private money(value: number, decimals = 2): string {
    return `${this.symbol}${Math.abs(value).toLocaleString(i18n.getLocale(), {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    })}`;
  }

  // ---- period stepper ----

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
    this.mobileVisibleCount = MOBILE_PAGE_SIZE;
    this.loadData(false);
  }

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
    this.showPeriodSheet = true;
  }

  applyPeriodSheet() {
    const previousMode = this.dateFilterMode;
    this.dateFilterMode = this.sheetMode;
    this.year = this.sheetYear;
    this.month = this.sheetMonth;
    this.customStartDate = this.sheetStartDate;
    this.customEndDate = this.sheetEndDate;
    this.showPeriodSheet = false;
    this.mobileVisibleCount = MOBILE_PAGE_SIZE;

    if (previousMode === 'all_time' && this.dateFilterMode !== 'all_time') {
      this._allTimePageSizeSuggested = false;
    }
    this._autoPageSizeToTotalOnNextLoad = this.dateFilterMode === 'all_time';
    this.loadData(false);
  }

  // ---- list data ----

  /** Rows needing attention: uncategorized, whether or not a rule suggested one. */
  private get needsReviewTransactions() {
    return this.transactions.filter(t => !t.categoryId || t.categoryId === 'uncategorized');
  }

  /**
   * The rows the mobile list shows: the shared filter pipeline, narrowed by the
   * active quick-filter chip and capped at the current scroll window.
   */
  private get mobileTransactions() {
    let rows = this.filteredTransactions;
    if (this.quickFilter === 'review') {
      rows = rows.filter(t => !t.categoryId || t.categoryId === 'uncategorized');
    } else if (this.quickFilter === 'uncategorized') {
      rows = rows.filter(t => !t.categoryId || t.categoryId === 'uncategorized');
    }
    // Newest first regardless of the desktop sort, which the phone doesn't expose
    return [...rows].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  /** Groups the visible window into date sections for the sticky headers. */
  private mobileSections(): { key: string; label: string; rows: any[] }[] {
    const visible = this.mobileTransactions.slice(0, this.mobileVisibleCount);
    const sections: { key: string; label: string; rows: any[] }[] = [];

    visible.forEach(tx => {
      const date = new Date(tx.date);
      const key = date.toISOString().split('T')[0];
      let section = sections.find(s => s.key === key);
      if (!section) {
        section = {
          key,
          label: date.toLocaleDateString(i18n.getLocale(), {
            weekday: 'short',
            day: 'numeric',
            month: 'long',
          }),
          rows: [],
        };
        sections.push(section);
      }
      section.rows.push(tx);
    });

    return sections;
  }

  /** Appends the next window once the sentinel scrolls into view. */
  private setupInfiniteScroll() {
    const sentinel = this.shadowRoot?.querySelector('#m-sentinel');
    if (!sentinel) {
      this.listObserver?.disconnect();
      this.listObserver = undefined;
      this.observedSentinel = undefined;
      return;
    }
    if (this.observedSentinel === sentinel) return;

    this.listObserver?.disconnect();
    this.listObserver = new IntersectionObserver(entries => {
      if (!entries.some(entry => entry.isIntersecting)) return;
      if (this.mobileVisibleCount >= this.mobileTransactions.length) return;
      this.mobileVisibleCount += MOBILE_PAGE_SIZE;
    }, { rootMargin: '200px' });
    this.listObserver.observe(sentinel);
    this.observedSentinel = sentinel;
  }

  private categoryLabel(tx: any): { icon: string; name: string } | null {
    if (tx.splits && tx.splits.length > 0) {
      return { icon: '🔀', name: `${i18n.t('mobile.split')} (${tx.splits.length})` };
    }
    const category = this.categories.find(c => c.id === tx.categoryId);
    if (!category) return null;
    return { icon: category.icon || '', name: category.name };
  }

  // ---- screens ----

  private renderMobileHeader() {
    return html`
      <div class="m-title-row">
        <h1 class="m-title">${i18n.t('nav.expenses')}</h1>
        <div class="m-title-actions">
          <button class="m-icon-btn" @click="${() => { this.searchMode = true; }}"
            title="${i18n.t('filters.search')}">
            ${icon('search', 24)}
          </button>
          <button class="m-icon-btn" @click="${() => { this.showFilterSheet = true; }}"
            title="${i18n.t('mobile.filters')}">
            ${icon('filter_list', 24)}
          </button>
        </div>
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

  private renderMobileSummary() {
    const net = this.monthlyStats.income - this.monthlyStats.expense;
    const totalBalance = Number.isFinite(this.totalBalance) ? this.totalBalance : null;
    const verified = Number.isFinite(this.verifiedBalance) ? this.verifiedBalance : null;
    const difference = totalBalance !== null && verified !== null ? verified - totalBalance : null;
    const balanced = difference !== null && Math.abs(difference) < 0.01;

    return html`
      <div class="x-summary">
        <div>
          <div class="x-summary-label">${i18n.t('mobile.net_this_month')}</div>
          <div
            class="x-summary-net"
            style="color: ${net >= 0 ? 'var(--pf-positive)' : 'var(--md-sys-color-error)'}">
            ${net >= 0 ? '+' : '−'}${this.money(net)}
          </div>
        </div>

        ${difference !== null && !balanced ? html`
          <button class="x-summary-right" @click="${() => { this.showReconciliationSheet = true; }}">
            <div class="x-summary-label">${i18n.t('mobile.bank_differs_by')}</div>
            <div class="x-summary-diff">
              ${this.money(difference)} · ${i18n.t('expenses.review')}
            </div>
          </button>
        ` : nothing}
      </div>
    `;
  }

  private renderMobileChips() {
    const reviewCount = this.needsReviewTransactions.length;
    const activeCategory = this.categories.find(c => c.id === this.filterCategoryId);

    return html`
      <div class="m-chip-row">
        ${reviewCount > 0 ? html`
          <button
            class="m-filter-chip ${this.quickFilter === 'review' ? 'selected' : ''}"
            @click="${() => {
              this.quickFilter = this.quickFilter === 'review' ? '' : 'review';
              this.mobileVisibleCount = MOBILE_PAGE_SIZE;
            }}">
            ${i18n.t('mobile.needs_review')}
            <span class="m-chip-count">${reviewCount}</span>
          </button>
        ` : nothing}

        <button class="m-filter-chip" @click="${() => { this.showFilterSheet = true; }}">
          ${activeCategory
            ? html`${activeCategory.icon ?? ''} ${activeCategory.name}`
            : i18n.t('filters.all_categories')}
          ${icon('expand_more', 18)}
        </button>

        <button
          class="m-filter-chip ${this.filterCategoryId === 'uncategorized' ? 'selected' : ''}"
          @click="${() => {
            this.filterCategoryId = this.filterCategoryId === 'uncategorized' ? '' : 'uncategorized';
            this.mobileVisibleCount = MOBILE_PAGE_SIZE;
          }}">
          ${i18n.t('common.uncategorized')}
        </button>

        <button class="m-filter-chip" @click="${() => { this.bulkMode = true; }}">
          ${icon('checklist', 18)} ${i18n.t('mobile.select_mode')}
        </button>
      </div>
    `;
  }

  private renderMobileRow(tx: any) {
    const category = this.categoryLabel(tx);
    const suggestionCategory = tx._suggestion
      ? this.categories.find(c => c.id === tx._suggestion)
      : null;
    const amount = Number(tx.amount) || 0;
    const selected = this.selectedTransactions.has(tx.id);

    return html`
      <div
        class="x-row ${(suggestionCategory && !this.bulkMode) || (this.bulkMode && selected) ? 'highlight' : ''}"
        role="button"
        tabindex="0"
        @click="${() => {
          if (this.bulkMode) this.toggleSelection(tx.id);
          else this.openTransactionSheet(tx);
        }}"
        @touchstart="${() => this.startLongPress(tx)}"
        @touchend="${() => this.cancelLongPress()}"
        @touchmove="${() => this.cancelLongPress()}"
        @contextmenu="${(e: Event) => { e.preventDefault(); this.enterBulkMode(tx); }}">

        ${this.bulkMode
          ? html`<span class="x-check ${selected ? 'on' : ''}">
              ${selected ? icon('check', 22) : nothing}
            </span>`
          : html`<span class="m-avatar ${suggestionCategory ? 'x-avatar-suggest' : ''}">
              ${suggestionCategory ? '?' : (category?.icon || '')}
            </span>`}

        <div class="x-row-main">
          <div class="x-row-desc">${tx.description}</div>
          ${suggestionCategory && !this.bulkMode ? html`
            <div class="x-suggestion">
              <span class="x-suggestion-name">${suggestionCategory.name}?</span>
              <button
                class="x-accept"
                @click="${(e: Event) => {
                  e.stopPropagation();
                  this.updateCategory(tx.id, tx._suggestion);
                }}">
                ${icon('check', 16)} ${i18n.t('mobile.accept')}
              </button>
            </div>
          ` : html`
            <!-- name only; the avatar already carries the category emoji -->
            <div class="x-row-cat">
              ${category ? category.name : i18n.t('common.uncategorized')}
            </div>
          `}
        </div>

        <span class="m-amount ${amount >= 0 ? 'positive' : ''}">
          ${amount < 0 ? '−' : '+'}${Math.abs(amount).toFixed(2)}
        </span>
      </div>
    `;
  }

  /** Long-press is the primary way in; the chip row offers a discoverable one. */
  private startLongPress(tx: any) {
    if (this.bulkMode) return;
    this.cancelLongPress();
    this.longPressTimer = window.setTimeout(() => this.enterBulkMode(tx), 500);
  }

  private cancelLongPress() {
    if (this.longPressTimer) {
      window.clearTimeout(this.longPressTimer);
      this.longPressTimer = undefined;
    }
  }

  private enterBulkMode(tx: any) {
    this.cancelLongPress();
    this.bulkMode = true;
    this.selectedTransactions = new Set([tx.id]);
  }

  private exitBulkMode() {
    this.bulkMode = false;
    this.selectedTransactions = new Set();
  }

  private renderMobileList() {
    const sections = this.mobileSections();
    const total = this.mobileTransactions.length;

    if (this.loading) return this.renderMobileSkeletons();

    if (total === 0) {
      return html`
        <div class="m-empty" style="flex: 1; justify-content: center;">
          <div class="m-empty-circle">${icon('receipt_long', 40)}</div>
          <div class="m-empty-title">${i18n.t('mobile.nothing_here_yet')}</div>
          <div class="m-empty-body">
            ${i18n.t('mobile.no_transactions_for', { period: this.periodLabel() })}
          </div>
          <div class="m-empty-actions">
            <button class="m-btn tall" @click="${() => { this.showAddForm = true; }}">
              ${icon('add', 22)} ${i18n.t('mobile.add_transaction')}
            </button>
            <button
              class="m-btn tall tonal"
              ?disabled="${this.bankSyncing}"
              @click="${this.handleBankSync}">
              ${icon('sync', 22)} ${i18n.t('bank_sync.sync_all')}
            </button>
            <button class="m-btn tall outlined" @click="${() => { this.showWizard = true; }}">
              ${icon('upload_file', 22)} ${i18n.t('expenses.import_csv')}
            </button>
          </div>
        </div>
      `;
    }

    return html`
      <div class="x-list">
        ${sections.map(section => html`
          <div class="x-date-header">${section.label}</div>
          ${section.rows.map(tx => this.renderMobileRow(tx))}
        `)}
        ${this.mobileVisibleCount < total ? html`<div id="m-sentinel" style="height: 1px"></div>` : nothing}
      </div>
    `;
  }

  private renderMobileSkeletons() {
    return html`
      <div class="x-list">
        <div class="x-summary">
          <div style="display: flex; flex-direction: column; gap: 8px;">
            ${skeleton('96px', '12px')}
            ${skeleton('128px', '20px')}
          </div>
          ${skeleton('88px', '14px')}
        </div>
        ${[0, 1, 2, 3, 4, 5].map(() => html`
          <div class="x-skeleton-row">
            <div class="m-skeleton-circle"></div>
            <div class="x-skeleton-main">
              ${skeleton('60%', '14px')}
              ${skeleton('35%', '12px', true)}
            </div>
            ${skeleton('68px', '14px', true)}
          </div>
        `)}
      </div>
    `;
  }

  private renderBulkBar() {
    const size = this.selectedTransactions.size;
    const visible = this.mobileTransactions.slice(0, this.mobileVisibleCount);

    return html`
      <div class="x-bulk-bar">
        <button class="m-icon-btn" @click="${() => this.exitBulkMode()}" aria-label="${i18n.t('common.cancel')}">
          ${icon('close', 24)}
        </button>
        <span class="x-bulk-title">${i18n.t('mobile.selected_count', { count: size })}</span>
        <button
          class="x-bulk-action"
          @click="${() => { this.selectedTransactions = new Set(visible.map(t => t.id)); }}">
          ${i18n.t('mobile.select_all')}
        </button>
      </div>
    `;
  }

  private renderBulkActions() {
    const disabled = this.selectedTransactions.size === 0;
    return html`
      <div class="x-bulk-actions">
        <button
          class="m-btn"
          style="flex: 1"
          ?disabled="${disabled}"
          @click="${() => { this.bulkTarget = 'category'; }}">
          ${icon('sell', 20)} ${i18n.t('common.category')}
        </button>
        <button
          class="m-btn tonal"
          style="flex: 1"
          ?disabled="${disabled}"
          @click="${() => { this.bulkTarget = 'account'; }}">
          ${icon('account_balance', 20)} ${i18n.t('mobile.account')}
        </button>
        <button
          class="m-btn destructive"
          style="width: 48px; padding: 0"
          ?disabled="${disabled}"
          title="${i18n.t('bulk_actions.delete_selected')}"
          @click="${this.deleteSelected}">
          ${icon('delete', 20)}
        </button>
      </div>
    `;
  }

  /** Picker for the bulk Category / Account actions. */
  private renderBulkPickerSheet() {
    const isCategory = this.bulkTarget === 'category';
    const options: SelectOption[] = isCategory
      ? this.getCategoryOptions(false).filter(o => o.value !== 'uncategorized')
      : [
        { value: 'unassigned', label: i18n.t('bulk_actions.unassign') },
        ...this.accounts.map(account => ({
          value: account.id,
          label: account.name,
          icon: account.type === 'CREDIT' ? '💳' : '🏦',
        })),
      ];

    return bottomSheet({
      open: this.bulkTarget !== null,
      onDismiss: () => { this.bulkTarget = null; },
      content: html`
        <div class="m-sheet-title">
          ${isCategory ? i18n.t('bulk_actions.select_category') : i18n.t('bulk_actions.select_account')}
        </div>
        <div>
          ${options.map(option => html`
            <button
              class="x-cat-row ${option.indent ? 'child' : ''}"
              @click="${async () => {
                this.bulkTarget = null;
                if (isCategory) await this.bulkUpdateCategory(option.value);
                else await this.bulkUpdateAccount(option.value);
                this.exitBulkMode();
              }}">
              <span class="m-avatar small">${option.icon ?? ''}</span>
              <span style="flex: 1; min-width: 0">${option.label}</span>
            </button>
          `)}
        </div>
      `,
    });
  }

  // ---- transaction sheet ----

  private openTransactionSheet(tx: any) {
    this.sheetTx = tx;
    this.sheetCategoryQuery = '';
  }

  private renderTransactionSheet() {
    const tx = this.sheetTx;
    if (!tx) return nothing;

    const account = this.accounts.find(a => a.id === tx.accountId);
    const amount = Number(tx.amount) || 0;
    const query = this.sheetCategoryQuery.trim().toLowerCase();
    const options = this.getCategoryOptions(false)
      .filter(o => o.value !== 'uncategorized')
      .filter(o => !query || o.label.toLowerCase().includes(query));

    return bottomSheet({
      open: true,
      onDismiss: () => { this.sheetTx = null; },
      content: html`
        <div class="x-sheet-header">
          <span class="m-avatar">${this.categoryLabel(tx)?.icon || ''}</span>
          <div style="flex: 1; min-width: 0">
            <div class="x-sheet-desc">${tx.description}</div>
            <div class="x-sheet-meta">
              ${new Date(tx.date).toLocaleDateString(i18n.getLocale(), {
                weekday: 'short', day: 'numeric', month: 'long', year: 'numeric',
              })}
              ${account ? html` · ${account.type === 'CREDIT' ? '💳' : '🏦'} ${account.name}` : nothing}
            </div>
          </div>
          <span class="m-amount ${amount >= 0 ? 'positive' : ''}" style="font-size: 18px">
            ${amount < 0 ? '−' : '+'}${Math.abs(amount).toFixed(2)}
          </span>
        </div>

        <label class="m-field-with-icon">
          <input
            class="m-field filled"
            style="padding-left: 44px; padding-right: 14px"
            type="text"
            placeholder="${i18n.t('mobile.search_categories')}"
            .value="${this.sheetCategoryQuery}"
            @input="${(e: any) => { this.sheetCategoryQuery = e.target.value; }}" />
          <span class="m-icon" style="left: 14px; right: auto; font-size: 20px">search</span>
        </label>

        <div style="overflow-y: auto; min-height: 0">
          ${options.map(option => html`
            <button
              class="x-cat-row ${option.indent ? 'child' : ''} ${option.value === tx.categoryId ? 'selected' : ''}"
              @click="${async () => {
                this.sheetTx = null;
                await this.updateCategory(tx.id, option.value);
              }}">
              <span class="m-avatar small">${option.icon ?? ''}</span>
              <span style="flex: 1; min-width: 0">${option.label}</span>
              ${option.value === tx.categoryId ? icon('check', 20) : nothing}
            </button>
          `)}
        </div>

        <div style="display: flex; gap: 12px;">
          <button
            class="m-btn outlined"
            style="flex: 1"
            @click="${() => { this.sheetTx = null; this.openCreateRuleModal(tx); }}">
            ${icon('rule', 20)} ${i18n.t('mobile.rule')}
          </button>
          <button
            class="m-btn outlined"
            style="flex: 1"
            @click="${() => { this.sheetTx = null; this.openSplitModal(tx); }}">
            ${icon('call_split', 20)} ${i18n.t('mobile.split')}
          </button>
          <button class="m-btn" style="flex: 1" @click="${() => { this.sheetTx = null; }}">
            ${i18n.t('common.save')}
          </button>
        </div>
      `,
    });
  }

  // ---- search screen ----

  private renderSearchScreen() {
    const results = this.mobileTransactions;
    const total = results.reduce((sum, t) => sum + Math.abs(Number(t.amount) || 0), 0);

    return html`
      <div class="m-screen x-screen">
        <div class="m-appbar">
          <button
            class="m-icon-btn"
            @click="${() => { this.searchMode = false; this.filterText = ''; }}"
            aria-label="Back">
            ${icon('arrow_back', 24)}
          </button>
          <label class="m-field-with-icon" style="flex: 1">
            <input
              class="m-field filled"
              style="border-radius: 24px; padding-right: 44px"
              type="text"
              autofocus
              placeholder="${i18n.t('filters.search')}"
              .value="${this.filterText}"
              @input="${(e: any) => {
                this.filterText = e.target.value;
                this.mobileVisibleCount = MOBILE_PAGE_SIZE;
              }}" />
            ${this.filterText
              ? html`<button
                  class="m-icon-btn"
                  style="position: absolute; right: 2px; top: 50%; transform: translateY(-50%); width: 40px; height: 40px"
                  @click="${() => { this.filterText = ''; }}">
                  ${icon('close', 20)}
                </button>`
              : icon('search', 20)}
          </label>
        </div>

        ${this.filterText ? html`
          <div class="m-section-label" style="padding: 4px 0 8px">
            ${i18n.t('mobile.results_count', { count: results.length })} · ${this.money(total)}
          </div>
        ` : nothing}

        <div class="x-list">
          ${results.slice(0, this.mobileVisibleCount).map(tx => {
            const category = this.categoryLabel(tx);
            const amount = Number(tx.amount) || 0;
            return html`
              <div class="x-row" style="min-height: 60px" role="button" tabindex="0"
                @click="${() => this.openTransactionSheet(tx)}">
                <span class="m-avatar" style="width: 36px; height: 36px; border-radius: 18px">
                  ${category?.icon || ''}
                </span>
                <div class="x-row-main">
                  <div class="x-row-desc">${tx.description}</div>
                  <div class="x-row-cat">
                    ${new Date(tx.date).toLocaleDateString(i18n.getLocale(), {
                      weekday: 'short', day: 'numeric', month: 'short',
                    })}
                    ${category ? ` · ${category.name}` : ''}
                  </div>
                </div>
                <span class="m-amount ${amount >= 0 ? 'positive' : ''}">
                  ${amount < 0 ? '−' : '+'}${Math.abs(amount).toFixed(2)}
                </span>
              </div>
            `;
          })}
          ${this.mobileVisibleCount < results.length
            ? html`<div id="m-sentinel" style="height: 1px"></div>`
            : nothing}
        </div>

        ${this.renderTransactionSheet()}
        ${snackbar(this.snack)}
      </div>
    `;
  }

  // ---- sheets ----

  private renderMobilePeriodSheet() {
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
              class="m-filter-chip"
              style="${this.sheetMode === mode.value
                ? 'background: var(--md-sys-color-primary); color: var(--md-sys-color-on-primary); border-color: transparent'
                : ''}"
              @click="${() => { this.sheetMode = mode.value; }}">
              ${mode.label}
            </button>
          `)}
        </div>

        ${this.sheetMode === 'month' || this.sheetMode === 'year' ? html`
          <div style="display: flex; align-items: center; justify-content: space-between;">
            <button class="m-icon-btn" @click="${() => { this.sheetYear -= 1; }}">
              ${icon('chevron_left', 22)}
            </button>
            <span style="font: 500 16px/24px 'Roboto', sans-serif">${this.sheetYear}</span>
            <button
              class="m-icon-btn"
              ?disabled="${this.sheetYear >= now.getFullYear()}"
              @click="${() => { this.sheetYear += 1; }}">
              ${icon('chevron_right', 22)}
            </button>
          </div>
        ` : nothing}

        ${this.sheetMode === 'month' ? html`
          <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px;">
            ${Array.from({ length: 12 }, (_, i) => i + 1).map(m => {
              const name = new Date(this.sheetYear, m - 1, 1)
                .toLocaleString(i18n.getLocale(), { month: 'short' })
                .replace('.', '');
              const selected = this.sheetMonth === m;
              const future = this.sheetYear > now.getFullYear()
                || (this.sheetYear === now.getFullYear() && m > now.getMonth() + 1);
              return html`
                <button
                  style="height: 48px; border: none; border-radius: 12px; cursor: pointer;
                    background: ${selected ? 'var(--md-sys-color-primary)' : 'var(--md-sys-color-surface-container)'};
                    color: ${selected
                      ? 'var(--md-sys-color-on-primary)'
                      : future ? 'var(--md-sys-color-on-surface-variant)' : 'var(--md-sys-color-on-surface)'};
                    font: var(--md-sys-typescale-body-large)"
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
                @input="${(e: any) => { this.sheetStartDate = this.normalizeDateInput(e.target.value); }}" />
              ${icon('calendar_month', 20)}
            </label>
            <label class="m-field-with-icon" style="flex: 1">
              <input
                class="m-field"
                type="text"
                inputmode="numeric"
                placeholder="yyyy-mm-dd"
                .value="${this.sheetEndDate}"
                @input="${(e: any) => { this.sheetEndDate = this.normalizeDateInput(e.target.value); }}" />
              ${icon('calendar_month', 20)}
            </label>
          </div>
        ` : nothing}

        <button class="m-btn block" @click="${() => this.applyPeriodSheet()}">
          ${i18n.t('mobile.apply')}
        </button>
      `,
    });
  }

  private renderMobileFilterSheet() {
    // The count reflects the filters as edited, before the sheet is dismissed
    const count = this.mobileTransactions.length;

    return bottomSheet({
      open: this.showFilterSheet,
      onDismiss: () => { this.showFilterSheet = false; },
      content: html`
        <div class="m-sheet-title-row">
          <span class="m-sheet-title">${i18n.t('mobile.filters')}</span>
          <button
            class="m-link"
            @click="${() => {
              this.filterCategoryId = '';
              this.filterMinAmount = null;
              this.filterMaxAmount = null;
              this.filterDateFrom = '';
              this.filterDateTo = '';
              this.filterText = '';
              this.quickFilter = '';
            }}">
            ${i18n.t('mobile.clear_all')}
          </button>
        </div>

        <div class="m-field-group">
          <span class="m-section-label">${i18n.t('common.category')}</span>
          <filterable-select
            .value="${this.filterCategoryId}"
            .options="${[
              { value: '', label: i18n.t('filters.all_categories') },
              { value: 'uncategorized', label: i18n.t('common.uncategorized') },
              ...this.getCategoryOptions(false).filter(o => o.value !== 'uncategorized'),
            ]}"
            .placeholder="${i18n.t('filters.all_categories')}"
            @change="${(e: CustomEvent) => {
              this.filterCategoryId = e.detail.value;
              this.mobileVisibleCount = MOBILE_PAGE_SIZE;
            }}">
          </filterable-select>
        </div>

        <div class="m-field-group">
          <span class="m-section-label">${i18n.t('mobile.amount_range')}</span>
          <div style="display: flex; align-items: center; gap: 12px;">
            <input
              class="m-field"
              style="border-radius: 12px"
              type="number"
              inputmode="decimal"
              placeholder="${i18n.t('mobile.min')}"
              .value="${this.filterMinAmount ?? ''}"
              @input="${(e: any) => {
                this.filterMinAmount = e.target.value ? parseFloat(e.target.value) : null;
              }}" />
            <span style="color: var(--md-sys-color-on-surface-variant)">–</span>
            <input
              class="m-field"
              style="border-radius: 12px"
              type="number"
              inputmode="decimal"
              placeholder="${i18n.t('mobile.max')}"
              .value="${this.filterMaxAmount ?? ''}"
              @input="${(e: any) => {
                this.filterMaxAmount = e.target.value ? parseFloat(e.target.value) : null;
              }}" />
          </div>
        </div>

        <div class="m-field-group">
          <span class="m-section-label">${i18n.t('mobile.date_range')}</span>
          <div style="display: flex; align-items: center; gap: 12px;">
            <label class="m-field-with-icon" style="flex: 1">
              <input
                class="m-field"
                style="border-radius: 12px"
                type="text"
                inputmode="numeric"
                placeholder="yyyy-mm-dd"
                .value="${this.filterDateFrom}"
                @input="${(e: any) => { this.filterDateFrom = this.normalizeDateInput(e.target.value); }}" />
              ${icon('calendar_month', 20)}
            </label>
            <span style="color: var(--md-sys-color-on-surface-variant)">–</span>
            <label class="m-field-with-icon" style="flex: 1">
              <input
                class="m-field"
                style="border-radius: 12px"
                type="text"
                inputmode="numeric"
                placeholder="yyyy-mm-dd"
                .value="${this.filterDateTo}"
                @input="${(e: any) => { this.filterDateTo = this.normalizeDateInput(e.target.value); }}" />
              ${icon('calendar_month', 20)}
            </label>
          </div>
        </div>

        <div class="m-field-group">
          <span class="m-section-label">${i18n.t('mobile.account')}</span>
          <button
            class="m-field"
            style="border-radius: 12px; display: flex; align-items: center; justify-content: space-between; cursor: pointer"
            @click="${() => { this.showFilterSheet = false; this.showAccountSheet = true; }}">
            <span>${this.accountChipLabel()}</span>
            ${icon('expand_more', 20)}
          </button>
        </div>

        <button class="m-btn tall block" @click="${() => { this.showFilterSheet = false; }}">
          ${i18n.t('mobile.show_results', { count })}
        </button>
      `,
    });
  }

  private accountChipLabel(): string {
    const account = this.accounts.find(a => a.id === this.selectedAccountId);
    if (!account) return `🏦 ${i18n.t('reports.all_accounts')}`;
    return `${account.type === 'CREDIT' ? '💳' : '🏦'} ${account.name}`;
  }

  private renderMobileAccountSheet() {
    return bottomSheet({
      open: this.showAccountSheet,
      onDismiss: () => { this.showAccountSheet = false; },
      content: html`
        <div class="m-sheet-title">${i18n.t('reports.all_accounts')}</div>
        <div>
          ${this.getAccountOptions().map(option => html`
            <button
              class="x-cat-row ${option.value === this.selectedAccountId ? 'selected' : ''}"
              @click="${() => {
                this.showAccountSheet = false;
                if (option.value === this.selectedAccountId) return;
                this.selectedAccountId = option.value;
                this.mobileVisibleCount = MOBILE_PAGE_SIZE;
                this.loadData(false);
              }}">
              <span class="m-avatar small">${option.icon ?? ''}</span>
              <span style="flex: 1; min-width: 0">${option.label}</span>
              ${option.value === this.selectedAccountId ? icon('check', 20) : nothing}
            </button>
          `)}
        </div>
      `,
    });
  }

  private renderReconciliationSheet() {
    const totalBalance = Number.isFinite(this.totalBalance) ? this.totalBalance : null;
    const verified = Number.isFinite(this.verifiedBalance) ? this.verifiedBalance : null;
    const difference = totalBalance !== null && verified !== null ? verified - totalBalance : null;
    const balanced = difference !== null && Math.abs(difference) < 0.01;

    return bottomSheet({
      open: this.showReconciliationSheet,
      onDismiss: () => { this.showReconciliationSheet = false; },
      content: html`
        <div class="m-sheet-title-row">
          <span class="m-sheet-title">${i18n.t('expenses.reconciliation_status')}</span>
          <span class="m-pill ${balanced ? 'ok' : 'behind'}">
            ${balanced ? i18n.t('expenses.balanced') : i18n.t('expenses.review')}
          </span>
        </div>

        <div class="m-field-group">
          <span class="m-section-label">${i18n.t('expenses.verified_balance')}</span>
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="color: var(--md-sys-color-on-surface-variant)">${this.symbol}</span>
            <input
              class="m-field"
              type="number"
              step="0.01"
              .value="${verified ?? ''}"
              @change="${this.updateVerifiedBalance}" />
          </div>
        </div>

        <div>
          <div class="x-recon-row">
            <span class="m-row-value">
              ${this.isCredit ? i18n.t('expenses.amount_owed') : i18n.t('expenses.system_balance')}
            </span>
            <span
              class="m-amount"
              style="color: ${totalBalance === null
                ? 'var(--md-sys-color-on-surface-variant)'
                : totalBalance >= 0 ? 'var(--pf-positive)' : 'var(--md-sys-color-error)'}">
              ${totalBalance === null
                ? '—'
                : `${totalBalance >= 0 ? '+' : '−'}${this.money(totalBalance)}`}
            </span>
          </div>
          <div class="x-recon-row" style="border-bottom: none">
            <span class="m-row-value">${i18n.t('expenses.discrepancy')}</span>
            <span
              class="m-amount"
              style="color: ${difference === null
                ? 'var(--md-sys-color-on-surface-variant)'
                : balanced ? 'var(--pf-positive)' : 'var(--md-sys-color-error)'}">
              ${difference === null
                ? '—'
                : `${balanced ? '' : difference > 0 ? '+' : '−'}${this.money(difference)}`}
            </span>
          </div>
        </div>

        <div class="m-subtitle">${i18n.t('expenses.reconciliation_hint')}</div>
      `,
    });
  }

  private renderConfirmSheet() {
    return bottomSheet({
      open: this.pendingConfirm !== null,
      onDismiss: () => this.settleConfirm(false),
      content: html`
        <div class="m-subtitle" style="white-space: pre-line">${this.pendingConfirm?.message ?? ''}</div>
        <div style="display: flex; gap: 12px;">
          <button class="m-btn outlined" style="flex: 1" @click="${() => this.settleConfirm(false)}">
            ${i18n.t('common.cancel')}
          </button>
          <button class="m-btn" style="flex: 1" @click="${() => this.settleConfirm(true)}">
            ${this.pendingConfirm?.confirmLabel ?? i18n.t('common.save')}
          </button>
        </div>
      `,
    });
  }

  private renderMobile() {
    if (this.searchMode) {
      return html`
        ${this.renderSearchScreen()}
        ${this.renderConfirmSheet()}
        ${this.renderSharedModals()}
      `;
    }

    return html`
      <div class="m-screen x-screen">
        ${this.bulkMode ? this.renderBulkBar() : html`
          ${this.renderMobileHeader()}
          ${this.renderMobileSummary()}
          ${this.renderMobileChips()}
        `}

        <!-- Background refreshes show the bar without collapsing the layout -->
        ${!this.loading && this.balanceLoading ? html`<div class="m-progress-bar"></div>` : nothing}

        ${this.renderMobileList()}

        ${this.bulkMode ? this.renderBulkActions() : html`
          <button
            class="m-fab"
            title="${i18n.t('mobile.add_transaction')}"
            @click="${() => { this.showAddForm = true; }}">
            ${icon('add', 26)}
          </button>
        `}

        ${this.renderTransactionSheet()}
        ${this.renderMobilePeriodSheet()}
        ${this.renderMobileFilterSheet()}
        ${this.renderMobileAccountSheet()}
        ${this.renderReconciliationSheet()}
        ${this.renderBulkPickerSheet()}
        ${this.renderConfirmSheet()}
        ${snackbar(this.snack)}
      </div>

      ${this.renderSharedModals()}
    `;
  }

  /** Dialogs and wizards shared by both layouts. */
  private renderSharedModals() {
    return html`
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

      ${this.showAddForm && this.isMobile ? this.renderMobileAddSheet() : nothing}
    `;
  }

  /** Manual "Add transaction" as a sheet, replacing the desktop inline form. */
  private renderMobileAddSheet() {
    return bottomSheet({
      open: true,
      onDismiss: () => { this.showAddForm = false; },
      content: html`
        <div class="m-sheet-title">${i18n.t('expenses.add_manual_title')}</div>

        <div class="m-field-group">
          <span class="m-section-label">${i18n.t('common.date')}</span>
          <input
            class="m-field"
            type="date"
            .value="${this.newTransaction.date}"
            @input="${(e: any) => {
              this.newTransaction = { ...this.newTransaction, date: e.target.value };
            }}" />
        </div>

        <div class="m-field-group">
          <span class="m-section-label">${i18n.t('common.description')}</span>
          <input
            class="m-field"
            type="text"
            .value="${this.newTransaction.description}"
            @input="${(e: any) => {
              this.newTransaction = { ...this.newTransaction, description: e.target.value };
            }}"
            @blur="${this.handleDescriptionBlur}" />
        </div>

        <div class="m-field-group">
          <span class="m-section-label">${i18n.t('common.amount')}</span>
          <input
            class="m-field"
            type="number"
            inputmode="decimal"
            placeholder="-10.00"
            .value="${this.newTransaction.amount || ''}"
            @input="${(e: any) => {
              this.newTransaction = { ...this.newTransaction, amount: parseFloat(e.target.value) };
            }}" />
        </div>

        <div class="m-field-group">
          <span class="m-section-label">${i18n.t('common.category')}</span>
          <filterable-select
            .value="${this.newTransaction.categoryId || 'uncategorized'}"
            .options="${this.getCategoryOptions(true)}"
            .placeholder="${i18n.t('common.category')}"
            @change="${(e: CustomEvent) => {
              if (e.detail.value === 'new_category_inline') {
                this.showAddCategoryModal = true;
                return;
              }
              this.newTransaction = {
                ...this.newTransaction,
                categoryId: e.detail.value === 'uncategorized' ? '' : e.detail.value,
              };
            }}">
          </filterable-select>
        </div>

        <div class="m-field-group">
          <span class="m-section-label">${i18n.t('common.notes')}</span>
          <input
            class="m-field"
            type="text"
            .value="${this.newTransaction.notes || ''}"
            @input="${(e: any) => {
              this.newTransaction = { ...this.newTransaction, notes: e.target.value };
            }}" />
        </div>

        <div style="display: flex; gap: 12px;">
          <button class="m-btn outlined" style="flex: 1" @click="${() => { this.showAddForm = false; }}">
            ${i18n.t('common.cancel')}
          </button>
          <button class="m-btn" style="flex: 1" @click="${this.createTransaction}">
            ${i18n.t('common.save')}
          </button>
        </div>
      `,
    });
  }

  // ------------------------------------------------------------------
  // Desktop layout (> 600px)
  // ------------------------------------------------------------------

  /** The side column only earns its keep while the table still gets ~640px. */
  private get showSideColumn() {
    return contentWidth(this.viewportWidth) - 340 >= 640;
  }

  /** Below this the table sheds a few pixels per column and the expand unindents. */
  private get tightTable() {
    return this.viewportWidth < 1100;
  }

  private get tableColumns() {
    return this.tightTable
      ? '40px 92px minmax(140px, 1fr) minmax(132px, 196px) minmax(100px, 124px) 36px'
      : '40px 100px minmax(180px, 1fr) minmax(160px, 216px) minmax(112px, 132px) 40px';
  }

  /** `−€1,150.00` / `+€3,240.00`, with a real minus sign. */
  private signedMoney(value: number) {
    return `${value < 0 ? '−' : '+'}${this.money(value)}`;
  }

  /** Spend per category across the filtered set, ranked. Income is excluded. */
  private get filteredCategoryTotals() {
    const buckets = new Map<string, { icon: string; name: string; total: number; unknown: boolean }>();

    this.filteredTransactions.forEach(tx => {
      const amount = Number(tx.amount) || 0;
      if (amount >= 0) return;
      const category = this.categories.find(c => c.id === tx.categoryId);
      const key = category?.id ?? 'uncategorized';
      const bucket = buckets.get(key) ?? {
        icon: category?.icon || '',
        name: category?.name || i18n.t('common.uncategorized'),
        total: 0,
        unknown: !category,
      };
      bucket.total += Math.abs(amount);
      buckets.set(key, bucket);
    });

    return [...buckets.values()].sort((a, b) => b.total - a.total);
  }

  /** Rows a rule already matched, and how many distinct rules that involves. */
  private get pendingSuggestions() {
    const rows = this.transactions.filter(t => t._suggestion);
    const ruleIds = new Set(rows.map(t => t._suggestionRuleId).filter(Boolean));
    return { rows: rows.length, rules: ruleIds.size || (rows.length ? 1 : 0) };
  }

  /** Every popover on the screen closes on a click that isn't one of theirs. */
  private closeDesktopMenus() {
    this.showAccountMenu = false;
    this.showPeriodSheet = false;
    this.showFilterMenu = false;
    this.showPageSizeMenu = false;
    this.catCellFor = null;
    this.rowCatMenu = false;
  }

  private toggleDensity() {
    this.density = this.density === 'compact' ? 'comfortable' : 'compact';
    localStorage.setItem('priperfin_row_density', this.density);
  }

  /** Opens a row's inline expand, seeding the draft from the transaction. */
  private toggleRow(tx: any) {
    if (this.openRowId === tx.id) {
      this.openRowId = null;
      this.rowDraft = null;
      this.rowCatMenu = false;
      return;
    }
    this.openRowId = tx.id;
    this.rowCatMenu = false;
    this.rowDraft = {
      categoryId: tx.categoryId || 'uncategorized',
      date: new Date(tx.date).toISOString().split('T')[0],
      amount: (Number(tx.amount) || 0).toFixed(2),
      notes: tx.notes || '',
    };
  }

  /**
   * Writes only the fields the draft actually changed, so an untouched row is
   * never PATCHed and the imported-row confirmation only fires when it must.
   */
  private async saveOpenRow(tx: any) {
    const draft = this.rowDraft;
    if (!draft) return;

    const originalDate = new Date(tx.date).toISOString().split('T')[0];
    const amount = parseFloat(draft.amount);
    const changed: [string, any][] = [];

    if (draft.categoryId !== (tx.categoryId || 'uncategorized')) changed.push(['categoryId', draft.categoryId]);
    if (this.isValidIsoDate(draft.date) && draft.date !== originalDate) changed.push(['date', draft.date]);
    if (Number.isFinite(amount) && amount !== Number(tx.amount)) changed.push(['amount', amount]);
    if (draft.notes !== (tx.notes || '')) changed.push(['notes', draft.notes]);

    // An imported row carries the bank's own date, amount and description; the
    // old cell editor asked before touching those and so does this.
    const locked = changed.some(([f]) => f === 'date' || f === 'amount');
    if (tx.externalId && locked) {
      const proceed = await this.askConfirm(
        i18n.t('desktop.imported_edit_confirm'),
        i18n.t('common.save'),
      );
      if (!proceed) return;
    }

    for (const [field, value] of changed) {
      await this.saveField(tx.id, field, value);
    }

    this.openRowId = null;
    this.rowDraft = null;
    this.rowCatMenu = false;
  }

  /** Declines a rule's suggestion, remembering the rejection server-side. */
  private async rejectSuggestion(tx: any) {
    if (tx._suggestionConditionsJson) {
      try {
        await api.post('/rules/suggestions/reject-prompt', {
          conditionsJson: tx._suggestionConditionsJson,
          categoryId: tx._suggestion,
        });
      } catch (err) {
        console.error('Failed to reject suggestion:', err);
      }
    }
    this.transactions = this.transactions.map(t =>
      t.id === tx.id ? { ...t, _suggestion: null } : t);
  }

  private clearAllFilters() {
    this.filterCategoryId = '';
    this.filterMinAmount = null;
    this.filterMaxAmount = null;
    this.filterText = '';
    this.filterDateFrom = '';
    this.filterDateTo = '';
    this.currentPage = 1;
  }

  /** One chip per active filter, each removable on its own. */
  private get filterChips() {
    const chips: { label: string; clear: () => void }[] = [];

    if (this.filterCategoryId) {
      const category = this.categories.find(c => c.id === this.filterCategoryId);
      chips.push({
        label: this.filterCategoryId === 'uncategorized'
          ? i18n.t('common.uncategorized')
          : `${category?.icon ?? ''} ${category?.name ?? ''}`.trim(),
        clear: () => { this.filterCategoryId = ''; this.currentPage = 1; },
      });
    }

    if (this.filterMinAmount !== null || this.filterMaxAmount !== null) {
      const min = this.filterMinAmount !== null ? this.money(this.filterMinAmount, 0) : '';
      const max = this.filterMaxAmount !== null ? this.money(this.filterMaxAmount, 0) : '';
      chips.push({
        label: min && max ? `${min} – ${max}` : min ? `≥ ${min}` : `≤ ${max}`,
        clear: () => {
          this.filterMinAmount = null;
          this.filterMaxAmount = null;
          this.currentPage = 1;
        },
      });
    }

    if (this.filterDateFrom || this.filterDateTo) {
      chips.push({
        label: `${this.filterDateFrom || '…'} → ${this.filterDateTo || '…'}`,
        clear: () => {
          this.filterDateFrom = '';
          this.filterDateTo = '';
          this.currentPage = 1;
        },
      });
    }

    if (this.filterText) {
      chips.push({
        label: `"${this.filterText}"`,
        clear: () => { this.filterText = ''; this.currentPage = 1; },
      });
    }

    return chips;
  }

  private renderDesktop() {
    return html`
      <div class="d-screen" @click="${() => this.closeDesktopMenus()}">
        ${this.renderDesktopHeader()}
        ${this.renderDesktopStrip()}
        ${this.selectedTransactions.size > 0
          ? this.renderDesktopBulkRow()
          : this.renderDesktopFilterRow()}

        <div
          class="d-content"
          style="grid-template-columns: ${this.showSideColumn ? 'minmax(0, 1fr) 320px' : 'minmax(0, 1fr)'}">
          ${this.renderDesktopTable()}
          ${this.showSideColumn ? this.renderDesktopSide() : nothing}
        </div>

        ${this.renderSharedModals()}
        ${this.showAddForm ? this.renderDesktopAddModal() : nothing}
        ${this.transactionToDelete ? html`
          <div class="modal-overlay" @click="${() => this.transactionToDelete = null}">
            <div class="modal" @click="${(e: Event) => e.stopPropagation()}">
              <h3 style="margin-top: 0">${i18n.t('table.delete_transaction')}</h3>
              <p>${i18n.t('common.confirm_delete')}</p>
              <div class="modal-actions">
                <button @click="${() => this.transactionToDelete = null}">${i18n.t('common.cancel')}</button>
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
    const account = this.selectedAccount;

    return html`
      <div class="d-header">
        <h1>${i18n.t('nav.expenses')}</h1>

        <div class="dx-anchor" @click="${(e: Event) => e.stopPropagation()}">
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
            <div class="dx-pop">
              <div class="dx-pop-list">
                ${this.getAccountOptions().map(option => html`
                  <button
                    class="dx-pop-row ${option.value === this.selectedAccountId ? 'selected' : ''}"
                    @click="${() => {
                      this.showAccountMenu = false;
                      if (option.value === this.selectedAccountId) return;
                      this.selectedAccountId = option.value;
                      this.openRowId = null;
                      this.loadData(true);
                    }}">
                    <span class="d-emoji">${option.icon ?? ''}</span>
                    <span style="flex: 1; min-width: 0">${option.label}</span>
                    ${option.value === this.selectedAccountId ? icon('check', 18) : nothing}
                  </button>
                `)}
              </div>
            </div>
          ` : nothing}
        </div>

        <div class="dx-anchor" @click="${(e: Event) => e.stopPropagation()}">
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

        <div class="d-spacer"></div>

        <div class="d-search">
          ${icon('search', 20)}
          <input
            type="text"
            placeholder="${i18n.t('desktop.search_transactions')}"
            .value="${this.filterText}"
            @input="${(e: any) => { this.filterText = e.target.value; this.currentPage = 1; }}" />
        </div>

        <button
          class="d-icon-btn"
          title="${i18n.t('expenses.import_csv')}"
          @click="${() => { this.showWizard = true; }}">
          ${icon('upload_file', 20)}
        </button>
        <button
          class="d-icon-btn"
          title="${i18n.t('bank_sync.sync_all')}"
          ?disabled="${this.bankSyncing}"
          @click="${this.handleBankSync}">
          ${icon(this.bankSyncing ? 'sync_problem' : 'sync', 20)}
        </button>
        <button
          class="d-icon-btn"
          title="${i18n.t('desktop.row_density')}"
          @click="${() => this.toggleDensity()}">
          ${icon(this.density === 'compact' ? 'density_small' : 'density_medium', 20)}
        </button>

        <button class="d-btn" @click="${() => { this.showAddForm = true; }}">
          ${icon('add', 20)}
          <span>${i18n.t('mobile.add_transaction')}</span>
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
      <div class="dx-pop wide">
        <div class="dx-pop-title">${i18n.t('mobile.period')}</div>
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
          <div class="dx-year-row">
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
          <div class="dx-month-grid">
            ${Array.from({ length: 12 }, (_, i) => i + 1).map(m => {
              const name = new Date(this.sheetYear, m - 1, 1)
                .toLocaleString(i18n.getLocale(), { month: 'short' })
                .replace('.', '');
              const future = this.sheetYear > now.getFullYear()
                || (this.sheetYear === now.getFullYear() && m > now.getMonth() + 1);
              return html`
                <button
                  class="dx-month ${this.sheetMonth === m ? 'selected' : ''} ${future ? 'future' : ''}"
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
              type="text"
              inputmode="numeric"
              placeholder="yyyy-mm-dd"
              .value="${this.sheetStartDate}"
              @input="${(e: any) => { this.sheetStartDate = this.normalizeDateInput(e.target.value); }}" />
            <input
              class="d-input mono"
              type="text"
              inputmode="numeric"
              placeholder="yyyy-mm-dd"
              .value="${this.sheetEndDate}"
              @input="${(e: any) => { this.sheetEndDate = this.normalizeDateInput(e.target.value); }}" />
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
    const totalBalance = Number.isFinite(this.totalBalance) ? this.totalBalance : null;
    const verified = Number.isFinite(this.verifiedBalance) ? this.verifiedBalance : null;
    const difference = totalBalance !== null && verified !== null ? verified - totalBalance : null;
    const balanced = difference !== null && Math.abs(difference) < 0.01;
    const net = this.monthlyStats.income - this.monthlyStats.expense;
    const reviewCount = this.needsReviewTransactions.length;

    return html`
      <div class="d-strip">
        <div class="d-strip-cell">
          <span
            class="m-icon"
            style="font-size: 20px; color: ${difference === null
              ? 'var(--md-sys-color-outline)'
              : balanced
                ? 'var(--pf-positive)'
                : 'var(--md-sys-color-error)'}">
            ${difference === null ? 'help' : balanced ? 'check_circle' : 'warning'}
          </span>
          <div>
            <div class="d-strip-label">${i18n.t('desktop.reconciled')}</div>
            <div class="d-strip-value text">
              ${difference === null
                ? '—'
                : balanced
                  ? i18n.t('desktop.no_discrepancy')
                  : i18n.t('desktop.off_by', { amount: this.money(difference) })}
            </div>
          </div>
        </div>

        <div class="d-strip-divider"></div>

        <div class="d-strip-cell">
          <div>
            <div class="d-strip-label">${i18n.t('desktop.verified_balance')}</div>
            <div class="d-strip-edit">
              <span class="d-strip-prefix">${this.symbol}</span>
              <input
                class="d-strip-input"
                style="width: 96px"
                type="number"
                step="0.01"
                .value="${verified ?? ''}"
                @change="${this.updateVerifiedBalance}" />
            </div>
          </div>
        </div>

        <div class="d-strip-cell">
          <div>
            <div class="d-strip-label">
              ${this.isCredit ? i18n.t('expenses.amount_owed') : i18n.t('desktop.system_balance')}
            </div>
            <div class="d-strip-value ${totalBalance === null ? 'muted' : ''}">
              ${totalBalance === null ? '—' : this.signedMoney(totalBalance)}
            </div>
          </div>
        </div>

        <div class="d-strip-divider"></div>

        <div class="d-strip-cell">
          <div>
            <div class="d-strip-label">${i18n.t('common.income')}</div>
            <div class="d-strip-value positive">+${this.money(this.monthlyStats.income)}</div>
          </div>
        </div>

        <div class="d-strip-cell">
          <div>
            <div class="d-strip-label">${i18n.t('common.expenses')}</div>
            <div class="d-strip-value negative">−${this.money(this.monthlyStats.expense)}</div>
          </div>
        </div>

        <div class="d-strip-cell">
          <div>
            <div class="d-strip-label">${i18n.t('expenses.net')}</div>
            <div class="d-strip-value ${net >= 0 ? 'positive' : 'negative'}">
              ${this.signedMoney(net)}
            </div>
          </div>
        </div>

        <div class="d-spacer"></div>

        ${reviewCount > 0 ? html`
          <div class="d-strip-cell tight">
            ${statusPill({
              kind: 'attention',
              glyph: 'help',
              label: i18n.t('desktop.uncategorised_count', { count: reviewCount }),
              onClick: () => {
                this.filterCategoryId = this.filterCategoryId === 'uncategorized' ? '' : 'uncategorized';
                this.currentPage = 1;
              },
            })}
          </div>
        ` : nothing}
      </div>
    `;
  }

  private renderDesktopFilterRow() {
    const chips = this.filterChips;

    return html`
      <div class="d-chip-row">
        ${icon('filter_list', 18)}
        ${chips.map(chip => html`
          <button class="d-chip" @click="${chip.clear}">
            <span>${chip.label}</span>
            ${icon('close', 16)}
          </button>
        `)}

        <div class="dx-anchor" @click="${(e: Event) => e.stopPropagation()}">
          <button
            class="d-chip outlined"
            @click="${() => {
              const open = this.showFilterMenu;
              this.closeDesktopMenus();
              this.showFilterMenu = !open;
            }}">
            ${icon('add', 16)}
            <span>${i18n.t('desktop.add_filter')}</span>
          </button>
          ${this.showFilterMenu ? this.renderFilterPopover() : nothing}
        </div>

        ${chips.length > 0 ? html`
          <button class="d-link" style="padding: 0 8px" @click="${() => this.clearAllFilters()}">
            ${i18n.t('mobile.clear_all')}
          </button>
        ` : nothing}

        <div class="d-spacer"></div>
        <span class="d-count">
          ${i18n.t('desktop.match_count', {
            shown: this.filteredTransactions.length,
            total: this.transactions.length,
          })}
        </span>
      </div>
    `;
  }

  private renderFilterPopover() {
    return html`
      <div class="dx-pop wide" style="padding: 12px">
        <div class="d-fields" style="grid-template-columns: repeat(2, minmax(120px, 1fr))">
          ${formField(i18n.t('common.category'), html`
            <select
              class="d-input"
              .value="${this.filterCategoryId}"
              @change="${(e: any) => { this.filterCategoryId = e.target.value; this.currentPage = 1; }}">
              <option value="">${i18n.t('filters.all_categories')}</option>
              <option value="uncategorized">${i18n.t('common.uncategorized')}</option>
              ${this.getCategoryOptions(false)
                .filter(option => option.value !== 'uncategorized')
                .map(option => html`
                  <option value="${option.value}" ?selected="${option.value === this.filterCategoryId}">
                    ${option.indent ? '— ' : ''}${option.icon ?? ''} ${option.label}
                  </option>
                `)}
            </select>
          `, true)}

          ${formField(i18n.t('rules.min'), html`
            <input
              class="d-input amount"
              type="number"
              .value="${this.filterMinAmount ?? ''}"
              @input="${(e: any) => {
                this.filterMinAmount = e.target.value ? parseFloat(e.target.value) : null;
                this.currentPage = 1;
              }}" />
          `)}
          ${formField(i18n.t('rules.max'), html`
            <input
              class="d-input amount"
              type="number"
              .value="${this.filterMaxAmount ?? ''}"
              @input="${(e: any) => {
                this.filterMaxAmount = e.target.value ? parseFloat(e.target.value) : null;
                this.currentPage = 1;
              }}" />
          `)}

          ${formField(i18n.t('filters.from_date'), html`
            <input
              class="d-input mono"
              type="text"
              inputmode="numeric"
              placeholder="yyyy-mm-dd"
              .value="${this.filterDateFrom}"
              @input="${(e: any) => {
                this.filterDateFrom = this.normalizeDateInput(e.target.value);
                this.currentPage = 1;
              }}" />
          `)}
          ${formField(i18n.t('filters.to_date'), html`
            <input
              class="d-input mono"
              type="text"
              inputmode="numeric"
              placeholder="yyyy-mm-dd"
              .value="${this.filterDateTo}"
              @input="${(e: any) => {
                this.filterDateTo = this.normalizeDateInput(e.target.value);
                this.currentPage = 1;
              }}" />
          `)}
        </div>

        <div style="display: flex; justify-content: flex-end; gap: 8px; margin-top: 12px">
          <button class="d-btn-text" @click="${() => this.clearAllFilters()}">
            ${i18n.t('filters.clear')}
          </button>
          <button class="d-btn small plain" @click="${() => { this.showFilterMenu = false; }}">
            ${i18n.t('mobile.apply')}
          </button>
        </div>
      </div>
    `;
  }

  /** Replaces the filter row while rows are selected, so nothing shifts down. */
  private renderDesktopBulkRow() {
    return html`
      <div class="d-chip-row">
        ${icon('checklist', 18)}
        <span class="d-strip-value text">
          ${i18n.t('mobile.selected_count', { count: this.selectedTransactions.size })}
        </span>

        <div class="dx-anchor" @click="${(e: Event) => e.stopPropagation()}">
          <filterable-select
            .value=""
            .options="${[
              { value: '', label: i18n.t('bulk_actions.select_category') },
              ...this.getCategoryOptions(false).filter(option => option.value !== 'uncategorized'),
            ]}"
            .placeholder="${i18n.t('bulk_actions.select_category')}"
            .compact="${true}"
            @change="${(e: CustomEvent) => this.bulkUpdateCategory(e.detail.value)}"
            width="220px">
          </filterable-select>
        </div>

        <div class="dx-anchor" @click="${(e: Event) => e.stopPropagation()}">
          <filterable-select
            .value=""
            .options="${[
              { value: '', label: i18n.t('bulk_actions.select_account') },
              { value: 'unassigned', label: i18n.t('bulk_actions.unassign') },
              ...this.accounts.map(account => ({
                value: account.id,
                label: account.name,
                icon: account.type === 'CREDIT' ? '💳' : '🏦',
              })),
            ]}"
            .placeholder="${i18n.t('bulk_actions.select_account')}"
            .compact="${true}"
            @change="${(e: CustomEvent) => this.bulkUpdateAccount(e.detail.value)}"
            width="220px">
          </filterable-select>
        </div>

        <button class="d-btn-text destructive" @click="${this.deleteSelected}">
          ${icon('delete', 18)}
          <span>${i18n.t('bulk_actions.delete_selected')}</span>
        </button>

        <div class="d-spacer"></div>
        <button class="d-link" @click="${() => { this.selectedTransactions = new Set(); }}">
          ${i18n.t('common.cancel')}
        </button>
      </div>
    `;
  }

  private renderDesktopTable() {
    const rows = this.pagedTransactions;
    const allSelected = rows.length > 0 && rows.every(tx => this.selectedTransactions.has(tx.id));
    const sortGlyph = this.sortDirection === 'asc' ? 'arrow_upward' : 'arrow_downward';
    const header = (label: string, sortField: string, right = false) => html`
      <button
        class="d-th ${this.sortField === sortField ? 'sorted' : ''} ${right ? 'right' : ''}"
        @click="${() => this.toggleSort(sortField)}">
        <span>${label}</span>
        ${this.sortField === sortField ? icon(sortGlyph, 16) : nothing}
      </button>
    `;

    return html`
      <div class="d-panel">
        <div style="flex: 1; min-height: 0; overflow-y: auto; overflow-x: hidden">
          <div class="d-thead" style="grid-template-columns: ${this.tableColumns}">
            <div class="d-check-cell">
              <button
                class="d-checkbox"
                role="checkbox"
                aria-checked="${allSelected}"
                aria-label="${i18n.t('mobile.select_all')}"
                @click="${(e: Event) => {
                  e.stopPropagation();
                  this.selectedTransactions = allSelected
                    ? new Set()
                    : new Set(rows.map(tx => tx.id));
                }}">
                ${allSelected ? icon('check', 14) : nothing}
              </button>
            </div>
            ${header(i18n.t('common.date'), 'date')}
            ${header(i18n.t('common.description'), 'description')}
            ${header(i18n.t('common.category'), 'categoryId')}
            ${header(i18n.t('common.amount'), 'amount', true)}
            <div></div>
          </div>

          ${this.loading
            ? this.renderDesktopSkeletons()
            : rows.length === 0
              ? html`
                <div class="d-empty-row">
                  ${i18n.t('mobile.no_transactions_for', { period: this.periodLabel() })}
                </div>
              `
              : rows.map((tx, index) => this.renderDesktopRow(tx, index))}
        </div>

        ${this.renderDesktopTableFooter()}
      </div>
    `;
  }

  private renderDesktopSkeletons() {
    const height = this.density === 'compact' ? 36 : 44;
    return html`
      ${Array.from({ length: 10 }, (_, i) => html`
        <div
          style="display: flex; align-items: center; gap: 16px; height: ${height}px; padding: 0 16px;
            border-bottom: 1px solid var(--md-sys-color-surface-container-high)"
          aria-hidden="true">
          ${skeleton('84px', '12px', i % 2 === 1)}
          ${skeleton('40%', '12px', i % 2 === 1)}
          ${skeleton('120px', '12px', i % 2 === 1)}
          <div style="flex: 1"></div>
          ${skeleton('88px', '12px', i % 2 === 1)}
        </div>
      `)}
    `;
  }

  private renderDesktopRow(tx: any, index: number) {
    const open = this.openRowId === tx.id;
    const selected = this.selectedTransactions.has(tx.id);
    const amount = Number(tx.amount) || 0;
    const height = this.density === 'compact' ? 36 : 44;
    const rowClass = open ? 'open' : selected ? 'selected' : index % 2 === 1 ? 'zebra' : '';

    return html`
      <div>
        <div
          class="d-row ${rowClass}"
          style="grid-template-columns: ${this.tableColumns}; height: ${height}px"
          role="button"
          tabindex="0"
          @click="${() => this.toggleRow(tx)}">
          <div class="d-check-cell">
            <button
              class="d-checkbox"
              role="checkbox"
              aria-checked="${selected}"
              aria-label="${i18n.t('mobile.select_mode')}"
              @click="${(e: Event) => { e.stopPropagation(); this.toggleSelection(tx.id); }}">
              ${selected ? icon('check', 14) : nothing}
            </button>
          </div>

          <div class="d-row-date">${new Date(tx.date).toISOString().split('T')[0]}</div>

          <div style="min-width: 0; padding-right: 16px">
            <div class="d-row-desc" title="${tx.description}">${tx.description}</div>
          </div>

          ${this.renderDesktopCategoryCell(tx)}

          <div class="d-row-amount ${amount >= 0 ? 'positive' : ''}">${this.signedMoney(amount)}</div>

          <div class="d-row-chevron">${icon(open ? 'expand_less' : 'expand_more', 20)}</div>
        </div>

        ${open ? this.renderDesktopRowExpand(tx) : nothing}
      </div>
    `;
  }

  /** Set / suggested / empty, and a one-click category picker on top of it. */
  private renderDesktopCategoryCell(tx: any) {
    const category = this.categories.find(c => c.id === tx.categoryId);
    const suggestion = tx._suggestion
      ? this.categories.find(c => c.id === tx._suggestion)
      : null;
    const editing = this.catCellFor === tx.id;

    return html`
      <button
        class="dx-cat-cell"
        title="${i18n.t('desktop.change_category')}"
        @click="${(e: Event) => {
          e.stopPropagation();
          const wasOpen = editing;
          this.closeDesktopMenus();
          this.catCellFor = wasOpen ? null : tx.id;
          this.rowCatQuery = '';
        }}">
        ${editing
          ? html`
            ${this.renderCategoryMenu(async id => {
              this.catCellFor = null;
              await this.updateCategory(tx.id, id);
            })}
            <span style="display: flex; align-items: center; gap: 8px; color: var(--md-sys-color-primary)">
              ${icon('edit', 18)}
              <span style="font: 400 14px/18px 'Roboto', sans-serif">${i18n.t('desktop.choose_category')}</span>
            </span>
          `
          : tx.splits && tx.splits.length > 0
            ? html`
              <span class="d-emoji">🔀</span>
              <span class="dx-cat-name">${i18n.t('mobile.split')} (${tx.splits.length})</span>
            `
            : category
              ? html`
                <span class="d-emoji">${category.icon || ''}</span>
                <span class="dx-cat-name">${category.name}</span>
              `
              : suggestion
                ? html`
                  <span class="dx-suggestion">
                    <span>${suggestion.name}?</span>
                    <button
                      class="dx-accept"
                      title="${i18n.t('mobile.accept')}"
                      @click="${(e: Event) => {
                        e.stopPropagation();
                        this.updateCategory(tx.id, tx._suggestion);
                      }}">
                      ${icon('check_circle', 16)}
                    </button>
                    <button
                      class="dx-reject"
                      title="${i18n.t('rules.reject')}"
                      @click="${(e: Event) => { e.stopPropagation(); this.rejectSuggestion(tx); }}">
                      ${icon('cancel', 16)}
                    </button>
                  </span>
                `
                : html`<span class="dx-cat-empty">${i18n.t('common.uncategorized')}</span>`}
      </button>
    `;
  }

  /** Searchable category list, shared by the row cell and the row expand. */
  private renderCategoryMenu(onPick: (categoryId: string) => void) {
    const query = this.rowCatQuery.trim().toLowerCase();
    const options = this.getCategoryOptions(false)
      .filter(option => !query || String(option.label).toLowerCase().includes(query));

    return html`
      <div class="dx-pop" style="min-width: 224px" @click="${(e: Event) => e.stopPropagation()}">
        <div class="dx-pop-search">
          ${icon('search', 18)}
          <input
            type="text"
            placeholder="${i18n.t('mobile.search_categories')}"
            .value="${this.rowCatQuery}"
            @input="${(e: any) => { this.rowCatQuery = e.target.value; }}" />
        </div>
        <div class="dx-pop-list">
          ${options.map(option => html`
            <button
              class="dx-pop-row ${option.indent ? 'child' : ''}"
              @click="${(e: Event) => { e.stopPropagation(); onPick(option.value); }}">
              <span class="d-emoji">${option.icon ?? ''}</span>
              <span>${option.label}</span>
            </button>
          `)}
        </div>
      </div>
    `;
  }

  private renderDesktopRowExpand(tx: any) {
    const draft = this.rowDraft;
    if (!draft) return nothing;

    const category = this.categories.find(c => c.id === draft.categoryId);
    const account = this.accounts.find(a => a.id === tx.accountId);
    const provenance = tx.externalId
      ? i18n.t('desktop.imported_from', {
          source: `${account?.name ?? i18n.t('bank_sync.title')} · ${tx.description}`,
        })
      : i18n.t('desktop.manual_entry');

    return html`
      <div
        class="d-expand"
        style="padding: 16px 8px 18px ${this.tightTable ? 20 : 148}px"
        @click="${(e: Event) => e.stopPropagation()}">
        <div
          class="d-fields"
          style="grid-template-columns: minmax(160px, 216px) minmax(110px, 132px) minmax(110px, 132px) minmax(140px, 1fr)">
          ${formField(i18n.t('common.category'), html`
            <div class="dx-anchor" style="display: block">
              <button
                class="d-select primary"
                @click="${(e: Event) => {
                  e.stopPropagation();
                  this.rowCatMenu = !this.rowCatMenu;
                  this.rowCatQuery = '';
                }}">
                <span class="d-emoji">${category?.icon ?? ''}</span>
                <span class="d-select-value ${category ? '' : 'muted'}">
                  ${category?.name ?? i18n.t('common.uncategorized')}
                </span>
                ${icon('expand_more', 20)}
              </button>
              ${this.rowCatMenu
                ? this.renderCategoryMenu(id => {
                    this.rowDraft = { ...draft, categoryId: id };
                    this.rowCatMenu = false;
                  })
                : nothing}
            </div>
          `)}

          ${formField(i18n.t('common.date'), html`
            <input
              class="d-input mono"
              type="text"
              inputmode="numeric"
              placeholder="yyyy-mm-dd"
              .value="${draft.date}"
              @input="${(e: any) => {
                this.rowDraft = { ...draft, date: this.normalizeDateInput(e.target.value) };
              }}" />
          `)}

          ${formField(i18n.t('common.amount'), html`
            <input
              class="d-input amount"
              type="number"
              step="0.01"
              .value="${draft.amount}"
              @input="${(e: any) => { this.rowDraft = { ...draft, amount: e.target.value }; }}" />
          `)}

          ${formField(i18n.t('common.notes'), html`
            <input
              class="d-input"
              type="text"
              placeholder="${i18n.t('common.notes')}"
              .value="${draft.notes}"
              @input="${(e: any) => { this.rowDraft = { ...draft, notes: e.target.value }; }}" />
          `)}
        </div>

        <div class="d-actions">
          <button class="d-btn small plain" @click="${() => this.saveOpenRow(tx)}">
            ${i18n.t('common.save')}
          </button>
          <button class="d-btn-text" @click="${() => this.toggleRow(tx)}">
            ${i18n.t('common.cancel')}
          </button>

          <div class="d-actions-divider"></div>

          <button class="d-btn-tonal" @click="${() => this.openCreateRuleModal(tx)}">
            ${icon('rule', 18)}
            <span>${i18n.t('desktop.create_rule_from_this')}</span>
          </button>
          <button
            class="d-icon-btn small"
            title="${i18n.t('table.split_transaction')}"
            @click="${() => this.openSplitModal(tx)}">
            ${icon('call_split', 18)}
          </button>
          <button
            class="d-icon-btn small"
            title="${i18n.t('table.set_balance_from_here')}"
            @click="${() => this.setStartingBalanceFromTransaction(tx)}">
            ${icon('anchor', 18)}
          </button>

          <div class="d-spacer"></div>

          <button class="d-btn-text destructive" @click="${() => this.deleteTransaction(tx.id)}">
            ${icon('delete', 18)}
            <span>${i18n.t('common.delete')}</span>
          </button>
        </div>

        ${footnote(tx.externalId ? 'lock' : 'info', provenance)}
      </div>
    `;
  }

  private renderDesktopTableFooter() {
    const total = this.filteredTransactions.length;
    const from = total === 0 ? 0 : (this.currentPage - 1) * this.pageSize + 1;
    const to = Math.min(this.currentPage * this.pageSize, total);

    return html`
      <div class="d-tfoot">
        <span class="d-tfoot-label">${i18n.t('table.rows_per_page')}</span>

        <div class="dx-anchor" @click="${(e: Event) => e.stopPropagation()}">
          <button
            class="d-pill-select"
            @click="${() => {
              const open = this.showPageSizeMenu;
              this.closeDesktopMenus();
              this.showPageSizeMenu = !open;
            }}">
            <span>${this.pageSize}</span>
            ${icon('expand_more', 16)}
          </button>
          ${this.showPageSizeMenu ? html`
            <div class="dx-pop" style="bottom: calc(100% + 6px); top: auto; min-width: 140px">
              ${this.getPageSizeOptions().map(size => html`
                <button
                  class="dx-pop-row ${size === this.pageSize ? 'selected' : ''}"
                  @click="${() => {
                    this.pageSize = size;
                    this.currentPage = 1;
                    this.showPageSizeMenu = false;
                  }}">
                  <span>${size}${size === total ? ` (${i18n.t('common.total')})` : ''}</span>
                </button>
              `)}
            </div>
          ` : nothing}
        </div>

        <div class="d-spacer"></div>

        <span class="d-tfoot-label">${i18n.t('desktop.range', { from, to, total })}</span>

        <button
          class="d-icon-btn small"
          ?disabled="${this.currentPage === 1}"
          aria-label="${i18n.t('mobile.prev_period')}"
          @click="${() => { this.currentPage -= 1; this.openRowId = null; }}">
          ${icon('chevron_left', 20)}
        </button>
        <button
          class="d-icon-btn small"
          ?disabled="${to >= total}"
          aria-label="${i18n.t('mobile.next_period')}"
          @click="${() => { this.currentPage += 1; this.openRowId = null; }}">
          ${icon('chevron_right', 20)}
        </button>
      </div>
    `;
  }

  private renderDesktopSide() {
    const totals = this.filteredCategoryTotals;
    const sum = totals.reduce((acc, entry) => acc + entry.total, 0);
    const suggestions = this.pendingSuggestions;

    return html`
      <div style="display: flex; flex-direction: column; gap: 12px; min-height: 0">
        <div class="d-panel pad grow">
          <div class="d-panel-head">
            <span class="d-panel-title small">${i18n.t('desktop.where_it_went')}</span>
            <div class="d-spacer"></div>
            <span class="d-panel-caption">${i18n.t('desktop.filtered_set')}</span>
          </div>
          <div class="d-panel-caption">
            ${i18n.t(
              totals.length === 1 ? 'desktop.across_category_one' : 'desktop.across_categories',
              { amount: this.money(sum), count: totals.length })}
          </div>

          <div class="d-panel-body stack">
            ${totals.length === 0
              ? html`<div class="d-panel-caption">${i18n.t('reports.no_data')}</div>`
              : totals.map(entry => {
                  // One figure drives both the bar and its label.
                  const share = sum > 0 ? (entry.total / sum) * 100 : 0;
                  return rankedBar({
                    emoji: entry.icon,
                    name: entry.name,
                    amount: this.money(entry.total),
                    percent: share,
                    share: `${Math.round(share)}%`,
                    color: entry.unknown
                      ? 'var(--md-sys-color-outline)'
                      : 'var(--md-sys-color-primary)',
                  });
                })}
          </div>
        </div>

        ${suggestions.rows > 0 ? html`
          <div class="d-nudge">
            <div class="d-nudge-head">
              ${icon('auto_awesome', 20)}
              <span>${i18n.t(
                suggestions.rules === 1 ? 'desktop.rule_ready_one' : 'desktop.rules_ready',
                { count: suggestions.rules })}</span>
            </div>
            <div class="d-nudge-body">
              ${i18n.t('desktop.rules_ready_body', {
                rows: suggestions.rows,
                total: this.transactions.length,
              })}
            </div>
            <button class="d-btn tiny plain" @click="${() => this.navigateToRules()}">
              ${i18n.t('desktop.review_rules')}
            </button>
          </div>
        ` : nothing}
      </div>
    `;
  }

  private navigateToRules() {
    const basePath = getAppBasePath(document.baseURI);
    window.location.href = new URL(`${basePath}rules`, window.location.origin).href;
  }

  /** The manual add form, as a dialog rather than a card that shoves the table down. */
  private renderDesktopAddModal() {
    const draft = this.newTransaction;

    return html`
      <div class="modal-overlay" @click="${() => { this.showAddForm = false; }}">
        <div
          class="modal"
          style="max-width: 640px"
          @click="${(e: Event) => e.stopPropagation()}">
          <h3 style="margin-top: 0">${i18n.t('expenses.add_manual_title')}</h3>

          <div class="d-screen" style="display: block; height: auto; padding: 0; overflow: visible">
            <div class="d-fields">
              ${formField(i18n.t('common.date'), html`
                <input
                  class="d-input mono"
                  type="date"
                  .value="${draft.date}"
                  @input="${(e: any) => { this.newTransaction = { ...draft, date: e.target.value }; }}" />
              `)}
              ${formField(i18n.t('common.amount'), html`
                <input
                  class="d-input amount"
                  type="number"
                  step="0.01"
                  placeholder="-10.00"
                  .value="${draft.amount || ''}"
                  @input="${(e: any) => {
                    this.newTransaction = { ...draft, amount: parseFloat(e.target.value) };
                  }}" />
              `)}
              ${formField(i18n.t('common.description'), html`
                <input
                  class="d-input"
                  type="text"
                  .value="${draft.description}"
                  @input="${(e: any) => {
                    this.newTransaction = { ...draft, description: e.target.value };
                  }}"
                  @blur="${this.handleDescriptionBlur}" />
              `, true)}
              ${formField(i18n.t('common.category'), html`
                <filterable-select
                  .value="${draft.categoryId || 'uncategorized'}"
                  .options="${this.getCategoryOptions(true)}"
                  .placeholder="${i18n.t('common.category')}"
                  @change="${(e: CustomEvent) => {
                    if (e.detail.value === 'new_category_inline') {
                      this.showAddCategoryModal = true;
                      return;
                    }
                    this.newTransaction = {
                      ...draft,
                      categoryId: e.detail.value === 'uncategorized' ? '' : e.detail.value,
                    };
                  }}">
                </filterable-select>
              `)}
              ${this.isCredit && this.costObjects.length > 0
                ? formField(i18n.t('cost_objects.funding_source'), html`
                  <filterable-select
                    .value="${draft.costObjectId || ''}"
                    .options="${this.getCostObjectOptions()}"
                    .placeholder="${i18n.t('cost_objects.funding_source')}"
                    @change="${(e: CustomEvent) => {
                      this.newTransaction = { ...draft, costObjectId: e.detail.value };
                    }}">
                  </filterable-select>
                `)
                : nothing}
              ${formField(i18n.t('common.notes'), html`
                <input
                  class="d-input"
                  type="text"
                  .value="${draft.notes || ''}"
                  @input="${(e: any) => { this.newTransaction = { ...draft, notes: e.target.value }; }}" />
              `, true)}
            </div>

            <div class="d-actions">
              <div class="d-spacer"></div>
              <button class="d-btn-text" @click="${() => { this.showAddForm = false; }}">
                ${i18n.t('common.cancel')}
              </button>
              <button class="d-btn small plain" @click="${this.createTransaction}">
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
