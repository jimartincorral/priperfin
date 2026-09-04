import { LitElement, html, css, nothing } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { api, getApiBaseUrl, authApi, bankSyncApi } from '../api/client';
import { i18n } from '../i18n/i18n';
import { getAppBasePath } from '../utils/router-paths';
import {
  appBar,
  bottomSheet,
  icon,
  mobileUI,
  snackbar,
  watchMobileViewport,
  type SnackbarOptions,
} from '../styles/mobile-ui';

import 'emoji-picker-element';

/** The sub-screens the mobile settings list drills into. */
type SettingsSection =
  | 'profile'
  | 'accounts'
  | 'bankSync'
  | 'costObjects'
  | 'backup'
  | 'danger';

@customElement('view-settings')
export class ViewSettings extends LitElement {
    @state() categories: any[] = [];
    @state() accounts: any[] = [];
    @state() loading = false;
    @state() showAddForm = false;
    @state() editModeId: string | null = null;
    @state() categoryToDelete: string | null = null;
    @state() categoryForm: { name: string; icon: string; color: string; budget: number | null; type: string; parentId: string } = {
        name: '',
        icon: '',
        color: '#000000',
        budget: null,
        type: 'EXPENSE',
        parentId: '',
    };
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

    // Bank Sync management (Enable Banking)
    @state() bankSyncSettings = { hasAppId: false, hasKey: false, redirectUrl: null as string | null, autoSyncEnabled: true };
    @state() bankConnections: any[] = [];
    @state() showBankCredentialsForm = false;
    @state() bankAppId = '';
    @state() bankKey = '';
    @state() bankRedirectUrl = '';
    @state() showConnectBankModal = false;
    @state() bankCountry = 'ES';
    @state() availableBanks: any[] = [];
    @state() selectedBankName = 'Abanca';
    @state() bankSearchQuery = '';
    @state() loadingBanks = false;
    @state() bankSyncLoading = false;
    @state() bankConnecting = false;
    @state() bankAuthUrl: string | null = null;
    @state() initialLookbackDays = 90;

    // Cost Objects management
    @state() costObjects: any[] = [];
    @state() showCostObjectForm = false;
    @state() editCostObjectId: string | null = null;
    @state() costObjectForm = { name: '', icon: '', color: '#6366f1' };
    @state() costObjectToDelete: string | null = null;
    @state() showCostObjectEmojiPicker = false;

    // --- Mobile layer (<= 600px). The desktop scroll above the breakpoint is untouched. ---
    @state() isMobile = false;
    /** Sub-screen being shown, or null for the navigation list. */
    @state() mobileSection: SettingsSection | null = null;
    /** Which single-choice picker sheet is open, if any. */
    @state() enumSheet: 'language' | 'currency' | 'theme' | null = null;
    @state() theme = localStorage.getItem('priperfin_theme') || 'auto';
    @state() snack: SnackbarOptions | null = null;

    private unwatchViewport?: () => void;
    private snackTimer?: number;

    static styles = [css`
        :host {
            display: block;
        }

        .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 24px;
        }
        h1 {
            font: var(--md-sys-typescale-headline-medium);
            color: var(--md-sys-color-on-surface);
            margin: 0;
        }

        .section-title {
            font: var(--md-sys-typescale-title-large);
            margin-bottom: 16px;
            color: var(--md-sys-color-on-surface);
            margin-top: 32px;
        }

        .settings-group {
            background: var(--md-sys-color-surface-container-low);
            padding: 24px;
            border-radius: var(--md-sys-shape-corner-medium);
            margin-bottom: 24px;
            box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.12), 0 1px 2px 0 rgba(0, 0, 0, 0.24);
        }

        /* Form Elements */
        .form-group {
            margin-bottom: 16px;
        }
        label {
            display: block;
            margin-bottom: 8px;
            font: var(--md-sys-typescale-label-medium);
            color: var(--md-sys-color-on-surface-variant);
        }
        input,
        select,
        textarea {
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
        textarea {
            height: 100px;
            padding: 10px 16px;
            font-family: monospace;
            font-size: 0.85rem;
            resize: vertical;
        }
        input:focus,
        select:focus,
        textarea:focus {
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
            background: var(--md-sys-color-secondary-container);
            color: var(--md-sys-color-on-secondary-container);
        }
        button:hover {
            box-shadow: 0 1px 2px rgba(0, 0, 0, 0.12);
            background-image: linear-gradient(rgba(29, 25, 43, 0.08), rgba(29, 25, 43, 0.08));
        }
        .btn-primary {
            background-color: var(--md-sys-color-primary);
            color: var(--md-sys-color-on-primary);
            box-shadow: 0 1px 2px rgba(0, 0, 0, 0.12);
        }
        .btn-primary:hover {
            box-shadow: 0 1px 3px 1px rgba(0, 0, 0, 0.15);
            background-image: linear-gradient(rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.08));
        }
        .btn-secondary {
            background-color: var(--md-sys-color-surface-container-high);
            color: var(--md-sys-color-on-surface);
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
        .form-card h3 {
            margin-top: 0;
            font: var(--md-sys-typescale-title-medium);
            margin-bottom: 16px;
        }

        emoji-picker {
            position: relative;
            width: 350px;
            height: 350px;
            --emoji-size: 1.5rem;
            background: var(--md-sys-color-surface-container-high);
            border: 1px solid var(--md-sys-color-outline-variant);
            border-radius: 12px;
            box-shadow: var(--md-sys-elevation-3, 0 8px 16px rgba(0, 0, 0, 0.2));
            z-index: 1001;
        }

        :host([data-theme='dark']) emoji-picker {
            border-color: var(--md-sys-color-outline);
        }

        /* Tables */
        .table-container {
            overflow-x: auto;
            -webkit-overflow-scrolling: touch;
            border-radius: var(--md-sys-shape-corner-medium);
            border: 1px solid var(--md-sys-color-outline-variant);
            margin-bottom: 2rem;
            background: var(--md-sys-color-surface);
        }
        table {
            width: 100%;
            min-width: 500px;
            border-collapse: separate;
            border-spacing: 0;
            background: var(--md-sys-color-surface);
        }
        th,
        td {
            padding: 12px 16px;
            text-align: left;
            border-bottom: 1px solid var(--md-sys-color-outline-variant);
            vertical-align: middle;
            color: var(--md-sys-color-on-surface);
        }
        th {
            background: var(--md-sys-color-surface-container);
            font: var(--md-sys-typescale-title-small);
            color: var(--md-sys-color-on-surface-variant);
            text-transform: none;
            letter-spacing: 0.1px;
        }
        td {
            font: var(--md-sys-typescale-body-medium);
        }
        tr:last-child td {
            border-bottom: none;
        }
        tr:hover {
            background-color: var(--md-sys-color-surface-container-highest);
        }

        .category-icon {
            width: 32px;
            height: 32px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 8px;
            margin-right: 12px;
            font-size: 1.25rem;
        }

        .modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
        }
        .modal {
            background: var(--md-sys-color-surface-container-high);
            padding: 24px;
            border-radius: 28px;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
            max-width: 480px;
            width: 100%;
            color: var(--md-sys-color-on-surface);
            box-sizing: border-box;
            max-height: 90vh;
            overflow-y: auto;
        }
        .modal h3 {
            font: var(--md-sys-typescale-headline-small);
            margin-top: 0;
            color: var(--md-sys-color-on-surface);
            margin-bottom: 16px;
        }
        .modal p {
            color: var(--md-sys-color-on-surface-variant);
            font: var(--md-sys-typescale-body-medium);
            margin-bottom: 24px;
        }
        .modal-actions {
            display: flex;
            justify-content: flex-end;
            gap: 8px;
            margin-top: 20px;
        }

        .actions {
            display: flex;
            gap: 8px;
            flex-wrap: wrap;
        }

        /* Bank Sync Specific Styles */
        .bank-card {
            background: var(--md-sys-color-surface);
            border: 1px solid var(--md-sys-color-outline-variant);
            border-radius: 12px;
            padding: 16px;
            margin-bottom: 16px;
        }
        .bank-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 12px;
        }
        .bank-title {
            font-weight: 600;
            font-size: 1.1rem;
            display: flex;
            align-items: center;
            gap: 8px;
        }
        .status-badge {
            padding: 4px 10px;
            border-radius: 12px;
            font-size: 0.75rem;
            font-weight: 600;
            display: inline-flex;
            align-items: center;
            gap: 4px;
        }
        .status-active {
            background: rgba(16, 185, 129, 0.15);
            color: rgb(16, 185, 129);
        }
        .status-expiring {
            background: rgba(245, 158, 11, 0.15);
            color: rgb(245, 158, 11);
        }
        .status-expired {
            background: rgba(239, 68, 68, 0.15);
            color: rgb(239, 68, 68);
        }
        .status-pill {
            padding: 3px 8px;
            border-radius: 6px;
            font-size: 0.75rem;
            font-weight: 500;
        }

        @media (max-width: 600px) {
            .header {
                flex-direction: column;
                align-items: flex-start;
                gap: 1rem;
            }
            .section-title {
                margin-top: 1.5rem;
            }
            .settings-group {
                padding: 16px;
            }
            .table-container {
                border-top-right-radius: 0;
                border-bottom-right-radius: 0;
                border-right: none;
                margin-right: -1rem;
            }
        }

        /* ---------- mobile ---------- */

        .s-group + .s-group { margin-top: 20px; }
        .s-group-label { padding: 0 0 6px; }

        .s-row {
            display: flex;
            align-items: center;
            gap: 12px;
            min-height: 56px;
            padding: 8px 16px;
            margin: 0 -16px;
            width: calc(100% + 32px);
            box-sizing: border-box;
            border: none;
            border-bottom: 1px solid var(--md-sys-color-surface-container-high);
            background: none;
            text-align: left;
            color: var(--md-sys-color-on-surface);
            font: inherit;
            cursor: pointer;
        }
        .s-row:last-child { border-bottom: none; }
        .s-row .m-icon { color: var(--md-sys-color-on-surface-variant); }
        .s-row.danger,
        .s-row.danger .m-icon { color: var(--md-sys-color-error); }

        .s-row-label {
            flex: 1;
            min-width: 0;
            font: var(--md-sys-typescale-body-large);
        }
        .s-row-value {
            font: 400 14px/20px 'Roboto', sans-serif;
            color: var(--md-sys-color-on-surface-variant);
            white-space: nowrap;
        }
        .s-row-caption {
            font: 400 13px/16px 'Roboto', sans-serif;
            color: var(--md-sys-color-on-surface-variant);
        }

        .s-avatar {
            width: 36px;
            height: 36px;
            border-radius: 18px;
            background: var(--md-sys-color-primary-container);
            color: var(--md-sys-color-on-primary-container);
            display: inline-flex;
            align-items: center;
            justify-content: center;
            font: 500 16px/1 'Roboto', sans-serif;
            flex-shrink: 0;
        }

        /* Sub-screens reuse the desktop section markup, so undo its outer chrome */
        .s-subscreen .section-title { display: none; }
        .s-subscreen .settings-group {
            background: none;
            box-shadow: none;
            padding: 0;
            margin: 0;
            border-radius: 0;
        }
        .s-subscreen .table-container { margin: 0; border-right: none; }
    `, mobileUI];

    async firstUpdated() {
        const storedCurrency = localStorage.getItem('priperfin_currency');
        if (storedCurrency) this.currency = storedCurrency;
        await this.loadData();

        // Support opening add form via URL parameter
        const params = new URLSearchParams(window.location.search);
        if (params.get('add') === 'true') {
            this.showAddForm = true;
        }

        // Handle Bank Sync OAuth Callback (?code=...)
        if (params.has('code')) {
            const code = params.get('code')!;
            // Remove code from URL without triggering reload
            params.delete('code');
            params.delete('state');
            const newSearch = params.toString() ? `?${params.toString()}` : '';
            window.history.replaceState({}, '', `${window.location.pathname}${newSearch}`);
            await this.handleBankCallback(code);
        }
    }

    connectedCallback() {
        super.connectedCallback();
        i18n.addEventListener('lang-change', () => this.requestUpdate());
        this.unwatchViewport = watchMobileViewport(this);
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        i18n.removeEventListener('lang-change', () => this.requestUpdate());
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

    async loadData() {
        this.loading = true;
        try {
            const [cats, accts, costObjs, profile, allProfiles, bankSettings, bankConns] = await Promise.all([
                api.get('/categories'),
                api.get('/accounts'),
                api.get('/cost-objects'),
                authApi.getCurrentProfile().catch(() => null),
                authApi.getProfiles().catch(() => []),
                bankSyncApi.getSettings().catch(() => ({ hasAppId: false, hasKey: false, redirectUrl: null })),
                bankSyncApi.getConnections().catch(() => []),
            ]);
            this.categories = cats || [];
            this.accounts = accts || [];
            this.costObjects = costObjs || [];
            this.currentProfile = profile?.profile || null;
            this.profiles = allProfiles || [];
            this.bankSyncSettings = bankSettings || { hasAppId: false, hasKey: false, redirectUrl: null, autoSyncEnabled: true, initialLookbackDays: 90 };
            this.initialLookbackDays = bankSettings?.initialLookbackDays || 90;
            this.bankConnections = bankConns || [];
            if (bankSettings?.redirectUrl) {
                this.bankRedirectUrl = bankSettings.redirectUrl;
            } else if (!this.bankRedirectUrl) {
                this.bankRedirectUrl = `${window.location.origin}${getAppBasePath(document.baseURI)}settings`;
            }
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
        window.location.reload();
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
        if (!(await this.askConfirm(`⚠️ ${i18n.t('auth.settings.profileDataDeleteConfirm')}`, i18n.t('common.delete')))) return;

        try {
            await api.delete('/admin/reset');
            localStorage.removeItem('priperfin_total_savings');
            this.notify(i18n.t('auth.settings.profileDataResetSuccess'));
            const basePath = getAppBasePath(document.baseURI);
            window.location.href = new URL(basePath, window.location.origin).href;
        } catch (e: any) {
            console.error('Failed to reset profile data', e);
            this.notify(i18n.t('auth.settings.profileDataResetFailed') + ': ' + (e.message || i18n.t('common.unknown_error')));
        }
    }

    async handleDeleteProfile() {
        if (!this.deleteProfilePin) {
            this.notify(i18n.t('auth.settings.deleteProfilePinRequired'));
            return;
        }

        try {
            await api.delete('/auth/profile', { pin: this.deleteProfilePin });
            this.notify(i18n.t('auth.settings.profileDeletedSuccess'));
            this.showDeleteProfileModal = false;
            this.deleteProfilePin = '';
            const basePath = getAppBasePath(document.baseURI);
            window.location.href = new URL(basePath + 'login', window.location.origin).href;
        } catch (e: any) {
            this.notify(i18n.t('auth.settings.deleteProfileFailed') + ': ' + (e.message || i18n.t('common.unknown_error')));
        }
    }

    async handleDeleteAllData() {
        if (this.deleteAllDataConfirmText !== 'DELETE ALL') {
            this.notify(i18n.t('auth.settings.deleteAllConfirmError'));
            return;
        }

        try {
            await api.delete('/admin/reset-all');
            localStorage.clear();
            this.notify(i18n.t('auth.settings.deleteAllSuccess'));
            this.showDeleteAllDataModal = false;
            this.deleteAllDataConfirmText = '';
            const basePath = getAppBasePath(document.baseURI);
            window.location.href = new URL(basePath + 'setup', window.location.origin).href;
        } catch (e: any) {
            this.notify(i18n.t('auth.settings.deleteAllFailed') + ': ' + (e.message || i18n.t('common.unknown_error')));
        }
    }

    // ============= Profile Management =============
    async handleChangePin() {
        if (this.changePinForm.newPin !== this.changePinForm.confirmPin) {
            this.notify(i18n.t('auth.setup.pinMismatch'));
            return;
        }

        if (this.changePinForm.newPin.length < 4 || this.changePinForm.newPin.length > 6) {
            this.notify(i18n.t('auth.settings.pinLengthError'));
            return;
        }

        try {
            await authApi.changePin(this.changePinForm.oldPin, this.changePinForm.newPin);
            this.notify(i18n.t('auth.settings.pinChangedSuccess'));
            this.showChangePinModal = false;
            this.changePinForm = { oldPin: '', newPin: '', confirmPin: '' };
            const basePath = getAppBasePath(document.baseURI);
            window.location.href = new URL(basePath + 'login', window.location.origin).href;
        } catch (e: any) {
            this.notify(i18n.t('auth.settings.changePinFailed') + ': ' + (e.message || i18n.t('common.unknown_error')));
        }
    }

    async handleCreateProfile() {
        if (!this.createProfileForm.name || this.createProfileForm.name.length < 3) {
            this.notify(i18n.t('auth.settings.profileNameLengthError'));
            return;
        }

        if (this.createProfileForm.pin !== this.createProfileForm.confirmPin) {
            this.notify(i18n.t('auth.setup.pinMismatch'));
            return;
        }

        if (this.createProfileForm.pin.length < 4 || this.createProfileForm.pin.length > 6) {
            this.notify(i18n.t('auth.settings.pinLengthError'));
            return;
        }

        try {
            await authApi.createProfile(this.createProfileForm.name, this.createProfileForm.pin);
            this.notify(i18n.t('auth.settings.createProfileSuccess').replace('{name}', this.createProfileForm.name));
            this.showCreateProfileModal = false;
            this.createProfileForm = { name: '', pin: '', confirmPin: '' };
            await this.loadData();
        } catch (e: any) {
            this.notify(i18n.t('auth.settings.createProfileFailed') + ': ' + (e.message || i18n.t('common.unknown_error')));
        }
    }

    async handleLogout() {
        try {
            await authApi.logout();
            const basePath = getAppBasePath(document.baseURI);
            window.location.href = new URL(basePath + 'login', window.location.origin).href;
        } catch (e: any) {
            console.error('Logout failed:', e);
            api.clearSession();
            const basePath = getAppBasePath(document.baseURI);
            window.location.href = new URL(basePath + 'login', window.location.origin).href;
        }
    }

    async createBackup() {
        this.backupLoading = true;
        try {
            const response = await api.post('/backup/create', {
                encryptionKey: this.encryptionKey || undefined,
            });
            const { filename, downloadUrl } = response;
            const endpoint = downloadUrl.startsWith('/api') ? downloadUrl.substring(4) : downloadUrl;
            const blob = await api.download(endpoint);

            const blobUrl = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = blobUrl;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(blobUrl);

            this.notify(i18n.t('settings.backup_created'));
            this.encryptionKey = '';
        } catch (e: any) {
            console.error('[ViewSettings] Backup creation failed:', e);
            this.notify(i18n.t('settings.backup_failed') + ': ' + (e.message || 'Unknown error'));
        } finally {
            this.backupLoading = false;
        }
    }

    async restoreBackup(event: Event) {
        const input = event.target as HTMLInputElement;
        if (!input.files || input.files.length === 0) return;

        const file = input.files[0];

        if (!(await this.askConfirm(i18n.t('settings.restore_warning'), i18n.t('settings.restore_backup')))) {
            input.value = '';
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

            const token = localStorage.getItem('session_token');
            const headers: HeadersInit = {};
            if (token) {
                headers['X-Session-Token'] = token;
            }

            const response = await fetch(`${getApiBaseUrl()}/backup/restore`, {
                method: 'POST',
                headers: headers,
                body: formData,
                credentials: 'same-origin',
            });

            if (!response.ok) {
                let errorMessage;
                try {
                    const resJson = await response.json();
                    const extractMessage = (obj: any): string | null => {
                        if (!obj) return null;
                        if (typeof obj === 'string') return obj;
                        if (obj.message) {
                            if (typeof obj.message === 'string') return obj.message;
                            if (Array.isArray(obj.message)) return obj.message.join(', ');
                            return JSON.stringify(obj.message);
                        }
                        if (obj.error && typeof obj.error === 'string') return obj.error;
                        return null;
                    };

                    errorMessage = extractMessage(resJson);
                    if (!errorMessage && resJson.error) {
                        errorMessage = extractMessage(resJson.error);
                    }
                    if (!errorMessage) {
                        errorMessage = typeof resJson.error === 'string' ? resJson.error : 'Restore failed';
                    }
                } catch (e) {
                    console.warn('Failed to parse error JSON:', e);
                    const text = await response.text();
                    errorMessage = text || `Restore failed with status ${response.status}`;
                }
                throw new Error(errorMessage);
            }

            this.notify(i18n.t('settings.backup_restored'));
            this.decryptionKey = '';
            window.location.reload();
        } catch (e: any) {
            console.error('Failed to restore backup', e);
            this.notify(i18n.t('settings.restore_failed') + ':\n\n' + e.message);
        } finally {
            this.restoreLoading = false;
            input.value = '';
        }
    }

    // ============= Bank Sync Management (Enable Banking) =============
    async saveBankCredentials() {
        if (!this.bankAppId && !this.bankKey && !this.bankRedirectUrl) {
            this.notify('Please fill in at least one field');
            return;
        }

        this.loading = true;
        try {
            const result = await bankSyncApi.saveSettings({
                appId: this.bankAppId ? this.bankAppId.trim() : undefined,
                key: this.bankKey ? this.bankKey.trim() : undefined,
                redirectUrl: this.bankRedirectUrl ? this.bankRedirectUrl.trim() : undefined,
            });
            this.bankSyncSettings = result;
            this.showBankCredentialsForm = false;
            this.bankKey = '';
            this.notify(i18n.t('bank_sync.credentials_saved'));
        } catch (e: any) {
            console.error('Failed to save bank credentials', e);
            this.notify(i18n.t('bank_sync.save_failed') + ': ' + (e.message || 'Unknown error'));
        } finally {
            this.loading = false;
        }
    }

    async toggleAutoSync(e: Event) {
        const checkbox = e.target as HTMLInputElement;
        const autoSyncEnabled = checkbox.checked;
        try {
            const result = await bankSyncApi.saveSettings({ autoSyncEnabled });
            this.bankSyncSettings = { ...this.bankSyncSettings, ...result };
        } catch (e: any) {
            console.error('Failed to update auto-sync setting', e);
            checkbox.checked = !autoSyncEnabled;
            this.notify(i18n.t('bank_sync.save_failed') + ': ' + (e.message || 'Unknown error'));
        }
    }

    async updateInitialLookback(days: number) {
        this.initialLookbackDays = days;
        try {
            const result = await bankSyncApi.saveSettings({ initialLookbackDays: days });
            this.bankSyncSettings = { ...this.bankSyncSettings, ...result };
        } catch (e: any) {
            console.error('Failed to update initial lookback setting', e);
            this.notify(i18n.t('bank_sync.save_failed') + ': ' + (e.message || 'Unknown error'));
        }
    }

    handleKeyFileUpload(e: Event) {
        const input = e.target as HTMLInputElement;
        if (!input.files || input.files.length === 0) return;
        const file = input.files[0];
        const reader = new FileReader();
        reader.onload = (event) => {
            if (event.target?.result) {
                this.bankKey = event.target.result as string;
            }
        };
        reader.readAsText(file);
    }

    async openConnectBankModal() {
        if (!this.bankSyncSettings.hasAppId || !this.bankSyncSettings.hasKey) {
            this.notify('Please configure your Enable Banking Application ID and Private Key first.');
            this.showBankCredentialsForm = true;
            return;
        }
        this.bankAuthUrl = null;
        this.showConnectBankModal = true;
        await this.loadBanksForCountry(this.bankCountry);
    }

    async loadBanksForCountry(country: string) {
        this.loadingBanks = true;
        this.bankCountry = country;
        this.bankAuthUrl = null;
        try {
            const banks = await bankSyncApi.getBanks(country);
            this.availableBanks = banks || [];
            if (this.availableBanks.length > 0) {
                const abanca = this.availableBanks.find((b: any) => b.name.toLowerCase().includes('abanca'));
                this.selectedBankName = abanca ? abanca.name : this.availableBanks[0].name;
            }
        } catch (e: any) {
            console.error('Failed to load banks', e);
            this.notify(i18n.t('bank_sync.loading_banks') + ' ' + (e.message || 'Unknown error'));
        } finally {
            this.loadingBanks = false;
        }
    }

    async connectBank() {
        if (!this.selectedBankName) {
            this.notify('Please select a bank');
            return;
        }

        this.bankConnecting = true;
        this.bankAuthUrl = null;
        try {
            const redirectUrl = this.bankRedirectUrl || `${window.location.origin}${getAppBasePath(document.baseURI)}settings`;
            const result = await bankSyncApi.startAuth({
                aspspName: this.selectedBankName,
                country: this.bankCountry,
                redirectUrl,
            });

            if (result?.url) {
                this.bankAuthUrl = result.url;
                
                // Banking authorization cannot run inside an iframe (Home Assistant Ingress) due to X-Frame-Options: DENY.
                // We navigate the top browser window or open in a new tab/window.
                if (window.top && window.top !== window) {
                    try {
                        window.top.location.href = result.url;
                        return;
                    } catch (e) {
                        // If cross-origin iframe security blocks window.top, open in a new window/tab
                        window.open(result.url, '_blank', 'noopener,noreferrer');
                    }
                } else {
                    window.location.href = result.url;
                }
            } else {
                throw new Error('No authorization URL returned by bank sync API');
            }
        } catch (e: any) {
            console.error('Failed to start bank authorization', e);
            this.notify(i18n.t('bank_sync.sync_failed') + ': ' + (e.message || 'Unknown error'));
        } finally {
            this.bankConnecting = false;
        }
    }

    async handleBankCallback(code: string) {
        this.bankSyncLoading = true;
        try {
            const result = await bankSyncApi.handleCallback(code);
            this.notify(`Bank ${result.aspspName} connected successfully! Detected ${result.accounts?.length || 0} account(s).`);
            await this.loadData();
        } catch (e: any) {
            console.error('Failed to complete bank connection callback', e);
            this.notify('Bank connection callback failed: ' + (e.message || 'Unknown error'));
        } finally {
            this.bankSyncLoading = false;
        }
    }

    async promptManualCode() {
        const input = prompt(i18n.t('bank_sync.paste_code_prompt') || 'Paste the redirect URL or code here (e.g. https://.../?code=...):');
        if (!input) return;
        let code = input.trim();
        if (code.includes('code=')) {
            const match = code.match(/[?&]code=([^&]+)/);
            if (match) {
                code = decodeURIComponent(match[1]);
            }
        }
        await this.handleBankCallback(code);
    }

    async disconnectBank(connectionId: string, bankName: string) {
        if (!(await this.askConfirm(i18n.t('bank_sync.disconnect_confirm').replace('{bank}', bankName), i18n.t('bank_sync.disconnect')))) {
            return;
        }

        try {
            await bankSyncApi.deleteConnection(connectionId);
            await this.loadData();
        } catch (e: any) {
            console.error('Failed to disconnect bank', e);
            this.notify('Failed to disconnect bank: ' + (e.message || 'Unknown error'));
        }
    }

    async handleLinkAccount(accountId: string, bankAccountUid: string, connectionId: string) {
        try {
            await bankSyncApi.linkAccount(accountId, bankAccountUid, connectionId);
            this.notify(i18n.t('bank_sync.account_linked'));
            await this.loadData();
        } catch (e: any) {
            console.error('Failed to link account', e);
            this.notify('Failed to link account: ' + (e.message || 'Unknown error'));
        }
    }

    async handleUnlinkAccount(accountId: string) {
        try {
            await bankSyncApi.unlinkAccount(accountId);
            this.notify(i18n.t('bank_sync.account_unlinked'));
            await this.loadData();
        } catch (e: any) {
            console.error('Failed to unlink account', e);
            this.notify('Failed to unlink account: ' + (e.message || 'Unknown error'));
        }
    }

    async syncBankNow(accountId?: string) {
        this.bankSyncLoading = true;
        try {
            const result = await bankSyncApi.syncTransactions(accountId);
            const expiredAcc = result?.accountsSynced?.find((a: any) => a.status === 'EXPIRED');
            const errorAcc = result?.accountsSynced?.find((a: any) => a.status === 'ERROR');

            if (expiredAcc) {
                this.notify(`⚠️ ${expiredAcc.accountName}: ${expiredAcc.message || 'La sesión del banco ha expirado. Por favor, haz clic en "Re-autenticar" en Configuración.'}`);
            } else if (errorAcc && (result?.newCount ?? 0) === 0 && (result?.duplicateCount ?? 0) === 0) {
                this.notify(`⚠️ ${errorAcc.accountName}: ${errorAcc.message || 'Error al sincronizar con el banco.'}`);
            } else {
                const msg = i18n.t('bank_sync.sync_success')
                    .replace('{newCount}', String(result?.newCount || '0'))
                    .replace('{duplicateCount}', String(result?.duplicateCount || '0'));
                this.notify(msg);
            }
            await this.loadData();
        } catch (e: any) {
            console.error('Bank sync failed', e);
            this.notify(i18n.t('bank_sync.sync_failed') + ': ' + (e.message || 'Unknown error'));
        } finally {
            this.bankSyncLoading = false;
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
            parentId: cat.parentId || '',
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
            const payload = {
                name: this.categoryForm.name,
                icon: this.categoryForm.icon,
                budget: this.categoryForm.type === 'EXPENSE' ? this.categoryForm.budget : null,
                type: this.categoryForm.type,
                parentId: this.categoryForm.parentId || null,
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
            this.notify('Failed to save category: ' + (e.message || 'Unknown error'));
        }
    }

    async deleteCategory(id: string) {
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
            type: account.type || 'DEBIT',
        };
        this.editAccountId = account.id;
        this.showAccountForm = true;
    }

    async saveAccount() {
        if (!this.accountForm.name) {
            this.notify('Please enter an account name');
            return;
        }

        try {
            const payload = {
                name: this.accountForm.name,
                initialBalance: this.accountForm.initialBalance,
                type: this.accountForm.type,
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
            this.notify('Failed to save account: ' + (e.message || 'Unknown error'));
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
            this.notify('Failed to delete account: ' + (e.message || 'Unknown error'));
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
            color: costObject.color || '#6366f1',
        };
        this.editCostObjectId = costObject.id;
        this.showCostObjectForm = true;
    }

    async saveCostObject() {
        if (!this.costObjectForm.name || !this.costObjectForm.icon) {
            this.notify('Please enter a name and select an icon');
            return;
        }

        try {
            const payload = {
                name: this.costObjectForm.name,
                icon: this.costObjectForm.icon,
                color: this.costObjectForm.color,
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
            this.notify('Failed to save cost object: ' + (e.message || 'Unknown error'));
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
            this.notify('Failed to delete cost object: ' + (e.message || 'Unknown error'));
        }
    }

    renderCategoryTable(categories: any[], showParentChild = false, showBudget = true) {
        const symbol = this.currency === 'EUR' ? '€' : '$';

        let rows = categories;
        if (showParentChild) {
            rows = [];
            const parents = categories.filter((c) => !c.parentId);
            parents.forEach((p) => {
                rows.push({ ...p, level: 0 });
                const children = categories.filter((c) => c.parentId === p.id);
                children.forEach((c) => rows.push({ ...c, level: 1 }));
            });
        }

        if (rows.length === 0)
            return html`<p style="color: #666; font-style: italic; padding: 1rem;">${i18n.t('common.no_data')}</p>`;

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
                        ${rows.map(
                            (cat: any) => html`
                                <tr>
                                    <td>
                                        <div
                                            style="display: flex; align-items: center; padding-left: ${cat.level ? cat.level * 2 : 0}rem;"
                                        >
                                            <span
                                                class="category-icon"
                                                style="color: ${cat.color}; background: ${cat.color}20;"
                                            >
                                                ${cat.icon}
                                            </span>
                                            <span style="font-weight: ${cat.level === 0 ? '600' : '400'}">
                                                ${cat.name}
                                            </span>
                                        </div>
                                    </td>
                                    ${showBudget
                                        ? html` <td>
                                              ${cat.budget
                                                  ? html`${symbol}${cat.budget}`
                                                  : html`<span style="color: #ccc">-</span>`}
                                          </td>`
                                        : ''}
                                    <td>
                                        <div class="actions">
                                            <button @click="${() => this.startEdit(cat)}">${i18n.t('common.edit')}</button>
                                            <button class="btn-danger" @click="${() => this.deleteCategory(cat.id)}">
                                                🗑
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            `,
                        )}
                    </tbody>
                </table>
            </div>
        `;
    }

    render() {
        if (this.isMobile) return this.renderMobile();

        return html`
            <div class="header">
                <h1>${i18n.t('settings.title')}</h1>
            </div>

            ${this.renderGeneralSection()}
            ${this.renderProfileSection()}
            ${this.renderAccountsSection()}
            ${this.renderBankSyncSection()}
            ${this.renderCostObjectsSection()}
            ${this.renderCategoriesSection()}
            ${this.renderBackupSection()}
            ${this.renderDangerSection()}

            ${this.renderModals()}
        `;
    }

    // ------------------------------------------------------------------
    // Mobile layout: a navigation list that drills into the sections
    // ------------------------------------------------------------------

    private currencyLabel(): string {
        const labels: Record<string, string> = {
            USD: 'USD ($)', EUR: 'EUR (€)', GBP: 'GBP (£)',
            JPY: 'JPY (¥)', CAD: 'CAD ($)', AUD: 'AUD ($)',
        };
        return labels[this.currency] || this.currency;
    }

    private themeLabel(): string {
        if (this.theme === 'light') return i18n.t('settings.theme_light');
        if (this.theme === 'dark') return i18n.t('settings.theme_dark');
        return i18n.t('settings.theme_auto');
    }

    private lastSyncLabel(): string {
        const dates = this.accounts
            .map(a => a.lastSyncedAt)
            .filter(Boolean)
            .map(d => new Date(d).getTime());
        if (dates.length === 0) return i18n.t('bank_sync.never_synced');
        const latest = new Date(Math.max(...dates));
        return i18n.t('bank_sync.last_synced').replace(
            '{date}',
            latest.toLocaleString(i18n.getLocale(), {
                day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
            }),
        );
    }

    private bankStatus(): { label: string; ok: boolean } | null {
        if (this.bankConnections.length === 0) return null;
        const expired = this.bankConnections.some((c: any) => c.status === 'EXPIRED');
        return expired
            ? { label: i18n.t('bank_sync.status_expired'), ok: false }
            : { label: i18n.t('bank_sync.status_active'), ok: true };
    }

    private settingsRow(opts: {
        glyph: string;
        label: string;
        value?: unknown;
        caption?: string;
        pill?: { label: string; ok: boolean };
        danger?: boolean;
        avatar?: string;
        onSelect: () => void;
    }) {
        return html`
            <button class="s-row ${opts.danger ? 'danger' : ''}" @click="${opts.onSelect}">
                ${opts.avatar
                    ? html`<span class="s-avatar">${opts.avatar}</span>`
                    : icon(opts.glyph, 22)}
                <span class="s-row-label">
                    ${opts.label}
                    ${opts.caption ? html`<div class="s-row-caption">${opts.caption}</div>` : nothing}
                </span>
                ${opts.pill
                    ? html`<span class="m-pill ${opts.pill.ok ? 'ok' : 'behind'}">${opts.pill.label}</span>`
                    : nothing}
                ${opts.value !== undefined ? html`<span class="s-row-value">${opts.value}</span>` : nothing}
                ${icon('chevron_right', 22)}
            </button>
        `;
    }

    /** Single-choice pickers for the three enum settings. */
    private renderEnumSheet() {
        const configs = {
            language: {
                title: i18n.t('settings.language'),
                options: [
                    { value: 'en', label: 'English' },
                    { value: 'es', label: 'Español' },
                ],
                current: i18n.getLocale(),
                apply: (value: string) => this.handleLanguageChange({ target: { value } } as any),
            },
            currency: {
                title: i18n.t('common.currency'),
                options: [
                    { value: 'USD', label: 'USD ($)' },
                    { value: 'EUR', label: 'EUR (€)' },
                    { value: 'GBP', label: 'GBP (£)' },
                    { value: 'JPY', label: 'JPY (¥)' },
                    { value: 'CAD', label: 'CAD ($)' },
                    { value: 'AUD', label: 'AUD ($)' },
                ],
                current: this.currency,
                apply: (value: string) => this.handleCurrencyChange({ target: { value } } as any),
            },
            theme: {
                title: i18n.t('settings.theme'),
                options: [
                    { value: 'auto', label: i18n.t('settings.theme_auto') },
                    { value: 'light', label: i18n.t('settings.theme_light') },
                    { value: 'dark', label: i18n.t('settings.theme_dark') },
                ],
                current: this.theme,
                apply: (value: string) => { this.theme = value; this.handleThemeChange(value); },
            },
        };

        const config = this.enumSheet ? configs[this.enumSheet] : null;

        return bottomSheet({
            open: config !== null,
            onDismiss: () => { this.enumSheet = null; },
            content: config
                ? html`
                    <div class="m-sheet-title">${config.title}</div>
                    <div>
                        ${config.options.map(option => html`
                            <button
                                class="m-row"
                                @click="${() => {
                                    this.enumSheet = null;
                                    if (option.value !== config.current) config.apply(option.value);
                                }}">
                                <span class="m-row-main">
                                    <span class="m-row-primary">${option.label}</span>
                                </span>
                                ${option.value === config.current ? icon('check', 20) : nothing}
                            </button>
                        `)}
                    </div>
                `
                : nothing,
        });
    }

    private renderConfirmSheet() {
        return bottomSheet({
            open: this.pendingConfirm !== null,
            onDismiss: () => this.settleConfirm(false),
            content: html`
                <div class="m-subtitle" style="white-space: pre-line">
                    ${this.pendingConfirm?.message ?? ''}
                </div>
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

    /** One sub-screen: the desktop section markup under a back app bar. */
    private renderMobileSubScreen(section: SettingsSection) {
        const screens: Record<SettingsSection, { title: string; body: unknown }> = {
            profile: { title: i18n.t('auth.settings.title'), body: this.renderProfileSection() },
            accounts: { title: i18n.t('accounts.title'), body: this.renderAccountsSection() },
            bankSync: { title: i18n.t('bank_sync.title'), body: this.renderBankSyncSection() },
            costObjects: { title: i18n.t('cost_objects.title'), body: this.renderCostObjectsSection() },
            backup: { title: i18n.t('settings.backup_restore'), body: this.renderBackupSection() },
            danger: { title: i18n.t('mobile.danger_zone'), body: this.renderDangerSection() },
        };
        const screen = screens[section];

        return html`
            <div class="m-screen s-subscreen">
                ${appBar({
                    title: screen.title,
                    onBack: () => { this.mobileSection = null; },
                })}
                ${screen.body}
                ${this.renderModals()}
                ${this.renderConfirmSheet()}
                ${snackbar(this.snack)}
            </div>
        `;
    }

    private renderMobile() {
        if (this.mobileSection) return this.renderMobileSubScreen(this.mobileSection);

        const profileInitial = (this.currentProfile?.name || '?').charAt(0).toUpperCase();
        const pinLength = this.currentProfile?.pinLength;

        return html`
            <div class="m-screen">
                <div class="m-title-row">
                    <h1 class="m-title">${i18n.t('settings.title')}</h1>
                </div>

                <div class="s-group">
                    <div class="m-section-label s-group-label">${i18n.t('mobile.group_general')}</div>
                    ${this.settingsRow({
                        glyph: 'language',
                        label: i18n.t('settings.language'),
                        value: i18n.getLocale() === 'es' ? 'Español' : 'English',
                        onSelect: () => { this.enumSheet = 'language'; },
                    })}
                    ${this.settingsRow({
                        glyph: 'payments',
                        label: i18n.t('common.currency'),
                        value: this.currencyLabel(),
                        onSelect: () => { this.enumSheet = 'currency'; },
                    })}
                    ${this.settingsRow({
                        glyph: 'dark_mode',
                        label: i18n.t('settings.theme'),
                        value: this.themeLabel(),
                        onSelect: () => { this.enumSheet = 'theme'; },
                    })}
                </div>

                <div class="s-group">
                    <div class="m-section-label s-group-label">${i18n.t('mobile.group_data')}</div>
                    ${this.settingsRow({
                        glyph: 'account_balance',
                        label: i18n.t('accounts.title'),
                        value: this.accounts.length,
                        onSelect: () => { this.mobileSection = 'accounts'; },
                    })}
                    ${this.settingsRow({
                        glyph: 'sync',
                        label: i18n.t('bank_sync.sync_all'),
                        caption: this.lastSyncLabel(),
                        pill: this.bankStatus() ?? undefined,
                        onSelect: () => { this.mobileSection = 'bankSync'; },
                    })}
                    ${this.settingsRow({
                        glyph: 'work',
                        label: i18n.t('cost_objects.title'),
                        value: this.costObjects.length,
                        onSelect: () => { this.mobileSection = 'costObjects'; },
                    })}
                    ${this.settingsRow({
                        glyph: 'backup',
                        label: i18n.t('settings.backup_restore'),
                        onSelect: () => { this.mobileSection = 'backup'; },
                    })}
                </div>

                <div class="s-group">
                    <div class="m-section-label s-group-label">${i18n.t('mobile.group_profile')}</div>
                    ${this.settingsRow({
                        glyph: 'person',
                        avatar: profileInitial,
                        label: this.currentProfile?.name || i18n.t('auth.settings.currentProfile'),
                        caption: pinLength ? i18n.t('mobile.pin_digits', { count: pinLength }) : undefined,
                        onSelect: () => { this.mobileSection = 'profile'; },
                    })}
                    <button class="s-row" @click="${this.handleLogout}">
                        ${icon('logout', 22)}
                        <span class="s-row-label">${i18n.t('mobile.log_out')}</span>
                    </button>
                    ${this.settingsRow({
                        glyph: 'warning',
                        label: i18n.t('mobile.danger_zone'),
                        danger: true,
                        onSelect: () => { this.mobileSection = 'danger'; },
                    })}
                </div>

                ${this.renderEnumSheet()}
                ${this.renderConfirmSheet()}
                ${snackbar(this.snack)}
            </div>
        `;
    }

    /** Dialogs shared by both layouts. */
    renderModals() {
        const countryOptions = [
            { code: 'ES', name: '🇪🇸 Spain' },
            { code: 'PT', name: '🇵🇹 Portugal' },
            { code: 'FR', name: '🇫🇷 France' },
            { code: 'DE', name: '🇩🇪 Germany' },
            { code: 'IT', name: '🇮🇹 Italy' },
            { code: 'NL', name: '🇳🇱 Netherlands' },
            { code: 'IE', name: '🇮🇪 Ireland' },
            { code: 'BE', name: '🇧🇪 Belgium' },
            { code: 'AT', name: '🇦🇹 Austria' },
            { code: 'PL', name: '🇵🇱 Poland' },
        ];

        return html`
            <!-- Modals -->
            ${this.showChangePinModal
                ? html`
                      <div class="modal-overlay" @click="${() => (this.showChangePinModal = false)}">
                          <div class="modal" @click="${(e: Event) => e.stopPropagation()}">
                              <h3>${i18n.t('auth.settings.changePin')}</h3>
                              <div class="form-group">
                                  <label>${i18n.t('auth.settings.currentPin')}</label>
                                  <input
                                      type="password"
                                      inputmode="numeric"
                                      maxlength="6"
                                      .value="${this.changePinForm.oldPin}"
                                      @input="${(e: any) =>
                                          (this.changePinForm = { ...this.changePinForm, oldPin: e.target.value })}"
                                      placeholder="${i18n.t('auth.settings.currentPinPlaceholder')}"
                                  />
                              </div>
                              <div class="form-group">
                                  <label>${i18n.t('auth.settings.newPinLabel')}</label>
                                  <input
                                      type="password"
                                      inputmode="numeric"
                                      maxlength="6"
                                      .value="${this.changePinForm.newPin}"
                                      @input="${(e: any) =>
                                          (this.changePinForm = { ...this.changePinForm, newPin: e.target.value })}"
                                      placeholder="${i18n.t('auth.settings.newPinPlaceholder')}"
                                  />
                              </div>
                              <div class="form-group">
                                  <label>${i18n.t('auth.settings.confirmNewPin')}</label>
                                  <input
                                      type="password"
                                      inputmode="numeric"
                                      maxlength="6"
                                      .value="${this.changePinForm.confirmPin}"
                                      @input="${(e: any) =>
                                          (this.changePinForm = {
                                              ...this.changePinForm,
                                              confirmPin: e.target.value,
                                          })}"
                                      placeholder="${i18n.t('auth.settings.confirmNewPinPlaceholder')}"
                                  />
                              </div>
                              <div class="modal-actions">
                                  <button
                                      class="btn-secondary"
                                      @click="${() => {
                                          this.showChangePinModal = false;
                                          this.changePinForm = { oldPin: '', newPin: '', confirmPin: '' };
                                      }}"
                                  >
                                      ${i18n.t('common.cancel')}
                                  </button>
                                  <button class="btn-primary" @click="${this.handleChangePin}">
                                      ${i18n.t('common.save')}
                                  </button>
                              </div>
                          </div>
                      </div>
                  `
                : ''}
            ${this.showCreateProfileModal
                ? html`
                      <div class="modal-overlay" @click="${() => (this.showCreateProfileModal = false)}">
                          <div class="modal" @click="${(e: Event) => e.stopPropagation()}">
                              <h3>${i18n.t('auth.settings.createProfile')}</h3>
                              <div class="form-group">
                                  <label>${i18n.t('auth.settings.profileName')}</label>
                                  <input
                                      type="text"
                                      .value="${this.createProfileForm.name}"
                                      @input="${(e: any) =>
                                          (this.createProfileForm = { ...this.createProfileForm, name: e.target.value })}"
                                      placeholder="${i18n.t('auth.settings.profileNamePlaceholder')}"
                                  />
                              </div>
                              <div class="form-group">
                                  <label>${i18n.t('auth.settings.pinLabel')}</label>
                                  <input
                                      type="password"
                                      inputmode="numeric"
                                      maxlength="6"
                                      .value="${this.createProfileForm.pin}"
                                      @input="${(e: any) =>
                                          (this.createProfileForm = { ...this.createProfileForm, pin: e.target.value })}"
                                      placeholder="${i18n.t('auth.settings.pinPlaceholder')}"
                                  />
                              </div>
                              <div class="form-group">
                                  <label>${i18n.t('auth.settings.confirmPin')}</label>
                                  <input
                                      type="password"
                                      inputmode="numeric"
                                      maxlength="6"
                                      .value="${this.createProfileForm.confirmPin}"
                                      @input="${(e: any) =>
                                          (this.createProfileForm = {
                                              ...this.createProfileForm,
                                              confirmPin: e.target.value,
                                          })}"
                                      placeholder="${i18n.t('auth.settings.confirmPinPlaceholder')}"
                                  />
                              </div>
                              <div class="modal-actions">
                                  <button
                                      class="btn-secondary"
                                      @click="${() => {
                                          this.showCreateProfileModal = false;
                                          this.createProfileForm = { name: '', pin: '', confirmPin: '' };
                                      }}"
                                  >
                                      ${i18n.t('common.cancel')}
                                  </button>
                                  <button class="btn-primary" @click="${this.handleCreateProfile}">
                                      ${i18n.t('common.save')}
                                  </button>
                              </div>
                          </div>
                      </div>
                  `
                : ''}
            ${this.showDeleteProfileModal
                ? html`
                      <div class="modal-overlay" @click="${() => (this.showDeleteProfileModal = false)}">
                          <div class="modal" @click="${(e: Event) => e.stopPropagation()}">
                              <h3 style="color: var(--md-sys-color-error);">
                                  ⚠️ ${i18n.t('settings.delete_profile_confirm')}
                              </h3>
                              <p style="margin-bottom: 16px; color: var(--md-sys-color-on-surface);">
                                  ${i18n.t('settings.delete_profile_modal_warning')} "<strong
                                      >${this.currentProfile?.name}</strong
                                  >" ${i18n.t('settings.delete_profile_modal_suffix')}
                              </p>
                              <div class="form-group">
                                  <label>${i18n.t('settings.enter_pin_to_confirm')}</label>
                                  <input
                                      type="password"
                                      inputmode="numeric"
                                      maxlength="6"
                                      .value="${this.deleteProfilePin}"
                                      @input="${(e: any) => (this.deleteProfilePin = e.target.value)}"
                                      placeholder="${i18n.t('settings.enter_pin')}"
                                  />
                              </div>
                              <div class="modal-actions">
                                  <button
                                      class="btn-secondary"
                                      @click="${() => {
                                          this.showDeleteProfileModal = false;
                                          this.deleteProfilePin = '';
                                      }}"
                                  >
                                      ${i18n.t('common.cancel')}
                                  </button>
                                  <button class="btn-danger" @click="${this.handleDeleteProfile}">
                                      ${i18n.t('settings.delete_profile_confirm')}
                                  </button>
                              </div>
                          </div>
                      </div>
                  `
                : ''}
            ${this.showDeleteAllDataModal
                ? html`
                      <div class="modal-overlay" @click="${() => (this.showDeleteAllDataModal = false)}">
                          <div class="modal" @click="${(e: Event) => e.stopPropagation()}">
                              <h3 style="color: var(--md-sys-color-error);">
                                  🚨 ${i18n.t('settings.delete_all_modal_title')}
                              </h3>
                              <p style="margin-bottom: 16px; color: var(--md-sys-color-error); font-weight: bold;">
                                  ⚠️ ${i18n.t('settings.extreme_danger_zone')} ⚠️
                              </p>
                              <p style="margin-bottom: 16px; color: var(--md-sys-color-on-surface);">
                                  ${i18n.t('settings.delete_all_modal_intro')}<br />
                                  • ${i18n.t('settings.delete_all_modal_item_profiles')}<br />
                                  • ${i18n.t('settings.delete_all_modal_item_data')}<br />
                                  • ${i18n.t('settings.delete_all_modal_item_settings')}<br />
                                  <br />
                                  ${i18n.t('settings.delete_all_modal_outro')}
                              </p>
                              <div class="form-group">
                                  <label>${i18n.t('settings.type_delete_all_confirm')}</label>
                                  <input
                                      type="text"
                                      .value="${this.deleteAllDataConfirmText}"
                                      @input="${(e: any) => (this.deleteAllDataConfirmText = e.target.value)}"
                                      placeholder="${i18n.t('settings.type_delete_all_placeholder')}"
                                  />
                              </div>
                              <div class="modal-actions">
                                  <button
                                      class="btn-secondary"
                                      @click="${() => {
                                          this.showDeleteAllDataModal = false;
                                          this.deleteAllDataConfirmText = '';
                                      }}"
                                  >
                                      ${i18n.t('common.cancel')}
                                  </button>
                                  <button class="btn-danger" @click="${this.handleDeleteAllData}">
                                      ${i18n.t('settings.delete_everything')}
                                  </button>
                              </div>
                          </div>
                      </div>
                  `
                : ''}
            ${this.accountToDelete
                ? html`
                      <div class="modal-overlay" @click="${() => (this.accountToDelete = null)}">
                          <div class="modal" @click="${(e: Event) => e.stopPropagation()}">
                              <h3>${i18n.t('accounts.delete_account')}</h3>
                              <p>${i18n.t('accounts.delete_account_warning')}</p>
                              <div class="modal-actions">
                                  <button class="btn-secondary" @click="${() => (this.accountToDelete = null)}">
                                      ${i18n.t('common.cancel')}
                                  </button>
                                  <button class="btn-danger" @click="${this.confirmDeleteAccount}">
                                      ${i18n.t('common.delete')}
                                  </button>
                              </div>
                          </div>
                      </div>
                  `
                : ''}
            ${this.costObjectToDelete
                ? html`
                      <div class="modal-overlay" @click="${() => (this.costObjectToDelete = null)}">
                          <div class="modal" @click="${(e: Event) => e.stopPropagation()}">
                              <h3>Delete Cost Object?</h3>
                              <p>This will remove the cost object. Transactions using it will become unassigned.</p>
                              <div class="modal-actions">
                                  <button class="btn-secondary" @click="${() => (this.costObjectToDelete = null)}">
                                      ${i18n.t('common.cancel')}
                                  </button>
                                  <button class="btn-danger" @click="${this.confirmDeleteCostObject}">
                                      ${i18n.t('common.delete')}
                                  </button>
                              </div>
                          </div>
                      </div>
                  `
                : ''}
            ${this.categoryToDelete
                ? html`
                      <div class="modal-overlay" @click="${() => (this.categoryToDelete = null)}">
                          <div class="modal" @click="${(e: Event) => e.stopPropagation()}">
                              <h3>${i18n.t('settings.delete_category')}</h3>
                              <p>${i18n.t('settings.delete_category_warning')}</p>
                              <div class="modal-actions">
                                  <button class="btn-secondary" @click="${() => (this.categoryToDelete = null)}">
                                      ${i18n.t('common.cancel')}
                                  </button>
                                  <button class="btn-danger" @click="${this.confirmDelete}">
                                      ${i18n.t('common.delete')}
                                  </button>
                              </div>
                          </div>
                      </div>
                  `
                : ''}

            <!-- Connect Bank Modal -->
            ${this.showConnectBankModal
                ? html`
                      <div class="modal-overlay" @click="${() => (this.showConnectBankModal = false)}">
                          <div class="modal" @click="${(e: Event) => e.stopPropagation()}">
                              <h3>🏛️ ${i18n.t('bank_sync.connect_bank_btn')}</h3>
                              <p>${i18n.t('bank_sync.description')}</p>

                              <div class="form-group">
                                  <label>${i18n.t('bank_sync.select_country')}</label>
                                  <select
                                      .value="${this.bankCountry}"
                                      @change="${(e: any) => this.loadBanksForCountry(e.target.value)}"
                                  >
                                      ${countryOptions.map(
                                          (c) => html`<option value="${c.code}">${c.name}</option>`,
                                      )}
                                  </select>
                              </div>

                              <div class="form-group">
                                  <label>${i18n.t('bank_sync.select_bank')}</label>
                                  ${this.loadingBanks
                                      ? html`<p style="font-size: 0.85rem; color: var(--md-sys-color-primary);">
                                            ⏳ ${i18n.t('bank_sync.loading_banks')}
                                        </p>`
                                      : html`
                                            <input
                                                type="text"
                                                style="margin-bottom: 8px;"
                                                placeholder="${i18n.t('bank_sync.search_bank_placeholder')}"
                                                .value="${this.bankSearchQuery}"
                                                @input="${(e: any) => (this.bankSearchQuery = e.target.value)}"
                                            />
                                            <select
                                                .value="${this.selectedBankName}"
                                                @change="${(e: any) => (this.selectedBankName = e.target.value)}"
                                            >
                                                ${this.availableBanks
                                                    .filter(
                                                        (b: any) =>
                                                            !this.bankSearchQuery ||
                                                            b.name
                                                                .toLowerCase()
                                                                .includes(this.bankSearchQuery.toLowerCase()),
                                                    )
                                                    .map(
                                                        (b: any) => html`<option value="${b.name}">
                                                            ${b.name} ${b.country ? `(${b.country})` : ''}
                                                        </option>`,
                                                    )}
                                            </select>
                                        `}
                              </div>

                              ${this.bankConnecting
                                  ? html`<p style="font-size: 0.85rem; color: var(--md-sys-color-primary); text-align: center; margin: 12px 0;">
                                        🔄 ${i18n.t('bank_sync.connecting_redirect')}
                                    </p>`
                                  : ''}

                              ${this.bankAuthUrl
                                  ? html`
                                        <div
                                            style="margin: 16px 0; padding: 16px; background: var(--md-sys-color-surface-container-high); border: 1px solid var(--md-sys-color-primary); border-radius: 8px; text-align: center;"
                                        >
                                            <p
                                                style="margin: 0 0 12px 0; font-size: 0.85rem; color: var(--md-sys-color-on-surface-variant);"
                                            >
                                                ℹ️ ${i18n.t('bank_sync.open_new_window_hint')}
                                            </p>
                                            <div style="display: flex; gap: 8px; justify-content: center; flex-wrap: wrap;">
                                                <a
                                                    href="${this.bankAuthUrl}"
                                                    target="_top"
                                                    class="btn-primary"
                                                    style="display: inline-block; text-decoration: none; padding: 8px 16px; font-weight: 500;"
                                                >
                                                    ↗️ ${i18n.t('bank_sync.open_in_new_window')}
                                                </a>
                                                <a
                                                    href="${this.bankAuthUrl}"
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    class="btn-secondary"
                                                    style="display: inline-block; text-decoration: none; padding: 8px 16px; font-weight: 500;"
                                                >
                                                    ↗️ Abrir en Nueva Pestaña
                                                </a>
                                            </div>
                                        </div>
                                    `
                                  : ''}

                              <div class="modal-actions">
                                  <button
                                      class="btn-secondary"
                                      @click="${() => (this.showConnectBankModal = false)}"
                                  >
                                      ${i18n.t('common.cancel')}
                                  </button>
                                  <button
                                      class="btn-primary"
                                      @click="${this.connectBank}"
                                      ?disabled="${this.bankConnecting || this.loadingBanks || !this.selectedBankName}"
                                  >
                                      ${this.bankConnecting
                                          ? '⏳ Conectando...'
                                          : i18n.t('bank_sync.start_auth_btn')}
                                  </button>
                              </div>
                          </div>
                      </div>
                  `
                : ''}
        `;
    }

    renderGeneralSection() {
        return html`
            <!-- General Settings -->
            <div class="section-title">${i18n.t('settings.general')}</div>
            <div class="settings-group">
                <div class="form-group">
                    <label>${i18n.t('settings.language')}</label>
                    <select
                        .value="${i18n.getLocale()}"
                        @change="${this.handleLanguageChange}"
                        style="padding: 0.5rem; border-radius: 4px; border: 1px solid #ccc; width: 200px;"
                    >
                        <option value="en">English</option>
                        <option value="es">Español</option>
                    </select>
                </div>

                <div class="form-group">
                    <label>${i18n.t('common.currency')}</label>
                    <select
                        .value="${this.currency}"
                        @change="${this.handleCurrencyChange}"
                        style="padding: 0.5rem; border-radius: 4px; border: 1px solid #ccc; width: 200px;"
                    >
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
                    <select
                        @change="${(e: any) => this.handleThemeChange(e.target.value)}"
                        style="padding: 0.5rem; border-radius: 4px; border: 1px solid #ccc; width: 200px;"
                    >
                        <option value="auto">${i18n.t('settings.theme_auto')}</option>
                        <option value="light">${i18n.t('settings.theme_light')}</option>
                        <option value="dark">${i18n.t('settings.theme_dark')}</option>
                    </select>
                </div>
            </div>
        `;
    }

    renderProfileSection() {
        return html`
            <!-- Profile Settings -->
            <div class="section-title">👤 ${i18n.t('auth.settings.title')}</div>
            <div class="settings-group">
                ${this.currentProfile
                    ? html`
                          <div class="form-group">
                              <label>${i18n.t('auth.settings.currentProfile')}</label>
                              <div
                                  style="
                display: flex;
                align-items: center;
                padding: 12px 16px;
                background: var(--md-sys-color-primary-container);
                color: var(--md-sys-color-on-primary-container);
                border-radius: 8px;
                font-weight: 500;
              "
                              >
                                  👤 ${this.currentProfile.name}
                              </div>
                          </div>
                      `
                    : ''}

                <div class="form-group" style="margin-top: 16px;">
                    <label>${i18n.t('auth.settings.profileActions')}</label>
                    <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                        <button class="btn-primary" @click="${() => (this.showChangePinModal = true)}">
                            🔒 ${i18n.t('auth.settings.changePin')}
                        </button>
                        <button @click="${() => (this.showCreateProfileModal = true)}">
                            ➕ ${i18n.t('auth.settings.createProfile')}
                        </button>
                        <button class="btn-danger" @click="${this.handleLogout}">
                            🚪 ${i18n.t('auth.settings.logout')}
                        </button>
                    </div>
                </div>

                ${this.profiles.length > 1
                    ? html`
                          <div class="form-group" style="margin-top: 24px;">
                              <label>${i18n.t('auth.settings.allProfiles')} (${this.profiles.length})</label>
                              <div style="display: flex; flex-wrap: wrap; gap: 8px; margin-top: 8px;">
                                  ${this.profiles.map(
                                      (p) => html`
                                          <div
                                              style="
                      padding: 8px 12px;
                      background: ${p.name === this.currentProfile?.name
                                                  ? 'var(--md-sys-color-primary-container)'
                                                  : 'var(--md-sys-color-surface-container-high)'};
                      color: ${p.name === this.currentProfile?.name
                                                  ? 'var(--md-sys-color-on-primary-container)'
                                                  : 'var(--md-sys-color-on-surface)'};
                      border-radius: 16px;
                      font-size: 0.875rem;
                    "
                                          >
                                              ${p.name === this.currentProfile?.name ? '✓ ' : ''}${p.name}
                                          </div>
                                      `,
                                  )}
                              </div>
                              <p
                                  style="font-size: 0.75rem; color: var(--md-sys-color-on-surface-variant); margin-top: 8px;"
                              >
                                  ${i18n.t('auth.settings.switchProfileHint')}
                              </p>
                          </div>
                      `
                    : ''}
            </div>
        `;
    }

    renderAccountsSection() {
        return html`
            <!-- Accounts Management -->
            <div class="section-title">🏦 ${i18n.t('accounts.title')}</div>
            <div class="settings-group">
                ${this.accounts.length === 0
                    ? html` <p style="color: var(--md-sys-color-on-surface-variant);">${i18n.t('accounts.no_accounts')}</p> `
                    : html`
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
                                      ${this.accounts.map(
                                          (acc) => html`
                                              <tr>
                                                  <td>
                                                      <div style="font-weight: 500;">${acc.name}</div>
                                                      ${acc.bankAccountUid
                                                          ? html`
                                                                <div
                                                                    style="font-size: 0.75rem; color: var(--md-sys-color-primary); margin-top: 2px;"
                                                                >
                                                                    🔗 Sincronizado con banco
                                                                    ${acc.lastSyncedAt
                                                                        ? `(Última sync: ${new Date(acc.lastSyncedAt).toLocaleDateString()})`
                                                                        : ''}
                                                                </div>
                                                            `
                                                          : ''}
                                                  </td>
                                                  <td>
                                                      <span
                                                          style="
                            padding: 4px 8px;
                            border-radius: 12px;
                            font-size: 0.75rem;
                            background: ${acc.type === 'CREDIT'
                                                              ? 'var(--md-sys-color-tertiary-container)'
                                                              : 'var(--md-sys-color-secondary-container)'};
                            color: ${acc.type === 'CREDIT'
                                                              ? 'var(--md-sys-color-on-tertiary-container)'
                                                              : 'var(--md-sys-color-on-secondary-container)'};
                          "
                                                      >
                                                          ${acc.type === 'CREDIT' ? '💳 Credit' : '🏦 Debit'}
                                                      </span>
                                                  </td>
                                                  <td>
                                                      ${this.currency === 'EUR' ? '€' : '$'}${Number(
                                                          acc.initialBalance,
                                                      ).toFixed(2)}
                                                  </td>
                                                  <td>
                                                      <div class="actions">
                                                          <button @click="${() => this.startEditAccount(acc)}">
                                                              ${i18n.t('common.edit')}
                                                          </button>
                                                          <button
                                                              class="btn-danger"
                                                              @click="${() => (this.accountToDelete = acc.id)}"
                                                          >
                                                              🗑
                                                          </button>
                                                      </div>
                                                  </td>
                                              </tr>
                                          `,
                                      )}
                                  </tbody>
                              </table>
                          </div>
                      `}
                ${!this.showAccountForm
                    ? html`
                          <button
                              class="btn-primary"
                              style="margin-top: 16px;"
                              @click="${() => (this.showAccountForm = true)}"
                          >
                              + Add Account
                          </button>
                      `
                    : html`
                          <div
                              style="margin-top: 16px; padding: 16px; background: var(--md-sys-color-surface-container-high); border-radius: 8px;"
                          >
                              <h4 style="margin-top: 0;">
                                  ${this.editAccountId
                                      ? i18n.t('accounts.edit_account')
                                      : i18n.t('accounts.new_account')}
                              </h4>
                              <div class="form-group">
                                  <label>${i18n.t('accounts.account_name')}</label>
                                  <input
                                      type="text"
                                      .value="${this.accountForm.name}"
                                      @input="${(e: any) =>
                                          (this.accountForm = { ...this.accountForm, name: e.target.value })}"
                                      placeholder="e.g. Checking, Savings, Chase Sapphire"
                                  />
                              </div>
                              <div class="form-group">
                                  <label>${i18n.t('accounts.account_type')}</label>
                                  <select
                                      .value="${this.accountForm.type}"
                                      @change="${(e: any) =>
                                          (this.accountForm = { ...this.accountForm, type: e.target.value })}"
                                  >
                                      <option value="DEBIT">🏦 ${i18n.t('accounts.debit_option')}</option>
                                      <option value="CREDIT">💳 ${i18n.t('accounts.credit_option')}</option>
                                  </select>
                              </div>
                              <div class="form-group">
                                  <label
                                      >${this.accountForm.type === 'CREDIT'
                                          ? i18n.t('accounts.starting_balance_owed')
                                          : i18n.t('accounts.initial_balance')}</label
                                  >
                                  <input
                                      type="number"
                                      step="0.01"
                                      .value="${this.accountForm.initialBalance}"
                                      @input="${(e: any) =>
                                          (this.accountForm = {
                                              ...this.accountForm,
                                              initialBalance: parseFloat(e.target.value) || 0,
                                          })}"
                                  />
                                  ${this.accountForm.type === 'CREDIT'
                                      ? html`
                                            <p
                                                style="font-size: 0.75rem; color: var(--md-sys-color-on-surface-variant); margin-top: 4px;"
                                            >
                                                ${i18n.t('accounts.balance_owed_hint')}
                                            </p>
                                        `
                                      : ''}
                              </div>
                              <div style="display: flex; gap: 8px;">
                                  <button class="btn-primary" @click="${this.saveAccount}">
                                      ${i18n.t('common.save')}
                                  </button>
                                  <button class="btn-secondary" @click="${this.resetAccountForm}">
                                      ${i18n.t('common.cancel')}
                                  </button>
                              </div>
                          </div>
                      `}
            </div>
        `;
    }

    renderBankSyncSection() {
        return html`
            <!-- Bank Synchronization (Enable Banking) -->
            <div class="section-title">🔄 ${i18n.t('bank_sync.title')}</div>
            <div class="settings-group">
                <p style="color: var(--md-sys-color-on-surface-variant); margin-bottom: 16px; font-size: 0.875rem;">
                    ${i18n.t('bank_sync.description')}
                </p>

                <!-- Status & Action Bar -->
                <div
                    style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; margin-bottom: 20px; padding: 12px 16px; background: var(--md-sys-color-surface-container); border-radius: 8px;"
                >
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <span style="font-weight: 500; font-size: 0.9rem;">Status API:</span>
                        <span
                            class="status-pill"
                            style="
                background: ${this.bankSyncSettings.hasAppId && this.bankSyncSettings.hasKey
                                ? 'rgba(16, 185, 129, 0.2)'
                                : 'rgba(245, 158, 11, 0.2)'};
                color: ${this.bankSyncSettings.hasAppId && this.bankSyncSettings.hasKey
                                ? 'rgb(16, 185, 129)'
                                : 'rgb(245, 158, 11)'};
              "
                        >
                            ${this.bankSyncSettings.hasAppId && this.bankSyncSettings.hasKey
                                ? '✓ ' + i18n.t('bank_sync.configured')
                                : '⚠️ ' + i18n.t('bank_sync.not_configured')}
                        </span>
                    </div>
                    <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                        <button
                            class="btn-secondary"
                            @click="${() => (this.showBankCredentialsForm = !this.showBankCredentialsForm)}"
                        >
                            ⚙️ ${i18n.t('bank_sync.credentials_title')}
                        </button>
                        <button
                            class="btn-primary"
                            @click="${this.openConnectBankModal}"
                            ?disabled="${!this.bankSyncSettings.hasAppId || !this.bankSyncSettings.hasKey}"
                        >
                            ${i18n.t('bank_sync.connect_bank_btn')}
                        </button>
                        <button
                            class="btn-secondary"
                            @click="${this.promptManualCode}"
                            ?disabled="${!this.bankSyncSettings.hasAppId || !this.bankSyncSettings.hasKey}"
                            title="Paste callback URL or code if redirected elsewhere"
                        >
                            ${i18n.t('bank_sync.paste_callback_btn')}
                        </button>
                        ${this.bankConnections.length > 0
                            ? html`
                                  <button
                                      class="btn-primary"
                                      @click="${() => this.syncBankNow()}"
                                      ?disabled="${this.bankSyncLoading}"
                                  >
                                      ${this.bankSyncLoading ? '⏳ ' + i18n.t('bank_sync.syncing') : '🔄 ' + i18n.t('bank_sync.sync_all')}
                                  </button>
                              `
                            : ''}
                    </div>
                </div>

                <!-- Daily Automated Sync Option -->
                <div style="display: flex; align-items: center; justify-content: space-between; padding: 12px 16px; background: var(--md-sys-color-surface-container); border-radius: 8px; margin-bottom: 12px;">
                    <div>
                        <div style="font-weight: 500; font-size: 0.9rem;">
                            🕒 ${i18n.t('bank_sync.auto_sync_label')}
                        </div>
                        <div style="font-size: 0.75rem; color: var(--md-sys-color-on-surface-variant);">
                            ${i18n.t('bank_sync.auto_sync_desc')}
                        </div>
                    </div>
                    <label style="position: relative; display: inline-block; width: 44px; height: 24px; margin-left: 16px; flex-shrink: 0; cursor: pointer;">
                        <input
                            type="checkbox"
                            .checked="${this.bankSyncSettings.autoSyncEnabled !== false}"
                            @change="${this.toggleAutoSync}"
                            style="opacity: 0; width: 0; height: 0; position: absolute;"
                        />
                        <span style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; background-color: ${this.bankSyncSettings.autoSyncEnabled !== false ? 'var(--md-sys-color-primary)' : 'var(--md-sys-color-surface-variant)'}; transition: .3s; border-radius: 24px; border: 1px solid var(--md-sys-color-outline-variant);">
                            <span style="position: absolute; height: 16px; width: 16px; left: ${this.bankSyncSettings.autoSyncEnabled !== false ? '22px' : '3px'}; bottom: 3px; background-color: var(--md-sys-color-surface); transition: .3s; border-radius: 50%;"></span>
                        </span>
                    </label>
                </div>

                <!-- Initial Lookback Option -->
                <div style="display: flex; align-items: center; justify-content: space-between; padding: 12px 16px; background: var(--md-sys-color-surface-container); border-radius: 8px; margin-bottom: 20px; flex-wrap: wrap; gap: 12px;">
                    <div style="flex: 1; min-width: 240px;">
                        <div style="font-weight: 500; font-size: 0.9rem;">
                            📅 ${i18n.t('bank_sync.initial_lookback_label')}
                        </div>
                        <div style="font-size: 0.75rem; color: var(--md-sys-color-on-surface-variant);">
                            ${i18n.t('bank_sync.initial_lookback_desc')}
                        </div>
                    </div>
                    <select
                        style="width: auto; min-width: 220px; flex-shrink: 0;"
                        .value="${String(this.initialLookbackDays)}"
                        @change="${(e: any) => this.updateInitialLookback(parseInt(e.target.value, 10))}"
                    >
                        <option value="30">${i18n.t('bank_sync.lookback_30')}</option>
                        <option value="90">${i18n.t('bank_sync.lookback_90')}</option>
                        <option value="180">${i18n.t('bank_sync.lookback_180')}</option>
                        <option value="365">${i18n.t('bank_sync.lookback_365')}</option>
                        <option value="730">${i18n.t('bank_sync.lookback_730')}</option>
                    </select>
                </div>

                <!-- API Credentials Config Form -->
                ${this.showBankCredentialsForm
                    ? html`
                          <div
                              style="margin-bottom: 24px; padding: 20px; background: var(--md-sys-color-surface-container-high); border-radius: 8px; border: 1px solid var(--md-sys-color-outline-variant);"
                          >
                              <h4 style="margin-top: 0; margin-bottom: 8px;">
                                  🔑 ${i18n.t('bank_sync.credentials_title')}
                              </h4>
                              <p
                                  style="font-size: 0.8rem; color: var(--md-sys-color-on-surface-variant); margin-bottom: 16px;"
                              >
                                  ${i18n.t('bank_sync.credentials_desc')}
                              </p>

                              <div class="form-group">
                                  <label>${i18n.t('bank_sync.app_id_label')}</label>
                                  <input
                                      type="text"
                                      .value="${this.bankAppId}"
                                      @input="${(e: any) => (this.bankAppId = e.target.value)}"
                                      placeholder="${this.bankSyncSettings.hasAppId
                                          ? '••••••••••••••••••••••••••••••••'
                                          : i18n.t('bank_sync.app_id_placeholder')}"
                                  />
                              </div>

                              <div class="form-group">
                                  <label>${i18n.t('bank_sync.key_label')}</label>
                                  <textarea
                                      .value="${this.bankKey}"
                                      @input="${(e: any) => (this.bankKey = e.target.value)}"
                                      placeholder="${this.bankSyncSettings.hasKey
                                          ? '••••• Clave RSA Guardada en Base de Datos •••••'
                                          : i18n.t('bank_sync.key_placeholder')}"
                                  ></textarea>
                                  <div style="margin-top: 6px;">
                                      <label
                                          style="font-size: 0.8rem; color: var(--md-sys-color-primary); cursor: pointer;"
                                      >
                                          📂 ${i18n.t('bank_sync.key_upload')}
                                          <input
                                              type="file"
                                              accept=".pem,.key,.txt"
                                              style="display: none;"
                                              @change="${this.handleKeyFileUpload}"
                                          />
                                      </label>
                                  </div>
                              </div>

                              <div class="form-group">
                                  <label>${i18n.t('bank_sync.redirect_url_label')}</label>
                                  <input
                                      type="text"
                                      .value="${this.bankRedirectUrl}"
                                      @input="${(e: any) => (this.bankRedirectUrl = e.target.value)}"
                                      placeholder="${i18n.t('bank_sync.redirect_url_placeholder')}"
                                  />
                                  <p
                                      style="font-size: 0.75rem; color: var(--md-sys-color-on-surface-variant); margin-top: 4px;"
                                  >
                                      ${i18n.t('bank_sync.redirect_url_hint')}
                                  </p>
                              </div>

                              <div style="display: flex; gap: 8px; margin-top: 16px;">
                                  <button class="btn-primary" @click="${this.saveBankCredentials}">
                                      ${i18n.t('bank_sync.save_credentials')}
                                  </button>
                                  <button
                                      class="btn-secondary"
                                      @click="${() => (this.showBankCredentialsForm = false)}"
                                  >
                                      ${i18n.t('common.cancel')}
                                  </button>
                              </div>
                          </div>
                      `
                    : ''}

                <!-- Active Connected Banks List -->
                ${this.bankConnections.length === 0
                    ? html`
                          <div
                              style="text-align: center; padding: 32px 16px; background: var(--md-sys-color-surface-container); border-radius: 8px;"
                          >
                              <div style="font-size: 2.5rem; margin-bottom: 8px;">🏦</div>
                              <p style="color: var(--md-sys-color-on-surface-variant); margin: 0; font-size: 0.9rem;">
                                  ${i18n.t('bank_sync.no_connections')}
                              </p>
                          </div>
                      `
                    : html`
                          <div style="display: flex; flex-direction: column; gap: 16px;">
                              ${this.bankConnections.map((conn) => {
                                  const expiresAt = conn.validUntil ? new Date(conn.validUntil) : null;
                                  const now = new Date();
                                  const daysLeft = expiresAt
                                      ? Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
                                      : 0;
                                  const isExpired = expiresAt && expiresAt < now;
                                  const isExpiringSoon = daysLeft > 0 && daysLeft <= 14;

                                  const accountsData = Array.isArray(conn.accounts) ? conn.accounts : [];

                                  return html`
                                      <div class="bank-card">
                                          <div class="bank-header">
                                              <div class="bank-title">
                                                  <span>🏛️</span>
                                                  <span>${conn.aspspName}</span>
                                                  <span
                                                      style="font-size: 0.8rem; font-weight: normal; color: var(--md-sys-color-on-surface-variant);"
                                                      >(${conn.country})</span
                                                  >
                                              </div>
                                              <div style="display: flex; align-items: center; gap: 8px;">
                                                  ${isExpired
                                                      ? html`<span class="status-badge status-expired"
                                                            >⚠️ ${i18n.t('bank_sync.status_expired')}</span
                                                        >`
                                                      : isExpiringSoon
                                                        ? html`<span class="status-badge status-expiring"
                                                              >⏳ ${i18n.t('bank_sync.status_expiring_soon')}
                                                              (${daysLeft}d)</span
                                                          >`
                                                        : html`<span class="status-badge status-active"
                                                              >✓ ${i18n.t('bank_sync.status_active')}
                                                              (${daysLeft > 0 ? `${daysLeft}d` : ''})</span
                                                          >`}
                                              </div>
                                          </div>

                                          <!-- Accounts detected under this bank connection -->
                                          <div
                                              style="margin-top: 12px; padding: 12px; background: var(--md-sys-color-surface-container); border-radius: 8px;"
                                          >
                                              <div
                                                  style="font-weight: 500; font-size: 0.85rem; margin-bottom: 8px; color: var(--md-sys-color-on-surface-variant);"
                                              >
                                                  💳 ${i18n.t('bank_sync.discovered_accounts')}
                                              </div>

                                              ${accountsData.length === 0
                                                  ? html`<p
                                                        style="font-size: 0.8rem; color: var(--md-sys-color-on-surface-variant); margin: 0;"
                                                    >
                                                        No account IDs returned yet.
                                                    </p>`
                                                  : html`
                                                        <div style="display: flex; flex-direction: column; gap: 8px;">
                                                            ${accountsData.map((bankAcc: any) => {
                                                                const uid =
                                                                    typeof bankAcc === 'string'
                                                                        ? bankAcc
                                                                        : String(bankAcc?.uid || bankAcc?.account_id?.iban || bankAcc?.iban || '');
                                                                const displayName =
                                                                    typeof bankAcc === 'object' && bankAcc
                                                                        ? (bankAcc.account_id?.iban || bankAcc.iban || bankAcc.name || uid)
                                                                        : String(bankAcc);
                                                                const subInfo =
                                                                    typeof bankAcc === 'object' && bankAcc?.name && (bankAcc.account_id?.iban || bankAcc.iban)
                                                                        ? `${bankAcc.name} (${bankAcc.currency || 'EUR'})`
                                                                        : (typeof bankAcc === 'object' && bankAcc?.cash_account_type ? `${bankAcc.cash_account_type} (${bankAcc.currency || 'EUR'})` : '');
                                                                const linkedAccount = this.accounts.find(
                                                                    (a) => a.bankAccountUid === uid,
                                                                );

                                                                return html`
                                                                    <div
                                                                        style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px; padding: 8px 12px; background: var(--md-sys-color-surface); border-radius: 6px;"
                                                                    >
                                                                        <div>
                                                                            <div
                                                                                style="font-weight: 500; font-size: 0.9rem;"
                                                                            >
                                                                                ${displayName}
                                                                            </div>
                                                                            ${subInfo
                                                                                ? html`<div style="font-size: 0.75rem; color: var(--md-sys-color-on-surface-variant);">${subInfo}</div>`
                                                                                : ''}
                                                                            <div
                                                                                style="font-size: 0.75rem; color: var(--md-sys-color-on-surface-variant);"
                                                                            >
                                                                                ${linkedAccount
                                                                                    ? html`✓ Vinculada a:
                                                                                          <strong
                                                                                              >${linkedAccount.name}</strong
                                                                                          >`
                                                                                    : html`<span style="color: #f59e0b;"
                                                                                          >Sin vincular a PriPerFin</span
                                                                                      >`}
                                                                            </div>
                                                                        </div>

                                                                        <div
                                                                            style="display: flex; align-items: center; gap: 8px;"
                                                                        >
                                                                            ${linkedAccount
                                                                                ? html`
                                                                                      <button
                                                                                          class="btn-secondary"
                                                                                          style="height: 32px; padding: 0 12px; font-size: 0.8rem;"
                                                                                          @click="${() =>
                                                                                              this.handleUnlinkAccount(
                                                                                                  linkedAccount.id,
                                                                                              )}"
                                                                                      >
                                                                                          ${i18n.t(
                                                                                              'bank_sync.unlink_btn',
                                                                                          )}
                                                                                      </button>
                                                                                  `
                                                                                : html`
                                                                                      <select
                                                                                          style="height: 32px; padding: 0 8px; font-size: 0.8rem; width: 160px;"
                                                                                          @change="${(e: any) => {
                                                                                              const accId =
                                                                                                  e.target.value;
                                                                                              if (accId) {
                                                                                                  this.handleLinkAccount(
                                                                                                      accId,
                                                                                                      uid,
                                                                                                      conn.id,
                                                                                                  );
                                                                                              }
                                                                                          }}"
                                                                                      >
                                                                                          <option value="">
                                                                                              ${i18n.t(
                                                                                                  'bank_sync.select_account_placeholder',
                                                                                              )}
                                                                                          </option>
                                                                                          ${this.accounts.map(
                                                                                              (a) =>
                                                                                                  html`<option
                                                                                                      value="${a.id}"
                                                                                                  >
                                                                                                      ${a.name}
                                                                                                  </option>`,
                                                                                          )}
                                                                                      </select>
                                                                                  `}
                                                                        </div>
                                                                    </div>
                                                                `;
                                                            })}
                                                        </div>
                                                    `}
                                          </div>

                                          <!-- Connection Action Buttons -->
                                          <div
                                              style="display: flex; justify-content: flex-end; gap: 8px; margin-top: 12px;"
                                          >
                                              <button
                                                  class="btn-secondary"
                                                  @click="${() => this.openConnectBankModal()}"
                                              >
                                                  🔄 ${i18n.t('bank_sync.reauthorize')}
                                              </button>
                                              <button
                                                  class="btn-danger"
                                                  @click="${() => this.disconnectBank(conn.id, conn.aspspName)}"
                                              >
                                                  🗑 ${i18n.t('bank_sync.disconnect')}
                                              </button>
                                          </div>
                                      </div>
                                  `;
                              })}
                          </div>
                      `}
            </div>
        `;
    }

    renderCostObjectsSection() {
        return html`
            <!-- Cost Objects Settings -->
            <div class="section-title">💼 ${i18n.t('settings.cost_objects')}</div>
            <div class="settings-group">
                <p style="color: var(--md-sys-color-on-surface-variant); margin-bottom: 16px; font-size: 0.875rem;">
                    Track funding sources for credit card expenses (e.g., Work, Personal, Shared).
                </p>
                ${this.costObjects.length === 0 && !this.showCostObjectForm
                    ? html`
                          <p style="color: var(--md-sys-color-on-surface-variant); font-style: italic;">
                              ${i18n.t('settings.no_cost_objects')}
                          </p>
                      `
                    : html`
                          ${this.costObjects.length > 0
                              ? html`
                                    <div class="table-container">
                                        <table>
                                            <thead>
                                                <tr>
                                                    <th style="width: 75%">${i18n.t('settings.cost_object_name')}</th>
                                                    <th style="width: 25%">${i18n.t('common.actions')}</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                ${this.costObjects.map(
                                                    (co) => html`
                                                        <tr>
                                                            <td>
                                                                <div style="display: flex; align-items: center;">
                                                                    <span
                                                                        class="category-icon"
                                                                        style="color: ${co.color}; background: ${co.color}20;"
                                                                    >
                                                                        ${co.icon}
                                                                    </span>
                                                                    <span>${co.name}</span>
                                                                </div>
                                                            </td>
                                                            <td>
                                                                <div class="actions">
                                                                    <button
                                                                        @click="${() => this.startEditCostObject(co)}"
                                                                    >
                                                                        ${i18n.t('common.edit')}
                                                                    </button>
                                                                    <button
                                                                        class="btn-danger"
                                                                        @click="${() => (this.costObjectToDelete = co.id)}"
                                                                    >
                                                                        🗑
                                                                    </button>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    `,
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                `
                              : ''}
                      `}
                ${!this.showCostObjectForm
                    ? html`
                          <button
                              class="btn-primary"
                              style="margin-top: 16px;"
                              @click="${() => (this.showCostObjectForm = true)}"
                          >
                              + ${i18n.t('settings.add_cost_object')}
                          </button>
                      `
                    : html`
                          <div
                              style="margin-top: 16px; padding: 16px; background: var(--md-sys-color-surface-container-high); border-radius: 8px;"
                          >
                              <h4 style="margin-top: 0;">
                                  ${this.editCostObjectId
                                      ? i18n.t('settings.edit_cost_object')
                                      : i18n.t('settings.add_cost_object')}
                              </h4>
                              <div class="form-group">
                                  <label>${i18n.t('settings.cost_object_name')}</label>
                                  <input
                                      type="text"
                                      .value="${this.costObjectForm.name}"
                                      @input="${(e: any) =>
                                          (this.costObjectForm = { ...this.costObjectForm, name: e.target.value })}"
                                      placeholder="e.g. Work, Personal, Shared"
                                  />
                              </div>
                              <div class="form-group">
                                  <label>${i18n.t('settings.icon')}</label>
                                  <div style="position: relative;">
                                      <div style="display: flex; gap: 0.5rem; align-items: center;">
                                          <input
                                              type="text"
                                              placeholder="Emoji"
                                              style="width: 60px; text-align: center;"
                                              .value="${this.costObjectForm.icon}"
                                              @input="${(e: any) =>
                                                  (this.costObjectForm = {
                                                      ...this.costObjectForm,
                                                      icon: e.target.value,
                                                  })}"
                                          />
                                          <button
                                              @click="${() =>
                                                  (this.showCostObjectEmojiPicker = !this.showCostObjectEmojiPicker)}"
                                              title="Pick Emoji"
                                          >
                                              😀
                                          </button>
                                      </div>
                                      ${this.showCostObjectEmojiPicker
                                          ? html`
                                                <div
                                                    style="position: absolute; z-index: 2000; bottom: 100%; left: 0; margin-bottom: 8px;"
                                                >
                                                    <div
                                                        style="position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; z-index: 1000;"
                                                        @click="${() => (this.showCostObjectEmojiPicker = false)}"
                                                    ></div>
                                                    <emoji-picker
                                                        @emoji-click="${(e: any) => {
                                                            this.costObjectForm = {
                                                                ...this.costObjectForm,
                                                                icon: e.detail.unicode,
                                                            };
                                                            this.showCostObjectEmojiPicker = false;
                                                        }}"
                                                    ></emoji-picker>
                                                </div>
                                            `
                                          : ''}
                                  </div>
                              </div>
                              <div style="display: flex; gap: 8px; margin-top: 16px;">
                                  <button class="btn-primary" @click="${this.saveCostObject}">
                                      ${i18n.t('common.save')}
                                  </button>
                                  <button class="btn-secondary" @click="${this.resetCostObjectForm}">
                                      ${i18n.t('common.cancel')}
                                  </button>
                              </div>
                          </div>
                      `}
            </div>
        `;
    }

    renderCategoriesSection() {
        return html`
            <!-- Categories Management -->
            <div class="section-title">📂 ${i18n.t('settings.categories')}</div>
            <div class="settings-group">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                    <h3>${i18n.t('common.expense')} ${i18n.t('settings.categories')}</h3>
                    <button class="btn-primary" @click="${this.toggleAddForm}">
                        ${this.showAddForm ? i18n.t('common.cancel') : '+ ' + i18n.t('settings.add_category')}
                    </button>
                </div>

                ${this.showAddForm
                    ? html`
                          <div class="form-card">
                              <h3>
                                  ${this.editModeId
                                      ? i18n.t('settings.edit_category')
                                      : i18n.t('settings.add_category')}
                              </h3>

                              <div class="form-group">
                                  <label>${i18n.t('settings.category_name')}</label>
                                  <input
                                      type="text"
                                      .value="${this.categoryForm.name}"
                                      @input="${(e: any) =>
                                          (this.categoryForm = { ...this.categoryForm, name: e.target.value })}"
                                      placeholder="e.g. Groceries"
                                  />
                              </div>

                              <div class="form-group">
                                  <label>${i18n.t('settings.type')}</label>
                                  <select
                                      .value="${this.categoryForm.type}"
                                      @change="${(e: any) =>
                                          (this.categoryForm = { ...this.categoryForm, type: e.target.value })}"
                                  >
                                      <option value="EXPENSE">${i18n.t('common.expense')}</option>
                                      <option value="INCOME">${i18n.t('common.income')}</option>
                                  </select>
                              </div>

                              <div class="form-group">
                                  <label>${i18n.t('settings.parent_category')}</label>
                                  <select
                                      .value="${this.categoryForm.parentId}"
                                      @change="${(e: any) =>
                                          (this.categoryForm = { ...this.categoryForm, parentId: e.target.value })}"
                                  >
                                      <option value="">-- ${i18n.t('settings.none_top_level')} --</option>
                                      ${this.categories
                                          .filter(
                                              (c) =>
                                                  !c.parentId &&
                                                  c.id !== this.editModeId &&
                                                  c.type === this.categoryForm.type,
                                          )
                                          .map((c) => html`<option value="${c.id}">${c.icon} ${c.name}</option>`)}
                                  </select>
                              </div>

                              <div class="form-group">
                                  <label>${i18n.t('settings.icon')}</label>
                                  <div style="position: relative;">
                                      <div style="display: flex; gap: 0.5rem; align-items: center;">
                                          <input
                                              type="text"
                                              placeholder="Emoji"
                                              style="width: 60px; text-align: center;"
                                              .value="${this.categoryForm.icon}"
                                              @input="${(e: any) =>
                                                  (this.categoryForm = {
                                                      ...this.categoryForm,
                                                      icon: e.target.value,
                                                  })}"
                                          />
                                          <button
                                              @click="${() => (this.showEmojiPicker = !this.showEmojiPicker)}"
                                              title="Pick Emoji"
                                          >
                                              😀
                                          </button>
                                      </div>
                                      ${this.showEmojiPicker
                                          ? html`
                                                <div
                                                    style="position: absolute; z-index: 2000; bottom: 100%; left: 0; margin-bottom: 8px;"
                                                >
                                                    <div
                                                        style="position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; z-index: 1000;"
                                                        @click="${() => (this.showEmojiPicker = false)}"
                                                    ></div>
                                                    <emoji-picker
                                                        @emoji-click="${(e: any) => {
                                                            this.categoryForm = {
                                                                ...this.categoryForm,
                                                                icon: e.detail.unicode,
                                                            };
                                                            this.showEmojiPicker = false;
                                                        }}"
                                                    ></emoji-picker>
                                                </div>
                                            `
                                          : ''}
                                  </div>
                              </div>

                              ${this.categoryForm.type === 'EXPENSE'
                                  ? html`
                                        <div class="form-group">
                                            <label>${i18n.t('settings.monthly_budget')}</label>
                                            <input
                                                type="number"
                                                step="0.01"
                                                .value="${this.categoryForm.budget !== null
                                                    ? this.categoryForm.budget
                                                    : ''}"
                                                @input="${(e: any) =>
                                                    (this.categoryForm = {
                                                        ...this.categoryForm,
                                                        budget: e.target.value ? parseFloat(e.target.value) : null,
                                                    })}"
                                                placeholder="e.g. 500"
                                            />
                                        </div>
                                    `
                                  : ''}

                              <div style="display: flex; gap: 8px; margin-top: 16px;">
                                  <button class="btn-primary" @click="${this.saveCategory}">
                                      ${i18n.t('common.save')}
                                  </button>
                                  <button class="btn-secondary" @click="${this.resetForm}">
                                      ${i18n.t('common.cancel')}
                                  </button>
                              </div>
                          </div>
                      `
                    : ''}

                <!-- Expense Categories Table -->
                ${this.renderCategoryTable(
                    this.categories.filter((c) => c.type === 'EXPENSE' || !c.type),
                    true,
                    true,
                )}

                <!-- Income Categories Table -->
                <h3 style="margin-top: 2rem;">${i18n.t('common.income')} ${i18n.t('settings.categories')}</h3>
                ${this.renderCategoryTable(
                    this.categories.filter((c) => c.type === 'INCOME'),
                    true,
                    false,
                )}
            </div>
        `;
    }

    renderBackupSection() {
        return html`
            <!-- Backup & Restore -->
            <div class="section-title">${i18n.t('settings.backup_restore')}</div>
            <div class="settings-group">
                <div class="form-group">
                    <label>${i18n.t('settings.create_backup')}</label>
                    <p
                        style="font-size: 0.875rem; color: var(--md-sys-color-on-surface-variant); margin-bottom: 1rem;"
                    >
                        ${i18n.t('settings.backup_description')}
                    </p>
                    <div class="form-group">
                        <label>${i18n.t('settings.encryption_key_optional')}</label>
                        <input
                            type="password"
                            placeholder="${i18n.t('settings.encryption_placeholder')}"
                            .value="${this.encryptionKey}"
                            @input="${(e: any) => (this.encryptionKey = e.target.value)}"
                        />
                        <p
                            style="font-size: 0.75rem; color: var(--md-sys-color-on-surface-variant); margin-top: 0.25rem;"
                        >
                            ${i18n.t('settings.leave_empty_no_encryption')}
                        </p>
                    </div>
                    <button class="btn-primary" @click="${this.createBackup}" ?disabled="${this.backupLoading}">
                        ${this.backupLoading ? '⏳ ' + i18n.t('common.loading') : '💾 ' + i18n.t('settings.create_backup')}
                    </button>
                </div>

                <div class="form-group" style="margin-top: 2rem;">
                    <label>${i18n.t('settings.restore_backup')}</label>
                    <p
                        style="font-size: 0.875rem; color: var(--md-sys-color-on-surface-variant); margin-bottom: 1rem;"
                    >
                        ${i18n.t('settings.restore_description')}
                    </p>
                    <div class="form-group">
                        <label>${i18n.t('settings.decryption_key')}</label>
                        <input
                            type="password"
                            placeholder="${i18n.t('settings.decryption_placeholder')}"
                            .value="${this.decryptionKey}"
                            @input="${(e: any) => (this.decryptionKey = e.target.value)}"
                        />
                    </div>
                    <input
                        type="file"
                        accept=".tar.enc,.tar"
                        @change="${this.restoreBackup}"
                        ?disabled="${this.restoreLoading}"
                        style="margin-bottom: 0.5rem;"
                    />
                    ${this.restoreLoading
                        ? html`<p style="color: var(--md-sys-color-primary);">⏳ ${i18n.t('common.loading')}</p>`
                        : ''}
                </div>
            </div>
        `;
    }

    renderDangerSection() {
        return html`
            <!-- Danger Zone -->
            <div class="section-title">⚠️ ${i18n.t('settings.danger_zone')}</div>
            <div class="settings-group">
                <div style="display: flex; flex-direction: column; gap: 12px;">
                    <div>
                        <button class="btn-danger" @click="${() => this.deleteProfileData()}">
                            ${i18n.t('settings.delete_profile_data')}
                        </button>
                        <p
                            style="font-size: 0.8rem; color: var(--md-sys-color-on-surface-variant); margin-top: 0.5rem;"
                        >
                            ${i18n.t('settings.delete_profile_data_desc')}
                        </p>
                    </div>

                    <div>
                        <button class="btn-danger" @click="${() => (this.showDeleteProfileModal = true)}">
                            ${i18n.t('settings.delete_this_profile')}
                        </button>
                        <p
                            style="font-size: 0.8rem; color: var(--md-sys-color-on-surface-variant); margin-top: 0.5rem;"
                        >
                            ${i18n.t('settings.delete_this_profile_desc')}
                        </p>
                    </div>

                    <div>
                        <button class="btn-danger" @click="${() => (this.showDeleteAllDataModal = true)}">
                            ${i18n.t('settings.delete_all_profiles_data')}
                        </button>
                        <p
                            style="font-size: 0.8rem; color: var(--md-sys-color-on-surface-variant); margin-top: 0.5rem;"
                        >
                            ⚠️ ${i18n.t('settings.delete_all_profiles_data_desc')}
                        </p>
                    </div>
                </div>
        `;
    }
}
