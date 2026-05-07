const streamsByTradeId = new Map()

const toStreamPayload = (event, data) => {
  return `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`
}

export const registerTradeStream = (tradeId, res) => {
  const current = streamsByTradeId.get(tradeId) ?? new Set()
  current.add(res)
  streamsByTradeId.set(tradeId, current)

  res.write(toStreamPayload('ready', { tradeId, ts: Date.now() }))

  const ping = setInterval(() => {
    res.write(toStreamPayload('ping', { ts: Date.now() }))
  }, 25000)

  res.on('close', () => {
    clearInterval(ping)
    current.delete(res)
    if (!current.size) {
      streamsByTradeId.delete(tradeId)
    }
  })
}

export const publishTradeEvent = (tradeId, payload) => {
  const streams = streamsByTradeId.get(tradeId)
  if (!streams || !streams.size) {
    return
  }

  const data = toStreamPayload('trade', {
    tradeId,
    ...payload,
  })

  streams.forEach((res) => {
    res.write(data)
  })
}
