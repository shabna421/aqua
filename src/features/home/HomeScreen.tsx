import { useWaterStore } from '@/shared/stores/useWaterStore';
import { Card } from '@/shared/ui/Card';
import { WaterProgressRing } from '@/features/water/components/WaterProgressRing';
import { WaterQuickAdd } from '@/features/water/components/WaterQuickAdd';
import { WaterGlassTracker } from '@/features/water/components/WaterGlassTracker';
import { NextReminderCountdown } from '@/features/reminders/components/NextReminderCountdown';
import { AquaCharacter } from '@/features/character/components/AquaCharacter';
import { DayLogList } from '@/features/history/components/DayLogList';

export function HomeScreen() {
  const getTodayLog = useWaterStore((state) => state.getTodayLog);
  const dailyGoalMl = useWaterStore((state) => state.dailyGoalMl);
  const triggerReminder = useWaterStore((state) => state.triggerReminder);
  const mascotState = useWaterStore((state) => state.mascotState);

  const customMascotImage = useWaterStore((state) => state.customMascotImage);
  const mascotScale = useWaterStore((state) => state.mascotScale);

  const todayLog = getTodayLog();
  const currentMl = todayLog.totalMl;
  const isGoalReached = currentMl >= dailyGoalMl;

  return (
    <div className="space-y-4 pb-20 md:pb-6">
      {/* Mobile-Only: Bring Reminder/Snooze Countdown Card to the very top */}
      <div className="lg:hidden">
        <NextReminderCountdown />
      </div>

      {/* Responsive Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Primary Column: Progress Overview & Quick Add */}
        <div className="lg:col-span-7 space-y-5">
          {/* Hero Circular Progress Card */}
          <Card variant="gradient" className="flex flex-col items-center pt-6 pb-7">
            <WaterProgressRing currentMl={currentMl} goalMl={dailyGoalMl} size={250} />

            <div className="w-full mt-5 px-3">
              <WaterGlassTracker currentMl={currentMl} goalMl={dailyGoalMl} />
            </div>
          </Card>

          {/* Quick Add Water Actions */}
          <Card>
            <WaterQuickAdd />
          </Card>
        </div>

        {/* Right Secondary Column: Reminder Status, Mascot Greeting & Today's Logs */}
        <div className="lg:col-span-5 space-y-5">
          {/* Desktop-Only in Right Column */}
          <div className="hidden lg:block">
            <NextReminderCountdown />
          </div>

          {/* Mascot Companion Greeting Card */}
          <Card
            className="relative overflow-hidden cursor-pointer hover:border-aqua-300 transition-all border border-sky-100 bg-gradient-to-br from-sky-50 via-white to-aqua-50/50 p-5 shadow-soft-card group"
            onClick={() => {
              if (mascotState === 'hidden') {
                triggerReminder();
              }
            }}
          >
            <div className="flex items-center justify-between">
              <div className="space-y-1.5 pr-2">
                <div className="inline-flex items-center gap-1 text-[11px] font-bold text-aqua-700 bg-aqua-100/80 px-2.5 py-0.5 rounded-full">
                  <span>{customMascotImage ? 'Custom Mascot' : 'Companion Aqua'}</span>
                </div>
                <h3 className="text-sm font-bold text-slate-800 leading-snug">
                  {isGoalReached
                    ? '“Amazing job! You reached today’s target!”'
                    : currentMl > 0
                    ? '“Every drop counts! Keep the rhythm going.”'
                    : '“Ready to hydrate? Tap me to see me walk in!”'}
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  Click to summon Aqua across the screen with your water bottle.
                </p>
              </div>

              <div className="relative shrink-0 w-24 h-24 flex items-center justify-center group-hover:scale-105 transition-transform">
                <AquaCharacter mood={isGoalReached ? 'happy' : 'neutral'} scale={0.85 * (mascotScale || 1.0)} showShadow={false} />
              </div>
            </div>
          </Card>

          {/* Today's Drinks History */}
          <DayLogList />
        </div>
      </div>
    </div>
  );
}
