# Aqua — Mindful Hydration & Water Reminder

A modern, responsive water reminder web application featuring **Aqua**, an animated character mascot that keeps you hydrated throughout the day.

## Features

- **Cute Animated Mascot ("Aqua")**:
  - Horizontal walking animation with leg swing, body bobbing, and water bottle sway.
  - Interactive walk-in sequence: walks from left edge to center when reminder triggers.
  - Speech bubble prompt: *"💧 Time to drink water! Have a sip?"* with `[ Drank ]` and `[ Remind me later ]`.
  - Happy reaction & walk-out to the right when you drink; sad/neutral reaction & walk-out to the left when snoozed.
  - On-demand "Summon Aqua" button to test the mascot animation anytime.
- **Modern Wellness Aesthetic**:
  - Soft off-white backgrounds (`#F8FAFC`), crisp sky/aqua blue accents, rounded cards (`rounded-3xl`), and calm whitespace.
  - Fluid SVG circular progress ring displaying percentage, remaining ml, and target.
  - Visual glass tracker displaying filled cups according to your goal.
  - Quick-log buttons (+250ml Glass, +350ml Bottle, +500ml Flask, + Custom amount).
- **Customizable Reminder Schedule**:
  - Master ON/OFF toggle.
  - Active time window (Start & End time).
  - Configurable reminder frequency (every 30m, 45m, 1h, 1.5h, 2h).
  - Configurable snooze duration (15m, 30m, 45m).
  - Synthesized Web Audio chime & drink sound effects (no external audio files needed).
- **Daily Targets & Analytics**:
  - Target presets (1.5L, 2.0L, 2.5L, 3.0L) or custom input.
  - 7-day weekly consistency bar chart with goal comparison line.
  - Streak tracker, daily average, and today's log.
- **Mobile-First App Experience**:
  - Smartphone app shell on desktop, full screen on mobile.
  - Bottom navigation bar: Home | Goal | Progress | Settings.
  - Persistent state saved to `localStorage`.

## Tech Stack

- React 18 & TypeScript (Strict Mode)
- Vite 6
- Tailwind CSS & PostCSS
- Zustand (Persisted State)
- Lucide React
- Canvas Confetti & Web Audio API

## Running Locally

```bash
# Start dev server
npm run dev

# Build for production
npm run build
```
