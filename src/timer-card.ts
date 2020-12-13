import { LitElement, html, customElement, property, CSSResult, PropertyValues, TemplateResult, css } from 'lit-element';
import { secondsToDuration, timerTimeRemaining, stateIcon, HomeAssistant } from 'custom-card-helpers';
import { HassEntity } from 'home-assistant-js-websocket';

import { TimerCardConfig } from './types';

(window as Window).customCards = (window as Window).customCards || [];
(window as Window).customCards.push({
  type: 'timer-card',
  name: 'Timer Card',
  description: 'A simple widget to display a timer in lovelace',
});

@customElement('timer-card')
export class TimerCard extends LitElement {
  private _handle?: number;

  @property() public message!: string;
  @property() public hass!: HomeAssistant;
  @property() private _icon = 'mdi:timer';
  @property() private _config!: TimerCardConfig;

  public connectedCallback(): void {
    super.connectedCallback();
    this._handle = window.setInterval(this.requestUpdate.bind(this), 500);
  }

  public disconnectedCallback(): void {
    clearInterval(this._handle);
  }

  public setConfig(config: TimerCardConfig): void {
    if (!config || !config.entity) {
      throw new Error('Invalid configuration');
    }
    this._config = config;
  }

  protected updated(changedProps: PropertyValues): void {
    super.updated(changedProps);

    if (changedProps.has('hass')) {
      const stateObj = this.hass.states[this._config.entity];
      const oldHass = changedProps.get('hass') as this['hass'];
      const oldStateObj = oldHass ? oldHass.states[this._config.entity] : undefined;
      this._icon = this._config.icon || stateIcon(stateObj);

      if (oldStateObj !== stateObj) {
        this._startInterval(stateObj);
      } else if (!stateObj) {
        this._clearInterval();
      }
    }
  }

  private _clearInterval(): void {
    if (this._handle) {
      window.clearInterval(this._handle);
      this._handle = undefined;
    }
  }

  private _startInterval(stateObj: HassEntity): void {
    this._clearInterval();

    if (stateObj.state === 'active') {
      this._updateRemaining(stateObj);
      this._handle = window.setInterval(() => this._updateRemaining(stateObj), 1000);
    } else {
      this.message = stateObj.state;
    }
  }

  private _updateRemaining(stateObj: HassEntity): void {
    this.message = secondsToDuration(timerTimeRemaining(stateObj));
  }

  protected render(): TemplateResult | void {
    return html`
      <ha-card .header="${this._config.name}">
        <div class="timer">
          <ha-icon class="timer__icon" icon="${this._icon}"></ha-icon>
          <div class="timer__message">${this.message}</div>
        </div>
      </ha-card>
    `;
  }

  static get styles(): CSSResult {
    return css`
      .timer {
        display: flex;
        flex-direction: column;
        flex-wrap: wrap;
        align-items: center;
        padding: 12px 1rem 1rem;
      }

      .timer__icon {
        transform: scale(5);
        margin-bottom: 48px;
      }

      .timer__message {
        padding-top: 1rem;
        font-size: 28px;
      }

      .timer__message:first-letter {
        text-transform: capitalize;
      }
    `;
  }
}
