import { LovelaceCardConfig } from 'custom-card-helpers';

export interface TimerCardConfig extends LovelaceCardConfig {
  type: string;
  entity: string;
  name?: string;
  icon?: string;
}

declare global {
  interface Window {
    customCards: Array<object>;
  }
}
