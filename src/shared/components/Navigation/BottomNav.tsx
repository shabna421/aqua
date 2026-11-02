import { Droplets, Target, TrendingUp, Sliders } from 'lucide-react';

export type NavTab = 'home' | 'goal' | 'history' | 'settings';

interface BottomNavProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
}

export function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  const tabs = [
    { id: 'home' as const, label: 'Home', icon: Droplets },
    { id: 'goal' as const, label: 'Goal', icon: Target },
    { id: 'history' as const, label: 'Progress', icon: TrendingUp },
    { id: 'settings' as const, label: 'Settings', icon: Sliders },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-slate-200/80 py-2 px-4 shadow-[0_-4px_24px_rgba(0,0,0,0.06)]">
      <div className="max-w-md mx-auto flex items-center justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all duration-200 ${
                isActive
                  ? 'text-aqua-600 scale-105 font-bold'
                  : 'text-slate-400 hover:text-slate-600 font-medium'
              }`}
            >
              <div
                className={`w-9 h-7 rounded-xl flex items-center justify-center transition-colors mb-0.5 ${
                  isActive ? 'bg-aqua-100 text-aqua-600' : 'bg-transparent text-current'
                }`}
              >
                <Icon className="w-4 h-4 stroke-[2.2]" />
              </div>
              <span className="text-[11px] leading-tight">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
