export class ApiError extends Error {
  constructor(statusCode, message, details = undefined) {
    super(message)
    this.statusCode = statusCode
    this.details = details
  }
}

export const sendSuccess = (res, data, message = 'OK', statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  })
}
