// src/pages/Webhooks.js
import React, { useState } from 'react';
import '../styles/webhooks.css';

const Webhooks = () => {
  const [services, setServices] = useState({
    slack: {
      enabled: false,
      token: '',
      webhookUrl: '',
      loading: false
    },
    stripe: {
      enabled: false,
      token: '',
      webhookUrl: '',
      loading: false
    },
    github: {
      enabled: false,
      token: '',
      webhookUrl: '',
      loading: false
    },
    blockchain: {
      enabled: false,
      token: '',
      webhookUrl: '',
      loading: false
    }
  });

  const handleEnableService = async (serviceName) => {
    setServices(prev => ({
      ...prev,
      [serviceName]: {
        ...prev[serviceName],
        loading: true
      }
    }));

    // Simulate API call
    setTimeout(() => {
      setServices(prev => ({
        ...prev,
        [serviceName]: {
          ...prev[serviceName],
          enabled: true,
          loading: false,
          webhookUrl: `https://api.webhookhub.com/webhooks/${serviceName}/${Math.random().toString(36).substring(7)}`
        }
      }));
    }, 1500);
  };

  const handleDisableService = (serviceName) => {
    setServices(prev => ({
      ...prev,
      [serviceName]: {
        ...prev[serviceName],
        enabled: false,
        token: '',
        webhookUrl: ''
      }
    }));
  };

  const handleTokenChange = (serviceName, value) => {
    setServices(prev => ({
      ...prev,
      [serviceName]: {
        ...prev[serviceName],
        token: value
      }
    }));
  };

  const handleSaveToken = (serviceName) => {
    // In a real app, this would validate and save the token to your backend
    alert(`Token saved for ${serviceName}`);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    // You could add a toast notification here
    alert('Webhook URL copied to clipboard!');
  };

  return (
    <div className="webhooks-page">
      <div className="webhooks-header">
        <h1>Webhook Services</h1>
        <p>Manage your integrated services and webhook endpoints</p>
      </div>

      <div className="services-grid">
        {/* Slack Service Card */}
        <div className="service-card">
          <div className="service-header">
            <div className="service-icon">
              <i className="fab fa-slack"></i>
            </div>
            <div className="service-info">
              <h3>Slack Integration</h3>
              <p>Receive notifications and manage webhooks directly in Slack</p>
            </div>
            <div className="service-toggle">
              {!services.slack.enabled ? (
                <button 
                  className={`btn-enable ${services.slack.loading ? 'loading' : ''}`}
                  onClick={() => handleEnableService('slack')}
                  disabled={services.slack.loading}
                >
                  {services.slack.loading ? 'Enabling...' : 'Enable'}
                </button>
              ) : (
                <button 
                  className="btn-disable"
                  onClick={() => handleDisableService('slack')}
                >
                  Disable
                </button>
              )}
            </div>
          </div>

          {services.slack.enabled && (
            <div className="service-config">
              <div className="config-section">
                <h4>Access Token</h4>
                <div className="token-input">
                  <input
                    type="password"
                    placeholder="Enter your Slack bot token"
                    value={services.slack.token}
                    onChange={(e) => handleTokenChange('slack', e.target.value)}
                  />
                  <button 
                    className="btn-save"
                    onClick={() => handleSaveToken('slack')}
                    disabled={!services.slack.token}
                  >
                    Save Token
                  </button>
                </div>
              </div>

              {services.slack.webhookUrl && (
                <div className="config-section">
                  <h4>Webhook URL</h4>
                  <div className="webhook-url">
                    <input
                      type="text"
                      value={services.slack.webhookUrl}
                      readOnly
                    />
                    <button 
                      className="btn-copy"
                      onClick={() => copyToClipboard(services.slack.webhookUrl)}
                    >
                      <i className="fas fa-copy"></i>
                    </button>
                  </div>
                  <p className="help-text">
                    Use this URL in your Slack app configuration to receive webhooks
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Stripe Service Card */}
        <div className="service-card">
          <div className="service-header">
            <div className="service-icon">
              <i className="fab fa-stripe"></i>
            </div>
            <div className="service-info">
              <h3>Stripe Integration</h3>
              <p>Handle payments, invoices, and subscription events</p>
            </div>
            <div className="service-toggle">
              {!services.stripe.enabled ? (
                <button 
                  className={`btn-enable ${services.stripe.loading ? 'loading' : ''}`}
                  onClick={() => handleEnableService('stripe')}
                  disabled={services.stripe.loading}
                >
                  {services.stripe.loading ? 'Enabling...' : 'Enable'}
                </button>
              ) : (
                <button 
                  className="btn-disable"
                  onClick={() => handleDisableService('stripe')}
                >
                  Disable
                </button>
              )}
            </div>
          </div>

          {services.stripe.enabled && (
            <div className="service-config">
              <div className="config-section">
                <h4>Secret Key</h4>
                <div className="token-input">
                  <input
                    type="password"
                    placeholder="Enter your Stripe secret key"
                    value={services.stripe.token}
                    onChange={(e) => handleTokenChange('stripe', e.target.value)}
                  />
                  <button 
                    className="btn-save"
                    onClick={() => handleSaveToken('stripe')}
                    disabled={!services.stripe.token}
                  >
                    Save Key
                  </button>
                </div>
              </div>

              {services.stripe.webhookUrl && (
                <div className="config-section">
                  <h4>Webhook URL</h4>
                  <div className="webhook-url">
                    <input
                      type="text"
                      value={services.stripe.webhookUrl}
                      readOnly
                    />
                    <button 
                      className="btn-copy"
                      onClick={() => copyToClipboard(services.stripe.webhookUrl)}
                    >
                      <i className="fas fa-copy"></i>
                    </button>
                  </div>
                  <p className="help-text">
                    Add this endpoint in your Stripe dashboard under Developers → Webhooks
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* GitHub Service Card */}
        <div className="service-card">
          <div className="service-header">
            <div className="service-icon">
              <i className="fab fa-github"></i>
            </div>
            <div className="service-info">
              <h3>GitHub Integration</h3>
              <p>Receive repository events and automate workflows</p>
            </div>
            <div className="service-toggle">
              {!services.github.enabled ? (
                <button 
                  className={`btn-enable ${services.github.loading ? 'loading' : ''}`}
                  onClick={() => handleEnableService('github')}
                  disabled={services.github.loading}
                >
                  {services.github.loading ? 'Enabling...' : 'Enable'}
                </button>
              ) : (
                <button 
                  className="btn-disable"
                  onClick={() => handleDisableService('github')}
                >
                  Disable
                </button>
              )}
            </div>
          </div>

          {services.github.enabled && (
            <div className="service-config">
              <div className="config-section">
                <h4>Access Token</h4>
                <div className="token-input">
                  <input
                    type="password"
                    placeholder="Enter your GitHub access token"
                    value={services.github.token}
                    onChange={(e) => handleTokenChange('github', e.target.value)}
                  />
                  <button 
                    className="btn-save"
                    onClick={() => handleSaveToken('github')}
                    disabled={!services.github.token}
                  >
                    Save Token
                  </button>
                </div>
              </div>

              {services.github.webhookUrl && (
                <div className="config-section">
                  <h4>Webhook URL</h4>
                  <div className="webhook-url">
                    <input
                      type="text"
                      value={services.github.webhookUrl}
                      readOnly
                    />
                    <button 
                      className="btn-copy"
                      onClick={() => copyToClipboard(services.github.webhookUrl)}
                    >
                      <i className="fas fa-copy"></i>
                    </button>
                  </div>
                  <p className="help-text">
                    Add this webhook in your repository settings under Webhooks
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Blockchain Service Card */}
        <div className="service-card">
          <div className="service-header">
            <div className="service-icon">
              <i className="fas fa-link"></i>
            </div>
            <div className="service-info">
              <h3>Blockchain Integration</h3>
              <p>Monitor transactions and smart contract events</p>
            </div>
            <div className="service-toggle">
              {!services.blockchain.enabled ? (
                <button 
                  className={`btn-enable ${services.blockchain.loading ? 'loading' : ''}`}
                  onClick={() => handleEnableService('blockchain')}
                  disabled={services.blockchain.loading}
                >
                  {services.blockchain.loading ? 'Enabling...' : 'Enable'}
                </button>
              ) : (
                <button 
                  className="btn-disable"
                  onClick={() => handleDisableService('blockchain')}
                >
                  Disable
                </button>
              )}
            </div>
          </div>

          {services.blockchain.enabled && (
            <div className="service-config">
              <div className="config-section">
                <h4>API Key</h4>
                <div className="token-input">
                  <input
                    type="password"
                    placeholder="Enter your Blockchain API key"
                    value={services.blockchain.token}
                    onChange={(e) => handleTokenChange('blockchain', e.target.value)}
                  />
                  <button 
                    className="btn-save"
                    onClick={() => handleSaveToken('blockchain')}
                    disabled={!services.blockchain.token}
                  >
                    Save Key
                  </button>
                </div>
              </div>

              {services.blockchain.webhookUrl && (
                <div className="config-section">
                  <h4>Webhook URL</h4>
                  <div className="webhook-url">
                    <input
                      type="text"
                      value={services.blockchain.webhookUrl}
                      readOnly
                    />
                    <button 
                      className="btn-copy"
                      onClick={() => copyToClipboard(services.blockchain.webhookUrl)}
                    >
                      <i className="fas fa-copy"></i>
                    </button>
                  </div>
                  <p className="help-text">
                    Use this endpoint to receive blockchain transaction events
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Webhooks;