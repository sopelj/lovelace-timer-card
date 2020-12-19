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
    return this._config?.name || '';
  }

  protected render(): TemplateResult | void {
    if (!this.hass) {
      return html``;
    }

    // Filter only timers
    const entities = Object.keys(this.hass.states).filter(eid => eid.substr(0, eid.indexOf('.')) === 'timer');

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
    `;
  }

  private _valueChanged(ev): void {
    if (!this._config || !this.hass) {
      return;
    }
    const target = ev.target;
    let value = target.value;
    if (value === 'true' || value == 'false') {
      value = value === 'true';
    }
    if (this[`_${target.configValue}`] === value) {
      return;
    }
    if (target.configValue) {
      if (value === '') {
        delete this._config[target.configValue];
      } else {
        this._config = {
          ...this._config,
          [target.configValue]: target.checked !== undefined ? target.checked : value,
        };
      }
    }
    fireEvent(this, 'config-changed', { config: this._config });
  }
}
