import { useState, useMemo } from 'react'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { Card, CardContent } from './ui/Card'
import Badge from './ui/Badge'
import Button from './ui/Button'
import Select from './ui/Select'
import { Surface, MetricCard } from './app/AppShell'
import {
  TrendingUp,
  Users,
  Building2,
  Briefcase,
  ClipboardList,
  DollarSign,
  Download,
  BarChart3,
  PieChart as PieChartIcon,
  Activity,
  Calendar,
  Filter,
} from 'lucide-react'

/**
 * AnalyticsModule Component
 * Comprehensive analytics dashboard for Superadmin
 * Displays cross-company metrics, charts, and detailed reports
 */
export default function AnalyticsModule({
  isSuperAdmin = true,
  companies = [],
  users = [],
  submissions = [],
  tasks = [],
}) {
  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================
  const [dateRange, setDateRange] = useState('30') // '7', '30', '90', 'all'
  const [selectedCompany, setSelectedCompany] = useState('all')
  const [activeReport, setActiveReport] = useState('overview') // overview | hr | finance | submissions | activity

  // ============================================================================
  // MOCK DATA GENERATORS (Well-structured for future API integration)
  // ============================================================================

  const generateTrendData = useMemo(() => {
    const days = parseInt(dateRange) || 30
    const data = []
    const now = new Date()
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now)
      date.setDate(date.getDate() - i)
      data.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        submissions: Math.floor(Math.random() * 15) + 2,
        tasks: Math.floor(Math.random() * 10) + 1,
        users: Math.floor(Math.random() * 5) + 1,
      })
    }
    return data
  }, [dateRange])

  const generateCompanyPerformance = useMemo(() => {
    const targetCompanies = selectedCompany === 'all'
      ? companies.slice(0, 6)
      : companies.filter(c => c._id === selectedCompany)

    if (!targetCompanies.length) {
      return [
        { name: 'TechCorp', submissions: 45, tasks: 12, employees: 120, score: 85 },
        { name: 'GlobalSol', submissions: 32, tasks: 8, employees: 85, score: 72 },
        { name: 'InnovLab', submissions: 28, tasks: 15, employees: 60, score: 68 },
      ]
    }

    return targetCompanies.map((company, idx) => ({
      name: company.name || `Company ${idx + 1}`,
      submissions: Math.floor(Math.random() * 50) + 10,
      tasks: Math.floor(Math.random() * 20) + 5,
      employees: Math.floor(Math.random() * 100) + 20,
      score: Math.floor(Math.random() * 40) + 60,
    }))
  }, [companies, selectedCompany])

  const generateIndustryDistribution = useMemo(() => {
    const industries = {}
    companies.forEach(c => {
      const industry = c.industry || 'General'
      industries[industry] = (industries[industry] || 0) + 1
    })

    if (!Object.keys(industries).length) {
      return [
        { name: 'Technology', value: 35 },
        { name: 'Finance', value: 25 },
        { name: 'Healthcare', value: 20 },
        { name: 'Manufacturing', value: 15 },
        { name: 'Other', value: 5 },
      ]
    }

    return Object.entries(industries).map(([name, value]) => ({ name, value }))
  }, [companies])

  const generateUserGrowth = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const currentMonth = new Date().getMonth()
    const data = []
    for (let i = 11; i >= 0; i--) {
      const idx = (currentMonth - i + 12) % 12
      data.push({
        month: months[idx],
        totalUsers: Math.floor(Math.random() * 50) + 100 + (12 - i) * 10,
        activeUsers: Math.floor(Math.random() * 30) + 50 + (12 - i) * 5,
        newUsers: Math.floor(Math.random() * 15) + 5,
      })
    }
    return data
  }, [])

  const generateHRData = useMemo(() => {
    const departments = [
      { name: 'Engineering', count: Math.floor(Math.random() * 40) + 20 },
      { name: 'Sales', count: Math.floor(Math.random() * 30) + 15 },
      { name: 'Marketing', count: Math.floor(Math.random() * 20) + 10 },
      { name: 'HR', count: Math.floor(Math.random() * 15) + 5 },
      { name: 'Finance', count: Math.floor(Math.random() * 15) + 5 },
      { name: 'Operations', count: Math.floor(Math.random() * 25) + 10 },
    ]
    const totalEmployees = departments.reduce((sum, d) => sum + d.count, 0)
    return { departments, totalEmployees }
  }, [])

  const generateFinanceData = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']
    return months.map(month => ({
      month,
      revenue: Math.floor(Math.random() * 500000) + 200000,
      expenses: Math.floor(Math.random() * 300000) + 100000,
      profit: 0,
    })).map(item => ({
      ...item,
      profit: item.revenue - item.expenses,
    }))
  }, [])

  const generateActivityData = useMemo(() => {
    return [
      { type: 'Submission', count: Math.floor(Math.random() * 100) + 50, trend: '+12%' },
      { type: 'Task Created', count: Math.floor(Math.random() * 80) + 30, trend: '+8%' },
      { type: 'File Upload', count: Math.floor(Math.random() * 60) + 20, trend: '+15%' },
      { type: 'Comment', count: Math.floor(Math.random() * 120) + 40, trend: '+5%' },
      { type: 'Approval', count: Math.floor(Math.random() * 40) + 10, trend: '-3%' },
    ]
  }, [dateRange])

  // ============================================================================
  // DERIVED METRICS
  // ============================================================================

  const totalCompanies = companies.length || 12
  const totalUsers = users.length || 156
  const totalSubmissions = submissions.length || 342
  const activeTasks = (tasks.filter(t => t.status !== 'completed')?.length) || 28
  const totalRevenue = generateFinanceData.reduce((sum, d) => sum + d.revenue, 0)

  // ============================================================================
  // CHART COLORS
  // ============================================================================

  const COLORS = ['#0f172a', '#0284c7', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']

  // ============================================================================
  // EXPORT HANDLER
  // ============================================================================

  const handleExport = (format) => {
    const data = {
      timestamp: new Date().toISOString(),
      filters: { dateRange, selectedCompany, activeReport },
      metrics: { totalCompanies, totalUsers, totalSubmissions, activeTasks, totalRevenue },
      companyPerformance: generateCompanyPerformance,
      trendData: generateTrendData,
    }

    if (format === 'json') {
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `analytics-report-${new Date().toISOString().split('T')[0]}.json`
      a.click()
      URL.revokeObjectURL(url)
    } else if (format === 'csv') {
      const csvRows = [
        ['Metric', 'Value'],
        ['Total Companies', totalCompanies],
        ['Total Users', totalUsers],
        ['Total Submissions', totalSubmissions],
        ['Active Tasks', activeTasks],
        ['Total Revenue', totalRevenue],
      ]
      const csv = csvRows.map(row => row.join(',')).join('\n')
      const blob = new Blob([csv], { type: 'text/csv' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `analytics-report-${new Date().toISOString().split('T')[0]}.csv`
      a.click()
      URL.revokeObjectURL(url)
    }
  }

  // ============================================================================
  // RENDER SECTIONS
  // ============================================================================

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-5">
        <MetricCard
          title="Total Companies"
          value={totalCompanies}
          subtitle="Active operating units"
          icon={Building2}
          tone="slate"
        />
        <MetricCard
          title="Total Users"
          value={totalUsers}
          subtitle="Employees & admins"
          icon={Users}
          tone="sky"
        />
        <MetricCard
          title="Submissions"
          value={totalSubmissions}
          subtitle="Across all companies"
          icon={Briefcase}
          tone="emerald"
        />
        <MetricCard
          title="Active Tasks"
          value={activeTasks}
          subtitle="In progress"
          icon={ClipboardList}
          tone="amber"
        />
        <MetricCard
          title="Total Revenue"
          value={`$${(totalRevenue / 1000000).toFixed(1)}M`}
          subtitle="YTD aggregated"
          icon={DollarSign}
          tone="green"
        />
      </div>

      {/* Charts Row 1 */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Surface title="Submissions Trend" eyebrow="Activity over time">
          <div className="min-h-[280px] h-[40vh] lg:h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={generateTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="date" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0',
                    background: '#fff',
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="submissions"
                  stroke="#0284c7"
                  strokeWidth={2}
                  dot={{ fill: '#0284c7', r: 3 }}
                  activeDot={{ r: 5 }}
                />
                <Line
                  type="monotone"
                  dataKey="tasks"
                  stroke="#0f172a"
                  strokeWidth={2}
                  dot={{ fill: '#0f172a', r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Surface>

        <Surface title="Company Performance" eyebrow="Cross-company comparison">
          <div className="min-h-[280px] h-[40vh] lg:h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={generateCompanyPerformance}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0',
                    background: '#fff',
                  }}
                />
                <Legend />
                <Bar dataKey="submissions" fill="#0284c7" radius={[6, 6, 0, 0]} />
                <Bar dataKey="tasks" fill="#0f172a" radius={[6, 6, 0, 0]} />
                <Bar dataKey="employees" fill="#10b981" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Surface>
      </div>

      {/* Charts Row 2 */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Surface title="Industry Distribution" eyebrow="Portfolio composition">
          <div className="min-h-[280px] h-[40vh] lg:h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={generateIndustryDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {generateIndustryDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Surface>

        <Surface title="User Growth" eyebrow="12-month trend">
          <div className="min-h-[280px] h-[40vh] lg:h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={generateUserGrowth}>
                <defs>
                  <linearGradient id="totalUsersGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0f172a" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#0f172a" stopOpacity={0.02} />
                  </linearGradient>
                  <linearGradient id="activeUsersGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0284c7" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#0284c7" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0',
                    background: '#fff',
                  }}
                />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="totalUsers"
                  stroke="#0f172a"
                  fill="url(#totalUsersGradient)"
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="activeUsers"
                  stroke="#0284c7"
                  fill="url(#activeUsersGradient)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Surface>
      </div>

      {/* Activity Summary */}
      <Surface title="Activity Summary" eyebrow="Platform engagement">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {generateActivityData.map((activity, idx) => (
            <Card key={activity.type} className="rounded-xl border border-slate-200 bg-white/80">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs text-slate-500">{activity.type}</p>
                  <Badge
                    variant="outline"
                    className={activity.trend.startsWith('+') ? 'text-emerald-600 border-emerald-200' : 'text-rose-600 border-rose-200'}
                  >
                    {activity.trend}
                  </Badge>
                </div>
                <p className="text-2xl font-bold text-slate-950">{activity.count}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </Surface>
    </div>
  )

  const renderHRReport = () => (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Employees"
          value={generateHRData.totalEmployees}
          subtitle="Across all companies"
          icon={Users}
          tone="sky"
        />
        <MetricCard
          title="Departments"
          value={generateHRData.departments.length}
          subtitle="Active divisions"
          icon={Building2}
          tone="slate"
        />
        <MetricCard
          title="Avg. Team Size"
          value={Math.round(generateHRData.totalEmployees / (generateHRData.departments.length || 1))}
          subtitle="Per department"
          icon={Users}
          tone="emerald"
        />
        <MetricCard
          title="Hiring Rate"
          value="12%"
          subtitle="Month over month"
          icon={TrendingUp}
          tone="amber"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Surface title="Department Distribution" eyebrow="Employee count by dept">
          <div className="min-h-[280px] h-[40vh] lg:h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={generateHRData.departments} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis type="number" stroke="#64748b" fontSize={12} />
                <YAxis dataKey="name" type="category" stroke="#64748b" fontSize={12} width={100} />
                <Tooltip
                  contentStyle={{
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0',
                    background: '#fff',
                  }}
                />
                <Bar dataKey="count" fill="#0284c7" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Surface>

        <Surface title="Department Breakdown" eyebrow="Detailed stats">
          <div className="space-y-3">
            {generateHRData.departments.map((dept, idx) => (
              <div
                key={dept.name}
                className="flex items-center justify-between rounded-xl border border-slate-200 bg-white/80 p-4"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                  />
                  <span className="font-medium text-slate-950">{dept.name}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-slate-500">{dept.count} employees</span>
                  <span className="text-sm font-semibold text-slate-950">
                    {((dept.count / generateHRData.totalEmployees) * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Surface>
      </div>
    </div>
  )

  const renderFinanceReport = () => (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Revenue"
          value={`$${(generateFinanceData.reduce((s, d) => s + d.revenue, 0) / 1000000).toFixed(2)}M`}
          subtitle="6-month period"
          icon={DollarSign}
          tone="emerald"
        />
        <MetricCard
          title="Total Expenses"
          value={`$${(generateFinanceData.reduce((s, d) => s + d.expenses, 0) / 1000000).toFixed(2)}M`}
          subtitle="6-month period"
          icon={DollarSign}
          tone="rose"
        />
        <MetricCard
          title="Net Profit"
          value={`$${(generateFinanceData.reduce((s, d) => s + d.profit, 0) / 1000000).toFixed(2)}M`}
          subtitle="6-month period"
          icon={TrendingUp}
          tone="sky"
        />
        <MetricCard
          title="Profit Margin"
          value={`${(
            (generateFinanceData.reduce((s, d) => s + d.profit, 0) /
              generateFinanceData.reduce((s, d) => s + d.revenue, 0)) *
            100
          ).toFixed(1)}%`}
          subtitle="Average"
          icon={Activity}
          tone="amber"
        />
      </div>

      <Surface title="Financial Overview" eyebrow="Revenue vs Expenses vs Profit">
        <div className="min-h-[280px] h-[40vh] lg:h-[360px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={generateFinanceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
              <YAxis
                stroke="#64748b"
                fontSize={12}
                tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                  background: '#fff',
                }}
                formatter={(value) => `$${value.toLocaleString()}`}
              />
              <Legend />
              <Bar dataKey="revenue" fill="#10b981" radius={[6, 6, 0, 0]} />
              <Bar dataKey="expenses" fill="#ef4444" radius={[6, 6, 0, 0]} />
              <Bar dataKey="profit" fill="#0284c7" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Surface>
    </div>
  )

  const renderSubmissionsReport = () => (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Submissions"
          value={totalSubmissions}
          subtitle="All time"
          icon={Briefcase}
          tone="sky"
        />
        <MetricCard
          title="Approved"
          value={Math.floor(totalSubmissions * 0.7)}
          subtitle="70% approval rate"
          icon={TrendingUp}
          tone="emerald"
        />
        <MetricCard
          title="Pending"
          value={Math.floor(totalSubmissions * 0.2)}
          subtitle="Awaiting review"
          icon={ClipboardList}
          tone="amber"
        />
        <MetricCard
          title="Rejected"
          value={Math.floor(totalSubmissions * 0.1)}
          subtitle="10% rejection rate"
          icon={Activity}
          tone="rose"
        />
      </div>

      <Surface title="Submission Trends" eyebrow="Daily activity">
        <div className="min-h-[280px] h-[40vh] lg:h-[320px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={generateTrendData}>
              <defs>
                <linearGradient id="submissionsGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0284c7" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#0284c7" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="date" stroke="#64748b" fontSize={12} />
              <YAxis stroke="#64748b" fontSize={12} />
              <Tooltip
                contentStyle={{
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                  background: '#fff',
                }}
              />
              <Area
                type="monotone"
                dataKey="submissions"
                stroke="#0284c7"
                fill="url(#submissionsGradient)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Surface>
    </div>
  )

  const renderActivityReport = () => (
    <div className="space-y-6">
      <Surface title="Platform Activity Log" eyebrow="Recent actions">
        <div className="space-y-3">
          {generateActivityData.map((activity, idx) => (
            <div
              key={activity.type}
              className="flex items-center justify-between rounded-xl border border-slate-200 bg-white/80 p-4"
            >
              <div className="flex items-center gap-3">
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-xl"
                  style={{ backgroundColor: `${COLORS[idx % COLORS.length]}15` }}
                >
                  <Activity
                    className="h-5 w-5"
                    style={{ color: COLORS[idx % COLORS.length] }}
                  />
                </div>
                <div>
                  <p className="font-medium text-slate-950">{activity.type}</p>
                  <p className="text-sm text-slate-500">Last {dateRange} days</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Badge
                  variant="outline"
                  className={
                    activity.trend.startsWith('+')
                      ? 'text-emerald-600 border-emerald-200'
                      : 'text-rose-600 border-rose-200'
                  }
                >
                  {activity.trend}
                </Badge>
                <span className="text-lg font-bold text-slate-950">{activity.count}</span>
              </div>
            </div>
          ))}
        </div>
      </Surface>
    </div>
  )

  // ============================================================================
  // MAIN RENDER
  // ============================================================================

  return (
    <div className="space-y-6">
      {/* Header with Filters */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-slate-950">
            Analytics Dashboard
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Cross-company insights and performance metrics
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Date Range Filter */}
          <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2">
            <Calendar className="h-4 w-4 text-slate-400" />
            <Select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="border-none bg-transparent text-sm font-medium"
            >
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 90 days</option>
              <option value="all">All Time</option>
            </Select>
          </div>

          {/* Company Filter */}
          <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2">
            <Filter className="h-4 w-4 text-slate-400" />
            <Select
              value={selectedCompany}
              onChange={(e) => setSelectedCompany(e.target.value)}
              className="border-none bg-transparent text-sm font-medium"
            >
              <option value="all">All Companies</option>
              {companies.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </Select>
          </div>

          {/* Export Buttons */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleExport('csv')}
            className="gap-2 rounded-xl"
          >
            <Download className="h-4 w-4" />
            CSV
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleExport('json')}
            className="gap-2 rounded-xl"
          >
            <Download className="h-4 w-4" />
            JSON
          </Button>
        </div>
      </div>

      {/* Report Tabs */}
      <div className="flex flex-wrap gap-2">
        {[
          { id: 'overview', label: 'Overview', icon: BarChart3 },
          { id: 'hr', label: 'HR Analytics', icon: Users },
          { id: 'finance', label: 'Finance', icon: DollarSign },
          { id: 'submissions', label: 'Submissions', icon: Briefcase },
          { id: 'activity', label: 'Activity', icon: Activity },
        ].map((tab) => (
          <Button
            key={tab.id}
            variant={activeReport === tab.id ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveReport(tab.id)}
            className={`gap-2 rounded-xl ${
              activeReport === tab.id
                ? 'bg-slate-950 text-white'
                : 'bg-white text-slate-600 hover:text-slate-950'
            }`}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </Button>
        ))}
      </div>

      {/* Report Content */}
      {activeReport === 'overview' && renderOverview()}
      {activeReport === 'hr' && renderHRReport()}
      {activeReport === 'finance' && renderFinanceReport()}
      {activeReport === 'submissions' && renderSubmissionsReport()}
      {activeReport === 'activity' && renderActivityReport()}
    </div>
  )
}
