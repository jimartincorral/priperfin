import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { authApi } from '../api/client';
import { i18n } from '../i18n/i18n';
import '../components/filterable-select';
import type { SelectOption } from '../components/filterable-select';

@customElement('view-login')
export class ViewLogin extends LitElement {
  @state() profiles: Array<{ id: string; name: string }> = [];
  @state() selectedProfile = '';
  @state() pin = '';
  @state() loading = false;
  @state() error = '';
  @state() showPin = false;
  @state() rateLimited = false;
  @state() retryAfter = 0;

  static styles = css`
    :host {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      background: var(--md-sys-color-surface);
    }

    .login-card {
      background: var(--md-sys-color-surface-container);
      border-radius: var(--md-sys-shape-corner-large);
      padding: 32px;
      max-width: 400px;
      width: 90%;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    }

    h1 {
      font: var(--md-sys-typescale-headline-medium);
      color: var(--md-sys-color-on-surface);
      margin: 0 0 24px 0;
      text-align: center;
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

    select, input {
      width: 100%;
      padding: 12px;
      border: 1px solid var(--md-sys-color-outline);
      border-radius: var(--md-sys-shape-corner-small);
      background: var(--md-sys-color-surface);
      color: var(--md-sys-color-on-surface);
      font: var(--md-sys-typescale-body-large);
      box-sizing: border-box;
    }

    select:focus, input:focus {
      outline: 2px solid var(--md-sys-color-primary);
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

    .show-pin-btn {
      background: transparent;
      color: var(--md-sys-color-primary);
      margin-top: 8px;
      padding: 8px;
    }
  `;

  async connectedCallback() {
    super.connectedCallback();
    
    // Check if user is already authenticated
    try {
      const status = await authApi.getStatus();
      if (!status.setupComplete) {
        // Redirect to setup if not complete
        window.location.href = '/setup';
        return;
      }
    } catch (e) {
      console.warn('Auth status check failed:', e);
    }
    
    await this.loadProfiles();
  }

  async loadProfiles() {
    try {
      const profiles = await authApi.getProfiles();
      this.profiles = profiles;
      if (profiles.length > 0) {
        this.selectedProfile = profiles[0].name;
      }
    } catch (e: any) {
      this.error = 'Failed to load profiles';
    }
  }

  getProfileOptions(): SelectOption[] {
    return this.profiles.map(profile => ({
      value: profile.name,
      label: profile.name
    }));
  }

  async handleLogin() {
    if (!this.selectedProfile || this.pin.length < 4) {
      this.error = 'Please select a profile and enter your PIN';
      return;
    }

    this.loading = true;
    this.error = '';

    try {
      await authApi.login(this.selectedProfile, this.pin);
      // Successful login - redirect will be handled by router
      window.location.href = '/';
    } catch (e: any) {
      this.loading = false;
      if (e.message.includes('429') || e.message.includes('Rate limit')) {
        this.rateLimited = true;
        this.retryAfter = 60;
        this.startCountdown();
        this.error = `Too many attempts. Try again in ${this.retryAfter} seconds.`;
      } else {
        this.error = e.message || i18n.t('auth.login.invalidPin');
      }
      this.pin = '';
    }
  }

  startCountdown() {
    const interval = setInterval(() => {
      this.retryAfter--;
      if (this.retryAfter <= 0) {
        this.rateLimited = false;
        clearInterval(interval);
      } else {
        this.error = `Too many attempts. Try again in ${this.retryAfter} seconds.`;
      }
    }, 1000);
  }

  handlePinInput(e: Event, index: number) {
    const input = e.target as HTMLInputElement;
    const value = input.value;

    if (!/^\d*$/.test(value)) {
      input.value = '';
      return;
    }

    if (value && index < 5) {
      const nextInput = this.shadowRoot?.querySelectorAll('.pin-digit')[index + 1] as HTMLInputElement;
      nextInput?.focus();
    }

    this.pin = Array.from(this.shadowRoot?.querySelectorAll('.pin-digit') || [])
      .map((input: any) => input.value)
      .join('');

    if (this.pin.length === 6 && index === 5) {
      this.handleLogin();
    }
  }

  handlePinKeydown(e: KeyboardEvent, index: number) {
    if (e.key === 'Backspace') {
      const input = e.target as HTMLInputElement;
      if (!input.value && index > 0) {
        const prevInput = this.shadowRoot?.querySelectorAll('.pin-digit')[index - 1] as HTMLInputElement;
        prevInput?.focus();
      }
    }
  }

  render() {
    return html`
      <div class="login-card">
        <h1>${i18n.t('auth.login.title')}</h1>

        <div class="form-field">
          <label>${i18n.t('auth.login.profile')}</label>
          <filterable-select
            .value="${this.selectedProfile}"
            .options="${this.getProfileOptions()}"
            .placeholder="${i18n.t('auth.login.profile')}"
            @change="${(e: CustomEvent) => this.selectedProfile = e.detail.value}">
          </filterable-select>
        </div>

        <div class="form-field">
          <label>${i18n.t('auth.login.pin')}</label>
          <div class="pin-container">
            ${[0, 1, 2, 3, 4, 5].map(i => html`
              <input 
                type="${this.showPin ? 'text' : 'password'}"
                inputmode="numeric"
                maxlength="1"
                class="pin-digit"
                @input=${(e: Event) => this.handlePinInput(e, i)}
                @keydown=${(e: KeyboardEvent) => this.handlePinKeydown(e, i)}
              />
            `)}
          </div>
          <button class="show-pin-btn" @click=${() => this.showPin = !this.showPin}>
            ${this.showPin ? i18n.t('auth.login.hidePin') : i18n.t('auth.login.showPin')}
          </button>
        </div>

        ${this.error ? html`<div class="error">${this.error}</div>` : ''}

        <button @click=${this.handleLogin} ?disabled=${this.loading || this.rateLimited}>
          ${this.loading ? i18n.t('auth.login.loggingIn') : i18n.t('auth.login.submit')}
        </button>
      </div>
    `;
  }
}
