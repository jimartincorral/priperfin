import { css, html, nothing, type TemplateResult } from 'lit';

/**
 * Shared building blocks for the phone layouts (<= 600px).
 *
 * The views keep their desktop markup untouched and render a separate mobile
 * template below the breakpoint, so everything here is scoped to classes that
 * only appear on that path.
 */

export const MOBILE_BREAKPOINT = 600;

/** `true` while the viewport is at or below the mobile breakpoint. */
export function isMobileViewport(): boolean {
  return window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT}px)`).matches;
}

/**
 * Keeps `host.isMobile` in sync with the breakpoint for as long as the element
 * is connected. Returns the teardown function to call from
 * `disconnectedCallback`.
 */
export function watchMobileViewport(host: { isMobile: boolean }): () => void {
  const query = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT}px)`);
  const apply = () => { host.isMobile = query.matches; };
  apply();
  query.addEventListener('change', apply);
  return () => query.removeEventListener('change', apply);
}

/** Material Symbols glyph. Icons are already loaded in index.html. */
export function icon(name: string, size = 24): TemplateResult {
  return html`<span class="m-icon" style="font-size: ${size}px">${name}</span>`;
}

export interface MonthStepperOptions {
  label: string;
  onPrev: () => void;
  onNext: () => void;
  /** Omit to render a plain label with no period sheet affordance. */
  onLabel?: () => void;
  /** Renders the label in `secondary-container` with `expand_less`. */
  open?: boolean;
  /** Disables the forward chevron (e.g. at the current month). */
  nextDisabled?: boolean;
}

/** 48px period stepper shared by Reports and Expenses. */
export function monthStepper(opts: MonthStepperOptions): TemplateResult {
  return html`
    <div class="m-stepper ${opts.open ? 'open' : ''}">
      <button class="m-stepper-chevron" @click="${opts.onPrev}" aria-label="Previous">
        ${icon('chevron_left', 22)}
      </button>
      ${opts.onLabel
        ? html`
          <button class="m-stepper-label" @click="${opts.onLabel}">
            <span>${opts.label}</span>
            ${icon(opts.open ? 'expand_less' : 'expand_more', 18)}
          </button>
        `
        : html`<div class="m-stepper-label static"><span>${opts.label}</span></div>`}
      <button
        class="m-stepper-chevron"
        ?disabled="${opts.nextDisabled}"
        @click="${opts.onNext}"
        aria-label="Next">
        ${icon('chevron_right', 22)}
      </button>
    </div>
  `;
}

export interface SheetOptions {
  open: boolean;
  onDismiss: () => void;
  content: unknown;
  /** Defaults to 76% of the viewport, per the transaction sheet spec. */
  maxHeight?: string;
}

/** Bottom sheet: scrim, 28px top radius, drag handle, slide-up transition. */
export function bottomSheet(opts: SheetOptions): TemplateResult | typeof nothing {
  if (!opts.open) return nothing;
  return html`
    <div class="m-scrim" @click="${opts.onDismiss}">
      <div
        class="m-sheet"
        style="${opts.maxHeight ? `max-height: ${opts.maxHeight}` : ''}"
        @click="${(e: Event) => e.stopPropagation()}">
        <div class="m-sheet-handle"></div>
        <div class="m-sheet-body">${opts.content}</div>
      </div>
    </div>
  `;
}

export interface AppBarOptions {
  title: unknown;
  subtitle?: unknown;
  onBack: () => void;
  /** `close` instead of `arrow_back`, for form screens. */
  closeIcon?: boolean;
  /** Optional trailing action rendered at 48px. */
  action?: TemplateResult;
}

/** Drill-down / form-screen top app bar. */
export function appBar(opts: AppBarOptions): TemplateResult {
  return html`
    <div class="m-appbar">
      <button class="m-icon-btn" @click="${opts.onBack}" aria-label="Back">
        ${icon(opts.closeIcon ? 'close' : 'arrow_back', 24)}
      </button>
      <div class="m-appbar-titles">
        <div class="m-appbar-title">${opts.title}</div>
        ${opts.subtitle ? html`<div class="m-appbar-subtitle">${opts.subtitle}</div>` : nothing}
      </div>
      ${opts.action ?? nothing}
    </div>
  `;
}

export interface SnackbarOptions {
  message: string;
  /** Optional single action, per the spec's "one action" rule. */
  actionLabel?: string;
  onAction?: () => void;
}

/** Inline snackbar pinned above the bottom nav; replaces alert(). */
export function snackbar(sb: SnackbarOptions | null): TemplateResult | typeof nothing {
  if (!sb) return nothing;
  return html`
    <div class="m-snackbar" role="status">
      <span class="m-snackbar-text">${sb.message}</span>
      ${sb.actionLabel
        ? html`<button class="m-snackbar-action" @click="${sb.onAction}">${sb.actionLabel}</button>`
        : nothing}
    </div>
  `;
}

/** A skeleton bar for the loading states. */
export function skeleton(width: string, height = '12px', secondary = false): TemplateResult {
  return html`<div
    class="m-skeleton ${secondary ? 'secondary' : ''}"
    style="width: ${width}; height: ${height}"></div>`;
}

/**
 * Shared mobile CSS. Compose into a view with
 * `static styles = [mobileUI, css`...`]`.
 */
export const mobileUI = css`
  .m-icon {
    font-family: 'Material Symbols Outlined';
    font-weight: normal;
    font-style: normal;
    line-height: 1;
    display: inline-block;
    text-transform: none;
    letter-spacing: normal;
    word-wrap: normal;
    white-space: nowrap;
    direction: ltr;
    -webkit-font-smoothing: antialiased;
    flex-shrink: 0;
  }
  .m-icon.filled { font-variation-settings: 'FILL' 1; }

  /* ---- screen scaffold ---- */

  .m-screen {
    display: flex;
    flex-direction: column;
    gap: 12px;
    /* main already pads 1rem; bleed back out so rows can reach the edges */
    margin: -1rem -1rem 0;
    padding: 12px 16px 0;
    min-height: 0;
  }

  .m-title-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    min-height: 44px;
  }
  .m-title {
    font: var(--md-sys-typescale-title-large);
    color: var(--md-sys-color-on-surface);
    margin: 0;
  }
  .m-subtitle {
    font: var(--md-sys-typescale-body-medium);
    color: var(--md-sys-color-on-surface-variant);
    margin: 0;
    text-wrap: pretty;
  }
  .m-title-actions { display: flex; align-items: center; gap: 4px; }

  .m-section-label {
    font: 500 12px/16px 'Roboto', sans-serif;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--md-sys-color-on-surface-variant);
  }

  /* ---- buttons ---- */

  .m-icon-btn {
    width: 44px;
    height: 44px;
    min-width: 44px;
    border: none;
    background: transparent;
    color: var(--md-sys-color-on-surface-variant);
    border-radius: 22px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    padding: 0;
  }
  .m-icon-btn:active { background: var(--md-sys-color-surface-container-highest); }
  .m-icon-btn.danger { color: var(--md-sys-color-error); }

  .m-btn {
    height: 48px;
    padding: 0 20px;
    border-radius: 24px;
    border: none;
    font: 500 15px/20px 'Roboto', sans-serif;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    cursor: pointer;
    box-sizing: border-box;
    background: var(--md-sys-color-primary);
    color: var(--md-sys-color-on-primary);
  }
  .m-btn.tall { height: 52px; border-radius: 26px; }
  .m-btn.form { height: 56px; border-radius: 16px; }
  .m-btn.tonal {
    background: var(--md-sys-color-secondary-container);
    color: var(--md-sys-color-on-secondary-container);
  }
  .m-btn.outlined {
    background: transparent;
    color: var(--md-sys-color-primary);
    border: 1px solid var(--md-sys-color-outline);
  }
  .m-btn.destructive {
    background: var(--md-sys-color-error-container);
    color: var(--md-sys-color-on-error-container);
  }
  .m-btn.short { height: 40px; border-radius: 20px; font-size: 14px; }
  .m-btn:disabled { opacity: 0.4; cursor: default; }
  .m-btn.block { width: 100%; }

  .m-link {
    background: none;
    border: none;
    padding: 0;
    color: var(--md-sys-color-primary);
    font: 500 14px/20px 'Roboto', sans-serif;
    cursor: pointer;
  }

  /* ---- chips ---- */

  .m-chip {
    height: 40px;
    padding: 0 14px;
    border-radius: 20px;
    border: none;
    background: var(--md-sys-color-surface-container);
    color: var(--md-sys-color-on-surface);
    font: 500 14px/20px 'Roboto', sans-serif;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    cursor: pointer;
    white-space: nowrap;
    box-sizing: border-box;
  }

  .m-chip-row {
    display: flex;
    gap: 8px;
    overflow-x: auto;
    scrollbar-width: none;
    margin: 0 -16px;
    padding: 2px 16px;
  }
  .m-chip-row::-webkit-scrollbar { display: none; }

  .m-filter-chip {
    height: 36px;
    padding: 0 14px;
    border-radius: 18px;
    border: 1px solid var(--md-sys-color-outline);
    background: transparent;
    color: var(--md-sys-color-on-surface);
    font: 500 14px/20px 'Roboto', sans-serif;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    cursor: pointer;
    white-space: nowrap;
    box-sizing: border-box;
  }
  .m-filter-chip.selected {
    background: var(--md-sys-color-secondary-container);
    color: var(--md-sys-color-on-secondary-container);
    border-color: transparent;
  }
  .m-chip-count {
    min-width: 18px;
    height: 18px;
    padding: 0 5px;
    border-radius: 9px;
    background: var(--md-sys-color-primary);
    color: var(--md-sys-color-on-primary);
    font: 500 11px/18px 'Roboto', sans-serif;
    text-align: center;
    box-sizing: border-box;
  }

  /* ---- month stepper ---- */

  .m-stepper {
    display: flex;
    align-items: center;
    height: 48px;
    background: var(--md-sys-color-surface-container);
    border-radius: 16px;
    overflow: hidden;
    flex-shrink: 0;
  }
  .m-stepper.open .m-stepper-label { background: var(--md-sys-color-secondary-container); }
  .m-stepper-chevron {
    width: 56px;
    height: 48px;
    border: none;
    background: transparent;
    color: var(--md-sys-color-on-surface);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    padding: 0;
    flex-shrink: 0;
  }
  .m-stepper-chevron:disabled { color: var(--md-sys-color-outline-variant); cursor: default; }
  .m-stepper-label {
    flex: 1;
    height: 48px;
    border: none;
    background: transparent;
    color: var(--md-sys-color-on-surface);
    font: 500 16px/24px 'Roboto', sans-serif;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 4px;
    cursor: pointer;
    min-width: 0;
  }
  .m-stepper-label.static { cursor: default; }
  .m-stepper-label .m-icon { color: var(--md-sys-color-on-surface-variant); }

  /* ---- tabs ---- */

  .m-tabs {
    display: flex;
    gap: 4px;
    border-bottom: 1px solid var(--md-sys-color-outline-variant);
    margin: 0 -16px;
    padding: 0 16px;
  }
  .m-tab {
    position: relative;
    padding: 12px;
    border: none;
    background: transparent;
    color: var(--md-sys-color-on-surface);
    font: 500 14px/20px 'Roboto', sans-serif;
    cursor: pointer;
  }
  .m-tab[aria-selected='true']::after {
    content: '';
    position: absolute;
    left: 8px;
    right: 8px;
    bottom: -1px;
    height: 3px;
    border-radius: 2px 2px 0 0;
    background: var(--md-sys-color-primary);
  }

  /* ---- app bar ---- */

  .m-appbar {
    display: flex;
    align-items: center;
    gap: 4px;
    min-height: 56px;
    margin: 0 -16px;
    padding: 4px 12px;
  }
  .m-appbar .m-icon-btn { width: 48px; height: 48px; min-width: 48px; color: var(--md-sys-color-on-surface); }
  .m-appbar-titles { flex: 1; min-width: 0; }
  .m-appbar-title {
    font: 500 18px/24px 'Roboto', sans-serif;
    color: var(--md-sys-color-on-surface);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .m-appbar-subtitle {
    font: 400 13px/16px 'Roboto', sans-serif;
    color: var(--md-sys-color-on-surface-variant);
  }

  /* ---- cards, tiles, rows ---- */

  .m-card {
    background: var(--md-sys-color-surface-container);
    border-radius: 16px;
    padding: 16px;
    box-sizing: border-box;
  }

  .m-tile {
    background: var(--md-sys-color-surface-container);
    border-radius: 12px;
    padding: 12px 14px;
    box-sizing: border-box;
  }
  .m-tile-label {
    font: 500 12px/16px 'Roboto', sans-serif;
    color: var(--md-sys-color-on-surface-variant);
  }
  .m-tile-value {
    font: 400 24px/32px 'Roboto', sans-serif;
    color: var(--md-sys-color-on-surface);
  }

  .m-row {
    display: flex;
    align-items: center;
    gap: 12px;
    min-height: 56px;
    padding: 8px 16px;
    margin: 0 -16px;
    border-bottom: 1px solid var(--md-sys-color-surface-container-high);
    box-sizing: border-box;
    background: none;
    border-left: none;
    border-right: none;
    border-top: none;
    width: calc(100% + 32px);
    text-align: left;
    color: var(--md-sys-color-on-surface);
    font: inherit;
    cursor: pointer;
  }
  .m-row-main { flex: 1; min-width: 0; }
  .m-row-primary {
    font: var(--md-sys-typescale-body-large);
    color: var(--md-sys-color-on-surface);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .m-row-secondary {
    font: 500 13px/16px 'Roboto', sans-serif;
    color: var(--md-sys-color-on-surface-variant);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .m-row-value {
    font: 400 14px/20px 'Roboto', sans-serif;
    color: var(--md-sys-color-on-surface-variant);
  }

  .m-avatar {
    width: 40px;
    height: 40px;
    border-radius: 20px;
    background: var(--md-sys-color-surface-container-high);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    flex-shrink: 0;
  }
  .m-avatar.small { width: 32px; height: 32px; border-radius: 16px; font-size: 15px; }

  .m-amount {
    font: 500 16px 'Roboto Mono', ui-monospace, monospace;
    color: var(--md-sys-color-on-surface);
    text-align: right;
    white-space: nowrap;
    flex-shrink: 0;
  }
  .m-amount.positive { color: var(--pf-positive); }

  /* ---- progress ---- */

  .m-track {
    position: relative;
    height: 6px;
    border-radius: 3px;
    background: var(--md-sys-color-outline-variant);
    overflow: hidden;
  }
  .m-track.card { height: 8px; border-radius: 4px; }
  .m-track.detail { height: 10px; border-radius: 5px; }
  .m-track-fill {
    height: 100%;
    border-radius: inherit;
    background: var(--md-sys-color-primary);
  }
  /* the should-have-saved marker; sits above the fill so it stays visible */
  .m-track-tick {
    position: absolute;
    top: -3px;
    width: 2px;
    height: 14px;
    background: var(--md-sys-color-on-surface);
  }
  .m-track-wrap { position: relative; }

  /* ---- status pills ---- */

  .m-pill {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 4px 10px;
    border-radius: 999px;
    font: 500 12px/16px 'Roboto', sans-serif;
    white-space: nowrap;
  }
  .m-pill.ok { background: var(--pf-status-ok-bg); color: var(--pf-status-ok-text); }
  .m-pill.behind { background: var(--pf-status-behind-bg); color: var(--pf-status-behind-text); }
  .m-pill.evergreen { background: var(--pf-status-evergreen-bg); color: var(--pf-status-evergreen-text); }
  .m-pill.neutral {
    background: var(--md-sys-color-secondary-container);
    color: var(--md-sys-color-on-secondary-container);
  }
  .m-pill.up { background: var(--pf-delta-up-bg); color: var(--md-sys-color-error); padding: 6px 10px; }
  .m-pill.down { background: var(--pf-status-ok-bg); color: var(--pf-status-ok-text); padding: 6px 10px; }

  .m-tag {
    display: inline-flex;
    align-items: center;
    padding: 2px 8px;
    border-radius: 8px;
    font: 500 11px/16px 'Roboto', sans-serif;
    background: var(--md-sys-color-secondary-container);
    color: var(--md-sys-color-on-secondary-container);
    white-space: nowrap;
  }

  /* ---- fields ---- */

  .m-field {
    width: 100%;
    height: 48px;
    padding: 0 14px;
    border-radius: 16px;
    border: 1px solid var(--md-sys-color-outline);
    background: transparent;
    color: var(--md-sys-color-on-surface);
    font: var(--md-sys-typescale-body-large);
    box-sizing: border-box;
  }
  .m-field.filled {
    border-color: transparent;
    background: var(--md-sys-color-surface-container);
  }
  .m-field.form {
    height: 56px;
    border-radius: 12px;
  }
  .m-field:focus { outline: none; border-color: var(--md-sys-color-primary); }
  .m-field::placeholder { color: var(--md-sys-color-outline); }

  .m-field-group { display: flex; flex-direction: column; gap: 6px; }
  .m-field-error {
    font: 400 12px/16px 'Roboto', sans-serif;
    color: var(--md-sys-color-error);
  }
  .m-field-with-icon { position: relative; display: block; }
  .m-field-with-icon .m-icon {
    position: absolute;
    right: 14px;
    top: 50%;
    transform: translateY(-50%);
    pointer-events: none;
    color: var(--md-sys-color-on-surface-variant);
  }
  .m-field-with-icon .m-field { padding-right: 44px; }

  .m-switch {
    width: 52px;
    height: 32px;
    border-radius: 16px;
    border: 2px solid var(--md-sys-color-outline);
    background: var(--md-sys-color-surface-container-highest);
    position: relative;
    cursor: pointer;
    flex-shrink: 0;
    padding: 0;
    transition: background-color 0.15s;
  }
  .m-switch::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 6px;
    width: 16px;
    height: 16px;
    border-radius: 8px;
    background: var(--md-sys-color-outline);
    transform: translateY(-50%);
    transition: left 0.15s, width 0.15s, height 0.15s, background-color 0.15s;
  }
  .m-switch[aria-checked='true'] {
    background: var(--md-sys-color-primary);
    border-color: var(--md-sys-color-primary);
  }
  .m-switch[aria-checked='true']::after {
    left: 26px;
    width: 24px;
    height: 24px;
    border-radius: 12px;
    background: var(--md-sys-color-on-primary);
  }

  .m-checkbox {
    width: 20px;
    height: 20px;
    border-radius: 2px;
    border: 2px solid var(--md-sys-color-outline);
    background: transparent;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    padding: 0;
    flex-shrink: 0;
    color: var(--md-sys-color-on-primary);
  }
  .m-checkbox[aria-checked='true'] {
    background: var(--md-sys-color-primary);
    border-color: var(--md-sys-color-primary);
  }

  /* ---- bottom sheet ---- */

  .m-scrim {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: 900;
    display: flex;
    align-items: flex-end;
    animation: m-fade 150ms ease-out;
  }
  .m-sheet {
    width: 100%;
    max-height: 76%;
    background: var(--md-sys-color-surface-container-high);
    border-radius: 28px 28px 0 0;
    padding: 12px 0 calc(20px + env(safe-area-inset-bottom, 0px));
    box-shadow: 0 -8px 24px rgba(0, 0, 0, 0.5);
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    animation: m-slide-up 200ms cubic-bezier(0.2, 0, 0, 1);
  }
  .m-sheet-handle {
    width: 32px;
    height: 4px;
    border-radius: 2px;
    background: var(--md-sys-color-outline-variant);
    margin: 0 auto 8px;
    flex-shrink: 0;
  }
  .m-sheet-body {
    padding: 0 20px;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 16px;
    min-height: 0;
  }
  /* .m-row bleeds to the screen edges by default; inside a sheet the gutter is 20px */
  .m-sheet-body .m-row {
    margin: 0 -20px;
    width: calc(100% + 40px);
    padding-left: 20px;
    padding-right: 20px;
  }

  .m-sheet-title { font: 500 18px/24px 'Roboto', sans-serif; color: var(--md-sys-color-on-surface); }
  .m-sheet-title-row { display: flex; align-items: center; justify-content: space-between; gap: 12px; }

  @keyframes m-fade { from { opacity: 0; } to { opacity: 1; } }
  @keyframes m-slide-up { from { transform: translateY(100%); } to { transform: translateY(0); } }

  /* ---- fab, pinned footer ---- */

  .m-fab {
    position: fixed;
    right: 16px;
    bottom: calc(80px + env(safe-area-inset-bottom, 0px));
    width: 56px;
    height: 56px;
    border-radius: 18px;
    border: none;
    background: var(--md-sys-color-primary);
    color: var(--md-sys-color-on-primary);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    z-index: 500;
    padding: 0;
  }

  /* Real layout space rather than an overlay, so the last row stays reachable */
  .m-pinned {
    position: sticky;
    bottom: 0;
    margin: 8px -16px 0;
    padding: 8px 16px calc(8px + env(safe-area-inset-bottom, 0px));
    background: var(--md-sys-color-surface);
    display: flex;
    gap: 12px;
  }

  /* ---- snackbar ---- */

  .m-snackbar {
    position: fixed;
    left: 16px;
    right: 16px;
    bottom: calc(76px + env(safe-area-inset-bottom, 0px));
    z-index: 1100;
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 16px;
    border-radius: 12px;
    background: var(--md-sys-color-error-container);
    color: var(--md-sys-color-on-error-container);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
    animation: m-slide-up 200ms cubic-bezier(0.2, 0, 0, 1);
  }
  .m-snackbar-text { flex: 1; font: var(--md-sys-typescale-body-medium); }
  .m-snackbar-action {
    background: none;
    border: none;
    color: inherit;
    font: 500 14px/20px 'Roboto', sans-serif;
    text-transform: uppercase;
    cursor: pointer;
    padding: 0;
  }

  /* ---- empty + loading ---- */

  .m-empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    padding: 24px 32px;
    gap: 16px;
  }
  .m-empty-circle {
    width: 88px;
    height: 88px;
    border-radius: 44px;
    background: var(--md-sys-color-surface-container);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    color: var(--md-sys-color-outline);
  }
  .m-empty-title { font: 500 18px/24px 'Roboto', sans-serif; color: var(--md-sys-color-on-surface); }
  .m-empty-body {
    font: 400 14px/20px 'Roboto', sans-serif;
    color: var(--md-sys-color-on-surface-variant);
    text-wrap: pretty;
  }
  .m-empty-actions { display: flex; flex-direction: column; gap: 12px; align-self: stretch; }

  .m-progress-bar {
    height: 3px;
    background: var(--md-sys-color-surface-container);
    overflow: hidden;
    margin: 0 -16px;
  }
  .m-progress-bar::after {
    content: '';
    display: block;
    height: 100%;
    width: 40%;
    background: var(--md-sys-color-primary);
    animation: m-indeterminate 1.4s ease-in-out infinite;
  }
  @keyframes m-indeterminate {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(250%); }
  }

  .m-skeleton {
    background: var(--md-sys-color-surface-container-high);
    border-radius: 4px;
  }
  .m-skeleton.secondary { background: var(--pf-skeleton-secondary); }
  .m-skeleton-circle {
    width: 40px;
    height: 40px;
    border-radius: 20px;
    background: var(--md-sys-color-surface-container-high);
    flex-shrink: 0;
  }

  @media (prefers-reduced-motion: reduce) {
    .m-scrim,
    .m-sheet,
    .m-snackbar { animation: none; }
    .m-progress-bar::after { animation-duration: 3s; }
  }
`;
