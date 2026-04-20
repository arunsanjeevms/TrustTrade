import { ApiError } from '../utils/http.js'

export const validate = ({ body, params, query }) => (req, _res, next) => {
  try {
    if (body) {
      req.body = body.parse(req.body)
    }

    if (params) {
      req.params = params.parse(req.params)
    }

    if (query) {
      req.query = query.parse(req.query)
    }

    next()
  } catch (error) {
    if (error.name === 'ZodError') {
      return next(new ApiError(400, 'Validation failed', error.flatten()))
    }
    return next(error)
  }
}
