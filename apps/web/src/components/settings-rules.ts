import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { api } from '../api/client';
import './rule-editor';

@customElement('settings-rules')
export class SettingsRules extends LitElement {
  @state() rules: any[] = [];
  @state() loading = false;
  @state() showEditor = false;
  @state() editingRule: any = null;
  @state() categories: any[] = [];
  @state() suggestions: any[] = [];
  @state() showSuggestions = false;
  @state() detecting = false;

  static styles = css`
    :host { display: block; }
    
    .section-title { font: var(--md-sys-typescale-title-large); margin-bottom: 16px; color: var(--md-sys-color-on-surface); margin-top: 32px; }
    
    .settings-group { 
        background: var(--md-sys-color-surface-container-low); 
        padding: 24px; 
        border-radius: var(--md-sys-shape-corner-medium); 
        margin-bottom: 24px; 
        box-shadow: 0 1px 3px 0 rgba(0,0,0,0.12); 
    }

    .toolbar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }

    button {
        height: 40px;
        padding: 0 24px;
        border-radius: 20px;
        border: none;
        font: var(--md-sys-typescale-label-large);
        cursor: pointer;
        background: var(--md-sys-color-primary);
        color: var(--md-sys-color-on-primary);
        display: flex;
        align-items: center;
        gap: 8px;
    }
    
    .btn-secondary {
        background: transparent;
        border: 1px solid var(--md-sys-color-outline);
        color: var(--md-sys-color-primary);
    }

    .suggestions-panel {
        background: var(--md-sys-color-surface-container-high);
        border: 1px solid var(--md-sys-color-outline-variant);
        border-radius: 12px;
        padding: 16px;
        margin-bottom: 16px;
    }

    .suggestion-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 12px;
        background: var(--md-sys-color-surface);
        border-radius: 8px;
        margin-bottom: 8px;
    }

    .confidence-meter {
        height: 4px;
        background: #eee;
        width: 100px;
        border-radius: 2px;
        overflow: hidden;
        margin-top: 4px;
    }
    .confidence-fill { height: 100%; background: var(--md-sys-color-primary); }

    .rule-list { display: flex; flex-direction: column; gap: 8px; }
    
    .rule-item {
        display: flex;
        align-items: center;
        padding: 12px 16px;
        background: var(--md-sys-color-surface);
        border: 1px solid var(--md-sys-color-outline-variant);
        border-radius: 8px;
        gap: 16px;
    }

    .rule-priority {
        color: var(--md-sys-color-on-surface-variant);
        font-family: monospace;
        width: 24px;
        text-align: center;
    }

    .rule-content { flex: 1; }
    .rule-name { font-weight: 500; color: var(--md-sys-color-on-surface); }
    .rule-desc { font-size: 0.875rem; color: var(--md-sys-color-on-surface-variant); }
    
    .rule-category {
        padding: 4px 8px;
        background: var(--md-sys-color-secondary-container);
        color: var(--md-sys-color-on-secondary-container);
        border-radius: 6px;
        font-size: 0.75rem;
    }

    .actions { display: flex; gap: 8px; }
    
    .btn-icon {
        padding: 8px;
        width: 32px;
        height: 32px;
        background: transparent;
        color: var(--md-sys-color-on-surface-variant);
        box-shadow: none;
    }
    .btn-icon:hover { background: var(--md-sys-color-surface-container-highest); }
  `;

  async connectedCallback() {
    super.connectedCallback();
    await this.loadRules();
    await this.loadCategories();
    // Load pending suggestions
    this.loadSuggestions();
  }

  async loadRules() {
    this.loading = true;
    try {
      this.rules = await api.get('/rules');
    } catch (e) {
      console.error(e);
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
    if (!confirm('Are you sure you want to delete this rule?')) return;
    try {
        await api.delete(`/rules/${id}`);
        await this.loadRules();
    } catch (e) {
        console.error(e);
        alert('Failed to delete rule');
    }
  }

  async handleSave(ruleData: any) {
    try {
        if (this.editingRule) {
            await api.patch(`/rules/${this.editingRule.id}`, ruleData);
        } else {
            await api.post('/rules', ruleData);
        }
        this.showEditor = false;
        await this.loadRules();
    } catch (e: any) {
        console.error(e);
        alert('Failed to save rule: ' + e.message);
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
      
      // Swap
      [newRules[index], newRules[newIndex]] = [newRules[newIndex], newRules[index]];
      
      // Send reorder request
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
      } catch (e: any) {
          console.error(e);
          alert('Failed to detect patterns');
      } finally {
          this.detecting = false;
      }
  }

  async acceptSuggestion(suggestion: any) {
      try {
          await api.post(`/rules/suggestions/${suggestion.id}/accept`, {});
          await this.loadSuggestions();
          await this.loadRules();
      } catch (e: any) {
          console.error(e);
          alert('Failed to accept suggestion');
      }
  }

  async rejectSuggestion(suggestion: any) {
      try {
          await api.post(`/rules/suggestions/${suggestion.id}/reject`, {});
          await this.loadSuggestions();
      } catch (e: any) {
          console.error(e);
      }
  }

  render() {
    return html`
      <div class="section-title">📏 Categorization Rules</div>
      <div class="settings-group">
        <div class="toolbar">
            <p style="margin: 0; color: var(--md-sys-color-on-surface-variant);">
                Define rules to automatically categorize transactions.
            </p>
            <div style="display: flex; gap: 8px;">
                <button class="btn-secondary" @click="${this.detectPatterns}" ?disabled="${this.detecting}">
                    ${this.detecting ? '🔍 Scanning...' : '🔍 Detect Patterns'}
                </button>
                <button @click="${this.startCreate}">+ Add Rule</button>
            </div>
        </div>

        ${this.suggestions.length > 0 ? html`
            <div class="suggestions-panel">
                <div style="display: flex; justify-content: space-between; margin-bottom: 12px;">
                    <strong>💡 ${this.suggestions.length} Suggestions Found</strong>
                    <button class="btn-icon" @click="${() => this.showSuggestions = !this.showSuggestions}">
                        ${this.showSuggestions ? '▲' : '▼'}
                    </button>
                </div>
                
                ${this.showSuggestions ? html`
                    ${this.suggestions.map(s => html`
                        <div class="suggestion-item">
                            <div>
                                <div style="font-weight: 500;">${s.name}</div>
                                <div style="font-size: 0.8rem; color: #666;">
                                    Matches ${s.matchCount} transactions • Confidence: ${Number(s.confidence).toFixed(0)}%
                                    <div class="confidence-meter">
                                        <div class="confidence-fill" style="width: ${s.confidence}%"></div>
                                    </div>
                                </div>
                            </div>
                            <div style="display: flex; align-items: center; gap: 8px;">
                                ${s.category ? html`<span class="rule-category">${s.category.icon} ${s.category.name}</span>` : ''}
                                <button class="btn-icon" style="color: var(--md-sys-color-primary)" @click="${() => this.acceptSuggestion(s)}">✔</button>
                                <button class="btn-icon" style="color: var(--md-sys-color-error)" @click="${() => this.rejectSuggestion(s)}">✖</button>
                            </div>
                        </div>
                    `)}
                ` : ''}
            </div>
        ` : ''}

        ${this.loading ? html`<p>Loading...</p>` : ''}

        ${!this.loading && this.rules.length === 0 ? html`<p>No rules defined yet.</p>` : ''}

        <div class="rule-list">
            ${this.rules.map((rule, index) => html`
                <div class="rule-item" style="opacity: ${rule.enabled ? 1 : 0.6}">
                    <div style="display: flex; flex-direction: column; gap: 2px;">
                        <button class="btn-icon" @click="${() => this.moveRule(index, 'up')}" ?disabled="${index === 0}">▲</button>
                        <button class="btn-icon" @click="${() => this.moveRule(index, 'down')}" ?disabled="${index === this.rules.length - 1}">▼</button>
                    </div>
                    
                    <div class="rule-content">
                        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
                            <span class="rule-name">${rule.name}</span>
                            ${!rule.enabled ? html`<span style="font-size: 0.7rem; background: #eee; padding: 2px 4px; border-radius: 4px;">DISABLED</span>` : ''}
                            ${rule.mode === 'AUTO_APPLY' ? html`⚡` : html`💡`}
                        </div>
                        <div class="rule-desc">
                            ${rule.category ? html`<span class="rule-category">${rule.category.icon} ${rule.category.name}</span>` : ''}
                            Matched ${rule.matchCount} times
                        </div>
                    </div>

                    <div class="actions">
                        <button class="btn-icon" @click="${() => this.toggleEnabled(rule)}" title="${rule.enabled ? 'Disable' : 'Enable'}">
                            ${rule.enabled ? '⏸' : '▶'}
                        </button>
                        <button class="btn-icon" @click="${() => this.startEdit(rule)}">✎</button>
                        <button class="btn-icon" style="color: var(--md-sys-color-error)" @click="${() => this.deleteRule(rule.id)}">🗑</button>
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
