export interface ReminderSettings {
  enabled: boolean;
  startTime: string; // '08:00'
  endTime: string; // '22:00'
  intervalMinutes: number; // 30, 45, 60, 90, 120
  snoozeDurationMinutes: number; // 15, 30, 45
  soundEnabled: boolean;
  sipAmountMl: number; // amount added when clicking "Drank" on Aqua prompt, default 250ml
  customIntervals?: number[]; // custom frequency options added by user
  customSnoozes?: number[]; // custom snooze duration options added by user
  customSips?: number[]; // custom sip amount options added by user
}

export interface NextReminderInfo {
  timestamp: number;
  formattedTime: string;
  isSnoozed: boolean;
  isActiveWindow: boolean;
}
