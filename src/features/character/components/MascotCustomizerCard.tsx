import { useState, useRef } from 'react';
import { Upload, RotateCcw, Sparkles, Play, Image as ImageIcon, Check, Sliders, ChevronDown } from 'lucide-react';
import { useWaterStore } from '@/shared/stores/useWaterStore';
import { Card } from '@/shared/ui/Card';
import { Button } from '@/shared/ui/Button';
import { AquaCharacter } from './AquaCharacter';

export function MascotCustomizerCard() {
  const customMascotImage = useWaterStore((state) => state.customMascotImage);
  const mascotScale = useWaterStore((state) => state.mascotScale);
  const setCustomMascotImage = useWaterStore((state) => state.setCustomMascotImage);
  const resetMascotToDefault = useWaterStore((state) => state.resetMascotToDefault);
  const triggerReminder = useWaterStore((state) => state.triggerReminder);
  const mascotState = useWaterStore((state) => state.mascotState);

  const [isExpanded, setIsExpanded] = useState(false);
  const [isTestWalking, setIsTestWalking] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const showFeedback = (msg: string) => {
    setFeedbackMsg(msg);
    setTimeout(() => setFeedbackMsg(null), 2500);
  };

  // Resize and compress image client-side to ensure lightweight storage
  const processImageFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload a valid image file (PNG, JPG, or WEBP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const src = e.target?.result as string;
      const img = new Image();
      img.onload = () => {
        // Create canvas to downscale to max 280x280 for fast performance
        const maxDim = 280;
        let width = img.width;
        let height = img.height;

        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL('image/png');
          setCustomMascotImage(dataUrl);
          showFeedback('Custom mascot uploaded successfully!');
        }
      };
      img.src = src;
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  const handleReset = () => {
    resetMascotToDefault();
    showFeedback('Reset to default Aqua droplet mascot!');
  };

  return (
    <Card className="space-y-4">
      {/* Header with Title and Reset Button */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-aqua-100 text-aqua-600 flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800">Mascot Character</h3>
            <p className="text-xs text-slate-400">
              {customMascotImage ? 'Custom mascot active' : 'Default "Aqua" droplet active'}
            </p>
          </div>
        </div>

        {/* Header Quick Reset Button if custom image or altered size */}
        {(customMascotImage || mascotScale !== 1.0) && (
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-rose-600 bg-slate-100 hover:bg-rose-50 px-3 py-1.5 rounded-xl border border-slate-200 transition-colors"
            title="Reset to default Aqua droplet mascot and default size"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset to Aqua</span>
          </button>
        )}
      </div>

      {/* Success / Status Banner */}
      {feedbackMsg && (
        <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-xl flex items-center gap-2 anim-droplet-pop">
          <Check className="w-4 h-4 text-emerald-600 stroke-[3]" />
          <span>{feedbackMsg}</span>
        </div>
      )}

      {/* Live Mascot Preview Stage */}
      <div className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-2xl bg-gradient-to-b from-sky-50/70 to-slate-50/70 border border-sky-100">
        <div className="relative w-32 h-32 flex items-center justify-center bg-white/80 rounded-2xl shadow-inner border border-sky-100/80 overflow-hidden">
          <AquaCharacter isWalking={isTestWalking} scale={0.88 * (mascotScale || 1.0)} />
        </div>

        <div className="flex-1 text-center sm:text-left space-y-2">
          <div className="flex items-center justify-center sm:justify-start gap-2">
            <span className="text-xs font-bold text-slate-700">
              {customMascotImage ? 'Custom Character' : 'Aqua Droplet'}
            </span>
          </div>

          <p className="text-xs text-slate-500">
            This character walks in from the screen edge with water reminders and reacts when you drink!
          </p>

          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsTestWalking(!isTestWalking)}
              className="text-xs py-1.5 px-3 bg-white hover:bg-slate-50"
            >
              <span>{isTestWalking ? 'Stop Bobbing' : 'Test Bobbing'}</span>
            </Button>

            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={() => triggerReminder({ isTestWalk: true })}
              disabled={mascotState !== 'hidden'}
              className="text-xs py-1.5 px-3"
            >
              <Play className="w-3 h-3 fill-current" />
              <span>Test Screen Walk</span>
            </Button>

            <Button
              type="button"
              variant={isExpanded ? 'secondary' : 'outline'}
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className={`text-xs py-1.5 px-3 font-bold transition-all ${
                isExpanded
                  ? 'bg-aqua-50 text-aqua-700 border-aqua-300 shadow-2xs'
                  : 'bg-white hover:bg-sky-50 text-aqua-600 border-aqua-200 shadow-2xs'
              }`}
            >
              <Sliders className="w-3.5 h-3.5 text-aqua-600" />
              <span>Customize Aqua</span>
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform duration-200 ${
                  isExpanded ? 'rotate-180' : ''
                }`}
              />
            </Button>
          </div>
        </div>
      </div>

      {/* Collapsible Configuration Section */}
      {isExpanded && (
        <div className="space-y-4 pt-2 border-t border-slate-100 anim-droplet-pop">
          {/* Drag & Drop Upload Zone */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`relative border-2 border-dashed rounded-2xl p-4 sm:p-5 text-center cursor-pointer transition-all ${
              isDragging
                ? 'border-aqua-500 bg-aqua-50/60 scale-[1.01]'
                : 'border-slate-200 hover:border-aqua-400 bg-slate-50/50 hover:bg-aqua-50/30'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp,image/svg+xml"
              onChange={handleFileChange}
              className="hidden"
            />

            <div className="flex flex-col items-center justify-center space-y-2">
              <div className="w-10 h-10 rounded-2xl bg-white shadow-sm border border-slate-100 flex items-center justify-center text-aqua-600">
                <Upload className="w-5 h-5" />
              </div>

              <div>
                <p className="text-xs font-bold text-slate-800">
                  Upload custom character image
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Click to browse or drag & drop (PNG with transparent background recommended, JPG)
                </p>
              </div>

              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-aqua-600 bg-aqua-50 px-3 py-1 rounded-xl border border-aqua-200/60">
                <ImageIcon className="w-3.5 h-3.5" />
                <span>Choose Image</span>
              </span>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
