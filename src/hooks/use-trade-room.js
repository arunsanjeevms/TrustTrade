import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { tradeRoomMessages as mockTradeRoomMessages, trades as mockTrades } from '@/data/mock'
import { isApiConfigured } from '@/lib/api-client'
import { getTradeById, listTradeActivities, openTradeStream } from '@/services/trades'

const buildMockTrade = (tradeId) => {
  const match = mockTrades.find((trade) => trade.id === tradeId) || mockTrades[0]
  if (!match) {
    return null
  }

  return {
    id: match.id,
    publicId: match.id,
    title: match.product,
    description: '',
    amount: match.amount,
    currency: 'USD',
    shippingMethod: match.shipping,
    status: match.status,
    roomClosed: false,
    updatedAt: match.updatedAt,
    createdAt: match.updatedAt,
    participants: [],
    createdBy: {
      fullName: match.partner,
      email: '',
    },
  }
}

export function useTradeRoom(tradeId) {
  const [state, setState] = useState({
    trade: null,
    activities: [],
    source: 'mock',
    isLoading: false,
    error: null,
  })
  const pollingRef = useRef(null)

  const refresh = useCallback(async () => {
    if (!tradeId) {
      return
    }

    if (!isApiConfigured()) {
      const mockActivities = mockTradeRoomMessages.map((message) => ({
        id: message.id,
        actor: { fullName: message.sender },
        actorId: message.sender.toLowerCase(),
        message: message.body,
        createdAt: new Date().toISOString(),
      }))

      setState({
        trade: buildMockTrade(tradeId),
        activities: mockActivities,
        source: 'mock',
        isLoading: false,
        error: null,
      })
      return
    }

    setState((current) => ({ ...current, isLoading: true, error: null }))
    try {
      const [trade, activities] = await Promise.all([
        getTradeById(tradeId),
        listTradeActivities(tradeId),
      ])

      setState({
        trade,
        activities,
        source: 'api',
        isLoading: false,
        error: null,
      })
    } catch (error) {
      setState((current) => ({
        ...current,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to load trade room.',
      }))
    }
  }, [tradeId])

  useEffect(() => {
    refresh()
  }, [refresh])

  useEffect(() => {
    if (!tradeId || !isApiConfigured()) {
      return undefined
    }

    const stopPolling = () => {
      if (pollingRef.current) {
        window.clearInterval(pollingRef.current)
        pollingRef.current = null
      }
    }

    const startPolling = () => {
      if (pollingRef.current) {
        return
      }
      pollingRef.current = window.setInterval(() => {
        refresh()
      }, 5000)
    }

    const stream = openTradeStream(
      tradeId,
      () => {
        refresh()
      },
      () => {
        if (stream) {
          stream.close()
        }
        startPolling()
      },
    )

    return () => {
      if (stream) {
        stream.close()
      }
      stopPolling()
    }
  }, [tradeId, refresh])

  return useMemo(
    () => ({
      ...state,
      refresh,
    }),
    [state, refresh],
  )
}
