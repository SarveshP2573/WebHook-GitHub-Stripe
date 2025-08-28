// src/components/CICD/CICDComponents.js
import { useState } from 'react'
import '../../../styles/CICDComponents.css'

// WorkflowCard Component
export const WorkflowCard = ({
  workflow,
  onEdit,
  onDelete,
  onToggleStatus,
  onRun,
  onView
}) => {
  const formatDate = dateString => {
    if (!dateString) return 'Never'
    return new Date(dateString).toLocaleDateString()
  }

  const formatTrigger = trigger => {
    const triggers = {
      'github.push': 'GitHub Push',
      'github.pull_request': 'GitHub PR',
      'schedule.daily': 'Daily Schedule',
      manual: 'Manual'
    }
    return triggers[trigger] || trigger
  }

  return (
    <div className={`workflow-card ${workflow.status}`}>
      <div className='workflow-header'>
        <div className='workflow-info'>
          <h3>{workflow.name}</h3>
          <p className='workflow-description'>{workflow.description}</p>
        </div>
        <div className='workflow-status'>
          <span className={`status-badge status-${workflow.status}`}>
            {workflow.status}
          </span>
        </div>
      </div>

      <div className='workflow-details'>
        <div className='detail-row'>
          <span className='detail-label'>Trigger:</span>
          <span className='detail-value'>
            {formatTrigger(workflow.trigger)}
          </span>
        </div>
        {workflow.condition && workflow.condition !== 'N/A' && (
          <div className='detail-row'>
            <span className='detail-label'>Condition:</span>
            <span className='detail-value'>{workflow.condition}</span>
          </div>
        )}
        <div className='detail-row'>
          <span className='detail-label'>Environment:</span>
          <span className='detail-value environment'>
            {workflow.environment}
          </span>
        </div>
      </div>

      <div className='workflow-actions'>
        <div className='actions-tags'>
          {workflow.actions.map((action, index) => (
            <span key={index} className='action-tag'>
              {action}
            </span>
          ))}
        </div>
      </div>

      <div className='workflow-metrics'>
        <div className='metric'>
          <span className='metric-value'>{workflow.runs}</span>
          <span className='metric-label'>Runs</span>
        </div>
        <div className='metric'>
          <span className='metric-value'>{workflow.successRate}%</span>
          <span className='metric-label'>Success</span>
        </div>
        <div className='metric'>
          <span className='metric-value'>{formatDate(workflow.lastRun)}</span>
          <span className='metric-label'>Last Run</span>
        </div>
      </div>

      <div className='workflow-footer'>
        <div className='workflow-actions-buttons'>
          <button className='btn-icon' onClick={onView} title='View Pipeline'>
            <i className='fas fa-project-diagram'></i>
          </button>
          <button className='btn-icon' onClick={onRun} title='Run Now'>
            <i className='fas fa-play'></i>
          </button>
          <button
            className='btn-icon'
            onClick={onToggleStatus}
            title='Toggle Status'
          >
            <i
              className={`fas fa-toggle-${
                workflow.status === 'active' ? 'on' : 'off'
              }`}
            ></i>
          </button>
          <button className='btn-icon' onClick={onEdit} title='Edit'>
            <i className='fas fa-edit'></i>
          </button>
          <button className='btn-icon danger' onClick={onDelete} title='Delete'>
            <i className='fas fa-trash'></i>
          </button>
        </div>
      </div>
    </div>
  )
}

// WorkflowForm Component
export const WorkflowForm = ({ workflow, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: workflow?.name || '',
    description: workflow?.description || '',
    trigger: workflow?.trigger || 'github.push',
    condition: workflow?.condition || '',
    actions: workflow?.actions || [],
    environment: workflow?.environment || 'staging',
    notifications: workflow?.notifications || []
  })

  const [errors, setErrors] = useState({})

  const handleChange = e => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const handleActionToggle = action => {
    setFormData(prev => {
      const actions = prev.actions.includes(action)
        ? prev.actions.filter(a => a !== action)
        : [...prev.actions, action]
      return { ...prev, actions }
    })
  }

  const handleNotificationToggle = notification => {
    setFormData(prev => {
      const notifications = prev.notifications.includes(notification)
        ? prev.notifications.filter(n => n !== notification)
        : [...prev.notifications, notification]
      return { ...prev, notifications }
    })
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Workflow name is required'
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required'
    }

    if (formData.actions.length === 0) {
      newErrors.actions = 'At least one action is required'
    }

    return newErrors
  }

  const handleSubmit = e => {
    e.preventDefault()
    const newErrors = validateForm()

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    onSubmit(formData)
  }

  const availableActions = [
    'build',
    'test',
    'test:unit',
    'test:integration',
    'test:e2e',
    'deploy:staging',
    'deploy:production',
    'security_scan',
    'db:migrate',
    'backup',
    'notify:slack',
    'notify:email'
  ]

  const availableNotifications = [
    'slack:deployments',
    'slack:testing',
    'slack:alerts',
    'email:team',
    'email:security',
    'email:devops'
  ]

  return (
    <div className='workflow-form-container'>
      <div className='form-header'>
        <h2>{workflow ? 'Edit Workflow' : 'Create New Workflow'}</h2>
        <p>Configure your CI/CD automation workflow</p>
      </div>

      <form className='workflow-form' onSubmit={handleSubmit}>
        <div className='form-section'>
          <div className='form-group'>
            <label htmlFor='name'>Workflow Name *</label>
            <input
              type='text'
              id='name'
              name='name'
              value={formData.name}
              onChange={handleChange}
              className={errors.name ? 'error' : ''}
              placeholder='e.g., Production Deployment'
            />
            {errors.name && (
              <span className='error-message'>{errors.name}</span>
            )}
          </div>

          <div className='form-group'>
            <label htmlFor='description'>Description *</label>
            <textarea
              id='description'
              name='description'
              value={formData.description}
              onChange={handleChange}
              className={errors.description ? 'error' : ''}
              placeholder='Describe what this workflow does...'
              rows='3'
            />
            {errors.description && (
              <span className='error-message'>{errors.description}</span>
            )}
          </div>
        </div>

        <div className='form-section'>
          <div className='form-group'>
            <label htmlFor='trigger'>Trigger Event *</label>
            <select
              id='trigger'
              name='trigger'
              value={formData.trigger}
              onChange={handleChange}
            >
              <option value='github.push'>GitHub Push</option>
              <option value='github.pull_request'>GitHub Pull Request</option>
              <option value='schedule.daily'>Daily Schedule</option>
              <option value='manual'>Manual Trigger</option>
            </select>
          </div>

          <div className='form-group'>
            <label htmlFor='condition'>Condition (Optional)</label>
            <input
              type='text'
              id='condition'
              name='condition'
              value={formData.condition}
              onChange={handleChange}
              placeholder='e.g., branch == main'
            />
            <span className='help-text'>
              JavaScript condition for when to run this workflow
            </span>
          </div>

          <div className='form-group'>
            <label htmlFor='environment'>Environment</label>
            <select
              id='environment'
              name='environment'
              value={formData.environment}
              onChange={handleChange}
            >
              <option value='staging'>Staging</option>
              <option value='production'>Production</option>
              <option value='development'>Development</option>
              <option value='testing'>Testing</option>
              <option value='security'>Security</option>
            </select>
          </div>
        </div>

        <div className='form-section'>
          <div className='form-group'>
            <label>Actions *</label>
            <div className='checkbox-grid'>
              {availableActions.map(action => (
                <label key={action} className='checkbox-item'>
                  <input
                    type='checkbox'
                    checked={formData.actions.includes(action)}
                    onChange={() => handleActionToggle(action)}
                  />
                  <span className='checkmark'></span>
                  {action}
                </label>
              ))}
            </div>
            {errors.actions && (
              <span className='error-message'>{errors.actions}</span>
            )}
          </div>
        </div>

        <div className='form-section'>
          <div className='form-group'>
            <label>Notifications</label>
            <div className='checkbox-grid'>
              {availableNotifications.map(notification => (
                <label key={notification} className='checkbox-item'>
                  <input
                    type='checkbox'
                    checked={formData.notifications.includes(notification)}
                    onChange={() => handleNotificationToggle(notification)}
                  />
                  <span className='checkmark'></span>
                  {notification}
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className='form-actions'>
          <button type='button' className='btn-secondary' onClick={onCancel}>
            Cancel
          </button>
          <button type='submit' className='btn-primary'>
            {workflow ? 'Update Workflow' : 'Create Workflow'}
          </button>
        </div>
      </form>
    </div>
  )
}

// PipelineVisualization Component
export const PipelineVisualization = ({ workflow, onBack }) => {
  const [selectedStage, setSelectedStage] = useState(null)

  const getStageStatus = stage => {
    // Mock status - replace with actual data from backend
    const statuses = ['success', 'pending', 'failed', 'running']
    return statuses[Math.floor(Math.random() * statuses.length)]
  }

  const pipelineStages = [
    { id: 1, name: 'Source', description: 'Code checkout and preparation' },
    {
      id: 2,
      name: 'Build',
      description: 'Compilation and dependency installation'
    },
    { id: 3, name: 'Test', description: 'Automated testing suite execution' },
    {
      id: 4,
      name: 'Security Scan',
      description: 'Vulnerability and security checks'
    },
    { id: 5, name: 'Deploy', description: 'Deployment to target environment' },
    { id: 6, name: 'Notify', description: 'Notification and reporting' }
  ]

  return (
    <div className='pipeline-visualization'>
      <div className='pipeline-header'>
        <button className='back-button' onClick={onBack}>
          <i className='fas fa-arrow-left'></i> Back to Workflows
        </button>
        <div className='pipeline-title'>
          <h2>{workflow.name} Pipeline</h2>
          <p>{workflow.description}</p>
        </div>
        <div className='pipeline-actions'>
          <button className='btn-primary'>
            <i className='fas fa-play'></i> Run Pipeline
          </button>
        </div>
      </div>

      <div className='pipeline-content'>
        <div className='pipeline-overview'>
          <div className='pipeline-stats'>
            <div className='stat'>
              <span className='stat-value'>{workflow.runs}</span>
              <span className='stat-label'>Total Runs</span>
            </div>
            <div className='stat'>
              <span className='stat-value'>{workflow.successRate}%</span>
              <span className='stat-label'>Success Rate</span>
            </div>
            <div className='stat'>
              <span className='stat-value'>
                {workflow.lastRun
                  ? new Date(workflow.lastRun).toLocaleDateString()
                  : 'Never'}
              </span>
              <span className='stat-label'>Last Run</span>
            </div>
          </div>
        </div>

        <div className='pipeline-diagram'>
          <h3>Pipeline Stages</h3>
          <div className='stages-container'>
            {pipelineStages.map((stage, index) => (
              <div key={stage.id} className='pipeline-stage'>
                <div className='stage-connector'>
                  {index > 0 && <div className='connector-line'></div>}
                  <div className={`stage-status ${getStageStatus(stage)}`}>
                    <i
                      className={`fas fa-${getStageIcon(
                        getStageStatus(stage)
                      )}`}
                    ></i>
                  </div>
                  {index < pipelineStages.length - 1 && (
                    <div className='connector-line'></div>
                  )}
                </div>
                <div
                  className='stage-info'
                  onClick={() =>
                    setSelectedStage(
                      selectedStage?.id === stage.id ? null : stage
                    )
                  }
                >
                  <h4>{stage.name}</h4>
                  <p>{stage.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {selectedStage && (
          <div className='stage-details'>
            <h4>Stage Details: {selectedStage.name}</h4>
            <div className='details-content'>
              <div className='detail-item'>
                <span className='detail-label'>Status:</span>
                <span
                  className={`detail-value status-${getStageStatus(
                    selectedStage
                  )}`}
                >
                  {getStageStatus(selectedStage)}
                </span>
              </div>
              <div className='detail-item'>
                <span className='detail-label'>Duration:</span>
                <span className='detail-value'>2m 34s</span>
              </div>
              <div className='detail-item'>
                <span className='detail-label'>Started:</span>
                <span className='detail-value'>2023-10-15 14:30:45</span>
              </div>
              <div className='detail-item'>
                <span className='detail-label'>Completed:</span>
                <span className='detail-value'>2023-10-15 14:33:19</span>
              </div>
            </div>
          </div>
        )}

        <div className='pipeline-history'>
          <h3>Execution History</h3>
          <div className='history-list'>
            <div className='history-item success'>
              <div className='history-status'>
                <i className='fas fa-check-circle'></i>
              </div>
              <div className='history-details'>
                <span className='history-title'>Pipeline #42</span>
                <span className='history-time'>Completed 2 hours ago</span>
              </div>
              <div className='history-duration'>2m 34s</div>
            </div>
            <div className='history-item failed'>
              <div className='history-status'>
                <i className='fas fa-times-circle'></i>
              </div>
              <div className='history-details'>
                <span className='history-title'>Pipeline #41</span>
                <span className='history-time'>Failed 4 hours ago</span>
              </div>
              <div className='history-duration'>1m 12s</div>
            </div>
            <div className='history-item success'>
              <div className='history-status'>
                <i className='fas fa-check-circle'></i>
              </div>
              <div className='history-details'>
                <span className='history-title'>Pipeline #40</span>
                <span className='history-time'>Completed 1 day ago</span>
              </div>
              <div className='history-duration'>3m 01s</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Helper function for pipeline visualization
const getStageIcon = status => {
  const icons = {
    success: 'check',
    pending: 'clock',
    failed: 'times',
    running: 'sync'
  }
  return icons[status] || 'circle'
}
