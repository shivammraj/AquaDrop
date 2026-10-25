import { AquaDropSnapshot } from '../types'
import { generateNonce } from '../utils'
import { AQUADROP_ICON_SVG, AQUADROP_MASCOT_SVG } from './mascot'

export function getSharedStyles(): string {
  return `
    :root {
      --aq-primary: #0284c7;
      --aq-primary-hover: #0369a1;
      --aq-primary-soft: rgba(2, 132, 199, 0.12);
      --aq-primary-border: rgba(2, 132, 199, 0.28);
      --aq-success: #10b981;
      --aq-warning: #f59e0b;
      --aq-accent: #38bdf8;
      --aq-bg: var(--vscode-editor-background, #0f172a);
      --aq-fg: var(--vscode-editor-foreground, #f8fafc);
      --aq-card-bg: var(--vscode-sideBar-background, rgba(30, 41, 59, 0.7));
      --aq-card-border: var(--vscode-widget-border, rgba(148, 163, 184, 0.18));
      --aq-muted: var(--vscode-descriptionForeground, #94a3b8);
      --aq-input-bg: var(--vscode-input-background, rgba(15, 23, 42, 0.6));
      --aq-input-fg: var(--vscode-input-foreground, #f8fafc);
      --aq-input-border: var(--vscode-input-border, rgba(148, 163, 184, 0.3));
    }

    body[data-appearance="light"] {
      --aq-bg: #f8fafc;
      --aq-fg: #0f172a;
      --aq-card-bg: #ffffff;
      --aq-card-border: rgba(148, 163, 184, 0.25);
      --aq-muted: #64748b;
      --aq-input-bg: #f1f5f9;
      --aq-input-fg: #0f172a;
      --aq-input-border: #cbd5e1;
    }

    body[data-appearance="dark"] {
      --aq-bg: #0b1329;
      --aq-fg: #f1f5f9;
      --aq-card-bg: #131d3b;
      --aq-card-border: rgba(56, 189, 248, 0.2);
      --aq-muted: #94a3b8;
      --aq-input-bg: #0c1427;
      --aq-input-fg: #f8fafc;
      --aq-input-border: rgba(56, 189, 248, 0.3);
    }

    * { box-sizing: border-box; }
    body {
      font-family: var(--vscode-font-family, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif);
      font-size: var(--vscode-font-size, 13px);
      color: var(--aq-fg);
      background-color: var(--aq-bg);
      margin: 0;
      padding: 0;
      line-height: 1.5;
    }

    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      padding: 8px 14px;
      border-radius: 8px;
      font-weight: 600;
      font-size: 13px;
      cursor: pointer;
      border: 1px solid transparent;
      transition: all 0.15s ease;
      text-decoration: none;
      user-select: none;
    }
    .btn:focus-visible {
      outline: 2px solid var(--aq-accent);
      outline-offset: 2px;
    }
    .btn-primary {
      background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%);
      color: #ffffff;
      box-shadow: 0 2px 8px rgba(2, 132, 199, 0.35);
    }
    .btn-primary:hover {
      background: linear-gradient(135deg, #0369a1 0%, #075985 100%);
      transform: translateY(-1px);
    }
    .btn-primary:active {
      transform: translateY(0);
    }
    .btn-secondary {
      background: var(--aq-primary-soft);
      color: var(--aq-fg);
      border-color: var(--aq-primary-border);
    }
    .btn-secondary:hover {
      background: rgba(2, 132, 199, 0.2);
    }
    .btn-outline {
      background: transparent;
      color: var(--aq-muted);
      border-color: var(--aq-card-border);
    }
    .btn-outline:hover {
      color: var(--aq-fg);
      border-color: var(--aq-muted);
      background: rgba(255, 255, 255, 0.04);
    }
    .btn-block {
      width: 100%;
    }

    .status-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 4px 10px;
      border-radius: 999px;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .status-badge.active {
      background: rgba(16, 185, 129, 0.15);
      color: #10b981;
      border: 1px solid rgba(16, 185, 129, 0.3);
    }
    .status-badge.paused {
      background: rgba(245, 158, 11, 0.15);
      color: #f59e0b;
      border: 1px solid rgba(245, 158, 11, 0.3);
    }
    .status-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: currentColor;
    }

    .progress-bar {
      width: 100%;
      height: 8px;
      border-radius: 999px;
      background: rgba(148, 163, 184, 0.2);
      overflow: hidden;
      margin: 8px 0;
    }
    .progress-fill {
      height: 100%;
      background: linear-gradient(90deg, #38bdf8, #0284c7);
      border-radius: 999px;
      transition: width 0.3s ease;
    }

    .mascot-container {
      display: flex;
      justify-content: center;
      align-items: center;
      animation: gentleBreathing 4s ease-in-out infinite;
    }
    @keyframes gentleBreathing {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-4px); }
    }

    .aquadrop-toast {
      background: var(--aq-card-bg);
      border: 1.5px solid var(--aq-accent);
      border-radius: 12px;
      padding: 12px 14px;
      margin-bottom: 12px;
      box-shadow: 0 8px 24px rgba(2, 132, 199, 0.28);
      animation: toastSlideDown 0.25s cubic-bezier(0.16, 1, 0.3, 1);
      position: relative;
    }
    @keyframes toastSlideDown {
      from { opacity: 0; transform: translateY(-8px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .toast-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
    }
    .toast-brand {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .toast-mascot {
      width: 32px;
      height: 32px;
      flex-shrink: 0;
    }
    .toast-titles {
      display: flex;
      flex-direction: column;
    }
    .toast-title {
      font-size: 13px;
      font-weight: 700;
      color: var(--aq-fg);
      line-height: 1.2;
    }
    .toast-subtitle {
      font-size: 12px;
      font-weight: 600;
      color: var(--aq-accent);
      margin-top: 2px;
    }
    .toast-close {
      background: transparent;
      border: none;
      color: var(--aq-muted);
      cursor: pointer;
      font-size: 18px;
      line-height: 1;
      padding: 4px;
      border-radius: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: color 0.15s ease, background 0.15s ease;
    }
    .toast-close:hover {
      color: var(--aq-fg);
      background: rgba(255, 255, 255, 0.08);
    }
    .toast-close:focus-visible {
      outline: 2px solid var(--aq-accent);
    }
    .toast-actions {
      display: flex;
      gap: 8px;
      margin-top: 10px;
    }
    .voice-cards-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
      gap: 10px;
      margin-top: 8px;
    }
    .voice-card {
      background: var(--aq-card-bg);
      border: 1px solid var(--aq-card-border);
      border-radius: 10px;
      padding: 10px 12px;
      cursor: pointer;
      text-align: left;
      transition: all 0.15s ease;
      color: var(--aq-fg);
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    .voice-card:hover {
      border-color: var(--aq-accent);
      transform: translateY(-1px);
    }
    .voice-card.active {
      background: var(--aq-primary-soft);
      border-color: #38bdf8;
      box-shadow: 0 0 0 1px #38bdf8;
    }
    .voice-card-title {
      font-size: 13px;
      font-weight: 700;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .voice-card-desc {
      font-size: 11px;
      color: var(--aq-muted);
    }
    .live-sound-btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: var(--aq-primary-soft);
      border: 1px solid var(--aq-primary-border);
      color: #38bdf8;
      border-radius: 999px;
      padding: 4px 12px;
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.15s ease;
    }
    .live-sound-btn:hover {
      background: rgba(2, 132, 199, 0.22);
      transform: scale(1.02);
    }
  `
}

export function buildSidebarHtml(snapshot: AquaDropSnapshot): string {
  const nonce = generateNonce()
  const isRunning = snapshot.enabled && !snapshot.paused

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src data: https:; style-src 'unsafe-inline'; script-src 'nonce-${nonce}';">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>AquaDrop</title>
  <style>
    ${getSharedStyles()}
    body { padding: 12px; }
    .sidebar-card {
      background: var(--aq-card-bg);
      border: 1px solid var(--aq-card-border);
      border-radius: 12px;
      padding: 14px;
      margin-bottom: 12px;
    }
    .header-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 12px;
    }
    .brand-title {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 14px;
      font-weight: 700;
    }
    .mascot-mini {
      width: 32px;
      height: 32px;
    }
    .countdown-display {
      font-size: 1.8rem;
      font-weight: 800;
      color: #38bdf8;
      text-align: center;
      margin: 8px 0;
      letter-spacing: -0.02em;
      font-variant-numeric: tabular-nums;
    }
    .stats-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;
      margin: 12px 0;
    }
    .stat-box {
      background: var(--aq-primary-soft);
      border: 1px solid var(--aq-primary-border);
      border-radius: 8px;
      padding: 8px;
      text-align: center;
    }
    .stat-label {
      font-size: 11px;
      color: var(--aq-muted);
      text-transform: uppercase;
      font-weight: 600;
    }
    .stat-value {
      font-size: 16px;
      font-weight: 700;
      margin-top: 2px;
    }
    .actions-grid {
      display: flex;
      flex-direction: column;
      gap: 8px;
      margin-top: 12px;
    }
    .button-duo {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;
    }
    .disclaimer-text {
      font-size: 11px;
      color: var(--aq-muted);
      text-align: center;
      margin-top: 10px;
      line-height: 1.4;
    }
  </style>
</head>
<body data-appearance="${snapshot.appearance}">
  <!-- AquaDrop Branded Popup / Toast -->
  <div id="aquaDropToast" class="aquadrop-toast" role="alert" aria-live="assertive" style="display: none;">
    <div class="toast-header">
      <div class="toast-brand">
        <div class="toast-mascot mascot-container">${AQUADROP_ICON_SVG}</div>
        <div class="toast-titles">
          <span class="toast-title">Drink water, stay hydrated.</span>
          <span class="toast-subtitle">Time for a water break 💧</span>
        </div>
      </div>
      <button id="toastCloseBtn" class="toast-close" aria-label="Dismiss water reminder" tabindex="0" title="Dismiss">&times;</button>
    </div>
    <div class="toast-actions">
      <button id="toastDrinkBtn" class="btn btn-primary" style="flex: 1;">
        💧 Drink Water
      </button>
      <button id="toastSnoozeBtn" class="btn btn-secondary" style="flex: 1;">
        ⏰ Snooze (${snapshot.snoozeMinutes}m)
      </button>
    </div>
  </div>

  <div class="sidebar-card">
    <div class="header-row">
      <div class="brand-title">
        <div class="mascot-mini mascot-container">${AQUADROP_ICON_SVG}</div>
        <span>AquaDrop</span>
      </div>
      <div id="statusBadge" class="status-badge ${isRunning ? 'active' : 'paused'}">
        <span class="status-dot"></span>
        <span id="statusText">${isRunning ? 'Active' : 'Paused'}</span>
      </div>
    </div>

    <div class="stat-label" style="text-align:center;">Next Hydration Break</div>
    <div id="countdown" class="countdown-display">${snapshot.countdownText}</div>

    <div style="display: flex; justify-content: center; margin: 4px 0 10px;">
      <button id="sidebarLiveSoundBtn" class="live-sound-btn" type="button" title="Test drinking sound &amp; voice alert">
        🔊 Play Sound (<span id="sidebarVoiceLabel">${snapshot.voiceType === 'male' ? 'Boy' : snapshot.voiceType === 'chime-only' ? 'Chime' : 'Girl'}</span>)
      </button>
    </div>

    <div class="progress-bar">
      <div id="progressBar" class="progress-fill" style="width: ${snapshot.progressPercent}%"></div>
    </div>

    <div class="stats-row">
      <div class="stat-box">
        <div class="stat-label">Today's Breaks</div>
        <div id="todayCount" class="stat-value">${snapshot.todayCount}</div>
      </div>
      <div class="stat-box">
        <div class="stat-label">Daily Goal</div>
        <div id="dailyGoal" class="stat-value">${snapshot.dailyGoal}</div>
      </div>
    </div>

    <div class="actions-grid">
      <button class="btn btn-primary btn-block" data-cmd="drinkWater">
        💧 Drink Water
      </button>
      <div class="button-duo">
        <button class="btn btn-secondary" data-cmd="snoozeReminder">
          ⏰ Snooze (${snapshot.snoozeMinutes}m)
        </button>
        <button id="toggleBtn" class="btn btn-secondary" data-cmd="${isRunning ? 'pauseReminders' : 'resumeReminders'}">
          ${isRunning ? '⏸ Pause' : '▶ Resume'}
        </button>
      </div>
      <button class="btn btn-outline btn-block" data-cmd="openDashboard">
        📊 Open Dashboard
      </button>
    </div>

    <!-- Voice Persona & Water Sound Selector -->
    <div style="margin-top: 14px; padding-top: 12px; border-top: 1px solid var(--aq-card-border);">
      <div class="stat-label" style="text-align: left; margin-bottom: 6px;">Voice &amp; Water Sound</div>
      <div class="voice-cards-grid" style="grid-template-columns: repeat(3, 1fr);">
        <button type="button" class="voice-card ${snapshot.voiceType === 'female' ? 'active' : ''}" data-voice="female" title="Warm girl voice with realistic drinking sound &amp; chime">
          <span class="voice-card-title">👧 Girl</span>
          <span class="voice-card-desc">Warm alert</span>
        </button>
        <button type="button" class="voice-card ${snapshot.voiceType === 'male' ? 'active' : ''}" data-voice="male" title="Clear boy voice with realistic drinking sound &amp; chime">
          <span class="voice-card-title">👦 Boy</span>
          <span class="voice-card-desc">Clear alert</span>
        </button>
        <button type="button" class="voice-card ${snapshot.voiceType === 'chime-only' ? 'active' : ''}" data-voice="chime-only" title="Realistic drinking sound &amp; bubble drop chime only">
          <span class="voice-card-title">🔔 Chime</span>
          <span class="voice-card-desc">Water only</span>
        </button>
      </div>
    </div>
  </div>

  <p class="disclaimer-text">
    Completed breaks track habits, not medical advice. Keep VS Code open for scheduled alerts.
  </p>

  <script nonce="${nonce}">
    const vscode = acquireVsCodeApi();
    let currentNextReminder = ${snapshot.nextReminderAt ?? 'null'};
    let currentEnabled = ${snapshot.enabled};
    let currentPaused = ${snapshot.paused};
    let currentSoundEnabled = ${snapshot.soundEnabled};
    let currentVoiceType = '${snapshot.voiceType}';
    let currentSnoozeMinutes = ${snapshot.snoozeMinutes};

    // Realistic Water Drinking Audio Synthesizer (Rhythmic gulps + liquid swallow resonance + water drop)
    function playDrinkingSound() {
      try {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (!AudioCtx) return;
        const ctx = new AudioCtx();
        if (ctx.state === 'suspended') {
          ctx.resume().catch(() => {});
        }
        const now = ctx.currentTime;

        const createGulp = (startTime, startFreq, endFreq, vol) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(startFreq, startTime);
          osc.frequency.exponentialRampToValueAtTime(endFreq, startTime + 0.14);

          gain.gain.setValueAtTime(0, startTime);
          gain.gain.linearRampToValueAtTime(vol, startTime + 0.02);
          gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.16);

          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(startTime);
          osc.stop(startTime + 0.18);

          // Throat resonance pop
          const subOsc = ctx.createOscillator();
          const subGain = ctx.createGain();
          subOsc.type = 'sine';
          subOsc.frequency.setValueAtTime(140, startTime + 0.02);
          subOsc.frequency.exponentialRampToValueAtTime(70, startTime + 0.13);

          subGain.gain.setValueAtTime(0, startTime + 0.02);
          subGain.gain.linearRampToValueAtTime(vol * 0.6, startTime + 0.04);
          subGain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.15);

          subOsc.connect(subGain);
          subGain.connect(ctx.destination);
          subOsc.start(startTime + 0.02);
          subOsc.stop(startTime + 0.16);
        };

        // Realistic rhythmic water drinking sequence (glug... glug... gulp)
        createGulp(now, 420, 220, 0.28);
        createGulp(now + 0.22, 380, 190, 0.25);
        createGulp(now + 0.44, 340, 170, 0.22);

        // Refreshing water drop splash finish
        const dropOsc = ctx.createOscillator();
        const dropGain = ctx.createGain();
        dropOsc.type = 'sine';
        dropOsc.frequency.setValueAtTime(1300, now + 0.64);
        dropOsc.frequency.exponentialRampToValueAtTime(1850, now + 0.72);
        dropOsc.frequency.exponentialRampToValueAtTime(1450, now + 0.84);

        dropGain.gain.setValueAtTime(0, now + 0.64);
        dropGain.gain.linearRampToValueAtTime(0.18, now + 0.66);
        dropGain.gain.exponentialRampToValueAtTime(0.001, now + 0.95);

        dropOsc.connect(dropGain);
        dropGain.connect(ctx.destination);
        dropOsc.start(now + 0.64);
        dropOsc.stop(now + 0.98);
      } catch (err) {
        console.warn('AquaDrop drinking sound error:', err);
      }
    }

    // Pleasant Water Drop Chime
    function playWaterChime() {
      try {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (!AudioCtx) return;
        const ctx = new AudioCtx();
        if (ctx.state === 'suspended') {
          ctx.resume().catch(() => {});
        }
        const now = ctx.currentTime;

        const osc1 = ctx.createOscillator();
        const gain1 = ctx.createGain();
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(600, now);
        osc1.frequency.exponentialRampToValueAtTime(1400, now + 0.08);
        osc1.frequency.exponentialRampToValueAtTime(950, now + 0.18);

        gain1.gain.setValueAtTime(0, now);
        gain1.gain.linearRampToValueAtTime(0.25, now + 0.02);
        gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

        osc1.connect(gain1);
        gain1.connect(ctx.destination);
        osc1.start(now);
        osc1.stop(now + 0.32);

        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(1100, now + 0.05);
        osc2.frequency.exponentialRampToValueAtTime(1800, now + 0.12);
        osc2.frequency.exponentialRampToValueAtTime(1200, now + 0.28);

        gain2.gain.setValueAtTime(0, now + 0.05);
        gain2.gain.linearRampToValueAtTime(0.18, now + 0.08);
        gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.38);

        osc2.connect(gain2);
        gain2.connect(ctx.destination);
        osc2.start(now + 0.05);
        osc2.stop(now + 0.4);
      } catch (err) {
        console.warn('AquaDrop audio playback error:', err);
      }
    }

    // Speaks hydration reminder using Web Speech API (Boy or Girl persona)
    function speakVoiceAlert(voiceType) {
      if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
      if (voiceType === 'chime-only') return;

      try {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance('Drink water, stay hydrated, and continue your work!');
        utterance.rate = 0.95;

        const voices = window.speechSynthesis.getVoices() || [];
        const englishVoices = voices.filter(v => v.lang && v.lang.startsWith('en'));

        if (voiceType === 'male') {
          const maleVoice = englishVoices.find(v => /david|guy|mark|alex|daniel|george|male|oliver|arthur|rishi/i.test(v.name))
            || englishVoices.find(v => !/zira|jenny|samantha|victoria|karen|susan|female|fiona|moira|tessa/i.test(v.name))
            || voices[0];
          if (maleVoice) utterance.voice = maleVoice;
          utterance.pitch = 0.85; // Encouraging, confident male tone
        } else {
          const femaleVoice = englishVoices.find(v => /zira|jenny|samantha|victoria|karen|susan|female|fiona|moira|tessa/i.test(v.name))
            || englishVoices[0]
            || voices[0];
          if (femaleVoice) utterance.voice = femaleVoice;
          utterance.pitch = 1.15; // Friendly, warm female tone
        }

        window.speechSynthesis.speak(utterance);
      } catch (err) {
        console.warn('AquaDrop speech error:', err);
      }
    }

    // Plays the realistic drinking water sound + chime + voice alert
    function playFullReminderSound(voiceType) {
      const v = voiceType || currentVoiceType || 'female';
      playDrinkingSound();
      setTimeout(() => {
        playWaterChime();
      }, 400);
      if (v !== 'chime-only') {
        setTimeout(() => {
          speakVoiceAlert(v);
        }, 950);
      }
    }

    function showToast(snoozeMin, playSoundOption, voiceType) {
      const toast = document.getElementById('aquaDropToast');
      if (toast) {
        const snoozeBtn = document.getElementById('toastSnoozeBtn');
        if (snoozeBtn && snoozeMin) {
          snoozeBtn.textContent = '⏰ Snooze (' + snoozeMin + 'm)';
          currentSnoozeMinutes = snoozeMin;
        }
        toast.style.display = 'block';
      }
      if (playSoundOption && currentSoundEnabled) {
        playFullReminderSound(voiceType || currentVoiceType);
      }
    }

    function hideToast() {
      const toast = document.getElementById('aquaDropToast');
      if (toast) {
        toast.style.display = 'none';
      }
    }

    const toastClose = document.getElementById('toastCloseBtn');
    if (toastClose) {
      toastClose.addEventListener('click', () => {
        hideToast();
        vscode.postMessage({ type: 'dismissToast' });
      });
    }

    const toastDrink = document.getElementById('toastDrinkBtn');
    if (toastDrink) {
      toastDrink.addEventListener('click', () => {
        playDrinkingSound();
        hideToast();
        vscode.postMessage({ type: 'command', command: 'drinkWater' });
      });
    }

    const toastSnooze = document.getElementById('toastSnoozeBtn');
    if (toastSnooze) {
      toastSnooze.addEventListener('click', () => {
        hideToast();
        vscode.postMessage({ type: 'command', command: 'snoozeReminder', payload: { minutes: currentSnoozeMinutes } });
      });
    }

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        const toast = document.getElementById('aquaDropToast');
        if (toast && toast.style.display !== 'none') {
          hideToast();
          vscode.postMessage({ type: 'dismissToast' });
        }
      }
    });

    const liveSoundBtn = document.getElementById('sidebarLiveSoundBtn');
    if (liveSoundBtn) {
      liveSoundBtn.addEventListener('click', () => {
        playFullReminderSound(currentVoiceType);
      });
    }

    // Voice Persona Card Buttons
    document.querySelectorAll('[data-voice]').forEach(btn => {
      btn.addEventListener('click', () => {
        const voice = btn.getAttribute('data-voice');
        if (voice) {
          currentVoiceType = voice;
          document.querySelectorAll('[data-voice]').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          const lbl = document.getElementById('sidebarVoiceLabel');
          if (lbl) {
            lbl.textContent = voice === 'male' ? 'Boy' : (voice === 'chime-only' ? 'Chime' : 'Girl');
          }
          vscode.postMessage({ type: 'updateSetting', key: 'voiceType', value: voice });
          playFullReminderSound(voice);
        }
      });
    });

    function formatTime(nextReminder) {
      if (nextReminder === null || !currentEnabled || currentPaused) {
        return 'Paused';
      }
      const diff = Math.max(0, nextReminder - Date.now());
      if (diff <= 0) return 'Due now';
      const sec = Math.floor(diff / 1000);
      const m = Math.floor((sec % 3600) / 60);
      const s = sec % 60;
      const h = Math.floor(sec / 3600);
      if (h > 0) return h + 'h ' + String(m).padStart(2, '0') + 'm ' + String(s).padStart(2, '0') + 's';
      return String(m).padStart(2, '0') + 'm ' + String(s).padStart(2, '0') + 's';
    }

    function tick() {
      const el = document.getElementById('countdown');
      if (el) {
        el.textContent = formatTime(currentNextReminder);
      }
    }

    setInterval(tick, 1000);

    document.querySelectorAll('[data-cmd]').forEach(btn => {
      btn.addEventListener('click', () => {
        const cmd = btn.getAttribute('data-cmd');
        if (cmd) {
          if (cmd === 'drinkWater') {
            playDrinkingSound();
          }
          vscode.postMessage({ type: 'command', command: cmd });
        }
      });
    });

    window.addEventListener('message', event => {
      const msg = event.data;
      if (!msg) return;

      if (msg.type === 'showReminder') {
        showToast(msg.snoozeMinutes, msg.sound, msg.voiceType);
        return;
      }

      if (msg.type === 'dismissReminder') {
        hideToast();
        return;
      }

      if (msg.type === 'playSound') {
        playFullReminderSound(msg.voiceType || currentVoiceType);
        return;
      }

      if (msg.type === 'syncState' && msg.state) {
        const s = msg.state;
        currentNextReminder = s.nextReminderAt;
        currentEnabled = s.enabled;
        currentPaused = s.paused;
        currentSoundEnabled = Boolean(s.soundEnabled);
        currentVoiceType = s.voiceType || 'female';
        currentSnoozeMinutes = s.snoozeMinutes;
        document.body.setAttribute('data-appearance', s.appearance);

        const isRun = s.enabled && !s.paused;
        const badge = document.getElementById('statusBadge');
        if (badge) {
          badge.className = 'status-badge ' + (isRun ? 'active' : 'paused');
        }
        const statusText = document.getElementById('statusText');
        if (statusText) statusText.textContent = isRun ? 'Active' : 'Paused';

        const todayCount = document.getElementById('todayCount');
        if (todayCount) todayCount.textContent = String(s.todayCount);

        const dailyGoal = document.getElementById('dailyGoal');
        if (dailyGoal) dailyGoal.textContent = String(s.dailyGoal);

        const progress = document.getElementById('progressBar');
        if (progress) progress.style.width = s.progressPercent + '%';

        const toggleBtn = document.getElementById('toggleBtn');
        if (toggleBtn) {
          toggleBtn.setAttribute('data-cmd', isRun ? 'pauseReminders' : 'resumeReminders');
          toggleBtn.textContent = isRun ? '⏸ Pause' : '▶ Resume';
        }

        const vLbl = document.getElementById('sidebarVoiceLabel');
        if (vLbl) {
          vLbl.textContent = currentVoiceType === 'male' ? 'Boy' : (currentVoiceType === 'chime-only' ? 'Chime' : 'Girl');
        }
        document.querySelectorAll('[data-voice]').forEach(b => {
          b.classList.toggle('active', b.getAttribute('data-voice') === currentVoiceType);
        });

        tick();
      }
    });

    vscode.postMessage({ type: 'ready' });
  </script>
</body>
</html>`
}

export function buildDashboardHtml(snapshot: AquaDropSnapshot): string {
  const nonce = generateNonce()
  const isRunning = snapshot.enabled && !snapshot.paused

  const recentHistoryHtml = snapshot.recentHistory.length > 0
    ? snapshot.recentHistory.map(item => `
        <div class="history-row">
          <span class="history-date">${item.date}</span>
          <div class="history-bar-wrap">
            <div class="history-bar" style="width: ${Math.min(100, Math.round((item.count / Math.max(snapshot.dailyGoal, 1)) * 100))}%"></div>
          </div>
          <span class="history-count"><strong>${item.count}</strong> breaks</span>
        </div>
      `).join('')
    : '<div class="empty-state">No water breaks recorded yet. Click "Drink Water" to log your first!</div>'

  const lastBreakFormatted = snapshot.lastDrinkAt
    ? new Date(snapshot.lastDrinkAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : 'None yet today'

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src data: https:; style-src 'unsafe-inline'; script-src 'nonce-${nonce}';">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>AquaDrop Dashboard</title>
  <style>
    ${getSharedStyles()}
    body {
      padding: 24px;
      max-width: 960px;
      margin: 0 auto;
    }
    .dashboard-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 24px;
      padding-bottom: 16px;
      border-bottom: 1px solid var(--aq-card-border);
      flex-wrap: wrap;
      gap: 16px;
    }
    .brand-section {
      display: flex;
      align-items: center;
      gap: 16px;
    }
    .mascot-large {
      width: 64px;
      height: 64px;
    }
    .header-text h1 {
      margin: 0;
      font-size: 24px;
      font-weight: 800;
      letter-spacing: -0.02em;
    }
    .header-text p {
      margin: 4px 0 0;
      color: var(--aq-muted);
      font-size: 13px;
    }
    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
      gap: 16px;
      margin-bottom: 24px;
    }
    .metric-card {
      background: var(--aq-card-bg);
      border: 1px solid var(--aq-card-border);
      border-radius: 12px;
      padding: 16px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }
    .metric-title {
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: var(--aq-muted);
      font-weight: 700;
    }
    .metric-number {
      font-size: 26px;
      font-weight: 800;
      color: #38bdf8;
      margin: 8px 0;
      font-variant-numeric: tabular-nums;
    }
    .metric-footer {
      font-size: 12px;
      color: var(--aq-muted);
    }
    .section-card {
      background: var(--aq-card-bg);
      border: 1px solid var(--aq-card-border);
      border-radius: 12px;
      padding: 20px;
      margin-bottom: 24px;
    }
    .section-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 16px;
    }
    .section-title {
      font-size: 16px;
      font-weight: 700;
      margin: 0;
    }
    .action-bar {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
      align-items: center;
    }
    .settings-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
      gap: 18px;
    }
    .form-group {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .form-label {
      font-size: 12px;
      font-weight: 600;
      color: var(--aq-fg);
    }
    .form-description {
      font-size: 11px;
      color: var(--aq-muted);
      margin: 0;
    }
    .form-control {
      background: var(--aq-input-bg);
      color: var(--aq-input-fg);
      border: 1px solid var(--aq-input-border);
      border-radius: 8px;
      padding: 8px 12px;
      font-size: 13px;
      outline: none;
      transition: border-color 0.15s ease;
    }
    .form-control:focus {
      border-color: #38bdf8;
    }
    .toggle-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 8px 0;
    }
    .history-list {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .history-row {
      display: flex;
      align-items: center;
      gap: 12px;
      font-size: 13px;
    }
    .history-date {
      width: 100px;
      font-weight: 600;
    }
    .history-bar-wrap {
      flex: 1;
      height: 8px;
      background: rgba(148, 163, 184, 0.15);
      border-radius: 999px;
      overflow: hidden;
    }
    .history-bar {
      height: 100%;
      background: linear-gradient(90deg, #38bdf8, #0284c7);
      border-radius: 999px;
    }
    .history-count {
      width: 80px;
      text-align: right;
      color: var(--aq-muted);
    }
    .empty-state {
      padding: 24px;
      text-align: center;
      color: var(--aq-muted);
      font-style: italic;
    }
    .about-details {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 16px;
      margin-top: 14px;
      font-size: 13px;
      color: var(--aq-muted);
    }
    .about-item strong {
      color: var(--aq-fg);
    }
    a.aq-link {
      color: #38bdf8;
      text-decoration: none;
    }
    a.aq-link:hover {
      text-decoration: underline;
    }
    .preset-pills {
      display: flex;
      gap: 6px;
      margin-top: 6px;
    }
    .preset-pill {
      background: var(--aq-primary-soft);
      border: 1px solid var(--aq-primary-border);
      color: var(--aq-fg);
      padding: 4px 8px;
      border-radius: 6px;
      font-size: 11px;
      font-weight: 600;
      cursor: pointer;
    }
    .preset-pill:hover {
      background: rgba(2, 132, 199, 0.25);
    }
  </style>
</head>
<body data-appearance="${snapshot.appearance}">
  <header class="dashboard-header">
    <div class="brand-section">
      <div class="mascot-large mascot-container">${AQUADROP_MASCOT_SVG}</div>
      <div class="header-text">
        <h1>AquaDrop Dashboard</h1>
        <p>Smart hydration reminders designed for productive software engineering.</p>
      </div>
    </div>
    <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
      <button id="dashboardLiveSoundBtn" class="live-sound-btn" type="button" title="Test drinking sound &amp; voice alert">
        🔊 Play Sound (<span id="dashboardVoiceLabel">${snapshot.voiceType === 'male' ? 'Boy' : snapshot.voiceType === 'chime-only' ? 'Chime' : 'Girl'}</span>)
      </button>
      <div id="statusBadge" class="status-badge ${isRunning ? 'active' : 'paused'}">
        <span class="status-dot"></span>
        <span id="statusText">${isRunning ? 'Reminders Active' : 'Reminders Paused'}</span>
      </div>
    </div>
  </header>

  <!-- AquaDrop Branded Popup / Toast -->
  <div id="aquaDropToast" class="aquadrop-toast" role="alert" aria-live="assertive" style="display: none; margin-bottom: 24px;">
    <div class="toast-header">
      <div class="toast-brand">
        <div class="toast-mascot mascot-container">${AQUADROP_ICON_SVG}</div>
        <div class="toast-titles">
          <span class="toast-title">Drink water, stay hydrated.</span>
          <span class="toast-subtitle">Time for a water break 💧</span>
        </div>
      </div>
      <button id="toastCloseBtn" class="toast-close" aria-label="Dismiss water reminder" tabindex="0" title="Dismiss">&times;</button>
    </div>
    <div class="toast-actions">
      <button id="toastDrinkBtn" class="btn btn-primary" style="flex: 1;">
        💧 Drink Water
      </button>
      <button id="toastSnoozeBtn" class="btn btn-secondary" style="flex: 1;">
        ⏰ Snooze (${snapshot.snoozeMinutes}m)
      </button>
    </div>
  </div>

  <!-- Metric Overview Cards -->
  <div class="metrics-grid">
    <div class="metric-card">
      <div class="metric-title">Next Reminder</div>
      <div id="countdown" class="metric-number">${snapshot.countdownText}</div>
      <div class="metric-footer" id="intervalDesc">Interval: ${snapshot.intervalMinutes}m · Snooze: ${snapshot.snoozeMinutes}m</div>
    </div>
    <div class="metric-card">
      <div class="metric-title">Today's Breaks</div>
      <div id="todayProgress" class="metric-number">${snapshot.todayCount} / ${snapshot.dailyGoal}</div>
      <div class="progress-bar">
        <div id="progressBar" class="progress-fill" style="width: ${snapshot.progressPercent}%"></div>
      </div>
      <div class="metric-footer" id="progressPercent">${snapshot.progressPercent}% of daily goal</div>
    </div>
    <div class="metric-card">
      <div class="metric-title">Last Break Logged</div>
      <div id="lastBreak" class="metric-number" style="font-size: 20px;">${lastBreakFormatted}</div>
      <div class="metric-footer">Hydration keeps mental fatigue away</div>
    </div>
    <div class="metric-card">
      <div class="metric-title">Hydration Sound &amp; Voice</div>
      <div id="voiceStatusTitle" class="metric-number" style="font-size: 20px;">
        ${snapshot.voiceType === 'male' ? '👦 Boy Voice' : snapshot.voiceType === 'chime-only' ? '🔔 Water Chime' : '👧 Girl Voice'}
      </div>
      <div class="metric-footer" id="soundStatusDesc">Sound: ${snapshot.soundEnabled ? 'Enabled' : 'Muted'} · Real Water Sound: On</div>
    </div>
  </div>

  <!-- Quick Actions Section -->
  <div class="section-card">
    <div class="section-header">
      <h2 class="section-title">Quick Actions</h2>
    </div>
    <div class="action-bar">
      <button class="btn btn-primary" data-cmd="drinkWater">
        💧 Drink Water Now
      </button>
      <button class="btn btn-secondary" data-cmd="snoozeReminder">
        ⏰ Snooze (${snapshot.snoozeMinutes}m)
      </button>
      <button class="btn btn-outline" data-snooze="10">
        +10m Snooze
      </button>
      <button class="btn btn-outline" data-snooze="15">
        +15m Snooze
      </button>
      <button id="toggleBtn" class="btn btn-secondary" data-cmd="${isRunning ? 'pauseReminders' : 'resumeReminders'}">
        ${isRunning ? '⏸ Pause Reminders' : '▶ Resume Reminders'}
      </button>
      <button class="btn btn-outline" id="testSoundActionBtn">
        🔊 Test Sound (<span id="quickVoiceLabel">${snapshot.voiceType === 'male' ? 'Boy' : snapshot.voiceType === 'chime-only' ? 'Chime' : 'Girl'}</span>)
      </button>
      <button class="btn btn-outline" data-cmd="resetDailyProgress">
        ↺ Reset Today's Count
      </button>
    </div>
  </div>

  <!-- Settings Section -->
  <div class="section-card">
    <div class="section-header">
      <h2 class="section-title">Reminder Configuration</h2>
    </div>
    <div class="settings-grid">
      <!-- Voice Persona & Water Sound Selector -->
      <div class="form-group" style="grid-column: 1 / -1;">
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px;">
          <div>
            <label class="form-label">Voice &amp; Water Sound Persona</label>
            <p class="form-description">Select how your reminder sounds: authentic drinking water sounds + gentle chime + spoken voice alert.</p>
          </div>
          <button id="previewFullSoundBtn" type="button" class="btn btn-secondary" style="padding: 4px 12px; font-size: 11px;">
            ▶ Play Full Preview
          </button>
        </div>
        <div class="voice-cards-grid">
          <button type="button" class="voice-card ${snapshot.voiceType === 'female' ? 'active' : ''}" data-voice="female" title="Warm girl voice with realistic drinking sound &amp; chime">
            <span class="voice-card-title">👧 Girl Voice &amp; Water</span>
            <span class="voice-card-desc">Friendly, warm voice with realistic water drinking sounds &amp; chime</span>
          </button>
          <button type="button" class="voice-card ${snapshot.voiceType === 'male' ? 'active' : ''}" data-voice="male" title="Clear boy voice with realistic drinking sound &amp; chime">
            <span class="voice-card-title">👦 Boy Voice &amp; Water</span>
            <span class="voice-card-desc">Encouraging, clear voice with realistic water drinking sounds &amp; chime</span>
          </button>
          <button type="button" class="voice-card ${snapshot.voiceType === 'chime-only' ? 'active' : ''}" data-voice="chime-only" title="Realistic drinking sound &amp; bubble drop chime only">
            <span class="voice-card-title">🔔 Water Sounds &amp; Chime Only</span>
            <span class="voice-card-desc">Satisfying water drinking sounds and bubble drop chime (no voice)</span>
          </button>
        </div>
      </div>

      <div class="form-group">
        <div class="toggle-row">
          <div>
            <label class="form-label" for="settingRemindersEnabled">Enable Reminders</label>
            <p class="form-description">Schedule automatic water reminders while VS Code is running.</p>
          </div>
          <input type="checkbox" id="settingRemindersEnabled" data-setting="remindersEnabled" ${snapshot.enabled && !snapshot.paused ? 'checked' : ''} style="width: 18px; height: 18px; cursor: pointer;">
        </div>
      </div>

      <div class="form-group">
        <div class="toggle-row">
          <div>
            <label class="form-label" for="settingNotificationsEnabled">Desktop Notifications</label>
            <p class="form-description">Show native popups when a break is due.</p>
          </div>
          <input type="checkbox" id="settingNotificationsEnabled" data-setting="notificationsEnabled" ${snapshot.notificationsEnabled ? 'checked' : ''} style="width: 18px; height: 18px; cursor: pointer;">
        </div>
      </div>

      <div class="form-group">
        <div class="toggle-row">
          <div>
            <label class="form-label" for="settingSoundEnabled">Reminder Sound</label>
            <p class="form-description">Play synthesized water chime &amp; drinking sound in open AquaDrop views.</p>
          </div>
          <input type="checkbox" id="settingSoundEnabled" data-setting="soundEnabled" ${snapshot.soundEnabled ? 'checked' : ''} style="width: 18px; height: 18px; cursor: pointer;">
        </div>
      </div>

      <div class="form-group">
        <label class="form-label" for="settingInterval">Reminder Interval (minutes)</label>
        <input type="number" id="settingInterval" class="form-control" data-setting="intervalMinutes" min="1" max="1440" value="${snapshot.intervalMinutes}">
        <div class="preset-pills">
          <span class="preset-pill" data-interval="30">30m</span>
          <span class="preset-pill" data-interval="45">45m</span>
          <span class="preset-pill" data-interval="60">60m</span>
          <span class="preset-pill" data-interval="90">90m</span>
        </div>
      </div>

      <div class="form-group">
        <label class="form-label" for="settingSnooze">Default Snooze (minutes)</label>
        <input type="number" id="settingSnooze" class="form-control" data-setting="snoozeMinutes" min="1" max="180" value="${snapshot.snoozeMinutes}">
        <p class="form-description">Duration applied when clicking Snooze on reminders.</p>
      </div>

      <div class="form-group">
        <label class="form-label" for="settingDailyGoal">Daily Goal (breaks)</label>
        <input type="number" id="settingDailyGoal" class="form-control" data-setting="dailyGoal" min="1" max="200" value="${snapshot.dailyGoal}">
        <p class="form-description">Target number of hydration breaks per working day.</p>
      </div>

      <div class="form-group">
        <label class="form-label" for="settingAppearance">Appearance Theme</label>
        <select id="settingAppearance" class="form-control" data-setting="appearance">
          <option value="system" ${snapshot.appearance === 'system' ? 'selected' : ''}>System (VS Code Theme)</option>
          <option value="light" ${snapshot.appearance === 'light' ? 'selected' : ''}>Light Theme</option>
          <option value="dark" ${snapshot.appearance === 'dark' ? 'selected' : ''}>Dark Theme</option>
        </select>
        <p class="form-description">Customize the AquaDrop aesthetic.</p>
      </div>
    </div>
  </div>

  <!-- Recent History Section -->
  <div class="section-card">
    <div class="section-header">
      <h2 class="section-title">7-Day Hydration History</h2>
    </div>
    <div id="historyList" class="history-list">
      ${recentHistoryHtml}
    </div>
  </div>

  <!-- About Section -->
  <div class="section-card">
    <div class="section-header">
      <h2 class="section-title">About AquaDrop</h2>
    </div>
    <div class="about-details">
      <div class="about-item">
        <strong>Extension:</strong> AquaDrop — Hydration Reminder v0.1.0
      </div>
      <div class="about-item">
        <strong>Creator:</strong> Designed &amp; Developed by Shivam Mavi
      </div>
      <div class="about-item">
        <strong>Website:</strong> <a class="aq-link" href="https://aqua-drop-seven.vercel.app/" target="_blank">aqua-drop-seven.vercel.app</a>
      </div>
      <div class="about-item">
        <strong>GitHub:</strong> <a class="aq-link" href="https://github.com/shivammraj/AquaDrop" target="_blank">github.com/shivammraj/AquaDrop</a>
      </div>
    </div>
    <p class="form-description" style="margin-top: 14px; line-height: 1.6;">
      <strong>Notice:</strong> AquaDrop records user-logged hydration breaks to encourage healthy desk habits. It does not measure physical fluid intake or offer medical advice. Reminders require an active Visual Studio Code window and will pause if your device enters sleep mode.
    </p>
  </div>

  <script nonce="${nonce}">
    const vscode = acquireVsCodeApi();
    let currentNextReminder = ${snapshot.nextReminderAt ?? 'null'};
    let currentEnabled = ${snapshot.enabled};
    let currentPaused = ${snapshot.paused};
    let currentSoundEnabled = ${snapshot.soundEnabled};
    let currentVoiceType = '${snapshot.voiceType}';
    let currentSnoozeMinutes = ${snapshot.snoozeMinutes};

    // Realistic Water Drinking Audio Synthesizer (Rhythmic gulps + throat swallow resonance + water drop)
    function playDrinkingSound() {
      try {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (!AudioCtx) return;
        const ctx = new AudioCtx();
        if (ctx.state === 'suspended') {
          ctx.resume().catch(() => {});
        }
        const now = ctx.currentTime;

        const createGulp = (startTime, startFreq, endFreq, vol) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(startFreq, startTime);
          osc.frequency.exponentialRampToValueAtTime(endFreq, startTime + 0.14);

          gain.gain.setValueAtTime(0, startTime);
          gain.gain.linearRampToValueAtTime(vol, startTime + 0.02);
          gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.16);

          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(startTime);
          osc.stop(startTime + 0.18);

          // Throat resonance pop
          const subOsc = ctx.createOscillator();
          const subGain = ctx.createGain();
          subOsc.type = 'sine';
          subOsc.frequency.setValueAtTime(140, startTime + 0.02);
          subOsc.frequency.exponentialRampToValueAtTime(70, startTime + 0.13);

          subGain.gain.setValueAtTime(0, startTime + 0.02);
          subGain.gain.linearRampToValueAtTime(vol * 0.6, startTime + 0.04);
          subGain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.15);

          subOsc.connect(subGain);
          subGain.connect(ctx.destination);
          subOsc.start(startTime + 0.02);
          subOsc.stop(startTime + 0.16);
        };

        // Realistic rhythmic water drinking sequence (glug... glug... gulp)
        createGulp(now, 420, 220, 0.28);
        createGulp(now + 0.22, 380, 190, 0.25);
        createGulp(now + 0.44, 340, 170, 0.22);

        // Refreshing water drop splash finish
        const dropOsc = ctx.createOscillator();
        const dropGain = ctx.createGain();
        dropOsc.type = 'sine';
        dropOsc.frequency.setValueAtTime(1300, now + 0.64);
        dropOsc.frequency.exponentialRampToValueAtTime(1850, now + 0.72);
        dropOsc.frequency.exponentialRampToValueAtTime(1450, now + 0.84);

        dropGain.gain.setValueAtTime(0, now + 0.64);
        dropGain.gain.linearRampToValueAtTime(0.18, now + 0.66);
        dropGain.gain.exponentialRampToValueAtTime(0.001, now + 0.95);

        dropOsc.connect(dropGain);
        dropGain.connect(ctx.destination);
        dropOsc.start(now + 0.64);
        dropOsc.stop(now + 0.98);
      } catch (err) {
        console.warn('AquaDrop drinking sound error:', err);
      }
    }

    // Pleasant Water Drop Chime
    function playWaterChime() {
      try {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (!AudioCtx) return;
        const ctx = new AudioCtx();
        if (ctx.state === 'suspended') {
          ctx.resume().catch(() => {});
        }
        const now = ctx.currentTime;

        const osc1 = ctx.createOscillator();
        const gain1 = ctx.createGain();
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(600, now);
        osc1.frequency.exponentialRampToValueAtTime(1400, now + 0.08);
        osc1.frequency.exponentialRampToValueAtTime(950, now + 0.18);

        gain1.gain.setValueAtTime(0, now);
        gain1.gain.linearRampToValueAtTime(0.25, now + 0.02);
        gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

        osc1.connect(gain1);
        gain1.connect(ctx.destination);
        osc1.start(now);
        osc1.stop(now + 0.32);

        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(1100, now + 0.05);
        osc2.frequency.exponentialRampToValueAtTime(1800, now + 0.12);
        osc2.frequency.exponentialRampToValueAtTime(1200, now + 0.28);

        gain2.gain.setValueAtTime(0, now + 0.05);
        gain2.gain.linearRampToValueAtTime(0.18, now + 0.08);
        gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.38);

        osc2.connect(gain2);
        gain2.connect(ctx.destination);
        osc2.start(now + 0.05);
        osc2.stop(now + 0.4);
      } catch (err) {
        console.warn('AquaDrop chime error:', err);
      }
    }

    // Speaks hydration reminder using Web Speech API (Boy or Girl persona)
    function speakVoiceAlert(voiceType) {
      if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
      if (voiceType === 'chime-only') return;

      try {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance('Drink water, stay hydrated, and continue your work!');
        utterance.rate = 0.95;

        const voices = window.speechSynthesis.getVoices() || [];
        const englishVoices = voices.filter(v => v.lang && v.lang.startsWith('en'));

        if (voiceType === 'male') {
          const maleVoice = englishVoices.find(v => /david|guy|mark|alex|daniel|george|male|oliver|arthur|rishi/i.test(v.name))
            || englishVoices.find(v => !/zira|jenny|samantha|victoria|karen|susan|female|fiona|moira|tessa/i.test(v.name))
            || voices[0];
          if (maleVoice) utterance.voice = maleVoice;
          utterance.pitch = 0.85; // Encouraging, confident male tone
        } else {
          const femaleVoice = englishVoices.find(v => /zira|jenny|samantha|victoria|karen|susan|female|fiona|moira|tessa/i.test(v.name))
            || englishVoices[0]
            || voices[0];
          if (femaleVoice) utterance.voice = femaleVoice;
          utterance.pitch = 1.15; // Friendly, warm female tone
        }

        window.speechSynthesis.speak(utterance);
      } catch (err) {
        console.warn('AquaDrop speech error:', err);
      }
    }

    // Plays the realistic drinking water sound + chime + voice alert
    function playFullReminderSound(voiceType) {
      const v = voiceType || currentVoiceType || 'female';
      playDrinkingSound();
      setTimeout(() => {
        playWaterChime();
      }, 400);
      if (v !== 'chime-only') {
        setTimeout(() => {
          speakVoiceAlert(v);
        }, 950);
      }
    }

    function showToast(snoozeMin, playSoundOption, voiceType) {
      const toast = document.getElementById('aquaDropToast');
      if (toast) {
        const snoozeBtn = document.getElementById('toastSnoozeBtn');
        if (snoozeBtn && snoozeMin) {
          snoozeBtn.textContent = '⏰ Snooze (' + snoozeMin + 'm)';
          currentSnoozeMinutes = snoozeMin;
        }
        toast.style.display = 'block';
      }
      if (playSoundOption && currentSoundEnabled) {
        playFullReminderSound(voiceType || currentVoiceType);
      }
    }

    function hideToast() {
      const toast = document.getElementById('aquaDropToast');
      if (toast) {
        toast.style.display = 'none';
      }
    }

    const toastClose = document.getElementById('toastCloseBtn');
    if (toastClose) {
      toastClose.addEventListener('click', () => {
        hideToast();
        vscode.postMessage({ type: 'dismissToast' });
      });
    }

    const toastDrink = document.getElementById('toastDrinkBtn');
    if (toastDrink) {
      toastDrink.addEventListener('click', () => {
        playDrinkingSound();
        hideToast();
        vscode.postMessage({ type: 'command', command: 'drinkWater' });
      });
    }

    const toastSnooze = document.getElementById('toastSnoozeBtn');
    if (toastSnooze) {
      toastSnooze.addEventListener('click', () => {
        hideToast();
        vscode.postMessage({ type: 'command', command: 'snoozeReminder', payload: { minutes: currentSnoozeMinutes } });
      });
    }

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        const toast = document.getElementById('aquaDropToast');
        if (toast && toast.style.display !== 'none') {
          hideToast();
          vscode.postMessage({ type: 'dismissToast' });
        }
      }
    });

    const liveSoundBtn = document.getElementById('dashboardLiveSoundBtn');
    if (liveSoundBtn) {
      liveSoundBtn.addEventListener('click', () => {
        playFullReminderSound(currentVoiceType);
      });
    }

    const testActionBtn = document.getElementById('testSoundActionBtn');
    if (testActionBtn) {
      testActionBtn.addEventListener('click', () => {
        playFullReminderSound(currentVoiceType);
      });
    }

    const previewFullBtn = document.getElementById('previewFullSoundBtn');
    if (previewFullBtn) {
      previewFullBtn.addEventListener('click', () => {
        playFullReminderSound(currentVoiceType);
      });
    }

    // Voice Persona Card Buttons
    document.querySelectorAll('[data-voice]').forEach(btn => {
      btn.addEventListener('click', () => {
        const voice = btn.getAttribute('data-voice');
        if (voice) {
          currentVoiceType = voice;
          document.querySelectorAll('[data-voice]').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');

          const dLbl = document.getElementById('dashboardVoiceLabel');
          if (dLbl) dLbl.textContent = voice === 'male' ? 'Boy' : (voice === 'chime-only' ? 'Chime' : 'Girl');

          const qLbl = document.getElementById('quickVoiceLabel');
          if (qLbl) qLbl.textContent = voice === 'male' ? 'Boy' : (voice === 'chime-only' ? 'Chime' : 'Girl');

          const vTitle = document.getElementById('voiceStatusTitle');
          if (vTitle) {
            vTitle.textContent = voice === 'male' ? '👦 Boy Voice' : (voice === 'chime-only' ? '🔔 Water Chime' : '👧 Girl Voice');
          }

          vscode.postMessage({ type: 'updateSetting', key: 'voiceType', value: voice });
          playFullReminderSound(voice);
        }
      });
    });

    function formatTime(nextReminder) {
      if (nextReminder === null || !currentEnabled || currentPaused) {
        return 'Paused';
      }
      const diff = Math.max(0, nextReminder - Date.now());
      if (diff <= 0) return 'Due now';
      const sec = Math.floor(diff / 1000);
      const m = Math.floor((sec % 3600) / 60);
      const s = sec % 60;
      const h = Math.floor(sec / 3600);
      if (h > 0) return h + 'h ' + String(m).padStart(2, '0') + 'm ' + String(s).padStart(2, '0') + 's';
      return String(m).padStart(2, '0') + 'm ' + String(s).padStart(2, '0') + 's';
    }

    function tick() {
      const el = document.getElementById('countdown');
      if (el) {
        el.textContent = formatTime(currentNextReminder);
      }
    }

    setInterval(tick, 1000);

    document.querySelectorAll('[data-cmd]').forEach(btn => {
      btn.addEventListener('click', () => {
        const cmd = btn.getAttribute('data-cmd');
        if (cmd) {
          if (cmd === 'drinkWater') {
            playDrinkingSound();
          }
          vscode.postMessage({ type: 'command', command: cmd });
        }
      });
    });

    document.querySelectorAll('[data-snooze]').forEach(btn => {
      btn.addEventListener('click', () => {
        const minutes = Number(btn.getAttribute('data-snooze'));
        if (minutes) {
          vscode.postMessage({ type: 'command', command: 'snoozeReminder', payload: { minutes } });
        }
      });
    });

    document.querySelectorAll('[data-interval]').forEach(btn => {
      btn.addEventListener('click', () => {
        const minutes = Number(btn.getAttribute('data-interval'));
        if (minutes) {
          const input = document.getElementById('settingInterval');
          if (input) input.value = String(minutes);
          vscode.postMessage({ type: 'updateSetting', key: 'intervalMinutes', value: minutes });
        }
      });
    });

    document.querySelectorAll('[data-setting]').forEach(input => {
      const key = input.getAttribute('data-setting');
      const sendUpdate = () => {
        const val = input.type === 'checkbox' ? input.checked : (input.type === 'number' ? Number(input.value) : input.value);
        vscode.postMessage({ type: 'updateSetting', key, value: val });
      };
      input.addEventListener('change', sendUpdate);
    });

    window.addEventListener('message', event => {
      const msg = event.data;
      if (!msg) return;

      if (msg.type === 'showReminder') {
        showToast(msg.snoozeMinutes, msg.sound, msg.voiceType);
        return;
      }

      if (msg.type === 'dismissReminder') {
        hideToast();
        return;
      }

      if (msg.type === 'playSound') {
        playFullReminderSound(msg.voiceType || currentVoiceType);
        return;
      }

      if (msg.type === 'syncState' && msg.state) {
        const s = msg.state;
        currentNextReminder = s.nextReminderAt;
        currentEnabled = s.enabled;
        currentPaused = s.paused;
        currentSoundEnabled = Boolean(s.soundEnabled);
        currentVoiceType = s.voiceType || 'female';
        currentSnoozeMinutes = s.snoozeMinutes;
        document.body.setAttribute('data-appearance', s.appearance);

        const isRun = s.enabled && !s.paused;
        const badge = document.getElementById('statusBadge');
        if (badge) {
          badge.className = 'status-badge ' + (isRun ? 'active' : 'paused');
        }
        const statusText = document.getElementById('statusText');
        if (statusText) statusText.textContent = isRun ? 'Reminders Active' : 'Reminders Paused';

        const todayProgress = document.getElementById('todayProgress');
        if (todayProgress) todayProgress.textContent = s.todayCount + ' / ' + s.dailyGoal;

        const progressPercent = document.getElementById('progressPercent');
        if (progressPercent) progressPercent.textContent = s.progressPercent + '% of daily goal';

        const progress = document.getElementById('progressBar');
        if (progress) progress.style.width = s.progressPercent + '%';

        const intervalDesc = document.getElementById('intervalDesc');
        if (intervalDesc) intervalDesc.textContent = 'Interval: ' + s.intervalMinutes + 'm · Snooze: ' + s.snoozeMinutes + 'm';

        const voiceStatusTitle = document.getElementById('voiceStatusTitle');
        if (voiceStatusTitle) {
          voiceStatusTitle.textContent = currentVoiceType === 'male' ? '👦 Boy Voice' : (currentVoiceType === 'chime-only' ? '🔔 Water Chime' : '👧 Girl Voice');
        }

        const dLbl = document.getElementById('dashboardVoiceLabel');
        if (dLbl) dLbl.textContent = currentVoiceType === 'male' ? 'Boy' : (currentVoiceType === 'chime-only' ? 'Chime' : 'Girl');

        const qLbl = document.getElementById('quickVoiceLabel');
        if (qLbl) qLbl.textContent = currentVoiceType === 'male' ? 'Boy' : (currentVoiceType === 'chime-only' ? 'Chime' : 'Girl');

        const soundStatusDesc = document.getElementById('soundStatusDesc');
        if (soundStatusDesc) soundStatusDesc.textContent = 'Sound: ' + (s.soundEnabled ? 'Enabled' : 'Muted') + ' · Real Water Sound: On';

        document.querySelectorAll('[data-voice]').forEach(b => {
          b.classList.toggle('active', b.getAttribute('data-voice') === currentVoiceType);
        });

        const toggleBtn = document.getElementById('toggleBtn');
        if (toggleBtn) {
          toggleBtn.setAttribute('data-cmd', isRun ? 'pauseReminders' : 'resumeReminders');
          toggleBtn.textContent = isRun ? '⏸ Pause Reminders' : '▶ Resume Reminders';
        }

        if (s.lastDrinkAt) {
          const lastBreak = document.getElementById('lastBreak');
          if (lastBreak) {
            lastBreak.textContent = new Date(s.lastDrinkAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          }
        }

        tick();
      }
    });

    vscode.postMessage({ type: 'ready' });
  </script>
</body>
</html>`
}
