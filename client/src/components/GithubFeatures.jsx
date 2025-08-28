import React from 'react';

const GithubFeatures = () => {
  return (
    <div className="feature-cards">
      <div className="feature-card">
        <div className="card-icon">
          <i className="fas fa-code-branch"></i>
        </div>
        <h3>Repository Monitoring</h3>
        <p>Track pushes, pulls, and issues across your repositories with instant notifications.</p>
      </div>
      <div className="feature-card">
        <div className="card-icon">
          <i className="fas fa-tasks"></i>
        </div>
        <h3>Automated Workflows</h3>
        <p>Trigger CI/CD pipelines and other workflows based on GitHub events via webhooks.</p>
      </div>
      <div className="feature-card">
        <div className="card-icon">
          <i className="fas fa-exclamation-triangle"></i>
        </div>
        <h3>Security Alerts</h3>
        <p>Receive immediate notifications for security vulnerabilities and dependency issues.</p>
      </div>
      <div className="feature-card">
        <div className="card-icon">
          <i className="fas fa-users"></i>
        </div>
        <h3>Team Collaboration</h3>
        <p>Keep your entire team informed about important repository activities and changes.</p>
      </div>
    </div>
  );
};

export default GithubFeatures;