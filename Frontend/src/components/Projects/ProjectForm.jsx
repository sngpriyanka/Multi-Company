import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/Dialog'
import Button from '../ui/Button'
import Input from '../ui/Input'
import Select from '../ui/Select'
import Textarea from '../ui/Textarea'
import Label from '../ui/Label'
import { PRIORITIES, HEALTH_STATUS, ACTION_TIMING } from '../../utils/constants'

export default function ProjectForm({ open, onClose, onSubmit, initialData = null, loading = false }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    priority: 'Medium',
    status: 'Planning',
    health: 'Green',
    budget: '',
    progress: '0',
    blockers: '0',
    followUp: '',
    nextActionBy: 'This Week',
  })

  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        description: initialData.description || '',
        priority: initialData.priority || 'Medium',
        status: initialData.status || 'Planning',
        health: initialData.health || 'Green',
        budget: initialData.budget?.total || '',
        progress: initialData.progress || '0',
        blockers: initialData.blockers || '0',
        followUp: initialData.followUp || '',
        nextActionBy: initialData.nextActionBy || 'This Week',
      })
    } else {
      setFormData({
        name: '',
        description: '',
        priority: 'Medium',
        status: 'Planning',
        health: 'Green',
        budget: '',
        progress: '0',
        blockers: '0',
        followUp: '',
        nextActionBy: 'This Week',
      })
    }
    setErrors({})
  }, [initialData, open])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }))
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: '',
      }))
    }
  }

  const validate = () => {
    const newErrors = {}
    if (!formData.name.trim()) newErrors.name = 'Project name is required'
    if (!formData.budget) newErrors.budget = 'Budget is required'
    if (isNaN(formData.budget) || parseFloat(formData.budget) < 0) {
      newErrors.budget = 'Budget must be a positive number'
    }
    if (isNaN(formData.progress) || formData.progress < 0 || formData.progress > 100) {
      newErrors.progress = 'Progress must be between 0 and 100'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (validate()) {
      onSubmit({
        ...formData,
        budget: parseFloat(formData.budget),
        progress: parseInt(formData.progress),
        blockers: parseInt(formData.blockers),
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl" onClose={onClose}>
        <DialogHeader>
          <DialogTitle>{initialData ? 'Edit Project' : 'Create New Project'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 max-h-96 overflow-y-auto">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Project Name *</Label>
              <Input
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Project name"
                error={errors.name}
              />
            </div>
            <div>
              <Label>Budget *</Label>
              <Input
                type="number"
                name="budget"
                value={formData.budget}
                onChange={handleChange}
                placeholder="0"
                error={errors.budget}
              />
            </div>
          </div>

          <div>
            <Label>Description</Label>
            <Textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Project description"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Priority</Label>
              <Select name="priority" value={formData.priority} onChange={handleChange}>
                {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
              </Select>
            </div>
            <div>
              <Label>Status</Label>
              <Select name="status" value={formData.status} onChange={handleChange}>
                <option value="Planning">Planning</option>
                <option value="In Progress">In Progress</option>
                <option value="On Hold">On Hold</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Health Status</Label>
              <Select name="health" value={formData.health} onChange={handleChange}>
                {HEALTH_STATUS.map(h => <option key={h} value={h}>{h}</option>)}
              </Select>
            </div>
            <div>
              <Label>Progress (%)</Label>
              <Input
                type="number"
                name="progress"
                value={formData.progress}
                onChange={handleChange}
                min="0"
                max="100"
                error={errors.progress}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Blockers</Label>
              <Input
                type="number"
                name="blockers"
                value={formData.blockers}
                onChange={handleChange}
                min="0"
              />
            </div>
            <div>
              <Label>Next Action By</Label>
              <Select name="nextActionBy" value={formData.nextActionBy} onChange={handleChange}>
                {ACTION_TIMING.map(t => <option key={t} value={t}>{t}</option>)}
              </Select>
            </div>
          </div>

          <div>
            <Label>Follow-up Required</Label>
            <Textarea
              name="followUp"
              value={formData.followUp}
              onChange={handleChange}
              placeholder="What needs to be done"
            />
          </div>
        </form>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit} isLoading={loading}>
            {initialData ? 'Update Project' : 'Create Project'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}