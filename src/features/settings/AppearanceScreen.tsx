import type { ThemeMode } from '../../types/reminder'

const THEMES: { id: ThemeMode; label: string; description: string; preview: string }[] = [
  {
    id: 'light',
    label: 'Light',
    description: 'Always use the light colour palette',
    preview: '☀️',
  },
  {
    id: 'dark',
    label: 'Dark',
    description: 'Always use the dark colour palette',
    preview: '🌙',
  },
  {
    id: 'system',
    label: 'System',
    description: 'Follow your operating system appearance',
    preview: '💻',
  },
]

type AppearanceScreenProps = {
  theme: ThemeMode
  onThemeChange: (value: ThemeMode) => void
}

export default function AppearanceScreen({ theme, onThemeChange }: AppearanceScreenProps) {
  const cardStyle = {
    background: 'var(--color-bg-card)',
    border: '1px solid var(--color-border)',
  }

  return (
    <div
      className="mx-auto w-full max-w-3xl overflow-hidden rounded-[36px] shadow-[0_20px_60px_var(--color-card-shadow)] backdrop-blur-2xl animate-fade-in"
      style={cardStyle}
    >
      <div className="p-6 sm:p-8">
        <h2 className="text-xl font-bold mb-1" style={{ color: 'var(--color-text-primary)' }}>
          Appearance
        </h2>
        <p className="text-sm mb-8" style={{ color: 'var(--color-text-secondary)' }}>
          Choose how AquaDrop looks on your device.
          Switching themes updates instantly without reloading.
        </p>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {THEMES.map((t) => {
            const isActive = theme === t.id
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => onThemeChange(t.id)}
                className="relative flex flex-col items-center gap-4 rounded-3xl border p-6 text-center transition-all focus-visible:outline-2"
                style={isActive
                  ? {
                      background: 'var(--color-accent-bg)',
                      borderColor: 'var(--color-accent)',
                      boxShadow: '0 0 0 2px var(--color-accent), 0 8px 24px rgba(22,119,255,0.18)',
                    }
                  : {
                      background: 'var(--color-bg-card-solid)',
                      borderColor: 'var(--color-border)',
                    }
                }
              >
                {/* Active indicator */}
                {isActive && (
                  <span
                    className="absolute right-4 top-4 flex h-5 w-5 items-center justify-center rounded-full text-white text-xs"
                    style={{ background: 'var(--color-accent)' }}
                  >
                    ✓
                  </span>
                )}

                {/* Preview illustration */}
                <div
                  className="flex h-16 w-16 items-center justify-center rounded-2xl text-3xl shadow-inner"
                  style={isActive
                    ? { background: 'var(--color-accent)', boxShadow: '0 4px 12px rgba(22,119,255,0.3)' }
                    : { background: 'var(--color-bg-inset)' }
                  }
                >
                  {t.preview}
                </div>

                <div>
                  <div
                    className="text-base font-bold"
                    style={{ color: isActive ? 'var(--color-accent)' : 'var(--color-text-primary)' }}
                  >
                    {t.label}
                  </div>
                  <div className="mt-1 text-xs leading-snug" style={{ color: 'var(--color-text-secondary)' }}>
                    {t.description}
                  </div>
                </div>
              </button>
            )
          })}
        </div>

        {/* Current selection summary */}
        <div
          className="mt-6 rounded-2xl px-5 py-3.5 text-sm"
          style={{ background: 'var(--color-bg-inset)', border: '1px solid var(--color-border)' }}
        >
          <span className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>Active: </span>
          <span style={{ color: 'var(--color-text-secondary)' }}>
            {theme === 'light' && 'Light — always uses the light colour palette.'}
            {theme === 'dark' && 'Dark — always uses the dark colour palette.'}
            {theme === 'system' && 'System — follows your OS appearance preference. Switches automatically when you change your device theme.'}
          </span>
        </div>
      </div>
    </div>
  )
}
