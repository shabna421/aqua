import { ReminderSettingsCard } from './components/ReminderSettingsCard';
import { MascotCustomizerCard } from '@/features/character/components/MascotCustomizerCard';

export function ReminderSettingsScreen() {
  return (
    <div className="space-y-5 pb-20 md:pb-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Reminder Settings: 2nd on phone (order-2), 1st on desktop (lg:order-1) */}
        <div className="order-2 lg:order-1 lg:col-span-7 space-y-4">
          <ReminderSettingsCard />
        </div>

        {/* Mascot Customizer: 1st on phone (order-1), 2nd on desktop (lg:order-2) */}
        <div className="order-1 lg:order-2 lg:col-span-5 space-y-4">
          <MascotCustomizerCard />
        </div>
      </div>
    </div>
  );
}
