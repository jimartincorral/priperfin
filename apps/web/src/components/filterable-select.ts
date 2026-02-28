import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

export interface SelectOption {
  value: string;
  label: string;
  icon?: string;
  indent?: number;
}

@customElement('filterable-select')
export class FilterableSelect extends LitElement {
  @property({ type: String }) value = '';
  @property({ type: Array }) options: SelectOption[] = [];
  @property({ type: String }) placeholder = 'Select...';
  @property({ type: Boolean }) disabled = false;
  @property({ type: String }) width = '100%';
  @property({ type: Boolean }) compact = false; // For inline table editing

  @state() private isOpen = false;
  @state() private filterText = '';
  @state() private focusedIndex = -1;
  @state() private dropdownStyle = '';
  @state() private openUpward = false;

  static styles = css`
    :host {
      display: inline-block;
      position: relative;
      width: 100%;
    }

    .select-container {
      width: 100%;
      position: relative;
    }

    .select-trigger {
      width: 100%;
      padding: 12px;
      border: 1px solid var(--md-sys-color-outline);
      border-radius: var(--md-sys-shape-corner-small);
      background: var(--md-sys-color-surface);
      color: var(--md-sys-color-on-surface);
      cursor: pointer;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font: var(--md-sys-typescale-body-medium);
      box-sizing: border-box;
    }

    :host([compact]) .select-trigger {
      padding: 4px 8px;
      border: none;
      border-radius: 0;
      background: transparent;
    }

    :host([compact]) .select-trigger:focus {
      outline: none;
      border-bottom: 2px solid var(--md-sys-color-primary);
    }

    .select-trigger:focus {
      outline: 2px solid var(--md-sys-color-primary);
      outline-offset: 2px;
    }

    .select-trigger.disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .select-trigger.open {
      border-bottom-left-radius: 0;
      border-bottom-right-radius: 0;
      border-bottom-color: transparent;
    }

    .arrow {
      margin-left: 8px;
      transition: transform 0.2s;
    }

    .arrow.open {
      transform: rotate(180deg);
    }

    .dropdown {
      background: var(--md-sys-color-surface);
      border: 1px solid var(--md-sys-color-outline);
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
      z-index: 1000;
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }

    .dropdown.open-down {
      border-top: none;
      border-bottom-left-radius: var(--md-sys-shape-corner-small);
      border-bottom-right-radius: var(--md-sys-shape-corner-small);
    }

    .dropdown.open-up {
      border-bottom: none;
      border-top-left-radius: var(--md-sys-shape-corner-small);
      border-top-right-radius: var(--md-sys-shape-corner-small);
    }

    .filter-input {
      padding: 8px 12px;
      border: none;
      border-bottom: 1px solid var(--md-sys-color-outline-variant);
      background: var(--md-sys-color-surface-container);
      color: var(--md-sys-color-on-surface);
      font: var(--md-sys-typescale-body-medium);
      outline: none;
      position: sticky;
      top: 0;
      z-index: 1;
    }

    .filter-input:focus {
      border-bottom-color: var(--md-sys-color-primary);
    }

    .options-list {
      overflow-y: auto;
    }

    .option {
      padding: 12px;
      cursor: pointer;
      color: var(--md-sys-color-on-surface);
      display: flex;
      align-items: center;
    }

    .option:hover,
    .option.focused {
      background: var(--md-sys-color-surface-container);
    }

    .option.selected {
      background: var(--md-sys-color-primary-container);
      color: var(--md-sys-color-on-primary-container);
      font-weight: 500;
    }

    .option-icon {
      margin-right: 8px;
    }

    .no-results {
      padding: 12px;
      color: var(--md-sys-color-on-surface-variant);
      text-align: center;
      font-style: italic;
    }

    .overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      z-index: 999;
    }
  `;

  private get selectedOption(): SelectOption | undefined {
    return this.options.find(opt => opt.value === this.value);
  }

  private get filteredOptions(): SelectOption[] {
    if (!this.filterText) return this.options;
    
    const lowerFilter = this.filterText.toLowerCase();
    return this.options.filter(opt => 
      opt.label.toLowerCase().includes(lowerFilter) ||
      opt.value.toLowerCase().includes(lowerFilter)
    );
  }

  private toggleDropdown() {
    if (this.disabled) return;
    this.isOpen = !this.isOpen;
    if (this.isOpen) {
      this.filterText = '';
      this.focusedIndex = -1;
      this.updateDropdownPosition();
      window.addEventListener('resize', this.handleViewportChange);
      window.addEventListener('scroll', this.handleViewportChange, true);
      // Focus the filter input after render
      this.updateComplete.then(() => {
        const input = this.shadowRoot?.querySelector('.filter-input') as HTMLInputElement;
        input?.focus();
      });
    } else {
      this.cleanupViewportListeners();
    }
  }

  private closeDropdown() {
    this.isOpen = false;
    this.filterText = '';
    this.focusedIndex = -1;
    this.cleanupViewportListeners();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.cleanupViewportListeners();
  }

  private cleanupViewportListeners() {
    window.removeEventListener('resize', this.handleViewportChange);
    window.removeEventListener('scroll', this.handleViewportChange, true);
  }

  private handleViewportChange = () => {
    if (this.isOpen) {
      this.updateDropdownPosition();
    }
  };

  private updateDropdownPosition() {
    const trigger = this.shadowRoot?.querySelector('.select-trigger') as HTMLElement | null;
    if (!trigger) return;

    const rect = trigger.getBoundingClientRect();
    const viewportPadding = 8;
    const preferredHeight = 300;
    const minHeight = 160;
    const spaceBelow = window.innerHeight - rect.bottom - viewportPadding;
    const spaceAbove = rect.top - viewportPadding;

    const shouldOpenUp = spaceBelow < 220 && spaceAbove > spaceBelow;
    const availableHeight = shouldOpenUp ? spaceAbove : spaceBelow;
    const maxHeight = Math.max(minHeight, Math.min(preferredHeight, availableHeight));

    const width = Math.min(rect.width, window.innerWidth - viewportPadding * 2);
    const left = Math.max(
      viewportPadding,
      Math.min(rect.left, window.innerWidth - width - viewportPadding),
    );
    const top = shouldOpenUp ? rect.top - maxHeight : rect.bottom;

    this.openUpward = shouldOpenUp;
    this.dropdownStyle = `position: fixed; left: ${left}px; top: ${top}px; width: ${width}px; max-height: ${maxHeight}px;`;
  }

  private selectOption(option: SelectOption) {
    this.value = option.value;
    this.closeDropdown();
    
    // Dispatch change event
    this.dispatchEvent(new CustomEvent('change', {
      detail: { value: option.value },
      bubbles: true,
      composed: true
    }));
  }

  private handleFilterInput(e: Event) {
    const input = e.target as HTMLInputElement;
    this.filterText = input.value;
    this.focusedIndex = -1;
  }

  private handleKeyDown(e: KeyboardEvent) {
    if (!this.isOpen) {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
        e.preventDefault();
        this.toggleDropdown();
      }
      return;
    }

    const filtered = this.filteredOptions;

    switch (e.key) {
      case 'Escape':
        e.preventDefault();
        this.closeDropdown();
        break;
      
      case 'ArrowDown':
        e.preventDefault();
        this.focusedIndex = Math.min(this.focusedIndex + 1, filtered.length - 1);
        this.scrollToFocused();
        break;
      
      case 'ArrowUp':
        e.preventDefault();
        this.focusedIndex = Math.max(this.focusedIndex - 1, 0);
        this.scrollToFocused();
        break;
      
      case 'Enter':
        e.preventDefault();
        if (this.focusedIndex >= 0 && this.focusedIndex < filtered.length) {
          this.selectOption(filtered[this.focusedIndex]);
        }
        break;
    }
  }

  private scrollToFocused() {
    this.updateComplete.then(() => {
      const focused = this.shadowRoot?.querySelector('.option.focused');
      focused?.scrollIntoView({ block: 'nearest' });
    });
  }

  render() {
    const selected = this.selectedOption;
    const filtered = this.filteredOptions;

    return html`
      <div class="select-container" style="width: ${this.width}">
        <div
          class="select-trigger ${this.isOpen ? 'open' : ''} ${this.disabled ? 'disabled' : ''}"
          @click=${this.toggleDropdown}
          @keydown=${this.handleKeyDown}
          tabindex=${this.disabled ? -1 : 0}
          role="combobox"
          aria-expanded=${this.isOpen}
          aria-haspopup="listbox"
        >
          <span>
            ${selected ? html`
              ${selected.icon ? html`<span class="option-icon">${selected.icon}</span>` : ''}
              ${selected.label}
            ` : this.placeholder}
          </span>
          <span class="arrow ${this.isOpen ? 'open' : ''}">▼</span>
        </div>

        ${this.isOpen ? html`
          <div class="overlay" @click=${this.closeDropdown}></div>
          <div
            class="dropdown ${this.openUpward ? 'open-up' : 'open-down'}"
            style=${this.dropdownStyle}
          >
            <input
              class="filter-input"
              type="text"
              placeholder="Type to filter..."
              .value=${this.filterText}
              @input=${this.handleFilterInput}
              @keydown=${this.handleKeyDown}
            />
            <div class="options-list" role="listbox">
              ${filtered.length === 0 ? html`
                <div class="no-results">No results found</div>
              ` : filtered.map((option, index) => {
                const isSelected = option.value === this.value;
                const isFocused = index === this.focusedIndex;
                const indent = option.indent || 0;
                
                return html`
                  <div
                    class="option ${isSelected ? 'selected' : ''} ${isFocused ? 'focused' : ''}"
                    role="option"
                    aria-selected=${isSelected}
                    style="padding-left: ${12 + (indent * 16)}px"
                    @click=${() => this.selectOption(option)}
                    @mouseenter=${() => this.focusedIndex = index}
                  >
                    ${option.icon ? html`<span class="option-icon">${option.icon}</span>` : ''}
                    <span>${option.label}</span>
                  </div>
                `;
              })}
            </div>
          </div>
        ` : ''}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'filterable-select': FilterableSelect;
  }
}
