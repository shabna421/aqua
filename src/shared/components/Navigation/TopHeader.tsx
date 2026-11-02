import { Sparkles, RotateCcw, Droplets, Target, TrendingUp, Sliders } from 'lucide-react';
import { useWaterStore } from '@/shared/stores/useWaterStore';
import { NavTab } from './BottomNav';

interface TopHeaderProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  onResetToday?: () => void;
}

export function TopHeader({ activeTab, onTabChange, onResetToday }: TopHeaderProps) {
  const triggerReminder = useWaterStore((state) => state.triggerReminder);
  const mascotState = useWaterStore((state) => state.mascotState);
  const dailyGoalMl = useWaterStore((state) => state.dailyGoalMl);
  const getTodayLog = useWaterStore((state) => state.getTodayLog);

  const todayLog = getTodayLog();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const todayDateString = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  const navItems = [
    { id: 'home' as const, label: 'Dashboard', icon: Droplets },
    { id: 'goal' as const, label: 'Daily Goal', icon: Target },
    { id: 'history' as const, label: 'Progress', icon: TrendingUp },
    { id: 'settings' as const, label: 'Settings', icon: Sliders },
  ];

  return (
    <header className="py-4 select-none border-b border-slate-100 mb-2">
      <div className="flex items-center justify-between gap-4">
        {/* Brand & Greeting */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-aqua-500 to-sky-400 flex items-center justify-center text-white shadow-md shadow-aqua-500/20 shrink-0">
            <Droplets className="w-5 h-5 fill-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-extrabold text-slate-900 tracking-tight">
                Aqua
              </span>
              <span className="text-xs font-semibold text-aqua-700 bg-aqua-50 px-2.5 py-0.5 rounded-full border border-aqua-200/60 hidden sm:inline-block">
                {todayDateString}
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              {getGreeting()} • {todayLog.totalMl}ml / {(dailyGoalMl / 1000).toFixed(1)}L
            </p>
          </div>
        </div>

        {/* Desktop Navigation Tabs (Hidden on mobile, prominent on md+) */}
        <nav className="hidden md:flex items-center gap-1.5 bg-slate-100/90 p-1.5 rounded-2xl border border-slate-200/60">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onTabChange(item.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-white text-aqua-600 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                }`}
              >
                <Icon className="w-4 h-4 stroke-[2.2]" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Actions: Summon Aqua Mascot & Reset */}
        <div className="flex items-center gap-2">
          {/* Quick Mascot Trigger */}
          <button
            type="button"
            onClick={() => triggerReminder()}
            disabled={mascotState !== 'hidden'}
            className="flex items-center gap-1.5 text-xs font-bold text-aqua-600 bg-white hover:bg-aqua-50 border border-aqua-200/80 px-3.5 py-2 rounded-xl shadow-xs transition-all active:scale-95 disabled:opacity-50"
            title="Summon Aqua mascot walking reminder"
          >
            <Sparkles className="w-4 h-4 text-aqua-500 fill-aqua-100" />
            <span className="hidden sm:inline">Summon Aqua</span>
            <span className="sm:hidden">Aqua</span>
          </button>

          {/* Reset Today (Testing convenience) */}
          {onResetToday && (
            <button
              type="button"
              onClick={onResetToday}
              className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors"
              title="Reset today's water intake back to 0ml"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
