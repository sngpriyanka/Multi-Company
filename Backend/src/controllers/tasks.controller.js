import Company from '../models/Company.js'
import Notification from '../models/Notification.js'
import Section from '../models/Section.js'
import Task from '../models/Task.js'
import User from '../models/User.js'
import { ApiError } from '../utils/ApiError.js'
import { buildNotification } from '../services/notification.service.js'
import { buildLocalFileRecord } from '../services/storage.service.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { sendSuccess } from '../utils/response.js'
import { ensureArrayHasValues, ensureObjectId, ensureRequiredString } from '../utils/validators.js'

export const createTask = asyncHandler(async (req, res) => {
  const { title, companyIds } = req.body
  let { sectionId } = req.body

  if (typeof sectionId === 'string' && !sectionId.trim()) {
    sectionId = null
    delete req.body.sectionId
  }

  ensureRequiredString(title, 'Task title')
  ensureArrayHasValues(companyIds, 'At least one company')
  companyIds.forEach((companyId) => ensureObjectId(companyId, 'company id'))

  const companies = await Company.find({ _id: { $in: companyIds } }).select('_id')

  if (companies.length !== companyIds.length) {
    throw new ApiError(404, 'One or more selected companies were not found')
  }

  if (sectionId) {
    ensureObjectId(sectionId, 'section id')
    const section = await Section.findById(sectionId).select('_id')

    if (!section) {
      throw new ApiError(404, 'Section not found')
    }
  }

  // Handle file attachments
  const attachments = (req.files || []).map((file) => buildLocalFileRecord(file))

  const task = await Task.create({
    ...req.body,
    assignedBy: req.user._id,
    attachments,
  })

  const admins = await User.find({
    role: 'admin',
    companyId: { $in: companyIds },
    isActive: true,
  }).select('_id companyId')

  if (admins.length > 0) {
    await Notification.insertMany(
      admins.map((admin) =>
        buildNotification({
          type: 'task',
          title: 'New task assigned',
          message: `A new task "${title}" has been assigned to your company.`,
          userId: admin._id,
          companyId: admin.companyId,
        })
      )
    )
  }

  return sendSuccess(res, {
    statusCode: 201,
    message: 'Task created successfully',
    data: task,
  })
})

export const getTasks = asyncHandler(async (req, res) => {
  const query =
    req.user.role === 'superadmin'
      ? {}
      : {
          companyIds: req.user.companyId,
        }

  const tasks = await Task.find(query)
    .populate('companyIds', 'name code status')
    .populate('sectionId', 'name slug')
    .populate('assignedBy', 'name email role')
    .sort({ createdAt: -1 })

  return sendSuccess(res, {
    data: tasks,
  })
})

export const getTaskById = asyncHandler(async (req, res) => {
  ensureObjectId(req.params.id, 'task id')
  const task = await Task.findById(req.params.id)
    .populate('companyIds', 'name code status')
    .populate('sectionId', 'name slug')
    .populate('assignedBy', 'name email role')

  if (!task) {
    throw new ApiError(404, 'Task not found')
  }

  if (
    req.user.role !== 'superadmin' &&
    !task.companyIds.some((company) => String(company._id) === String(req.user.companyId))
  ) {
    throw new ApiError(403, 'You can only access tasks assigned to your company')
  }

  return sendSuccess(res, {
    data: task,
  })
})

export const updateTask = asyncHandler(async (req, res) => {
  ensureObjectId(req.params.id, 'task id')

  if (req.body.companyIds) {
    ensureArrayHasValues(req.body.companyIds, 'At least one company')
    req.body.companyIds.forEach((companyId) => ensureObjectId(companyId, 'company id'))
  }

  if (typeof req.body.sectionId === 'string' && !req.body.sectionId.trim()) {
    delete req.body.sectionId
  }

  // Handle file attachments
  if (req.files && req.files.length > 0) {
    const newAttachments = (req.files || []).map((file) => buildLocalFileRecord(file))
    const task = await Task.findById(req.params.id)
    if (task) {
      req.body.attachments = [...(task.attachments || []), ...newAttachments]
    }
  }

  if (req.body.sectionId) {
    ensureObjectId(req.body.sectionId, 'section id')
  }

  const task = await Task.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  })

  if (!task) {
    throw new ApiError(404, 'Task not found')
  }

  return sendSuccess(res, {
    message: 'Task updated successfully',
    data: task,
  })
})

export const updateTaskStatus = asyncHandler(async (req, res) => {
  const { status } = req.body
  ensureObjectId(req.params.id, 'task id')
  const task = await Task.findById(req.params.id)

  if (!task) {
    throw new ApiError(404, 'Task not found')
  }

  if (
    req.user.role !== 'superadmin' &&
    !task.companyIds.some((companyId) => String(companyId) === String(req.user.companyId))
  ) {
    throw new ApiError(403, 'You can only update tasks for your company')
  }

  task.status = status
  await task.save()

  return sendSuccess(res, {
    message: 'Task status updated successfully',
    data: task,
  })
})

export const deleteTask = asyncHandler(async (req, res) => {
  ensureObjectId(req.params.id, 'task id')
  const task = await Task.findByIdAndDelete(req.params.id)

  if (!task) {
    throw new ApiError(404, 'Task not found')
  }

  return sendSuccess(res, {
    message: 'Task deleted successfully',
  })
})
