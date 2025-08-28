// src/components/RepositoryMonitoring/ActivityItem.js
import '../../../styles/activityitem.css'

const ActivityItem = ({ activity, icon, colorClass }) => {
  const formatTime = timestamp => {
    return new Date(timestamp).toLocaleTimeString()
  }

  const formatDate = timestamp => {
    return new Date(timestamp).toLocaleDateString()
  }

  return (
    <div className={`activity-item ${colorClass}`}>
      <div className='activity-icon'>
        <i className={`fas ${icon}`}></i>
      </div>

      <div className='activity-content'>
        <div className='activity-header'>
          <img src={activity.avatar} alt={activity.author} className='avatar' />
          <span className='author'>{activity.author}</span>
          <span className='action'>{getActionText(activity.type)}</span>
          <span className='repository'>{activity.repository}</span>
        </div>

        <div className='activity-message'>{activity.message}</div>

        <div className='activity-meta'>
          {activity.commitId && (
            <span className='commit-id'>
              <i className='fas fa-code-commit'></i>
              {activity.commitId.substring(0, 7)}
            </span>
          )}
          {activity.pullNumber && (
            <span className='pull-number'>
              <i className='fas fa-pull-request'></i>#{activity.pullNumber}
            </span>
          )}
          {activity.issueNumber && (
            <span className='issue-number'>
              <i className='fas fa-exclamation-circle'></i>#
              {activity.issueNumber}
            </span>
          )}
          {activity.branch && (
            <span className='branch'>
              <i className='fas fa-code-branch'></i>
              {activity.branch}
            </span>
          )}
          {activity.priority && (
            <span className={`priority ${activity.priority}`}>
              <i className='fas fa-flag'></i>
              {activity.priority}
            </span>
          )}
        </div>
      </div>

      <div className='activity-time'>
        <span className='time'>{formatTime(activity.timestamp)}</span>
        <span className='date'>{formatDate(activity.timestamp)}</span>
      </div>

      <div className='activity-actions'>
        <button className='btn-icon'>
          <i className='fas fa-external-link-alt'></i>
        </button>
      </div>
    </div>
  )
}

const getActionText = type => {
  switch (type) {
    case 'push':
      return 'pushed to'
    case 'pull_request':
      return 'opened pull request in'
    case 'issue':
      return 'opened issue in'
    case 'release':
      return 'released'
    default:
      return 'updated'
  }
}

export default ActivityItem
