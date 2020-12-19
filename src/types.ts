import { LovelaceCardConfig, LovelaceCardEditor } from 'custom-card-helpers';

export interface IconTime {
  percent: number;
  icon: string;
}

export interface TimerCardConfig extends LovelaceCardConfig {
  type: string;
  entity: string;
  name?: string | boolean;
  icons?: Array<IconTime>;
  loop_duration?: number;
}

declare global {
  interface Window {
    customCards: Array<object>;
  }
  interface HTMLElementTagNameMap {
    'timer-card-editor': LovelaceCardEditor;
  }
}
