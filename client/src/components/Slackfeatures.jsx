const SlackFeatures = () => {
  return (
    <div className='feature-cards'>
      <div className='feature-card'>
        <div className='card-icon'>
          <i className='fas fa-terminal'></i>
        </div>
        <h3>Slack Command to View Webhook Logs</h3>
        <p>
          Create a Slack slash command (e.g., /webhooklogs) to view latest
          webhook events and statuses.
        </p>
      </div>
      <div className='feature-card'>
        <div className='card-icon'>
          <i className='fas fa-bell'></i>
        </div>
        <h3>Alert on Failure</h3>
        <p>
          If any webhook delivery fails, send a notification to Slack with
          details (URL, error, time).
        </p>
      </div>
      <div className='feature-card'>
        <div className='card-icon'>
          <i className='fas fa-comments'></i>
        </div>
        <h3>Slack Threading for Event Grouping</h3>
        <p>
          Group related webhook messages under a Slack thread to keep channels
          clean and structured.
        </p>
      </div>
      <div className='feature-card'>
        <div className='card-icon'>
          <i className='fas fa-bolt'></i>
        </div>
        <h3>Real-Time Alerting System in Slack</h3>
        <p>
          Get notified on key business events with channel-wise rules for
          different types of alerts.
        </p>
      </div>
    </div>
  )
}

export default SlackFeatures
