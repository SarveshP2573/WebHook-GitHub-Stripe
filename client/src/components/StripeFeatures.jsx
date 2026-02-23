import { useState } from 'react'
import PaymentTracking from '../pages/PaymentTracking'
import Notifications from '../pages/Notifications'
import InvoiceGenerator from '../pages/InvoiceGenerator'
import StripeLogs from '../pages/StripeLogs'

const StripeServices = ({ onBack }) => {
  const [activeFeature, setActiveFeature] = useState(null)

  const features = [
    {
      id: 'payments',
      title: 'Payment Success Tracking',
      icon: 'fas fa-credit-card',
      description: 'Monitor successful and failed payments'
    },
    {
      id: 'notifications',
      title: 'Custom Notifications',
      icon: 'fas fa-bell',
      description: 'Create alerts for payment events'
    },
    {
      id: 'invoice',
      title: 'Invoice Generator',
      icon: 'fas fa-file-invoice',
      description: 'Generate invoices automatically'
    },
    {
      id: 'logs',
      title: 'Comprehensive Logging',
      icon: 'fas fa-clipboard-list',
      description: 'Search and filter transaction logs'
    }
  ]

  if (activeFeature !== null) {
    switch (activeFeature) {
      case 'payments':
        return <PaymentTracking onBack={() => setActiveFeature(null)} />
      case 'notifications':
        return <Notifications onBack={() => setActiveFeature(null)} />
      case 'invoice':
        return <InvoiceGenerator onBack={() => setActiveFeature(null)} />
      case 'logs':
        return <StripeLogs onBack={() => setActiveFeature(null)} />
      default:
        return null
    }
  }

  return (
    <div className='stripe-services'>
      <button onClick={onBack}>⬅ Back to Dashboard</button>

      <h2>Stripe Services</h2>

      <div className='feature-cards'>
        {features.map(feature => (
          <div
            key={feature.id}
            className='feature-card'
            onClick={() => setActiveFeature(feature.id)}
          >
            <div className='card-icon'>
              <i className={feature.icon}></i>
            </div>
            <h3>{feature.title}</h3>
            <p>{feature.description}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default StripeServices
