// src/components/Dashboard/SlackServices.js
import React from 'react';
import '../../styles/servicedetail.css';


const SlackServices = ({ onBack }) => {
  const slackServices = [
    {
      name: 'Webhook Logs',
      icon: 'fas fa-terminal',
      description: 'View and manage your Slack webhook logs',
      status: 'active',
      stats: { total: 42, success: 40, failed: 2 }
    },
    {
      name: 'Alert System',
      icon: 'fas fa-bell',
      description: 'Configure failure alerts and notifications',
      status: 'active',
      stats: { total: 18, success: 18, failed: 0 }
    },
    {
      name: 'Message Threading',
      icon: 'fas fa-comments',
      description: 'Manage threaded conversations for events',
      status: 'active',
      stats: { total: 24, success: 24, failed: 0 }
    },
    {
      name: 'Channel Routing',
      icon: 'fas fa-project-diagram',
      description: 'Set up channel-specific webhook rules',
      status: 'configuring',
      stats: { total: 8, success: 6, failed: 2 }
    }
  ];

  return (
    <div className="service-detail-page">
      <div className="detail-header">
        <button className="back-button" onClick={onBack}>
          <i className="fas fa-arrow-left"></i> Back to Dashboard
        </button>
        <div className="service-title">
          <div className="title-icon" style={{ backgroundColor: '#E01E5A' }}>
            <i className="fab fa-slack"></i>
          </div>
          <h1>Slack Services</h1>
        </div>
        <p>Manage your Slack integrations and webhooks</p>
      </div>

      <div className="services-list">
        {slackServices.map((service, index) => (
          <div key={index} className="service-item">
            <div className="service-item-icon">
              <i className={service.icon}></i>
            </div>
            <div className="service-item-info">
              <h3>{service.name}</h3>
              <p>{service.description}</p>
              <div className="service-stats">
                <span className="stat total">{service.stats.total} Total</span>
                <span className="stat success">{service.stats.success} Success</span>
                <span className="stat failed">{service.stats.failed} Failed</span>
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

export default SlackServices;