import { ApiError } from '../utils/ApiError.js'

export const requireCompanyAccess = (companyId) => {
  return (req, _res, next) => {
    if (req.user?.role === 'superadmin') {
      return next()
    }

    if (!req.user?.companyId || String(req.user.companyId) !== String(companyId)) {
      return next(new ApiError(403, 'You can only access your own company data'))
    }

    next()
  }
}
