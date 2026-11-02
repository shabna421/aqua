import { Flame, Droplet, Award } from 'lucide-react';
import { useWaterStore } from '@/shared/stores/useWaterStore';
import { getLast7DaysKeys, formatMl } from '@/shared/lib/dateUtils';
import { Card } from '@/shared/ui/Card';

export function HydrationStreakCard() {
  const historyLogs = useWaterStore((state) => state.historyLogs);
  const dailyGoalMl = useWaterStore((state) => state.dailyGoalMl);
  const getTodayLog = useWaterStore((state) => state.getTodayLog);

  const days = getLast7DaysKeys();
  const todayLog = getTodayLog();

  // Calculate streak: consecutive days meeting or exceeding goal
  let currentStreak = 0;
  if (todayLog.totalMl >= dailyGoalMl) {
    currentStreak++;
  }

  // Count backwards from yesterday
  for (let i = days.length - 2; i >= 0; i--) {
    const log = historyLogs[days[i].dateKey];
    if (log && log.totalMl >= dailyGoalMl) {
      currentStreak++;
    } else {
      break;
    }
  }

  // Calculate 7-day average
  let sum = todayLog.totalMl;
  let count = 1;
  days.slice(0, 6).forEach((d) => {
    const log = historyLogs[d.dateKey];
    if (log) {
      sum += log.totalMl;
      count++;
    }
  });
  const avgMl = Math.round(sum / count);

  return (
    <div className="grid grid-cols-3 gap-2.5">
      <Card className="p-3.5 flex flex-col items-center text-center justify-center">
        <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mb-1">
          <Flame className="w-4 h-4 fill-amber-500" />
        </div>
        <span className="text-xl font-extrabold text-slate-800">{currentStreak}</span>
        <span className="text-[10px] font-semibold text-slate-400">Day Streak</span>
      </Card>

      <Card className="p-3.5 flex flex-col items-center text-center justify-center">
        <div className="w-8 h-8 rounded-full bg-aqua-100 text-aqua-600 flex items-center justify-center mb-1">
          <Droplet className="w-4 h-4 fill-aqua-500" />
        </div>
        <span className="text-xl font-extrabold text-slate-800">{formatMl(avgMl)}</span>
        <span className="text-[10px] font-semibold text-slate-400">Daily Average</span>
      </Card>

      <Card className="p-3.5 flex flex-col items-center text-center justify-center">
        <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-1">
          <Award className="w-4 h-4" />
        </div>
        <span className="text-xl font-extrabold text-slate-800">
          {Math.min(100, Math.round((todayLog.totalMl / dailyGoalMl) * 100))}%
        </span>
        <span className="text-[10px] font-semibold text-slate-400">Today's Ratio</span>
      </Card>
    </div>
  );
}
