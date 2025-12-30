import { LitElement, html, css } from 'lit';
import { customElement, state, property } from 'lit/decorators.js';
import Papa from 'papaparse';
import { i18n } from '../i18n/i18n';

@customElement('csv-wizard')
export class CsvWizard extends LitElement {
    @property({ type: Boolean }) open = false;
    @property({ type: Array }) accounts: any[] = [];
    @state() step = 1; // 1: Upload, 2: Map, 3: Review
    @state() file: File | null = null;
    @state() parsedData: any[] = [];
    @state() headers: string[] = [];
    @state() selectedAccountId: string = '';

    // Mapping state: { internalField: csvHeader }
    @state() mapping: Record<string, string> = {
        date: '',
        amount: '',
        description: '',
        notes: ''
    };

    @state() loading = false;
    @state() error = '';
    @state() processedRows: any[] = [];
    @state() duplicates: any[] = [];
    @state() selectedDuplicates: Set<string> = new Set();
    @state() dateFormat: 'YYYY-MM-DD' | 'DD.MM.YYYY' | 'MM/DD/YYYY' | 'DD/MM/YYYY' | 'DD-MM-YYYY' = 'YYYY-MM-DD';
    @state() numberFormat: 'dot' | 'comma' = 'dot'; // 'dot' = 1,234.56 (US/UK), 'comma' = 1.234,56 (EU)

    static styles = css`
    :host { display: block; }
    .overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 1000; display: flex; align-items: center; justify-content: center; }
    .modal { background: white; padding: 2rem; border-radius: 12px; width: 600px; max-width: 90%; max-height: 90vh; overflow-y: auto; box-shadow: 0 4px 20px rgba(0,0,0,0.15); }
    h2 { margin-top: 0; }
    .step-indicator { display: flex; gap: 1rem; margin-bottom: 2rem; border-bottom: 1px solid #eee; padding-bottom: 1rem; }
    .step { font-weight: 600; color: #ccc; }
    .step.active { color: #2563eb; }
    
    .actions { display: flex; justify-content: flex-end; gap: 1rem; margin-top: 2rem; }
    button { padding: 0.5rem 1rem; border-radius: 6px; border: none; cursor: pointer; font-weight: 500; }
    button.primary { background: #2563eb; color: white; }
    button.secondary { background: #e2e8f0; color: #475569; }
    
    .preview-table { width: 100%; border-collapse: collapse; margin-top: 1rem; font-size: 0.875rem; }
    .preview-table th, .preview-table td { border: 1px solid #e2e8f0; padding: 0.5rem; text-align: left; }
    .preview-table th { background: #f8fafc; }

    .mapping-row { display: flex; align-items: center; gap: 1rem; margin-bottom: 1rem; }
    .mapping-label { flex: 1; font-weight: 500; }
    .mapping-select { flex: 2; padding: 0.5rem; border: 1px solid #cbd5e1; border-radius: 4px; }
    
    .error { color: #dc2626; background: #fee2e2; padding: 0.5rem; border-radius: 4px; margin-bottom: 1rem; }
  `;

    handleFile(e: Event) {
        const input = e.target as HTMLInputElement;
        if (input.files && input.files[0]) {
            this.file = input.files[0];
            this.parseFile();
        }
    }

    parseFile() {
        if (!this.file) return;
        this.loading = true;
        this.error = '';

        Papa.parse(this.file, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
                this.parsedData = results.data;
                this.headers = results.meta.fields || [];
                this.loading = false;

                // Auto-guess mapping
                this.autoMap();
                this.step = 2;
            },
            error: (err) => {
                this.error = i18n.t('expenses.csv_wizard.failed_to_parse') + ': ' + err.message;
                this.loading = false;
            }
        });
    }

    autoMap() {
        const lowerHeaders = this.headers.map(h => h.toLowerCase());

        const findMatch = (keywords: string[]) => {
            const idx = lowerHeaders.findIndex(h => keywords.some(k => h.includes(k)));
            return idx >= 0 ? this.headers[idx] : '';
        };

        this.mapping = {
            date: findMatch(['date', 'time', 'when']),
            amount: findMatch(['amount', 'value', 'cost', 'price']),
            description: findMatch(['desc', 'memo', 'payee', 'narrative']),
            notes: findMatch(['note', 'comment', 'detail', 'ref'])
        };
    }

    processData() {
        // Convert mapped data to transaction objects
        this.processedRows = this.parsedData.map((row) => {
            const dateStr = row[this.mapping.date];
            const amountStr = row[this.mapping.amount];
            const descStr = row[this.mapping.description];
            const notesStr = row[this.mapping.notes];

            // Parse amount based on number format setting
            let amount: number;
            if (typeof amountStr === 'string') {
                let cleanedAmount = amountStr.trim();
                // Remove currency symbols and whitespace
                cleanedAmount = cleanedAmount.replace(/[€$£¥\s]/g, '');

                if (this.numberFormat === 'comma') {
                    // European format: 1.234,56 -> 1234.56
                    // Remove dots (thousands separator), replace comma with dot (decimal)
                    cleanedAmount = cleanedAmount.replace(/\./g, '').replace(',', '.');
                } else {
                    // US/UK format: 1,234.56 -> 1234.56
                    // Remove commas (thousands separator)
                    cleanedAmount = cleanedAmount.replace(/,/g, '');
                }
                amount = parseFloat(cleanedAmount);
            } else {
                amount = parseFloat(amountStr);
            }

            let date: Date | null = null;

            // Strict Date Parsing
            if (dateStr) {
                if (this.dateFormat === 'YYYY-MM-DD') {
                    date = new Date(dateStr);
                } else if (this.dateFormat === 'DD.MM.YYYY') {
                    const [day, month, year] = dateStr.split('.');
                    if (day && month && year) date = new Date(`${year}-${month}-${day}`);
                } else if (this.dateFormat === 'DD/MM/YYYY') {
                    const [day, month, year] = dateStr.split('/');
                    if (day && month && year) date = new Date(`${year}-${month}-${day}`);
                } else if (this.dateFormat === 'MM/DD/YYYY') {
                    const [month, day, year] = dateStr.split('/');
                    if (day && month && year) date = new Date(`${year}-${month}-${day}`);
                } else if (this.dateFormat === 'DD-MM-YYYY') {
                    const [day, month, year] = dateStr.split('-');
                    if (day && month && year) date = new Date(`${year}-${month}-${day}`);
                }
            }

            // Check validity
            if (!date || isNaN(date.getTime())) {
                // If invalid, we skip this row or mark as error? 
                // For now, let's return a dummy date but log it, or better yet, default to invalid so it can be filtered/warned.
                // CURRENT DECISION: Filter out invalid dates to prevent messy data, effectively "erroring" on them.
                return null;
            }

            return {
                date: date.toISOString(),
                amount: isNaN(amount) ? 0 : amount,
                description: descStr || 'Imported Transaction',
                notes: notesStr || ''
            };
        }).filter(row => row !== null && row.amount !== 0) as any[]; // Filter nulls (invalid dates) and zero amounts

        if (this.processedRows.length === 0) {
            this.error = i18n.t('expenses.csv_wizard.no_valid_rows');
            return;
        }

        this.step = 3;
    }

    async submit() {
        console.log('[CSV Wizard] Submitting rows:', this.processedRows, 'to account:', this.selectedAccountId);

        // Include accountId in each row if selected
        const rowsWithAccount = this.processedRows.map(row => ({
            ...row,
            accountId: this.selectedAccountId || null
        }));

        try {
            this.loading = true;
            this.error = '';

            // First attempt: check for duplicates (force=false)
            const response = await fetch(`http://${window.location.hostname}:3000/api/transactions/bulk`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ transactions: rowsWithAccount, force: false })
            });

            const result = await response.json();

            // If duplicates found, show Step 4
            if (result.duplicates && result.duplicates.length > 0) {
                // Add a temporary unique ID to each duplicate for UI selection
                this.duplicates = result.duplicates.map((d: any, i: number) => ({
                    ...d,
                    tempId: `dup-${i}-${Date.now()}`
                }));
                this.selectedDuplicates = new Set(); // Start with none selected
                this.step = 4;
                this.loading = false;
                return;
            }

            // No duplicates, import successful
            this.dispatchEvent(new CustomEvent('import', { detail: { result } }));
            this.close();
        } catch (error: any) {
            this.error = error.message || 'Import failed';
            this.loading = false;
        }
    }

    isDuplicate(row: any, dup: any) {
        return new Date(row.date).getTime() === new Date(dup.date).getTime() &&
            Math.abs(row.amount - dup.amount) < 0.001 &&
            row.description === dup.description;
    }

    toggleDuplicate(id: string) {
        const newSet = new Set(this.selectedDuplicates);
        if (newSet.has(id)) {
            newSet.delete(id);
        } else {
            newSet.add(id);
        }
        this.selectedDuplicates = newSet;
    }

    async finalSubmit() {
        console.log('[CSV Wizard] Final submit with selected duplicates:', this.selectedDuplicates.size);

        const rowsWithAccount = this.processedRows.map(row => ({
            ...row,
            accountId: this.selectedAccountId || null
        }));

        try {
            this.loading = true;
            this.error = '';

            // Filter: Keep rows that are NOT duplicates, OR are duplicates that are SELECTED
            // We match by counting occurrences to handle identical rows correctly
            const rowsToImport: any[] = [];
            const dupCounts = new Map<string, number>();

            rowsWithAccount.forEach(row => {
                const isDup = this.duplicates.some(d => this.isDuplicate(row, d));
                if (!isDup) {
                    rowsToImport.push(row);
                    return;
                }

                // It's a duplicate. Find which one it is (index-based match)
                const key = `${row.date}_${row.amount}_${row.description}`;
                const count = (dupCounts.get(key) || 0);
                dupCounts.set(key, count + 1);

                const matches = this.duplicates.filter(d => this.isDuplicate(row, d));
                const targetDup = matches[count];

                if (targetDup && this.selectedDuplicates.has(targetDup.tempId)) {
                    rowsToImport.push(row);
                }
            });

            const transactionsToImport = rowsToImport;

            // Final import with force=true (since we've manually filtered what we want to keep)
            const response = await fetch(`http://${window.location.hostname}:3000/api/transactions/bulk`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    transactions: transactionsToImport,
                    force: true
                })
            });

            const result = await response.json();
            this.dispatchEvent(new CustomEvent('import', { detail: { result } }));
            this.close();
        } catch (error: any) {
            this.error = error.message || 'Import failed';
            this.loading = false;
        }
    }

    close() {
        this.open = false;
        this.reset();
        this.dispatchEvent(new CustomEvent('close'));
    }

    reset() {
        this.step = 1;
        this.file = null;
        this.parsedData = [];
        this.headers = [];
        this.mapping = { date: '', amount: '', description: '', notes: '' };
        this.processedRows = [];
        this.error = '';
        this.selectedAccountId = '';
        this.duplicates = [];
        this.selectedDuplicates = new Set();
    }

    render() {
        if (!this.open) return html``;

        return html`
      <div class="overlay" @click="${(e: Event) => { if (e.target === e.currentTarget) this.close() }}">
        <div class="modal">
          <h2>${i18n.t('expenses.csv_wizard.title')}</h2>
          
          <div class="step-indicator">
            <span class="step ${this.step === 1 ? 'active' : ''}">1. ${i18n.t('expenses.csv_wizard.step_upload')}</span>
            <span class="step ${this.step === 2 ? 'active' : ''}">2. ${i18n.t('expenses.csv_wizard.step_map')}</span>
            <span class="step ${this.step === 3 ? 'active' : ''}">3. ${i18n.t('expenses.csv_wizard.step_review')}</span>
            ${this.step === 4 ? html`<span class="step active">4. ${i18n.t('csv_wizard.duplicates_title')}</span>` : ''}
          </div>

          ${this.error ? html`<div class="error">${this.error}</div>` : ''}

          ${this.renderStep()}
        </div>
      </div>
    `;
    }

    renderStep() {
        if (this.step === 1) {
            return html`
        <div style="text-align: center; padding: 2rem; border: 2px dashed #e2e8f0; border-radius: 8px;">
            ${this.accounts.length > 0 ? html`
              <div style="margin-bottom: 1rem; text-align: left;">
                <label style="font-weight: 500; display: block; margin-bottom: 0.5rem;">${i18n.t('csv_wizard.import_to_account')}:</label>
                <select class="mapping-select" style="width: 100%;"
                  .value="${this.selectedAccountId}"
                  @change="${(e: any) => this.selectedAccountId = e.target.value}">
                  <option value="">-- ${i18n.t('csv_wizard.select_account')} --</option>
                  ${this.accounts.map(a => html`<option value="${a.id}">${a.name}</option>`)}
                </select>
              </div>
            ` : ''}
            <p>${i18n.t('expenses.csv_wizard.select_file')}</p>
            <input type="file" accept=".csv" @change="${this.handleFile}" />
            ${this.loading ? html`<p>${i18n.t('expenses.csv_wizard.parsing')}</p>` : ''}
        </div>
        <div class="actions">
            <button class="secondary" @click="${this.close}">${i18n.t('common.cancel')}</button>
        </div>
      `;
        }

        if (this.step === 2) {
            return html`
        <p>${i18n.t('expenses.csv_wizard.map_columns')}</p>
        
        <div class="mapping-row">
            <label class="mapping-label">${i18n.t('expenses.csv_wizard.date_format')}</label>
            <select class="mapping-select" .value="${this.dateFormat}" @change="${(e: any) => this.dateFormat = e.target.value}">
                <option value="YYYY-MM-DD">YYYY-MM-DD (ISO)</option>
                <option value="DD.MM.YYYY">DD.MM.YYYY (Euro e.g. 31.01.2024)</option>
                <option value="DD-MM-YYYY">DD-MM-YYYY (e.g. 31-01-2024)</option>
                <option value="MM/DD/YYYY">MM/DD/YYYY (US e.g. 12/31/2024)</option>
                <option value="DD/MM/YYYY">DD/MM/YYYY (Intl e.g. 31/12/2024)</option>
            </select>
        </div>

        <div class="mapping-row">
            <label class="mapping-label">${i18n.t('csv_wizard.number_format')}</label>
            <select class="mapping-select" .value="${this.numberFormat}" @change="${(e: any) => this.numberFormat = e.target.value}">
                <option value="dot">${i18n.t('csv_wizard.number_format_dot')}</option>
                <option value="comma">${i18n.t('csv_wizard.number_format_comma')}</option>
            </select>
        </div>

        <div class="mapping-row">
            <label class="mapping-label">${i18n.t('expenses.csv_wizard.date')}</label>
            <select class="mapping-select" .value="${this.mapping.date}" @change="${(e: any) => this.mapping = { ...this.mapping, date: e.target.value }}">
                <option value="">${i18n.t('expenses.csv_wizard.select_column')}</option>
                ${this.headers.map(h => html`<option value="${h}" ?selected="${h === this.mapping.date}">${h}</option>`)}
            </select>
        </div>
        
        <div class="mapping-row">
            <label class="mapping-label">${i18n.t('expenses.csv_wizard.amount')}</label>
            <select class="mapping-select" .value="${this.mapping.amount}" @change="${(e: any) => this.mapping = { ...this.mapping, amount: e.target.value }}">
                <option value="">${i18n.t('expenses.csv_wizard.select_column')}</option>
                ${this.headers.map(h => html`<option value="${h}" ?selected="${h === this.mapping.amount}">${h}</option>`)}
            </select>
        </div>
        <div class="mapping-row">
            <label class="mapping-label">${i18n.t('expenses.csv_wizard.description')}</label>
            <select class="mapping-select" .value="${this.mapping.description}" @change="${(e: any) => this.mapping = { ...this.mapping, description: e.target.value }}">
                <option value="">${i18n.t('expenses.csv_wizard.select_column')}</option>
                ${this.headers.map(h => html`<option value="${h}" ?selected="${h === this.mapping.description}">${h}</option>`)}
            </select>
        </div>

        <div class="mapping-row">
            <label class="mapping-label">${i18n.t('expenses.csv_wizard.notes_optional')}</label>
            <select class="mapping-select" .value="${this.mapping.notes}" @change="${(e: any) => this.mapping = { ...this.mapping, notes: e.target.value }}">
                <option value="">${i18n.t('expenses.csv_wizard.select_column')}</option>
                ${this.headers.map(h => html`<option value="${h}" ?selected="${h === this.mapping.notes}">${h}</option>`)}
            </select>
        </div>

        <h3>${i18n.t('expenses.csv_wizard.preview_first_3')}</h3>
        <table class="preview-table">
            <thead><tr>${this.headers.map(h => html`<th>${h}</th>`)}</tr></thead>
            <tbody>
                ${this.parsedData.slice(0, 3).map(row => html`
                    <tr>${this.headers.map(h => html`<td>${row[h]}</td>`)}</tr>
                `)}
            </tbody>
        </table>

        <div class="actions">
            <button class="secondary" @click="${() => this.step = 1}">${i18n.t('expenses.csv_wizard.back')}</button>
            <button class="primary" @click="${this.processData}" ?disabled="${!this.mapping.date || !this.mapping.amount}">${i18n.t('expenses.csv_wizard.next')}</button>
        </div>
      `;
        }

        if (this.step === 3) {
            return html`
        <p>${i18n.t('expenses.csv_wizard.ready_to_import')} <b>${this.processedRows.length}</b> ${i18n.t('expenses.csv_wizard.transactions')}.</p>
        
        <table class="preview-table">
            <thead><tr><th>${i18n.t('expenses.csv_wizard.date')}</th><th>${i18n.t('expenses.csv_wizard.description')}</th><th>${i18n.t('expenses.csv_wizard.amount')}</th></tr></thead>
            <tbody>
                ${this.processedRows.slice(0, 5).map(row => html`
                    <tr>
                        <td>${new Date(row.date).toLocaleDateString()}</td>
                        <td>${row.description}</td>
                        <td>${row.amount}</td>
                    </tr>
                `)}
            </tbody>
        </table>
        ${this.processedRows.length > 5 ? html`<p>${i18n.t('expenses.csv_wizard.and_more').replace('{count}', String(this.processedRows.length - 5))}</p>` : ''}

        <div class="actions">
            <button class="secondary" @click="${() => this.step = 2}">${i18n.t('expenses.csv_wizard.back')}</button>
            <button class="primary" @click="${this.submit}">${i18n.t('expenses.csv_wizard.import_now')}</button>
        </div>
      `;
        }

        if (this.step === 4) {
            return html`
        <div style="background: #fff3cd; padding: 1rem; border-radius: 8px; margin-bottom: 1rem; border-left: 4px solid #ffc107;">
            <strong>⚠️ ${i18n.t('csv_wizard.duplicates_detected')}</strong>
            <p style="margin: 0.5rem 0 0 0; font-size: 0.9rem;">
                ${i18n.t('csv_wizard.duplicates_found').replace('{count}', String(this.duplicates.length))}
            </p>
        </div>

        <div style="margin-bottom: 1rem;">
            <p>${i18n.t('csv_wizard.duplicates_select_prompt')}</p>
        </div>

        <table class="preview-table">
            <thead><tr>
                <th></th>
                <th>${i18n.t('common.date')}</th><th>${i18n.t('common.description')}</th><th>${i18n.t('common.amount')}</th>
            </tr></thead>
            <tbody>
                ${this.duplicates.map(dup => html`
                    <tr class="${this.selectedDuplicates.has(dup.tempId) ? 'selected' : ''}">
                        <td>
                            <input type="checkbox" 
                                .checked="${this.selectedDuplicates.has(dup.tempId)}"
                                @change="${() => {
                    this.toggleDuplicate(dup.tempId);
                    this.requestUpdate();
                }}" 
                            />
                        </td>
                        <td>${new Date(dup.date).toLocaleDateString()}</td>
                        <td>${dup.description}</td>
                        <td>${dup.amount}</td>
                    </tr>
                `)}
            </tbody>
        </table>
        
        <div style="margin-top: 1rem; color: #666; font-size: 0.9em;">
            * ${i18n.t('csv_wizard.duplicates_note')}
        </div>

        <div class="actions">
            <button class="secondary" @click="${() => this.step = 3}">${i18n.t('expenses.csv_wizard.back')}</button>
            <button class="primary" @click="${this.finalSubmit}">${i18n.t('csv_wizard.continue')}</button>
        </div>
      `;
        }
    }
}
