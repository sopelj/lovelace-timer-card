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
  durationToSeconds,
  stateIcon,
  HomeAssistant,
  LovelaceCardEditor,
  timerTimeRemaining,
} from 'custom-card-helpers';

import {AlexaTimer, GoogleTimer, Timer, TimerCardConfig} from './types';

import './editor';


(window as Window).customCards = (window as Window).customCards || [];
(window as Window).customCards.push({
  type: 'timer-card',
  name: 'Timer Card',
  description: 'A widget to display timers in real time in lovelace',
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
  @internalProperty() private icons: Array<[number, string]> = [];
  @internalProperty() private timers: Timer[] = [];

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
        return [x.percent || 0, x.icon];
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
        this._updateTimers(stateObj);
        this._startInterval();
      } else if (!stateObj) {
        this.timers = [];
        this._clearInterval();
      }
    }
  }

  private _updateTimers(stateObj): void {
    let duration;
    this.timers = [];

    if (stateObj.attributes.timers) {
      // Google Home Timer(s) (Can be multiple...)
      const googleTimers: GoogleTimer[] = stateObj.attributes.timers || [];
      for (const timer of googleTimers) {
        duration = durationToSeconds(timer.duration);
        this.timers.push({
          duration: timer.duration,
          remaining: duration,
          loopDuration: this.config.loop_duration ?? duration,
          startTime: timer.fire_time - duration,
          message: timer.status,
          active: timer.status == 'set',
        });
      }
    } else if (stateObj.attributes.sorted_active) {
      // This is an Alexa Timer
      const now = new Date().getTime();
      const alexaTimers: [string, AlexaTimer][] = stateObj.attributes.sorted_active || [];
      for (const timerInfo of alexaTimers) {
        const timer = timerInfo[1];
        duration = (now - timer.triggerTime) + timer.remainingTime;
        this.timers.push({
          duration: duration,
          loopDuration: this.config.loop_duration ?? duration,
          remaining: duration,
          startTime: timer.triggerTime,
          message: timer.status,
          active: timer.status == 'ON',
        });
      }
    } else {
      // Standard Home Assistant Timer
      const active = stateObj.state == "active";
      const remaining = active ? timerTimeRemaining(stateObj) : 0;
      duration = durationToSeconds(stateObj.attributes.duration);
      this.timers.push({
        duration: duration,
        loopDuration: this.config.loop_duration ?? duration,
        remaining: remaining,
        startTime: Math.round(Date.now() / 1000),
        message: stateObj.state,
        active: active,
      });
    }
  }

  private _clearInterval(): void {
    if (this._handle) {
      window.clearInterval(this._handle);
      this._handle = undefined;
    }
  }

  private _startInterval(): void {
    this._clearInterval();
    this._updateRemaining();
    if (Object.values(this.timers).some(t => t.active)) {
      this._handle = window.setInterval(() => this._updateRemaining(), 1000);
    }
  }

  private _updateRemaining(): void {
    const timers: Timer[] = [];
    for (const timer of this.timers) {
      const remaining = this._timerTimeRemaining(timer);
      timer.icon = this._updateIcon(remaining, timer.loopDuration);
      timer.message = secondsToDuration(remaining) || 'Done';
      if (remaining) {
        timers.push(timer);
      }
    }
    this.timers = [...timers];
  }

  private _timerTimeRemaining(timer: Timer): number {
    let timeRemaining = 0;
    if (timer.active) {
      const now = Math.round(Date.now() / 1000);
      timeRemaining = Math.max(timer.remaining - (now - timer.startTime), 0);
    }
    return timeRemaining;
  }

  private _updateIcon(remaining: number, loopDuration: number): string {
    let icon = this.icons[0][1];
    if (this.icons?.length === 1 || remaining === -1) {
      icon = this.icons[this.icons.length - 1][1];
    }
    const currentPercent = Math.round(
      (1 - (remaining % loopDuration) / loopDuration) * 100
    );
    for (const [percent, icon] of this.icons) {
      if (percent - 1 < currentPercent) {
        return icon;
      }
    }
    return icon;
  }

  protected render(): TemplateResult | void {
    return html`
      <ha-card .header="${this.config.name}">
        ${this.timers.length ? 
          this.timers.map(timer => html`
            <div class="timer">
              ${timer.icon
                ? html`
                    <ha-icon class="timer__icon" icon="${timer.icon}"></ha-icon>
                  `
                : ''}
              <div class="timer__message">${timer.message}</div>
            </div>
          `) : html`<div class="no-timers">No active timers</div>`
        }
      </ha-card>
    `;
  }

  static get styles(): CSSResult {
    return css`
      .type-custom-timer-card {
        display: flex;
        align-items: center;
        justify-content: space-evenly;
        flex-wrap: wrap;
        padding-bottom: 1rem;
      }

      .card-header {
        order: -1;
        flex: 0 100%;
        padding-bottom: 0;
      }
      
      .timer {
        display: flex;
        flex-direction: column;
        flex-wrap: wrap;
        align-items: center;
        padding: 1rem;
      }

      .timer__icon {
        --mdc-icon-size: 80px;
      }

      .timer__message {
        padding-top: 1rem;
        font-size: 28px;
      }

      .timer__message:first-letter {
        text-transform: capitalize;
      }

      .no-timers {
        padding-top: 1rem;
      }
    `;
  }
}
