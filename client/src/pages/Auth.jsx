// src/pages/Auth.js
import { useState } from 'react'
import '../styles/auth.css'
import LoginForm from './LoginForm'
import SignupForm from './SignupForm'

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true)

  return (
    <div className='auth-page'>
      <div className='auth-container'>
        <div className='auth-card'>
          <div className='auth-header'>
            <div className='auth-logo'>
              <i className='fas fa-bolt'></i>
              <span>WebhookHub</span>
            </div>
            <h1>{isLogin ? 'Welcome Back' : 'Create Account'}</h1>
            <p>
              {isLogin
                ? 'Sign in to your account'
                : 'Get started with WebhookHub'}
            </p>
          </div>

          <div className='auth-tabs'>
            <button
              className={`auth-tab ${isLogin ? 'active' : ''}`}
              onClick={() => setIsLogin(true)}
            >
              Login
            </button>
            <button
              className={`auth-tab ${!isLogin ? 'active' : ''}`}
              onClick={() => setIsLogin(false)}
            >
              Sign Up
            </button>
          </div>

          {isLogin ? <LoginForm /> : <SignupForm />}

          <div className='auth-footer'>
            <p>
              {isLogin
                ? "Don't have an account? "
                : 'Already have an account? '}
              <button
                className='auth-switch'
                onClick={() => setIsLogin(!isLogin)}
              >
                {isLogin ? 'Sign up' : 'Login'}
              </button>
            </p>
          </div>
        </div>

        <div className='auth-hero'>
          <div className='hero-content'>
            <h2>Advanced Webhook Management</h2>
            <p>
              Connect your tools, automate workflows, and monitor webhooks in
              one place
            </p>
            <div className='hero-features'>
              <div className='hero-feature'>
                <i className='fas fa-slack'></i>
                <span>Slack Integration</span>
              </div>
              <div className='hero-feature'>
                <i className='fas fa-credit-card'></i>
                <span>Stripe Payments</span>
              </div>
              <div className='hero-feature'>
                <i className='fas fa-code-branch'></i>
                <span>GitHub Automation</span>
              </div>
              <div className='hero-feature'>
                <i className='fas fa-link'></i>
                <span>Blockchain Monitoring</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Auth
