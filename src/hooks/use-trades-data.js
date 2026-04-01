import { useCallback, useEffect, useState } from 'react'
import { tradeRoomMessages as mockTradeRoomMessages, trades as mockTrades } from '@/data/mock'
import { getTradesSnapshot } from '@/services/trades'

const initialState = {
  trades: mockTrades,
  tradeRoomMessages: mockTradeRoomMessages,
  source: 'mock',
  isLoading: false,
  error: null,
}

export function useTradesData() {
  const [state, setState] = useState(initialState)

  const refresh = useCallback(async () => {
    setState((current) => ({ ...current, isLoading: true, error: null }))
    try {
      const snapshot = await getTradesSnapshot()
      setState({
        ...snapshot,
        isLoading: false,
        error: null,
      })
    } catch (error) {
      setState((current) => ({
        ...current,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to load trades.',
      }))
    }
  }, [])

  useEffect(() => {
    let isMounted = true

    const load = async () => {
      setState((current) => ({ ...current, isLoading: true, error: null }))
      try {
        const snapshot = await getTradesSnapshot()
        if (!isMounted) {
          return
        }

        setState({
          ...snapshot,
          isLoading: false,
          error: null,
        })
      } catch (error) {
        if (!isMounted) {
          return
        }

        setState((current) => ({
          ...current,
          isLoading: false,
          error: error instanceof Error ? error.message : 'Failed to load trades.',
        }))
      }
    }

    load()

    return () => {
      isMounted = false
    }
  }, [])

  return {
    ...state,
    refresh,
  }
}
