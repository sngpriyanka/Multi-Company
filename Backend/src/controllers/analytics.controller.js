import Company from '../models/Company.js'
import Employee from '../models/Employee.js'
import Submission from '../models/Submission.js'
import Task from '../models/Task.js'
import { ApiError } from '../utils/ApiError.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { sendSuccess } from '../utils/response.js'
import { ensureObjectId } from '../utils/validators.js'

export const getOverviewAnalytics = asyncHandler(async (_req, res) => {
  const [
    totalCompanies,
    activeCompanies,
    activeTasks,
    overdueTasks,
    totalSubmissions,
    reviewedSubmissions,
    recentSubmissions,
    totalEmployees,
  ] = await Promise.all([
    Company.countDocuments(),
    Company.countDocuments({ status: 'active' }),
    Task.countDocuments({ status: { $in: ['active', 'overdue'] } }),
    Task.countDocuments({ status: 'overdue' }),
    Submission.countDocuments(),
    Submission.countDocuments({ status: 'reviewed' }),
    Submission.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('companyId', 'name code')
      .populate('taskId', 'title status')
      .populate('submittedBy', 'name email'),
    Employee.countDocuments(),
  ])

  return sendSuccess(res, {
    data: {
      totalCompanies,
      activeCompanies,
      activeTasks,
      overdueTasks,
      totalSubmissions,
      reviewedSubmissions,
      recentSubmissions,
      totalEmployees,
    },
  })
})

export const getCompanyAnalytics = asyncHandler(async (req, res) => {
  const companyId =
    req.user.role === 'superadmin' ? req.params.companyId : req.user.companyId

  if (!companyId) {
    throw new ApiError(400, 'Company id is required')
  }

  ensureObjectId(companyId, 'company id')

  const [taskCount, activeTaskCount, submissionCount, latestSubmission] = await Promise.all([
    Task.countDocuments({ companyIds: companyId }),
    Task.countDocuments({ companyIds: companyId, status: { $in: ['active', 'overdue'] } }),
    Submission.countDocuments({ companyId }),
    Submission.findOne({ companyId })
      .sort({ createdAt: -1 })
      .populate('taskId', 'title status')
      .populate('submittedBy', 'name email'),
  ])

  return sendSuccess(res, {
    data: {
      companyId,
      taskCount,
      activeTaskCount,
      submissionCount,
      latestSubmission,
    },
  })
})

export const getCompanyRankings = asyncHandler(async (_req, res) => {
  const rankings = await Company.aggregate([
    {
      $lookup: {
        from: 'submissions',
        localField: '_id',
        foreignField: 'companyId',
        as: 'submissions',
      },
    },
    {
      $project: {
        name: 1,
        code: 1,
        status: 1,
        submissionCount: { $size: '$submissions' },
      },
    },
    {
      $sort: { submissionCount: -1, name: 1 },
    },
  ])

  return sendSuccess(res, {
    data: rankings,
  })
})
