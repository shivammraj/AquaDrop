# AquaDrop — Hydration Reminder 💧

[![Version](https://img.shields.io/badge/version-0.1.0-blue.svg)](https://marketplace.visualstudio.com/items?itemName=Shivammavi.aquadrop)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)
[![Live Demo](https://img.shields.io/badge/Live_App-Vercel-000000?logo=vercel&logoColor=white)](https://aqua-drop-seven.vercel.app/)
[![GitHub Repo](https://img.shields.io/badge/GitHub-AquaDrop-181717?logo=github&logoColor=white)](https://github.com/shivammraj/AquaDrop)

**AquaDrop** is a friendly, lightweight, and reliable hydration reminder designed specifically for software engineers, students, and remote workers who spend extended hours coding in Visual Studio Code.

---

## ✨ Features

- 💧 **Authoritative Smart Scheduler** — Configurable reminder intervals (30m default; 15m, 45m, 60m, 90m, or custom up to 24h).
- ⏰ **Smart Snooze** — One-click 5-minute default snooze (or +10m, +15m) when deep in flow.
- 🔔 **Native Desktop Alerts** — Non-intrusive notifications with instant action buttons: "Drink Water" and "Snooze".
- 📊 **Activity Bar & Sidebar** — Live ticking countdown, today's break count, daily goal progress bar, and quick actions right in your side panel.
- 🚀 **Rich Interactive Dashboard** — Complete view featuring the friendly AquaDrop mascot, metrics, quick snoozes, recent 7-day history, and integrated settings.
- 🎨 **Adaptive Appearance** — Supports **System** (matches your active VS Code theme), **Light Mode**, and **Dark Mode**.
- 📍 **Status Bar Indicator** — Live countdown in the status bar (`💧 24m 12s` or `💧 Paused`) with one-click access to the dashboard.
- 💾 **Persistent & Overdue-Safe** — Preserves your schedule and break history across VS Code restarts; prevents notification flooding after sleep or wake.
- 🔒 **Privacy-First & Secure** — 100% local storage via VS Code Memento APIs, strict Content Security Policy (CSP), zero external network calls, and zero tracking.

---

## 🧭 Extension Usage

### 1. Activity Bar Sidebar
Click the **AquaDrop droplet icon** in your VS Code Activity Bar to open the side panel:
- View the live countdown until your next scheduled break.
- Track completed hydration breaks vs your daily target.
- Tap **Drink Water** to log a break and reset the timer.
- Tap **Snooze** or **Pause** when needed.

### 2. Interactive Dashboard
Run **`AquaDrop: Open Dashboard`** from the Command Palette (`Ctrl+Shift+P` / `Cmd+Shift+P`) or click the status bar item to open the full dashboard in an editor tab.

### 3. Desktop Notifications
When an interval elapses, a notification banner appears:
- Click **Drink Water** to record your break.
- Click **Snooze (5m)** to pause alerts for 5 minutes.

---

## ⚙️ Extension Settings

Configure AquaDrop in **Settings** (`Ctrl+,` or `Cmd+,`) under **AquaDrop**:

| Setting | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `aquadrop.remindersEnabled` | `boolean` | `true` | Enable or disable automatic hydration reminders. |
| `aquadrop.intervalMinutes` | `number` | `30` | Reminder interval in minutes (1 – 1440). |
| `aquadrop.snoozeMinutes` | `number` | `5` | Snooze duration in minutes (1 – 180). |
| `aquadrop.notificationsEnabled` | `boolean` | `true` | Show native desktop notifications when reminders trigger. |
| `aquadrop.dailyGoal` | `number` | `8` | Target number of daily water breaks. |
| `aquadrop.appearance` | `string` | `"system"` | Visual appearance theme: `system`, `light`, or `dark`. |

---

## ⌨️ Contributed Commands

All commands are accessible from the Command Palette (`Ctrl+Shift+P` / `Cmd+Shift+P`):

- **`AquaDrop: Open Dashboard`** — Open the interactive dashboard tab.
- **`AquaDrop: Drink Water`** — Log a completed water break.
- **`AquaDrop: Snooze Reminder`** — Snooze the reminder for the configured duration.
- **`AquaDrop: Pause Reminders`** — Pause reminders and stop countdown.
- **`AquaDrop: Resume Reminders`** — Resume scheduled hydration reminders.
- **`AquaDrop: Toggle Reminders`** — Toggle reminders on or off.
- **`AquaDrop: Change Reminder Interval`** — QuickPick to switch interval presets or enter a custom duration.
- **`AquaDrop: Reset Daily Progress`** — Reset today's break counter back to 0.
- **`AquaDrop: Open Settings`** — Jump directly to AquaDrop settings in VS Code.

---

## ⚠️ Important Notices & Disclaimers

1. **Habit Tracking Disclaimer**: Data collected represents completed breaks for personal productivity and habit building. It does not measure physical fluid intake or constitute medical advice.
2. **Workstation Sleep**: Reminders require Visual Studio Code to be running; scheduled alerts pause while VS Code is closed or your computer is asleep.

---

## 👨‍💻 Author & Credits

- **Designed & Developed by**: **Shivam Mavi**
- **Official Web App**: [https://aqua-drop-seven.vercel.app/](https://aqua-drop-seven.vercel.app/)
- **Source Code & Issues**: [https://github.com/shivammraj/AquaDrop](https://github.com/shivammraj/AquaDrop)

---

## 📄 License

Licensed under the [MIT License](LICENSE).
