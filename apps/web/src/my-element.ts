import { LitElement, css, html } from 'lit'
import { customElement, property } from 'lit/decorators.js'

@customElement('my-element')
export class MyElement extends LitElement {
  @property()
  message = 'Loading...'

  async firstUpdated() {
    try {
      const response = await fetch('/api')
      const data = await response.json()
      this.message = `${data.message} at ${data.timestamp}`
    } catch (e) {
      this.message = 'Error connecting to API'
    }
  }

  render() {
    return html`
      <div class="container">
        <h1>Personal Finance Tracker</h1>
        <p>${this.message}</p>
      </div>
    `
  }

  static styles = css`
    :host {
      display: block;
      height: 100vh;
      width: 100vw;
    }
    .container {
      padding: 2rem;
      max-width: 800px;
      margin: 0 auto;
    }
  `
}

declare global {
  interface HTMLElementTagNameMap {
    'my-element': MyElement
  }
}
