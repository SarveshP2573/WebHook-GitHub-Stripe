// src/pages/RepositoryMonitoring.js
import axios from 'axios'
import { useEffect, useState } from 'react'
import ActivityFeed from '../features/github/components/ActivityFeed'
import FilterBar from '../features/github/components/FilterBar'
import RepositoryCard from '../features/github/components/RepositoryCard'
import StatisticsPanel from '../features/github/components/StatisticspANEL.JSX'
import '../styles/RepositoryMonitoring.css'

const api = axios.create({
  baseURL: 'http://localhost:5000/api'
})

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

const RepositoryMonitoring = () => {
  const [repositories, setRepositories] = useState([])
  const [activities, setActivities] = useState([])
  const [stats, setStats] = useState({})
  const [loading, setLoading] = useState(true)
  const [webhookStatus, setWebhookStatus] = useState(null)
  const [githubConnected, setGithubConnected] = useState(false)
  const [filters, setFilters] = useState({
    eventType: 'all',
    repository: 'all',
    dateRange: '7d',
    status: 'all'
  })

  // Calculate statistics from activities
  const calculateStats = (activities, repositories) => {
    console.log('📊 Calculating stats from activities:', activities.length)

    const pushes = activities.filter(
      activity => activity.eventType === 'push'
    ).length
    const pullRequests = activities.filter(
      activity => activity.eventType === 'pull_request'
    ).length
    const issues = activities.filter(
      activity => activity.eventType === 'issues'
    ).length

    // Get unique authors
    const uniqueAuthors = [
      ...new Set(activities.map(activity => activity.author).filter(Boolean))
    ]

    // Get unique repositories from activities
    const activeRepositories = [
      ...new Set(
        activities.map(activity => activity.repository).filter(Boolean)
      )
    ]

    const stats = {
      totalRepositories: repositories.length,
      totalActivities: activities.length,
      pushes: pushes,
      pullRequests: pullRequests,
      issues: issues,
      activeContributors: uniqueAuthors.length,
      activeRepositories: activeRepositories.length,
      successRate: activities.length > 0 ? 98.5 : 0
    }

    console.log('📈 Calculated stats:', stats)
    return stats
  }

  useEffect(() => {
    fetchAllData()
    checkGithubConnection()
  }, [filters])

  // Update stats when activities or repositories change
  useEffect(() => {
    if (activities.length > 0 || repositories.length > 0) {
      const calculatedStats = calculateStats(activities, repositories)
      setStats(calculatedStats)
    }
  }, [activities, repositories])

  const fetchAllData = async () => {
    setLoading(true)
    try {
      await Promise.all([
        fetchRepositories(),
        fetchActivities(),
        checkWebhookStatus()
      ])
    } catch (error) {
      console.error('Error fetching data:', error)
      alert('Failed to load repository data')
    } finally {
      setLoading(false)
    }
  }

  const checkGithubConnection = async () => {
    try {
      const response = await api.get('/github/status')
      setGithubConnected(response.data.connected)
    } catch (error) {
      console.error('Error checking GitHub connection:', error)
      setGithubConnected(false)
    }
  }

  const fetchRepositories = async () => {
    try {
      const response = await api.get('/github/repositories')
      console.log('Repositories:', response.data.repositories)
      setRepositories(response.data.repositories || [])
    } catch (error) {
      console.error('Error fetching repositories:', error)
      setRepositories([])
    }
  }

  const fetchActivities = async () => {
    try {
      const response = await api.get('/github/activities', {
        params: filters
      })
      console.log('Activities received:', response.data.activities)
      setActivities(response.data.activities || [])
    } catch (error) {
      console.error('Error fetching activities:', error)
      setActivities([])
    }
  }

  const checkWebhookStatus = async () => {
    try {
      const response = await api.get('/github/webhook-status')
      console.log('Webhook Status:', response.data)
      setWebhookStatus(response.data)
    } catch (error) {
      console.error('Error checking webhook status:', error)
      setWebhookStatus(null)
    }
  }

  // Setup global webhook for all repositories
  const setupGlobalWebhook = async () => {
    try {
      const response = await api.post('/github/setup-global-webhook')

      if (response.data.success) {
        alert(response.data.message)
        alert(
          `Add this webhook URL to your GitHub account settings:\n\n${response.data.webhookUrl}\n\nGo to GitHub → Settings → Developer settings → Webhooks`
        )
        await checkWebhookStatus()
      } else {
        alert(`Failed to setup webhook: ${response.data.error}`)
      }
    } catch (error) {
      console.error('Error setting up global webhook:', error)
      alert('Failed to setup webhook. Please check your GitHub integration.')
    }
  }

  // Remove global webhook
  const removeGlobalWebhook = async () => {
    try {
      const response = await api.post('/github/remove-webhook')

      if (response.data.success) {
        alert('Global webhook removed successfully')
        await checkWebhookStatus()
      } else {
        alert(`Failed to remove webhook: ${response.data.error}`)
      }
    } catch (error) {
      console.error('Error removing webhook:', error)
      alert('Failed to remove webhook.')
    }
  }

  const handleFilterChange = newFilters => {
    setFilters(newFilters)
  }

  const refreshData = async () => {
    await fetchAllData()
  }

  const connectGithub = async () => {
    try {
      const response = await api.get('/github/connect')
      if (response.data.authUrl) {
        window.location.href = response.data.authUrl
      }
    } catch (error) {
      console.error('Error connecting to GitHub:', error)
      alert('Failed to connect to GitHub')
    }
  }

  // Manual refresh when new events might come in
  const handleNewEvent = () => {
    fetchActivities()
  }

  if (loading) {
    return (
      <div className='repository-monitoring-page'>
        <div className='loading-container'>
          <div className='spinner'></div>
          <p>Loading repository data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className='repository-monitoring-page'>
      <div className='monitoring-header'>
        <div className='header-content'>
          <h1>Repository Monitoring</h1>
          <p>Track pushes, pulls, and issues across your repositories</p>

          {/* GitHub Connection Status */}
          <div
            className={`github-status ${
              githubConnected ? 'connected' : 'disconnected'
            }`}
          >
            <div className='status-indicator'>
              <span
                className={`status-dot ${
                  githubConnected ? 'connected' : 'disconnected'
                }`}
              ></span>
              {githubConnected ? (
                <div className='connection-info'>
                  <span>✅ GitHub Connected</span>
                  {webhookStatus?.active ? (
                    <button
                      className='btn-warning'
                      onClick={removeGlobalWebhook}
                    >
                      Remove Webhook
                    </button>
                  ) : (
                    <button
                      className='btn-success'
                      onClick={setupGlobalWebhook}
                    >
                      Setup Global Webhook
                    </button>
                  )}
                </div>
              ) : (
                <span>
                  ⚠️ GitHub Not Connected
                  <button className='btn-connect' onClick={connectGithub}>
                    Connect GitHub
                  </button>
                </span>
              )}
            </div>
          </div>

          {/* Webhook Status */}
          {webhookStatus && (
            <div className='webhook-status'>
              <div className='status-info'>
                <strong>Webhook Status:</strong>
                <span
                  className={`status ${
                    webhookStatus.active ? 'active' : 'inactive'
                  }`}
                >
                  {webhookStatus.active ? 'Active' : 'Inactive'}
                </span>
                {webhookStatus.lastReceived && (
                  <span className='last-received'>
                    Last event:{' '}
                    {new Date(webhookStatus.lastReceived).toLocaleString()}
                  </span>
                )}
                {webhookStatus.totalEvents > 0 && (
                  <span className='total-events'>
                    Total events: {webhookStatus.totalEvents}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        <div className='header-actions'>
          <button
            className='btn-primary'
            onClick={refreshData}
            disabled={loading}
          >
            <i className='fas fa-sync-alt'></i>
            Refresh Data
          </button>

          {githubConnected && (
            <button className='btn-secondary' onClick={() => fetchAllData()}>
              <i className='fas fa-redo'></i>
              Sync All
            </button>
          )}
        </div>
      </div>

      <StatisticsPanel stats={stats} />

      <div className='monitoring-content'>
        <div className='sidebar'>
          <div className='repositories-list'>
            <div className='section-header'>
              <h3>Repositories ({repositories.length})</h3>
              {githubConnected && (
                <button className='btn-small' onClick={fetchRepositories}>
                  <i className='fas fa-sync'></i>
                </button>
              )}
            </div>

            {!githubConnected ? (
              <div className='connect-prompt'>
                <p>Connect GitHub to monitor your repositories</p>
                <button className='btn-connect' onClick={connectGithub}>
                  Connect GitHub
                </button>
              </div>
            ) : repositories.length === 0 ? (
              <div className='empty-state'>
                <p>No repositories found</p>
                <button className='btn-refresh' onClick={fetchRepositories}>
                  Refresh Repositories
                </button>
              </div>
            ) : (
              repositories.map(repo => (
                <RepositoryCard
                  key={repo.id}
                  repository={repo}
                  webhookStatus={webhookStatus}
                  hasWebhook={webhookStatus?.active}
                />
              ))
            )}
          </div>
        </div>

        <div className='main-content'>
          <FilterBar
            filters={filters}
            onFilterChange={handleFilterChange}
            repositories={repositories}
          />

          {!githubConnected ? (
            <div className='connect-prompt-large'>
              <div className='prompt-content'>
                <i className='fab fa-github'></i>
                <h3>Connect Your GitHub Account</h3>
                <p>
                  Connect GitHub to start monitoring your repositories and
                  receive webhook events
                </p>
                <button className='btn-connect-large' onClick={connectGithub}>
                  Connect GitHub Account
                </button>
              </div>
            </div>
          ) : (
            <ActivityFeed activities={activities} onRefresh={handleNewEvent} />
          )}
        </div>
      </div>
    </div>
  )
}

export default RepositoryMonitoring
