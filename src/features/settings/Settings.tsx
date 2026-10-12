import React from 'react'

export default function Settings(){
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-border">
      <h2 className="text-lg font-semibold">Remind me every</h2>
      <p className="text-sm text-secondaryText mt-2">Choose a preset or enter a custom interval.</p>
      <div className="mt-4 grid grid-cols-3 gap-3">
        <button className="p-3 rounded-xl border border-border">30 minutes</button>
        <button className="p-3 rounded-xl border border-border">1 hour</button>
        <button className="p-3 rounded-xl border border-border">2 hours</button>
      </div>
      <div className="mt-4">
        <label className="text-sm text-secondaryText">Custom</label>
        <div className="mt-2 flex gap-2">
          <input className="border border-border rounded-xl px-3 py-2 w-28" placeholder="15" />
          <select className="border border-border rounded-xl px-3 py-2">
            <option>minutes</option>
            <option>hours</option>
          </select>
        </div>
      </div>
    </div>
  )
}
