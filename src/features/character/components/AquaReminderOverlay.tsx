import { useEffect, useState, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useWaterStore } from '@/shared/stores/useWaterStore';
import { playWaterChime } from '@/shared/lib/audioSound';
import { AquaCharacter } from './AquaCharacter';
import { AquaSpeechBubble } from './AquaSpeechBubble';
import { MascotMood } from '../types/character';

export function AquaReminderOverlay() {
  const [mounted, setMounted] = useState(false);

  const mascotState = useWaterStore((state) => state.mascotState);
  const setMascotState = useWaterStore((state) => state.setMascotState);
  const handleDrankReminder = useWaterStore((state) => state.handleDrankReminder);
  const handleSnoozeReminder = useWaterStore((state) => state.handleSnoozeReminder);
  const dismissMascot = useWaterStore((state) => state.dismissMascot);
  const sipAmountMl = useWaterStore((state) => state.settings.sipAmountMl);
  const snoozeDurationMinutes = useWaterStore((state) => state.settings.snoozeDurationMinutes);
  const mascotScale = useWaterStore((state) => state.mascotScale);
  const setMascotScale = useWaterStore((state) => state.setMascotScale);
  const isTestWalk = useWaterStore((state) => state.isTestWalk);

  // Position state: 'off-left' | 'center' | 'off-right'
  const [stage, setStage] = useState<'off-left' | 'center' | 'off-right'>('off-left');
  const [facingDirection, setFacingDirection] = useState<'right' | 'left'>('right');
  const [mood, setMood] = useState<MascotMood>('neutral');
  const [isWalking, setIsWalking] = useState(false);

  // Interactive live sizing during preview / reminder
  const [tempScale, setTempScale] = useState(mascotScale || 1.0);
  const [hasSaved, setHasSaved] = useState(false);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const stepTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasWalkedInViewRef = useRef(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const clearTimers = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (stepTimerRef.current) {
      clearTimeout(stepTimerRef.current);
      stepTimerRef.current = null;
    }
  }, []);

  // Forcefully initiate the walk-in animation on the active viewport
  const startWalkIn = useCallback(() => {
    clearTimers();
    hasWalkedInViewRef.current = true;
    setTempScale(mascotScale || 1.0);
    setHasSaved(false);

    // Trigger notification chime sound
    playWaterChime();

    // Start completely off-screen left
    setStage('off-left');
    setFacingDirection('right');
    setMood('neutral');
    setIsWalking(true);

    // In next frame, smoothly glide to viewport center
    stepTimerRef.current = setTimeout(() => {
      setStage('center');
    }, 50);

    // Arrive at center after 2.3 seconds and pop speech bubble
    timerRef.current = setTimeout(() => {
      setIsWalking(false);
      setMascotState('prompting');
    }, 2350);
  }, [clearTimers, mascotScale, setMascotState]);

  // Primary animation lifecycle based on mascotState
  useEffect(() => {
    clearTimers();

    if (mascotState === 'walking-in') {
      // If the tab is currently active and visible, start walk-in immediately!
      if (typeof document !== 'undefined' && !document.hidden) {
        startWalkIn();
      } else {
        // Tab is in the background: prepare mascot off-left and wait for tab visibility/focus
        hasWalkedInViewRef.current = false;
        setStage('off-left');
        setFacingDirection('right');
        setMood('neutral');
        setIsWalking(false);
      }
      return;
    }

    if (mascotState === 'prompting') {
      setStage('center');
      setIsWalking(false);
      setMood('neutral');
      setFacingDirection('right');
      return;
    }

    if (mascotState === 'walking-out-happy') {
      setMood('happy');
      setFacingDirection('right');
      setIsWalking(true);

      const happyDelay = setTimeout(() => {
        setStage('off-right');
      }, 350);

      const exitTimer = setTimeout(() => {
        setIsWalking(false);
        dismissMascot();
      }, 2500);

      timerRef.current = exitTimer;
      stepTimerRef.current = happyDelay;
      return () => clearTimers();
    }

    if (mascotState === 'walking-out-snoozed') {
      setMood('disappointed');
      setFacingDirection('left');
      setIsWalking(true);

      const snoozeDelay = setTimeout(() => {
        setStage('off-left');
      }, 350);

      const exitTimer = setTimeout(() => {
        setIsWalking(false);
        dismissMascot();
      }, 2500);

      timerRef.current = exitTimer;
      stepTimerRef.current = snoozeDelay;
      return () => clearTimers();
    }

    if (mascotState === 'hidden') {
      hasWalkedInViewRef.current = false;
      setStage('off-left');
      setIsWalking(false);
      setMood('neutral');
      setHasSaved(false);
    }
  }, [mascotState, startWalkIn, dismissMascot, clearTimers]);

  // Handle returning from background tab, window focus, or notification click
  useEffect(() => {
    const handleActivate = () => {
      if (typeof document === 'undefined' || document.hidden) return;

      // If a reminder triggered while user was in another tab/screen, forcefully walk in now
      if (mascotState === 'walking-in' && !hasWalkedInViewRef.current) {
        startWalkIn();
      } else if (mascotState === 'prompting') {
        setStage('center');
        setIsWalking(false);
        playWaterChime();
      }
    };

    document.addEventListener('visibilitychange', handleActivate);
    window.addEventListener('focus', handleActivate);
    window.addEventListener('aqua-reminder-click', handleActivate);

    return () => {
      document.removeEventListener('visibilitychange', handleActivate);
      window.removeEventListener('focus', handleActivate);
      window.removeEventListener('aqua-reminder-click', handleActivate);
    };
  }, [mascotState, startWalkIn]);

  const handleZoomIn = () => {
    setTempScale((prev) => Math.min(1.6, +(prev + 0.05).toFixed(2)));
  };

  const handleZoomOut = () => {
    setTempScale((prev) => Math.max(0.7, +(prev - 0.05).toFixed(2)));
  };

  const handleScaleChange = (val: number) => {
    setTempScale(Math.max(0.7, Math.min(1.6, val)));
  };

  const handleSaveScale = () => {
    setMascotScale(tempScale);
    setHasSaved(true);
    setTimeout(() => {
      setMascotState('walking-out-happy');
    }, 700);
  };

  if (!mounted || mascotState === 'hidden') {
    return null;
  }

  // Full-width viewport coordinate calculations
  let horizontalStyle: React.CSSProperties = {};
  const transitionStyle = isWalking
    ? 'left 2.25s cubic-bezier(0.25, 0.85, 0.35, 1)'
    : 'none';

  if (stage === 'off-left') {
    horizontalStyle = { left: '-220px' };
  } else if (stage === 'center') {
    horizontalStyle = { left: '50%' };
  } else if (stage === 'off-right') {
    horizontalStyle = { left: 'calc(100vw + 220px)' };
  }

  return createPortal(
    <div
      className="fixed inset-0 z-[99999] pointer-events-none flex flex-col justify-end overflow-hidden"
      role="dialog"
      aria-modal="true"
      aria-label="Hydration reminder mascot"
    >
      {/* Dim backdrop when prompting to focus user attention */}
      <div
        className={`absolute inset-0 bg-slate-900/25 backdrop-blur-[2px] transition-opacity duration-300 pointer-events-auto ${
          mascotState === 'prompting' ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      />

      {/* Full-width walking track across entire active viewport */}
      <div className="relative w-full h-96 pointer-events-none">
        {/* Animated Mascot Wrapper anchored to viewport */}
        <div
          className="absolute bottom-16 sm:bottom-20 -translate-x-1/2 flex flex-col items-center pointer-events-auto"
          style={{
            ...horizontalStyle,
            transition: transitionStyle,
          }}
        >
          {/* Speech Bubble: Only displayed during 'prompting' */}
          {mascotState === 'prompting' && (
            <div className="mb-2.5">
              <AquaSpeechBubble
                onDrank={handleDrankReminder}
                onRemindLater={handleSnoozeReminder}
                sipAmountMl={sipAmountMl}
                snoozeDurationMinutes={snoozeDurationMinutes}
                isTestWalk={isTestWalk}
                currentScale={tempScale}
                onZoomIn={handleZoomIn}
                onZoomOut={handleZoomOut}
                onScaleChange={handleScaleChange}
                onSaveScale={handleSaveScale}
                hasSaved={hasSaved}
              />
            </div>
          )}

          {/* Aqua Character Vector with Directional Flip and Live Zoom Scaling */}
          <div
            className="transition-transform duration-300 ease-out"
            style={{
              transform: facingDirection === 'left' ? 'scaleX(-1)' : 'scaleX(1)',
            }}
          >
            <AquaCharacter mood={mood} isWalking={isWalking} scale={1.22 * (tempScale || 1.0)} />
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
