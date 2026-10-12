### Browser extension (Chrome/Edge) — Load unpacked

1. Build the web app first if you want to reuse assets: `npm run build`.
2. Open `chrome://extensions` (or edge://extensions).
3. Enable "Developer mode".
4. Click "Load unpacked" and select the `extension/` directory from this repository.

Notes:

- The extension uses `chrome.alarms` and `chrome.notifications` for scheduling and reminders.
- The popup is intentionally lightweight and communicates with the background service worker through `chrome.runtime.sendMessage`.
- Icons in the extension are SVG files placed under `extension/icons/`.
