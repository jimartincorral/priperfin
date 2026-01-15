import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { authApi } from '../api/client';
import { i18n } from '../i18n/i18n';

@customElement('view-setup')
export class ViewSetup extends LitElement {
  @state() profileName = '';
  @state() pinLength = 6;
  @state() pin = '';
  @state() confirmPin = '';
  @state() loading = false;
  @state() error = '';

  async connectedCallback() {
    super.connectedCallback();
    // Check if setup is already complete
    try {
      const status = await authApi.getStatus();
      if (status.setupComplete) {
        // Redirect to login if setup is already complete
        window.location.href = '/login';
      }
    } catch (e) {
      // If check fails, allow user to proceed with setup
      console.warn('Setup status check failed:', e);
    }
  }

  static styles = css`
    :host {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      background: var(--md-sys-color-surface);
    }

    .setup-card {
      background: var(--md-sys-color-surface-container);
      border-radius: var(--md-sys-shape-corner-large);
      padding: 32px;
      max-width: 500px;
      width: 90%;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    }

    h1 {
      font: var(--md-sys-typescale-headline-medium);
      color: var(--md-sys-color-on-surface);
      margin: 0 0 16px 0;
      text-align: center;
    }

    p {
      font: var(--md-sys-typescale-body-medium);
      color: var(--md-sys-color-on-surface-variant);
      text-align: center;
      margin-bottom: 24px;
    }

    .form-field {
      margin-bottom: 20px;
    }

    label {
      display: block;
      font: var(--md-sys-typescale-body-medium);
      color: var(--md-sys-color-on-surface);
      margin-bottom: 8px;
    }

    input, select {
      width: 100%;
      padding: 12px;
      border: 1px solid var(--md-sys-color-outline);
      border-radius: var(--md-sys-shape-corner-small);
      background: var(--md-sys-color-surface);
      color: var(--md-sys-color-on-surface);
      font: var(--md-sys-typescale-body-large);
      box-sizing: border-box;
    }

    .radio-group {
      display: flex;
      gap: 16px;
    }

    .radio-group label {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .pin-container {
      display: flex;
      gap: 8px;
      justify-content: center;
      margin: 16px 0;
    }

    .pin-digit {
      width: 48px;
      height: 56px;
      text-align: center;
      font-size: 24px;
      padding: 0;
    }

    button {
      width: 100%;
      padding: 12px;
      background: var(--md-sys-color-primary);
      color: var(--md-sys-color-on-primary);
      border: none;
      border-radius: var(--md-sys-shape-corner-small);
      font: var(--md-sys-typescale-label-large);
      cursor: pointer;
      margin-top: 16px;
    }

    button:hover {
      opacity: 0.9;
    }

    button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .error {
      color: var(--md-sys-color-error);
      font: var(--md-sys-typescale-body-small);
      margin-top: 8px;
      text-align: center;
    }
  `;

  async handleSetup() {
    // Validate
    if (!this.profileName || this.profileName.length < 3) {
      this.error = 'Profile name must be at least 3 characters';
      return;
    }

    const pinDigits = Array.from(this.shadowRoot?.querySelectorAll('.pin-digit') || [])
      .map((input: any) => input.value)
      .join('');

    const confirmDigits = Array.from(this.shadowRoot?.querySelectorAll('.confirm-digit') || [])
      .map((input: any) => input.value)
      .join('');

    if (pinDigits.length !== this.pinLength) {
      this.error = `PIN must be ${this.pinLength} digits`;
      return;
    }

    if (pinDigits !== confirmDigits) {
      this.error = i18n.t('auth.setup.pinMismatch');
      return;
    }

    this.loading = true;
    this.error = '';

    try {
      await authApi.setup(this.profileName, pinDigits);
      // Auto-login after setup
      await authApi.login(this.profileName, pinDigits);
      window.location.href = '/';
    } catch (e: any) {
      this.loading = false;
      this.error = e.message || 'Setup failed';
    }
  }

  handlePinInput(e: Event, index: number, isConfirm: boolean) {
    const input = e.target as HTMLInputElement;
    if (!/^\d*$/.test(input.value)) {
      input.value = '';
      return;
    }

    if (input.value && index < this.pinLength - 1) {
      const className = isConfirm ? '.confirm-digit' : '.pin-digit';
      const nextInput = this.shadowRoot?.querySelectorAll(className)[index + 1] as HTMLInputElement;
      nextInput?.focus();
    }
  }

  render() {
    return html`
      <div class="setup-card">
        <h1>${i18n.t('auth.setup.title')}</h1>
        <p>${i18n.t('auth.setup.description')}</p>

        <div class="form-field">
          <label>${i18n.t('auth.setup.profileName')}</label>
          <input
            type="text"
            placeholder="${i18n.t('auth.setup.profileNamePlaceholder')}"
            .value=${this.profileName}
            @input=${(e: Event) => this.profileName = (e.target as HTMLInputElement).value}
          />
        </div>

        <div class="form-field">
          <label>${i18n.t('auth.setup.pinLength')}</label>
          <div class="radio-group">
            <label>
              <input type="radio" name="pinLength" value="4" @change=${() => this.pinLength = 4} />
              4 ${i18n.t('auth.setup.digits')}
            </label>
            <label>
              <input type="radio" name="pinLength" value="5" @change=${() => this.pinLength = 5} />
              5 ${i18n.t('auth.setup.digits')}
            </label>
            <label>
              <input type="radio" name="pinLength" value="6" checked @change=${() => this.pinLength = 6} />
              6 ${i18n.t('auth.setup.digits')} ${i18n.t('auth.setup.recommended')}
            </label>
          </div>
        </div>

        <div class="form-field">
          <label>${i18n.t('auth.setup.createPin')}</label>
          <div class="pin-container">
            ${Array.from({ length: this.pinLength }, (_, i) => html`
              <input
                type="password"
                inputmode="numeric"
                maxlength="1"
                class="pin-digit"
                @input=${(e: Event) => this.handlePinInput(e, i, false)}
              />
            `)}
          </div>
        </div>

        <div class="form-field">
          <label>${i18n.t('auth.setup.confirmPin')}</label>
          <div class="pin-container">
            ${Array.from({ length: this.pinLength }, (_, i) => html`
              <input
                type="password"
                inputmode="numeric"
                maxlength="1"
                class="confirm-digit"
                @input=${(e: Event) => this.handlePinInput(e, i, true)}
              />
            `)}
          </div>
        </div>

        ${this.error ? html`<div class="error">${this.error}</div>` : ''}

        <button @click=${this.handleSetup} ?disabled=${this.loading}>
          ${this.loading ? i18n.t('auth.setup.creating') : i18n.t('auth.setup.submit')}
        </button>
      </div>
    `;
  }
}
