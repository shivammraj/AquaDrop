import React from 'react'
import ReminderCard from '../reminders/ReminderCard'

export default function Dashboard(){
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="md:col-span-2">
        <ReminderCard />
      </div>
      <aside className="bg-white rounded-xl p-4 shadow-sm border border-border">
        <h3 className="text-sm text-secondaryText">Hydration</h3>
        <div className="mt-3 text-primaryText">Today's water intake</div>
        <div className="mt-6">
          <button className="bg-primary text-white px-4 py-2 rounded-xl">Log water</button>
        </div>
      </aside>
    </div>
  )
}
