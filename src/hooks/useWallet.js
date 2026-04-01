import { useState } from 'react'

export function useWallet(initial = { balance: 0, locked: 0, released: 0, transactions: [] }) {
  const [wallet, setWallet] = useState(initial)
  const addTransaction = (tx) => setWallet((w) => ({ ...w, transactions: [tx, ...w.transactions] }))
  return { ...wallet, addTransaction }
}
