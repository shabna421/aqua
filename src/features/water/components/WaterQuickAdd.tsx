import { useState } from 'react';
import { GlassWater, Plus } from 'lucide-react';
import { useWaterStore } from '@/shared/stores/useWaterStore';
import { Button } from '@/shared/ui/Button';

export function WaterQuickAdd() {
  const addWater = useWaterStore((state) => state.addWater);
  const [showCustom, setShowCustom] = useState(false);
  const [customValue, setCustomValue] = useState('');
  const [lastAdded, setLastAdded] = useState<number | null>(null);

  const presets = [
    { label: 'Glass', amount: 250, desc: 'Small cup', icon: '🥛' },
    { label: 'Bottle', amount: 350, desc: 'Regular bottle', icon: '💧' },
    { label: 'Flask', amount: 500, desc: 'Large tumbler', icon: '🧊' },
  ];

  const handleAdd = (amount: number) => {
    addWater(amount, 'quick-add');
    setLastAdded(amount);
    setTimeout(() => setLastAdded(null), 1200);
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseInt(customValue, 10);
    if (val > 0 && val <= 3000) {
      handleAdd(val);
      setCustomValue('');
      setShowCustom(false);
    }
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-3 px-1">
        <h3 className="text-sm font-bold text-slate-700 flex items-center gap-1.5">
          <GlassWater className="w-4 h-4 text-aqua-500" />
          <span>Quick Log Water</span>
        </h3>
        {lastAdded ? (
          <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 animate-pulse">
            +{lastAdded}ml logged!
          </span>
        ) : (
          <button
            type="button"
            onClick={() => setShowCustom(!showCustom)}
            className="text-xs font-semibold text-aqua-600 hover:text-aqua-700 transition-colors"
          >
            {showCustom ? 'Hide custom' : '+ Custom ml'}
          </button>
        )}
      </div>

      {/* Preset Buttons Grid */}
      <div className="grid grid-cols-3 gap-2.5">
        {presets.map((preset) => (
          <button
            key={preset.amount}
            type="button"
            onClick={() => handleAdd(preset.amount)}
            className="group relative flex flex-col items-center justify-center p-3.5 rounded-2xl bg-white border border-slate-200/80 hover:border-aqua-300 hover:bg-aqua-50/40 active:scale-95 transition-all duration-150 shadow-sm hover:shadow"
          >
            <span className="text-2xl mb-1 group-hover:scale-110 transition-transform duration-200">
              {preset.icon}
            </span>
            <span className="text-sm font-bold text-slate-800">
              +{preset.amount}ml
            </span>
            <span className="text-[11px] font-medium text-slate-400">
              {preset.label}
            </span>
          </button>
        ))}
      </div>

      {/* Custom Amount Drawer/Input */}
      {showCustom && (
        <form
          onSubmit={handleCustomSubmit}
          className="mt-3 p-3 bg-white rounded-2xl border border-aqua-200 shadow-sm flex items-center gap-2 anim-droplet-pop"
        >
          <input
            type="number"
            min="10"
            max="3000"
            step="10"
            value={customValue}
            onChange={(e) => setCustomValue(e.target.value)}
            placeholder="e.g. 150, 400"
            className="flex-1 px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-aqua-400 font-semibold text-slate-800"
            autoFocus
          />
          <span className="text-xs font-bold text-slate-400">ml</span>
          <Button type="submit" size="sm" variant="primary" disabled={!customValue}>
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Add</span>
          </Button>
        </form>
      )}
    </div>
  );
}
