import { MascotMood } from '../types/character';
import { useWaterStore } from '@/shared/stores/useWaterStore';
import { cn } from '@/shared/lib/cn';
import { Sparkles, Heart } from 'lucide-react';

interface AquaCharacterProps {
  mood?: MascotMood;
  isWalking?: boolean;
  scale?: number;
  className?: string;
  showShadow?: boolean;
  customImageOverride?: string | null;
}

export function AquaCharacter({
  mood = 'neutral',
  isWalking = false,
  scale = 1,
  className,
  showShadow = true,
  customImageOverride,
}: AquaCharacterProps) {
  const storeCustomImage = useWaterStore((state) => state.customMascotImage);
  const activeImage = customImageOverride !== undefined ? customImageOverride : storeCustomImage;

  return (
    <div
      className={cn('relative inline-flex flex-col items-center select-none', className)}
      style={{ transform: `scale(${scale})` }}
    >
      {/* Dynamic Main Body with Bobbing when Walking */}
      <div className={cn('relative flex flex-col items-center justify-center', isWalking && 'anim-aqua-bob')}>
        {/* Glow / aura around character */}
        <div className="absolute -inset-2 bg-sky-300/25 blur-xl rounded-full -z-10" />

        {activeImage ? (
          /* ==============================================
             CUSTOM UPLOADED MASCOT / CHARACTER
             ============================================== */
          <div className="relative w-[110px] h-[124px] flex flex-col items-center justify-end">
            {/* Mood Reaction Badges for Custom Character */}
            {mood === 'happy' && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-white/95 px-2 py-0.5 rounded-full shadow-md border border-pink-200 z-20 animate-bounce">
                <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
                <Sparkles className="w-3 h-3 text-amber-400" />
              </div>
            )}

            {mood === 'disappointed' && (
              <div className="absolute top-2 -right-2 bg-white/95 p-1 rounded-full shadow-sm border border-sky-200 z-20">
                <span className="text-xs" role="img" aria-label="sigh">💧</span>
              </div>
            )}

            {/* Uploaded Mascot Image */}
            <div className="relative w-[100px] h-[100px] flex items-center justify-center">
              <img
                src={activeImage}
                alt="Custom Mascot"
                className="max-w-full max-h-full object-contain drop-shadow-md select-none pointer-events-none"
              />
            </div>

            {/* Cute Little Walking Booties for Custom Character */}
            <div className="flex items-center justify-center gap-4 -mt-1 z-10">
              <div className={cn('w-4 h-3 bg-aqua-500 rounded-full border border-white shadow-xs', isWalking && 'anim-aqua-leg-left')} />
              <div className={cn('w-4 h-3 bg-sky-600 rounded-full border border-white shadow-xs', isWalking && 'anim-aqua-leg-right')} />
            </div>
          </div>
        ) : (
          /* ==============================================
             DEFAULT VECTOR MASCOT ("AQUA" DROPLET)
             ============================================== */
          <svg
            width="110"
            height="124"
            viewBox="0 0 110 124"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="drop-shadow-md overflow-visible"
          >
            <defs>
              {/* Water Droplet Body Gradient */}
              <linearGradient id="aquaBodyGrad" x1="20" y1="10" x2="85" y2="95" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#7DD3FC" />
                <stop offset="45%" stopColor="#38BDF8" />
                <stop offset="100%" stopColor="#0284C7" />
              </linearGradient>

              {/* Droplet Highlight */}
              <linearGradient id="aquaHighlight" x1="35" y1="15" x2="45" y2="40" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.75" />
                <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
              </linearGradient>

              {/* Bottle Gradient */}
              <linearGradient id="bottleGrad" x1="0" y1="0" x2="20" y2="35" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.85" />
                <stop offset="100%" stopColor="#BAE6FD" stopOpacity="0.7" />
              </linearGradient>

              <linearGradient id="waterInBottle" x1="0" y1="12" x2="0" y2="30" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#38BDF8" />
                <stop offset="100%" stopColor="#0284C7" />
              </linearGradient>
            </defs>

            {/* LEFT LEG (Behind) */}
            <g className={cn(isWalking && 'anim-aqua-leg-left')}>
              <rect x="36" y="90" width="10" height="18" rx="5" fill="#0284C7" />
              {/* Cute shoe */}
              <path
                d="M33 103C33 100.791 34.7909 99 37 99H49C51.2091 99 53 100.791 53 103V107C53 107.552 52.5523 108 52 108H34C33.4477 108 33 107.552 33 107V103Z"
                fill="#FFFFFF"
                stroke="#0284C7"
                strokeWidth="2"
              />
              <rect x="35" y="105" width="16" height="3" rx="1.5" fill="#0EA5E9" />
            </g>

            {/* RIGHT LEG (Front) */}
            <g className={cn(isWalking && 'anim-aqua-leg-right')}>
              <rect x="58" y="90" width="10" height="18" rx="5" fill="#0369A1" />
              {/* Cute shoe */}
              <path
                d="M55 103C55 100.791 56.7909 99 59 99H71C73.2091 99 75 100.791 75 103V107C75 107.552 74.5523 108 74 108H56C55.4477 108 55 107.552 55 107V103Z"
                fill="#FFFFFF"
                stroke="#0369A1"
                strokeWidth="2"
              />
              <rect x="57" y="105" width="16" height="3" rx="1.5" fill="#0EA5E9" />
            </g>

            {/* MAIN DROPLET BODY */}
            <path
              d="M52 8C52 8 20 50 20 72C20 89.6731 34.3269 100 52 100C69.6731 100 84 89.6731 84 72C84 50 52 8 52 8Z"
              fill="url(#aquaBodyGrad)"
            />

            {/* Forehead Gloss Highlight */}
            <path
              d="M52 13C47 25 32 50 30 65C29 55 35 32 52 13Z"
              fill="url(#aquaHighlight)"
            />
            <ellipse cx="36" cy="48" rx="3.5" ry="7" transform="rotate(-25 36 48)" fill="#FFFFFF" fillOpacity="0.5" />

            {/* BLUSH CHEEKS */}
            <ellipse cx="34" cy="73" rx="5.5" ry="3.5" fill="#F472B6" fillOpacity="0.65" />
            <ellipse cx="70" cy="73" rx="5.5" ry="3.5" fill="#F472B6" fillOpacity="0.65" />

            {/* EYES AND EXPRESSION BASED ON MOOD */}
            {mood === 'happy' ? (
              <g>
                <path
                  d="M34 65C34 61.5 37 60 41 60C45 60 48 61.5 48 65"
                  stroke="#0F172A"
                  strokeWidth="3.2"
                  strokeLinecap="round"
                />
                <path
                  d="M56 65C56 61.5 59 60 63 60C67 60 70 61.5 70 65"
                  stroke="#0F172A"
                  strokeWidth="3.2"
                  strokeLinecap="round"
                />
                <path
                  d="M47 72C47 77 51 81 55 81C59 81 63 77 63 72Z"
                  fill="#F43F5E"
                />
                <path
                  d="M49 74C51 76 55 76 57 74"
                  stroke="#FFE4E6"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
                <circle cx="86" cy="45" r="3" fill="#FDE047" className="animate-ping" />
                <circle cx="20" cy="45" r="2.5" fill="#38BDF8" />
              </g>
            ) : mood === 'disappointed' ? (
              <g>
                <ellipse cx="40" cy="65" rx="3" ry="3.5" fill="#1E293B" />
                <ellipse cx="64" cy="65" rx="3" ry="3.5" fill="#1E293B" />
                <path
                  d="M48 76C50.5 74 53.5 74 56 76"
                  stroke="#0F172A"
                  strokeWidth="2.8"
                  strokeLinecap="round"
                />
                <path
                  d="M74 58C74 58 77 62 77 64C77 65.6569 75.6569 67 74 67C72.3431 67 71 65.6569 71 64C71 62 74 58 74 58Z"
                  fill="#7DD3FC"
                />
              </g>
            ) : (
              <g>
                <ellipse cx="40" cy="64" rx="3.5" ry="4.5" fill="#0F172A" />
                <circle cx="41.5" cy="62.5" r="1.5" fill="#FFFFFF" />
                <ellipse cx="64" cy="64" rx="3.5" ry="4.5" fill="#0F172A" />
                <circle cx="65.5" cy="62.5" r="1.5" fill="#FFFFFF" />
                <path
                  d="M48 72C50.5 75 53.5 75 56 72"
                  stroke="#0F172A"
                  strokeWidth="2.8"
                  strokeLinecap="round"
                />
              </g>
            )}

            {/* LEFT ARM (Wave) */}
            <g className={cn(mood === 'happy' && 'anim-aqua-wave')}>
              <path
                d="M23 70C15 67 11 63 11 58C11 55 14 54 16 57C19 61 24 67 24 70"
                stroke="#0284C7"
                strokeWidth="5"
                strokeLinecap="round"
              />
            </g>

            {/* RIGHT ARM HOLDING WATER BOTTLE */}
            <g className={cn(isWalking && 'anim-aqua-bottle')}>
              <path
                d="M78 72C84 72 88 74 91 76"
                stroke="#0284C7"
                strokeWidth="5.5"
                strokeLinecap="round"
              />

              {/* Water Bottle */}
              <g transform="translate(86, 52)">
                <rect x="5" y="0" width="8" height="4" rx="1.5" fill="#0284C7" />
                <rect x="7" y="3" width="4" height="2" fill="#0369A1" />
                <rect
                  x="2"
                  y="5"
                  width="14"
                  height="28"
                  rx="4"
                  fill="url(#bottleGrad)"
                  stroke="#38BDF8"
                  strokeWidth="1.2"
                />
                <path
                  d="M3 16C5 15 9 17 11 16C13 15 14 15.5 15 16V29C15 31.2 13.2 32 11 32H7C4.8 32 3 31.2 3 29V16Z"
                  fill="url(#waterInBottle)"
                />
                <line x1="5" y1="12" x2="13" y2="12" stroke="#FFFFFF" strokeWidth="1" strokeOpacity="0.7" />
                <line x1="5" y1="22" x2="13" y2="22" stroke="#FFFFFF" strokeWidth="1" strokeOpacity="0.5" />
              </g>
            </g>

            {/* Cute Droplet Tuft */}
            <path
              d="M48 6C50 1 54 1 56 6"
              stroke="#38BDF8"
              strokeWidth="3"
              strokeLinecap="round"
            />
          </svg>
        )}
      </div>

      {/* Dynamic Walking / Standing Shadow */}
      {showShadow ? (
        <div
          className={cn(
            'w-14 h-3 bg-slate-400/20 rounded-full blur-[2px] mt-0.5 transition-all duration-300',
            isWalking ? 'scale-x-90 opacity-60' : 'scale-x-100 opacity-80'
          )}
        />
      ) : null}
    </div>
  );
}
