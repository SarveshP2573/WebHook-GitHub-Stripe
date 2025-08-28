const BlockchainFeatures = () => {
  return (
    <div className='feature-cards'>
      <div className='feature-card'>
        <div className='card-icon'>
          <i className='fas fa-search-dollar'></i>
        </div>
        <h3>Real-Time Transaction Monitoring</h3>
        <p>
          Track blockchain transactions as they happen with instant webhook
          notifications.
        </p>
      </div>
      <div className='feature-card'>
        <div className='card-icon'>
          <i className='fas fa-project-diagram'></i>
        </div>
        <h3>Conditional Triggers</h3>
        <p>
          Execute actions based on specific conditions being met on the
          blockchain.
        </p>
      </div>
      <div className='feature-card'>
        <div className='card-icon'>
          <i className='fas fa-shield-alt'></i>
        </div>
        <h3>Scam Contract Detection</h3>
        <p>Get alerts when interacting with known malicious smart contracts.</p>
      </div>
      <div className='feature-card'>
        <div className='card-icon'>
          <i className='fas fa-gas-pump'></i>
        </div>
        <h3>Gas Price Thresholds</h3>
        <p>
          Receive notifications when gas prices meet your specified conditions
          for optimal trading.
        </p>
      </div>
    </div>
  )
}

export default BlockchainFeatures
