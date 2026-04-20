export const notFoundHandler = (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  })
}

export const errorHandler = (error, _req, res, _next) => {
  const statusCode = error.statusCode ?? 500
  const message = error.message ?? 'Internal server error'

  if (process.env.NODE_ENV !== 'production') {
    console.error(error)
  }

  return res.status(statusCode).json({
    success: false,
    message,
    ...(error.details ? { details: error.details } : {}),
  })
}
