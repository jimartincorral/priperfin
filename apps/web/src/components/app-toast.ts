import { LitElement, html, css, nothing } from 'lit';
import { customElement, state } from 'lit/decorators.js';

/** Payload of the `priperfin-notify` window event. */
export interface ToastDetail {
  message: string;
  action?: { label: string; run: () => void };
}

/** Event name the views dispatch; `<app-toast>` listens on `window`. */
export const NOTIFY_EVENT = 'priperfin-notify';

interface ActiveToast {
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}

/**
 * App-level toast for the desktop layout. Views call their `notify()` helper;
 * on mobile that renders the view's own inline snackbar above the bottom nav,
 * on desktop it dispatches a `priperfin-notify` event that lands here, so no
 * notification ever goes through a blocking `alert()`.
 */
@customElement('app-toast')
export class AppToast extends LitElement {
  @state() private toast: ActiveToast | null = null;
  private timer: number | undefined;

  static styles = css`
    :host {
      position: fixed;
      right: 24px;
      bottom: 24px;
      z-index: 1200;
      pointer-events: none;
    }

    .toast {
      pointer-events: auto;
      display: flex;
      align-items: center;
      gap: 16px;
      min-width: 240px;
      max-width: 440px;
      padding: 12px 16px;
      border-radius: 8px;
      background: var(--md-sys-color-surface-container-highest);
      color: var(--md-sys-color-on-surface);
      border: 1px solid var(--md-sys-color-outline-variant);
      box-shadow: 0 6px 20px rgba(0, 0, 0, 0.28);
      font: var(--md-sys-typescale-body-medium);
      animation: toast-in 180ms cubic-bezier(0.2, 0, 0, 1);
    }

    .text {
      flex: 1;
      white-space: pre-line;
    }

    .action {
      border: none;
      background: none;
      padding: 4px 8px;
      border-radius: 4px;
      color: var(--md-sys-color-primary);
      font: 500 14px/20px 'Roboto', sans-serif;
      text-transform: uppercase;
      cursor: pointer;
    }
    .action:hover {
      background: var(--md-sys-color-surface-container);
    }

    .close {
      border: none;
      background: none;
      padding: 4px;
      border-radius: 50%;
      color: var(--md-sys-color-on-surface-variant);
      font-size: 18px;
      line-height: 1;
      cursor: pointer;
    }
    .close:hover {
      background: var(--md-sys-color-surface-container);
    }

    @keyframes toast-in {
      from {
        opacity: 0;
        transform: translateY(12px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @media (max-width: 768px) {
      :host {
        left: 16px;
        right: 16px;
        bottom: calc(76px + env(safe-area-inset-bottom, 0px));
      }
      .toast {
        max-width: none;
      }
    }
  `;

  connectedCallback() {
    super.connectedCallback();
    window.addEventListener(NOTIFY_EVENT, this.onNotify);
  }

  disconnectedCallback() {
    window.removeEventListener(NOTIFY_EVENT, this.onNotify);
    this.clearTimer();
    super.disconnectedCallback();
  }

  private onNotify = (event: Event) => {
    const detail = (event as CustomEvent<ToastDetail>).detail;
    if (!detail?.message) return;
    this.show(detail);
  };

  private show(detail: ToastDetail) {
    this.clearTimer();
    const { message, action } = detail;
    this.toast = action
      ? {
          message,
          actionLabel: action.label,
          onAction: () => {
            this.dismiss();
            action.run();
          },
        }
      : { message };
    // Give an actionable toast long enough to be read and clicked.
    this.timer = window.setTimeout(() => this.dismiss(), action ? 8000 : 4500);
  }

  private dismiss() {
    this.clearTimer();
    this.toast = null;
  }

  private clearTimer() {
    if (this.timer !== undefined) {
      window.clearTimeout(this.timer);
      this.timer = undefined;
    }
  }

  render() {
    const toast = this.toast;
    if (!toast) return nothing;
    return html`
      <div class="toast" role="status" aria-live="polite">
        <span class="text">${toast.message}</span>
        ${toast.actionLabel
          ? html`<button class="action" @click="${toast.onAction}">${toast.actionLabel}</button>`
          : nothing}
        <button class="close" aria-label="Dismiss" @click="${() => this.dismiss()}">×</button>
      </div>
    `;
  }
}
