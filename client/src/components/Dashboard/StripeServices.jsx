// src/components/Dashboard/StripeServices.js
import React from 'react';
import '../../styles/servicedetail.css';

const StripeServices = ({ onBack }) => {
  const stripeServices = [
    {
      name: 'Payment Processing',
      icon: 'fas fa-credit-card',
      description: 'Monitor payment success and failure events',
      status: 'active',
      stats: { processed: '$12,482', success: '98%', refunds: 4 }
    },
    {
      name: 'Invoice Generation',
      icon: 'fas fa-file-invoice',
      description: 'Create and manage customer invoices',
      status: 'active',
      stats: { generated: 42, paid: 38, overdue: 4 }
    },
    {
      name: 'Subscription Management',
      icon: 'fas fa-sync-alt',
      description: 'Handle recurring billing and subscriptions',
      status: 'active',
      stats: { active: 24, canceled: 3, trials: 5 }
    },
    {
      name: 'Revenue Reporting',
      icon: 'fas fa-chart-line',
      description: 'Generate financial reports and analytics',
      status: 'configuring',
      stats: { reports: 8, exported: 5, scheduled: 3 }
    }
  ];

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
        {stripeServices.map((service, index) => (
          <div key={index} className="service-item">
            <div className="service-item-icon">
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
              <button className="configure-btn">
                Configure <i className="fas fa-cog"></i>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StripeServices;