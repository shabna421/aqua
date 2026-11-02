import { WaterGoalSelector } from './components/WaterGoalSelector';
import { Card } from '@/shared/ui/Card';
import { HeartPulse, Zap, Brain, Sparkles } from 'lucide-react';

export function WaterGoalScreen() {
  const benefits = [
    {
      icon: Zap,
      title: 'Sustained Energy',
      desc: 'Prevents afternoon fatigue, headaches, and mental slumps.',
      color: 'text-amber-500 bg-amber-50',
    },
    {
      icon: Brain,
      title: 'Mental Focus & Clarity',
      desc: 'Optimal cellular hydration boosts cognitive focus and memory by up to 20%.',
      color: 'text-sky-500 bg-sky-50',
    },
    {
      icon: HeartPulse,
      title: 'Cellular Health & Detox',
      desc: 'Aids gentle digestion, flushes metabolic waste, and cushions healthy joints.',
      color: 'text-rose-500 bg-rose-50',
    },
  ];

  return (
    <div className="space-y-5 pb-20 md:pb-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Column: Target Selector */}
        <div className="lg:col-span-7">
          <WaterGoalSelector />
        </div>

        {/* Right Column: Educational Hydration Benefits & Guidance */}
        <div className="lg:col-span-5 space-y-4">
          <Card className="space-y-4">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-aqua-500" />
              <span>Why Your Daily Target Matters</span>
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Your body is over 60% water. Taking consistent, gentle sips throughout the day allows your cells to absorb moisture naturally without overburdening digestion.
            </p>

            <div className="space-y-3 pt-1">
              {benefits.map((b) => {
                const Icon = b.icon;
                return (
                  <div
                    key={b.title}
                    className="flex items-start gap-3 p-3 rounded-2xl bg-slate-50/80 border border-slate-100"
                  >
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${b.color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-800">{b.title}</h4>
                      <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">{b.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
