import { useState } from 'react'

export function useDispute(initial = []) {
  const [disputes, setDisputes] = useState(initial)
  const addDispute = (dispute) => setDisputes((prev) => [{ ...dispute, id: Date.now(), status: 'Open' }, ...prev])
  const updateDispute = (id, updates) => setDisputes((prev) => prev.map((d) => d.id === id ? { ...d, ...updates } : d))
  return { disputes, addDispute, updateDispute }
}
