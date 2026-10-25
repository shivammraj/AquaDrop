# Drink Water 💧 (DrinkWater Reminder)
> **Drink water, stay hydrated.** An easy-to-use, premium hydration reminder and daily water tracker — available as a Web App (PWA), Chrome/Edge Browser Extension, and VS Code Extension.

[![Live Demo](https://img.shields.io/badge/Live_Demo-Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://aqua-drop-seven.vercel.app/)
[![GitHub Repo](https://img.shields.io/badge/GitHub-AquaDrop-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/shivammraj/AquaDrop)

🔗 **Live Web App:** [https://aqua-drop-seven.vercel.app/](https://aqua-drop-seven.vercel.app/)

---

## ✨ What's New

- **Full Dark / Light / System Theme** — Instant switching with CSS custom properties and zero flash on load
- **Simplified Navigation** — Dashboard · Reminders · Appearance · About (no duplicate Settings)
- **Fixed Snooze** — `snoozeFor(minutes)` replaces the old race-condition approach; default is now 5 min
- **Snooze Toast** — Blue confirmation toast ("Reminder snoozed for 5 minutes") appears after each snooze
- **Voice Reminders** — Girl Voice, Boy Voice, or Chime-Only via Web Speech API
- **All Hydration Logs** — Full history shown (not just 6), with a "Clear all" button
- **Status Indicator** — Notification permission status clearly shown in Reminders
- **VS Code Workspace** — `.vscode/extensions.json`, `launch.json`, and `tasks.json` for one-click dev setup
- **Developer Credit** — About screen prominently credits **Designed & Developed by Shivam Mavi**

---

## 🚀 Features

- **Customizable Reminder Engine** — Set intervals (30m, 1h, 2h, or custom), snooze options, and daily tracking
- **Smart Snooze** — Quick snooze options: +5m, +10m, +15m, +30m (default: 5 min, configurable)
- **Voice Alerts** — Web Speech API spoken reminder in Girl, Boy, or Chime-only mode
- **Mascot & Celebration UI** — Kawaii 3D water drop mascot with animated breathing and celebratory confetti
- **Hydration Tracking** — Log glasses of water with full history, progress bars, and intake summary
- **Premium Themes** — Light, Dark, and System (follows OS preference) with instant hot-swap
- **Web Audio Chimes** — Gentle synthesized droplet chime; no external audio files required
- **Glassmorphic UI** — Tailwind CSS with animated status dock, accessible dialogs, and responsive layout
- **No Flash** — Inline script in `index.html` applies stored theme before React renders
- **Cross-Platform**:
  - 🌐 **Web App & PWA** — Offline-ready with Service Worker
  - 🧩 **Browser Extension** — Manifest V3 background alarms and action buttons
  - 💻 **VS Code Extension** — Status bar countdown and command palette controls

---

## 🌐 Web App (Vite + React + Tailwind CSS)

### Quick Start

```bash
# Install dependencies
npm install

# Start local dev server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

> **VS Code users:** Press `F5` after opening the project — the included `.vscode/launch.json` will start the Vite dev server and open Chrome automatically.

### Run Tests

```bash
npm test -- --run
```

8 automated tests covering: engine scheduling, pausing, resuming, snoozing (`snoozeFor`), validation, and state persistence.

### Production Build

```bash
npm run build
```

Output is bundled into `./dist`. Deploy to Vercel, Netlify, or any static host.

---

## 🧩 Browser Extension (Chrome, Edge, Brave)

Located in `extension/` — built with Manifest V3.

### How to Install (Developer Mode)

1. Open `chrome://extensions` (Chrome/Brave) or `edge://extensions` (Edge)
2. Enable **Developer mode**
3. Click **Load unpacked** → Select the `extension/` folder
4. Pin **AquaDrop** to your toolbar!

### Features
- Background Service Worker with `chrome.alarms` for accurate notifications
- Interactive notification action buttons
- Toolbar badge showing active/paused status
- Popup control panel with interval presets

---

## 💻 VS Code Extension

Located in `vscode-extension/`.

### Build and Run

```bash
cd vscode-extension
npm install
npm run compile
```

Press `F5` in VS Code to launch the Extension Development Host. You'll see `💧 AquaDrop · 30m` in the status bar.

### Commands (Command Palette: `Ctrl+Shift+P`)

| Command | Description |
|---------|-------------|
| `AquaDrop: Start Reminders` | Begin the hydration timer |
| `AquaDrop: Pause Reminders` | Pause the current schedule |
| `AquaDrop: I've Drunk Water` | Log a glass of water |
| `AquaDrop: Change Reminder Interval` | Open interval picker |
| `AquaDrop: Open Settings` | Configure extension settings |

### VS Code Settings (`settings.json`)

```json
{
  "aquadrop.intervalMinutes": 30,
  "aquadrop.snoozeMinutes": 5,
  "aquadrop.enabledByDefault": true,
  "aquadrop.trackHydration": true
}
```

---

## 🧪 Testing & Quality

- **8 Vitest tests** — engine scheduling, pausing, resuming, snoozing, validation
- **TypeScript strict** — full type coverage across web app and VS Code extension
- **Zero build errors** — `npm run build` produces a clean 210 kB bundle (60 kB gzipped)

---

## 📁 Project Structure

```
AquaDrop/
├── src/
│   ├── App.tsx                        # Root: theme, nav, modals, snooze toast
│   ├── index.css                      # CSS custom properties (light/dark/system)
│   ├── features/
│   │   ├── dashboard/
│   │   │   ├── Dashboard.tsx          # Main reminder card, interval picker, logs
│   │   │   ├── CompactDockWidget.tsx  # Bottom floating timer dock
│   │   │   └── DarkNotificationBanner.tsx
│   │   ├── reminders/
│   │   │   ├── RemindersScreen.tsx    # Intervals, snooze, notifications, voice
│   │   │   ├── ReminderModal.tsx      # Fullscreen reminder popup
│   │   │   └── ReminderIntervalModal.tsx
│   │   └── settings/
│   │       ├── AppearanceScreen.tsx   # Theme picker (Light/Dark/System)
│   │       └── AboutScreen.tsx        # Credits, version, privacy
│   ├── hooks/useReminder.ts           # React hook wrapping the engine
│   ├── services/
│   │   ├── reminder-engine.ts         # Core scheduler (timestamp-based)
│   │   ├── sound.ts                   # Web Audio chime + Web Speech voice
│   │   └── storage.ts                 # localStorage persistence
│   └── types/reminder.ts              # TypeScript types
├── extension/                         # Chrome/Edge MV3 extension
├── vscode-extension/                  # VS Code extension
├── .vscode/                           # VS Code workspace config
│   ├── extensions.json                # Recommended extensions
│   ├── launch.json                    # Debug in Chrome/Edge
│   └── tasks.json                     # Build / test / dev tasks
└── .github/workflows/                 # CI: build + test on push
```

---

## 👤 Credits

**Designed & Developed by [Shivam Mavi](https://github.com/shivammraj)**

> *Crafted with care for developers who forget to drink water.* 💙

---

## 📄 Privacy

All data is stored **locally** in your browser via `localStorage`. No servers, no accounts, no analytics. Clearing browser data resets all settings.

> **Platform note:** As a browser-based app, AquaDrop delivers reminders while your browser is open. Notifications cannot be delivered after the browser is completely closed. For persistent reminders, use the VS Code Extension or Browser Extension.
