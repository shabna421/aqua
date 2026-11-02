import { useState, useEffect } from 'react';
import { Bell, Volume2, Sparkles, Play, Clock, Plus, X } from 'lucide-react';
import { useWaterStore } from '@/shared/stores/useWaterStore';
import { Card } from '@/shared/ui/Card';
import { Toggle } from '@/shared/ui/Toggle';
import { Button } from '@/shared/ui/Button';
import { playWaterChime } from '@/shared/lib/audioSound';
import { requestNotificationPermission, sendBrowserNotification, checkNotificationPermission } from '@/features/reminders/services/backgroundScheduler';

function formatIntervalLabel(mins: number): string {
  if (mins === 60) return 'Every 1 hour';
  if (mins === 90) return 'Every 1.5 hours';
  if (mins === 120) return 'Every 2 hours';
  if (mins % 60 === 0) return `Every ${mins / 60} hours`;
  if (mins > 60) {
    const hrs = Math.floor(mins / 60);
    const rem = mins % 60;
    return `Every ${hrs}h ${rem}m`;
  }
  return `Every ${mins} min`;
}

export function ReminderSettingsCard() {
  const settings = useWaterStore((state) => state.settings);
  const updateSettings = useWaterStore((state) => state.updateSettings);
  const addCustomInterval = useWaterStore((state) => state.addCustomInterval);
  const removeCustomInterval = useWaterStore((state) => state.removeCustomInterval);
  const addCustomSnooze = useWaterStore((state) => state.addCustomSnooze);
  const removeCustomSnooze = useWaterStore((state) => state.removeCustomSnooze);
  const addCustomSip = useWaterStore((state) => state.addCustomSip);
  const removeCustomSip = useWaterStore((state) => state.removeCustomSip);
  const triggerReminder = useWaterStore((state) => state.triggerReminder);
  const mascotState = useWaterStore((state) => state.mascotState);

  // Custom Input Forms State
  const [showAddInterval, setShowAddInterval] = useState(false);
  const [intervalInputValue, setIntervalInputValue] = useState('');
  const [intervalUnit, setIntervalUnit] = useState<'minutes' | 'hours'>('minutes');

  const [showAddSnooze, setShowAddSnooze] = useState(false);
  const [snoozeInputValue, setSnoozeInputValue] = useState('');

  const [showAddSip, setShowAddSip] = useState(false);
  const [sipInputValue, setSipInputValue] = useState('');

  const [notificationStatus, setNotificationStatus] = useState<NotificationPermission | 'unsupported'>(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      return Notification.permission;
    }
    return 'unsupported';
  });

  useEffect(() => {
    checkNotificationPermission().then((status) => {
      setNotificationStatus(status);
    });
  }, []);

  // Default option values
  const defaultIntervals = [30, 45, 60, 90, 120];
  const customIntervals = settings.customIntervals || [];
  const allIntervals = Array.from(new Set([...defaultIntervals, ...customIntervals])).sort((a, b) => a - b);

  const defaultSnoozes = [15, 30, 45];
  const customSnoozes = settings.customSnoozes || [];
  const allSnoozes = Array.from(new Set([...defaultSnoozes, ...customSnoozes])).sort((a, b) => a - b);

  const defaultSips = [150, 250, 350];
  const customSips = settings.customSips || [];
  const allSips = Array.from(new Set([...defaultSips, ...customSips])).sort((a, b) => a - b);

  // Submit Handlers
  const handleAddInterval = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseFloat(intervalInputValue);
    if (!isNaN(num) && num > 0) {
      const minutes = intervalUnit === 'hours' ? Math.round(num * 60) : Math.round(num);
      if (minutes >= 5 && minutes <= 720) {
        addCustomInterval(minutes);
        setIntervalInputValue('');
        setShowAddInterval(false);
      }
    }
  };

  const handleAddSnooze = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseInt(snoozeInputValue, 10);
    if (!isNaN(num) && num >= 1 && num <= 180) {
      addCustomSnooze(num);
      setSnoozeInputValue('');
      setShowAddSnooze(false);
    }
  };

  const handleAddSip = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseInt(sipInputValue, 10);
    if (!isNaN(num) && num >= 25 && num <= 2000) {
      addCustomSip(num);
      setSipInputValue('');
      setShowAddSip(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Test / Summon Mascot Action Banner */}
      <div className="p-4 rounded-3xl bg-gradient-to-r from-aqua-500 via-sky-500 to-blue-500 text-white shadow-soft-float flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-yellow-200" />
          </div>
          <div>
            <h4 className="text-sm font-bold">Summon Aqua Now</h4>
            <p className="text-xs text-sky-100">Test the mascot walking reminder</p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => triggerReminder()}
          disabled={mascotState !== 'hidden'}
          className="bg-white text-aqua-600 hover:bg-sky-50 border-white text-xs font-bold shadow-sm"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span>{mascotState !== 'hidden' ? 'Active' : 'Trigger'}</span>
        </Button>
      </div>

      {/* Main Settings Card */}
      <Card className="space-y-5">
        {/* Master ON/OFF Switch */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-aqua-50 text-aqua-600 flex items-center justify-center">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800">Aqua Reminders</h3>
              <p className="text-xs text-slate-500">
                {settings.enabled ? 'Active in background & other tabs' : 'Reminders currently paused'}
              </p>
            </div>
          </div>
          <Toggle
            id="reminder-toggle"
            checked={settings.enabled}
            onChange={async (checked) => {
              updateSettings({ enabled: checked });
              if (checked) {
                const perm = await requestNotificationPermission();
                setNotificationStatus(perm);
              }
            }}
          />
        </div>

        {/* 1. REMINDER FREQUENCY SECTION */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-aqua-500" />
              <span>Reminder Frequency</span>
            </label>
            {!showAddInterval && (
              <button
                type="button"
                disabled={!settings.enabled}
                onClick={() => setShowAddInterval(true)}
                className="inline-flex items-center gap-1 text-[11px] font-bold text-aqua-600 hover:text-aqua-700 bg-aqua-50/80 hover:bg-aqua-100/70 px-2 py-0.5 rounded-lg border border-aqua-200/60 transition-colors disabled:opacity-40"
              >
                <Plus className="w-3 h-3 stroke-[2.5]" />
                <span>Add New</span>
              </button>
            )}
          </div>

          {/* Chips Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {allIntervals.map((mins) => {
              const isSelected = settings.intervalMinutes === mins;
              const isCustom = customIntervals.includes(mins);

              return (
                <div key={mins} className="relative group">
                  <button
                    type="button"
                    disabled={!settings.enabled}
                    onClick={() => updateSettings({ intervalMinutes: mins })}
                    className={`w-full py-2 px-3 text-xs font-semibold rounded-xl border transition-all text-center ${
                      isSelected
                        ? 'bg-aqua-500 text-white border-aqua-600 shadow-sm'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    } disabled:opacity-50`}
                  >
                    {formatIntervalLabel(mins)}
                  </button>

                  {/* Remove custom chip button */}
                  {isCustom && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeCustomInterval(mins);
                      }}
                      className="absolute -top-1 -right-1 w-4 h-4 bg-slate-300 hover:bg-rose-500 text-white rounded-full flex items-center justify-center text-[9px] shadow-2xs opacity-70 group-hover:opacity-100 transition-all"
                      title="Delete custom frequency"
                    >
                      <X className="w-2.5 h-2.5 stroke-[2.5]" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {/* Custom Frequency Input Form */}
          {showAddInterval && (
            <form
              onSubmit={handleAddInterval}
              className="p-3 bg-white rounded-2xl border border-aqua-300 shadow-sm space-y-2.5 anim-droplet-pop"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-700">Add Custom Reminder Frequency:</span>
                <button
                  type="button"
                  onClick={() => setShowAddInterval(false)}
                  className="text-slate-400 hover:text-slate-600 p-0.5"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="number"
                  step={intervalUnit === 'hours' ? '0.5' : '1'}
                  min={intervalUnit === 'hours' ? '0.1' : '5'}
                  max={intervalUnit === 'hours' ? '12' : '720'}
                  value={intervalInputValue}
                  onChange={(e) => setIntervalInputValue(e.target.value)}
                  placeholder={intervalUnit === 'hours' ? 'e.g. 2.5' : 'e.g. 20, 75'}
                  className="flex-1 px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-aqua-400 font-bold text-slate-800"
                  autoFocus
                />

                <select
                  value={intervalUnit}
                  onChange={(e) => setIntervalUnit(e.target.value as 'minutes' | 'hours')}
                  className="px-2 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-700 focus:outline-none"
                >
                  <option value="minutes">Minutes</option>
                  <option value="hours">Hours</option>
                </select>

                <Button type="submit" size="sm" variant="primary" disabled={!intervalInputValue}>
                  Add
                </Button>
              </div>
            </form>
          )}
        </div>

        {/* Active Schedule Hours */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-700">Active Daily Window</label>
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80">
              <span className="text-[11px] font-semibold text-slate-400 block mb-1">
                Start Time
              </span>
              <input
                type="time"
                disabled={!settings.enabled}
                value={settings.startTime}
                onChange={(e) => updateSettings({ startTime: e.target.value })}
                className="w-full text-sm font-bold text-slate-800 bg-transparent focus:outline-none disabled:opacity-50"
              />
            </div>
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80">
              <span className="text-[11px] font-semibold text-slate-400 block mb-1">
                End Time
              </span>
              <input
                type="time"
                disabled={!settings.enabled}
                value={settings.endTime}
                onChange={(e) => updateSettings({ endTime: e.target.value })}
                className="w-full text-sm font-bold text-slate-800 bg-transparent focus:outline-none disabled:opacity-50"
              />
            </div>
          </div>
        </div>

        {/* 2. SNOOZE DURATION SECTION */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-700">
              Snooze Duration (when tapping "Remind me later")
            </label>
            {!showAddSnooze && (
              <button
                type="button"
                disabled={!settings.enabled}
                onClick={() => setShowAddSnooze(true)}
                className="inline-flex items-center gap-1 text-[11px] font-bold text-aqua-600 hover:text-aqua-700 bg-aqua-50/80 hover:bg-aqua-100/70 px-2 py-0.5 rounded-lg border border-aqua-200/60 transition-colors disabled:opacity-40"
              >
                <Plus className="w-3 h-3 stroke-[2.5]" />
                <span>Add New</span>
              </button>
            )}
          </div>

          {/* Chips Grid */}
          <div className="flex flex-wrap gap-2">
            {allSnoozes.map((mins) => {
              const isSelected = settings.snoozeDurationMinutes === mins;
              const isCustom = customSnoozes.includes(mins);

              return (
                <div key={mins} className="relative group flex-1 min-w-[70px]">
                  <button
                    type="button"
                    disabled={!settings.enabled}
                    onClick={() => updateSettings({ snoozeDurationMinutes: mins })}
                    className={`w-full py-2 text-xs font-semibold rounded-xl border transition-all text-center ${
                      isSelected
                        ? 'bg-aqua-500 text-white border-aqua-600 shadow-sm'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    } disabled:opacity-50`}
                  >
                    {mins} mins
                  </button>

                  {/* Remove custom chip button */}
                  {isCustom && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeCustomSnooze(mins);
                      }}
                      className="absolute -top-1 -right-1 w-4 h-4 bg-slate-300 hover:bg-rose-500 text-white rounded-full flex items-center justify-center text-[9px] shadow-2xs opacity-70 group-hover:opacity-100 transition-all"
                      title="Delete custom snooze"
                    >
                      <X className="w-2.5 h-2.5 stroke-[2.5]" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {/* Custom Snooze Input Form */}
          {showAddSnooze && (
            <form
              onSubmit={handleAddSnooze}
              className="p-3 bg-white rounded-2xl border border-aqua-300 shadow-sm space-y-2.5 anim-droplet-pop"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-700">Add Custom Snooze Duration:</span>
                <button
                  type="button"
                  onClick={() => setShowAddSnooze(false)}
                  className="text-slate-400 hover:text-slate-600 p-0.5"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="1"
                  max="180"
                  value={snoozeInputValue}
                  onChange={(e) => setSnoozeInputValue(e.target.value)}
                  placeholder="e.g. 10, 20, 60"
                  className="flex-1 px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-aqua-400 font-bold text-slate-800"
                  autoFocus
                />
                <span className="text-xs font-bold text-slate-400">minutes</span>

                <Button type="submit" size="sm" variant="primary" disabled={!snoozeInputValue}>
                  Add
                </Button>
              </div>
            </form>
          )}
        </div>

        {/* 3. DEFAULT SIP AMOUNT SECTION */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-700">
              Default Sip Amount for Mascot Prompt
            </label>
            {!showAddSip && (
              <button
                type="button"
                disabled={!settings.enabled}
                onClick={() => setShowAddSip(true)}
                className="inline-flex items-center gap-1 text-[11px] font-bold text-aqua-600 hover:text-aqua-700 bg-aqua-50/80 hover:bg-aqua-100/70 px-2 py-0.5 rounded-lg border border-aqua-200/60 transition-colors disabled:opacity-40"
              >
                <Plus className="w-3 h-3 stroke-[2.5]" />
                <span>Add New</span>
              </button>
            )}
          </div>

          {/* Chips Grid */}
          <div className="flex flex-wrap gap-2">
            {allSips.map((ml) => {
              const isSelected = settings.sipAmountMl === ml;
              const isCustom = customSips.includes(ml);

              return (
                <div key={ml} className="relative group flex-1 min-w-[70px]">
                  <button
                    type="button"
                    disabled={!settings.enabled}
                    onClick={() => updateSettings({ sipAmountMl: ml })}
                    className={`w-full py-2 text-xs font-semibold rounded-xl border transition-all text-center ${
                      isSelected
                        ? 'bg-aqua-500 text-white border-aqua-600 shadow-sm'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    } disabled:opacity-50`}
                  >
                    {ml} ml
                  </button>

                  {/* Remove custom chip button */}
                  {isCustom && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeCustomSip(ml);
                      }}
                      className="absolute -top-1 -right-1 w-4 h-4 bg-slate-300 hover:bg-rose-500 text-white rounded-full flex items-center justify-center text-[9px] shadow-2xs opacity-70 group-hover:opacity-100 transition-all"
                      title="Delete custom sip amount"
                    >
                      <X className="w-2.5 h-2.5 stroke-[2.5]" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {/* Custom Sip Amount Input Form */}
          {showAddSip && (
            <form
              onSubmit={handleAddSip}
              className="p-3 bg-white rounded-2xl border border-aqua-300 shadow-sm space-y-2.5 anim-droplet-pop"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-700">Add Custom Sip Amount:</span>
                <button
                  type="button"
                  onClick={() => setShowAddSip(false)}
                  className="text-slate-400 hover:text-slate-600 p-0.5"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="25"
                  max="2000"
                  step="25"
                  value={sipInputValue}
                  onChange={(e) => setSipInputValue(e.target.value)}
                  placeholder="e.g. 100, 200, 400"
                  className="flex-1 px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-aqua-400 font-bold text-slate-800"
                  autoFocus
                />
                <span className="text-xs font-bold text-slate-400">ml</span>

                <Button type="submit" size="sm" variant="primary" disabled={!sipInputValue}>
                  Add
                </Button>
              </div>
            </form>
          )}
        </div>

        {/* Sound Effects Toggle & Test */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
          <div className="flex items-center gap-2.5">
            <Volume2 className="w-4 h-4 text-aqua-500" />
            <div>
              <span className="text-xs font-bold text-slate-700 block">Sound Effects</span>
              <span className="text-[11px] text-slate-400">Gentle water droplet chime</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => playWaterChime()}
              className="text-xs font-semibold text-aqua-600 hover:text-aqua-700 bg-aqua-50 px-2.5 py-1 rounded-lg border border-aqua-200"
            >
              Test Sound
            </button>
            <Toggle
              id="sound-toggle"
              checked={settings.soundEnabled}
              onChange={(checked) => updateSettings({ soundEnabled: checked })}
            />
          </div>
        </div>

        {/* System Browser Notifications */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
          <div className="flex items-center gap-2.5">
            <Bell className="w-4 h-4 text-sky-500" />
            <div>
              <span className="text-xs font-bold text-slate-700 block">System Notifications</span>
              <span className="text-[11px] text-slate-400">
                {notificationStatus === 'granted'
                  ? 'Enabled (alerts even when tab is backgrounded or minimized)'
                  : notificationStatus === 'denied'
                  ? 'Blocked by browser (enable in site permissions)'
                  : 'Allows alerts when working in other tabs'}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {notificationStatus === 'granted' ? (
              <button
                type="button"
                onClick={() => {
                  sendBrowserNotification(
                    'Aqua Water Reminder 💧',
                    `Test notification! Background alerts are active every ${settings.intervalMinutes} min.`
                  );
                }}
                className="text-xs font-semibold text-sky-600 hover:text-sky-700 bg-sky-50 hover:bg-sky-100/70 px-2.5 py-1 rounded-lg border border-sky-200 transition-colors"
              >
                Test Alert
              </button>
            ) : (
              <button
                type="button"
                onClick={async () => {
                  const perm = await requestNotificationPermission();
                  setNotificationStatus(perm);
                }}
                className="text-xs font-semibold text-white bg-aqua-500 hover:bg-aqua-600 px-2.5 py-1 rounded-lg transition-colors shadow-xs"
              >
                Enable
              </button>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
