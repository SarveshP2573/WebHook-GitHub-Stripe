// src/pages/Dashboard.js
import { useState } from 'react'
import BlockchainServices from '../components/Dashboard/BlockchainServices'
import GithubServices from '../components/Dashboard/GithubServices'
import SlackServices from '../components/Dashboard/SlackServices'
import StripeServices from '../components/Dashboard/StripeServices'
import '../styles/dashboard.css'

const Dashboard = () => {
  const [activeService, setActiveService] = useState(null)

  const services = [
    {
      id: 'slack',
      name: 'Slack',
      icon: 'fab fa-slack',
      color: '#E01E5A',
      description: 'Manage your Slack integrations and webhooks'
    },
    {
      id: 'stripe',
      name: 'Stripe',
      icon: 'fab fa-stripe',
      color: '#635BFF',
      description: 'View payment processing and financial data'
    },
    {
      id: 'github',
      name: 'GitHub',
      icon: 'fab fa-github',
      color: '#000000',
      description: 'Monitor repository activities and workflows'
    },
    {
      id: 'blockchain',
      name: 'Blockchain',
      icon: 'fas fa-link',
      color: '#4C6EF5',
      description: 'Track transactions and smart contracts'
    }
  ]

  const handleServiceClick = serviceId => {
    setActiveService(serviceId)
  }

  const handleBackToDashboard = () => {
    setActiveService(null)
  }

  if (activeService != null) {
    switch (activeService) {
      case 'slack':
        return <SlackServices onBack={handleBackToDashboard} />
      case 'stripe':
        return <StripeServices onBack={handleBackToDashboard} />
      case 'github':
        return <GithubServices onBack={handleBackToDashboard} />
      case 'blockchain':
        return <BlockchainServices onBack={handleBackToDashboard} />
      default:
        return null
    }
  }

  return (
    <div className='dashboard-page'>
      <div className='dashboard-header'>
        <h1>Services Dashboard</h1>
        <p>Manage and monitor all your integrated services</p>
      </div>

      <div className='services-grid'>
        {services.map(service => (
          <div
            key={service.id}
            className='service-card'
            onClick={() => handleServiceClick(service.id)}
          >
            <div
              className='service-icon'
              style={{ backgroundColor: service.color }}
            >
              <i className={service.icon}></i>
            </div>
            <h3>{service.name}</h3>
            <p>{service.description}</p>
            <div className='service-cta'>
              <span>View Services</span>
              <i className='fas fa-arrow-right'></i>
            </div>
          </div>
        ))}
      </div>

      <div className='recent-activity'>
        <h2>Recent Activity</h2>
        <div className='activity-list'>
          <div className='activity-item'>
            <div className='activity-icon'>
              <i className='fab fa-slack' style={{ color: '#E01E5A' }}></i>
            </div>
            <div className='activity-content'>
              <p>New message received in #general channel</p>
              <span>2 minutes ago</span>
            </div>
          </div>
          <div className='activity-item'>
            <div className='activity-icon'>
              <i className='fab fa-stripe' style={{ color: '#635BFF' }}></i>
            </div>
            <div className='activity-content'>
              <p>Payment of $249.99 processed successfully</p>
              <span>5 minutes ago</span>
            </div>
          </div>
          <div className='activity-item'>
            <div className='activity-icon'>
              <i className='fab fa-github'></i>
            </div>
            <div className='activity-content'>
              <p>Code pushed to main branch</p>
              <span>10 minutes ago</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
