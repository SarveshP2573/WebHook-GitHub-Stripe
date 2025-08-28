// src/components/RepositoryMonitoring/FilterBar.js
import '../../../styles/filterbar.css'

const FilterBar = ({ filters, onFilterChange }) => {
  const handleFilterChange = (filterType, value) => {
    onFilterChange({
      ...filters,
      [filterType]: value
    })
  }

  return (
    <div className='filter-bar'>
      <div className='filter-group'>
        <label>Event Type</label>
        <select
          value={filters.eventType}
          onChange={e => handleFilterChange('eventType', e.target.value)}
        >
          <option value='all'>All Events</option>
          <option value='push'>Pushes</option>
          <option value='pull_request'>Pull Requests</option>
          <option value='issue'>Issues</option>
          <option value='release'>Releases</option>
        </select>
      </div>

      <div className='filter-group'>
        <label>Repository</label>
        <select
          value={filters.repository}
          onChange={e => handleFilterChange('repository', e.target.value)}
        >
          <option value='all'>All Repositories</option>
          <option value='webhook-manager'>webhook-manager</option>
          <option value='api-gateway'>api-gateway</option>
          <option value='mobile-app'>mobile-app</option>
        </select>
      </div>

      <div className='filter-group'>
        <label>Date Range</label>
        <select
          value={filters.dateRange}
          onChange={e => handleFilterChange('dateRange', e.target.value)}
        >
          <option value='1d'>Last 24 hours</option>
          <option value='7d'>Last 7 days</option>
          <option value='30d'>Last 30 days</option>
          <option value='90d'>Last 90 days</option>
        </select>
      </div>

      <div className='filter-group'>
        <label>Status</label>
        <select
          value={filters.status}
          onChange={e => handleFilterChange('status', e.target.value)}
        >
          <option value='all'>All Status</option>
          <option value='open'>Open</option>
          <option value='closed'>Closed</option>
          <option value='merged'>Merged</option>
        </select>
      </div>

      <div className='filter-actions'>
        <button className='btn-secondary'>
          <i className='fas fa-filter'></i>
          Apply Filters
        </button>
        <button className='btn-text'>
          <i className='fas fa-times'></i>
          Clear
        </button>
      </div>
    </div>
  )
}

export default FilterBar
