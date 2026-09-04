import { css, html, nothing, type TemplateResult } from 'lit';
import { icon } from './mobile-ui';

/**
 * Shared building blocks for the desktop layouts (> 600px).
 *
 * The mobile layer owns everything at or below `MOBILE_BREAKPOINT` and is
 * untouched by this module: every class here is prefixed `d-` and only appears
 * on the desktop render path.
 *
 * The handoff prototypes were written with literal hex values because they had
 * no access to the app stylesheet. Everything below resolves those back through
 * the `--md-sys-color-*` / `--pf-*` custom properties defined in
 * `priperfin-app.ts`, so the desktop screens follow the theme (including dark
 * mode) the same way the mobile ones do.
 */

/**
 * Category / ranked-bar colours. Slots 1-6 are the ones the designs name;
 * the rest keep the chart legible when a profile has many parent groups.
 */
export const CHART_PALETTE = [
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

export function paletteColor(index: number): string {
  return CHART_PALETTE[Math.abs(index) % CHART_PALETTE.length];
}

/**
 * Keeps `host.viewportWidth` in sync with the window for as long as the element
 * is connected, so a view can *remove* its side column from the DOM rather than
 * hiding it (a four-child grid with two hidden children still reserves their
 * tracks). Returns the teardown to call from `disconnectedCallback`.
 */
export function watchViewportWidth(host: { viewportWidth: number }): () => void {
  const apply = () => { host.viewportWidth = window.innerWidth; };
  apply();
  window.addEventListener('resize', apply);
  return () => window.removeEventListener('resize', apply);
}

/** Nav rail (80px) plus the main pane's horizontal padding (2 x 24px). */
export const DESKTOP_CHROME = 128;

/** Width left for a view's content grid at the current viewport. */
export function contentWidth(viewportWidth: number): number {
  return Math.max(0, viewportWidth - DESKTOP_CHROME);
}

export type PillKind = 'neutral' | 'positive' | 'warning' | 'attention' | 'delta' | 'tertiary';

export interface PillOptions {
  kind?: PillKind;
  glyph?: string;
  label: unknown;
  title?: string;
  onClick?: () => void;
}

/** 32px status pill used in the summary strips. */
export function statusPill(opts: PillOptions): TemplateResult {
  const kind = opts.kind ?? 'neutral';
  const body = html`
    ${opts.glyph ? icon(opts.glyph, 16) : nothing}
    <span>${opts.label}</span>
  `;
  return opts.onClick
    ? html`<button class="d-pill ${kind}" title="${opts.title ?? ''}" @click="${opts.onClick}">${body}</button>`
    : html`<span class="d-pill ${kind}" title="${opts.title ?? ''}">${body}</span>`;
}

export interface StepperOptions {
  label: string;
  onPrev: () => void;
  onNext: () => void;
  /** Omit for a plain label with no period-picker affordance. */
  onLabel?: () => void;
  open?: boolean;
  /** Disables the forward chevron (no future periods). */
  nextDisabled?: boolean;
  prevLabel?: string;
  nextLabel?: string;
}

/** 40px period stepper in the page header row. */
export function periodStepper(opts: StepperOptions): TemplateResult {
  return html`
    <div class="d-stepper">
      <button class="d-stepper-btn" @click="${opts.onPrev}" aria-label="${opts.prevLabel ?? 'Previous'}">
        ${icon('chevron_left', 20)}
      </button>
      ${opts.onLabel
        ? html`
          <button class="d-stepper-label" @click="${opts.onLabel}">
            <span>${opts.label}</span>
            ${icon(opts.open ? 'expand_less' : 'expand_more', 16)}
          </button>
        `
        : html`<div class="d-stepper-label static"><span>${opts.label}</span></div>`}
      <button
        class="d-stepper-btn"
        ?disabled="${opts.nextDisabled}"
        @click="${opts.onNext}"
        aria-label="${opts.nextLabel ?? 'Next'}">
        ${icon('chevron_right', 20)}
      </button>
    </div>
  `;
}

export interface RankedBarOptions {
  /** Emoji or other leading glyph; omitted rows just start at the name. */
  emoji?: string;
  name: unknown;
  amount: unknown;
  /** Bar width, 0-100. Must be the same figure the share label prints. */
  percent: number;
  /** Trailing share label. Omit to drop the 30px column entirely. */
  share?: string;
  color?: string;
  /** 6px by default; the breakdown rows use 8px. */
  thick?: boolean;
  onClick?: () => void;
  title?: string;
}

/**
 * The ranked category bar shared by four screens. `percent` and `share` must be
 * derived from the same value — a bar that disagrees with its own label was a
 * real bug in review.
 */
export function rankedBar(opts: RankedBarOptions): TemplateResult {
  const width = Math.max(0, Math.min(100, opts.percent));
  return html`
    <div
      class="d-ranked ${opts.onClick ? 'clickable' : ''}"
      title="${opts.title ?? ''}"
      @click="${opts.onClick ?? nothing}">
      <div class="d-ranked-head">
        ${opts.emoji ? html`<span class="d-emoji">${opts.emoji}</span>` : nothing}
        <span class="d-ranked-name">${opts.name}</span>
        <span class="d-ranked-amount">${opts.amount}</span>
      </div>
      <div class="d-ranked-foot">
        <div class="d-bar ${opts.thick ? 'thick' : ''}">
          <div
            class="d-bar-fill"
            style="width: ${width}%${opts.color ? `; background: ${opts.color}` : ''}"></div>
        </div>
        ${opts.share !== undefined ? html`<span class="d-ranked-share">${opts.share}</span>` : nothing}
      </div>
    </div>
  `;
}

export interface SegmentOption<T> {
  value: T;
  label: unknown;
  /** Rendered after the label in mono, for the counts on the Categories tabs. */
  count?: unknown;
}

/** Segmented control: 40px track by default, 36px in a settings row. */
export function segmented<T>(
  options: SegmentOption<T>[],
  selected: T,
  onSelect: (value: T) => void,
  small = false,
): TemplateResult {
  return html`
    <div class="d-seg ${small ? 'small' : ''}" role="tablist">
      ${options.map(opt => html`
        <button
          class="d-seg-btn ${opt.value === selected ? 'selected' : ''}"
          role="tab"
          aria-selected="${opt.value === selected}"
          @click="${() => onSelect(opt.value)}">
          <span>${opt.label}</span>
          ${opt.count !== undefined ? html`<span class="d-seg-count">${opt.count}</span>` : nothing}
        </button>
      `)}
    </div>
  `;
}

/** A labelled cell in an inline-expand field grid. */
export function field(label: unknown, control: unknown, wide = false): TemplateResult {
  return html`
    <label class="d-field ${wide ? 'wide' : ''}">
      <span class="d-field-label">${label}</span>
      ${control}
    </label>
  `;
}

/** Footnote line closing an inline expand. */
export function footnote(glyph: string, text: unknown): TemplateResult {
  return html`
    <div class="d-footnote">
      ${icon(glyph, 16)}
      <span>${text}</span>
    </div>
  `;
}

/**
 * Shared desktop CSS. Compose it LAST in a view's styles array —
 * `static styles = [css(...view rules...), mobileUI, desktopUI]` — so the reset
 * below lands after the view's element-level `button` / `input` / `select`
 * rules, which otherwise leak their desktop-table sizing into every control
 * here (the same trap `mobileUI` documents).
 */
export const desktopUI = css`
  /*
   * Every view declares element-level rules on button/input/select for the old
   * desktop layout (36px tall, 4px radius, a filled background). An element
   * selector loses to a class selector only for the properties the class
   * actually declares, so anything a control below leaves unset silently
   * inherits those. Neutralise the lot up front; each control re-declares what
   * it needs. :where() keeps this at element specificity so the .d-* classes
   * still win.
   */
  :where(.d-screen) button {
    height: auto;
    min-height: 0;
    padding: 0;
    border: none;
    border-radius: 0;
    background: none;
    box-shadow: none;
    color: inherit;
    font: inherit;
    text-align: left;
    text-transform: none;
    cursor: pointer;
  }
  :where(.d-screen) input,
  :where(.d-screen) select {
    height: auto;
    padding: 0;
    border: none;
    border-radius: 0;
    background: none;
    color: inherit;
    font: inherit;
    box-sizing: border-box;
  }
  :where(.d-screen) label {
    display: block;
    margin: 0;
    font: inherit;
    color: inherit;
  }
  :where(.d-screen) h1 { margin: 0; }

  /* ---- screen scaffold ---- */

  /*
   * The shell stretches the pane to the viewport height; the view has to pass
   * that height down or the screen's height: 100% resolves against auto.
   * Scoped above the mobile breakpoint so the phone layout keeps its natural
   * height.
   */
  @media (min-width: 601px) {
    :host { height: 100%; }
  }

  /*
   * The app shell hands the redesigned views an unpadded, non-scrolling main
   * pane (see priperfin-app.ts), so the screen itself is the "main pane" the
   * handoff describes: it owns the 20px/24px padding and every panel inside it
   * owns its own scroll.
   */
  .d-screen {
    display: flex;
    flex-direction: column;
    height: 100%;
    min-height: 0;
    padding: 20px 24px 0;
    box-sizing: border-box;
    overflow: hidden;
    background: var(--md-sys-color-surface);
    color: var(--md-sys-color-on-surface);
  }

  /* Custom scrollbars: the 3px border in the surrounding surface reads as inset. */
  .d-screen ::-webkit-scrollbar { width: 10px; height: 10px; }
  .d-screen ::-webkit-scrollbar-track { background: transparent; }
  .d-screen ::-webkit-scrollbar-thumb {
    background: var(--md-sys-color-outline-variant);
    border-radius: 5px;
    border: 3px solid var(--md-sys-color-surface-container-lowest);
  }
  .d-screen > .d-content::-webkit-scrollbar-thumb {
    border-color: var(--md-sys-color-surface);
  }

  .d-header {
    display: flex;
    align-items: center;
    gap: 12px;
    flex-wrap: wrap;
    row-gap: 10px;
    flex-shrink: 0;
    padding-bottom: 16px;
  }
  .d-header h1 {
    font: 400 28px/36px 'Roboto', sans-serif;
    color: var(--md-sys-color-on-surface);
    margin: 0;
    flex-shrink: 0;
  }
  .d-spacer { flex: 1; }
  .d-micro {
    font: 500 11px/14px 'Roboto', sans-serif;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--md-sys-color-on-surface-variant);
  }
  .d-emoji { font-size: 14px; flex-shrink: 0; line-height: 1; }

  /* ---- buttons ---- */

  .d-btn {
    height: 40px;
    padding: 0 20px 0 16px;
    border-radius: 20px;
    background: var(--md-sys-color-primary);
    color: var(--md-sys-color-on-primary);
    font: 500 14px/20px 'Roboto', sans-serif;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    box-sizing: border-box;
    white-space: nowrap;
    flex-shrink: 0;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.12);
    cursor: pointer;
  }
  .d-btn:hover { box-shadow: 0 1px 3px 1px rgba(0, 0, 0, 0.15); }
  .d-btn:disabled { opacity: 0.4; cursor: default; box-shadow: none; }
  /* No leading icon, so the asymmetric padding would look wrong. */
  .d-btn.plain { padding: 0 20px; }
  .d-btn.small { height: 36px; border-radius: 18px; padding: 0 20px; font: 500 13px/16px 'Roboto', sans-serif; }
  .d-btn.tiny { height: 32px; border-radius: 16px; padding: 0 16px; font: 500 13px/16px 'Roboto', sans-serif; }
  .d-btn.danger { background: var(--md-sys-color-error); color: var(--md-sys-color-on-error); }

  .d-btn-outlined {
    height: 36px;
    padding: 0 14px;
    border-radius: 18px;
    border: 1px solid var(--md-sys-color-outline);
    background: transparent;
    color: var(--md-sys-color-on-surface);
    font: 500 13px/16px 'Roboto', sans-serif;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    box-sizing: border-box;
    white-space: nowrap;
    flex-shrink: 0;
    cursor: pointer;
  }
  .d-btn-outlined:hover { background: var(--md-sys-color-surface-container); }
  .d-btn-outlined.tall { height: 40px; border-radius: 20px; font: 500 14px/20px 'Roboto', sans-serif; }
  .d-btn-outlined:disabled {
    color: var(--md-sys-color-outline);
    border-color: var(--md-sys-color-outline-variant);
    cursor: default;
  }
  .d-btn-outlined:disabled:hover { background: transparent; }

  .d-btn-tonal {
    height: 36px;
    padding: 0 16px;
    border-radius: 18px;
    background: var(--md-sys-color-secondary-container);
    color: var(--md-sys-color-on-secondary-container);
    font: 500 13px/16px 'Roboto', sans-serif;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    box-sizing: border-box;
    white-space: nowrap;
    flex-shrink: 0;
    cursor: pointer;
  }
  .d-btn-tonal.tiny { height: 32px; border-radius: 16px; padding: 0 12px; gap: 6px; }
  .d-btn-tonal:disabled { opacity: 0.4; cursor: default; }

  .d-btn-text {
    height: 36px;
    padding: 0 16px;
    border-radius: 18px;
    background: transparent;
    color: var(--md-sys-color-primary);
    font: 500 13px/16px 'Roboto', sans-serif;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    box-sizing: border-box;
    white-space: nowrap;
    cursor: pointer;
  }
  .d-btn-text:hover { background: var(--md-sys-color-surface-container-high); }
  .d-btn-text.destructive { color: var(--md-sys-color-error); }
  .d-btn-text.destructive:hover { background: var(--md-sys-color-error-container); }

  .d-icon-btn {
    width: 40px;
    height: 40px;
    min-width: 40px;
    border-radius: 20px;
    background: transparent;
    color: var(--md-sys-color-on-surface-variant);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    cursor: pointer;
  }
  .d-icon-btn:hover {
    background: var(--md-sys-color-surface-container-highest);
    color: var(--md-sys-color-on-surface);
  }
  .d-icon-btn.small { width: 32px; height: 32px; min-width: 32px; border-radius: 16px; }
  .d-icon-btn.inline { width: 28px; height: 28px; min-width: 28px; border-radius: 14px; }
  .d-icon-btn.destructive:hover { background: var(--md-sys-color-error-container); color: var(--md-sys-color-error); }
  .d-icon-btn:disabled { color: var(--md-sys-color-outline-variant); cursor: default; }
  .d-icon-btn:disabled:hover { background: transparent; color: var(--md-sys-color-outline-variant); }

  .d-link {
    background: none;
    padding: 0;
    color: var(--md-sys-color-primary);
    font: 500 13px/16px 'Roboto', sans-serif;
    cursor: pointer;
    white-space: nowrap;
  }
  .d-link.small { font: 500 12px/16px 'Roboto', sans-serif; }

  /* ---- header controls ---- */

  .d-search {
    display: flex;
    align-items: center;
    gap: 8px;
    height: 40px;
    flex: 0 1 260px;
    min-width: 120px;
    padding: 0 14px;
    border-radius: 20px;
    background: var(--md-sys-color-surface-container);
    box-sizing: border-box;
  }
  .d-search .m-icon { color: var(--md-sys-color-on-surface-variant); }
  .d-search input {
    flex: 1;
    min-width: 0;
    border: none;
    background: transparent;
    outline: none;
    font: 400 14px/20px 'Roboto', sans-serif;
    color: var(--md-sys-color-on-surface);
  }
  .d-search input::placeholder { color: var(--md-sys-color-outline); }

  .d-account-chip {
    display: flex;
    align-items: center;
    gap: 8px;
    height: 40px;
    padding: 0 6px 0 12px;
    border-radius: 12px;
    background: var(--md-sys-color-surface-container);
    color: var(--md-sys-color-on-surface);
    font: 500 14px/20px 'Roboto', sans-serif;
    box-sizing: border-box;
    white-space: nowrap;
    flex-shrink: 0;
    cursor: pointer;
    max-width: 240px;
  }
  .d-account-chip:hover { background: var(--md-sys-color-surface-container-highest); }
  .d-account-chip > span:nth-child(2) { overflow: hidden; text-overflow: ellipsis; }
  .d-account-chip .m-icon { color: var(--md-sys-color-on-surface-variant); }

  .d-stepper {
    display: flex;
    align-items: center;
    height: 40px;
    border-radius: 12px;
    background: var(--md-sys-color-surface-container);
    overflow: hidden;
    flex-shrink: 0;
  }
  .d-stepper-btn {
    width: 40px;
    height: 40px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    color: var(--md-sys-color-on-surface);
    cursor: pointer;
    flex-shrink: 0;
  }
  .d-stepper-btn:hover { background: var(--md-sys-color-surface-container-highest); }
  .d-stepper-btn:disabled { color: var(--md-sys-color-outline-variant); cursor: default; }
  .d-stepper-btn:disabled:hover { background: transparent; }
  .d-stepper-label {
    min-width: 132px;
    height: 40px;
    padding: 0 8px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 4px;
    font: 500 14px/20px 'Roboto', sans-serif;
    color: var(--md-sys-color-on-surface);
    text-align: center;
    cursor: pointer;
  }
  .d-stepper-label:hover { background: var(--md-sys-color-surface-container-highest); }
  .d-stepper-label.static { cursor: default; }
  .d-stepper-label:hover.static { background: transparent; }
  .d-stepper-label .m-icon { color: var(--md-sys-color-on-surface-variant); }

  .d-seg {
    display: inline-flex;
    align-items: center;
    height: 40px;
    padding: 4px;
    border-radius: 12px;
    background: var(--md-sys-color-surface-container);
    box-sizing: border-box;
    flex-shrink: 0;
  }
  .d-seg-btn {
    height: 32px;
    padding: 0 14px;
    border-radius: 8px;
    background: transparent;
    color: var(--md-sys-color-on-surface-variant);
    font: 500 13px/16px 'Roboto', sans-serif;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    white-space: nowrap;
    cursor: pointer;
  }
  .d-seg-btn.selected {
    background: var(--md-sys-color-surface-container-lowest);
    color: var(--md-sys-color-on-surface);
  }
  .d-seg-count {
    font: 400 12px/16px 'Roboto Mono', ui-monospace, monospace;
    color: var(--md-sys-color-on-surface-variant);
  }
  .d-seg.small { height: 36px; padding: 3px; border-radius: 10px; }
  .d-seg.small .d-seg-btn { height: 30px; padding: 0 14px; }

  /* ---- filter chips ---- */

  .d-chip-row {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
    flex-shrink: 0;
    min-height: 36px;
    margin-bottom: 12px;
  }
  .d-chip-row > .m-icon { color: var(--md-sys-color-on-surface-variant); }

  .d-chip {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    height: 36px;
    padding: 0 12px;
    border-radius: 18px;
    background: var(--md-sys-color-secondary-container);
    color: var(--md-sys-color-on-secondary-container);
    font: 500 13px/16px 'Roboto', sans-serif;
    box-sizing: border-box;
    white-space: nowrap;
    cursor: pointer;
    max-width: 320px;
  }
  .d-chip > span:first-child { overflow: hidden; text-overflow: ellipsis; }
  .d-chip.outlined {
    background: transparent;
    border: 1px solid var(--md-sys-color-outline);
    color: var(--md-sys-color-on-surface);
    padding: 0 14px;
  }
  .d-chip.outlined:hover { background: var(--md-sys-color-surface-container); }
  .d-chip.muted {
    background: transparent;
    border: 1px solid var(--md-sys-color-outline-variant);
    color: var(--md-sys-color-outline);
    padding: 0 14px;
    cursor: default;
  }
  .d-count {
    font: 400 13px/16px 'Roboto', sans-serif;
    color: var(--md-sys-color-on-surface-variant);
  }

  /* ---- summary strip ---- */

  .d-strip {
    display: flex;
    align-items: stretch;
    flex-wrap: wrap;
    row-gap: 4px;
    flex-shrink: 0;
    min-height: 64px;
    padding: 4px;
    border-radius: 16px;
    background: var(--md-sys-color-surface-container-lowest);
    border: 1px solid var(--md-sys-color-outline-variant);
    box-sizing: border-box;
    margin-bottom: 12px;
  }
  .d-strip-cell {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 0 16px;
  }
  .d-strip-cell.tight { padding: 0 12px; }
  .d-strip-label {
    font: 500 11px/14px 'Roboto', sans-serif;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--md-sys-color-on-surface-variant);
    white-space: nowrap;
  }
  .d-strip-value {
    font: 500 15px/20px 'Roboto Mono', ui-monospace, monospace;
    color: var(--md-sys-color-on-surface);
    white-space: nowrap;
  }
  .d-strip-value.lead { font: 500 20px/26px 'Roboto Mono', ui-monospace, monospace; }
  .d-strip-value.text { font: 500 14px/18px 'Roboto', sans-serif; }
  .d-strip-value.positive { color: var(--pf-positive); }
  .d-strip-value.negative { color: var(--md-sys-color-error); }
  .d-strip-value.muted { color: var(--md-sys-color-on-surface-variant); }
  .d-strip-divider {
    width: 1px;
    background: var(--md-sys-color-outline-variant);
    margin: 14px 0;
    flex-shrink: 0;
  }

  /* Editable figures in the strip: dashed underline, mono type, currency prefix.
     The width is set per use so the longest expected value never clips. */
  .d-strip-edit { display: flex; align-items: baseline; gap: 2px; }
  .d-strip-prefix { font: 500 13px 'Roboto', sans-serif; color: var(--md-sys-color-on-surface-variant); }
  .d-strip-input {
    border: none;
    border-bottom: 1px dashed var(--md-sys-color-outline-variant);
    background: transparent;
    outline: none;
    font: 500 15px/20px 'Roboto Mono', ui-monospace, monospace;
    color: var(--md-sys-color-on-surface);
    padding: 0;
  }
  .d-strip-input.lead { font: 500 20px/26px 'Roboto Mono', ui-monospace, monospace; }
  .d-strip-input:focus { border-bottom-color: var(--md-sys-color-primary); }

  .d-pill {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    height: 32px;
    padding: 0 12px;
    border-radius: 16px;
    font: 500 13px/16px 'Roboto', sans-serif;
    white-space: nowrap;
    box-sizing: border-box;
    background: var(--md-sys-color-surface-container);
    color: var(--md-sys-color-on-surface);
    flex-shrink: 0;
  }
  button.d-pill { cursor: pointer; }
  .d-pill.positive { background: var(--pf-status-ok-bg); color: var(--pf-status-ok-text); }
  .d-pill.warning { background: var(--pf-status-behind-bg); color: var(--pf-status-behind-text); }
  .d-pill.attention { background: var(--md-sys-color-error-container); color: var(--md-sys-color-on-error-container); }
  .d-pill.tertiary { background: var(--md-sys-color-tertiary-container); color: var(--md-sys-color-on-tertiary-container); }
  .d-pill.delta {
    height: 26px;
    padding: 0 10px;
    border-radius: 13px;
    background: var(--pf-delta-up-bg);
    color: var(--md-sys-color-error);
    font: 500 12px/16px 'Roboto', sans-serif;
  }
  .d-pill.delta.down { background: var(--pf-status-ok-bg); color: var(--pf-status-ok-text); }

  /* Small pills inside rows and cards. */
  .d-tag {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    height: 24px;
    padding: 0 10px;
    border-radius: 12px;
    font: 500 12px/16px 'Roboto', sans-serif;
    white-space: nowrap;
    box-sizing: border-box;
    flex-shrink: 0;
    background: var(--md-sys-color-surface-container);
    color: var(--md-sys-color-on-surface-variant);
  }
  .d-tag.square { border-radius: 8px; }
  .d-tag.positive { background: var(--pf-status-ok-bg); color: var(--pf-status-ok-text); }
  .d-tag.warning { background: var(--pf-status-behind-bg); color: var(--pf-status-behind-text); }
  .d-tag.tertiary { background: var(--md-sys-color-tertiary-container); color: var(--md-sys-color-on-tertiary-container); }
  .d-tag.selected { background: var(--md-sys-color-secondary-container); color: var(--md-sys-color-on-secondary-container); }
  .d-tag.amber { background: var(--pf-status-warn-bg); color: var(--pf-status-warn-text); }
  .d-tag.subcount { height: 22px; padding: 0 8px; border-radius: 8px; }

  /* ---- content area, panels ---- */

  .d-content {
    flex: 1;
    min-height: 0;
    display: grid;
    gap: 16px;
    padding-bottom: 20px;
  }
  .d-content.scroll { overflow-y: auto; overflow-x: hidden; }
  .d-content.top { align-items: start; }

  .d-panel {
    min-width: 0;
    display: flex;
    flex-direction: column;
    background: var(--md-sys-color-surface-container-lowest);
    border: 1px solid var(--md-sys-color-outline-variant);
    border-radius: 16px;
    overflow: hidden;
    box-sizing: border-box;
  }
  .d-panel.pad { padding: 16px 18px; }
  .d-panel.grow { flex: 1; min-height: 0; }
  .d-panel-head {
    display: flex;
    align-items: baseline;
    gap: 10px;
    flex-shrink: 0;
    padding: 16px 18px 10px;
  }
  .d-panel.pad .d-panel-head { padding: 0 0 2px; }
  .d-panel-title {
    font: 500 16px/22px 'Roboto', sans-serif;
    color: var(--md-sys-color-on-surface);
  }
  .d-panel-title.small { font: 500 15px/20px 'Roboto', sans-serif; }
  .d-panel-sub {
    font: 400 13px/18px 'Roboto', sans-serif;
    color: var(--md-sys-color-on-surface-variant);
  }
  .d-panel-hint {
    font: 400 12px/16px 'Roboto', sans-serif;
    color: var(--md-sys-color-outline);
  }
  .d-panel-caption {
    font: 400 12px/16px 'Roboto', sans-serif;
    color: var(--md-sys-color-on-surface-variant);
    flex-shrink: 0;
  }
  .d-panel-body {
    flex: 1;
    min-height: 0;
    overflow-y: auto;
    overflow-x: hidden;
    padding: 0 18px 14px;
  }
  .d-panel.pad .d-panel-body { padding: 14px 0 0; }
  .d-panel-body.stack { display: flex; flex-direction: column; gap: 12px; }
  /* A scrolling column must not squeeze its rows to fit. */
  .d-panel-body.stack > * { flex-shrink: 0; }
  .d-panel-foot {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 8px;
    flex-shrink: 0;
    margin-top: 12px;
    padding-top: 12px;
    border-top: 1px solid var(--md-sys-color-outline-variant);
  }

  .d-nudge {
    flex-shrink: 0;
    background: var(--md-sys-color-primary-container);
    color: var(--md-sys-color-on-primary-container);
    border-radius: 16px;
    padding: 14px 16px;
    box-sizing: border-box;
  }
  .d-nudge-head {
    display: flex;
    align-items: center;
    gap: 8px;
    font: 500 14px/18px 'Roboto', sans-serif;
  }
  .d-nudge-body {
    font: 400 12px/16px 'Roboto', sans-serif;
    margin-top: 6px;
    opacity: 0.8;
    text-wrap: pretty;
  }
  .d-nudge .d-btn { margin-top: 12px; width: fit-content; }

  /* ---- ranked bars ---- */

  /*
   * No flex: 1 here — inside a column flex parent (which is every card that
   * stacks a label line above its bar) flex-basis would win over the height and
   * collapse the track to nothing. The row contexts opt in below instead.
   */
  .d-bar {
    position: relative;
    width: 100%;
    height: 6px;
    border-radius: 3px;
    background: var(--md-sys-color-surface-container-highest);
    overflow: hidden;
    flex-shrink: 0;
    box-sizing: border-box;
  }
  .d-bar.thick { height: 8px; border-radius: 4px; }
  .d-bar.detail { height: 10px; border-radius: 5px; overflow: visible; }
  .d-bar-fill {
    height: 100%;
    border-radius: inherit;
    background: var(--md-sys-color-primary);
  }
  .d-bar-fill.over { background: var(--pf-over-budget); }
  .d-bar-fill.none { background: var(--md-sys-color-outline-variant); }
  /* "Where you should be by now" marker; sits above the fill so it stays visible */
  .d-bar-tick {
    position: absolute;
    top: -3px;
    width: 2px;
    height: 16px;
    border-radius: 1px;
    background: var(--md-sys-color-on-surface);
  }

  .d-ranked { display: flex; flex-direction: column; gap: 5px; }
  .d-ranked.clickable { cursor: pointer; }
  .d-ranked-head { display: flex; align-items: center; gap: 8px; }
  .d-ranked-name {
    flex: 1;
    min-width: 0;
    font: 400 13px/18px 'Roboto', sans-serif;
    color: var(--md-sys-color-on-surface);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .d-ranked-amount {
    font: 500 13px/18px 'Roboto Mono', ui-monospace, monospace;
    color: var(--md-sys-color-on-surface);
    white-space: nowrap;
  }
  .d-ranked-foot { display: flex; align-items: center; gap: 8px; }
  .d-ranked-foot .d-bar { flex: 1; }
  .d-ranked-share {
    width: 30px;
    text-align: right;
    font: 400 11px/16px 'Roboto', sans-serif;
    color: var(--md-sys-color-on-surface-variant);
    flex-shrink: 0;
  }

  /* ---- tables and rows ---- */

  .d-thead {
    position: sticky;
    top: 0;
    z-index: 1;
    display: grid;
    align-items: center;
    height: 44px;
    padding: 0 8px;
    background: var(--md-sys-color-surface-container);
    border-bottom: 1px solid var(--md-sys-color-outline-variant);
    color: var(--md-sys-color-on-surface-variant);
    font: 500 13px/16px 'Roboto', sans-serif;
  }
  .d-thead.short { height: 40px; padding: 0 16px; font: 500 12px/16px 'Roboto', sans-serif; }
  .d-th {
    display: flex;
    align-items: center;
    gap: 4px;
    min-width: 0;
    background: none;
    color: inherit;
    font: inherit;
    cursor: pointer;
  }
  .d-th.sorted { color: var(--md-sys-color-on-surface); }
  .d-th.right { justify-content: flex-end; padding-right: 4px; }
  .d-th.plain { cursor: default; }

  .d-row {
    display: grid;
    align-items: center;
    padding: 0 8px;
    border-bottom: 1px solid var(--md-sys-color-surface-container-high);
    background: var(--md-sys-color-surface-container-lowest);
    color: var(--md-sys-color-on-surface);
    cursor: pointer;
    box-sizing: border-box;
    width: 100%;
    text-align: left;
    font: inherit;
  }
  .d-row:hover { background: var(--md-sys-color-surface-container-low); }
  .d-row.zebra { background: var(--md-sys-color-surface); }
  .d-row.selected { background: var(--md-sys-color-surface-container); }
  .d-row.open { background: var(--md-sys-color-surface-container-low); }
  .d-row-date {
    font: 400 13px/18px 'Roboto Mono', ui-monospace, monospace;
    color: var(--md-sys-color-on-surface-variant);
    white-space: nowrap;
  }
  .d-row-desc {
    font: 400 14px/18px 'Roboto', sans-serif;
    color: var(--md-sys-color-on-surface);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .d-row-amount {
    text-align: right;
    padding-right: 4px;
    font: 500 14px/18px 'Roboto Mono', ui-monospace, monospace;
    color: var(--md-sys-color-on-surface);
    white-space: nowrap;
  }
  .d-row-amount.positive { color: var(--pf-positive); }
  .d-row-amount.negative { color: var(--md-sys-color-error); }
  .d-row-chevron {
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--md-sys-color-outline);
  }
  .d-empty-row {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    min-height: 120px;
    padding: 24px;
    font: 400 14px/20px 'Roboto', sans-serif;
    color: var(--md-sys-color-on-surface-variant);
    text-align: center;
    text-wrap: pretty;
  }

  /* The dashed "add a new one" row that closes a list. */
  .d-add-row {
    display: flex;
    align-items: center;
    gap: 8px;
    width: 100%;
    height: 48px;
    padding: 0 16px;
    background: transparent;
    color: var(--md-sys-color-primary);
    font: 500 14px/20px 'Roboto', sans-serif;
    box-sizing: border-box;
    cursor: pointer;
  }
  .d-add-row:hover { background: var(--md-sys-color-surface-container-low); }
  .d-add-row.dashed {
    justify-content: center;
    height: 52px;
    border: 1px dashed var(--md-sys-color-outline);
    border-radius: 16px;
    flex-shrink: 0;
  }
  .d-add-row.dashed:hover { background: var(--md-sys-color-surface-container); }

  .d-tfoot {
    display: flex;
    align-items: center;
    gap: 12px;
    height: 52px;
    flex-shrink: 0;
    padding: 0 12px;
    border-top: 1px solid var(--md-sys-color-outline-variant);
    background: var(--md-sys-color-surface-container-low);
    box-sizing: border-box;
  }
  .d-tfoot-label { font: 400 13px/16px 'Roboto', sans-serif; color: var(--md-sys-color-on-surface-variant); }
  .d-pill-select {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    height: 32px;
    padding: 0 6px 0 10px;
    border-radius: 8px;
    background: var(--md-sys-color-surface-container);
    color: var(--md-sys-color-on-surface);
    font: 500 13px/16px 'Roboto', sans-serif;
    cursor: pointer;
    box-sizing: border-box;
  }
  .d-pill-select .m-icon { color: var(--md-sys-color-on-surface-variant); }

  .d-checkbox {
    width: 18px;
    height: 18px;
    border-radius: 3px;
    border: 2px solid var(--md-sys-color-outline);
    background: transparent;
    box-sizing: border-box;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    color: var(--md-sys-color-on-primary);
    padding: 0;
    cursor: pointer;
    flex-shrink: 0;
  }
  .d-checkbox[aria-checked='true'] {
    background: var(--md-sys-color-primary);
    border-color: var(--md-sys-color-primary);
  }
  .d-check-cell { display: flex; align-items: center; justify-content: center; }

  /* ---- inline expand ---- */

  .d-expand {
    background: var(--md-sys-color-surface-container-low);
    border-bottom: 1px solid var(--md-sys-color-outline-variant);
    padding: 16px;
    box-sizing: border-box;
  }
  /* When the row itself sits on a tinted list, the expand goes lighter. */
  .d-expand.tinted { background: var(--md-sys-color-surface); }

  .d-fields {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 12px;
    align-items: end;
  }
  .d-field { display: flex; flex-direction: column; gap: 6px; min-width: 0; }
  .d-field.wide { grid-column: span 2; }
  .d-field-label {
    font: 500 11px/14px 'Roboto', sans-serif;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--md-sys-color-on-surface-variant);
  }
  .d-input {
    height: 40px;
    padding: 0 12px;
    border-radius: 8px;
    border: 1px solid var(--md-sys-color-outline);
    background: var(--md-sys-color-surface-container-lowest);
    color: var(--md-sys-color-on-surface);
    font: 400 14px/20px 'Roboto', sans-serif;
    box-sizing: border-box;
    outline: none;
    width: 100%;
    min-width: 0;
  }
  .d-input:focus { border-color: var(--md-sys-color-primary); }
  .d-input::placeholder { color: var(--md-sys-color-outline); }
  .d-input.mono { font: 400 14px/20px 'Roboto Mono', ui-monospace, monospace; }
  .d-input.amount {
    font: 500 14px/20px 'Roboto Mono', ui-monospace, monospace;
    text-align: right;
  }
  .d-input.password { font: 400 14px/20px 'Roboto', sans-serif; }

  .d-select {
    display: flex;
    align-items: center;
    gap: 8px;
    height: 40px;
    padding: 0 8px 0 12px;
    border-radius: 8px;
    border: 1px solid var(--md-sys-color-outline);
    background: var(--md-sys-color-surface-container-lowest);
    color: var(--md-sys-color-on-surface);
    box-sizing: border-box;
    cursor: pointer;
    width: 100%;
    min-width: 0;
  }
  .d-select.primary { border-color: var(--md-sys-color-primary); }
  .d-select-value {
    flex: 1;
    min-width: 0;
    font: 400 14px/20px 'Roboto', sans-serif;
    color: var(--md-sys-color-on-surface);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .d-select-value.muted { color: var(--md-sys-color-outline); }
  .d-select .m-icon { color: var(--md-sys-color-on-surface-variant); }

  .d-actions {
    display: flex;
    align-items: center;
    gap: 12px;
    flex-wrap: wrap;
    row-gap: 8px;
    margin-top: 16px;
  }
  .d-actions-divider {
    width: 1px;
    height: 24px;
    background: var(--md-sys-color-outline-variant);
    flex-shrink: 0;
  }
  .d-footnote {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    margin-top: 14px;
    padding-top: 12px;
    border-top: 1px solid var(--md-sys-color-outline-variant);
    font: 400 12px/16px 'Roboto', sans-serif;
    color: var(--md-sys-color-on-surface-variant);
    text-wrap: pretty;
  }
  .d-footnote .m-icon { margin-top: 1px; }

  /* Six-swatch colour picker in the Categories expand. */
  .d-swatches { display: flex; align-items: center; gap: 8px; height: 40px; }
  .d-swatch {
    width: 20px;
    height: 20px;
    border-radius: 4px;
    padding: 0;
    cursor: pointer;
    box-sizing: content-box;
    border: 2px solid transparent;
  }
  .d-swatch.selected { border-color: var(--md-sys-color-on-surface); }

  /* ---- switch ---- */

  .d-switch {
    width: 52px;
    height: 32px;
    border-radius: 16px;
    border: 2px solid var(--md-sys-color-outline);
    background: var(--md-sys-color-surface-container-highest);
    display: inline-flex;
    align-items: center;
    justify-content: flex-start;
    padding: 3px;
    box-sizing: border-box;
    flex-shrink: 0;
    cursor: pointer;
  }
  .d-switch::after {
    content: '';
    width: 16px;
    height: 16px;
    margin: 0 3px;
    border-radius: 50%;
    background: var(--md-sys-color-outline);
  }
  .d-switch[aria-checked='true'] {
    background: var(--md-sys-color-primary);
    border-color: var(--md-sys-color-primary);
    justify-content: flex-end;
  }
  .d-switch[aria-checked='true']::after {
    width: 24px;
    height: 24px;
    margin: 0;
    background: var(--md-sys-color-on-primary);
  }

  /* ---- misc ---- */

  .d-dot {
    width: 12px;
    height: 12px;
    border-radius: 3px;
    flex-shrink: 0;
  }
  .d-dot.large { width: 14px; height: 14px; box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1); cursor: pointer; }

  .d-warn-block {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    padding: 10px 12px;
    border-radius: 10px;
    background: var(--md-sys-color-error-container);
    color: var(--md-sys-color-on-error-container);
    font: 400 12px/16px 'Roboto', sans-serif;
    text-wrap: pretty;
  }
`;
