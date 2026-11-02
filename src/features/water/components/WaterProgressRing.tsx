import { Droplets, Sparkles, CheckCircle2 } from 'lucide-react';
import { formatMl } from '@/shared/lib/dateUtils';

interface WaterProgressRingProps {
  currentMl: number;
  goalMl: number;
  size?: number;
  strokeWidth?: number;
}

export function WaterProgressRing({
  currentMl,
  goalMl,
  size = 230,
  strokeWidth = 14,
}: WaterProgressRingProps) {
  const percentage = Math.min(100, Math.round((currentMl / Math.max(1, goalMl)) * 100));
  const isGoalReached = currentMl >= goalMl;
  const remainingMl = Math.max(0, goalMl - currentMl);

  // SVG circle calculations
  const center = size / 2;
  const radius = center - strokeWidth;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative flex flex-col items-center justify-center my-3 select-none">
      <div className="relative" style={{ width: size, height: size }}>
        {/* Soft background glow */}
        <div
          className="absolute inset-4 rounded-full bg-gradient-to-b from-sky-100/60 to-aqua-50/40 blur-xl -z-10"
        />

        <svg width={size} height={size} className="transform -rotate-90">
          <defs>
            {/* Soft background track gradient */}
            <linearGradient id="ringTrackGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#E2E8F0" stopOpacity="0.7" />
              <stop offset="100%" stopColor="#F1F5F9" stopOpacity="0.9" />
            </linearGradient>

            {/* Dynamic Water Progress Gradient */}
            <linearGradient id="waterProgressGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#38BDF8" />
              <stop offset="50%" stopColor="#0EA5E9" />
              <stop offset="100%" stopColor="#0284C7" />
            </linearGradient>
          </defs>

          {/* Background Track */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="transparent"
            stroke="url(#ringTrackGrad)"
            strokeWidth={strokeWidth}
            className="transition-all duration-300"
          />

          {/* Active Water Stroke */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="transparent"
            stroke="url(#waterProgressGrad)"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-700 ease-out"
          />
        </svg>

        {/* Center Content Inside Circle */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
          {/* Subtle icon */}
          <div className="mb-1">
            {isGoalReached ? (
              <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center animate-bounce">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            ) : (
              <div className="w-8 h-8 rounded-full bg-aqua-100 text-aqua-600 flex items-center justify-center">
                <Droplets className="w-4 h-4 fill-aqua-500" />
              </div>
            )}
          </div>

          {/* Current Amount */}
          <div className="text-3xl font-extrabold text-slate-800 tracking-tight flex items-baseline justify-center">
            <span>{currentMl}</span>
            <span className="text-sm font-semibold text-slate-400 ml-1">ml</span>
          </div>

          {/* Goal & Percentage */}
          <div className="text-xs font-semibold text-slate-500 mt-0.5">
            of {formatMl(goalMl)} target
          </div>

          {/* Remaining or Status badge */}
          <div className="mt-2.5">
            {isGoalReached ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                <Sparkles className="w-3 h-3 text-emerald-500" /> Goal Met!
              </span>
            ) : (
              <span className="inline-flex items-center text-[11px] font-semibold text-aqua-700 bg-aqua-50 px-2.5 py-0.5 rounded-full border border-aqua-100">
                {remainingMl}ml remaining
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Progress percentage pill */}
      <div className="mt-1 text-xs font-bold text-slate-500">
        <span className="text-aqua-600 font-extrabold text-sm">{percentage}%</span> of daily hydration
      </div>
    </div>
  );
}
