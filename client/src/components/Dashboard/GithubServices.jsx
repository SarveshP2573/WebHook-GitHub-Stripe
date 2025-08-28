// src/components/Dashboard/GithubServices.js
import { useNavigate } from 'react-router-dom'
import '../../styles/servicedetail.css'

const GithubServices = ({ onBack }) => {
  const navigate = useNavigate()

  const githubServices = [
    {
      name: 'Repository Monitoring',
      icon: 'fas fa-code-branch',
      description: 'Track pushes, pulls, and issues across repositories',
      status: 'active',
      stats: { repos: 8, pushes: 42, pulls: 12 },
      link: '/github/repository'
    },
    {
      name: 'CI/CD Automation',
      icon: 'fas fa-cogs',
      description: 'Automate builds and deployments',
      status: 'active',
      stats: { pipelines: 6, success: 38, failed: 4 },
      link: '/github/cicd'
    },
    {
      name: 'Security Scanning',
      icon: 'fas fa-shield-alt',
      description: 'Detect vulnerabilities and security issues',
      status: 'active',
      stats: { scans: 24, issues: 8, critical: 2 },
      link: '/github/security'
    },
   
  ]

  return (
    <div className='service-detail-page'>
      <div className='detail-header'>
        <button className='back-button' onClick={onBack}>
          <i className='fas fa-arrow-left'></i> Back to Dashboard
        </button>
        <div className='service-title'>
          <div className='title-icon' style={{ backgroundColor: '#000000' }}>
            <i className='fab fa-github'></i>
          </div>
          <h1>GitHub Services</h1>
        </div>
        <p>Manage your repository monitoring and automation</p>
      </div>

      <div className='services-list'>
        {githubServices.map((service, index) => (
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
              <button
                className='configure-btn'
                onClick={() => navigate(service.link)}
              >
                View <i className='fas fa-cog'></i>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default GithubServices
