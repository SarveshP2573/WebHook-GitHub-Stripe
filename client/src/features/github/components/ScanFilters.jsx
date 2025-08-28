// src/components/SecurityScanning/ScanFilters.js
import './ScanFilters.css'

const ScanFilters = ({ filters, onFilterChange }) => {
  const handleFilterChange = (filterType, value) => {
    onFilterChange({
      ...filters,
      [filterType]: value
    })
  }

  return (
    <div className='scan-filters'>
      <div className='filter-group'>
        <label>Severity</label>
        <select
          value={filters.severity}
          onChange={e => handleFilterChange('severity', e.target.value)}
        >
          <option value='all'>All Severities</option>
          <option value='critical'>Critical</option>
          <option value='high'>High</option>
          <option value='medium'>Medium</option>
          <option value='low'>Low</option>
        </select>
      </div>

      <div className='filter-group'>
        <label>Type</label>
        <select
          value={filters.type}
          onChange={e => handleFilterChange('type', e.target.value)}
        >
          <option value='all'>All Types</option>
          <option value='security'>Security</option>
          <option value='performance'>Performance</option>
          <option value='code-quality'>Code Quality</option>
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

export default ScanFilters
