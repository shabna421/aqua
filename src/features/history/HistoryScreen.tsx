import { WeeklyChart } from './components/WeeklyChart';
import { HydrationStreakCard } from './components/HydrationStreakCard';
import { DayLogList } from './components/DayLogList';

export function HistoryScreen() {
  return (
    <div className="space-y-5 pb-20 md:pb-6">
      {/* Streak & Key Metric Cards */}
      <HydrationStreakCard />

      {/* Main Responsive Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Column: Weekly Chart */}
        <div className="lg:col-span-7 space-y-4">
          <WeeklyChart />
        </div>

        {/* Right Column: Drink Log */}
        <div className="lg:col-span-5 space-y-4">
          <DayLogList />
        </div>
      </div>
    </div>
  );
}
