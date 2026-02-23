// src/components/Dashboard/StripeServices.js
import React, { useState } from 'react'
import '../../styles/servicedetail.css'

import PaymentTracking from "../../pages/PaymentTracking";
import InvoiceGenerator from "../../pages/InvoiceGenerator";
import PaymentAnalytics from "../../pages/PaymentAnalytics";

const StripeServices = ({ onBack }) => {
  const [activePage, setActivePage] = useState(null)

  const stripeServices = [
    {
      id: 'payments',
      name: 'Payment Tracking',
      icon: 'fas fa-credit-card',
      description: 'Monitor payment success and failure events in real time',
      status: 'active',
      accent: '#6366f1',
      stats: { processed: '$12,482', success: '98%', refunds: 4 }
    },
    {
      id: 'invoice',
      name: 'Invoice Generation',
      icon: 'fas fa-file-invoice-dollar',
      description: 'Create and send professional invoices to customers',
      status: 'active',
      accent: '#22c55e',
      stats: { generated: 42, paid: 38, overdue: 4 }
    },
    {
      id: 'analytics',
      name: 'Payment Analytics',
      icon: 'fas fa-chart-bar',
      description: 'Visualise revenue trends, top customers and payment breakdowns',
      status: 'active',
      accent: '#f59e0b',
      stats: { revenue: '$48k', growth: '+12%', customers: 134 }
    },
  ]

  if (activePage !== null) {
    switch (activePage) {
      case 'payments':
        return <PaymentTracking onBack={() => setActivePage(null)} />
      case 'invoice':
        return <InvoiceGenerator onBack={() => setActivePage(null)} />
      case 'analytics':
        return <PaymentAnalytics onBack={() => setActivePage(null)} />
      default:
        return null
    }
  }

  return (
    <div className="service-detail-page">
      <div className="detail-header">
        <button className="back-button" onClick={onBack}>
          <i className="fas fa-arrow-left"></i> Back to Dashboard
        </button>
        <div className="service-title">
          <div className="title-icon" style={{ backgroundColor: '#635BFF' }}>
            <i className="fab fa-stripe"></i>
          </div>
          <h1>Stripe Services</h1>
        </div>
        <p>Manage your payment processing and financial services</p>
      </div>

      <div className="services-list">
        {stripeServices.map((service) => (
          <div key={service.id} className="service-item" style={{
            borderLeft: `3px solid ${service.accent}`,
          }}>
            <div className="service-item-icon" style={{ color: service.accent }}>
              <i className={service.icon}></i>
            </div>

            <div className="service-item-info">
              <h3>{service.name}</h3>
              <p>{service.description}</p>
              <div className="service-stats">
                {Object.entries(service.stats).map(([key, value]) => (
                  <span key={key} className={`stat ${key}`}>
                    {value} {key.charAt(0).toUpperCase() + key.slice(1)}
                  </span>
                ))}
              </div>
            </div>

            <div className="service-item-status">
              <span className={`status-badge status-${service.status}`}>
                {service.status}
              </span>
              <button
                className="configure-btn"
                onClick={() => setActivePage(service.id)}
              >
                Open <i className="fas fa-arrow-right"></i>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default StripeServices