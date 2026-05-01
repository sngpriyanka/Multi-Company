import { Router } from 'express'
import {
  generateInsight,
  getCompanyInsights,
  getInsights,
} from '../controllers/ai.controller.js'
import { auth } from '../middleware/auth.middleware.js'
import { requireRole } from '../middleware/role.middleware.js'

const router = Router()

router.use(auth)

router.post('/generate-insight', requireRole('superadmin'), generateInsight)
router.get('/insights', getInsights)
router.get('/insights/company/:companyId', getCompanyInsights)

export default router
