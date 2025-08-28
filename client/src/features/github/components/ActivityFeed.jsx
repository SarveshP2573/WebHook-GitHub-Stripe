// src/components/RepositoryMonitoring/ActivityFeed.js
import '../../../styles/activityfeed.css'
import ActivityItem from './ActivityItem'


const ActivityFeed = ({ activities }) => {
  const getActivityIcon = type => {
    switch (type) {
      case 'push':
        return 'fa-code-commit'
      case 'pull_request':
        return 'fa-pull-request'
      case 'issue':
        return 'fa-exclamation-circle'
      case 'release':
        return 'fa-tag'
      default:
        return 'fa-circle'
    }
  }

  const getActivityColor = (type, status) => {
    if (type === 'pull_request') {
      return status === 'merged' ? 'merged' : status
    }
    if (type === 'issue') {
      return status
    }
    return type
  }

  return (
    <div className='activity-feed'>
      <div className='feed-header'>
        <h3>Recent Activity</h3>
        <span className='activity-count'>{activities.length} activities</span>
      </div>

      <div className='activities-list'>
        {activities.map(activity => (
          <ActivityItem
            key={activity.id}
            activity={activity}
            icon={getActivityIcon(activity.type)}
            colorClass={getActivityColor(activity.type, activity.status)}
          />
        ))}
      </div>

      {activities.length === 0 && (
        <div className='empty-state'>
          <i className='fas fa-inbox'></i>
          <p>No activities found</p>
          <span>Try adjusting your filters or sync your repositories</span>
        </div>
      )}

      {activities.length > 0 && (
        <div className='load-more'>
          <button className='btn-secondary'>
            <i className='fas fa-chevron-down'></i>
            Load More Activities
          </button>
        </div>
      )}
    </div>
  )
}

export default ActivityFeed
