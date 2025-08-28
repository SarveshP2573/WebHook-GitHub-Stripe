// src/components/Dashboard/BlockchainServices.js
import '../../styles/servicedetail.css'

const BlockchainServices = ({ onBack }) => {
  const blockchainServices = [
    {
      name: 'Transaction Monitoring',
      icon: 'fas fa-search-dollar',
      description: 'Track blockchain transactions in real-time',
      status: 'active',
      stats: { transactions: '1.2K', value: '5.4 ETH', fees: '0.12 ETH' }
    },
    {
      name: 'Smart Contract Watch',
      icon: 'fas fa-file-contract',
      description: 'Monitor smart contract interactions and events',
      status: 'active',
      stats: { contracts: 12, interactions: 84, events: 42 }
    },
    {
      name: 'Gas Price Alerts',
      icon: 'fas fa-gas-pump',
      description: 'Get notified when gas prices meet thresholds',
      status: 'active',
      stats: { alerts: 8, triggered: 3, active: 5 }
    },
    {
      name: 'Wallet Integration',
      icon: 'fas fa-wallet',
      description: 'Connect and manage cryptocurrency wallets',
      status: 'configuring',
      stats: { wallets: 3, connected: 2, balance: '2.4 ETH' }
    }
  ]

  return (
    <div className='service-detail-page'>
      <div className='detail-header'>
        <button className='back-button' onClick={onBack}>
          <i className='fas fa-arrow-left'></i> Back to Dashboard
        </button>
        <div className='service-title'>
          <div className='title-icon' style={{ backgroundColor: '#4C6EF5' }}>
            <i className='fas fa-link'></i>
          </div>
          <h1>Blockchain Services</h1>
        </div>
        <p>Manage your blockchain monitoring and smart contracts</p>
      </div>

      <div className='services-list'>
        {blockchainServices.map((service, index) => (
          <div key={index} className='service-item'>
            <div className='service-item-icon'>
              <i className={service.icon}></i>
            </div>
            <div className='service-item-info'>
              <h3>{service.name}</h3>
              <p>{service.description}</p>
              <div className='service-stats'>
                {Object.entries(service.stats).map(([key, value]) => (
                  <span key={key} className={`stat ${key}`}>
                    {value} {key.charAt(0).toUpperCase() + key.slice(1)}
                  </span>
                ))}
              </div>
            </div>
            <div className='service-item-status'>
              <span className={`status-badge status-${service.status}`}>
                {service.status}
              </span>
              <button className='configure-btn'>
                Configure <i className='fas fa-cog'></i>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default BlockchainServices
