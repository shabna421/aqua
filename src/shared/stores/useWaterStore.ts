import { create } from 'zustand';
import { WaterEntry, DailyHydrationLog } from '@/features/water/types/water';
import { ReminderSettings } from '@/features/reminders/types/reminder';
import { MascotAnimationState } from '@/features/character/types/character';
import { getTodayKey, getLast7DaysKeys } from '@/shared/lib/dateUtils';
import { playWaterChime, playDrinkSound, playGoalCelebration } from '@/shared/lib/audioSound';
import confetti from 'canvas-confetti';

interface WaterStoreState {
  dailyGoalMl: number;
  historyLogs: Record<string, DailyHydrationLog>;
  settings: ReminderSettings;
  snoozedUntilTimestamp: number | null;
  lastReminderTimestamp: number | null;
  mascotState: MascotAnimationState;
  customMascotImage: string | null;
  mascotScale: number; // 0.7 to 1.6 scale factor, default 1.0
  isTestWalk: boolean;

  // Actions
  getTodayLog: () => DailyHydrationLog;
  addWater: (amountMl: number, source?: 'quick-add' | 'reminder-prompt' | 'custom') => void;
  removeEntry: (id: string) => void;
  setDailyGoal: (goalMl: number) => void;
  updateSettings: (settings: Partial<ReminderSettings>) => void;
  setCustomMascotImage: (image: string | null) => void;
  setMascotScale: (scale: number) => void;
  resetMascotToDefault: () => void;
  addCustomInterval: (minutes: number) => void;
  removeCustomInterval: (minutes: number) => void;
  addCustomSnooze: (minutes: number) => void;
  removeCustomSnooze: (minutes: number) => void;
  addCustomSip: (ml: number) => void;
  removeCustomSip: (ml: number) => void;
  triggerReminder: (options?: { isTestWalk?: boolean; forceWalkIn?: boolean }) => void;
  setMascotState: (state: MascotAnimationState) => void;
  handleDrankReminder: () => void;
  handleSnoozeReminder: () => void;
  dismissMascot: () => void;
  resetToday: () => void;
}

const STORAGE_KEY = 'aqua_water_reminder_v1';

const DEFAULT_SETTINGS: ReminderSettings = {
  enabled: true,
  startTime: '08:00',
  endTime: '22:00',
  intervalMinutes: 60,
  snoozeDurationMinutes: 30,
  soundEnabled: true,
  sipAmountMl: 250,
};

// Seed initial history for a rich realistic experience if completely empty
function getInitialHistory(goalMl: number): Record<string, DailyHydrationLog> {
  const days = getLast7DaysKeys();
  const history: Record<string, DailyHydrationLog> = {};
  const sampleAmounts = [1750, 2000, 2250, 1500, 2000, 2500];

  days.slice(0, 6).forEach((day, index) => {
    const amount = sampleAmounts[index] || 1800;
    history[day.dateKey] = {
      date: day.dateKey,
      totalMl: amount,
      goalMl,
      entries: [
        {
          id: `seed-${day.dateKey}-1`,
          amountMl: amount,
          timestamp: Date.now() - (6 - index) * 86400000 + 36000000,
          source: 'quick-add',
        },
      ],
      completed: amount >= goalMl,
    };
  });

  return history;
}

function loadPersistedState(): {
  dailyGoalMl: number;
  historyLogs: Record<string, DailyHydrationLog>;
  settings: ReminderSettings;
  customMascotImage: string | null;
  mascotScale: number;
  snoozedUntilTimestamp: number | null;
  lastReminderTimestamp: number | null;
} {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      const snoozedUntil = typeof parsed.snoozedUntilTimestamp === 'number' && parsed.snoozedUntilTimestamp > Date.now()
        ? parsed.snoozedUntilTimestamp
        : null;

      return {
        dailyGoalMl: parsed.dailyGoalMl || 2000,
        historyLogs: parsed.historyLogs || {},
        settings: { ...DEFAULT_SETTINGS, ...(parsed.settings || {}) },
        customMascotImage: parsed.customMascotImage || null,
        mascotScale: typeof parsed.mascotScale === 'number' ? parsed.mascotScale : 1.0,
        snoozedUntilTimestamp: snoozedUntil,
        lastReminderTimestamp: typeof parsed.lastReminderTimestamp === 'number' ? parsed.lastReminderTimestamp : null,
      };
    }
  } catch (err) {
    console.error('Failed to load storage state:', err);
  }

  const goal = 2000;
  return {
    dailyGoalMl: goal,
    historyLogs: getInitialHistory(goal),
    settings: DEFAULT_SETTINGS,
    customMascotImage: null,
    mascotScale: 1.0,
    snoozedUntilTimestamp: null,
    lastReminderTimestamp: null,
  };
}

function persistState(state: {
  dailyGoalMl: number;
  historyLogs: Record<string, DailyHydrationLog>;
  settings: ReminderSettings;
  customMascotImage: string | null;
  mascotScale: number;
  snoozedUntilTimestamp?: number | null;
  lastReminderTimestamp?: number | null;
}) {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        dailyGoalMl: state.dailyGoalMl,
        historyLogs: state.historyLogs,
        settings: state.settings,
        customMascotImage: state.customMascotImage,
        mascotScale: state.mascotScale,
        snoozedUntilTimestamp: state.snoozedUntilTimestamp ?? null,
        lastReminderTimestamp: state.lastReminderTimestamp ?? null,
      })
    );
  } catch (e) {
    console.warn('Storage sync error:', e);
  }
}

const loaded = loadPersistedState();

export const useWaterStore = create<WaterStoreState>((set, get) => ({
  dailyGoalMl: loaded.dailyGoalMl,
  historyLogs: loaded.historyLogs,
  settings: loaded.settings,
  snoozedUntilTimestamp: loaded.snoozedUntilTimestamp,
  lastReminderTimestamp: loaded.lastReminderTimestamp,
  mascotState: 'hidden',
  customMascotImage: loaded.customMascotImage,
  mascotScale: loaded.mascotScale,
  isTestWalk: false,

  getTodayLog: () => {
    const todayKey = getTodayKey();
    const existing = get().historyLogs[todayKey];
    if (existing) return existing;

    return {
      date: todayKey,
      totalMl: 0,
      goalMl: get().dailyGoalMl,
      entries: [],
      completed: false,
    };
  },

  addWater: (amountMl: number, source = 'quick-add') => {
    const state = get();
    const todayKey = getTodayKey();
    const currentLog = state.getTodayLog();
    const previousTotal = currentLog.totalMl;
    const newTotal = previousTotal + amountMl;
    const wasCompleted = currentLog.completed;
    const isNowCompleted = newTotal >= currentLog.goalMl;

    const newEntry: WaterEntry = {
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      amountMl,
      timestamp: Date.now(),
      source,
    };

    const updatedLog: DailyHydrationLog = {
      ...currentLog,
      totalMl: newTotal,
      entries: [newEntry, ...currentLog.entries],
      completed: isNowCompleted,
    };

    const updatedHistory = {
      ...state.historyLogs,
      [todayKey]: updatedLog,
    };

    set({ historyLogs: updatedHistory });
    persistState({
      dailyGoalMl: state.dailyGoalMl,
      historyLogs: updatedHistory,
      settings: state.settings,
      customMascotImage: state.customMascotImage,
      mascotScale: state.mascotScale,
    });

    // Sound feedback
    if (state.settings.soundEnabled) {
      playDrinkSound();
    }

    // Celebration when reaching goal for first time today
    if (!wasCompleted && isNowCompleted) {
      setTimeout(() => {
        if (state.settings.soundEnabled) {
          playGoalCelebration();
        }
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#38BDF8', '#0EA5E9', '#0284C7', '#67E8F9', '#BAE6FD'],
        });
      }, 250);
    }
  },

  removeEntry: (id: string) => {
    const state = get();
    const todayKey = getTodayKey();
    const currentLog = state.getTodayLog();
    const target = currentLog.entries.find((e) => e.id === id);
    if (!target) return;

    const newTotal = Math.max(0, currentLog.totalMl - target.amountMl);
    const updatedLog: DailyHydrationLog = {
      ...currentLog,
      totalMl: newTotal,
      entries: currentLog.entries.filter((e) => e.id !== id),
      completed: newTotal >= currentLog.goalMl,
    };

    const updatedHistory = {
      ...state.historyLogs,
      [todayKey]: updatedLog,
    };

    set({ historyLogs: updatedHistory });
    persistState({
      dailyGoalMl: state.dailyGoalMl,
      historyLogs: updatedHistory,
      settings: state.settings,
      customMascotImage: state.customMascotImage,
      mascotScale: state.mascotScale,
    });
  },

  setDailyGoal: (goalMl: number) => {
    const state = get();
    const todayKey = getTodayKey();
    const currentLog = state.getTodayLog();

    const updatedLog: DailyHydrationLog = {
      ...currentLog,
      goalMl,
      completed: currentLog.totalMl >= goalMl,
    };

    const updatedHistory = {
      ...state.historyLogs,
      [todayKey]: updatedLog,
    };

    set({ dailyGoalMl: goalMl, historyLogs: updatedHistory });
    persistState({
      dailyGoalMl: goalMl,
      historyLogs: updatedHistory,
      settings: state.settings,
      customMascotImage: state.customMascotImage,
      mascotScale: state.mascotScale,
    });
  },

  updateSettings: (partial: Partial<ReminderSettings>) => {
    const state = get();
    const updated = { ...state.settings, ...partial };
    set({ settings: updated });
    persistState({
      dailyGoalMl: state.dailyGoalMl,
      historyLogs: state.historyLogs,
      settings: updated,
      customMascotImage: state.customMascotImage,
      mascotScale: state.mascotScale,
    });
  },

  setCustomMascotImage: (image: string | null) => {
    const state = get();
    set({ customMascotImage: image });
    persistState({
      dailyGoalMl: state.dailyGoalMl,
      historyLogs: state.historyLogs,
      settings: state.settings,
      customMascotImage: image,
      mascotScale: state.mascotScale,
    });
  },

  setMascotScale: (scale: number) => {
    const clamped = Math.max(0.6, Math.min(1.8, scale));
    const state = get();
    set({ mascotScale: clamped });
    persistState({
      dailyGoalMl: state.dailyGoalMl,
      historyLogs: state.historyLogs,
      settings: state.settings,
      customMascotImage: state.customMascotImage,
      mascotScale: clamped,
    });
  },

  resetMascotToDefault: () => {
    const state = get();
    set({ customMascotImage: null, mascotScale: 1.0 });
    persistState({
      dailyGoalMl: state.dailyGoalMl,
      historyLogs: state.historyLogs,
      settings: state.settings,
      customMascotImage: null,
      mascotScale: 1.0,
    });
  },

  addCustomInterval: (minutes: number) => {
    const state = get();
    const current = state.settings.customIntervals || [];
    if (!current.includes(minutes)) {
      const updated = {
        ...state.settings,
        customIntervals: [...current, minutes].sort((a, b) => a - b),
        intervalMinutes: minutes,
      };
      set({ settings: updated });
      persistState({
        dailyGoalMl: state.dailyGoalMl,
        historyLogs: state.historyLogs,
        settings: updated,
        customMascotImage: state.customMascotImage,
        mascotScale: state.mascotScale,
      });
    } else {
      state.updateSettings({ intervalMinutes: minutes });
    }
  },

  removeCustomInterval: (minutes: number) => {
    const state = get();
    const current = state.settings.customIntervals || [];
    const filtered = current.filter((m) => m !== minutes);
    const updated = {
      ...state.settings,
      customIntervals: filtered,
      intervalMinutes: state.settings.intervalMinutes === minutes ? 60 : state.settings.intervalMinutes,
    };
    set({ settings: updated });
    persistState({
      dailyGoalMl: state.dailyGoalMl,
      historyLogs: state.historyLogs,
      settings: updated,
      customMascotImage: state.customMascotImage,
      mascotScale: state.mascotScale,
    });
  },

  addCustomSnooze: (minutes: number) => {
    const state = get();
    const current = state.settings.customSnoozes || [];
    if (!current.includes(minutes)) {
      const updated = {
        ...state.settings,
        customSnoozes: [...current, minutes].sort((a, b) => a - b),
        snoozeDurationMinutes: minutes,
      };
      set({ settings: updated });
      persistState({
        dailyGoalMl: state.dailyGoalMl,
        historyLogs: state.historyLogs,
        settings: updated,
        customMascotImage: state.customMascotImage,
        mascotScale: state.mascotScale,
      });
    } else {
      state.updateSettings({ snoozeDurationMinutes: minutes });
    }
  },

  removeCustomSnooze: (minutes: number) => {
    const state = get();
    const current = state.settings.customSnoozes || [];
    const filtered = current.filter((m) => m !== minutes);
    const updated = {
      ...state.settings,
      customSnoozes: filtered,
      snoozeDurationMinutes: state.settings.snoozeDurationMinutes === minutes ? 30 : state.settings.snoozeDurationMinutes,
    };
    set({ settings: updated });
    persistState({
      dailyGoalMl: state.dailyGoalMl,
      historyLogs: state.historyLogs,
      settings: updated,
      customMascotImage: state.customMascotImage,
      mascotScale: state.mascotScale,
    });
  },

  addCustomSip: (ml: number) => {
    const state = get();
    const current = state.settings.customSips || [];
    if (!current.includes(ml)) {
      const updated = {
        ...state.settings,
        customSips: [...current, ml].sort((a, b) => a - b),
        sipAmountMl: ml,
      };
      set({ settings: updated });
      persistState({
        dailyGoalMl: state.dailyGoalMl,
        historyLogs: state.historyLogs,
        settings: updated,
        customMascotImage: state.customMascotImage,
        mascotScale: state.mascotScale,
      });
    } else {
      state.updateSettings({ sipAmountMl: ml });
    }
  },

  removeCustomSip: (ml: number) => {
    const state = get();
    const current = state.settings.customSips || [];
    const filtered = current.filter((m) => m !== ml);
    const updated = {
      ...state.settings,
      customSips: filtered,
      sipAmountMl: state.settings.sipAmountMl === ml ? 250 : state.settings.sipAmountMl,
    };
    set({ settings: updated });
    persistState({
      dailyGoalMl: state.dailyGoalMl,
      historyLogs: state.historyLogs,
      settings: updated,
      customMascotImage: state.customMascotImage,
      mascotScale: state.mascotScale,
    });
  },

  triggerReminder: (options) => {
    const state = get();
    const now = Date.now();
    try {
      if (typeof window !== 'undefined') {
        window.focus();
      }
    } catch {
      // ignore
    }
    // Start mascot walk-in
    set({
      mascotState: 'walking-in',
      lastReminderTimestamp: now,
      snoozedUntilTimestamp: null,
      isTestWalk: Boolean(options?.isTestWalk),
    });

    persistState({
      dailyGoalMl: state.dailyGoalMl,
      historyLogs: state.historyLogs,
      settings: state.settings,
      customMascotImage: state.customMascotImage,
      mascotScale: state.mascotScale,
      snoozedUntilTimestamp: null,
      lastReminderTimestamp: now,
    });

    if (state.settings.soundEnabled) {
      playWaterChime();
    }
  },

  setMascotState: (state: MascotAnimationState) => {
    set({ mascotState: state });
  },

  handleDrankReminder: () => {
    const state = get();
    const sipAmount = state.settings.sipAmountMl || 250;
    const now = Date.now();

    // Immediately record water
    state.addWater(sipAmount, 'reminder-prompt');

    // Transition character to happy reaction and walk right
    set({
      mascotState: 'walking-out-happy',
      lastReminderTimestamp: now,
      snoozedUntilTimestamp: null,
      isTestWalk: false,
    });

    persistState({
      dailyGoalMl: state.dailyGoalMl,
      historyLogs: state.historyLogs,
      settings: state.settings,
      customMascotImage: state.customMascotImage,
      mascotScale: state.mascotScale,
      snoozedUntilTimestamp: null,
      lastReminderTimestamp: now,
    });
  },

  handleSnoozeReminder: () => {
    const state = get();
    const snoozeMins = state.settings.snoozeDurationMinutes || 15;
    const snoozeDurationMs = snoozeMins * 60 * 1000;
    const snoozeTarget = Date.now() + snoozeDurationMs;

    set({
      mascotState: 'walking-out-snoozed',
      snoozedUntilTimestamp: snoozeTarget,
      isTestWalk: false,
    });

    persistState({
      dailyGoalMl: state.dailyGoalMl,
      historyLogs: state.historyLogs,
      settings: state.settings,
      customMascotImage: state.customMascotImage,
      mascotScale: state.mascotScale,
      snoozedUntilTimestamp: snoozeTarget,
      lastReminderTimestamp: state.lastReminderTimestamp,
    });
  },

  dismissMascot: () => {
    set({ mascotState: 'hidden', isTestWalk: false });
  },

  resetToday: () => {
    const state = get();
    const todayKey = getTodayKey();
    const updatedLog: DailyHydrationLog = {
      date: todayKey,
      totalMl: 0,
      goalMl: state.dailyGoalMl,
      entries: [],
      completed: false,
    };

    const updatedHistory = {
      ...state.historyLogs,
      [todayKey]: updatedLog,
    };

    set({ historyLogs: updatedHistory });
    persistState({
      dailyGoalMl: state.dailyGoalMl,
      historyLogs: updatedHistory,
      settings: state.settings,
      customMascotImage: state.customMascotImage,
      mascotScale: state.mascotScale,
    });
  },
}));
