import { BarChart3, CheckCircle2 } from 'lucide-react';
import { useWaterStore } from '@/shared/stores/useWaterStore';
import { getLast7DaysKeys, formatMl } from '@/shared/lib/dateUtils';
import { Card } from '@/shared/ui/Card';

export function WeeklyChart() {
  const historyLogs = useWaterStore((state) => state.historyLogs);
  const dailyGoalMl = useWaterStore((state) => state.dailyGoalMl);
  const getTodayLog = useWaterStore((state) => state.getTodayLog);

  const days = getLast7DaysKeys();
  const maxBarValue = Math.max(dailyGoalMl * 1.25, 2500);

  return (
    <Card className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-aqua-100 text-aqua-600 flex items-center justify-center">
            <BarChart3 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800">Weekly Consistency</h3>
            <p className="text-xs text-slate-400">Hydration over the last 7 days</p>
          </div>
        </div>
        <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
          Goal: {formatMl(dailyGoalMl)}
        </span>
      </div>

      {/* Bar Chart Container */}
      <div className="pt-4 pb-2">
        <div className="h-44 flex items-end justify-between gap-2 px-1 relative">
          {/* Target Goal Reference Line */}
          <div
            className="absolute left-0 right-0 border-b border-dashed border-aqua-400/60 z-0 pointer-events-none"
            style={{
              bottom: `${Math.min(95, (dailyGoalMl / maxBarValue) * 100)}%`,
            }}
          >
            <span className="absolute -top-3.5 right-1 text-[10px] font-bold text-aqua-500 bg-white/90 px-1 rounded">
              Goal
            </span>
          </div>

          {days.map((day, idx) => {
            const isToday = idx === days.length - 1;
            const log = isToday ? getTodayLog() : historyLogs[day.dateKey];
            const amount = log ? log.totalMl : 0;
            const isCompleted = amount >= dailyGoalMl;
            const heightPercent = Math.min(100, Math.max(8, (amount / maxBarValue) * 100));

            return (
              <div key={day.dateKey} className="flex-1 flex flex-col items-center h-full justify-end z-10 group">
                {/* Tooltip on hover */}
                <span className="text-[10px] font-bold text-slate-600 mb-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {amount > 0 ? formatMl(amount) : '0'}
                </span>

                {/* Bar */}
                <div className="w-full max-w-[32px] bg-slate-100 rounded-t-xl h-full flex items-end p-0.5 relative overflow-hidden">
                  <div
                    className={`w-full rounded-t-lg transition-all duration-500 relative ${
                      isCompleted
                        ? 'bg-gradient-to-t from-aqua-600 to-sky-400'
                        : amount > 0
                        ? 'bg-gradient-to-t from-sky-400 to-sky-300'
                        : 'bg-transparent'
                    }`}
                    style={{ height: `${heightPercent}%` }}
                  >
                    {isCompleted && (
                      <div className="absolute top-1 left-0 right-0 flex justify-center">
                        <CheckCircle2 className="w-3 h-3 text-white drop-shadow-sm" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Day Label */}
                <span
                  className={`text-[11px] font-semibold mt-2 ${
                    isToday ? 'text-aqua-600 font-extrabold' : 'text-slate-400'
                  }`}
                >
                  {isToday ? 'Today' : day.dayName}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
}
