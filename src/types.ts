import { LovelaceCardConfig, LovelaceCardEditor } from 'custom-card-helpers';

export interface IconTime {
  percent: number;
  icon: string;
}

export interface Timer {
  remaining: number;
  duration: string;
  startTime: number;
  loopDuration: number;
  icon?: string;
  message: string;
  active: boolean;
}

export interface GoogleTimer {
  timer_id: string;
  fire_time: number;
  local_time: string;
  local_time_iso: string;
  duration: string;
  status: string;
  label?: string;
}

export interface AlexaTimer {
  alarmTime: number;
  createdDate: number;
  triggerTime: number;
  deviceName?: string;
  remainingTime: number;
  status: string;
}

export interface TimerCardConfig extends LovelaceCardConfig {
  type: string;
  entity?: string;
  entities?: string[];
  name?: string | boolean;
  icons?: IconTime[];
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
