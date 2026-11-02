import { useState, useEffect } from 'react';
import { Clock, Moon, Sparkles, BellOff } from 'lucide-react';
import { useWaterStore } from '@/shared/stores/useWaterStore';
import { parseTimeToTodayDate, formatTime } from '@/shared/lib/dateUtils';

export function NextReminderCountdown() {
  const settings = useWaterStore((state) => state.settings);
  const snoozedUntilTimestamp = useWaterStore((state) => state.snoozedUntilTimestamp);
  const lastReminderTimestamp = useWaterStore((state) => state.lastReminderTimestamp);

  const [, setTick] = useState(0);

  // Re-render every second to update remaining time with precision
  useEffect(() => {
    const timer = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  if (!settings.enabled) {
    return (
      <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-2xl bg-slate-100/90 text-slate-500 text-xs font-medium border border-slate-200/60 shadow-xs">
        <BellOff className="w-4 h-4 text-slate-400 shrink-0" />
        <span>Reminders currently paused</span>
      </div>
    );
  }

  const now = new Date();
  const startTime = parseTimeToTodayDate(settings.startTime);
  const endTime = parseTimeToTodayDate(settings.endTime);

  const isBeforeStart = now < startTime;
  const isAfterEnd = now > endTime;

  if (isBeforeStart) {
    return (
      <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-2xl bg-slate-100/90 text-slate-600 text-xs font-medium border border-slate-200/60 shadow-xs">
        <Moon className="w-4 h-4 text-slate-400 shrink-0" />
        <span>Starts at {formatTime(startTime.getTime())}</span>
      </div>
    );
  }

  if (isAfterEnd) {
    return (
      <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-2xl bg-slate-100/90 text-slate-500 text-xs font-medium border border-slate-200/60 shadow-xs">
        <Moon className="w-4 h-4 text-slate-400 shrink-0" />
        <span>Day completed! Rest well.</span>
      </div>
    );
  }

  // Check if snoozed
  if (snoozedUntilTimestamp && snoozedUntilTimestamp > Date.now()) {
    const remainingMs = snoozedUntilTimestamp - Date.now();
    const remainingSeconds = Math.ceil(remainingMs / 1000);
    const diffMins = Math.ceil(remainingMs / 60000);
    const label = remainingSeconds < 60 ? `${remainingSeconds}s` : `${diffMins}m`;

    return (
      <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-2xl bg-amber-50 text-amber-800 border border-amber-200/80 text-xs font-medium shadow-xs">
        <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
        <span>
          Snoozed until <strong>{formatTime(snoozedUntilTimestamp)}</strong> ({label})
        </span>
      </div>
    );
  }

  // Calculate next reminder
  const baseTime = lastReminderTimestamp || Date.now();
  const nextTargetTime = baseTime + settings.intervalMinutes * 60 * 1000;
  const remainingMins = Math.max(1, Math.round((nextTargetTime - Date.now()) / 60000));

  return (
    <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-2xl bg-aqua-50/90 text-aqua-800 border border-aqua-200/80 text-xs font-medium shadow-xs">
      <Clock className="w-4 h-4 text-aqua-600 shrink-0" />
      <span>
        Next reminder: <strong>{formatTime(nextTargetTime)}</strong> (in ~{remainingMins}m)
      </span>
    </div>
  );
}
