import { LitElement, html, css, nothing, svg, type TemplateResult } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { simulatorApi, type SavedScenario } from '../api/client';
import { i18n } from '../i18n/i18n';
import { currencySymbol, getStoredCurrency } from '../utils/currency';
import { icon } from '../styles/mobile-ui';
import { NOTIFY_EVENT } from '../components/app-toast';
import {
  DEFAULT_BASIS,
  addMonths,
  averageMonth,
  cushionMonths,
  formatMonth,
  isActive,
  monthDiff,
  normalizeBasis,
  normalizeChanges,
  project,
  verdict,
  TRANSFERS_OUT,
  type AverageMonth,
  type Baseline,
  type ChangeKind,
  type Horizon,
  type Period,
  type Projection,
  type ScenarioBasis,
  type ScenarioChange,
} from '../utils/simulator-engine';

interface Draft {
  id: string | null;
  name: string;
  changes: ScenarioChange[];
  basis: ScenarioBasis;
}

interface Editor {
  change: ScenarioChange;
  isNew: boolean;
}

const KINDS: Array<{ kind: ChangeKind; cadence: 'every' | 'months' | 'once' }> = [
  { kind: 'recurring', cadence: 'every' },
  { kind: 'temporary', cadence: 'months' },
  { kind: 'oneoff', cadence: 'once' },
  { kind: 'income', cadence: 'every' },
  { kind: 'category', cadence: 'every' },
];

const CHART_W = 1000;
const CHART_H = 240;

/**
 * What-if Simulator: build a scenario from changes (a new payment, a loan, a
 * pay cut…) and see it projected against the current path. The projection is
 * computed here from the baseline the API supplies; see simulator-engine.ts.
 */
@customElement('view-simulator')
export class ViewSimulator extends LitElement {
  @state() private baseline: Baseline | null = null;
  @state() private loadError = '';
  @state() private saved: SavedScenario[] = [];
  @state() private draft: Draft = this.newDraft();
  @state() private dirty = false;
  @state() private mode: 'build' | 'compare' = 'build';
  @state() private editor: Editor | null = null;
  @state() private saving = false;
  /** Bumped per baseline request so a slow, older response cannot win. */
  private baselineRequest = 0;

  private onLangChange = () => this.requestUpdate();

  connectedCallback() {
    super.connectedCallback();
    i18n.addEventListener('lang-change', this.onLangChange);
    this.load();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    i18n.removeEventListener('lang-change', this.onLangChange);
  }

  private async load() {
    try {
      const [baseline, saved] = await Promise.all([
        simulatorApi.getBaseline(),
        simulatorApi.listScenarios(),
      ]);
      this.baseline = baseline;
      this.saved = Array.isArray(saved) ? saved : [];
    } catch (e) {
      console.error('[Simulator] load failed', e);
      this.loadError = i18n.t('simulator.load_failed');
    }
  }

  /** Refetches the starting point when the draft's accounts differ from it. */
  private async syncBaseline() {
    const wanted = [...this.draft.basis.accounts].sort().join(',');
    const have = [...(this.baseline?.selectedAccountIds ?? [])].sort().join(',');
    if (!this.baseline || wanted === have) return;
    const request = ++this.baselineRequest;
    try {
      const baseline = await simulatorApi.getBaseline(this.draft.basis.accounts);
      if (request === this.baselineRequest) this.baseline = baseline;
    } catch (e: any) {
      this.notify(`${i18n.t('simulator.load_failed')}: ${e?.message ?? e}`);
    }
  }

  // ------------------------------------------------------------------
  // Formatting

  private get locale() {
    return i18n.getLocale();
  }

  private money(value: number, signed = false): string {
    const rounded = Math.round(value);
    const sign = rounded < 0 ? '−' : signed && rounded > 0 ? '+' : '';
    const symbol = currencySymbol(this.baseline?.currency || getStoredCurrency());
    return `${sign}${symbol}${Math.abs(rounded).toLocaleString(this.locale)}`;
  }

  private shortMoney(value: number): string {
    const abs = Math.abs(value);
    if (abs < 1000) return this.money(value);
    const symbol = currencySymbol(this.baseline?.currency || getStoredCurrency());
    const k = abs >= 10000 ? Math.round(abs / 1000) : Math.round(abs / 100) / 10;
    return `${value < 0 ? '−' : ''}${symbol}${k.toLocaleString(this.locale)}k`;
  }

  private month(key: string): string {
    return formatMonth(key, this.locale);
  }

  private notify(message: string) {
    window.dispatchEvent(new CustomEvent(NOTIFY_EVENT, { detail: { message } }));
  }

  // ------------------------------------------------------------------
  // Scenario state

  private newDraft(): Draft {
    return { id: null, name: i18n.t('simulator.new_scenario'), changes: [], basis: { ...DEFAULT_BASIS } };
  }

  private patchDraft(patch: Partial<Draft>) {
    this.draft = { ...this.draft, ...patch };
    this.dirty = true;
  }

  private updateBasis(patch: Partial<ScenarioBasis>) {
    this.patchDraft({ basis: { ...this.draft.basis, ...patch } });
    if (patch.accounts) this.syncBaseline();
  }

  private toggleAccount(id: string) {
    const all = this.baseline?.accounts.map((a) => a.id) ?? [];
    const current = new Set(this.draft.basis.accounts.length ? this.draft.basis.accounts : all);
    if (current.has(id)) current.delete(id);
    else current.add(id);
    // At least one account has to stay in.
    if (current.size === 0) return;
    const next = all.filter((a) => current.has(a));
    this.updateBasis({ accounts: next.length === all.length ? [] : next });
  }

  /** A category name as shown, translating the API's transfers key. */
  private categoryLabel(name: string): string {
    return name === TRANSFERS_OUT ? i18n.t('simulator.transfers_out') : name;
  }

  private confirmDiscard(): boolean {
    return !this.dirty || window.confirm(i18n.t('simulator.discard_confirm'));
  }

  private openScenario(id: string) {
    if (!this.confirmDiscard()) return;
    const s = this.saved.find((x) => x.id === id);
    this.draft = s
      ? { id: s.id, name: s.name, changes: normalizeChanges(s.changes), basis: normalizeBasis(s.basis) }
      : this.newDraft();
    this.dirty = false;
    this.mode = 'build';
    this.syncBaseline();
  }

  private async save() {
    const name = this.draft.name.trim() || i18n.t('simulator.new_scenario');
    const body = { name, changes: this.draft.changes, basis: this.draft.basis };
    this.saving = true;
    try {
      const result = this.draft.id
        ? await simulatorApi.updateScenario(this.draft.id, body)
        : await simulatorApi.createScenario(body);
      this.saved = this.draft.id
        ? this.saved.map((s) => (s.id === result.id ? result : s))
        : [...this.saved, result];
      this.draft = { ...this.draft, id: result.id, name: result.name };
      this.dirty = false;
      this.notify(i18n.t('simulator.saved'));
    } catch (e: any) {
      this.notify(`${i18n.t('simulator.save_failed')}: ${e?.message ?? e}`);
    } finally {
      this.saving = false;
    }
  }

  private async deleteScenario() {
    const id = this.draft.id;
    if (!id || !window.confirm(i18n.t('simulator.delete_confirm', { name: this.draft.name }))) return;
    try {
      await simulatorApi.deleteScenario(id);
      this.saved = this.saved.filter((s) => s.id !== id);
      this.draft = this.newDraft();
      this.dirty = false;
      this.notify(i18n.t('simulator.deleted'));
    } catch (e: any) {
      this.notify(e?.message ?? String(e));
    }
  }

  private toggleChange(id: string) {
    this.patchDraft({
      changes: this.draft.changes.map((c) => (c.id === id ? { ...c, enabled: !c.enabled } : c)),
    });
  }

  private toggleMonth(month: string) {
    const excluded = new Set(this.draft.basis.excluded);
    if (excluded.has(month)) excluded.delete(month);
    else excluded.add(month);
    this.updateBasis({ excluded: [...excluded].sort() });
  }

  // ------------------------------------------------------------------
  // Change editor

  private openEditor(change?: ScenarioChange) {
    if (!this.baseline) return;
    this.editor = change
      ? { change: { ...change }, isNew: false }
      : {
          isNew: true,
          change: {
            id: crypto.randomUUID?.() ?? `c${Date.now()}`,
            kind: 'recurring',
            name: i18n.t('simulator.default_name_recurring'),
            enabled: true,
            amount: 0,
            startMonth: addMonths(this.baseline.currentMonth, 1),
            months: 12,
            direction: 'out',
          },
        };
    this.updateComplete.then(() => {
      (this.renderRoot.querySelector('.dialog input[name="name"]') as HTMLInputElement | null)?.focus();
    });
  }

  private editChange(patch: Partial<ScenarioChange>) {
    if (!this.editor) return;
    const prev = this.editor.change;
    const next = { ...prev, ...patch };
    // A name the user has not typed follows the kind.
    if (patch.kind && prev.name === i18n.t(`simulator.default_name_${prev.kind}`)) {
      next.name = i18n.t(`simulator.default_name_${patch.kind}`);
    }
    if (patch.kind && patch.kind !== prev.kind) next.category = undefined;
    this.editor = { ...this.editor, change: next };
  }

  private commitEditor() {
    if (!this.editor) return;
    const c = { ...this.editor.change, name: this.editor.change.name.trim() || i18n.t(`simulator.default_name_${this.editor.change.kind}`) };
    if (c.kind !== 'temporary') delete c.months;
    if (c.kind !== 'oneoff') delete c.direction;
    if (c.kind !== 'recurring' && c.kind !== 'category') delete c.category;
    this.patchDraft({
      changes: this.editor.isNew
        ? [...this.draft.changes, c]
        : this.draft.changes.map((x) => (x.id === c.id ? c : x)),
    });
    this.editor = null;
  }

  private removeEditing() {
    if (!this.editor) return;
    const id = this.editor.change.id;
    this.patchDraft({ changes: this.draft.changes.filter((c) => c.id !== id) });
    this.editor = null;
  }

  /** The headline and detail line for a change, shared by the list and the dialog. */
  private describe(c: ScenarioChange, avg: AverageMonth): { main: string; sub: string; effect: number } {
    const t = (k: string, p?: Record<string, string | number>) => i18n.t(`simulator.${k}`, p);
    const start = this.month(c.startMonth);
    switch (c.kind) {
      case 'recurring': {
        const freed = c.category ? avg.categories[c.category] ?? 0 : 0;
        const effect = -(c.amount - freed);
        return {
          effect,
          main: t('effect_monthly', { amount: this.money(effect, true), month: start }),
          sub: c.category
            ? t('sub_replaces', { amount: this.money(c.amount), old: this.money(freed) })
            : t('sub_extra'),
        };
      }
      case 'temporary': {
        const n = Math.max(1, c.months ?? 1);
        return {
          effect: -c.amount,
          main: t('effect_for', { amount: this.money(-c.amount, true), n }),
          sub: t('sub_temporary', {
            from: start,
            to: this.month(addMonths(c.startMonth, n - 1)),
            total: this.money(c.amount * n),
          }),
        };
      }
      case 'oneoff': {
        const effect = c.direction === 'in' ? c.amount : -c.amount;
        return { effect, main: t('effect_once', { amount: this.money(effect, true), month: start }), sub: t('sub_once') };
      }
      case 'income':
        return {
          effect: c.amount,
          main: t('effect_monthly', { amount: this.money(c.amount, true), month: start }),
          sub: t('sub_income', { from: this.money(avg.income), to: this.money(avg.income + c.amount) }),
        };
      case 'category': {
        const base = c.category ? avg.categories[c.category] ?? 0 : 0;
        const delta = (base * c.amount) / 100;
        return {
          effect: -delta,
          main: t('effect_monthly', { amount: this.money(-delta, true), month: start }),
          sub: c.category
            ? t('sub_category', { category: this.categoryLabel(c.category), from: this.money(base), to: this.money(base + delta) })
            : t('sub_pick_category'),
        };
      }
    }
  }

  // ------------------------------------------------------------------
  // Render

  render() {
    if (this.loadError) {
      return html`<div class="page"><p class="banner bad">${this.loadError}</p></div>`;
    }
    if (!this.baseline) {
      return html`<div class="page"><div class="skeleton"></div></div>`;
    }
    const baseline = this.baseline;
    const avg = averageMonth(baseline, this.draft.basis);
    const p = project(baseline, this.draft.basis, this.draft.changes);

    return html`
      <div class="page">
        ${this.mode === 'compare' ? this.renderCompare(baseline) : html`
          ${this.renderHeader()}
          <div class="cols">
            <section class="builder" aria-label="${i18n.t('simulator.changes')}">
              ${this.renderStartingPoint(baseline, avg)}
              ${this.renderChanges(avg)}
              ${this.renderHorizon()}
            </section>
            <section class="results">
              ${this.renderInsight(p)}
              ${this.renderKpis(p, avg)}
              ${this.renderChart(p)}
              <div class="row-wrap">
                ${this.renderBreakdown(p)}
                ${this.renderGoals(p)}
              </div>
              <p class="footnote">${i18n.t('simulator.disclaimer')}</p>
            </section>
          </div>
        `}
      </div>
      ${this.editor ? this.renderEditor(this.editor, avg) : nothing}
    `;
  }

  private renderHeader() {
    return html`
      <header class="head">
        <div class="titles">
          <p class="eyebrow">${i18n.t('simulator.title')} · ${i18n.t('simulator.eyebrow')}</p>
          <label class="name-field">
            <span class="sr-only">${i18n.t('simulator.scenario_name')}</span>
            <input
              class="name-input"
              .value="${this.draft.name}"
              @input="${(e: Event) => this.patchDraft({ name: (e.target as HTMLInputElement).value })}"
              maxlength="100" />
          </label>
          <p class="sub">${i18n.t('simulator.subtitle')}${this.dirty ? html` · <strong>${i18n.t('simulator.unsaved')}</strong>` : nothing}</p>
        </div>
        <div class="actions">
          <label class="picker">
            <span class="sr-only">${i18n.t('simulator.scenario_picker')}</span>
            <select @change="${(e: Event) => {
              const select = e.target as HTMLSelectElement;
              this.openScenario(select.value);
              select.value = this.draft.id ?? '';
            }}">
              <option value="" ?selected="${!this.draft.id}">${i18n.t('simulator.new_scenario')}</option>
              ${this.saved.map((s) => html`<option value="${s.id}" ?selected="${s.id === this.draft.id}">${s.name}</option>`)}
            </select>
          </label>
          <button class="btn outlined" @click="${() => (this.mode = 'compare')}">${icon('compare_arrows', 18)}${i18n.t('simulator.compare')}</button>
          ${this.draft.id ? html`
            <button class="btn text" @click="${this.deleteScenario}" aria-label="${i18n.t('simulator.delete')}" title="${i18n.t('simulator.delete')}">${icon('delete', 18)}</button>
          ` : nothing}
          <button class="btn filled" ?disabled="${this.saving || (!this.dirty && !!this.draft.id)}" @click="${this.save}">${i18n.t('simulator.save')}</button>
        </div>
      </header>
    `;
  }

  private renderStartingPoint(baseline: Baseline, avg: AverageMonth) {
    const excluded = new Set(this.draft.basis.excluded);
    const leftOut = avg.window.filter((m) => excluded.has(m.month)).map((m) => this.month(m.month));
    const empty = baseline.months.every((m) => m.income === 0 && m.expenses === 0);
    return html`
      <div class="card tonal">
        <h2>${i18n.t('simulator.starting_point')}</h2>
        <div class="figures">
          <div><span class="label">${i18n.t('simulator.income_mo')}</span><span class="mono strong">${this.money(avg.income)}</span></div>
          <div><span class="label">${i18n.t('simulator.spending_mo')}</span><span class="mono strong">${this.money(avg.spending)}</span></div>
          <div><span class="label">${i18n.t('simulator.balance_today')}</span><span class="mono strong">${this.money(baseline.balance)}</span></div>
        </div>
        ${empty ? html`<p class="hint">${i18n.t('simulator.no_history')}</p>` : nothing}
        ${baseline.accounts.length > 1 ? this.renderAccounts(baseline) : nothing}
        <div class="divider"></div>
        <label class="inline-field">
          <span>${i18n.t('simulator.average_over')}</span>
          <select @change="${(e: Event) => this.updateBasis({ period: Number((e.target as HTMLSelectElement).value) as Period })}">
            ${[3, 6, 12].map((n) => html`<option value="${n}" ?selected="${n === this.draft.basis.period}">${i18n.t('simulator.last_n_months', { n })}</option>`)}
          </select>
        </label>
        <p class="hint">${i18n.t('simulator.months_hint')}</p>
        <div class="chips" role="group" aria-label="${i18n.t('simulator.months_group')}">
          ${avg.window.map((m) => {
            if (avg.empty.has(m.month)) {
              return html`
                <button class="chip off" disabled title="${i18n.t('simulator.no_data_hint')}">
                  <span class="chip-month">${this.month(m.month)}</span>
                  <span class="small">${i18n.t('simulator.no_data')}</span>
                </button>
              `;
            }
            const on = !excluded.has(m.month);
            return html`
              <button class="chip ${on ? 'on' : 'off'}" aria-pressed="${on}" @click="${() => this.toggleMonth(m.month)}">
                <span class="chip-month">${this.month(m.month)}</span>
                <span class="mono small">${this.money(m.income)}</span>
                ${avg.unusual.has(m.month) ? html`<span class="tag warn">${i18n.t('simulator.extra_income')}</span>` : nothing}
              </button>
            `;
          })}
        </div>
        <p class="hint">
          ${i18n.t('simulator.basis_note', { used: avg.used.length, total: avg.window.length })}
          ${leftOut.length ? html`<br />${i18n.t('simulator.left_out', { months: leftOut.join(', ') })}` : nothing}
        </p>
      </div>
    `;
  }

  private renderAccounts(baseline: Baseline) {
    const selected = new Set(this.draft.basis.accounts);
    const all = selected.size === 0;
    return html`
      <div class="divider"></div>
      <div class="inline-field">
        <span>${i18n.t('simulator.accounts')}</span>
        <span class="hint">${all
          ? i18n.t('simulator.accounts_all')
          : i18n.t('simulator.accounts_some', { n: selected.size, total: baseline.accounts.length })}</span>
      </div>
      <div class="chips" role="group" aria-label="${i18n.t('simulator.accounts')}">
        ${baseline.accounts.map((a) => {
          const on = all || selected.has(a.id);
          return html`
            <button class="chip ${on ? 'on' : 'off'}" aria-pressed="${on}" @click="${() => this.toggleAccount(a.id)}">
              <span class="chip-month">${a.name}</span>
              <span class="mono small">${this.money(a.balance)}</span>
            </button>
          `;
        })}
      </div>
      ${all ? nothing : html`<p class="hint">${i18n.t('simulator.accounts_transfers')}</p>`}
    `;
  }

  private renderChanges(avg: AverageMonth) {
    return html`
      <div class="stack">
        <h2>${i18n.t('simulator.changes')}</h2>
        ${this.draft.changes.length === 0 ? html`<p class="hint">${i18n.t('simulator.no_changes')}</p>` : nothing}
        ${this.draft.changes.map((c) => {
          const d = this.describe(c, avg);
          return html`
            <div class="change ${c.enabled ? '' : 'disabled'}">
              <label class="change-main">
                <input type="checkbox" .checked="${c.enabled}" @change="${() => this.toggleChange(c.id)}"
                  aria-label="${i18n.t('simulator.include_change', { name: c.name })}" />
                <span class="change-text">
                  <span class="change-name">${c.name}</span>
                  <span class="change-effect ${d.effect < 0 ? 'neg' : 'pos'}">${d.main}</span>
                  <span class="hint">${d.sub}</span>
                </span>
              </label>
              <button class="icon-btn" @click="${() => this.openEditor(c)}" aria-label="${i18n.t('simulator.edit_change')}" title="${i18n.t('simulator.edit_change')}">
                ${icon('edit', 20)}
              </button>
            </div>
          `;
        })}
        <button class="add" @click="${() => this.openEditor()}">${icon('add', 18)}${i18n.t('simulator.add_change')}</button>
      </div>
    `;
  }

  private renderHorizon() {
    return html`
      <div class="stack">
        <h2>${i18n.t('simulator.look_ahead')}</h2>
        <div class="segmented" role="group" aria-label="${i18n.t('simulator.look_ahead')}">
          ${([12, 24, 36] as Horizon[]).map((h) => html`
            <button class="${h === this.draft.basis.horizon ? 'selected' : ''}" aria-pressed="${h === this.draft.basis.horizon}"
              @click="${() => this.updateBasis({ horizon: h })}">${i18n.t('simulator.n_months', { n: h })}</button>
          `)}
        </div>
      </div>
    `;
  }

  private renderInsight(p: Projection) {
    const t = (k: string, params?: Record<string, string | number>) => i18n.t(`simulator.${k}`, params);
    const H = this.draft.basis.horizon;
    const endNet = p.endNet;
    const anyOn = this.draft.changes.some((c) => c.enabled);
    let kind = 'neutral';
    let title: string;
    let body: string;
    if (!anyOn) {
      title = t('insight_none_title');
      body = t('insight_none_body', { amount: this.money(p.baseNet) });
    } else if (p.firstShortfall !== null) {
      kind = 'bad';
      const lowMonth = this.month(p.months[p.lowest.offset]);
      if (endNet < 0) {
        title = t('insight_bad_title', { month: this.month(p.months[p.firstShortfall]), amount: this.money(-endNet) });
        body = t('insight_bad_body', {
          low: this.money(p.lowest.value),
          lowMonth,
          cushion: cushionMonths(p).toLocaleString(this.locale, { maximumFractionDigits: 1 }),
        });
      } else {
        title = t('insight_dip_title', { month: this.month(p.months[p.firstShortfall]) });
        body = t('insight_dip_body', { low: this.money(p.lowest.value), lowMonth });
      }
    } else {
      kind = 'good';
      const diff = endNet - p.baseNet;
      title = t('insight_ok_title', { amount: this.money(endNet) });
      body = t(diff < 0 ? 'insight_ok_less' : 'insight_ok_more', {
        diff: this.money(Math.abs(diff)),
        month: this.month(p.months[H]),
        balance: this.money(p.scenario[H]),
      });
    }
    return html`
      <div class="banner ${kind}" role="status">
        ${icon(kind === 'bad' ? 'warning' : 'info', 24)}
        <div><strong>${title}</strong><span>${body}</span></div>
      </div>
    `;
  }

  private renderKpis(p: Projection, avg: AverageMonth) {
    const H = this.draft.basis.horizon;
    const baseLow = Math.min(...p.base);
    const baseCushion = avg.spending > 0 ? Math.max(0, baseLow) / avg.spending : 0;
    const months = (n: number) => i18n.t('simulator.cushion_value', { n: n.toLocaleString(this.locale, { maximumFractionDigits: 1 }) });
    const tile = (label: string, base: number, scen: number, fmt: (n: number) => string, deltaFmt = fmt) => {
      const diff = Math.round((scen - base) * 10) / 10;
      const cls = diff === 0 ? 'same' : diff > 0 ? 'pos' : 'neg';
      const text = diff === 0
        ? i18n.t('simulator.no_change')
        : i18n.t(diff > 0 ? 'simulator.better' : 'simulator.worse', { amount: deltaFmt(Math.abs(diff)) });
      return html`
        <div class="kpi">
          <span class="label">${label}</span>
          <span class="mono big">${fmt(scen)}</span>
          <span class="label">${i18n.t('simulator.current_path')}: <span class="mono">${fmt(base)}</span></span>
          <span class="delta ${cls}">${diff === 0 ? '' : diff > 0 ? '▲ ' : '▼ '}${text}</span>
        </div>
      `;
    };
    return html`
      <div class="kpis">
        ${tile(i18n.t('simulator.kpi_left_over'), p.baseNet, p.endNet, (n) => this.money(n, true), (n) => this.money(n))}
        ${tile(i18n.t('simulator.kpi_balance_in', { month: this.month(p.months[H]) }), p.base[H], p.scenario[H], (n) => this.money(n))}
        ${tile(i18n.t('simulator.kpi_lowest', { month: this.month(p.months[p.lowest.offset]) }), baseLow, p.lowest.value, (n) => this.money(n))}
        ${tile(i18n.t('simulator.kpi_cushion'), baseCushion, cushionMonths(p), months)}
      </div>
    `;
  }

  private chartScale(values: number[]) {
    const min = Math.min(0, ...values);
    const max = Math.max(...values, 1);
    const raw = (max - min) / 4 || 1;
    const pow = Math.pow(10, Math.floor(Math.log10(raw)));
    const step = [1, 2, 2.5, 5, 10].map((m) => m * pow).find((s) => s >= raw) ?? raw;
    const lo = Math.floor(min / step) * step;
    const hi = Math.ceil(max / step) * step;
    return { lo, hi, step, y: (v: number) => CHART_H - ((v - lo) / (hi - lo || 1)) * CHART_H };
  }

  private points(values: number[], y: (v: number) => number, width = CHART_W): string {
    const n = values.length - 1 || 1;
    return values.map((v, i) => `${((i / n) * width).toFixed(1)},${y(v).toFixed(1)}`).join(' ');
  }

  private renderChart(p: Projection) {
    const H = this.draft.basis.horizon;
    const { lo, hi, step, y } = this.chartScale([...p.base, ...p.scenario]);
    const grid: number[] = [];
    for (let v = lo; v <= hi + step / 2; v += step) grid.push(v);
    const every = H <= 12 ? 3 : 6;
    const ticks: number[] = [];
    for (let i = 0; i <= H; i += every) ticks.push(i);
    const now = this.baseline!.currentMonth;
    const markers = this.draft.changes
      .filter((c) => c.enabled && monthDiff(now, c.startMonth) <= H)
      .map((c) => ({ c, k: Math.max(1, monthDiff(now, c.startMonth)) }))
      .slice(0, 6);
    const scenPts = this.points(p.scenario, y);
    return html`
      <div class="card">
        <div class="card-head">
          <h2>${i18n.t('simulator.chart_title')}</h2>
          <div class="legend">
            <span><i class="swatch dashed"></i>${i18n.t('simulator.legend_current')}</span>
            <span><i class="swatch solid"></i>${i18n.t('simulator.legend_scenario')}</span>
          </div>
        </div>
        <div class="chart">
          <div class="y-axis">
            ${grid.map((v) => html`<span style="top:${y(v)}px">${this.shortMoney(v)}</span>`)}
          </div>
          <div class="plot">
            ${grid.map((v) => html`<div class="gridline ${v === 0 ? 'zero' : ''}" style="top:${y(v)}px"></div>`)}
            ${markers.map(({ c, k }, i) => html`
              <div class="marker" style="left:${(k / H) * 100}%; top:${i * 20}px"><span>${c.name}</span></div>
            `)}
            <svg viewBox="0 0 ${CHART_W} ${CHART_H}" preserveAspectRatio="none" role="img" aria-label="${i18n.t('simulator.chart_label')}">
              ${svg`
                <polygon class="area" points="${scenPts} ${CHART_W},${CHART_H} 0,${CHART_H}"></polygon>
                <polyline class="line base" points="${this.points(p.base, y)}"></polyline>
                <polyline class="line scen" points="${scenPts}"></polyline>
              `}
            </svg>
            ${ticks.map((i) => html`
              <span class="x-label ${i === 0 ? 'first' : i === H ? 'last' : ''}" style="left:${(i / H) * 100}%">
                ${i === 0 ? i18n.t('simulator.now') : this.month(p.months[i])}
              </span>
            `)}
          </div>
        </div>
      </div>
    `;
  }

  private renderBreakdown(p: Projection) {
    const H = this.draft.basis.horizon;
    return html`
      <div class="card grow">
        <h2>${i18n.t('simulator.typical_month', { month: this.month(p.months[H]) })}</h2>
        <div class="table" role="table">
          <div class="tr th" role="row">
            <span role="columnheader"></span>
            <span role="columnheader">${i18n.t('simulator.col_current')}</span>
            <span role="columnheader">${i18n.t('simulator.col_scenario')}</span>
            <span role="columnheader">${i18n.t('simulator.col_change')}</span>
          </div>
          ${p.endBreakdown.map((r) => {
            const diff = r.scenario - r.base;
            const rounded = Math.round(diff);
            const good = r.upIsGood ? diff > 0 : diff < 0;
            const label = r.key === 'income' ? i18n.t('simulator.row_income') : r.key === 'left_over' ? i18n.t('simulator.row_left_over') : this.categoryLabel(r.label);
            return html`
              <div class="tr ${r.key === 'left_over' ? 'total' : ''}" role="row">
                <span role="cell">${label}</span>
                <span role="cell" class="mono">${this.money(r.base)}</span>
                <span role="cell" class="mono">${this.money(r.scenario)}</span>
                <span role="cell" class="mono ${rounded === 0 ? 'same' : good ? 'pos' : 'neg'}">${rounded === 0 ? '—' : this.money(diff, true)}</span>
              </div>
            `;
          })}
        </div>
      </div>
    `;
  }

  private renderGoals(p: Projection) {
    return html`
      <div class="card grow narrow">
        <h2>${i18n.t('simulator.goals_title')}</h2>
        ${p.goals.length === 0 ? html`<p class="hint">${i18n.t('simulator.no_goals')}</p>` : nothing}
        ${p.goals.map(({ goal, dueMonth, outcome }) => {
          let tag: TemplateResult;
          let detail = '';
          switch (outcome.kind) {
            case 'done':
              tag = html`<span class="tag good">${i18n.t('simulator.goal_done')}</span>`;
              break;
            case 'paused':
              tag = html`<span class="tag bad">${i18n.t('simulator.goal_paused')}</span>`;
              detail = i18n.t('simulator.goal_paused_detail');
              break;
            case 'overdue':
              tag = html`<span class="tag warn">${i18n.t('simulator.goal_overdue')}</span>`;
              detail = i18n.t('simulator.goal_overdue_detail');
              break;
            default: {
              tag = outcome.kind === 'on_track'
                ? html`<span class="tag good">${i18n.t('simulator.goal_on_track')}</span>`
                : html`<span class="tag bad">${i18n.t('simulator.goal_late', { n: outcome.monthsLate })}</span>`;
              detail = outcome.baseMonth === outcome.month
                ? i18n.t('simulator.goal_reached_same', { month: this.month(outcome.month) })
                : i18n.t('simulator.goal_reached_instead', {
                    month: this.month(outcome.month),
                    base: outcome.baseMonth ? this.month(outcome.baseMonth) : '—',
                  });
            }
          }
          const pct = goal.targetAmount > 0 ? Math.min(100, (goal.savedAmount / goal.targetAmount) * 100) : 0;
          return html`
            <div class="goal">
              <div class="goal-head"><span class="strong">${goal.name}</span>${tag}</div>
              <div class="bar"><div style="width:${pct}%"></div></div>
              <span class="hint">
                ${i18n.t('simulator.goal_detail', { saved: this.money(goal.savedAmount), target: this.money(goal.targetAmount), due: this.month(dueMonth) })}
                ${detail}
              </span>
            </div>
          `;
        })}
      </div>
    `;
  }

  private renderEditor(editor: Editor, avg: AverageMonth) {
    const c = editor.change;
    const t = (k: string, p?: Record<string, string | number>) => i18n.t(`simulator.${k}`, p);
    const now = this.baseline!.currentMonth;
    const H = this.draft.basis.horizon;
    const starts = Array.from({ length: 36 }, (_, i) => addMonths(now, i + 1));
    if (!starts.includes(c.startMonth)) starts.unshift(c.startMonth);
    const categories = Object.entries(avg.categories).sort((a, b) => b[1] - a[1]);
    const d = this.describe(c, avg);
    const color = d.effect < 0 ? 'neg' : 'pos';
    const amountLabel = c.kind === 'oneoff'
      ? t('field_amount')
      : c.kind === 'income'
        ? t('field_income_change')
        : c.kind === 'category'
          ? t('field_percent')
          : t('field_amount_month');
    const num = (e: Event) => {
      const v = (e.target as HTMLInputElement).valueAsNumber;
      return Number.isFinite(v) ? v : 0;
    };
    const valid = Number.isFinite(c.amount) && (c.kind !== 'category' || !!c.category);

    return html`
      <div class="scrim" @click="${() => (this.editor = null)}"></div>
      <div class="dialog" role="dialog" aria-modal="true" aria-labelledby="change-title"
        @keydown="${(e: KeyboardEvent) => { if (e.key === 'Escape') this.editor = null; }}">
        <h2 id="change-title">${editor.isNew ? t('add_change') : t('edit_change')}</h2>
        <div class="kinds" role="radiogroup" aria-label="${t('kind_group')}">
          ${KINDS.map(({ kind, cadence }) => html`
            <button role="radio" aria-checked="${kind === c.kind}" class="kind ${kind === c.kind ? 'selected' : ''}"
              @click="${() => this.editChange({ kind })}">
              <span class="kind-text">
                <span class="strong">${t(`kind_${kind}`)}</span>
                <span class="hint">${t(`kind_${kind}_examples`)}</span>
              </span>
              <span class="tag">${t(`cadence_${cadence}`)}</span>
            </button>
          `)}
        </div>
        <div class="form">
          <label class="field">
            <span>${t('field_name')}</span>
            <input name="name" .value="${c.name}" maxlength="100"
              @input="${(e: Event) => this.editChange({ name: (e.target as HTMLInputElement).value })}" />
          </label>
          ${c.kind === 'category' ? html`
            <label class="field">
              <span>${t('field_category')}</span>
              <select @change="${(e: Event) => this.editChange({ category: (e.target as HTMLSelectElement).value || undefined })}">
                <option value="" ?selected="${!c.category}">—</option>
                ${categories.map(([name, v]) => html`<option value="${name}" ?selected="${name === c.category}">${t('category_avg', { name: this.categoryLabel(name), amount: this.money(v) })}</option>`)}
              </select>
            </label>
          ` : nothing}
          <label class="field">
            <span>${amountLabel}</span>
            <input type="number" inputmode="decimal" step="${c.kind === 'category' ? 1 : 10}"
              min="${c.kind === 'income' || c.kind === 'category' ? nothing : 0}"
              .value="${String(c.amount)}" @input="${(e: Event) => this.editChange({ amount: num(e) })}" />
          </label>
          <label class="field">
            <span>${c.kind === 'oneoff' ? t('field_when') : t('field_starts')}</span>
            <select @change="${(e: Event) => this.editChange({ startMonth: (e.target as HTMLSelectElement).value })}">
              ${starts.map((m) => html`<option value="${m}" ?selected="${m === c.startMonth}">${this.month(m)}</option>`)}
            </select>
          </label>
          ${c.kind === 'recurring' ? html`
            <label class="field">
              <span>${t('field_replaces')}</span>
              <select @change="${(e: Event) => this.editChange({ category: (e.target as HTMLSelectElement).value || undefined })}">
                <option value="" ?selected="${!c.category}">${t('replaces_nothing')}</option>
                ${categories.map(([name, v]) => html`<option value="${name}" ?selected="${name === c.category}">${t('category_avg', { name: this.categoryLabel(name), amount: this.money(v) })}</option>`)}
              </select>
            </label>
          ` : nothing}
          ${c.kind === 'temporary' ? html`
            <label class="field">
              <span>${t('field_months')}</span>
              <input type="number" min="1" max="600" step="1" .value="${String(c.months ?? 12)}"
                @input="${(e: Event) => this.editChange({ months: Math.min(600, Math.max(1, Math.round(num(e)) || 1)) })}" />
            </label>
          ` : nothing}
          ${c.kind === 'oneoff' ? html`
            <label class="field">
              <span>${t('field_direction')}</span>
              <select @change="${(e: Event) => this.editChange({ direction: (e.target as HTMLSelectElement).value as 'in' | 'out' })}">
                <option value="out" ?selected="${c.direction !== 'in'}">${t('direction_out')}</option>
                <option value="in" ?selected="${c.direction === 'in'}">${t('direction_in')}</option>
              </select>
            </label>
          ` : nothing}
        </div>
        <div class="effect">
          <span class="label">${t('effect')}</span>
          <span class="effect-main ${color}">${d.main}</span>
          <span class="hint">${d.sub}</span>
          <div class="strip" aria-hidden="true" style="grid-template-columns: repeat(${H}, minmax(0, 1fr))">
            ${Array.from({ length: H }, (_, i) => html`<i class="${isActive({ ...c, enabled: true }, i + 1, now) ? color : ''}"></i>`)}
          </div>
          <div class="strip-labels"><span>${this.month(addMonths(now, 1))}</span><span>${this.month(addMonths(now, H))}</span></div>
        </div>
        <div class="dialog-actions">
          ${editor.isNew ? nothing : html`<button class="btn text danger" @click="${this.removeEditing}">${t('remove_change')}</button>`}
          <span class="spacer"></span>
          <button class="btn text" @click="${() => (this.editor = null)}">${t('cancel')}</button>
          <button class="btn filled" ?disabled="${!valid}" @click="${this.commitEditor}">${editor.isNew ? t('add_to_scenario') : t('save_change')}</button>
        </div>
      </div>
    `;
  }

  private renderCompare(baseline: Baseline) {
    const basis = this.draft.basis;
    const runs = this.saved.map((s) => ({ s, p: project(baseline, basis, normalizeChanges(s.changes)) }));
    const all = [project(baseline, basis, []).base, ...runs.map((r) => r.p.scenario)].flat();
    const { y } = this.chartScale(all.length ? all : [0]);
    const H = basis.horizon;
    return html`
      <header class="head">
        <div class="titles">
          <button class="back" @click="${() => (this.mode = 'build')}">${icon('arrow_back', 18)}${i18n.t('simulator.back')}</button>
          <h1>${i18n.t('simulator.compare')}</h1>
          <p class="sub">${i18n.t('simulator.compare_subtitle')}</p>
        </div>
      </header>
      ${runs.length === 0 ? html`<p class="hint">${i18n.t('simulator.no_saved')}</p>` : nothing}
      <div class="cards">
        ${runs.map(({ s, p }) => {
          const v = verdict(p);
          const onTrack = p.goals.filter((g) => g.outcome.kind === 'on_track' || g.outcome.kind === 'done').length;
          const endNet = p.endNet;
          const cushion = cushionMonths(p);
          return html`
            <article class="card compare ${s.id === this.draft.id ? 'current' : ''}">
              <div class="card-head">
                <h2>${s.name}</h2>
                <span class="tag ${v === 'comfortable' ? 'good' : v === 'tight' ? 'warn' : 'bad'}">${i18n.t(`simulator.verdict_${v}`)}</span>
              </div>
              <svg class="spark" viewBox="0 0 300 ${CHART_H}" preserveAspectRatio="none" role="img"
                aria-label="${s.name}: ${this.money(p.scenario[0])} → ${this.money(p.scenario[H])}">
                ${svg`
                  <polyline class="line base" points="${this.points(p.base, y, 300)}"></polyline>
                  <polyline class="line scen" points="${this.points(p.scenario, y, 300)}"></polyline>
                `}
              </svg>
              <dl>
                <div><dt>${i18n.t('simulator.kpi_left_over')}</dt><dd class="mono ${endNet < 0 ? 'neg' : ''}">${this.money(endNet, true)}</dd></div>
                <div><dt>${i18n.t('simulator.kpi_balance_in', { month: this.month(p.months[H]) })}</dt><dd class="mono">${this.money(p.scenario[H])}</dd></div>
                <div><dt>${i18n.t('simulator.kpi_lowest', { month: this.month(p.months[p.lowest.offset]) })}</dt><dd class="mono">${this.money(p.lowest.value)}</dd></div>
                <div><dt>${i18n.t('simulator.kpi_cushion')}</dt><dd class="mono ${cushion < 3 ? 'neg' : ''}">${i18n.t('simulator.cushion_value', { n: cushion.toLocaleString(this.locale, { maximumFractionDigits: 1 }) })}</dd></div>
                <div><dt>${i18n.t('simulator.goals_title')}</dt><dd>${p.goals.length ? i18n.t('simulator.goals_summary', { n: onTrack, total: p.goals.length }) : i18n.t('simulator.goals_none')}</dd></div>
              </dl>
              <button class="btn outlined" @click="${() => this.openScenario(s.id)}">${i18n.t('simulator.open')}</button>
            </article>
          `;
        })}
      </div>
      <p class="footnote">${i18n.t('simulator.disclaimer')}</p>
    `;
  }

  static styles = css`
    :host {
      display: block;
      color: var(--md-sys-color-on-surface);
      font-family: 'Roboto', system-ui, sans-serif;
    }
    .page { padding: 24px; display: flex; flex-direction: column; gap: 24px; max-width: 1400px; margin: 0 auto; }
    .sr-only { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }
    .m-icon {
      font-family: 'Material Symbols Outlined';
      font-weight: normal; font-style: normal; line-height: 1;
      display: inline-block; white-space: nowrap; direction: ltr;
      -webkit-font-smoothing: antialiased;
    }
    h1 { margin: 0; font-size: 28px; line-height: 36px; font-weight: 400; }
    h2 { margin: 0; font-size: 16px; font-weight: 500; }
    .mono { font-family: 'Roboto Mono', monospace; }
    .strong { font-weight: 500; }
    .big { font-size: 22px; font-weight: 500; letter-spacing: -0.5px; }
    .small { font-size: 11px; }
    .label { font-size: 13px; color: var(--md-sys-color-on-surface-variant); }
    .hint { margin: 0; font-size: 13px; line-height: 18px; color: var(--md-sys-color-on-surface-variant); }
    .footnote { margin: 0; font-size: 12px; color: var(--md-sys-color-on-surface-variant); }
    .pos { color: var(--md-sys-color-primary); }
    .neg { color: var(--md-sys-color-error); }
    .same { color: var(--md-sys-color-on-surface-variant); }

    /* Header */
    .head { display: flex; flex-wrap: wrap; justify-content: space-between; align-items: flex-end; gap: 16px; }
    .titles { display: flex; flex-direction: column; gap: 4px; min-width: 0; flex: 1 1 320px; }
    .eyebrow { margin: 0; font-size: 12px; font-weight: 500; letter-spacing: 0.5px; text-transform: uppercase; color: var(--md-sys-color-on-surface-variant); }
    .sub { margin: 0; font-size: 14px; color: var(--md-sys-color-on-surface-variant); }
    .name-input {
      width: 100%; box-sizing: border-box; font: 400 28px/36px 'Roboto', sans-serif;
      color: var(--md-sys-color-on-surface); background: transparent;
      border: 1px solid transparent; border-radius: 8px; padding: 0 6px; margin-left: -7px;
    }
    .name-input:hover { border-color: var(--md-sys-color-outline-variant); }
    .name-input:focus { outline: none; border-color: var(--md-sys-color-primary); }
    .actions { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; }
    .back { display: inline-flex; align-items: center; gap: 6px; align-self: flex-start; border: 0; background: none; color: var(--md-sys-color-primary); font: 500 14px 'Roboto', sans-serif; cursor: pointer; padding: 8px 0; }

    select, input {
      font: 15px 'Roboto', sans-serif; color: var(--md-sys-color-on-surface);
      background: var(--md-sys-color-surface-container-lowest);
      border: 1px solid var(--md-sys-color-outline); border-radius: 8px;
      height: 44px; padding: 0 12px; box-sizing: border-box;
    }
    select:focus-visible, input:focus-visible, button:focus-visible { outline: 2px solid var(--md-sys-color-primary); outline-offset: 2px; }
    .picker select { min-width: 180px; max-width: 260px; }

    .btn {
      display: inline-flex; align-items: center; justify-content: center; gap: 6px;
      min-height: 44px; padding: 0 20px; border-radius: 22px; cursor: pointer;
      font: 500 14px 'Roboto', sans-serif; box-sizing: border-box;
    }
    .btn.filled { border: 0; background: var(--md-sys-color-primary); color: var(--md-sys-color-on-primary); }
    .btn.outlined { border: 1px solid var(--md-sys-color-outline); background: transparent; color: var(--md-sys-color-primary); }
    .btn.text { border: 0; background: transparent; color: var(--md-sys-color-primary); padding: 0 12px; }
    .btn.danger { color: var(--md-sys-color-error); }
    .btn[disabled] { opacity: 0.45; cursor: default; }
    .icon-btn { flex: 0 0 auto; width: 44px; height: 44px; border: 0; border-radius: 22px; background: transparent; color: var(--md-sys-color-on-surface-variant); cursor: pointer; display: flex; align-items: center; justify-content: center; }
    .icon-btn:hover { background: var(--md-sys-color-surface-container-high); }

    /* Layout */
    .cols { display: flex; flex-wrap: wrap; gap: 24px; align-items: flex-start; }
    .builder { flex: 1 1 320px; max-width: 440px; display: flex; flex-direction: column; gap: 20px; min-width: 0; }
    .results { flex: 999 1 560px; min-width: 0; display: flex; flex-direction: column; gap: 16px; }
    .row-wrap { display: flex; flex-wrap: wrap; gap: 16px; align-items: flex-start; }
    .stack { display: flex; flex-direction: column; gap: 10px; }
    .card { border: 1px solid var(--md-sys-color-outline-variant); border-radius: 16px; padding: 20px; display: flex; flex-direction: column; gap: 12px; background: var(--md-sys-color-surface-container-lowest); min-width: 0; box-sizing: border-box; }
    .card.tonal { background: var(--md-sys-color-surface-container-low); border-color: transparent; }
    .card.grow { flex: 1 1 340px; }
    .card.narrow { flex-basis: 280px; }
    .card-head { display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 12px; }
    .divider { height: 1px; background: var(--md-sys-color-outline-variant); }

    /* Starting point */
    .figures { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; }
    .figures > div { display: flex; flex-direction: column; gap: 2px; }
    .inline-field { display: flex; justify-content: space-between; align-items: center; gap: 12px; font-size: 14px; font-weight: 500; }
    .chips { display: grid; grid-template-columns: repeat(auto-fill, minmax(100px, 1fr)); gap: 6px; }
    .chip { display: flex; flex-direction: column; align-items: flex-start; gap: 2px; min-height: 52px; padding: 6px 8px; border-radius: 8px; cursor: pointer; text-align: left; font-family: 'Roboto', sans-serif; color: var(--md-sys-color-on-surface); }
    .chip.on { background: var(--md-sys-color-surface-container-lowest); border: 1px solid var(--md-sys-color-primary); }
    .chip.off { background: transparent; border: 1px dashed var(--md-sys-color-outline); color: var(--md-sys-color-on-surface-variant); }
    .chip.off .chip-month { text-decoration: line-through; }
    .chip[disabled] { cursor: default; opacity: 0.7; }
    .chip[disabled] .chip-month { text-decoration: none; }
    .chip-month { font-size: 12px; font-weight: 500; }
    .tag { font-size: 11px; font-weight: 500; border-radius: 8px; padding: 2px 8px; white-space: nowrap; background: var(--md-sys-color-secondary-container); color: var(--md-sys-color-on-secondary-container); }
    .tag.warn { background: var(--pf-status-warn-bg); color: var(--pf-status-warn-text); }
    .tag.good { background: var(--md-sys-color-primary-container); color: var(--md-sys-color-on-primary-container); }
    .tag.bad { background: var(--md-sys-color-error-container); color: var(--md-sys-color-on-error-container); }

    /* Changes */
    .change { display: flex; gap: 4px; align-items: flex-start; padding: 12px 4px 12px 14px; border-radius: 12px; border: 1px solid var(--md-sys-color-outline); background: var(--md-sys-color-surface-container-lowest); }
    .change.disabled { border-color: transparent; background: var(--md-sys-color-surface-container-low); opacity: 0.75; }
    .change-main { display: flex; gap: 12px; align-items: flex-start; flex: 1 1 auto; min-width: 0; cursor: pointer; }
    .change-main input { width: 20px; height: 20px; margin: 2px 0 0; padding: 0; accent-color: var(--md-sys-color-primary); flex: 0 0 auto; }
    .change-text { display: flex; flex-direction: column; gap: 3px; min-width: 0; }
    .change-name { font-size: 15px; font-weight: 500; }
    .change-effect { font-size: 13px; font-weight: 500; }
    .add { display: flex; align-items: center; justify-content: center; gap: 8px; min-height: 48px; border: 1px dashed var(--md-sys-color-outline); border-radius: 12px; background: transparent; color: var(--md-sys-color-primary); font: 500 14px 'Roboto', sans-serif; cursor: pointer; }
    .segmented { display: flex; border: 1px solid var(--md-sys-color-outline); border-radius: 22px; overflow: hidden; }
    .segmented button { flex: 1 1 0; min-height: 44px; border: 0; background: transparent; color: var(--md-sys-color-on-surface); font: 500 14px 'Roboto', sans-serif; cursor: pointer; }
    .segmented button + button { border-left: 1px solid var(--md-sys-color-outline); }
    .segmented button.selected { background: var(--md-sys-color-secondary-container); color: var(--md-sys-color-on-secondary-container); }

    /* Results */
    .banner { display: flex; gap: 12px; align-items: flex-start; padding: 16px 20px; border-radius: 16px; margin: 0; background: var(--md-sys-color-surface-container-low); }
    .banner > div { display: flex; flex-direction: column; gap: 4px; font-size: 14px; line-height: 20px; }
    .banner strong { font-size: 16px; font-weight: 500; }
    .banner.bad { background: var(--md-sys-color-error-container); color: var(--md-sys-color-on-error-container); }
    .banner.good { background: var(--md-sys-color-primary-container); color: var(--md-sys-color-on-primary-container); }
    .kpis { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 12px; }
    .kpi { background: var(--md-sys-color-surface-container-low); border-radius: 16px; padding: 16px; display: flex; flex-direction: column; gap: 6px; min-width: 0; }
    .delta { font-size: 12px; font-weight: 500; }
    .delta.pos { color: var(--md-sys-color-primary); }
    .delta.neg { color: var(--md-sys-color-error); }

    .legend { display: flex; flex-wrap: wrap; gap: 16px; font-size: 13px; color: var(--md-sys-color-on-surface-variant); }
    .legend span { display: inline-flex; align-items: center; gap: 6px; }
    .swatch { display: inline-block; width: 20px; }
    .swatch.dashed { border-top: 2px dashed var(--md-sys-color-outline); }
    .swatch.solid { height: 3px; border-radius: 2px; background: var(--md-sys-color-primary); }
    .chart { display: flex; gap: 8px; }
    .y-axis { position: relative; width: 56px; height: ${CHART_H}px; flex: 0 0 auto; }
    .y-axis span { position: absolute; right: 0; transform: translateY(-50%); font: 11px 'Roboto Mono', monospace; color: var(--md-sys-color-on-surface-variant); }
    .plot { position: relative; flex: 1 1 auto; min-width: 0; height: ${CHART_H + 24}px; }
    .gridline { position: absolute; left: 0; right: 0; border-top: 1px solid var(--md-sys-color-surface-container-highest); }
    .gridline.zero { border-top-color: var(--md-sys-color-outline); }
    .plot svg { position: absolute; left: 0; top: 0; width: 100%; height: ${CHART_H}px; overflow: visible; }
    .line { fill: none; vector-effect: non-scaling-stroke; stroke-linejoin: round; }
    .line.base { stroke: var(--md-sys-color-outline); stroke-width: 2; stroke-dasharray: 6 5; }
    .line.scen { stroke: var(--md-sys-color-primary); stroke-width: 3; }
    .area { fill: var(--md-sys-color-primary); fill-opacity: 0.08; }
    .marker { position: absolute; bottom: 24px; border-left: 1px dashed var(--md-sys-color-primary); }
    .marker span { position: absolute; top: -2px; left: 6px; white-space: nowrap; font-size: 11px; font-weight: 500; color: var(--md-sys-color-on-secondary-container); background: var(--md-sys-color-secondary-container); border-radius: 6px; padding: 1px 6px; max-width: 160px; overflow: hidden; text-overflow: ellipsis; }
    .x-label { position: absolute; top: ${CHART_H + 8}px; transform: translateX(-50%); font-size: 11px; color: var(--md-sys-color-on-surface-variant); white-space: nowrap; }
    .x-label.first { transform: none; }
    .x-label.last { transform: translateX(-100%); }

    .table { display: flex; flex-direction: column; overflow-x: auto; }
    .tr { display: grid; grid-template-columns: minmax(120px, 1fr) 92px 92px 92px; gap: 8px; align-items: center; min-height: 36px; font-size: 14px; }
    .tr > span:not(:first-child) { text-align: right; }
    .tr > span:first-child { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .tr.th { font-size: 12px; min-height: 28px; color: var(--md-sys-color-on-surface-variant); border-bottom: 1px solid var(--md-sys-color-outline-variant); }
    .tr.total { font-weight: 500; border-top: 1px solid var(--md-sys-color-outline-variant); margin-top: 4px; }

    .goal { display: flex; flex-direction: column; gap: 8px; }
    .goal-head { display: flex; justify-content: space-between; align-items: baseline; gap: 8px; }
    .bar { height: 8px; border-radius: 4px; background: var(--md-sys-color-surface-container-highest); overflow: hidden; }
    .bar > div { height: 100%; background: var(--md-sys-color-primary); border-radius: 4px; }

    /* Change dialog */
    .scrim { position: fixed; inset: 0; background: rgba(0, 0, 0, 0.32); z-index: 20; }
    .dialog {
      position: fixed; z-index: 21; left: 50%; top: 50%; transform: translate(-50%, -50%);
      width: min(640px, calc(100vw - 32px)); max-height: calc(100vh - 32px); overflow-y: auto; box-sizing: border-box;
      background: var(--md-sys-color-surface-container-high); border-radius: 28px; padding: 24px;
      display: flex; flex-direction: column; gap: 16px;
    }
    .dialog h2 { font-size: 22px; font-weight: 400; }
    .kinds { display: flex; flex-direction: column; gap: 6px; }
    .kind { display: flex; align-items: center; justify-content: space-between; gap: 12px; min-height: 52px; padding: 8px 14px; border-radius: 12px; cursor: pointer; text-align: left; font-family: 'Roboto', sans-serif; color: var(--md-sys-color-on-surface); background: var(--md-sys-color-surface-container-lowest); border: 1px solid var(--md-sys-color-outline-variant); }
    .kind.selected { border: 2px solid var(--md-sys-color-primary); background: var(--md-sys-color-secondary-container); }
    .kind-text { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
    .form { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 12px; }
    .field { display: flex; flex-direction: column; gap: 4px; font-size: 12px; color: var(--md-sys-color-on-surface-variant); }
    .field input, .field select { width: 100%; }
    .effect { display: flex; flex-direction: column; gap: 8px; padding: 16px; border-radius: 16px; background: var(--md-sys-color-surface-container-lowest); }
    .effect-main { font-size: 18px; font-weight: 500; }
    .strip { display: grid; gap: 2px; margin-top: 4px; }
    .strip i { height: 14px; border-radius: 3px; background: var(--md-sys-color-surface-container-highest); }
    .strip i.neg { background: var(--md-sys-color-error); }
    .strip i.pos { background: var(--md-sys-color-primary); }
    .strip-labels { display: flex; justify-content: space-between; font-size: 11px; color: var(--md-sys-color-on-surface-variant); }
    .dialog-actions { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
    .spacer { flex: 1 1 auto; }

    /* Compare */
    .cards { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 16px; }
    .card.compare.current { border: 2px solid var(--md-sys-color-primary); }
    .spark { width: 100%; height: 90px; }
    dl { margin: 0; display: flex; flex-direction: column; }
    dl > div { display: flex; justify-content: space-between; align-items: baseline; gap: 8px; min-height: 36px; border-top: 1px solid var(--md-sys-color-outline-variant); }
    dt { font-size: 13px; color: var(--md-sys-color-on-surface-variant); }
    dd { margin: 0; font-size: 14px; font-weight: 500; text-align: right; }

    .skeleton { height: 480px; border-radius: 16px; background: var(--md-sys-color-surface-container-low); }

    @media (max-width: 600px) {
      .page { padding: 16px 16px 96px; }
      .builder { max-width: none; }
      .figures { grid-template-columns: repeat(2, minmax(0, 1fr)); }
      .name-input, h1 { font-size: 22px; line-height: 30px; }
      .tr { grid-template-columns: minmax(96px, 1fr) 76px 76px 76px; font-size: 13px; }
      .y-axis { width: 44px; }
    }
  `;
}
