// src/pages/Webhooks.js
import axios from 'axios'
import { useEffect, useState } from 'react'
import '../styles/webhooks.css'

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  withCredentials: true // needed if you use cookies
})


api.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

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
  })

  const [loading, setLoading] = useState(true)
  const [ngrokStatus, setNgrokStatus] = useState(null)

  // Fetch user services on component mount
  useEffect(() => {
    fetchUserServices()
    fetchNgrokStatus()
  }, [])

  const fetchUserServices = async () => {
    try {
      setLoading(true)
      const response = await api.get('/user-services')
      setServices(response.data)
    } catch (error) {
      console.error('Error fetching services:', error)
      alert('Failed to load services. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const fetchNgrokStatus = async () => {
    try {
      const response = await api.get('/user-services/status/ngrok')
      setNgrokStatus(response.data)
    } catch (error) {
      console.error('Error fetching ngrok status:', error)
    }
  }

  const handleEnableService = async serviceName => {
    setServices(prev => ({
      ...prev,
      [serviceName]: {
        ...prev[serviceName],
        loading: true
      }
    }))

    try {
      const response = await api.post(`/user-services/${serviceName}/enable`)

      setServices(prev => ({
        ...prev,
        [serviceName]: {
          ...prev[serviceName],
          enabled: true,
          loading: false,
          webhookUrl: response.data.webhookUrl
        }
      }))

      // Update ngrok status after enabling service
      fetchNgrokStatus()

      alert(
        `${
          serviceName.charAt(0).toUpperCase() + serviceName.slice(1)
        } service enabled successfully!`
      )
    } catch (error) {
      console.error(`Error enabling ${serviceName}:`, error)

      setServices(prev => ({
        ...prev,
        [serviceName]: {
          ...prev[serviceName],
          loading: false
        }
      }))

      const errorMessage =
        error.response?.data?.error || `Failed to enable ${serviceName}`
      alert(errorMessage)
    }
  }

  const handleDisableService = async serviceName => {
    try {
      await api.post(`/user-services/${serviceName}/disable`)

      setServices(prev => ({
        ...prev,
        [serviceName]: {
          ...prev[serviceName],
          enabled: false,
          token: '',
          webhookUrl: ''
        }
      }))

      alert(
        `${
          serviceName.charAt(0).toUpperCase() + serviceName.slice(1)
        } service disabled successfully!`
      )
    } catch (error) {
      console.error(`Error disabling ${serviceName}:`, error)
      alert(`Failed to disable ${serviceName}`)
    }
  }

  const handleTokenChange = (serviceName, value) => {
    setServices(prev => ({
      ...prev,
      [serviceName]: {
        ...prev[serviceName],
        token: value
      }
    }))
  }

  const handleSaveToken = async serviceName => {
    try {
      await api.post(`/user-services/${serviceName}/token`, {
        token: services[serviceName].token
      })

      alert(`Token saved for ${serviceName} successfully!`)

      // Clear the token input after saving
      setServices(prev => ({
        ...prev,
        [serviceName]: {
          ...prev[serviceName],
          token: ''
        }
      }))
    } catch (error) {
      console.error(`Error saving token for ${serviceName}:`, error)
      const errorMessage =
        error.response?.data?.error || `Failed to save token for ${serviceName}`
      alert(errorMessage)
    }
  }

  const copyToClipboard = text => {
    navigator.clipboard.writeText(text)
    alert('Webhook URL copied to clipboard!')
  }

  const refreshNgrokStatus = () => {
    fetchNgrokStatus()
  }

  if (loading) {
    return (
      <div className='webhooks-page'>
        <div className='loading-container'>
          <div className='loading-spinner'></div>
          <p>Loading services...</p>
        </div>
      </div>
    )
  }

  return (
    <div className='webhooks-page'>
      <div className='webhooks-header'>
        <h1>Webhook Services</h1>
        <p>Manage your integrated services and webhook endpoints</p>

        {/* Ngrok Status Indicator */}
        {ngrokStatus && (
          <div
            className={`ngrok-status ${
              ngrokStatus.isConnected ? 'connected' : 'disconnected'
            }`}
          >
            <div className='status-indicator'>
              <span
                className={`status-dot ${
                  ngrokStatus.isConnected ? 'connected' : 'disconnected'
                }`}
              ></span>
              {ngrokStatus.isConnected ? (
                <span>
                  ✅ Ngrok Connected: <strong>{ngrokStatus.ngrokUrl}</strong>
                  <button className='btn-refresh' onClick={refreshNgrokStatus}>
                    <i className='fas fa-sync-alt'></i>
                  </button>
                </span>
              ) : (
                <span>
                  ⚠️ Ngrok Disconnected - Webhook URLs will not be publicly
                  accessible
                  <button className='btn-refresh' onClick={refreshNgrokStatus}>
                    <i className='fas fa-sync-alt'></i>
                  </button>
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      <div className='services-grid'>
        {/* Slack Service Card */}
        <div className='service-card'>
          <div className='service-header'>
            <div className='service-icon'>
              <i className='fab fa-slack'></i>
            </div>
            <div className='service-info'>
              <h3>Slack Integration</h3>
              <p>Receive notifications and manage webhooks directly in Slack</p>
            </div>
            <div className='service-toggle'>
              {!services.slack.enabled ? (
                <button
                  className={`btn-enable ${
                    services.slack.loading ? 'loading' : ''
                  }`}
                  onClick={() => handleEnableService('slack')}
                  disabled={services.slack.loading}
                >
                  {services.slack.loading ? (
                    <>
                      <div className='spinner'></div>
                      Enabling...
                    </>
                  ) : (
                    'Enable'
                  )}
                </button>
              ) : (
                <button
                  className='btn-disable'
                  onClick={() => handleDisableService('slack')}
                >
                  Disable
                </button>
              )}
            </div>
          </div>

          {services.slack.enabled && (
            <div className='service-config'>
              <div className='config-section'>
                <h4>Access Token</h4>
                <div className='token-input'>
                  <input
                    type='password'
                    placeholder='Enter your Slack bot token'
                    value={services.slack.token}
                    onChange={e => handleTokenChange('slack', e.target.value)}
                  />
                  <button
                    className='btn-save'
                    onClick={() => handleSaveToken('slack')}
                    disabled={!services.slack.token}
                  >
                    Save Token
                  </button>
                </div>
              </div>

              {services.slack.webhookUrl && (
                <div className='config-section'>
                  <h4>Webhook URL</h4>
                  <div className='webhook-url'>
                    <input
                      type='text'
                      value={services.slack.webhookUrl}
                      readOnly
                    />
                    <button
                      className='btn-copy'
                      onClick={() => copyToClipboard(services.slack.webhookUrl)}
                    >
                      <i className='fas fa-copy'></i>
                    </button>
                  </div>
                  <p className='help-text'>
                    Use this URL in your Slack app configuration to receive
                    webhooks
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Stripe Service Card */}
        <div className='service-card'>
          <div className='service-header'>
            <div className='service-icon'>
              <i className='fab fa-stripe'></i>
            </div>
            <div className='service-info'>
              <h3>Stripe Integration</h3>
              <p>Handle payments, invoices, and subscription events</p>
            </div>
            <div className='service-toggle'>
              {!services.stripe.enabled ? (
                <button
                  className={`btn-enable ${
                    services.stripe.loading ? 'loading' : ''
                  }`}
                  onClick={() => handleEnableService('stripe')}
                  disabled={services.stripe.loading}
                >
                  {services.stripe.loading ? (
                    <>
                      <div className='spinner'></div>
                      Enabling...
                    </>
                  ) : (
                    'Enable'
                  )}
                </button>
              ) : (
                <button
                  className='btn-disable'
                  onClick={() => handleDisableService('stripe')}
                >
                  Disable
                </button>
              )}
            </div>
          </div>

          {services.stripe.enabled && (
            <div className='service-config'>
              <div className='config-section'>
                <h4>Secret Key</h4>
                <div className='token-input'>
                  <input
                    type='password'
                    placeholder='Enter your Stripe secret key'
                    value={services.stripe.token}
                    onChange={e => handleTokenChange('stripe', e.target.value)}
                  />
                  <button
                    className='btn-save'
                    onClick={() => handleSaveToken('stripe')}
                    disabled={!services.stripe.token}
                  >
                    Save Key
                  </button>
                </div>
              </div>

              {services.stripe.webhookUrl && (
                <div className='config-section'>
                  <h4>Webhook URL</h4>
                  <div className='webhook-url'>
                    <input
                      type='text'
                      value={services.stripe.webhookUrl}
                      readOnly
                    />
                    <button
                      className='btn-copy'
                      onClick={() =>
                        copyToClipboard(services.stripe.webhookUrl)
                      }
                    >
                      <i className='fas fa-copy'></i>
                    </button>
                  </div>
                  <p className='help-text'>
                    Add this endpoint in your Stripe dashboard under Developers
                    → Webhooks
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* GitHub Service Card */}
        <div className='service-card'>
          <div className='service-header'>
            <div className='service-icon'>
              <i className='fab fa-github'></i>
            </div>
            <div className='service-info'>
              <h3>GitHub Integration</h3>
              <p>Receive repository events and automate workflows</p>
            </div>
            <div className='service-toggle'>
              {!services.github.enabled ? (
                <button
                  className={`btn-enable ${
                    services.github.loading ? 'loading' : ''
                  }`}
                  onClick={() => handleEnableService('github')}
                  disabled={services.github.loading}
                >
                  {services.github.loading ? (
                    <>
                      <div className='spinner'></div>
                      Enabling...
                    </>
                  ) : (
                    'Enable'
                  )}
                </button>
              ) : (
                <button
                  className='btn-disable'
                  onClick={() => handleDisableService('github')}
                >
                  Disable
                </button>
              )}
            </div>
          </div>

          {services.github.enabled && (
            <div className='service-config'>
              <div className='config-section'>
                <h4>Access Token</h4>
                <div className='token-input'>
                  <input
                    type='password'
                    placeholder='Enter your GitHub access token'
                    value={services.github.token}
                    onChange={e => handleTokenChange('github', e.target.value)}
                  />
                  <button
                    className='btn-save'
                    onClick={() => handleSaveToken('github')}
                    disabled={!services.github.token}
                  >
                    Save Token
                  </button>
                </div>
              </div>

              {services.github.webhookUrl && (
                <div className='config-section'>
                  <h4>Webhook URL</h4>
                  <div className='webhook-url'>
                    <input
                      type='text'
                      value={services.github.webhookUrl}
                      readOnly
                    />
                    <button
                      className='btn-copy'
                      onClick={() =>
                        copyToClipboard(services.github.webhookUrl)
                      }
                    >
                      <i className='fas fa-copy'></i>
                    </button>
                  </div>
                  <p className='help-text'>
                    Add this webhook in your repository settings under Webhooks
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Blockchain Service Card */}
        <div className='service-card'>
          <div className='service-header'>
            <div className='service-icon'>
              <i className='fas fa-link'></i>
            </div>
            <div className='service-info'>
              <h3>Blockchain Integration</h3>
              <p>Monitor transactions and smart contract events</p>
            </div>
            <div className='service-toggle'>
              {!services.blockchain.enabled ? (
                <button
                  className={`btn-enable ${
                    services.blockchain.loading ? 'loading' : ''
                  }`}
                  onClick={() => handleEnableService('blockchain')}
                  disabled={services.blockchain.loading}
                >
                  {services.blockchain.loading ? (
                    <>
                      <div className='spinner'></div>
                      Enabling...
                    </>
                  ) : (
                    'Enable'
                  )}
                </button>
              ) : (
                <button
                  className='btn-disable'
                  onClick={() => handleDisableService('blockchain')}
                >
                  Disable
                </button>
              )}
            </div>
          </div>

          {services.blockchain.enabled && (
            <div className='service-config'>
              <div className='config-section'>
                <h4>API Key</h4>
                <div className='token-input'>
                  <input
                    type='password'
                    placeholder='Enter your Blockchain API key'
                    value={services.blockchain.token}
                    onChange={e =>
                      handleTokenChange('blockchain', e.target.value)
                    }
                  />
                  <button
                    className='btn-save'
                    onClick={() => handleSaveToken('blockchain')}
                    disabled={!services.blockchain.token}
                  >
                    Save Key
                  </button>
                </div>
              </div>

              {services.blockchain.webhookUrl && (
                <div className='config-section'>
                  <h4>Webhook URL</h4>
                  <div className='webhook-url'>
                    <input
                      type='text'
                      value={services.blockchain.webhookUrl}
                      readOnly
                    />
                    <button
                      className='btn-copy'
                      onClick={() =>
                        copyToClipboard(services.blockchain.webhookUrl)
                      }
                    >
                      <i className='fas fa-copy'></i>
                    </button>
                  </div>
                  <p className='help-text'>
                    Use this endpoint to receive blockchain transaction events
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Webhooks
