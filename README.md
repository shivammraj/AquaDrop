# Drink_water

This repository has been initialized with the AquaDrop foundation scaffold.

What's included:

- Vite + React + TypeScript project structure
- Tailwind CSS configuration and base styles
- A simple, reusable ReminderEngine (browser) that persists state in localStorage and coordinates across tabs using BroadcastChannel
- Minimal dashboard and settings screens to continue development
- SVG mascot assets as local fallbacks (replace with high-quality PNGs in src/assets/)

Quick start

1. Install dependencies:

   npm install

2. Run development server:

   npm run dev

3. Build for production:

   npm run build

Notes and next steps

- The current code provides a working foundation (Phase 1). The reminder engine is intentionally simple but structured for tests and reuse.
- Replace SVG mascot files in src/assets with PNGs (water-drop-mascot.png, water-drop-icon.png, etc.) when available. The app will gracefully use the SVG fallback.
- Implement additional features per the project MASTER PROMPT: reminder pop-up UI, snooze/record actions, hydration tracking, PWA service worker, browser extension manifest, and VS Code extension project. I'll continue by adding the reminder pop-up UI and unit tests for the engine unless you'd like a different next step.

License: Add a license file when ready.
