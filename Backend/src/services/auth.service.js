import bcrypt from 'bcryptjs'
import { signToken } from '../utils/jwt.js'

export const hashPassword = async (password) => bcrypt.hash(password, 10)
export const comparePassword = async (password, hash) => bcrypt.compare(password, hash)

const normalizeCompanyId = (companyValue) => {
  if (!companyValue) return null
  if (typeof companyValue === 'object' && companyValue._id) return companyValue._id
  return companyValue
}

export const createAuthPayload = (user) => {
  const normalizedCompanyId = normalizeCompanyId(user.companyId)

  return {
    token: signToken({
      userId: user._id,
      role: user.role,
      companyId: normalizedCompanyId,
    }),
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      companyId: normalizedCompanyId,
      company: typeof user.companyId === 'object' && user.companyId?._id ? user.companyId : null,
      isActive: user.isActive,
    },
  }
}
