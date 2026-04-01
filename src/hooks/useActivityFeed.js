import { useState } from 'react'

export function useActivityFeed(initial = []) {
  const [events, setEvents] = useState(initial)
  const addEvent = (event) => setEvents((prev) => [{ ...event, id: Date.now() }, ...prev])
  return { events, addEvent }
}
