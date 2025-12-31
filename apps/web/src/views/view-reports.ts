import { LitElement, html, css } from 'lit';
import { customElement, state, query } from 'lit/decorators.js';
import { Chart, registerables } from 'chart.js';
import { SankeyController, Flow } from 'chartjs-chart-sankey';
import { api } from '../api/client';

import { i18n } from '../i18n/i18n';

Chart.register(...registerables, SankeyController, Flow);

const CHART_PALETTE = [
  '#006493', // Primary
  '#65587b', // Tertiary
  '#16a34a', // Green
  '#eab308', // Yellow
  '#0ea5e9', // Sky
  '#8b5cf6', // Violet
  '#f43f5e', // Rose
  '#10b981', // Emerald
  '#f59e0b', // Amber
  '#6366f1', // Indigo
];

@customElement('view-reports')
export class ViewReports extends LitElement {
  @state() loading = false;
  @state() month = new Date().getMonth() + 1;
  @state() year = new Date().getFullYear();
  @state() accounts: any[] = [];
  @state() selectedAccountId = '';

  @query('#breakdownChart') breakdownCanvas!: HTMLCanvasElement;
  @query('#sankeyChart') sankeyCanvas!: HTMLCanvasElement;

  private breakdownChart: Chart | null = null;
  private sankeyChart: Chart | null = null;

  static styles = css`
    :host { display: block; }
    
    .header { 
        display: flex; 
        justify-content: space-between; 
        align-items: center; 
        margin-bottom: 24px; 
        flex-wrap: wrap;
        gap: 16px;
    }
    h1 { font: var(--md-sys-typescale-headline-medium); color: var(--md-sys-color-on-surface); margin: 0; }
    
    .controls { display: flex; gap: 16px; align-items: center; }

    select { 
        height: 40px;
        padding: 0 16px; 
        border: 1px solid var(--md-sys-color-outline); 
        border-radius: 4px; 
        background-color: transparent;
        color: var(--md-sys-color-on-surface);
        font: var(--md-sys-typescale-body-large);
        min-width: 120px;
        transition: border-color 0.2s;
    }
    select:focus {
        border-color: var(--md-sys-color-primary);
        outline: 2px solid var(--md-sys-color-primary);
    }

    select option {
        background-color: var(--md-sys-color-surface);
        color: var(--md-sys-color-on-surface);
    }
    
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
        background-color: var(--md-sys-color-secondary-container);
        color: var(--md-sys-color-on-secondary-container);
    }
    button:hover {
        box-shadow: 0 1px 2px rgba(0,0,0,0.12);
        background-image: linear-gradient(rgba(29, 25, 43, 0.08), rgba(29, 25, 43, 0.08));
    }

    .charts-container { display: grid; grid-template-columns: 1fr; gap: 24px; margin-top: 24px; }
    @media (min-width: 1024px) { .charts-container { grid-template-columns: 1fr 1fr; } }
    
    .chart-card { 
        background: var(--md-sys-color-surface-container-low); 
        padding: 24px; 
        border-radius: var(--md-sys-shape-corner-medium); 
        box-shadow: 0 1px 3px 0 rgba(0,0,0,0.12), 0 1px 2px 0 rgba(0,0,0,0.24); 
    }
    .chart-card h3 { margin-top: 0; font: var(--md-sys-typescale-title-medium); color: var(--md-sys-color-on-surface-variant); margin-bottom: 24px; }
    
    canvas { width: 100%; height: 100%; }
  `;

  async firstUpdated() {
    await this.loadAccounts();
    await this.loadData();
  }

  async loadAccounts() {
    try {
      this.accounts = await api.get('/accounts');
    } catch (e) {
      console.error('Failed to load accounts:', e);
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
      const params: any = { month: this.month, year: this.year };
      if (this.selectedAccountId) {
        params.accountId = this.selectedAccountId;
      }

      const [breakdown, sankey] = await Promise.all([
        api.get('/reports/category-breakdown', params),
        api.get('/reports/sankey', params)
      ]);

      await this.updateComplete; // Ensure DOM is ready
      this.renderBreakdown(breakdown);
      this.renderSankey(sankey);
    } catch (e: any) {
      console.error(e);
      alert('Failed to load reports: ' + (e.message || e));
    } finally {
      this.loading = false;
    }
  }

  renderBreakdown(data: any[]) {
    try {
      if (this.breakdownChart) this.breakdownChart.destroy();
      if (!this.breakdownCanvas) return;

      if (!data || data.length === 0) return;

      const backgroundColors = data.map((d, i) => {
        // Use category color if it exists and isn't default black
        if (d.color && d.color !== '#000000' && d.color !== '#000') return d.color;
        return CHART_PALETTE[i % CHART_PALETTE.length];
      });

      this.breakdownChart = new Chart(this.breakdownCanvas, {
        type: 'doughnut',
        data: {
          labels: data.map(d => d.name),
          datasets: [{
            data: data.map(d => d.spent),
            backgroundColor: backgroundColors,
          }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'right',
                    onClick: (_e: any, legendItem: any, legend: any) => {
                        const index = legendItem.index;
                        const chart = legend.chart;
                        const meta = chart.getDatasetMeta(0);

                        // Toggle visibility
                        meta.data[index].hidden = !meta.data[index].hidden;
                        chart.update();
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context: any) {
                            let label = context.label || '';
                            if (label) {
                                label += ': ';
                            }
                            const value = context.parsed;
                            const total = context.chart._metasets[context.datasetIndex].total;
                            const percentage = ((value / total) * 100).toFixed(1) + '%';
                            label += value + ' (' + percentage + ')';
                            return label;
                        }
                    }
                }
            }
        }
      });
    } catch (e: any) {
      console.error('Breakdown Chart Error', e);
    }
  }

  renderSankey(data: any) {
    try {
      if (this.sankeyChart) this.sankeyChart.destroy();
      if (!this.sankeyCanvas) return;

      if (!data || !data.links || data.links.length === 0) return;

      const flows = data.links.map((l: any) => ({
        from: l.source,
        to: l.target,
        flow: l.value
      }));

      // Create a map of nodes to colors for consistency
      const nodes = [...new Set([...data.links.map((l: any) => l.source), ...data.links.map((l: any) => l.target)])];
      const nodeColorMap: { [key: string]: string } = {};
      nodes.forEach((node, i) => {
        nodeColorMap[node as string] = CHART_PALETTE[i % CHART_PALETTE.length];
      });

      this.sankeyChart = new Chart(this.sankeyCanvas, {
        type: 'sankey',
        data: {
          datasets: [{
            data: flows,
            colorFrom: (c: any) => nodeColorMap[c.dataset.data[c.dataIndex].from],
            colorTo: (c: any) => nodeColorMap[c.dataset.data[c.dataIndex].to],
            colorMode: 'gradient',
          }]
        },
        options: { 
            responsive: true, 
            maintainAspectRatio: false,
        }
      });
    } catch (e: any) {
      console.error('Sankey Chart Error', e);
    }
  }

  render() {
    return html`
      <div class="header">
        <h1>${i18n.t('reports.title')}</h1>
        <div class="controls">
            <select @change="${(e: any) => { this.selectedAccountId = e.target.value; this.loadData(); }}" .value="${this.selectedAccountId}" style="min-width: 150px;">
                <option value="">🏦 ${i18n.t('reports.all_accounts')}</option>
                ${this.accounts.map(a => html`<option value="${a.id}">${a.type === 'CREDIT' ? '💳' : '🏦'} ${a.name}</option>`)}
            </select>
            <select @change="${(e: any) => { this.month = parseInt(e.target.value); this.loadData(); }}" .value="${this.month}">
                ${Array.from({ length: 12 }, (_, i) => i + 1).map(m => {
      const monthName = new Date(2025, m - 1, 1).toLocaleString(i18n.getLocale(), { month: 'long' });
      // Capitalize first letter
      const label = monthName.charAt(0).toUpperCase() + monthName.slice(1);
      return html`<option value="${m}" ?selected=${this.month === m}>${label}</option>`;
    })}
            </select>
            <select @change="${(e: any) => { this.year = parseInt(e.target.value); this.loadData(); }}" .value="${this.year}">
                <option value="2025">2025</option>
                <option value="2026">2026</option>
            </select>
            <button @click="${this.loadData}">${i18n.t('reports.refresh')}</button>
        </div>
      </div>
      
      <div class="charts-container">
        <div class="chart-card">
            <h3>${i18n.t('reports.category_breakdown')}</h3>
            <div style="position: relative; height: 400px; width: 100%">
                <canvas id="breakdownChart"></canvas>
            </div>
        </div>
        <div class="chart-card">
            <h3>${i18n.t('reports.sankey_chart')}</h3>
            <div style="position: relative; height: 400px; width: 100%">
                <canvas id="sankeyChart"></canvas>
            </div>
        </div>
      </div>
    `;
  }
}
