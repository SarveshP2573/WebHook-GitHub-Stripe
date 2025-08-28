// src/pages/CICDAutomation.js
import { useEffect, useState } from 'react'

import {
  PipelineVisualization,
  WorkflowCard,
  WorkflowForm
} from '../features/github/components/CICDComponents'
import '../styles/cicdautomation.css'

const CICDAutomation = () => {
  const [workflows, setWorkflows] = useState([])
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingWorkflow, setEditingWorkflow] = useState(null)
  const [selectedWorkflow, setSelectedWorkflow] = useState(null)
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(true)

  // Mock data - Replace with actual API calls
  useEffect(() => {
    const fetchWorkflows = async () => {
      setLoading(true)
      try {
        // TODO: Replace with actual API call
        // const response = await workflowsAPI.getWorkflows();

        // Mock data
        const mockWorkflows = [
          {
            id: 1,
            name: 'Production Deployment',
            description:
              'Deploy to production environment after successful tests',
            trigger: 'github.push',
            condition: 'branch == main',
            actions: ['build', 'test', 'deploy:production'],
            status: 'active',
            lastRun: '2023-10-15T14:30:00Z',
            nextRun: '2023-10-16T02:00:00Z',
            successRate: 98,
            runs: 42,
            environment: 'production',
            notifications: ['slack:deployments', 'email:team']
          },
          {
            id: 2,
            name: 'Staging Test Suite',
            description: 'Run full test suite on staging environment',
            trigger: 'github.pull_request',
            condition: 'action == closed && merged == true',
            actions: [
              'build',
              'test:unit',
              'test:integration',
              'deploy:staging'
            ],
            status: 'active',
            lastRun: '2023-10-15T13:15:00Z',
            nextRun: null,
            successRate: 100,
            runs: 28,
            environment: 'staging',
            notifications: ['slack:testing']
          },
          {
            id: 3,
            name: 'Security Scan',
            description: 'Daily security vulnerability scanning',
            trigger: 'schedule.daily',
            condition: 'time == 02:00',
            actions: ['security_scan', 'notify:security-team'],
            status: 'active',
            lastRun: '2023-10-15T02:00:00Z',
            nextRun: '2023-10-16T02:00:00Z',
            successRate: 95,
            runs: 15,
            environment: 'security',
            notifications: ['email:security']
          },
          {
            id: 4,
            name: 'Database Migration',
            description: 'Manual database schema migrations',
            trigger: 'manual',
            condition: 'N/A',
            actions: ['db:migrate', 'backup', 'notify:devops'],
            status: 'inactive',
            lastRun: null,
            nextRun: null,
            successRate: 0,
            runs: 0,
            environment: 'production',
            notifications: []
          }
        ]

        setWorkflows(mockWorkflows)
      } catch (error) {
        console.error('Error fetching workflows:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchWorkflows()
  }, [])

  const handleCreateWorkflow = workflowData => {
    const newWorkflow = {
      id: workflows.length + 1,
      ...workflowData,
      status: 'active',
      lastRun: null,
      nextRun:
        workflowData.trigger === 'schedule.daily'
          ? '2023-10-16T02:00:00Z'
          : null,
      successRate: 0,
      runs: 0
    }
    setWorkflows([...workflows, newWorkflow])
    setShowCreateForm(false)
  }

  const handleUpdateWorkflow = updatedWorkflow => {
    setWorkflows(
      workflows.map(wf => (wf.id === updatedWorkflow.id ? updatedWorkflow : wf))
    )
    setEditingWorkflow(null)
  }

  const handleDeleteWorkflow = workflowId => {
    setWorkflows(workflows.filter(wf => wf.id !== workflowId))
  }

  const toggleWorkflowStatus = workflowId => {
    setWorkflows(
      workflows.map(wf =>
        wf.id === workflowId
          ? { ...wf, status: wf.status === 'active' ? 'inactive' : 'active' }
          : wf
      )
    )
  }

  const runWorkflow = workflowId => {
    // TODO: Implement actual workflow execution
    alert(`Running workflow ${workflowId}`)
  }

  const filteredWorkflows = workflows.filter(workflow => {
    if (filter === 'all') return true
    return workflow.status === filter
  })

  if (loading) {
    return (
      <div className='cicd-automation-page'>
        <div className='loading-container'>
          <div className='spinner'></div>
          <p>Loading CI/CD workflows...</p>
        </div>
      </div>
    )
  }

  if (selectedWorkflow) {
    return (
      <PipelineVisualization
        workflow={selectedWorkflow}
        onBack={() => setSelectedWorkflow(null)}
      />
    )
  }

  if (editingWorkflow) {
    return (
      <WorkflowForm
        workflow={editingWorkflow}
        onSubmit={handleUpdateWorkflow}
        onCancel={() => setEditingWorkflow(null)}
      />
    )
  }

  if (showCreateForm) {
    return (
      <WorkflowForm
        onSubmit={handleCreateWorkflow}
        onCancel={() => setShowCreateForm(false)}
      />
    )
  }

  return (
    <div className='cicd-automation-page'>
      <div className='automation-header'>
        <div className='header-content'>
          <h1>CI/CD Automation</h1>
          <p>Automate your build, test, and deployment workflows</p>
        </div>
        <button className='btn-primary' onClick={() => setShowCreateForm(true)}>
          <i className='fas fa-plus'></i>
          Create Workflow
        </button>
      </div>

      <div className='automation-stats'>
        <div className='stat-card'>
          <div className='stat-icon'>
            <i className='fas fa-play-circle'></i>
          </div>
          <div className='stat-info'>
            <h3>{workflows.filter(w => w.status === 'active').length}</h3>
            <p>Active Workflows</p>
          </div>
        </div>
        <div className='stat-card'>
          <div className='stat-icon'>
            <i className='fas fa-check-circle'></i>
          </div>
          <div className='stat-info'>
            <h3>{workflows.reduce((acc, w) => acc + w.runs, 0)}</h3>
            <p>Total Runs</p>
          </div>
        </div>
        <div className='stat-card'>
          <div className='stat-icon'>
            <i className='fas fa-chart-line'></i>
          </div>
          <div className='stat-info'>
            <h3>
              {workflows.length > 0
                ? Math.round(
                    workflows.reduce((acc, w) => acc + w.successRate, 0) /
                      workflows.length
                  )
                : 0}
              %
            </h3>
            <p>Average Success Rate</p>
          </div>
        </div>
      </div>

      <div className='filters-section'>
        <div className='filter-tabs'>
          <button
            className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All Workflows
          </button>
          <button
            className={`filter-tab ${filter === 'active' ? 'active' : ''}`}
            onClick={() => setFilter('active')}
          >
            Active
          </button>
          <button
            className={`filter-tab ${filter === 'inactive' ? 'active' : ''}`}
            onClick={() => setFilter('inactive')}
          >
            Inactive
          </button>
        </div>
        <div className='search-box'>
          <input
            type='text'
            placeholder='Search workflows...'
            className='search-input'
          />
          <i className='fas fa-search'></i>
        </div>
      </div>

      <div className='workflows-grid'>
        {filteredWorkflows.map(workflow => (
          <WorkflowCard
            key={workflow.id}
            workflow={workflow}
            onEdit={() => setEditingWorkflow(workflow)}
            onDelete={() => handleDeleteWorkflow(workflow.id)}
            onToggleStatus={() => toggleWorkflowStatus(workflow.id)}
            onRun={() => runWorkflow(workflow.id)}
            onView={() => setSelectedWorkflow(workflow)}
          />
        ))}
      </div>

      {filteredWorkflows.length === 0 && (
        <div className='empty-state'>
          <div className='empty-icon'>
            <i className='fas fa-robot'></i>
          </div>
          <h3>No workflows found</h3>
          <p>
            Create your first CI/CD workflow to automate your deployment process
          </p>
          <button
            className='btn-primary'
            onClick={() => setShowCreateForm(true)}
          >
            Create Workflow
          </button>
        </div>
      )}
    </div>
  )
}

export default CICDAutomation
