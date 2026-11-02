import { Check, Clock3, Sparkles, ZoomIn, ZoomOut, Save, SlidersHorizontal, X } from 'lucide-react';
import { Button } from '@/shared/ui/Button';

interface AquaSpeechBubbleProps {
  onDrank: () => void;
  onRemindLater: () => void;
  sipAmountMl?: number;
  snoozeDurationMinutes?: number;
  isTestWalk?: boolean;
  currentScale: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onScaleChange: (scale: number) => void;
  onSaveScale: () => void;
  hasSaved?: boolean;
}

export function AquaSpeechBubble({
  onDrank,
  onRemindLater,
  sipAmountMl = 250,
  snoozeDurationMinutes = 15,
  isTestWalk = false,
  currentScale,
  onZoomIn,
  onZoomOut,
  onScaleChange,
  onSaveScale,
  hasSaved = false,
}: AquaSpeechBubbleProps) {
  const currentPercent = Math.round(currentScale * 100);

  return (
    <div className="relative anim-droplet-pop z-30 flex flex-col items-center select-none">
      {/* Speech Card */}
      <div
        className={`bg-white/98 backdrop-blur-md border rounded-3xl p-5 shadow-soft-float text-center transition-all ${
          isTestWalk
            ? 'max-w-[320px] w-[92vw] border-sky-200'
            : 'max-w-[280px] w-[90vw] border-sky-100'
        }`}
      >
        {isTestWalk ? (
          /* =========================================================
             2. TEST WALK MODE (Triggered via "Test Screen Walk")
             Includes size slider, stepper buttons, and Save button
             ========================================================= */
          <div>
            {/* Header Pill */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-aqua-50 text-aqua-600 rounded-full text-xs font-semibold mb-2">
              <Sparkles className="w-3.5 h-3.5 text-aqua-500 animate-spin" style={{ animationDuration: '4s' }} />
              <span>Mascot Sizing & Preview</span>
            </div>

            {/* Title & Guidance */}
            <p className="text-base font-bold text-slate-800 leading-snug mb-0.5">
              👀 How does this size look?
            </p>
            <p className="text-xs text-slate-500 mb-3 font-medium">
              Adjust zoom controls to resize Aqua, then tap Save
            </p>

            {/* Interactive Zoom-In / Zoom-Out Sizing Controls */}
            <div className="mb-4 p-3 bg-slate-50/90 rounded-2xl border border-slate-200/80 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                <span className="flex items-center gap-1 text-[11px] text-slate-500">
                  <SlidersHorizontal className="w-3.5 h-3.5 text-aqua-500" />
                  <span>Mascot Size</span>
                </span>
                <span className="text-xs font-extrabold text-aqua-600 bg-white px-2 py-0.5 rounded-lg border border-aqua-200 shadow-2xs">
                  {currentPercent}%
                </span>
              </div>

              {/* Stepper Zoom Buttons + Slider */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onZoomOut}
                  disabled={currentScale <= 0.7}
                  className="p-1.5 bg-white hover:bg-slate-100 active:scale-95 text-slate-700 disabled:opacity-30 rounded-xl border border-slate-200 shadow-2xs transition-all"
                  title="Zoom out character"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>

                <input
                  type="range"
                  min="0.7"
                  max="1.6"
                  step="0.05"
                  value={currentScale}
                  onChange={(e) => onScaleChange(parseFloat(e.target.value))}
                  className="flex-1 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-aqua-500 focus:outline-none"
                />

                <button
                  type="button"
                  onClick={onZoomIn}
                  disabled={currentScale >= 1.6}
                  className="p-1.5 bg-white hover:bg-slate-100 active:scale-95 text-slate-700 disabled:opacity-30 rounded-xl border border-slate-200 shadow-2xs transition-all"
                  title="Zoom in character"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Test Walk Action Buttons */}
            <div className="flex flex-col gap-2">
              {/* Prominent SAVE Size Button */}
              <Button
                variant="primary"
                size="md"
                onClick={onSaveScale}
                className={`w-full shadow-md flex items-center justify-center gap-2 text-sm font-bold transition-all ${
                  hasSaved
                    ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/25 border-emerald-500'
                    : 'bg-gradient-to-r from-aqua-500 to-sky-500 hover:from-aqua-600 hover:to-sky-600 shadow-aqua-500/30'
                }`}
              >
                {hasSaved ? (
                  <>
                    <Check className="w-4 h-4 stroke-[3]" />
                    <span>Size Saved! ✨</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Save Mascot Size ({currentPercent}%)</span>
                  </>
                )}
              </Button>

              {/* DRANK TEST BUTTON */}
              <Button
                variant="secondary"
                size="sm"
                onClick={onDrank}
                className="w-full text-slate-700 hover:bg-slate-200/80 flex items-center justify-center gap-1.5 font-bold text-xs py-2"
              >
                <Check className="w-3.5 h-3.5 text-aqua-600 stroke-[3]" />
                <span>Drank Water (+{sipAmountMl}ml)</span>
              </Button>

              {/* CLOSE PREVIEW BUTTON */}
              <Button
                variant="ghost"
                size="sm"
                onClick={onRemindLater}
                className="w-full text-slate-500 hover:text-slate-700 hover:bg-slate-100/70 flex items-center justify-center gap-1.5 font-medium text-xs py-1.5"
              >
                <X className="w-3.5 h-3.5" />
                <span>Close Preview</span>
              </Button>
            </div>
          </div>
        ) : (
          /* =========================================================
             1. REAL REMINDER MODE (Automated Water Reminder)
             ONLY shows core options: "Drank" and "Remind me later"
             Without any size adjustment controls
             ========================================================= */
          <div>
            {/* Header Pill */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-aqua-50 text-aqua-600 rounded-full text-xs font-semibold mb-2.5">
              <Sparkles className="w-3.5 h-3.5 text-aqua-500 animate-spin" style={{ animationDuration: '4s' }} />
              <span>Hydration Reminder</span>
            </div>

            {/* Mascot Message */}
            <p className="text-base font-bold text-slate-800 leading-snug mb-1">
              💧 Time to drink water!
            </p>
            <p className="text-xs text-slate-500 mb-4 font-medium">
              Have a sip to stay fresh and energized (+{sipAmountMl}ml)
            </p>

            {/* Core Interaction Options ONLY */}
            <div className="flex flex-col gap-2">
              {/* DRANK BUTTON */}
              <Button
                variant="primary"
                size="md"
                onClick={onDrank}
                className="w-full shadow-md shadow-aqua-500/30 flex items-center justify-center gap-2 text-sm font-bold bg-gradient-to-r from-aqua-500 to-sky-500 hover:from-aqua-600 hover:to-sky-600"
              >
                <Check className="w-4 h-4 stroke-[3]" />
                <span>Drank (+{sipAmountMl}ml)</span>
              </Button>

              {/* REMIND ME LATER BUTTON */}
              <Button
                variant="ghost"
                size="sm"
                onClick={onRemindLater}
                className="w-full text-slate-500 hover:text-slate-700 hover:bg-slate-100/70 flex items-center justify-center gap-1.5 font-medium text-xs py-2"
              >
                <Clock3 className="w-3.5 h-3.5" />
                <span>Remind me later ({snoozeDurationMinutes}m)</span>
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Downward Speech Bubble Pointer Triangle */}
      <div className="w-0 h-0 border-x-[10px] border-x-transparent border-t-[10px] border-t-white drop-shadow-[0_4px_3px_rgba(0,0,0,0.06)] -mt-[1px]" />
    </div>
  );
}
