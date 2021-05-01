/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/camelcase */
import {
  LitElement,
  customElement,
  property,
  internalProperty,
  html,
  TemplateResult,
  css,
  CSSResult,
} from 'lit-element';
import { HomeAssistant, LovelaceCardEditor, fireEvent } from 'custom-card-helpers';

import { TimerCardConfig } from './types';

@customElement('timer-card-editor')
export class TimerCardEditor extends LitElement implements LovelaceCardEditor {
  @property({ attribute: false }) public hass?: HomeAssistant;
  @internalProperty() private _config?: TimerCardConfig;

  public setConfig(config: TimerCardConfig): void {
    this._config = config;
  }

  public configChanged(newConfig: TimerCardConfig): void {
    if (!this._config || !this.hass) {
      return;
    }
    fireEvent(this, 'config-changed', { config: newConfig });
  }

  get _entity(): string {
    return this._config?.entity || '';
  }

  get _name(): string | boolean {
    const name = this._config?.name;
    return name === false || name === 'false' ?  false : this._config?.name || '';
  }

  private _addIconRow(): void {
    const icons = [...this._config?.icons || [], {'icon': 'mdi:timer', 'percent': 0}];
    this._updateConfig('icons', icons);
  }

  private _removeIconRow(ev): void {
    const target = ev.target;
    if (target?.iconIndex && this._config?.icons) {
      const icons = this._config?.icons.filter((_, i) => i !== target?.iconIndex);
      this._updateConfig('icons', icons);
    }
  }

  private _updateIconRow(ev): void {
    const target = ev.target;
    let value = target?.value;
    const field = target?.configValue;
    if (field === 'percent') {
      value = parseInt(value);
      if (isNaN(value)) {
        value = 0;
      }
    }
    const index = target?.iconIndex || 0;
    const icons = [...this._config?.icons || []];
    icons[index] = {
      ... icons[index],
      [field]: value,
    };
    this._updateConfig('icons', icons);
  }

  private _valueChanged(ev): void {
    if (!this._config || !this.hass) {
      return;
    }
    const target = ev.target;
    let value = target.value;
    if (value === 'true' || value === 'false') {
      value = value === 'true';
    }

    if (target.checked !== undefined) {
      value = target.checked;
    }

    if (this[`_${target.configValue}`] === value) {
      return;
    }
    this._updateConfig(target.configValue, value);
  }

  private _updateConfig(key: string, value: any): void {
    if (key && this._config) {
      if (value === '') {
        delete this._config[key];
      } else {
        this._config = {
          ...this._config,
          [key]: value,
        };
      }
    }
    fireEvent(this, 'config-changed', { config: this._config });
  }


  protected render(): TemplateResult | void {
    if (!this.hass) {
      return html``;
    }

    // Filter only timers
    const entities = Object.keys(this.hass.states).filter(eid => (
      eid.substr(0, eid.indexOf('.')) === 'timer' || 
      eid.endsWith('_timers') || 
      eid.endsWith('_next_timer')
    ));
    const icons = this._config?.icons || [];
    return html`
      <div class="card-config">
        <div class="options">
          <div class="option">
              <paper-input
                label="Name (Optional)"
                .value=${this._name}
                .configValue=${'name'}
                @value-changed=${this._valueChanged}
              ></paper-input>
          </div>
          <div class="values">
            <paper-dropdown-menu
              label="Entity (Required)"
              @value-changed=${this._valueChanged}
              .configValue=${'entity'}
            >
              <paper-listbox slot="dropdown-content" .selected=${entities.indexOf(this._entity)}>
                ${entities.map(entity => {
                  return html`
                    <paper-item>${entity}</paper-item>
                  `;
                })}
              </paper-listbox>
            </paper-dropdown-menu>
          </div>
          <div class="icons">
          <h2>Icons</h2>
          ${icons.map((icon, index) => html`
            <div class="icon-row">
              <ha-icon class="icon" icon="${icon.icon}"></ha-icon>
              <paper-input
                  label="Icon"
                  .value=${icon.icon}
                  .iconIndex=${index}
                  .configValue=${'icon'}
                  @value-changed=${this._updateIconRow}
              ></paper-input>
              <paper-input
                  label="Percent"
                  class="percent-input"
                  .value=${icon.percent}
                  .iconIndex=${index}
                  .configValue=${'percent'}
                  @value-changed=${this._updateIconRow}
              ></paper-input>
              <ha-icon 
                icon="mdi:close" ç
                @click=${this._removeIconRow} 
                .iconIndex=${index} 
                title="Remove" 
                class="remove-icon-row"
              ></ha-icon>
            </div>
          `)}
            <paper-button @click="${this._addIconRow}" class="add-icon-row">
              <ha-icon icon="mdi:plus"></ha-icon>Add another
            </paper-button>
          </div>
        </div>
      </div>
    `;
  }

  static get styles(): CSSResult {
    return css`
      .options {
        display: grid;
      }

      .option {
        display: flex;
        margin: 1rem 0;
        align-items: center;
      }

      .option .label {
        margin: 0 1rem;
      }

      .option .help {
        color: var(--secondary-text-color);
      }

      .icon-row {
        display: flex;
        align-items: center;
      }

      .icon-row paper-input {
        margin-right: 1rem;
      }

      .icon-row .percent-input {
        max-width: 6rem;
      }

      .icon-row ha-icon {
        padding: 1em .5em 0 0;
      }

      .add-icon-row {
        margin-top: 1rem;
        display: block;
        cursor: pointer;
      }

      .remove-icon-row {
        cursor: pointer;
      }
    `;
  }
}
