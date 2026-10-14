# AquaDrop 💧
> **Drink water, stay hydrated.** A lightweight, production-ready hydration reminder and daily intake tracking ecosystem available as a Web App (PWA), Chrome/Edge Browser Extension (Manifest V3), and VS Code Extension.

[![Live Demo](https://img.shields.io/badge/Live_Demo-Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://aqua-drop-seven.vercel.app/)
[![GitHub Repo](https://img.shields.io/badge/GitHub-AquaDrop-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/shivammraj/AquaDrop)

🔗 **Live Web App:** [https://aqua-drop-seven.vercel.app/](https://aqua-drop-seven.vercel.app/)

---

## 🚀 Features

- **Customizable Reminder Engine**: Set intervals (15m, 30m, 45m, 1h, 2h, or custom minutes), snooze options, and daily tracking.
- **Cute 3D Mascot & Celebration UI**: Kawaii 3D water drop mascot with specular lighting, blush cheeks, and celebratory animations.
- **Hydration Tracking**: Log glasses of water with progress bars and intake history.
- **Pleasant Web Audio Chimes**: Gentle synthesized droplet chime when reminders trigger or water is logged.
- **Glassmorphic Modern UI**: Designed with Tailwind CSS, animated status docks, and accessible dialogs.
- **Cross-Platform**:
  - 🌐 **Web App & PWA**: Offline-ready with Service Worker notifications.
  - 🧩 **Browser Extension**: Manifest V3 background alarms, badge counter, and action buttons.
  - 💻 **VS Code Extension**: Status bar countdown ticker, command palette controls, and interactive quick pick menu.

---

## 🌐 Web App (Vite + React + Tailwind CSS)

### Development
```bash
# Install dependencies
npm install

# Start local dev server
npm run dev
```

### Run Tests
```bash
npm test -- --run
```

### Production Build
```bash
npm run build
```
The output will be bundled into `./dist`.

---

## 🧩 Browser Extension (Chrome, Edge, Brave)

The browser extension is located in the `extension/` directory and built with Manifest V3.

### How to Install (Load Unpacked)

1. Open your browser's extension management page:
   - **Chrome / Brave**: `chrome://extensions`
   - **Edge**: `edge://extensions`
2. Enable **Developer mode** (toggle in the top-right corner).
3. Click **Load unpacked**.
4. Select the `extension/` directory from this repository.
5. Pin **AquaDrop** to your toolbar!

### Features
- **Background Service Worker**: Uses `chrome.alarms` to trigger accurate notifications even when popup is closed.
- **Interactive Notifications**: Action buttons for *"I've drunk water"* and *"Remind me later"*.
- **Toolbar Badge**: Displays active status badge directly on the browser extension icon.
- **Popup Control Panel**: Quick intervals (30m, 1h, 2h, custom) and one-click intake logging.

---

## 💻 VS Code Extension

The VS Code extension is located in the `vscode-extension/` directory.

### Build and Compile
```bash
cd vscode-extension
npm install
npm run compile
```

### Testing in VS Code
1. Open the project root in VS Code.
2. Open `vscode-extension/src/extension.ts`.
3. Press `F5` to open the Extension Development Host window.
4. You will see `💧 AquaDrop · 30m` in the bottom-right status bar.

### Commands
Open the Command Palette (`Ctrl+Shift+P` / `Cmd+Shift+P`) and search:
- `AquaDrop: Start Reminders`
- `AquaDrop: Pause Reminders`
- `AquaDrop: I've Drunk Water`
- `AquaDrop: Change Reminder Interval`
- `AquaDrop: Open Settings`

### Settings Configuration
In your VS Code `settings.json`:
```json
{
  "aquadrop.intervalMinutes": 30,
  "aquadrop.snoozeMinutes": 10,
  "aquadrop.enabledByDefault": true,
  "aquadrop.trackHydration": true
}
```

---

## 🧪 Testing & Quality Assurance

- **Vitest**: 5 automated test cases verifying engine scheduling, pausing, resuming, snoozing, and validation.
- **TypeScript**: Strict type checking across both web app and VS Code extension runtimes.
