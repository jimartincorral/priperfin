import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { api } from '../api/client';
import { i18n } from '../i18n/i18n';

interface SplitItem {
  amount: number;
  categoryId: string | null;
  costObjectId: string | null;
  description: string;
}

@customElement('split-transaction-modal')
export class SplitTransactionModal extends LitElement {
  @property({ type: Boolean }) open = false;
  @property({ type: Object }) transaction: any = null;
  @property({ type: Array }) categories: any[] = [];
  @property({ type: Array }) costObjects: any[] = [];

  @state() splits: SplitItem[] = [];
  @state() loading = false;
  @state() error = '';

  static styles = css`
    :host {
      display: none;
    }
    :host([open]) {
      display: block;
    }

    .overlay {
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
      color: var(--md-sys-color-on-surface);
      border-radius: 12px;
      padding: 24px;
      max-width: 800px;
      width: 90vw;
      max-height: 90vh;
      overflow-y: auto;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
    }

    h2 {
      margin: 0 0 16px 0;
      font: var(--md-sys-typescale-headline-small);
      color: var(--md-sys-color-on-surface);
    }

    .transaction-summary {
      background: var(--md-sys-color-surface-container);
      padding: 16px;
      border-radius: 8px;
      margin-bottom: 24px;
    }

    .summary-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 8px;
    }

    .summary-row:last-child {
      margin-bottom: 0;
    }

    .summary-label {
      font-weight: 600;
      color: var(--md-sys-color-on-surface-variant);
    }

    .splits-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 16px;
    }

    .splits-table th {
      text-align: left;
      padding: 8px;
      background: var(--md-sys-color-surface-container);
      border-bottom: 2px solid var(--md-sys-color-outline-variant);
      font-weight: 600;
      font-size: 14px;
    }

    .splits-table td {
      padding: 8px;
      border-bottom: 1px solid var(--md-sys-color-outline-variant);
    }

    input, select {
      width: 100%;
      height: 36px;
      padding: 0 12px;
      border: 1px solid var(--md-sys-color-outline);
      border-radius: 4px;
      background: var(--md-sys-color-surface);
      color: var(--md-sys-color-on-surface);
      font-size: 14px;
    }

    input:focus, select:focus {
      outline: 2px solid var(--md-sys-color-primary);
      border-color: var(--md-sys-color-primary);
    }

    .btn-icon {
      width: 32px;
      height: 32px;
      border: none;
      background: var(--md-sys-color-error-container);
      color: var(--md-sys-color-on-error-container);
      border-radius: 50%;
      cursor: pointer;
      font-size: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .btn-icon:hover {
      background: var(--md-sys-color-error);
      color: var(--md-sys-color-on-error);
    }

    .btn-add {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 8px 16px;
      border: none;
      background: var(--md-sys-color-secondary-container);
      color: var(--md-sys-color-on-secondary-container);
      border-radius: 20px;
      cursor: pointer;
      font-size: 14px;
      font-weight: 500;
      margin-bottom: 16px;
    }

    .btn-add:hover {
      background: var(--md-sys-color-secondary);
      color: var(--md-sys-color-on-secondary);
    }

    .remaining-amount {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px;
      border-radius: 8px;
      margin-bottom: 16px;
      font-weight: 600;
    }

    .remaining-amount.valid {
      background: #d1fae5;
      color: #065f46;
    }

    .remaining-amount.invalid {
      background: #fee2e2;
      color: #991b1b;
    }

    .error-message {
      background: var(--md-sys-color-error-container);
      color: var(--md-sys-color-on-error-container);
      padding: 12px;
      border-radius: 8px;
      margin-bottom: 16px;
    }

    .actions {
      display: flex;
      justify-content: space-between;
      gap: 12px;
    }

    .actions-left {
      display: flex;
      gap: 12px;
    }

    .actions-right {
      display: flex;
      gap: 12px;
      margin-left: auto;
    }

    button {
      padding: 10px 20px;
      border: none;
      border-radius: 20px;
      cursor: pointer;
      font-size: 14px;
      font-weight: 500;
      transition: background 0.2s;
    }

    .btn-primary {
      background: var(--md-sys-color-primary);
      color: var(--md-sys-color-on-primary);
    }

    .btn-primary:hover {
      background: var(--md-sys-color-primary-container);
      color: var(--md-sys-color-on-primary-container);
    }

    .btn-primary:disabled {
      background: var(--md-sys-color-surface-container);
      color: var(--md-sys-color-on-surface-variant);
      cursor: not-allowed;
    }

    .btn-secondary {
      background: var(--md-sys-color-secondary-container);
      color: var(--md-sys-color-on-secondary-container);
    }

    .btn-secondary:hover {
      background: var(--md-sys-color-secondary);
      color: var(--md-sys-color-on-secondary);
    }

    .btn-danger {
      background: var(--md-sys-color-error-container);
      color: var(--md-sys-color-on-error-container);
    }

    .btn-danger:hover {
      background: var(--md-sys-color-error);
      color: var(--md-sys-color-on-error);
    }
  `;

  connectedCallback() {
    super.connectedCallback();
    // Load existing splits or initialize with empty array
    if (this.transaction?.splits && this.transaction.splits.length > 0) {
      this.splits = this.transaction.splits.map((s: any) => ({
        amount: s.amount,
        categoryId: s.categoryId,
        costObjectId: s.costObjectId,
        description: s.description || '',
      }));
    } else {
      // Pre-populate with parent transaction category if available
      this.splits = [{
        amount: this.transaction?.amount || 0,
        categoryId: this.transaction?.categoryId || null,
        costObjectId: this.transaction?.costObjectId || null,
        description: '',
      }];
    }
  }

  getRemainingAmount(): number {
    if (!this.transaction) return 0;
    const total = this.splits.reduce((sum, split) => sum + split.amount, 0);
    return this.transaction.amount - total;
  }

  isValid(): boolean {
    return Math.abs(this.getRemainingAmount()) < 0.01;
  }

  addSplit() {
    this.splits = [...this.splits, {
      amount: this.getRemainingAmount(),
      categoryId: null,
      costObjectId: null,
      description: '',
    }];
  }

  removeSplit(index: number) {
    this.splits = this.splits.filter((_, i) => i !== index);
  }

  updateSplit(index: number, field: keyof SplitItem, value: any) {
    this.splits = this.splits.map((split, i) => {
      if (i === index) {
        return { ...split, [field]: value };
      }
      return split;
    });
  }

  async saveSplits() {
    if (!this.isValid()) {
      this.error = 'Splits must sum to the parent transaction amount';
      return;
    }

    this.loading = true;
    this.error = '';

    try {
      const hasSplits = this.transaction.splits && this.transaction.splits.length > 0;
      const endpoint = `/transactions/${this.transaction.id}/splits`;

      if (hasSplits) {
        // Update existing splits
        await api.put(endpoint, { splits: this.splits });
      } else {
        // Create new splits
        await api.post(endpoint, { splits: this.splits });
      }

      this.dispatchEvent(new CustomEvent('save', { detail: { transactionId: this.transaction.id } }));
      this.close();
    } catch (e: any) {
      this.error = e.message || 'Failed to save splits';
    } finally {
      this.loading = false;
    }
  }

  async removeSplits() {
    if (!confirm('Are you sure you want to remove all splits and convert this back to a simple transaction?')) {
      return;
    }

    this.loading = true;
    this.error = '';

    try {
      await api.delete(`/transactions/${this.transaction.id}/splits`);
      this.dispatchEvent(new CustomEvent('save', { detail: { transactionId: this.transaction.id } }));
      this.close();
    } catch (e: any) {
      this.error = e.message || 'Failed to remove splits';
    } finally {
      this.loading = false;
    }
  }

  close() {
    this.open = false;
    this.error = '';
    this.dispatchEvent(new Event('close'));
  }

  render() {
    if (!this.open || !this.transaction) return html``;

    const remaining = this.getRemainingAmount();
    const isValid = this.isValid();

    return html`
      <div class="overlay" @click="${this.close}">
        <div class="modal" @click="${(e: Event) => e.stopPropagation()}">
          <h2>🔀 Split Transaction</h2>

          <div class="transaction-summary">
            <div class="summary-row">
              <span class="summary-label">Date:</span>
              <span>${new Date(this.transaction.date).toLocaleDateString()}</span>
            </div>
            <div class="summary-row">
              <span class="summary-label">Description:</span>
              <span>${this.transaction.description}</span>
            </div>
            <div class="summary-row">
              <span class="summary-label">Total Amount:</span>
              <span style="font-weight: 700;">${this.transaction.amount < 0 ? '-' : '+'}$${Math.abs(this.transaction.amount).toFixed(2)}</span>
            </div>
          </div>

          ${this.error ? html`
            <div class="error-message">${this.error}</div>
          ` : ''}

          <table class="splits-table">
            <thead>
              <tr>
                <th style="width: 120px;">Amount</th>
                <th>Category</th>
                <th>Cost Object</th>
                <th style="width: 150px;">Description</th>
                <th style="width: 50px;"></th>
              </tr>
            </thead>
            <tbody>
              ${this.splits.map((split, index) => html`
                <tr>
                  <td>
                    <input
                      type="number"
                      step="0.01"
                      .value="${split.amount}"
                      @input="${(e: any) => this.updateSplit(index, 'amount', parseFloat(e.target.value) || 0)}"
                    />
                  </td>
                  <td>
                    <select
                      .value="${split.categoryId || ''}"
                      @change="${(e: any) => this.updateSplit(index, 'categoryId', e.target.value || null)}"
                    >
                      <option value="">-- Uncategorized --</option>
                      ${this.categories.filter(c => !c.parentId && (c.type === 'EXPENSE' || !c.type)).map(parent => html`
                        <option value="${parent.id}">${parent.icon} ${parent.name}</option>
                        ${this.categories.filter(c => c.parentId === parent.id).map(child => html`
                          <option value="${child.id}">&nbsp;&nbsp;&nbsp;&nbsp;${child.icon} ${child.name}</option>
                        `)}
                      `)}
                    </select>
                  </td>
                  <td>
                    <select
                      .value="${split.costObjectId || ''}"
                      @change="${(e: any) => this.updateSplit(index, 'costObjectId', e.target.value || null)}"
                    >
                      <option value="">-- Unassigned --</option>
                      ${this.costObjects.map(co => html`
                        <option value="${co.id}">${co.icon} ${co.name}</option>
                      `)}
                    </select>
                  </td>
                  <td>
                    <input
                      type="text"
                      .value="${split.description || ''}"
                      @input="${(e: any) => this.updateSplit(index, 'description', e.target.value)}"
                      placeholder="Notes..."
                    />
                  </td>
                  <td style="text-align: center;">
                    ${this.splits.length > 1 ? html`
                      <button class="btn-icon" @click="${() => this.removeSplit(index)}" title="Remove split">×</button>
                    ` : ''}
                  </td>
                </tr>
              `)}
            </tbody>
          </table>

          <button class="btn-add" @click="${this.addSplit}">+ Add Split</button>

          <div class="remaining-amount ${isValid ? 'valid' : 'invalid'}">
            <span>Remaining Amount:</span>
            <span>$${Math.abs(remaining).toFixed(2)}</span>
          </div>

          <div class="actions">
            <div class="actions-left">
              ${this.transaction.splits && this.transaction.splits.length > 0 ? html`
                <button class="btn-danger" @click="${this.removeSplits}" ?disabled="${this.loading}">
                  Remove Splits
                </button>
              ` : ''}
            </div>
            <div class="actions-right">
              <button class="btn-secondary" @click="${this.close}" ?disabled="${this.loading}">
                Cancel
              </button>
              <button class="btn-primary" @click="${this.saveSplits}" ?disabled="${!isValid || this.loading}">
                ${this.loading ? 'Saving...' : 'Save Splits'}
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  }
}
