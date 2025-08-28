// src/components/RepositoryMonitoring/StatisticsPanel.js
import '../../../styles/statisticspanel.css'

const StatisticsPanel = ({ stats }) => {
  return (
    <div className='statistics-panel'>
      <div className='stat-card'>
        <div className='stat-icon total-repos'>
          <i className='fas fa-book'></i>
        </div>
        <div className='stat-info'>
          <h3>{stats.totalRepositories}</h3>
          <p>Total Repositories</p>
        </div>
      </div>

      <div className='stat-card'>
        <div className='stat-icon total-activities'>
          <i className='fas fa-history'></i>
        </div>
        <div className='stat-info'>
          <h3>{stats.totalActivities}</h3>
          <p>Total Activities</p>
        </div>
      </div>

      <div className='stat-card'>
        <div className='stat-icon pushes'>
          <i className='fas fa-code-commit'></i>
        </div>
        <div className='stat-info'>
          <h3>{stats.pushes}</h3>
          <p>Pushes</p>
        </div>
      </div>

      <div className='stat-card'>
        <div className='stat-icon pull-requests'>
          <i className='fas fa-pull-request'></i>
        </div>
        <div className='stat-info'>
          <h3>{stats.pullRequests}</h3>
          <p>Pull Requests</p>
        </div>
      </div>

      <div className='stat-card'>
        <div className='stat-icon issues'>
          <i className='fas fa-exclamation-circle'></i>
        </div>
        <div className='stat-info'>
          <h3>{stats.issues}</h3>
          <p>Issues</p>
        </div>
      </div>

      <div className='stat-card'>
        <div className='stat-icon success-rate'>
          <i className='fas fa-chart-line'></i>
        </div>
        <div className='stat-info'>
          <h3>{stats.successRate}%</h3>
          <p>Success Rate</p>
        </div>
      </div>
    </div>
  )
}

export default StatisticsPanel
