// src/components/RepositoryMonitoring/RepositoryCard.js
import '../../../styles/repositorycard.css'

const RepositoryCard = ({ repository }) => {
  const formatDate = dateString => {
    return new Date(dateString).toLocaleDateString()
  }

  return (
    <div style={{ background: 'black' }} className='repository-card'>
      <div className='repo-header'>
        <div className='repo-icon'>
          <i className='fas fa-book'></i>
        </div>
        <div className='repo-info'>
          <h4>{repository.name}</h4>
          <p className='repo-description'>{repository.description}</p>
        </div>
        {repository.private && (
          <span className='private-badge'>
            <i className='fas fa-lock'></i> Private
          </span>
        )}
      </div>

      <div className='repo-details'>
        <div className='repo-stats'>
          <span className='stat'>
            <i className='fas fa-star'></i>
            {repository.stars}
          </span>
          <span className='stat'>
            <i className='fas fa-code-branch'></i>
            {repository.forks}
          </span>
          <span className='stat'>
            <i className='fas fa-exclamation-circle'></i>
            {repository.issues}
          </span>
          <span className='stat'>
            <i className='fas fa-pull-request'></i>
            {repository.pulls}
          </span>
        </div>

        <div className='repo-meta'>
          <span className='language'>
            <span
              className='language-dot'
              style={{ backgroundColor: getLanguageColor(repository.language) }}
            ></span>
            {repository.language}
          </span>
          <span className='last-updated'>
            Updated {formatDate(repository.lastUpdated)}
          </span>
        </div>
      </div>

      <div className='repo-actions'>
        <button className='btn-secondary'>
          <i className='fas fa-eye'></i> View Details
        </button>
        <button className='btn-primary'>
          <i className='fas fa-sync'></i> Sync Now
        </button>
      </div>
    </div>
  )
}

// Helper function to get language colors
const getLanguageColor = language => {
  const colors = {
    JavaScript: '#f1e05a',
    TypeScript: '#2b7489',
    Go: '#00ADD8',
    Python: '#3572A5',
    Java: '#b07219',
    PHP: '#4F5D95',
    Ruby: '#701516',
    CSS: '#563d7c',
    HTML: '#e34c26'
  }
  return colors[language] || '#ccc'
}

export default RepositoryCard
