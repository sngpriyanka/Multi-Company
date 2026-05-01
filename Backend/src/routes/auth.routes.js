import { Router } from 'express'
import { bootstrapSuperadmin, login, logout, me, changePassword, forgotPassword, verifyOTP, resetPassword } from '../controllers/auth.controller.js'
import { auth } from '../middleware/auth.middleware.js'

const router = Router()

router.post('/bootstrap-superadmin', bootstrapSuperadmin)
router.post('/login', login)
router.post('/logout', auth, logout)
router.get('/me', auth, me)
router.patch('/change-password', auth, changePassword)

// Forgot Password Flow with Email OTP
router.post('/forgot-password', forgotPassword)
router.post('/verify-otp', verifyOTP)
router.post('/reset-password', resetPassword)

export default router
