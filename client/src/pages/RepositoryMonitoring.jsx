// src/pages/RepositoryMonitoring.js
import { useEffect, useState } from 'react'

import '../styles/RepositoryMonitoring.css'
import StatisticsPanel from '../features/github/components/StatisticspANEL.JSX'
import RepositoryCard from '../features/github/components/RepositoryCard'
import FilterBar from '../features/github/components/FilterBar'
import ActivityFeed from '../features/github/components/ActivityFeed'

const RepositoryMonitoring = () => {
  const [repositories, setRepositories] = useState([])
  const [activities, setActivities] = useState([])
  const [stats, setStats] = useState({})
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    eventType: 'all',
    repository: 'all',
    dateRange: '7d',
    status: 'all'
  })

  // Mock data - Replace with actual API calls
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        // TODO: Replace with actual API calls
        // const reposResponse = await repositoriesAPI.getRepositories();
        // const activitiesResponse = await activitiesAPI.getActivities(filters);
        // const statsResponse = await statsAPI.getStatistics();

        // Mock data
        const mockRepositories = [
          {
            id: 1,
            name: 'webhook-manager',
            owner: 'your-org',
            fullName: 'your-org/webhook-manager',
            description: 'Advanced webhook management system',
            private: false,
            fork: false,
            stars: 42,
            forks: 8,
            issues: 12,
            pulls: 5,
            lastUpdated: '2023-10-15T14:30:00Z',
            language: 'JavaScript',
            defaultBranch: 'main'
          },
          {
            id: 2,
            name: 'api-gateway',
            owner: 'your-org',
            fullName: 'your-org/api-gateway',
            description: 'Microservices API gateway',
            private: true,
            fork: false,
            stars: 28,
            forks: 3,
            issues: 8,
            pulls: 2,
            lastUpdated: '2023-10-14T09:15:00Z',
            language: 'Go',
            defaultBranch: 'main'
          },
          {
            id: 3,
            name: 'mobile-app',
            owner: 'your-org',
            fullName: 'your-org/mobile-app',
            description: 'React Native mobile application',
            private: false,
            fork: false,
            stars: 15,
            forks: 2,
            issues: 5,
            pulls: 3,
            lastUpdated: '2023-10-13T16:45:00Z',
            language: 'TypeScript',
            defaultBranch: 'develop'
          }
        ]

        const mockActivities = [
          {
            id: 1,
            type: 'push',
            repository: 'your-org/webhook-manager',
            branch: 'main',
            author: 'developer1',
            avatar: 'https://via.placeholder.com/40',
            message: 'Fixed security vulnerability in webhook validation',
            timestamp: '2023-10-15T14:30:00Z',
            commitId: 'a1b2c3d4',
            url: '#'
          },
          {
            id: 2,
            type: 'pull_request',
            repository: 'your-org/api-gateway',
            branch: 'feature/auth',
            author: 'developer2',
            avatar: 'https://via.placeholder.com/40',
            message: 'Added OAuth2 authentication support',
            timestamp: '2023-10-15T13:15:00Z',
            pullNumber: 42,
            status: 'open',
            url: '#'
          },
          {
            id: 3,
            type: 'issue',
            repository: 'your-org/mobile-app',
            author: 'user123',
            avatar: 'https://via.placeholder.com/40',
            message: 'App crashes on iOS when switching tabs',
            timestamp: '2023-10-15T11:20:00Z',
            issueNumber: 123,
            status: 'open',
            priority: 'high',
            url: '#'
          },
          {
            id: 4,
            type: 'pull_request',
            repository: 'your-org/webhook-manager',
            branch: 'fix/performance',
            author: 'developer3',
            avatar: 'https://via.placeholder.com/40',
            message: 'Optimized database queries for webhook logging',
            timestamp: '2023-10-15T10:05:00Z',
            pullNumber: 43,
            status: 'merged',
            url: '#'
          },
          {
            id: 5,
            type: 'issue',
            repository: 'your-org/api-gateway',
            author: 'developer1',
            avatar: 'https://via.placeholder.com/40',
            message: 'Document rate limiting configuration',
            timestamp: '2023-10-15T09:30:00Z',
            issueNumber: 124,
            status: 'closed',
            priority: 'medium',
            url: '#'
          }
        ]

        const mockStats = {
          totalRepositories: 3,
          totalActivities: 128,
          pushes: 42,
          pullRequests: 28,
          issues: 15,
          activeContributors: 8,
          successRate: 98.5
        }

        setRepositories(mockRepositories)
        setActivities(mockActivities)
        setStats(mockStats)
      } catch (error) {
        console.error('Error fetching data:', error)
        // TODO: Handle error state
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [filters])

  const handleFilterChange = newFilters => {
    setFilters(newFilters)
  }

  const refreshData = async () => {
    setLoading(true)
    // TODO: Implement actual refresh logic
    setTimeout(() => setLoading(false), 1000)
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
        </div>
        <button
          className='btn-primary'
          onClick={refreshData}
          disabled={loading}
        >
          <i className='fas fa-sync-alt'></i>
          Refresh Data
        </button>
      </div>

      <StatisticsPanel stats={stats} />

      <div className='monitoring-content'>
        <div className='sidebar'>
          <div className='repositories-list'>
            <h3>Repositories</h3>
            {repositories.map(repo => (
              <RepositoryCard key={repo.id} repository={repo} />
            ))}
          </div>
        </div>

        <div className='main-content'>
          <FilterBar filters={filters} onFilterChange={handleFilterChange} />
          <ActivityFeed activities={activities} />
        </div>
      </div>
    </div>
  )
}

export default RepositoryMonitoring
