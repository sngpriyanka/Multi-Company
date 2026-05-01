import User from '../models/User.js'
import { ApiError } from '../utils/ApiError.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { verifyToken } from '../utils/jwt.js'

export const auth = asyncHandler(async (req, _res, next) => {
  const authHeader = req.headers.authorization
  const token = authHeader?.startsWith('Bearer ')
    ? authHeader.split(' ')[1]
    : null

  if (!token) {
    throw new ApiError(401, 'Authentication token is required')
  }

  const decoded = verifyToken(token)
  const user = await User.findById(decoded.userId).select('-passwordHash')

  if (!user || !user.isActive) {
    throw new ApiError(401, 'Invalid or inactive user')
  }

  req.user = user
  next()
})
