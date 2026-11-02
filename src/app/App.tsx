import { useState, useEffect } from 'react';
import { useWaterStore } from '@/shared/stores/useWaterStore';
import { TopHeader } from '@/shared/components/Navigation/TopHeader';
import { BottomNav, NavTab } from '@/shared/components/Navigation/BottomNav';
import { HomeScreen } from '@/features/home/HomeScreen';
import { WaterGoalScreen } from '@/features/water/WaterGoalScreen';
import { HistoryScreen } from '@/features/history/HistoryScreen';
import { ReminderSettingsScreen } from '@/features/reminders/ReminderSettingsScreen';
import { AquaReminderOverlay } from '@/features/character/components/AquaReminderOverlay';
import { parseTimeToTodayDate } from '@/shared/lib/dateUtils';
import { backgroundScheduler, sendBrowserNotification, requestNotificationPermission, initServiceWorker, initNativeNotifications } from '@/features/reminders/services/backgroundScheduler';

export function App() {
  const [activeTab, setActiveTab] = useState<NavTab>('home');

  const settings = useWaterStore((state) => state.settings);
  const mascotState = useWaterStore((state) => state.mascotState);
  const triggerReminder = useWaterStore((state) => state.triggerReminder);
  const lastReminderTimestamp = useWaterStore((state) => state.lastReminderTimestamp);
  const snoozedUntilTimestamp = useWaterStore((state) => state.snoozedUntilTimestamp);
  const resetToday = useWaterStore((state) => state.resetToday);

  // Initialize Service Worker & Native Notifications for persistent background notifications & window focus
  useEffect(() => {
    initServiceWorker();
    initNativeNotifications();

    const handleSWMessage = (event: MessageEvent) => {
      if (event.data?.type === 'AQUA_REMINDER_TRIGGER') {
        try {
          window.focus();
        } catch {
          // ignore
        }
        triggerReminder({ forceWalkIn: true });
      }
    };

    const handleReminderClick = () => {
      try {
        window.focus();
      } catch {
        // ignore
      }
      triggerReminder({ forceWalkIn: true });
    };

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', handleSWMessage);
    }
    window.addEventListener('aqua-reminder-click', handleReminderClick);

    return () => {
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.removeEventListener('message', handleSWMessage);
      }
      window.removeEventListener('aqua-reminder-click', handleReminderClick);
    };
  }, [triggerReminder]);

  // High-precision background timer using Web Worker to ensure reminders fire even when minimized or in other tabs
  useEffect(() => {
    if (!settings.enabled) {
      backgroundScheduler.stop();
      return;
    }

    // Auto-request permission if currently default
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'default') {
      requestNotificationPermission();
    }

    const checkReminders = () => {
      // Don't trigger if Aqua is already animating or on screen
      if (mascotState !== 'hidden') return;

      const now = new Date();
      const startTime = parseTimeToTodayDate(settings.startTime);
      const endTime = parseTimeToTodayDate(settings.endTime);

      // Check active window
      if (now < startTime || now > endTime) return;

      const currentTime = Date.now();

      // 1. PRIORITY SNOOZE CHECK: When snooze duration has elapsed, trigger immediately
      if (snoozedUntilTimestamp) {
        if (currentTime >= snoozedUntilTimestamp) {
          triggerReminder();
          sendBrowserNotification(
            'Time to drink water! 💧',
            `Snooze ended (${settings.snoozeDurationMinutes || 15}m). Aqua is waiting with your water bottle (+${settings.sipAmountMl || 250}ml)!`
          );
        }
        // While a snooze is/was active, do not evaluate standard interval
        return;
      }

      // 2. REGULAR INTERVAL CHECK (when no snooze is active)
      const intervalMs = settings.intervalMinutes * 60 * 1000;
      const lastTime = lastReminderTimestamp || (currentTime - intervalMs);

      if (currentTime - lastTime >= intervalMs) {
        triggerReminder();
        sendBrowserNotification(
          'Time to drink water! 💧',
          `Aqua is waiting with your water bottle. Take a refreshing sip (+${settings.sipAmountMl || 250}ml)!`
        );
      }
    };

    const unsubscribe = backgroundScheduler.subscribe(checkReminders);
    backgroundScheduler.start();

    // High-precision timer for the exact millisecond snooze elapses
    let snoozeTimer: ReturnType<typeof setTimeout> | null = null;
    if (snoozedUntilTimestamp && snoozedUntilTimestamp > Date.now()) {
      const remainingMs = Math.max(0, snoozedUntilTimestamp - Date.now());
      snoozeTimer = setTimeout(() => {
        checkReminders();
      }, remainingMs);
    }

    // Immediate check on mount or dependency change
    checkReminders();

    return () => {
      if (snoozeTimer) clearTimeout(snoozeTimer);
      unsubscribe();
      backgroundScheduler.stop();
    };
  }, [
    settings,
    mascotState,
    lastReminderTimestamp,
    snoozedUntilTimestamp,
    triggerReminder,
  ]);

  const handleResetToday = () => {
    if (window.confirm("Reset today's water intake back to 0ml?")) {
      resetToday();
    }
  };

  return (
    <div className="min-h-screen bg-slate-100/90 flex flex-col items-center justify-start sm:p-6 lg:p-8">
      {/* Responsive App Shell: Expands to 1200px max-w-6xl on desktop, full-width on mobile */}
      <div className="w-full max-w-6xl min-h-screen sm:min-h-[860px] bg-wellness-bg sm:rounded-[36px] shadow-2xl sm:border sm:border-slate-200/80 flex flex-col relative overflow-hidden transition-all duration-300">
        {/* Soft ambient gradient accents */}
        <div className="absolute top-0 -left-28 w-96 h-96 bg-sky-200/25 rounded-full blur-3xl pointer-events-none -z-10" />
        <div className="absolute top-48 -right-28 w-96 h-96 bg-aqua-100/35 rounded-full blur-3xl pointer-events-none -z-10" />

        {/* Top Header with Responsive Desktop Navigation Tabs */}
        <div className="px-4 sm:px-8 pt-4 pb-2">
          <TopHeader
            activeTab={activeTab}
            onTabChange={setActiveTab}
            onResetToday={handleResetToday}
          />
        </div>

        {/* Main Screen Content with responsive padding */}
        <main className="flex-1 px-4 sm:px-8 py-3 overflow-y-auto">
          {activeTab === 'home' && <HomeScreen />}
          {activeTab === 'goal' && <WaterGoalScreen />}
          {activeTab === 'history' && <HistoryScreen />}
          {activeTab === 'settings' && <ReminderSettingsScreen />}
        </main>

        {/* Mobile-Only Bottom Navigation Bar (hidden on md and above) */}
        <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />

        {/* Aqua Mascot Walking & Reminder Overlay (runs across entire viewport) */}
        <AquaReminderOverlay />
      </div>
    </div>
  );
}
export default App;
