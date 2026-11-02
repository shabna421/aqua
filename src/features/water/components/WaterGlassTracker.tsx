import { GlassWater } from 'lucide-react';
import { cn } from '@/shared/lib/cn';

interface WaterGlassTrackerProps {
  currentMl: number;
  goalMl: number;
  glassSizeMl?: number;
}

export function WaterGlassTracker({
  currentMl,
  goalMl,
  glassSizeMl = 250,
}: WaterGlassTrackerProps) {
  const totalGlasses = Math.max(1, Math.round(goalMl / glassSizeMl));
  const filledGlasses = Math.floor(currentMl / glassSizeMl);

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2 px-1">
        <span className="text-xs font-semibold text-slate-500">
          Glasses Progress ({glassSizeMl}ml each)
        </span>
        <span className="text-xs font-bold text-aqua-600">
          {filledGlasses} / {totalGlasses} cups
        </span>
      </div>

      <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 pt-0.5 no-scrollbar">
        {Array.from({ length: totalGlasses }).map((_, i) => {
          const isFilled = i < filledGlasses;
          const isCurrentTarget = i === filledGlasses;

          return (
            <div
              key={i}
              className={cn(
                'flex-1 min-w-[32px] h-10 rounded-xl flex items-center justify-center transition-all duration-300 border',
                isFilled
                  ? 'bg-aqua-500 text-white border-aqua-600 shadow-sm shadow-aqua-500/20'
                  : isCurrentTarget
                  ? 'bg-aqua-50 text-aqua-600 border-aqua-300 border-dashed animate-pulse'
                  : 'bg-slate-100/70 text-slate-400 border-slate-200'
              )}
              title={`Glass ${i + 1} (${(i + 1) * glassSizeMl}ml)`}
            >
              <GlassWater
                className={cn(
                  'w-4 h-4',
                  isFilled ? 'fill-white stroke-white' : 'stroke-current'
                )}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
