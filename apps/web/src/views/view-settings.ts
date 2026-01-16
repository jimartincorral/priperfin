import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { api, getApiBaseUrl, authApi } from '../api/client';
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

    // Profile management
    @state() currentProfile: any = null;
    @state() profiles: any[] = [];
    @state() showChangePinModal = false;
    @state() showCreateProfileModal = false;
    @state() showDeleteProfileModal = false;
    @state() showDeleteAllDataModal = false;
    @state() changePinForm = { oldPin: '', newPin: '', confirmPin: '' };
    @state() createProfileForm = { name: '', pin: '', confirmPin: '' };
    @state() deleteProfilePin = '';
    @state() deleteAllDataConfirmText = '';

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
            const [cats, accts, costObjs, profile, allProfiles] = await Promise.all([
                api.get('/categories'),
                api.get('/accounts'),
                api.get('/cost-objects'),
                authApi.getCurrentProfile().catch(() => null),
                authApi.getProfiles().catch(() => [])
            ]);
            this.categories = cats;
            this.accounts = accts;
            this.costObjects = costObjs;
            this.currentProfile = profile?.profile || null;
            this.profiles = allProfiles;
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

    // ============= Delete Operations =============
    async deleteProfileData() {
        if (!confirm('⚠️ WARNING: This will delete ALL data in your current profile (transactions, accounts, categories, etc.). This action cannot be undone. Are you sure?')) return;

        try {
            await api.delete('/admin/reset');
            localStorage.removeItem('priperfin_total_savings');
            alert('Profile data has been reset.');
            window.location.href = new URL('.', document.baseURI).href;
        } catch (e: any) {
            console.error('Failed to reset profile data', e);
            alert('Failed to reset profile data: ' + (e.message || 'Unknown error'));
        }
    }

    async handleDeleteProfile() {
        if (!this.deleteProfilePin) {
            alert('Please enter your PIN to confirm profile deletion');
            return;
        }

        try {
            await api.delete('/auth/profile', { pin: this.deleteProfilePin });
            alert('Profile deleted successfully.');
            this.showDeleteProfileModal = false;
            this.deleteProfilePin = '';
            // Redirect to login
            window.location.href = new URL('login', document.baseURI).href;
        } catch (e: any) {
            alert('Failed to delete profile: ' + (e.message || 'Unknown error'));
        }
    }

    async handleDeleteAllData() {
        if (this.deleteAllDataConfirmText !== 'DELETE ALL') {
            alert('Please type "DELETE ALL" to confirm');
            return;
        }

        try {
            await api.delete('/admin/reset-all');
            localStorage.clear();
            alert('All data from all profiles has been deleted.');
            this.showDeleteAllDataModal = false;
            this.deleteAllDataConfirmText = '';
            window.location.href = new URL('setup', document.baseURI).href;
        } catch (e: any) {
            alert('Failed to delete all data: ' + (e.message || 'Unknown error'));
        }
    }

    // ============= Profile Management =============
    async handleChangePin() {
        if (this.changePinForm.newPin !== this.changePinForm.confirmPin) {
            alert(i18n.t('auth.setup.pinMismatch'));
            return;
        }

        if (this.changePinForm.newPin.length < 4 || this.changePinForm.newPin.length > 6) {
            alert('PIN must be 4-6 digits');
            return;
        }

        try {
            await authApi.changePin(this.changePinForm.oldPin, this.changePinForm.newPin);
            alert('PIN changed successfully. Please log in again.');
            this.showChangePinModal = false;
            this.changePinForm = { oldPin: '', newPin: '', confirmPin: '' };
            // User will be logged out automatically by the backend
            window.location.href = new URL('login', document.baseURI).href;
        } catch (e: any) {
            alert('Failed to change PIN: ' + (e.message || 'Unknown error'));
        }
    }

    async handleCreateProfile() {
        if (!this.createProfileForm.name || this.createProfileForm.name.length < 3) {
            alert('Profile name must be at least 3 characters');
            return;
        }

        if (this.createProfileForm.pin !== this.createProfileForm.confirmPin) {
            alert(i18n.t('auth.setup.pinMismatch'));
            return;
        }

        if (this.createProfileForm.pin.length < 4 || this.createProfileForm.pin.length > 6) {
            alert('PIN must be 4-6 digits');
            return;
        }

        try {
            await authApi.createProfile(this.createProfileForm.name, this.createProfileForm.pin);
            alert(`Profile "${this.createProfileForm.name}" created successfully!`);
            this.showCreateProfileModal = false;
            this.createProfileForm = { name: '', pin: '', confirmPin: '' };
            await this.loadData(); // Reload profiles list
        } catch (e: any) {
            alert('Failed to create profile: ' + (e.message || 'Unknown error'));
        }
    }

    async handleLogout() {
        try {
            await authApi.logout();
            window.location.href = new URL('login', document.baseURI).href;
        } catch (e: any) {
            console.error('Logout failed:', e);
            // Clear session anyway and redirect
            api.clearSession();
            window.location.href = new URL('login', document.baseURI).href;
        }
    }

    async createBackup() {
        this.backupLoading = true;
        try {
            console.log('[ViewSettings] Starting backup creation...');
            const response = await api.post('/backup/create', {
                encryptionKey: this.encryptionKey || undefined
            });
            console.log('[ViewSettings] Backup creation response:', response);
            const { filename, downloadUrl } = response;

            // Download the backup file
            // Use the established API base URL (which works for POST) and append the endpoint
            // downloadUrl comes as '/api/backup/download/...' so we strip the leading '/api' to avoid duplication
            const apiBase = getApiBaseUrl();
            console.log('[ViewSettings] API base URL:', apiBase);
            console.log('[ViewSettings] Download URL from response:', downloadUrl);
            
            const endpoint = downloadUrl.startsWith('/api') ? downloadUrl.substring(4) : downloadUrl;
            console.log('[ViewSettings] Endpoint after processing:', endpoint);

            // Use ApiClient download method to maintain authentication
            console.log('[ViewSettings] Fetching backup file...');
            const blob = await api.download(endpoint);
            console.log('[ViewSettings] Blob created, size:', blob.size, 'type:', blob.type);

            // Create a temporary object URL and trigger download
            const blobUrl = window.URL.createObjectURL(blob);
            console.log('[ViewSettings] Blob URL created:', blobUrl);
            
            const a = document.createElement('a');
            a.href = blobUrl;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);

            // Clean up the blob URL to free memory
            window.URL.revokeObjectURL(blobUrl);
            console.log('[ViewSettings] Download completed successfully');

            alert(i18n.t('settings.backup_created'));
            this.encryptionKey = ''; // Clear the key after successful backup
        } catch (e: any) {
            console.error('[ViewSettings] Backup creation or download failed:', e);
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

            // Get session token directly from storage since we're using raw fetch
            const token = localStorage.getItem('session_token');
            const headers: HeadersInit = {};
            if (token) {
                headers['X-Session-Token'] = token;
            }

            const response = await fetch(`${getApiBaseUrl()}/backup/restore`, {
                method: 'POST',
                headers: headers,
                body: formData,
                credentials: 'same-origin', // Ensure authentication context in HA Ingress
            });

            if (!response.ok) {
                let errorMessage;
                try {
                    const resJson = await response.json();
                    
                    // Helper to extract message from an object
                    const extractMessage = (obj: any): string | null => {
                        if (!obj) return null;
                        if (typeof obj === 'string') return obj;
                        if (obj.message) {
                            if (typeof obj.message === 'string') return obj.message;
                            if (Array.isArray(obj.message)) return obj.message.join(', ');
                            return JSON.stringify(obj.message); // Fallback for complex message
                        }
                        if (obj.error && typeof obj.error === 'string') return obj.error;
                        return null;
                    };

                    // 1. Try top-level message
                    errorMessage = extractMessage(resJson);

                    // 2. If not found, try nested 'error' property (common in NestJS ExceptionFilters)
                    if (!errorMessage && resJson.error) {
                        errorMessage = extractMessage(resJson.error);
                    }

                    // 3. Fallback to stringifying the whole error object if it's not too big, or generic message
                    if (!errorMessage) {
                        errorMessage = typeof resJson.error === 'string' ? resJson.error : 'Restore failed';
                    }

                } catch (e) {
                    console.warn('Failed to parse error JSON:', e);
                    // Fallback to text if JSON parsing fails
                    const text = await response.text();
                    errorMessage = text || `Restore failed with status ${response.status}`;
                }
                throw new Error(errorMessage);
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
            <label style="color: var(--md-sys-color-error); margin-bottom: 0.5rem;">⚠️ Danger Zone</label>
            
            <div style="display: flex; flex-direction: column; gap: 12px;">
              <div>
                <button class="btn-danger" @click="${() => this.deleteProfileData()}">Delete Profile Data</button>
                <p style="font-size: 0.8rem; color: var(--md-sys-color-on-surface-variant); margin-top: 0.5rem;">
                  Delete all data in your current profile (transactions, accounts, categories, rules). The profile itself remains.
                </p>
              </div>

              <div>
                <button class="btn-danger" @click="${() => this.showDeleteProfileModal = true}">Delete This Profile</button>
                <p style="font-size: 0.8rem; color: var(--md-sys-color-on-surface-variant); margin-top: 0.5rem;">
                  Delete the current profile and all its data. You will be logged out.
                </p>
              </div>

              <div>
                <button class="btn-danger" @click="${() => this.showDeleteAllDataModal = true}">Delete ALL Data (All Profiles)</button>
                <p style="font-size: 0.8rem; color: var(--md-sys-color-on-surface-variant); margin-top: 0.5rem;">
                  ⚠️ EXTREME DANGER: Delete ALL profiles and ALL data from the entire application. This resets everything.
                </p>
              </div>
            </div>
          </div>
      </div>

      <div class="section-title">👤 ${i18n.t('auth.settings.title')}</div>
      <div class="settings-group">
          ${this.currentProfile ? html`
            <div class="form-group">
              <label>${i18n.t('auth.settings.currentProfile')}</label>
              <div style="
                display: flex;
                align-items: center;
                padding: 12px 16px;
                background: var(--md-sys-color-primary-container);
                color: var(--md-sys-color-on-primary-container);
                border-radius: 8px;
                font-weight: 500;
              ">
                👤 ${this.currentProfile.name}
              </div>
            </div>
          ` : ''}

          <div class="form-group" style="margin-top: 16px;">
            <label>Profile Actions</label>
            <div style="display: flex; gap: 8px; flex-wrap: wrap;">
              <button class="btn-primary" @click="${() => this.showChangePinModal = true}">
                🔒 ${i18n.t('auth.settings.changePin')}
              </button>
              <button @click="${() => this.showCreateProfileModal = true}">
                ➕ ${i18n.t('auth.settings.createProfile')}
              </button>
              <button class="btn-danger" @click="${this.handleLogout}">
                🚪 ${i18n.t('auth.settings.logout')}
              </button>
            </div>
          </div>

          ${this.profiles.length > 1 ? html`
            <div class="form-group" style="margin-top: 24px;">
              <label>All Profiles (${this.profiles.length})</label>
              <div style="display: flex; flex-wrap: wrap; gap: 8px; margin-top: 8px;">
                ${this.profiles.map(p => html`
                  <div style="
                    padding: 8px 12px;
                    background: ${p.name === this.currentProfile?.name ? 'var(--md-sys-color-primary-container)' : 'var(--md-sys-color-surface-container-high)'};
                    color: ${p.name === this.currentProfile?.name ? 'var(--md-sys-color-on-primary-container)' : 'var(--md-sys-color-on-surface)'};
                    border-radius: 16px;
                    font-size: 0.875rem;
                  ">
                    ${p.name === this.currentProfile?.name ? '✓ ' : ''}${p.name}
                  </div>
                `)}
              </div>
              <p style="font-size: 0.75rem; color: var(--md-sys-color-on-surface-variant); margin-top: 8px;">
                To switch profiles, log out and select a different profile on the login screen.
              </p>
            </div>
          ` : ''}
      </div>

      ${this.showChangePinModal ? html`
        <div class="modal-overlay" @click="${() => this.showChangePinModal = false}">
          <div class="modal" @click="${(e: Event) => e.stopPropagation()}">
            <h3>${i18n.t('auth.settings.changePin')}</h3>
            <div class="form-group">
              <label>Current PIN</label>
              <input 
                type="password" 
                inputmode="numeric"
                maxlength="6"
                .value="${this.changePinForm.oldPin}"
                @input="${(e: any) => this.changePinForm = { ...this.changePinForm, oldPin: e.target.value }}"
                placeholder="Enter current PIN"
              />
            </div>
            <div class="form-group">
              <label>New PIN (4-6 digits)</label>
              <input 
                type="password" 
                inputmode="numeric"
                maxlength="6"
                .value="${this.changePinForm.newPin}"
                @input="${(e: any) => this.changePinForm = { ...this.changePinForm, newPin: e.target.value }}"
                placeholder="Enter new PIN"
              />
            </div>
            <div class="form-group">
              <label>Confirm New PIN</label>
              <input 
                type="password" 
                inputmode="numeric"
                maxlength="6"
                .value="${this.changePinForm.confirmPin}"
                @input="${(e: any) => this.changePinForm = { ...this.changePinForm, confirmPin: e.target.value }}"
                placeholder="Confirm new PIN"
              />
            </div>
            <div class="modal-actions">
              <button @click="${() => { this.showChangePinModal = false; this.changePinForm = { oldPin: '', newPin: '', confirmPin: '' }; }}">
                ${i18n.t('common.cancel')}
              </button>
              <button class="btn-primary" @click="${this.handleChangePin}">
                ${i18n.t('common.save')}
              </button>
            </div>
          </div>
        </div>
      ` : ''}

      ${this.showCreateProfileModal ? html`
        <div class="modal-overlay" @click="${() => this.showCreateProfileModal = false}">
          <div class="modal" @click="${(e: Event) => e.stopPropagation()}">
            <h3>${i18n.t('auth.settings.createProfile')}</h3>
            <div class="form-group">
              <label>Profile Name</label>
              <input 
                type="text"
                .value="${this.createProfileForm.name}"
                @input="${(e: any) => this.createProfileForm = { ...this.createProfileForm, name: e.target.value }}"
                placeholder="e.g., Personal, Spouse, Shared"
              />
            </div>
            <div class="form-group">
              <label>PIN (4-6 digits)</label>
              <input 
                type="password" 
                inputmode="numeric"
                maxlength="6"
                .value="${this.createProfileForm.pin}"
                @input="${(e: any) => this.createProfileForm = { ...this.createProfileForm, pin: e.target.value }}"
                placeholder="Enter PIN"
              />
            </div>
            <div class="form-group">
              <label>Confirm PIN</label>
              <input 
                type="password" 
                inputmode="numeric"
                maxlength="6"
                .value="${this.createProfileForm.confirmPin}"
                @input="${(e: any) => this.createProfileForm = { ...this.createProfileForm, confirmPin: e.target.value }}"
                placeholder="Confirm PIN"
              />
            </div>
            <div class="modal-actions">
              <button @click="${() => { this.showCreateProfileModal = false; this.createProfileForm = { name: '', pin: '', confirmPin: '' }; }}">
                ${i18n.t('common.cancel')}
              </button>
              <button class="btn-primary" @click="${this.handleCreateProfile}">
                ${i18n.t('common.save')}
              </button>
            </div>
          </div>
        </div>
      ` : ''}

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

      ${this.showDeleteProfileModal ? html`
        <div class="modal-overlay" @click="${() => this.showDeleteProfileModal = false}">
          <div class="modal" @click="${(e: Event) => e.stopPropagation()}">
            <h3 style="color: var(--md-sys-color-error);">⚠️ Delete Profile</h3>
            <p style="margin-bottom: 16px; color: var(--md-sys-color-on-surface);">
              This will permanently delete your profile "<strong>${this.currentProfile?.name}</strong>" and ALL its data 
              (transactions, accounts, categories, rules, etc.). This action cannot be undone.
            </p>
            <div class="form-group">
              <label>Enter your PIN to confirm</label>
              <input 
                type="password" 
                inputmode="numeric"
                maxlength="6"
                .value="${this.deleteProfilePin}"
                @input="${(e: any) => this.deleteProfilePin = e.target.value}"
                placeholder="Enter PIN"
              />
            </div>
            <div class="modal-actions">
              <button @click="${() => { this.showDeleteProfileModal = false; this.deleteProfilePin = ''; }}">
                Cancel
              </button>
              <button class="btn-danger" @click="${this.handleDeleteProfile}">
                Delete Profile
              </button>
            </div>
          </div>
        </div>
      ` : ''}

      ${this.showDeleteAllDataModal ? html`
        <div class="modal-overlay" @click="${() => this.showDeleteAllDataModal = false}">
          <div class="modal" @click="${(e: Event) => e.stopPropagation()}">
            <h3 style="color: var(--md-sys-color-error);">🚨 DELETE ALL DATA FROM ALL PROFILES</h3>
            <p style="margin-bottom: 16px; color: var(--md-sys-color-error); font-weight: bold;">
              ⚠️ EXTREME DANGER ZONE ⚠️
            </p>
            <p style="margin-bottom: 16px; color: var(--md-sys-color-on-surface);">
              This will permanently delete:<br/>
              • ALL profiles<br/>
              • ALL transactions, accounts, and categories from ALL profiles<br/>
              • ALL settings and rules<br/>
              <br/>
              The application will be reset to initial setup state. This action CANNOT be undone.
            </p>
            <div class="form-group">
              <label>Type "DELETE ALL" to confirm</label>
              <input 
                type="text"
                .value="${this.deleteAllDataConfirmText}"
                @input="${(e: any) => this.deleteAllDataConfirmText = e.target.value}"
                placeholder="Type DELETE ALL"
              />
            </div>
            <div class="modal-actions">
              <button @click="${() => { this.showDeleteAllDataModal = false; this.deleteAllDataConfirmText = ''; }}">
                Cancel
              </button>
              <button class="btn-danger" @click="${this.handleDeleteAllData}">
                Delete Everything
              </button>
            </div>
          </div>
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
    `;
    }
}
