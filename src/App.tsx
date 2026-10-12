import React from 'react'
import Dashboard from './features/dashboard/Dashboard'
import Settings from './features/settings/Settings'

export default function App(){
  const [route, setRoute] = React.useState<'dashboard'|'settings'>('dashboard')
  return (
    <div className="min-h-screen p-6 bg-ice">
      <header className="max-w-4xl mx-auto mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src="/src/assets/water-drop-mascot.svg" alt="AquaDrop" className="w-12 h-12" />
          <div>
            <div className="text-sm text-secondaryText">Stay refreshed.</div>
            <h1 className="text-2xl font-semibold">Drink water, stay hydrated.</h1>
          </div>
        </div>
        <nav>
          <button onClick={()=>setRoute('dashboard')} className="mr-2 text-sm">Dashboard</button>
          <button onClick={()=>setRoute('settings')} className="text-sm">Settings</button>
        </nav>
      </header>
      <main className="max-w-4xl mx-auto">
        {route === 'dashboard' ? <Dashboard /> : <Settings />}
      </main>
    </div>
  )
}
