import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { api } from '../api/client';
import { i18n } from '../i18n/i18n';
import '../components/rule-editor';

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
  `;

  async connectedCallback() {
    super.connectedCallback();
    await this.loadRules();
    await this.loadCategories();
    await this.loadSuggestions();
  }

  async loadRules() {
    this.loading = true;
    try {
      this.rules = await api.get('/rules');
    } catch (e) {
      console.error(e);
      alert(i18n.t('rules.errors.load_failed'));
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
    if (!confirm(i18n.t('rules.delete_confirm'))) return;
    try {
      await api.delete(`/rules/${id}`);
      await this.loadRules();
    } catch (e) {
      console.error(e);
      alert(i18n.t('rules.errors.delete_failed'));
    }
  }

  async handleSave(ruleData: any) {
    try {
      if (this.editingRule && this.editingRule.id) {
        await api.patch(`/rules/${this.editingRule.id}`, ruleData);
      } else {
        await api.post('/rules', ruleData);
      }
      
      // If this came from a suggestion, mark it as accepted
      if (this.editingRule && this.editingRule._suggestionId) {
        await api.post(`/rules/suggestions/${this.editingRule._suggestionId}/accept`, {});
        await this.loadSuggestions(); // Reload to remove from list
      }
      
      this.showEditor = false;
      await this.loadRules();
    } catch (e: any) {
      console.error(e);
      alert(i18n.t('rules.errors.save_failed') + ': ' + e.message);
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
        alert(i18n.t('rules.suggestions_found').replace('{count}', this.suggestions.length.toString()));
      } else {
        alert(i18n.t('rules.no_suggestions'));
      }
    } catch (e: any) {
      console.error(e);
      alert(i18n.t('rules.errors.detect_failed'));
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
    if (!confirm(i18n.t('rules.apply_confirm'))) return;
    
    this.applying = true;
    try {
      const result = await api.post(`/rules/${rule.id}/apply`, {});
      const count = result.matchCount || 0;
      alert(i18n.t('rules.applied_success').replace('{count}', count.toString()));
      await this.loadRules();
    } catch (e: any) {
      console.error(e);
      alert(i18n.t('rules.errors.apply_failed'));
    } finally {
      this.applying = false;
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

  render() {
    return html`
      <div class="page-header">
        <h1 class="page-title">${i18n.t('rules.title')}</h1>
        <p class="page-subtitle">
          Define rules to automatically categorize transactions based on patterns.
        </p>
      </div>

      <div class="card">
        <div class="toolbar">
          <div style="display: flex; gap: 8px;">
            <button class="btn-secondary" @click="${this.detectPatterns}" ?disabled="${this.detecting}">
              ${this.detecting ? i18n.t('rules.detecting') : i18n.t('rules.detect_patterns')}
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
              <div class="rule-reorder">
                <button 
                  class="btn-icon" 
                  @click="${() => this.moveRule(index, 'up')}" 
                  ?disabled="${index === 0}"
                  title="Move up"
                >
                  ▲
                </button>
                <button 
                  class="btn-icon" 
                  @click="${() => this.moveRule(index, 'down')}" 
                  ?disabled="${index === this.rules.length - 1}"
                  title="Move down"
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
