import mascotUrl from '../../assets/water-drop-mascot.svg'

const APP_VERSION = '0.1.0'

export default function AboutScreen() {
  const cardStyle = {
    background: 'var(--color-bg-card)',
    border: '1px solid var(--color-border)',
  }

  const insetStyle = {
    background: 'var(--color-bg-inset)',
    border: '1px solid var(--color-border)',
  }

  return (
    <div
      className="mx-auto w-full max-w-3xl overflow-hidden rounded-[36px] shadow-[0_20px_60px_var(--color-card-shadow)] backdrop-blur-2xl animate-fade-in"
      style={cardStyle}
    >
      <div className="p-6 sm:p-10">
        {/* Hero section */}
        <div className="flex flex-col items-center text-center gap-5 mb-10">
          <div className="relative">
            <div
              className="absolute inset-0 scale-90 rounded-full blur-2xl animate-pulse"
              style={{ background: 'rgba(36, 155, 255, 0.25)' }}
            />
            <img
              src={mascotUrl}
              alt="Drink Water mascot"
              className="relative h-24 w-24 drop-shadow-[0_12px_24px_rgba(22,119,255,0.28)]"
            />
          </div>

          <div>
            <h1 className="text-3xl font-bold tracking-tight" style={{ color: 'var(--color-text-primary)' }}>
              Drink Water
            </h1>
            <p
              className="mt-2 text-sm font-medium leading-relaxed max-w-sm mx-auto"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              A simple, thoughtful hydration companion for your everyday workflow.
            </p>
          </div>

          {/* Version badge */}
          <div
            className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-bold"
            style={{ background: 'var(--color-accent-bg)', color: 'var(--color-accent)' }}
          >
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: 'var(--color-accent)' }} />
            Version {APP_VERSION}
          </div>
        </div>

        {/* Developer Credit — prominent but tasteful */}
        <div
          className="rounded-3xl p-6 mb-6 text-center"
          style={{
            background: `linear-gradient(135deg, var(--color-accent-bg), var(--color-bg-inset))`,
            border: '1px solid var(--color-border)',
          }}
        >
          <p className="text-xs font-bold uppercase tracking-[0.18em] mb-2" style={{ color: 'var(--color-text-muted)' }}>
            Designed &amp; Developed by
          </p>
          <p className="text-2xl font-bold tracking-tight" style={{ color: 'var(--color-text-primary)' }}>
            Shivam Mavi
          </p>
          <p className="mt-1.5 text-xs" style={{ color: 'var(--color-text-secondary)' }}>
            Crafted with care for developers who forget to drink water. 💙
          </p>
        </div>

        {/* Info cards */}
        <div className="grid gap-4 sm:grid-cols-2">
          {/* What it does */}
          <div className="rounded-2xl p-5" style={insetStyle}>
            <h3 className="text-sm font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>What Drink Water does</h3>
            <ul className="space-y-1.5 text-xs leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
              <li>⏰ Sends gentle water reminders at your chosen interval</li>
              <li>💧 Tracks your daily water intake in glasses</li>
              <li>🔔 Delivers browser notifications when you switch tabs</li>
              <li>🔇 Plays a soft chime when it's time to hydrate</li>
              <li>😴 Lets you snooze reminders when you're in a flow</li>
            </ul>
          </div>

          {/* Privacy */}
          <div className="rounded-2xl p-5" style={insetStyle}>
            <h3 className="text-sm font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>Privacy</h3>
            <p className="text-xs leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
              Drink Water stores all data locally in your browser using <code className="font-mono text-[10px] px-1 py-0.5 rounded" style={{ background: 'var(--color-bg-card-solid)' }}>localStorage</code>.
              No data is ever sent to a server.
              No analytics, no tracking, no accounts required.
              Clearing your browser data will reset all settings.
            </p>
          </div>
        </div>

        {/* Platform note */}
        <div
          className="mt-4 rounded-2xl p-4 text-xs leading-relaxed"
          style={{ background: 'var(--color-bg-inset)', border: '1px solid var(--color-border)', color: 'var(--color-text-secondary)' }}
        >
          <span className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>Platform note: </span>
          As a browser-based web app, Drink Water can reliably deliver reminders and notifications while your browser tab is open or in the background.
          Reminders cannot be delivered after the browser is completely closed.
          For persistent system-level reminders, a native OS app or browser extension is required.
        </div>

        {/* Footer */}
        <div
          className="mt-8 pt-6 flex items-center justify-between text-xs"
          style={{ borderTop: '1px solid var(--color-border)', color: 'var(--color-text-muted)' }}
        >
          <span>© 2024–{new Date().getFullYear()} Shivam Mavi</span>
          <span
            className="rounded-full px-3 py-1 font-semibold"
            style={{ background: 'var(--color-accent-bg)', color: 'var(--color-accent)' }}
          >
            v{APP_VERSION}
          </span>
        </div>
      </div>
    </div>
  )
}
