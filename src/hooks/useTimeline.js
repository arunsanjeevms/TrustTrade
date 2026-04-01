import { useState } from 'react'

export function useTimeline(initial = []) {
  const [events, setEvents] = useState(initial)
  const addEvent = (event) => setEvents((prev) => [...prev, { ...event, id: Date.now() }])
  return { events, addEvent }
}
