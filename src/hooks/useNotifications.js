import { useState, useCallback } from 'react'

export function useNotifications(initial = []) {
  const [notifications, setNotifications] = useState(initial)
  const unreadCount = notifications.filter((n) => !n.read).length

  const markRead = useCallback((id) => {
    if (id === 'all') {
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
    } else {
      setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n))
    }
  }, [])

  const addNotification = useCallback((notif) => {
    setNotifications((prev) => [{ ...notif, id: Date.now(), read: false }, ...prev])
  }, [])

  return { notifications, unreadCount, markRead, addNotification }
}
