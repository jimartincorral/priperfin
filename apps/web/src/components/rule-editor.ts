import { LitElement, html, css } from 'lit';
import { customElement, state, property } from 'lit/decorators.js';
import { api } from '../api/client';

@customElement('rule-editor')
export class RuleEditor extends LitElement {
  @property({ type: Object }) rule: any = null;
  @property({ type: Array }) categories: any[] = [];

  @state() name = '';
  @state() mode = 'SUGGEST';
  @state() categoryId = '';
  @state() conditions: any[] = []; // Array of condition objects
  @state() testResults: any[] = [];
  @state() testing = false;

  static styles = css`
    :host { display: block; }
    
    .modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; }
    .modal { 
        background: var(--md-sys-color-surface-container-high); 
        padding: 24px; 
        border-radius: 28px; 
        box-shadow: 0 4px 8px rgba(0,0,0,0.2); 
        max-width: 600px; 
        width: 90%; 
        max-height: 90vh;
        overflow-y: auto;
        color: var(--md-sys-color-on-surface); 
    }
    
    h3 { margin-top: 0; }
    
    .form-group { margin-bottom: 16px; }
    label { display: block; margin-bottom: 8px; font-size: 0.875rem; color: var(--md-sys-color-on-surface-variant); }
    input, select { 
        height: 40px; 
        padding: 0 16px; 
        width: 100%; 
        box-sizing: border-box; 
        border: 1px solid var(--md-sys-color-outline); 
        border-radius: 4px;
        background: transparent;
        color: var(--md-sys-color-on-surface);
    }

    .conditions-list {
        border: 1px solid var(--md-sys-color-outline-variant);
        border-radius: 8px;
        padding: 16px;
        margin-bottom: 16px;
        background: var(--md-sys-color-surface-container);
    }

    .condition-row {
        display: flex;
        gap: 8px;
        margin-bottom: 8px;
        align-items: center;
    }
    
    .btn-icon {
        background: transparent;
        color: var(--md-sys-color-error);
        border: none;
        cursor: pointer;
        font-size: 1.2rem;
    }

    .btn-add {
        background: transparent;
        color: var(--md-sys-color-primary);
        border: 1px dashed var(--md-sys-color-outline);
        width: 100%;
        padding: 8px;
        cursor: pointer;
    }

    .actions { display: flex; justify-content: flex-end; gap: 8px; margin-top: 24px; }
    
    .btn-primary { background: var(--md-sys-color-primary); color: var(--md-sys-color-on-primary); border: none; padding: 10px 24px; border-radius: 20px; cursor: pointer; }
    .btn-secondary { background: transparent; border: 1px solid var(--md-sys-color-outline); color: var(--md-sys-color-on-surface); padding: 10px 24px; border-radius: 20px; cursor: pointer; }
    
    .test-results {
        margin-top: 16px;
        padding: 12px;
        background: var(--md-sys-color-secondary-container);
        color: var(--md-sys-color-on-secondary-container);
        border-radius: 8px;
        font-size: 0.875rem;
    }
  `;

  connectedCallback() {
    super.connectedCallback();
    if (this.rule) {
        this.name = this.rule.name;
        this.mode = this.rule.mode;
        this.categoryId = this.rule.categoryId || '';
        try {
            const parsed = JSON.parse(this.rule.conditionsJson);
            // Flatten to array if simple AND group
            if (parsed.operator === 'AND' && Array.isArray(parsed.conditions)) {
                this.conditions = parsed.conditions;
            } else {
                // Fallback for complex rules not supported by UI yet
                console.warn('Complex rule structure not fully supported by editor');
                this.conditions = []; 
            }
        } catch (e) {
            this.conditions = [];
        }
    } else {
        // Default new rule
        this.conditions = [{ field: 'description', operator: 'contains', value: '' }];
    }
  }

  addCondition() {
      this.conditions = [...this.conditions, { field: 'description', operator: 'contains', value: '' }];
  }

  removeCondition(index: number) {
      this.conditions = this.conditions.filter((_, i) => i !== index);
  }

  updateCondition(index: number, field: string, value: any) {
      const newConditions = [...this.conditions];
      newConditions[index] = { ...newConditions[index], [field]: value };
      this.conditions = newConditions;
  }

  async testRule() {
      this.testing = true;
      try {
          const conditionsJson = JSON.stringify({
              operator: 'AND',
              conditions: this.conditions
          });
          const results = await api.post('/rules/test', { conditionsJson, limit: 5 });
          this.testResults = results;
      } catch (e) {
          console.error(e);
          alert('Test failed');
      } finally {
          this.testing = false;
      }
  }

  save() {
      if (!this.name) return alert('Name is required');
      if (this.conditions.length === 0) return alert('At least one condition is required');

      const conditionsJson = JSON.stringify({
          operator: 'AND',
          conditions: this.conditions
      });

      this.dispatchEvent(new CustomEvent('save', {
          detail: {
              name: this.name,
              mode: this.mode,
              categoryId: this.categoryId || null,
              conditionsJson
          }
      }));
  }

  render() {
    return html`
      <div class="modal-overlay" @click="${() => this.dispatchEvent(new CustomEvent('cancel'))}">
        <div class="modal" @click="${(e: Event) => e.stopPropagation()}">
            <h3>${this.rule ? 'Edit Rule' : 'New Rule'}</h3>
            
            <div class="form-group">
                <label>Rule Name</label>
                <input type="text" .value="${this.name}" @input="${(e: any) => this.name = e.target.value}" placeholder="e.g. Amazon Orders" />
            </div>

            <div class="form-group">
                <label>Conditions (All must match)</label>
                <div class="conditions-list">
                    ${this.conditions.map((cond, index) => html`
                        <div class="condition-row">
                            <select .value="${cond.field}" @change="${(e: any) => this.updateCondition(index, 'field', e.target.value)}" style="width: 120px;">
                                <option value="description">Description</option>
                                <option value="amount">Amount</option>
                                <option value="merchant">Merchant</option>
                                <option value="notes">Notes</option>
                            </select>
                            
                            <select .value="${cond.operator}" @change="${(e: any) => this.updateCondition(index, 'operator', e.target.value)}" style="width: 120px;">
                                <option value="contains">contains</option>
                                <option value="equals">equals</option>
                                <option value="startsWith">starts with</option>
                                <option value="endsWith">ends with</option>
                                <option value="greaterThan">greater than</option>
                                <option value="lessThan">less than</option>
                            </select>
                            
                            <input type="${cond.field === 'amount' ? 'number' : 'text'}" 
                                .value="${cond.value}" 
                                @input="${(e: any) => this.updateCondition(index, 'value', e.target.value)}" 
                                placeholder="Value"
                            />
                            
                            <button class="btn-icon" @click="${() => this.removeCondition(index)}">×</button>
                        </div>
                    `)}
                    <button class="btn-add" @click="${this.addCondition}">+ Add Condition</button>
                </div>
            </div>

            <div class="form-group">
                <label>Action: Set Category</label>
                <select .value="${this.categoryId}" @change="${(e: any) => this.categoryId = e.target.value}">
                    <option value="">Select Category...</option>
                    ${this.categories.map(c => html`
                        <option value="${c.id}">${c.icon} ${c.name}</option>
                    `)}
                </select>
            </div>

            <div class="form-group">
                <label>Mode</label>
                <select .value="${this.mode}" @change="${(e: any) => this.mode = e.target.value}">
                    <option value="SUGGEST">💡 Suggest Only (User must confirm)</option>
                    <option value="AUTO_APPLY">⚡ Auto-Apply (Skip confirmation)</option>
                </select>
            </div>

            <div style="display: flex; justify-content: space-between; align-items: center;">
                <button class="btn-secondary" @click="${this.testRule}" ?disabled="${this.testing}">
                    ${this.testing ? 'Testing...' : '🧪 Test Rule'}
                </button>
                ${this.testResults.length > 0 ? html`<span>Matches: ${this.testResults.length}</span>` : ''}
            </div>

            ${this.testResults.length > 0 ? html`
                <div class="test-results">
                    <strong>Preview Matches:</strong><br/>
                    ${this.testResults.map(tx => html`
                        <div style="margin-top: 4px; font-family: monospace;">
                            ${tx.date.substring(0,10)}: ${tx.description} (${tx.amount})
                        </div>
                    `)}
                </div>
            ` : ''}

            <div class="actions">
                <button class="btn-secondary" @click="${() => this.dispatchEvent(new CustomEvent('cancel'))}">Cancel</button>
                <button class="btn-primary" @click="${this.save}">Save Rule</button>
            </div>
        </div>
      </div>
    `;
  }
}
