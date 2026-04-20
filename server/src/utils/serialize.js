const isDecimalLike = (value) => {
  return Boolean(value && typeof value === 'object' && typeof value.toFixed === 'function' && typeof value.toNumber === 'function')
}

export const serializeData = (value) => {
  if (value === null || value === undefined) {
    return value
  }

  if (Array.isArray(value)) {
    return value.map((item) => serializeData(item))
  }

  if (value instanceof Date) {
    return value.toISOString()
  }

  if (typeof value === 'bigint') {
    return Number(value)
  }

  if (isDecimalLike(value)) {
    return Number(value.toString())
  }

  if (typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [key, serializeData(item)]),
    )
  }

  return value
}
