import { LitElement, html, css, nothing } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { api } from '../api/client';
import { i18n } from '../i18n/i18n';
import '../components/rule-editor';
import {
  bottomSheet,
  icon,
  mobileUI,
  snackbar,
  watchMobileViewport,
  type SnackbarOptions,
} from '../styles/mobile-ui';

@customElement('view-rules')
export class ViewRules extends LitElement {
  @state() rules: any[] = [];
  @state() loading = false;
  @state() showEditor = false;
  @state() editingRule: any = null;
  @state() categories: any[] = [];
  @state() suggestions: any[] = [];
  @state() showSuggestions = false;
  @state() detecting = false;
  @state() applying = false;
  @state() applyingAll = false;

  // --- Mobile layer (<= 600px). The desktop list above the breakpoint is untouched. ---
  @state() isMobile = false;
  /** Rule card expanded to show its action row, or null. */
  @state() expandedRuleId: string | null = null;
  @state() ruleToDelete: any = null;
  @state() snack: SnackbarOptions | null = null;

  @state() private pendingConfirm: { message: string; confirmLabel: string } | null = null;
  private confirmResolver: ((ok: boolean) => void) | null = null;
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
    
    .card { 
      background: var(--md-sys-color-surface-container-low); 
      padding: 24px; 
      border-radius: var(--md-sys-shape-corner-medium); 
      margin-bottom: 24px; 
      box-shadow: 0 1px 3px 0 rgba(0,0,0,0.12); 
    }

    .toolbar { 
      display: flex; 
      justify-content: space-between; 
      align-items: center; 
      margin-bottom: 16px; 
      gap: 16px;
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
    
    .btn-small {
      height: 32px;
      padding: 0 16px;
      font-size: 0.875rem;
    }

    .suggestions-panel {
      background: var(--md-sys-color-tertiary-container);
      border: 1px solid var(--md-sys-color-outline-variant);
      border-radius: 12px;
      padding: 16px;
      margin-bottom: 16px;
    }
    
    .suggestions-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
    }
    
    .suggestions-title {
      font: var(--md-sys-typescale-title-medium);
      color: var(--md-sys-color-on-tertiary-container);
    }

    .suggestion-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px;
      background: var(--md-sys-color-surface);
      border-radius: 8px;
      margin-bottom: 8px;
      gap: 16px;
    }

    .confidence-meter {
      height: 4px;
      background: var(--md-sys-color-surface-variant);
      width: 100px;
      border-radius: 2px;
      overflow: hidden;
      margin-top: 4px;
    }
    .confidence-fill { 
      height: 100%; 
      background: var(--md-sys-color-primary); 
    }

    .rule-list { 
      display: flex; 
      flex-direction: column; 
      gap: 8px; 
    }
    
    .rule-item {
      display: flex;
      align-items: center;
      padding: 16px;
      background: var(--md-sys-color-surface);
      border: 1px solid var(--md-sys-color-outline-variant);
      border-radius: 12px;
      gap: 16px;
    }

    .rule-reorder {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .rule-content { 
      flex: 1; 
      min-width: 0;
    }
    
    .rule-name { 
      font: var(--md-sys-typescale-title-medium);
      color: var(--md-sys-color-on-surface); 
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 4px;
    }
    
    .rule-desc { 
      font: var(--md-sys-typescale-body-small);
      color: var(--md-sys-color-on-surface-variant); 
      display: flex;
      align-items: center;
      gap: 8px;
      flex-wrap: wrap;
    }
    
    .rule-category {
      padding: 4px 8px;
      background: var(--md-sys-color-secondary-container);
      color: var(--md-sys-color-on-secondary-container);
      border-radius: 6px;
      font-size: 0.75rem;
      white-space: nowrap;
    }
    
    .badge {
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 0.7rem;
      font-weight: 500;
      white-space: nowrap;
    }
    
    .badge-disabled {
      background: var(--md-sys-color-surface-variant);
      color: var(--md-sys-color-on-surface-variant);
    }
    
    .badge-auto {
      background: var(--md-sys-color-tertiary-container);
      color: var(--md-sys-color-on-tertiary-container);
    }
    
    .badge-suggest {
      background: var(--md-sys-color-primary-container);
      color: var(--md-sys-color-on-primary-container);
    }

    .actions { 
      display: flex; 
      gap: 8px; 
      flex-wrap: wrap;
    }
    
    .btn-icon {
      padding: 8px;
      width: 36px;
      height: 36px;
      background: transparent;
      color: var(--md-sys-color-on-surface-variant);
      border: 1px solid var(--md-sys-color-outline-variant);
      border-radius: 18px;
    }
    
    .btn-icon:hover { 
      background: var(--md-sys-color-surface-container-highest); 
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
    
    @media (max-width: 600px) {
      .toolbar {
        flex-direction: column;
        align-items: stretch;
      }

      .rule-item {
        flex-wrap: wrap;
      }

      .actions {
        width: 100%;
        justify-content: flex-end;
      }
    }

    /* ---------- mobile ---------- */

    .u-screen {
      display: flex;
      flex-direction: column;
      min-height: calc(100dvh - 64px - env(safe-area-inset-bottom, 0px));
    }

    .u-list { flex: 1; display: flex; flex-direction: column; gap: 8px; }

    .u-suggestions {
      background: var(--md-sys-color-tertiary-container);
      border-radius: 12px;
      padding: 12px;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .u-suggestions-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
      color: var(--md-sys-color-on-tertiary-container);
      font: 500 14px/20px 'Roboto', sans-serif;
    }
    .u-suggestions-header .m-icon-btn { color: inherit; width: 36px; height: 36px; min-width: 36px; }

    .u-suggestion {
      background: var(--md-sys-color-surface);
      border-radius: 8px;
      padding: 12px;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .u-suggestion-name { font: 500 14px/20px 'Roboto', sans-serif; color: var(--md-sys-color-on-surface); }
    .u-suggestion-meta {
      font: 400 12px/16px 'Roboto', sans-serif;
      color: var(--md-sys-color-on-surface-variant);
    }
    .u-meter {
      height: 4px;
      width: 120px;
      border-radius: 2px;
      background: var(--md-sys-color-outline-variant);
      overflow: hidden;
    }
    .u-meter > div { height: 100%; background: var(--md-sys-color-primary); }

    .u-card {
      border: 1px solid var(--md-sys-color-outline-variant);
      border-radius: 12px;
      padding: 12px 14px;
      display: flex;
      flex-direction: column;
      gap: 8px;
      background: none;
      width: 100%;
      box-sizing: border-box;
      text-align: left;
      color: inherit;
      font: inherit;
      cursor: pointer;
    }
    .u-card-line1 { display: flex; align-items: center; gap: 8px; }
    .u-card-index {
      font: 500 12px/16px 'Roboto', sans-serif;
      color: var(--md-sys-color-on-surface-variant);
      flex-shrink: 0;
    }
    .u-card-name {
      flex: 1;
      min-width: 0;
      font: 500 16px/24px 'Roboto', sans-serif;
      color: var(--md-sys-color-on-surface);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .u-card-line2 {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-wrap: wrap;
      font: 400 12px/16px 'Roboto', sans-serif;
      color: var(--md-sys-color-on-surface-variant);
    }
    .u-card-line3 { display: flex; align-items: center; gap: 8px; }
    .u-reorder { display: flex; flex-direction: column; gap: 2px; }
    .u-reorder button {
      width: 40px;
      height: 20px;
      padding: 0;
      border: 1px solid var(--md-sys-color-outline-variant);
      border-radius: 4px;
      background: transparent;
      color: var(--md-sys-color-on-surface-variant);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
    }
    .u-badge {
      padding: 2px 8px;
      border-radius: 6px;
      font: 500 11px/16px 'Roboto', sans-serif;
      white-space: nowrap;
    }
    .u-badge.auto {
      background: var(--md-sys-color-tertiary-container);
      color: var(--md-sys-color-on-tertiary-container);
    }
    .u-badge.suggest {
      background: var(--md-sys-color-primary-container);
      color: var(--md-sys-color-on-primary-container);
    }
    .u-badge.off {
      background: var(--md-sys-color-outline-variant);
      color: var(--md-sys-color-on-surface-variant);
    }
  `];

  async connectedCallback() {
    super.connectedCallback();
    this.unwatchViewport = watchMobileViewport(this);
    await this.loadRules();
    await this.loadCategories();
    await this.loadSuggestions();
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

  async loadRules() {
    this.loading = true;
    try {
      this.rules = await api.get('/rules');
    } catch (e) {
      console.error(e);
      this.notify(i18n.t('rules.errors.load_failed'));
    } finally {
      this.loading = false;
    }
  }

  async loadSuggestions() {
    try {
      this.suggestions = await api.get('/rules/suggestions?status=PENDING');
    } catch (e) {
      console.error(e);
    }
  }

  async loadCategories() {
    try {
      this.categories = await api.get('/categories');
    } catch (e) {
      console.error(e);
    }
  }

  startCreate() {
    this.editingRule = null;
    this.showEditor = true;
  }

  startEdit(rule: any) {
    this.editingRule = rule;
    this.showEditor = true;
  }

  async deleteRule(id: string) {
    if (!(await this.askConfirm(i18n.t('rules.delete_confirm'), i18n.t('common.delete')))) return;
    try {
      await api.delete(`/rules/${id}`);
      await this.loadRules();
    } catch (e) {
      console.error(e);
      this.notify(i18n.t('rules.errors.delete_failed'));
    }
  }

  async handleSave(ruleData: any) {
    try {
      if (this.editingRule && this.editingRule.id) {
        await api.patch(`/rules/${this.editingRule.id}`, ruleData);
      } else {
        await api.post('/rules', ruleData);
      }
      
      // If this came from a suggestion, reload suggestions to remove it from list
      // We already created the rule above, so DON'T call /accept endpoint (would create duplicate)
      if (this.editingRule && this.editingRule._suggestionId) {
        await this.loadSuggestions();
      }
      
      this.showEditor = false;
      await this.loadRules();
    } catch (e: any) {
      console.error(e);
      this.notify(i18n.t('rules.errors.save_failed') + ': ' + e.message);
    }
  }

  async toggleEnabled(rule: any) {
    try {
      await api.patch(`/rules/${rule.id}`, { enabled: !rule.enabled });
      await this.loadRules();
    } catch (e) {
      console.error(e);
    }
  }

  async moveRule(index: number, direction: 'up' | 'down') {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === this.rules.length - 1) return;

    const newIndex = direction === 'up' ? index - 1 : index + 1;
    const newRules = [...this.rules];
    
    [newRules[index], newRules[newIndex]] = [newRules[newIndex], newRules[index]];
    
    const ids = newRules.map(r => r.id);
    this.rules = newRules;
    
    try {
      await api.post('/rules/reorder', { ruleIds: ids });
      await this.loadRules();
    } catch (e) {
      console.error(e);
      await this.loadRules();
    }
  }

  async detectPatterns() {
    this.detecting = true;
    try {
      await api.get('/rules/suggestions/detect');
      await this.loadSuggestions();
      this.showSuggestions = true;
      
      if (this.suggestions.length > 0) {
        this.notify(i18n.t('rules.suggestions_found').replace('{count}', this.suggestions.length.toString()));
      } else {
        this.notify(i18n.t('rules.no_suggestions'));
      }
    } catch (e: any) {
      console.error(e);
      this.notify(i18n.t('rules.errors.detect_failed'));
    } finally {
      this.detecting = false;
    }
  }

  // UPDATED: Accept suggestion now opens full editor instead of direct creation
  acceptSuggestion(suggestion: any) {
    // Pre-populate rule editor with suggestion data
    this.editingRule = {
      name: suggestion.name,
      conditionsJson: suggestion.conditionsJson,
      categoryId: suggestion.categoryId,
      mode: 'SUGGEST', // default mode
      enabled: true,
      priority: 0,
      _suggestionId: suggestion.id // Track for later
    };
    this.showEditor = true;
  }

  async rejectSuggestion(suggestion: any) {
    try {
      await api.post(`/rules/suggestions/${suggestion.id}/reject`, {});
      await this.loadSuggestions();
    } catch (e: any) {
      console.error(e);
    }
  }

  // NEW: Apply rule to existing transactions
  async applyRule(rule: any) {
    if (!(await this.askConfirm(i18n.t('rules.apply_confirm'), i18n.t('rules.apply_rule')))) return;
    
    this.applying = true;
    try {
      const result = await api.post(`/rules/${rule.id}/apply`, {});
      const count = result.matchCount || 0;
      this.notify(i18n.t('rules.applied_success').replace('{count}', count.toString()));
      await this.loadRules();
    } catch (e: any) {
      console.error(e);
      this.notify(i18n.t('rules.errors.apply_failed'));
    } finally {
      this.applying = false;
    }
  }

  async applyAllRules() {
    if (!(await this.askConfirm(i18n.t('rules.apply_all_confirm'), i18n.t('rules.apply_all_rules')))) {
      return;
    }
    
    this.applyingAll = true;
    try {
      let totalMatched = 0;
      const enabledRules = this.rules.filter(r => r.enabled);
      
      for (const rule of enabledRules) {
        try {
          const result = await api.post(`/rules/${rule.id}/apply`, {});
          totalMatched += result.matchCount || result.matched || 0;
        } catch (err) {
          console.error(`Failed to apply rule ${rule.name}`, err);
        }
      }
      
      this.notify(i18n.t('rules.apply_all_success').replace('{count}', totalMatched.toString()));
      await this.loadRules();
    } catch (e) {
      console.error('Failed to apply all rules', e);
      this.notify(i18n.t('rules.errors.apply_failed'));
    } finally {
      this.applyingAll = false;
    }
  }

  formatLastMatched(rule: any) {
    if (!rule.lastMatched) return i18n.t('rules.never_matched');
    
    const date = new Date(rule.lastMatched);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'today';
    if (diffDays === 1) return 'yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString();
  }

  // ------------------------------------------------------------------
  // Mobile layout
  // ------------------------------------------------------------------

  private renderMobileSuggestions() {
    if (this.suggestions.length === 0) return nothing;

    return html`
      <div class="u-suggestions">
        <div class="u-suggestions-header">
          <span>💡 ${i18n.t('mobile.suggested_rules', { count: this.suggestions.length })}</span>
          <button
            class="m-icon-btn"
            @click="${() => { this.showSuggestions = !this.showSuggestions; }}"
            title="${this.showSuggestions ? i18n.t('rules.hide_suggestions') : i18n.t('rules.show_suggestions')}">
            ${icon(this.showSuggestions ? 'expand_less' : 'expand_more', 22)}
          </button>
        </div>

        ${this.showSuggestions ? this.suggestions.map(s => html`
          <div class="u-suggestion">
            <div style="display: flex; align-items: flex-start; gap: 8px;">
              <div style="flex: 1; min-width: 0">
                <div class="u-suggestion-name">${s.name}</div>
                <div class="u-suggestion-meta">
                  ${i18n.t('rules.match_count').replace('{count}', s.matchCount)} ·
                  ${i18n.t('rules.confidence')} ${Number(s.confidence).toFixed(0)}%
                </div>
                <div class="u-meter" style="margin-top: 4px">
                  <div style="width: ${s.confidence}%"></div>
                </div>
              </div>
              ${s.category
                ? html`<span class="m-tag">${s.category.icon} ${s.category.name}</span>`
                : nothing}
            </div>

            <div style="display: flex; gap: 8px;">
              <button class="m-btn short" style="flex: 1" @click="${() => this.acceptSuggestion(s)}">
                ${i18n.t('rules.configure_accept')}
              </button>
              <button
                class="m-btn short outlined"
                style="width: 40px; padding: 0; color: var(--md-sys-color-error); border-color: var(--md-sys-color-error)"
                title="${i18n.t('rules.reject')}"
                @click="${() => this.rejectSuggestion(s)}">
                ${icon('close', 18)}
              </button>
            </div>
          </div>
        `) : nothing}
      </div>
    `;
  }

  private renderMobileRuleCard(rule: any, index: number) {
    const expanded = this.expandedRuleId === rule.id;

    return html`
      <div class="u-card" style="opacity: ${rule.enabled ? 1 : 0.5}"
        @click="${() => { this.expandedRuleId = expanded ? null : rule.id; }}">
        <div class="u-card-line1">
          <span class="u-card-index" title="${i18n.t('rules.priority')}: ${rule.priority}">
            #${index + 1}
          </span>
          <span class="u-card-name">${rule.name}</span>
          ${!rule.enabled
            ? html`<span class="u-badge off">${i18n.t('rules.disabled')}</span>`
            : rule.mode === 'AUTO_APPLY'
              ? html`<span class="u-badge auto">⚡ ${i18n.t('rules.mode_auto_apply')}</span>`
              : html`<span class="u-badge suggest">💡 ${i18n.t('rules.mode_suggest')}</span>`}
        </div>

        <div class="u-card-line2">
          ${rule.category
            ? html`<span class="m-tag">${rule.category.icon} ${rule.category.name}</span>`
            : nothing}
          <span>
            ${i18n.t('rules.match_count').replace('{count}', rule.matchCount || 0)} ·
            ${this.formatLastMatched(rule)}
          </span>
        </div>

        ${expanded ? html`
          <div class="u-card-line3" @click="${(e: Event) => e.stopPropagation()}">
            <button class="m-btn short outlined" style="flex: 1" ?disabled="${this.applying}"
              @click="${() => this.applyRule(rule)}">
              ${i18n.t('rules.apply_rule')}
            </button>
            <button
              class="m-btn short outlined"
              style="width: 40px; padding: 0"
              title="${rule.enabled ? i18n.t('rules.disabled') : i18n.t('rules.enabled')}"
              @click="${() => this.toggleEnabled(rule)}">
              ${icon(rule.enabled ? 'pause' : 'play_arrow', 18)}
            </button>
            <button
              class="m-btn short outlined"
              style="width: 40px; padding: 0"
              title="${i18n.t('common.edit')}"
              @click="${() => this.startEdit(rule)}">
              ${icon('edit', 18)}
            </button>
            <button
              class="m-btn short outlined"
              style="width: 40px; padding: 0; color: var(--md-sys-color-error); border-color: var(--md-sys-color-error)"
              title="${i18n.t('common.delete')}"
              @click="${() => this.deleteRule(rule.id)}">
              ${icon('delete', 18)}
            </button>
            <div class="u-reorder">
              <button ?disabled="${index === 0}" @click="${() => this.moveRule(index, 'up')}"
                title="${i18n.t('rules.priority_help')}">
                ${icon('keyboard_arrow_up', 16)}
              </button>
              <button
                ?disabled="${index === this.rules.length - 1}"
                @click="${() => this.moveRule(index, 'down')}"
                title="${i18n.t('rules.priority_help')}">
                ${icon('keyboard_arrow_down', 16)}
              </button>
            </div>
          </div>
        ` : nothing}
      </div>
    `;
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
    return html`
      <div class="m-screen u-screen">
        <div class="m-title-row">
          <h1 class="m-title">${i18n.t('rules.title')}</h1>
        </div>
        <p class="m-subtitle">${i18n.t('rules.priority_explanation')}</p>

        <div style="display: flex; gap: 8px;">
          <button
            class="m-btn short outlined"
            style="flex: 1; height: 44px; border-radius: 22px"
            ?disabled="${this.detecting}"
            @click="${this.detectPatterns}">
            ${this.detecting ? i18n.t('rules.detecting') : i18n.t('rules.detect_patterns')}
          </button>
          <button
            class="m-btn short outlined"
            style="flex: 1; height: 44px; border-radius: 22px"
            ?disabled="${this.applyingAll}"
            @click="${this.applyAllRules}">
            ${this.applyingAll ? i18n.t('rules.applying_all') : i18n.t('rules.apply_all_rules')}
          </button>
        </div>

        ${this.renderMobileSuggestions()}

        <div class="u-list">
          ${this.loading
            ? html`<div class="m-progress-bar"></div>`
            : this.rules.length === 0
              ? html`
                <div class="m-empty" style="padding-top: 40px">
                  <div class="m-empty-circle">${icon('rule', 40)}</div>
                  <div class="m-empty-title">${i18n.t('rules.no_rules')}</div>
                </div>
              `
              : this.rules.map((rule, index) => this.renderMobileRuleCard(rule, index))}
        </div>

        <!-- Pinned so it never covers the last card -->
        <div class="m-pinned">
          <button class="m-btn form block" @click="${this.startCreate}">
            ${icon('add', 22)} ${i18n.t('mobile.add_rule')}
          </button>
        </div>

        ${this.renderConfirmSheet()}
        ${snackbar(this.snack)}
      </div>

      ${this.showEditor ? html`
        <rule-editor
          .rule="${this.editingRule}"
          .categories="${this.categories}"
          @save="${(e: CustomEvent) => this.handleSave(e.detail)}"
          @cancel="${() => this.showEditor = false}"
        ></rule-editor>
      ` : ''}
    `;
  }

  render() {
    if (this.isMobile) return this.renderMobile();

    return html`
      <div class="page-header">
        <h1 class="page-title">${i18n.t('rules.title')}</h1>
        <p class="page-subtitle">
          Define rules to automatically categorize transactions based on patterns.
          ${i18n.t('rules.priority_explanation')}
        </p>
      </div>

      <div class="card">
        <div class="toolbar">
          <div style="display: flex; gap: 8px; flex-wrap: wrap;">
            <button class="btn-secondary" @click="${this.detectPatterns}" ?disabled="${this.detecting}">
              ${this.detecting ? i18n.t('rules.detecting') : i18n.t('rules.detect_patterns')}
            </button>
            <button class="btn-secondary" @click="${this.applyAllRules}" ?disabled="${this.applyingAll}">
              ${this.applyingAll ? i18n.t('rules.applying_all') : i18n.t('rules.apply_all_rules')}
            </button>
          </div>
          <button @click="${this.startCreate}">+ ${i18n.t('rules.add_rule')}</button>
        </div>

        ${this.suggestions.length > 0 ? html`
          <div class="suggestions-panel">
            <div class="suggestions-header">
              <div class="suggestions-title">
                💡 ${i18n.t('rules.suggestions_title')} (${this.suggestions.length})
              </div>
              <button class="btn-icon btn-small" @click="${() => this.showSuggestions = !this.showSuggestions}">
                ${this.showSuggestions ? '▲' : '▼'}
              </button>
            </div>
            
            ${this.showSuggestions ? html`
              ${this.suggestions.map(s => html`
                <div class="suggestion-item">
                  <div style="flex: 1; min-width: 0;">
                    <div style="font-weight: 500; margin-bottom: 4px;">${s.name}</div>
                    <div style="font-size: 0.875rem; color: var(--md-sys-color-on-surface-variant);">
                      ${i18n.t('rules.match_count').replace('{count}', s.matchCount)} • 
                      ${i18n.t('rules.confidence')}: ${Number(s.confidence).toFixed(0)}%
                      <div class="confidence-meter">
                        <div class="confidence-fill" style="width: ${s.confidence}%"></div>
                      </div>
                    </div>
                  </div>
                  <div style="display: flex; align-items: center; gap: 8px;">
                    ${s.category ? html`<span class="rule-category">${s.category.icon} ${s.category.name}</span>` : ''}
                    <button 
                      class="btn-small" 
                      style="background: var(--md-sys-color-primary);"
                      @click="${() => this.acceptSuggestion(s)}"
                    >
                      ${i18n.t('rules.configure_accept')}
                    </button>
                    <button 
                      class="btn-icon" 
                      style="color: var(--md-sys-color-error);" 
                      @click="${() => this.rejectSuggestion(s)}"
                      title="${i18n.t('rules.reject')}"
                    >
                      ✖
                    </button>
                  </div>
                </div>
              `)}
            ` : ''}
          </div>
        ` : ''}

        ${this.loading ? html`
          <div class="empty-state">
            <div>${i18n.t('common.loading')}</div>
          </div>
        ` : ''}

        ${!this.loading && this.rules.length === 0 ? html`
          <div class="empty-state">
            <div class="empty-state-icon">📏</div>
            <div style="font-size: 1.1rem; margin-bottom: 8px;">${i18n.t('rules.no_rules')}</div>
          </div>
        ` : ''}

        <div class="rule-list">
          ${this.rules.map((rule, index) => html`
            <div class="rule-item" style="opacity: ${rule.enabled ? 1 : 0.5}">
              <div style="display: flex; flex-direction: column; align-items: center; gap: 4px; margin-right: 8px;">
                <div style="font-size: 0.75rem; color: var(--md-sys-color-on-surface-variant); font-weight: 500;" title="Priority: ${rule.priority} (higher = evaluated first)">
                  #${index + 1}
                </div>
              </div>
              <div class="rule-reorder">
                <button 
                  class="btn-icon" 
                  @click="${() => this.moveRule(index, 'up')}" 
                  ?disabled="${index === 0}"
                  title="Move up (increase priority)"
                >
                  ▲
                </button>
                <button 
                  class="btn-icon" 
                  @click="${() => this.moveRule(index, 'down')}" 
                  ?disabled="${index === this.rules.length - 1}"
                  title="Move down (decrease priority)"
                >
                  ▼
                </button>
              </div>
              
              <div class="rule-content">
                <div class="rule-name">
                  <span>${rule.name}</span>
                  ${!rule.enabled ? html`<span class="badge badge-disabled">${i18n.t('rules.disabled')}</span>` : ''}
                  ${rule.mode === 'AUTO_APPLY' 
                    ? html`<span class="badge badge-auto">⚡ ${i18n.t('rules.mode_auto_apply')}</span>` 
                    : html`<span class="badge badge-suggest">💡 ${i18n.t('rules.mode_suggest')}</span>`
                  }
                </div>
                <div class="rule-desc">
                  ${rule.category ? html`<span class="rule-category">${rule.category.icon} ${rule.category.name}</span>` : ''}
                  <span>${i18n.t('rules.match_count').replace('{count}', rule.matchCount || 0)}</span>
                  <span>•</span>
                  <span>${i18n.t('rules.last_matched')}: ${this.formatLastMatched(rule)}</span>
                </div>
              </div>

              <div class="actions">
                <button 
                  class="btn-small btn-secondary" 
                  @click="${() => this.applyRule(rule)}"
                  ?disabled="${this.applying}"
                  title="${i18n.t('rules.apply_rule')}"
                >
                  ${i18n.t('rules.apply_rule')}
                </button>
                <button 
                  class="btn-icon" 
                  @click="${() => this.toggleEnabled(rule)}" 
                  title="${rule.enabled ? 'Disable' : 'Enable'}"
                >
                  ${rule.enabled ? '⏸' : '▶'}
                </button>
                <button 
                  class="btn-icon" 
                  @click="${() => this.startEdit(rule)}"
                  title="${i18n.t('common.edit')}"
                >
                  ✎
                </button>
                <button 
                  class="btn-icon" 
                  style="color: var(--md-sys-color-error); border-color: var(--md-sys-color-error);" 
                  @click="${() => this.deleteRule(rule.id)}"
                  title="${i18n.t('common.delete')}"
                >
                  🗑
                </button>
              </div>
            </div>
          `)}
        </div>
      </div>

      ${this.showEditor ? html`
        <rule-editor
          .rule="${this.editingRule}"
          .categories="${this.categories}"
          @save="${(e: CustomEvent) => this.handleSave(e.detail)}"
          @cancel="${() => this.showEditor = false}"
        ></rule-editor>
      ` : ''}
    `;
  }
}
