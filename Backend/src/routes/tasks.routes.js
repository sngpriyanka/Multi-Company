import { Router } from 'express'
import {
  createTask,
  deleteTask,
  getTaskById,
  getTasks,
  updateTask,
  updateTaskStatus,
} from '../controllers/tasks.controller.js'
import { auth } from '../middleware/auth.middleware.js'
import { requireRole } from '../middleware/role.middleware.js'
import { upload } from '../middleware/upload.middleware.js'

const router = Router()

router.use(auth)

router.post('/', requireRole('superadmin'), upload.array('attachments', 10), createTask)
router.get('/', getTasks)
router.get('/:id', getTaskById)
router.put('/:id', requireRole('superadmin'), upload.array('attachments', 10), updateTask)
router.patch('/:id/status', updateTaskStatus)
router.delete('/:id', requireRole('superadmin'), deleteTask)

export default router
