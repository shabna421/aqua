import { useState } from 'react';
import { Target, Check, Sparkles, Plus } from 'lucide-react';
import { useWaterStore } from '@/shared/stores/useWaterStore';
import { Card } from '@/shared/ui/Card';
import { Button } from '@/shared/ui/Button';

export function WaterGoalSelector() {
  const dailyGoalMl = useWaterStore((state) => state.dailyGoalMl);
  const setDailyGoal = useWaterStore((state) => state.setDailyGoal);

  const [customGoal, setCustomGoal] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);

  const targets = [
    { ml: 1500, label: '1.5 Liters', desc: 'Light activity / cooler days', badge: 'Light' },
    { ml: 2000, label: '2.0 Liters', desc: 'Standard healthy adult intake', badge: 'Recommended' },
    { ml: 2500, label: '2.5 Liters', desc: 'Active lifestyle / workout', badge: 'Active' },
    { ml: 3000, label: '3.0 Liters', desc: 'High intensity & hot weather', badge: 'High Hydration' },
  ];

  const handleSelectPreset = (ml: number) => {
    setDailyGoal(ml);
    setShowCustomInput(false);
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseInt(customGoal, 10);
    if (val >= 500 && val <= 6000) {
      setDailyGoal(val);
      setShowCustomInput(false);
      setCustomGoal('');
    }
  };

  return (
    <div className="space-y-4">
      <Card variant="gradient" className="border-aqua-200">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-aqua-500 text-white flex items-center justify-center shadow-md shadow-aqua-500/20">
            <Target className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-800">Daily Water Goal</h2>
            <p className="text-xs text-slate-500 font-medium">
              Current goal:{' '}
              <span className="text-aqua-600 font-bold text-sm">
                {(dailyGoalMl / 1000).toFixed(1)}L ({dailyGoalMl}ml)
              </span>
            </p>
          </div>
        </div>
      </Card>

      {/* Target Options */}
      <div className="space-y-2.5">
        {targets.map((target) => {
          const isSelected = dailyGoalMl === target.ml;
          return (
            <button
              key={target.ml}
              type="button"
              onClick={() => handleSelectPreset(target.ml)}
              className={`w-full text-left p-4 rounded-2xl border transition-all duration-200 flex items-center justify-between ${
                isSelected
                  ? 'bg-aqua-50/80 border-aqua-400 shadow-sm ring-1 ring-aqua-400'
                  : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
              }`}
            >
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="text-base font-bold text-slate-800">
                    {target.label}
                  </span>
                  {target.badge === 'Recommended' && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-aqua-700 bg-aqua-100/80 px-2 py-0.5 rounded-full">
                      <Sparkles className="w-2.5 h-2.5" />
                      {target.badge}
                    </span>
                  )}
                </div>
                <span className="text-xs text-slate-500 mt-0.5">{target.desc}</span>
              </div>

              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${
                  isSelected
                    ? 'bg-aqua-500 text-white shadow-sm'
                    : 'border-2 border-slate-300'
                }`}
              >
                {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
              </div>
            </button>
          );
        })}

        {/* Custom Goal Selection */}
        <div className="pt-1">
          {!showCustomInput ? (
            <button
              type="button"
              onClick={() => setShowCustomInput(true)}
              className="w-full py-3 px-4 rounded-2xl border border-dashed border-slate-300 hover:border-aqua-400 text-xs font-bold text-slate-600 hover:text-aqua-600 transition-colors flex items-center justify-center gap-1.5 bg-white/60"
            >
              <Plus className="w-4 h-4" />
              <span>Set Custom Target</span>
            </button>
          ) : (
            <form
              onSubmit={handleCustomSubmit}
              className="p-4 bg-white rounded-2xl border border-aqua-300 shadow-sm space-y-3 anim-droplet-pop"
            >
              <label className="block text-xs font-bold text-slate-700">
                Custom Daily Goal (500ml - 6000ml):
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="500"
                  max="6000"
                  step="50"
                  value={customGoal}
                  onChange={(e) => setCustomGoal(e.target.value)}
                  placeholder="e.g. 2200"
                  className="flex-1 px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-aqua-400 font-bold text-slate-800"
                  autoFocus
                />
                <span className="text-sm font-bold text-slate-400">ml</span>
                <Button type="submit" size="sm" variant="primary" disabled={!customGoal}>
                  Save
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => setShowCustomInput(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
