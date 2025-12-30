import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { api, getApiBaseUrl } from '../api/client';
import { i18n } from '../i18n/i18n';

import 'emoji-picker-element';

@customElement('view-settings')
export class ViewSettings extends LitElement {
    @state() categories: any[] = [];
    @state() accounts: any[] = [];
    @state() loading = false;
    @state() showAddForm = false;
    @state() editModeId: string | null = null;
    @state() categoryToDelete: string | null = null;
    @state() categoryForm: { name: string, icon: string, color: string, budget: number | null, type: string, parentId: string } = { name: '', icon: '', color: '#000000', budget: null, type: 'EXPENSE', parentId: '' };
    @state() showEmojiPicker = false;
    @state() currency = 'USD';
    @state() backupLoading = false;
    @state() restoreLoading = false;
    @state() encryptionKey = '';
    @state() decryptionKey = '';

    // Account management
    @state() showAccountForm = false;
    @state() editAccountId: string | null = null;
    @state() accountForm = { name: '', initialBalance: 0, type: 'DEBIT' as 'DEBIT' | 'CREDIT' };
    @state() accountToDelete: string | null = null;

    // Cost Objects management
    @state() costObjects: any[] = [];
    @state() showCostObjectForm = false;
    @state() editCostObjectId: string | null = null;
    @state() costObjectForm = { name: '', icon: '', color: '#6366f1' };
    @state() costObjectToDelete: string | null = null;
    @state() showCostObjectEmojiPicker = false;

    static styles = css`
    :host { display: block; }
    
    .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
    h1 { font: var(--md-sys-typescale-headline-medium); color: var(--md-sys-color-on-surface); margin: 0; }
    
    .section-title { font: var(--md-sys-typescale-title-large); margin-bottom: 16px; color: var(--md-sys-color-on-surface); margin-top: 32px; }
    
    .settings-group { 
        background: var(--md-sys-color-surface-container-low); 
        padding: 24px; 
        border-radius: var(--md-sys-shape-corner-medium); 
        margin-bottom: 24px; 
        box-shadow: 0 1px 3px 0 rgba(0,0,0,0.12), 0 1px 2px 0 rgba(0,0,0,0.24); 
    }
    
    /* Form Elements */
    .form-group { margin-bottom: 16px; }
    label { display: block; margin-bottom: 8px; font: var(--md-sys-typescale-label-medium); color: var(--md-sys-color-on-surface-variant); }
    input, select { 
        height: 40px;
        padding: 0 16px; 
        border: 1px solid var(--md-sys-color-outline); 
        border-radius: 4px; 
        display: block; 
        width: 100%; 
        box-sizing: border-box;
        background: transparent;
        color: var(--md-sys-color-on-surface);
        font: var(--md-sys-typescale-body-large);
        transition: border-color 0.2s;
    }
    input:focus, select:focus {
        border-color: var(--md-sys-color-primary);
        outline: 2px solid var(--md-sys-color-primary);
    }

    select option {
        background-color: var(--md-sys-color-surface);
        color: var(--md-sys-color-on-surface);
    }

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
        transition: background-image 0.2s, box-shadow 0.2s, background-color 0.2s;
        background: var(--md-sys-color-secondary-container); /* default/secondary-ish */
        color: var(--md-sys-color-on-secondary-container);
    }
    button:hover {
        box-shadow: 0 1px 2px rgba(0,0,0,0.12);
        background-image: linear-gradient(rgba(29, 25, 43, 0.08), rgba(29, 25, 43, 0.08));
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
    }
    
    .form-card { 
        background: var(--md-sys-color-surface-container); 
        padding: 24px; 
        border-radius: var(--md-sys-shape-corner-medium); 
        margin-bottom: 24px; 
        border: 1px solid var(--md-sys-color-outline-variant);
    }
    .form-card h3 { margin-top: 0; font: var(--md-sys-typescale-title-medium); margin-bottom: 16px; }
    
    emoji-picker { 
        position: relative;
        width: 350px; 
        height: 350px; 
        --emoji-size: 1.5rem; 
        background: var(--md-sys-color-surface-container-high);
        border: 1px solid var(--md-sys-color-outline-variant);
        border-radius: 12px;
        box-shadow: var(--md-sys-elevation-3, 0 8px 16px rgba(0,0,0,0.2));
        z-index: 1001; /* Ensure it is above the backdrop */
    }

    /* Ensure the picker respects dark mode */
    :host([data-theme="dark"]) emoji-picker {
        border-color: var(--md-sys-color-outline);
    }

    /* Tables */
    .table-container { 
        overflow-x: auto; -webkit-overflow-scrolling: touch; 
        border-radius: var(--md-sys-shape-corner-medium); 
        border: 1px solid var(--md-sys-color-outline-variant);
        margin-bottom: 2rem;
        background: var(--md-sys-color-surface);
    }
    table { width: 100%; min-width: 500px; border-collapse: separate; border-spacing: 0; background: var(--md-sys-color-surface); }
    th, td { padding: 12px 16px; text-align: left; border-bottom: 1px solid var(--md-sys-color-outline-variant); vertical-align: middle; color: var(--md-sys-color-on-surface); }
    th { background: var(--md-sys-color-surface-container); font: var(--md-sys-typescale-title-small); color: var(--md-sys-color-on-surface-variant); text-transform: none; letter-spacing: 0.1px; }
    td { font: var(--md-sys-typescale-body-medium); }
    tr:last-child td { border-bottom: none; }
    tr:hover { background-color: var(--md-sys-color-surface-container-highest); }
    
    .category-icon { width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; border-radius: 8px; margin-right: 12px; font-size: 1.25rem; }

    .modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; }
    .modal { background: var(--md-sys-color-surface-container-high); padding: 24px; border-radius: 28px; box-shadow: 0 4px 8px rgba(0,0,0,0.2); max-width: 400px; width: 100%; color: var(--md-sys-color-on-surface); }
    .modal h3 { font: var(--md-sys-typescale-headline-small); margin-top: 0; color: var(--md-sys-color-on-surface); margin-bottom: 16px; }
    .modal p { color: var(--md-sys-color-on-surface-variant); font: var(--md-sys-typescale-body-medium); margin-bottom: 24px; }
    .modal-actions { display: flex; justify-content: flex-end; gap: 8px; }
    
    .actions { display: flex; gap: 8px; flex-wrap: wrap; }

    @media (max-width: 600px) {
        .header { flex-direction: column; align-items: flex-start; gap: 1rem; }
        .section-title { margin-top: 1.5rem; }
        .settings-group { padding: 16px; }
        .table-container {
            border-top-right-radius: 0;
            border-bottom-right-radius: 0;
            border-right: none;
            margin-right: -1rem;
        }
    }
  `;

    async firstUpdated() {
        const storedCurrency = localStorage.getItem('priperfin_currency');
        if (storedCurrency) this.currency = storedCurrency;
        await this.loadData();

        // Support opening add form via URL parameter
        const params = new URLSearchParams(window.location.search);
        if (params.get('add') === 'true') {
            this.showAddForm = true;
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

    async loadData() {
        this.loading = true;
        try {
            const [cats, accts, costObjs] = await Promise.all([
                api.get('/categories'),
                api.get('/accounts'),
                api.get('/cost-objects')
            ]);
            this.categories = cats;
            this.accounts = accts;
            this.costObjects = costObjs;
        } catch (e: any) {
            console.error(e);
        } finally {
            this.loading = false;
        }
    }

    handleCurrencyChange(e: Event) {
        const val = (e.target as HTMLSelectElement).value;
        this.currency = val;
        localStorage.setItem('priperfin_currency', val);
        window.location.reload(); // Reload to apply currency changes across app
    }

    handleLanguageChange(e: Event) {
        const val = (e.target as HTMLSelectElement).value as 'en' | 'es';
        i18n.setLocale(val);
    }

    handleThemeChange(theme: string) {
        localStorage.setItem('priperfin_theme', theme);
        window.dispatchEvent(new CustomEvent('theme-change', { detail: { theme } }));
    }

    async clearAllData() {
        if (!confirm('WARNING: This will delete ALL transactions and savings goals. This action cannot be undone. Are you sure?')) return;

        try {
            await api.delete('/admin/reset');
            localStorage.removeItem('priperfin_total_savings');
            // alert('All data has been reset.');
            window.location.href = '/';
        } catch (e: any) {
            console.error('Failed to reset data', e);
            alert('Failed to reset data');
        }
    }

    async createBackup() {
        this.backupLoading = true;
        try {
            const response = await api.post('/backup/create', {
                encryptionKey: this.encryptionKey || undefined
            });
            const { filename, downloadUrl } = response;

            // Download the backup file
            const downloadResponse = await fetch(`${getApiBaseUrl().replace('/api', '')}${downloadUrl}`);
            const blob = await downloadResponse.blob();

            // Create download link
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

            alert(i18n.t('settings.backup_created'));
            this.encryptionKey = ''; // Clear the key after successful backup
        } catch (e: any) {
            console.error('Failed to create backup', e);
            alert(i18n.t('settings.backup_failed') + ': ' + (e.message || 'Unknown error'));
        } finally {
            this.backupLoading = false;
        }
    }

    async restoreBackup(event: Event) {
        const input = event.target as HTMLInputElement;
        if (!input.files || input.files.length === 0) return;

        const file = input.files[0];

        if (!confirm(i18n.t('settings.restore_warning'))) {
            input.value = ''; // Reset file input
            return;
        }

        this.restoreLoading = true;
        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('confirmOverwrite', 'true');
            if (this.decryptionKey) {
                formData.append('decryptionKey', this.decryptionKey);
            }

            const response = await fetch(`${getApiBaseUrl()}/backup/restore`, {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Restore failed');
            }

            alert(i18n.t('settings.backup_restored'));
            this.decryptionKey = ''; // Clear the key
            window.location.reload();
        } catch (e: any) {
            console.error('Failed to restore backup', e);
            // Show the actual error message from the backend
            alert(i18n.t('settings.restore_failed') + ':\n\n' + e.message);
        } finally {
            this.restoreLoading = false;
            input.value = ''; // Reset file input
        }
    }

    resetForm() {
        this.categoryForm = { name: '', icon: '', color: '', budget: null, type: 'EXPENSE', parentId: '' };
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

        // Wait for the form to render, then scroll to it
        await this.updateComplete;
        const formCard = this.shadowRoot?.querySelector('.form-card');
        if (formCard) {
            formCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }

    async saveCategory() {
        try {
            const payload = {
                name: this.categoryForm.name,
                icon: this.categoryForm.icon,
                // color: this.categoryForm.color, // Color is optional/removed from UI
                budget: this.categoryForm.type === 'EXPENSE' ? this.categoryForm.budget : null,
                type: this.categoryForm.type,
                parentId: this.categoryForm.parentId || null
            };

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

    async deleteCategory(id: string) {
        this.categoryToDelete = id;
    }

    async confirmDelete() {
        if (!this.categoryToDelete) return;
        const id = this.categoryToDelete;

        console.log('[ViewSettings] Confirming delete for:', id);
        try {
            await api.delete(`/categories/${id}`);
            await this.loadData();
            this.categoryToDelete = null;
        } catch (e: any) {
            console.error('Failed to delete category', e);
            alert('Failed to delete category: ' + (e.message || 'Unknown error'));
        }
    }

    // ============= Account Management =============
    resetAccountForm() {
        this.accountForm = { name: '', initialBalance: 0, type: 'DEBIT' };
        this.editAccountId = null;
        this.showAccountForm = false;
    }

    startEditAccount(account: any) {
        this.accountForm = {
            name: account.name,
            initialBalance: Number(account.initialBalance) || 0,
            type: account.type || 'DEBIT'
        };
        this.editAccountId = account.id;
        this.showAccountForm = true;
    }

    async saveAccount() {
        if (!this.accountForm.name) {
            alert('Please enter an account name');
            return;
        }

        try {
            const payload = {
                name: this.accountForm.name,
                initialBalance: this.accountForm.initialBalance,
                type: this.accountForm.type
            };

            if (this.editAccountId) {
                await api.patch(`/accounts/${this.editAccountId}`, payload);
            } else {
                await api.post('/accounts', payload);
            }

            this.resetAccountForm();
            await this.loadData();
        } catch (e: any) {
            console.error('Failed to save account', e);
            alert('Failed to save account: ' + (e.message || 'Unknown error'));
        }
    }

    async confirmDeleteAccount() {
        if (!this.accountToDelete) return;

        try {
            await api.delete(`/accounts/${this.accountToDelete}`);
            await this.loadData();
            this.accountToDelete = null;
        } catch (e: any) {
            console.error('Failed to delete account', e);
            alert('Failed to delete account: ' + (e.message || 'Unknown error'));
        }
    }

    // ============= Cost Object Management =============
    resetCostObjectForm() {
        this.costObjectForm = { name: '', icon: '', color: '#6366f1' };
        this.editCostObjectId = null;
        this.showCostObjectForm = false;
        this.showCostObjectEmojiPicker = false;
    }

    startEditCostObject(costObject: any) {
        this.costObjectForm = {
            name: costObject.name,
            icon: costObject.icon,
            color: costObject.color || '#6366f1'
        };
        this.editCostObjectId = costObject.id;
        this.showCostObjectForm = true;
    }

    async saveCostObject() {
        if (!this.costObjectForm.name || !this.costObjectForm.icon) {
            alert('Please enter a name and select an icon');
            return;
        }

        try {
            const payload = {
                name: this.costObjectForm.name,
                icon: this.costObjectForm.icon,
                color: this.costObjectForm.color
            };

            if (this.editCostObjectId) {
                await api.patch(`/cost-objects/${this.editCostObjectId}`, payload);
            } else {
                await api.post('/cost-objects', payload);
            }

            this.resetCostObjectForm();
            await this.loadData();
        } catch (e: any) {
            console.error('Failed to save cost object', e);
            alert('Failed to save cost object: ' + (e.message || 'Unknown error'));
        }
    }

    async confirmDeleteCostObject() {
        if (!this.costObjectToDelete) return;

        try {
            await api.delete(`/cost-objects/${this.costObjectToDelete}`);
            await this.loadData();
            this.costObjectToDelete = null;
        } catch (e: any) {
            console.error('Failed to delete cost object', e);
            alert('Failed to delete cost object: ' + (e.message || 'Unknown error'));
        }
    }

    renderCategoryTable(categories: any[], showParentChild = false, showBudget = true) {
        const symbol = this.currency === 'EUR' ? '€' : '$';

        // Prepare list, if showParentChild is true, we flatten with hierarchy
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

        if (rows.length === 0) return html`<p style="color: #666; font-style: italic; padding: 1rem;">${i18n.t('common.no_data')}</p>`;

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
                                </td>` : ''}
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
      <div class="header">
        <h1>${i18n.t('settings.title')}</h1>
      </div>

      <div class="section-title">${i18n.t('settings.general')}</div>
      <div class="settings-group">
          <div class="form-group">
            <label>${i18n.t('settings.language')}</label>
            <select .value="${i18n.getLocale()}" @change="${this.handleLanguageChange}" style="padding: 0.5rem; border-radius: 4px; border: 1px solid #ccc; width: 200px;">
                <option value="en">English</option>
                <option value="es">Español</option>
            </select>
          </div>

          <div class="form-group">
            <label>${i18n.t('common.currency')}</label>
            <select .value="${this.currency}" @change="${this.handleCurrencyChange}" style="padding: 0.5rem; border-radius: 4px; border: 1px solid #ccc; width: 200px;">
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="JPY">JPY (¥)</option>
                <option value="CAD">CAD ($)</option>
                <option value="AUD">AUD ($)</option>
            </select>
          </div>

          <div class="form-group">
            <label>${i18n.t('settings.theme')}</label>
            <select @change="${(e: any) => this.handleThemeChange(e.target.value)}" style="padding: 0.5rem; border-radius: 4px; border: 1px solid #ccc; width: 200px;">
                <option value="auto">${i18n.t('settings.theme_auto')}</option>
                <option value="light">${i18n.t('settings.theme_light')}</option>
                <option value="dark">${i18n.t('settings.theme_dark')}</option>
            </select>
          </div>
          
          <div style="border-top: 1px solid var(--md-sys-color-outline-variant); padding-top: 1.5rem; margin-top: 1.5rem;">
            <label style="color: var(--md-sys-color-error); margin-bottom: 0.5rem;">${i18n.t('settings.danger_zone')}</label>
            <button class="btn-danger" @click="${this.clearAllData}">${i18n.t('settings.clear_all_data')}</button>
            <p style="font-size: 0.8rem; color: #666; margin-top: 0.5rem;">${i18n.t('settings.clear_all_warning')}</p>
          </div>
      </div>

      <div class="section-title">🏦 ${i18n.t('accounts.title')}</div>
      <div class="settings-group">
          ${this.accounts.length === 0 ? html`
            <p style="color: var(--md-sys-color-on-surface-variant);">${i18n.t('accounts.no_accounts')}</p>
          ` : html`
            <div class="table-container">
              <table>
                <thead>
                  <tr>
                    <th>${i18n.t('accounts.account_name')}</th>
                    <th>${i18n.t('accounts.account_type')}</th>
                    <th>${i18n.t('accounts.initial_balance')}</th>
                    <th>${i18n.t('common.actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  ${this.accounts.map(acc => html`
                    <tr>
                      <td>${acc.name}</td>
                      <td>
                        <span style="
                          padding: 4px 8px;
                          border-radius: 12px;
                          font-size: 0.75rem;
                          background: ${acc.type === 'CREDIT' ? 'var(--md-sys-color-tertiary-container)' : 'var(--md-sys-color-secondary-container)'};
                          color: ${acc.type === 'CREDIT' ? 'var(--md-sys-color-on-tertiary-container)' : 'var(--md-sys-color-on-secondary-container)'};
                        ">
                          ${acc.type === 'CREDIT' ? '💳 Credit' : '🏦 Debit'}
                        </span>
                      </td>
                      <td>${this.currency === 'EUR' ? '€' : '$'}${Number(acc.initialBalance).toFixed(2)}</td>
                      <td>
                        <div class="actions">
                          <button @click="${() => this.startEditAccount(acc)}">${i18n.t('common.edit')}</button>
                          <button class="btn-danger" @click="${() => this.accountToDelete = acc.id}">🗑</button>
                        </div>
                      </td>
                    </tr>
                  `)}
                </tbody>
              </table>
            </div>
          `}

          ${!this.showAccountForm ? html`
            <button class="btn-primary" style="margin-top: 16px;" @click="${() => this.showAccountForm = true}">+ Add Account</button>
          ` : html`
            <div style="margin-top: 16px; padding: 16px; background: var(--md-sys-color-surface-container-high); border-radius: 8px;">
              <h4 style="margin-top: 0;">${this.editAccountId ? i18n.t('accounts.edit_account') : i18n.t('accounts.new_account')}</h4>
              <div class="form-group">
                <label>${i18n.t('accounts.account_name')}</label>
                <input type="text" .value="${this.accountForm.name}"
                  @input="${(e: any) => this.accountForm = { ...this.accountForm, name: e.target.value }}"
                  placeholder="e.g. Checking, Savings, Chase Sapphire" />
              </div>
              <div class="form-group">
                <label>${i18n.t('accounts.account_type')}</label>
                <select .value="${this.accountForm.type}"
                  @change="${(e: any) => this.accountForm = { ...this.accountForm, type: e.target.value }}">
                  <option value="DEBIT">🏦 ${i18n.t('accounts.debit_option')}</option>
                  <option value="CREDIT">💳 ${i18n.t('accounts.credit_option')}</option>
                </select>
              </div>
              <div class="form-group">
                <label>${this.accountForm.type === 'CREDIT' ? i18n.t('accounts.starting_balance_owed') : i18n.t('accounts.initial_balance')}</label>
                <input type="number" step="0.01" .value="${this.accountForm.initialBalance}"
                  @input="${(e: any) => this.accountForm = { ...this.accountForm, initialBalance: parseFloat(e.target.value) || 0 }}" />
                ${this.accountForm.type === 'CREDIT' ? html`
                  <p style="font-size: 0.75rem; color: var(--md-sys-color-on-surface-variant); margin-top: 4px;">
                    ${i18n.t('accounts.balance_owed_hint')}
                  </p>
                ` : ''}
              </div>
              <div style="display: flex; gap: 8px;">
                <button class="btn-primary" @click="${this.saveAccount}">${i18n.t('common.save')}</button>
                <button class="btn-secondary" @click="${this.resetAccountForm}">${i18n.t('common.cancel')}</button>
              </div>
            </div>
          `}
      </div>

      ${this.accountToDelete ? html`
        <div class="modal-overlay" @click="${() => this.accountToDelete = null}">
          <div class="modal" @click="${(e: Event) => e.stopPropagation()}">
            <h3>${i18n.t('accounts.delete_account')}</h3>
            <p>${i18n.t('accounts.delete_account_warning')}</p>
            <div class="modal-actions">
              <button class="btn-secondary" @click="${() => this.accountToDelete = null}">${i18n.t('common.cancel')}</button>
              <button class="btn-danger" @click="${this.confirmDeleteAccount}">${i18n.t('common.delete')}</button>
            </div>
          </div>
        </div>
      ` : ''}

      <div class="section-title">💼 ${i18n.t('settings.cost_objects')}</div>
      <div class="settings-group">
          <p style="color: var(--md-sys-color-on-surface-variant); margin-bottom: 16px; font-size: 0.875rem;">
            Track funding sources for credit card expenses (e.g., Work, Personal, Shared).
          </p>
          ${this.costObjects.length === 0 && !this.showCostObjectForm ? html`
            <p style="color: var(--md-sys-color-on-surface-variant); font-style: italic;">${i18n.t('settings.no_cost_objects')}</p>
          ` : html`
            ${this.costObjects.length > 0 ? html`
              <div class="table-container">
                <table>
                  <thead>
                    <tr>
                      <th style="width: 75%">${i18n.t('settings.cost_object_name')}</th>
                      <th style="width: 25%">${i18n.t('common.actions')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${this.costObjects.map(co => html`
                      <tr>
                        <td>
                          <div style="display: flex; align-items: center;">
                            <span class="category-icon" style="color: ${co.color}; background: ${co.color}20;">
                              ${co.icon}
                            </span>
                            <span>${co.name}</span>
                          </div>
                        </td>
                        <td>
                          <div class="actions">
                            <button @click="${() => this.startEditCostObject(co)}">${i18n.t('common.edit')}</button>
                            <button class="btn-danger" @click="${() => this.costObjectToDelete = co.id}">🗑</button>
                          </div>
                        </td>
                      </tr>
                    `)}
                  </tbody>
                </table>
              </div>
            ` : ''}
          `}

          ${!this.showCostObjectForm ? html`
            <button class="btn-primary" style="margin-top: 16px;" @click="${() => this.showCostObjectForm = true}">+ ${i18n.t('settings.add_cost_object')}</button>
          ` : html`
            <div style="margin-top: 16px; padding: 16px; background: var(--md-sys-color-surface-container-high); border-radius: 8px;">
              <h4 style="margin-top: 0;">${this.editCostObjectId ? i18n.t('settings.edit_cost_object') : i18n.t('settings.add_cost_object')}</h4>
              <div class="form-group">
                <label>${i18n.t('settings.cost_object_name')}</label>
                <input type="text" .value="${this.costObjectForm.name}"
                  @input="${(e: any) => this.costObjectForm = { ...this.costObjectForm, name: e.target.value }}"
                  placeholder="e.g. Work, Personal, Shared" />
              </div>
              <div class="form-group">
                <label>${i18n.t('settings.icon')}</label>
                <div style="position: relative;">
                  <div style="display: flex; gap: 0.5rem; align-items: center;">
                    <input type="text" placeholder="Emoji" style="width: 60px; text-align: center;" .value="${this.costObjectForm.icon}"
                      @input="${(e: any) => this.costObjectForm = { ...this.costObjectForm, icon: e.target.value }}" />
                    <button @click="${() => this.showCostObjectEmojiPicker = !this.showCostObjectEmojiPicker}" title="Pick Emoji">😀</button>
                  </div>
                  ${this.showCostObjectEmojiPicker ? html`
                    <div style="position: absolute; z-index: 2000; bottom: 100%; left: 0; margin-bottom: 8px;">
                      <div style="position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; z-index: 1000;" @click="${() => this.showCostObjectEmojiPicker = false}"></div>
                      <emoji-picker @emoji-click="${(e: any) => {
                        this.costObjectForm = { ...this.costObjectForm, icon: e.detail.unicode };
                        this.showCostObjectEmojiPicker = false;
                      }}"></emoji-picker>
                    </div>
                  ` : ''}
                </div>
              </div>
              <div style="display: flex; gap: 8px;">
                <button class="btn-primary" @click="${this.saveCostObject}">${i18n.t('common.save')}</button>
                <button class="btn-secondary" @click="${this.resetCostObjectForm}">${i18n.t('common.cancel')}</button>
              </div>
            </div>
          `}
      </div>

      ${this.costObjectToDelete ? html`
        <div class="modal-overlay" @click="${() => this.costObjectToDelete = null}">
          <div class="modal" @click="${(e: Event) => e.stopPropagation()}">
            <h3>Delete Cost Object?</h3>
            <p>This will remove the cost object. Transactions using it will become unassigned.</p>
            <div class="modal-actions">
              <button class="btn-secondary" @click="${() => this.costObjectToDelete = null}">${i18n.t('common.cancel')}</button>
              <button class="btn-danger" @click="${this.confirmDeleteCostObject}">${i18n.t('common.delete')}</button>
            </div>
          </div>
        </div>
      ` : ''}

      <div class="section-title">${i18n.t('settings.backup_restore')}</div>
      <div class="settings-group">
          <div class="form-group">
            <label>${i18n.t('settings.create_backup')}</label>
            <p style="font-size: 0.875rem; color: var(--md-sys-color-on-surface-variant); margin-bottom: 1rem;">
              ${i18n.t('settings.backup_description')}
            </p>
            <div class="form-group">
              <label>${i18n.t('settings.encryption_key_optional')}</label>
              <input 
                type="password" 
                placeholder="${i18n.t('settings.encryption_placeholder')}"
                .value="${this.encryptionKey}"
                @input="${(e: any) => this.encryptionKey = e.target.value}"
              />
              <p style="font-size: 0.75rem; color: var(--md-sys-color-on-surface-variant); margin-top: 0.25rem;">
                ${i18n.t('settings.leave_empty_no_encryption')}
              </p>
            </div>
            <button class="btn-primary" @click="${this.createBackup}" ?disabled="${this.backupLoading}">
              ${this.backupLoading ? '⏳ ' + i18n.t('common.loading') : '💾 ' + i18n.t('settings.create_backup')}
            </button>
          </div>

          <div class="form-group" style="margin-top: 2rem;">
            <label>${i18n.t('settings.restore_backup')}</label>
            <p style="font-size: 0.875rem; color: var(--md-sys-color-on-surface-variant); margin-bottom: 1rem;">
              ${i18n.t('settings.restore_description')}
            </p>
            <div class="form-group">
              <label>${i18n.t('settings.decryption_key')}</label>
              <input 
                type="password" 
                placeholder="${i18n.t('settings.decryption_placeholder')}"
                .value="${this.decryptionKey}"
                @input="${(e: any) => this.decryptionKey = e.target.value}"
              />
            </div>
            <input 
              type="file" 
              accept=".tar.enc,.tar" 
              @change="${this.restoreBackup}"
              ?disabled="${this.restoreLoading}"
              style="margin-bottom: 0.5rem;"
            />
            ${this.restoreLoading ? html`<p style="color: var(--md-sys-color-primary);">⏳ ${i18n.t('common.loading')}</p>` : ''}
          </div>
      </div>

      <div class="header">
        <div class="section-title" style="margin: 0">${i18n.t('settings.categories')}</div>
        <button class="btn-primary" @click="${this.toggleAddForm}">
            ${this.showAddForm ? i18n.t('common.cancel') : '+ ' + i18n.t('settings.add_category')}
        </button>
      </div>

      ${this.showAddForm ? html`
        <div class="form-card">
            <h3>${this.editModeId ? i18n.t('settings.edit_category') : i18n.t('settings.new_category')}</h3>
            <div style="display: grid; gap: 1rem; max-width: 400px;">
                <div class="form-group">
                    <label>${i18n.t('settings.type')}</label>
                    <select .value="${this.categoryForm.type}" 
                        @change="${(e: any) => this.categoryForm = { ...this.categoryForm, type: e.target.value }}">
                        <option value="EXPENSE">${i18n.t('settings.expense_categories')}</option>
                        <option value="GOAL">${i18n.t('settings.goal_categories')}</option>
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
                        ${this.categories.filter(c => !c.parentId && c.id !== this.editModeId).map(c => html`
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
                                <button @click="${() => this.showEmojiPicker = !this.showEmojiPicker}" title="Pick Emoji">😀</button>
                            </div>
                            ${this.showEmojiPicker ? html`
                                <div style="position: absolute; z-index: 2000; bottom: 100%; left: 0; margin-bottom: 8px;">
                                    <div style="position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; z-index: 1000;" @click="${() => this.showEmojiPicker = false}"></div>
                                    <emoji-picker @emoji-click="${(e: any) => {
                        console.log('Emoji clicked:', e.detail);
                        this.categoryForm = { ...this.categoryForm, icon: e.detail.unicode };
                        this.showEmojiPicker = false;
                    }}"></emoji-picker>
                                </div>
                            ` : ''}
                        </div>
                    </div>
                    
                    
                    <!-- Color input removed as per user request -->
                </div>
                </div>
                
                ${this.categoryForm.type === 'EXPENSE' ? html`
                <div class="form-group">
                    <label>${i18n.t('settings.monthly_budget')}</label>
                    <input type="number" placeholder="0.00" .value="${this.categoryForm.budget ?? ''}" 
                        @input="${(e: any) => {
                        const val = e.target.value;
                        this.categoryForm = { ...this.categoryForm, budget: val === '' ? null : parseFloat(val) };
                    }}" />
                </div>
                ` : ''}
                
                <button class="btn-primary" @click="${this.saveCategory}">${i18n.t('common.save')}</button>
            </div>
        </div>
      ` : ''}

      <h3 style="margin-top: 0; color: #666; font-size: 0.9rem; text-transform: uppercase; letter-spacing: 0.05em;">${i18n.t('settings.expense_categories')}</h3>
       ${this.renderCategoryTable(expenseCategories, true, true)}

      <div style="margin-top: 2rem;"></div>
      <h3 style="margin-top: 0; color: #666; font-size: 0.9rem; text-transform: uppercase; letter-spacing: 0.05em;">${i18n.t('settings.goal_categories')}</h3>
       ${this.renderCategoryTable(goalCategories, false, false)}

        ${this.categoryToDelete ? html`
            <div class="modal-overlay" @click="${() => this.categoryToDelete = null}">
                <div class="modal" @click="${(e: Event) => e.stopPropagation()}">
                    <h3 style="margin-top: 0;">${i18n.t('common.delete')} Category</h3>
                    <p>${i18n.t('common.confirm_delete')}</p>
                    <div class="modal-actions">
                        <button @click="${() => this.categoryToDelete = null}">${i18n.t('common.cancel')}</button>
                        <button class="btn-danger" @click="${this.confirmDelete}">${i18n.t('common.delete')}</button>
                    </div>
                </div>
            </div>
        ` : ''}
    `;
    }
}
