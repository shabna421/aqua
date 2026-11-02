export interface WaterEntry {
  id: string;
  amountMl: number;
  timestamp: number;
  source: 'quick-add' | 'reminder-prompt' | 'custom';
}

export interface DailyHydrationLog {
  date: string; // YYYY-MM-DD
  totalMl: number;
  goalMl: number;
  entries: WaterEntry[];
  completed: boolean;
}
