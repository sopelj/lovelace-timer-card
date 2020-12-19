import {
  LitElement,
  html,
  customElement,
  property,
  CSSResult,
  TemplateResult,
  css,
  internalProperty,
  PropertyValues,
} from 'lit-element';

import {
  secondsToDuration,
  timerTimeRemaining,
  durationToSeconds,
  stateIcon,
  HomeAssistant,
  LovelaceCardEditor,
} from 'custom-card-helpers';

import { HassEntity } from 'home-assistant-js-websocket';

import { TimerCardConfig } from './types';

import './editor';


(window as Window).customCards = (window as Window).customCards || [];
(window as Window).customCards.push({
  type: 'timer-card',
  name: 'Timer Card',
  description: 'A simple widget to display a timer in lovelace',
});

@customElement('timer-card')
export class TimerCard extends LitElement {
  public static async getConfigElement(): Promise<LovelaceCardEditor> {
    return document.createElement('timer-card-editor');
  }

  public static getStubConfig(): object {
    return {
      entity: '',
      icons: [{icon: 'mdi:timer', 'percent': 0}]
    };
  }

  @property({ attribute: false }) public hass!: HomeAssistant;
  
  @internalProperty() private config!: TimerCardConfig;
  @internalProperty() private message?: string;
  @internalProperty() private icon?: string;
  @internalProperty() private icons: Array<[number, string]> = [];
  @internalProperty() private duration = 0;
  @internalProperty() private iconLoopDuration = 1;

  private _handle?: number = 0;

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
    if (config.icons && config.icons.length >= 1) {
      this.icons = config.icons.map((x): [number, string] => {
        return [x.percent || 0, x.icon]
      }).sort((a, b) => (a[0] > b[0]) ? -1 : 1);
    } else {
      this.icons = [[0, 'mdi:timer']];
    }
    this.config = {
      ...config,
      name: config.name === false ? undefined : config.name,
    };
  }

  protected updated(changedProps: PropertyValues): void {
    super.updated(changedProps);

    if (changedProps.has('hass')) {
      const stateObj = this.hass.states[this.config.entity];
      const oldHass = changedProps.get('hass') as this['hass'];
      const oldStateObj = oldHass ? oldHass.states[this.config.entity] : undefined;
      if (! this.icons || this.icons.length === 0) {
        this.icons = [[0, stateIcon(this.hass.states[this.config.entity])]];
      }

      if (oldStateObj !== stateObj) {
        this.duration = durationToSeconds(stateObj.attributes.duration);
        this.iconLoopDuration = this.config.loop_duration ?? this.duration;
        this._startInterval(stateObj);
      } else if (!stateObj) {
        this.duration = 0;
        this.iconLoopDuration = 0;
        this._updateIcon(-1);
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
      this._updateIcon(-1);
      this.message = stateObj.state;
    }
  }

  private _updateRemaining(stateObj: HassEntity): void {
    const remaining = timerTimeRemaining(stateObj);
    this._updateIcon(remaining);
    this.message = secondsToDuration(remaining);
  }

  private _updateIcon(remaining: number): void {
    if (this.icons?.length === 1 || remaining === -1) {
      this.icon = this.icons[this.icons.length - 1][1];
    }
    const currentPercent = Math.round(
      (1 - (remaining % this.iconLoopDuration) / this.iconLoopDuration) * 100
    );
    for (const [percent, icon] of this.icons) {
      if (percent - 1 < currentPercent) {
        this.icon = icon;
        return;
      }
    }
    this.icon = this.icons[0][1];
  }

  protected render(): TemplateResult | void {
    return html`
      <ha-card .header="${this.config.name}">
        <div class="timer">
          ${this.icon
            ? html`
                <ha-icon class="timer__icon" icon="${this.icon}"></ha-icon>
              `
            : ''}
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
