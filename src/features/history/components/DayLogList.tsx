import { Trash2, History, Sparkles, Plus } from 'lucide-react';
import { useWaterStore } from '@/shared/stores/useWaterStore';
import { formatTime } from '@/shared/lib/dateUtils';
import { Card } from '@/shared/ui/Card';

export function DayLogList() {
  const getTodayLog = useWaterStore((state) => state.getTodayLog);
  const removeEntry = useWaterStore((state) => state.removeEntry);

  const todayLog = getTodayLog();
  const entries = todayLog.entries || [];

  return (
    <Card className="space-y-3">
      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-aqua-500" />
          <h3 className="text-sm font-bold text-slate-800">Today's Drinks</h3>
        </div>
        <span className="text-xs font-semibold text-slate-400">
          {entries.length} {entries.length === 1 ? 'record' : 'records'}
        </span>
      </div>

      {entries.length === 0 ? (
        <div className="py-8 text-center flex flex-col items-center justify-center text-slate-400">
          <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center mb-2">
            <Plus className="w-5 h-5 text-slate-300" />
          </div>
          <p className="text-xs font-semibold text-slate-500">No drinks logged yet today</p>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Tap a quick-add button or drink with Aqua!
          </p>
        </div>
      ) : (
        <div className="divide-y divide-slate-100 max-h-56 overflow-y-auto pr-1">
          {entries.map((entry) => (
            <div
              key={entry.id}
              className="py-2.5 flex items-center justify-between group hover:bg-slate-50/60 rounded-xl px-2 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold ${
                    entry.source === 'reminder-prompt'
                      ? 'bg-sky-100 text-sky-700'
                      : 'bg-aqua-100 text-aqua-700'
                  }`}
                >
                  {entry.source === 'reminder-prompt' ? 'Aqua' : '💧'}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-bold text-slate-800">
                      +{entry.amountMl}ml
                    </span>
                    {entry.source === 'reminder-prompt' && (
                      <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-aqua-600 bg-aqua-50 px-1.5 py-0.2 rounded">
                        <Sparkles className="w-2.5 h-2.5" /> Mascot Prompt
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-slate-400 font-medium">
                    {formatTime(entry.timestamp)}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => removeEntry(entry.id)}
                className="opacity-40 group-hover:opacity-100 text-slate-400 hover:text-rose-500 p-1.5 rounded-lg transition-all"
                title="Remove entry"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
