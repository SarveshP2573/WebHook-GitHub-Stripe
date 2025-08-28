// src/components/SecurityScanning/ScanResultCard.js
import React, { useState } from 'react';
import './ScanResultCard.css';

const ScanResultCard = ({ scan, onRunScan, onDismissIssue }) => {
  const [expanded, setExpanded] = useState(false);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString();
  };

  const getStatusIcon = (status) => {
    const icons = {
      completed: 'fa-check-circle',
      failed: 'fa-times-circle',
      running: 'fa-sync-alt',
      pending: 'fa-clock'
    };
    return icons[status] || 'fa-circle';
  };

  const getStatusColor = (status) => {
    const colors = {
      completed: 'success',
      failed: 'error',
      running: 'warning',
      pending: 'info'
    };
    return colors[status] || 'default';
  };

  const getSeverityIcon = (severity) => {
    const icons = {
      critical: 'fa-exclamation-circle',
      high: 'fa-exclamation-triangle',
      medium: 'fa-info-circle',
      low: 'fa-flag'
    };
    return icons[severity] || 'fa-circle';
  };

  const getSeverityColor = (severity) => {
    const colors = {
      critical: 'error',
      high: 'warning',
      medium: 'info',
      low: 'success'
    };
    return colors[severity] || 'default';
  };

  return (
    <div className={`scan-result-card ${scan.status}`}>
      <div className="scan-header" onClick={() => setExpanded(!expanded)}>
        <div className="scan-info">
          <div className="repository-info">
            <h3>{scan.repository}</h3>
            <span className="branch">{scan.branch}</span>
          </div>
          <div className="commit-hash">
            {scan.commitHash?.substring(0, 7)}
          </div>
        </div>
        
        <div className="scan-meta">
          <div className="scan-time">
            <span className="date">{formatDate(scan.timestamp)}</span>
            <span className="time">{formatTime(scan.timestamp)}</span>
          </div>
          <div className={`scan-status status-${getStatusColor(scan.status)}`}>
            <i className={`fas ${getStatusIcon(scan.status)}`}></i>
            {scan.status}
          </div>
        </div>
      </div>

      <div className="scan-summary">
        <div className="summary-item">
          <span className="label">Issues:</span>
          <span className={`value ${scan.issues > 0 ? 'error' : 'success'}`}>
            {scan.issues}
          </span>
        </div>
        <div className="summary-item">
          <span className="label">Warnings:</span>
          <span className={`value ${scan.warnings > 0 ? 'warning' : 'success'}`}>
            {scan.warnings}
          </span>
        </div>
        <div className="summary-item">
          <span className="label">Duration:</span>
          <span className="value">{scan.scanDuration}</span>
        </div>
        {scan.error && (
          <div className="summary-error">
            <i className="fas fa-exclamation-circle"></i>
            {scan.error}
          </div>
        )}
      </div>

      {expanded && scan.vulnerabilities.length > 0 && (
        <div className="vulnerabilities-list">
          <h4>Vulnerabilities & Issues</h4>
          {scan.vulnerabilities.map((vulnerability, index) => (
            <div key={vulnerability.id} className="vulnerability-item">
              <div className="vulnerability-header">
                <div className="vulnerability-severity">
                  <i className={`fas ${getSeverityIcon(vulnerability.severity)} severity-${getSeverityColor(vulnerability.severity)}`}></i>
                  <span className={`severity-text severity-${getSeverityColor(vulnerability.severity)}`}>
                    {vulnerability.severity}
                  </span>
                </div>
                <div className="vulnerability-actions">
                  <button 
                    className="btn-icon"
                    onClick={() => onDismissIssue(scan.id, vulnerability.id)}
                    title="Dismiss issue"
                  >
                    <i className="fas fa-times"></i>
                  </button>
                </div>
              </div>
              
              <div className="vulnerability-content">
                <h5>{vulnerability.title}</h5>
                <p className="vulnerability-description">{vulnerability.description}</p>
                
                <div className="vulnerability-details">
                  <div className="detail-item">
                    <span className="label">File:</span>
                    <span className="value">{vulnerability.file}:{vulnerability.line}</span>
                  </div>
                  {vulnerability.owaspCategory && (
                    <div className="detail-item">
                      <span className="label">OWASP:</span>
                      <span className="value">{vulnerability.owaspCategory}</span>
                    </div>
                  )}
                  {vulnerability.cwe && (
                    <div className="detail-item">
                      <span className="label">CWE:</span>
                      <span className="value">{vulnerability.cwe}</span>
                    </div>
                  )}
                </div>

                {vulnerability.codeSnippet && (
                  <div className="code-snippet">
                    <pre>{vulnerability.codeSnippet}</pre>
                  </div>
                )}

                <div className="vulnerability-recommendation">
                  <strong>Recommendation:</strong> {vulnerability.recommendation}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="scan-actions">
        <button className="btn-secondary" onClick={() => onRunScan(scan.repository, scan.branch)}>
          <i className="fas fa-sync-alt"></i>
          Rescan
        </button>
        <button className="btn-icon" onClick={() => setExpanded(!expanded)}>
          <i className={`fas fa-chevron-${expanded ? 'up' : 'down'}`}></i>
        </button>
      </div>
    </div>
  );
};

export default ScanResultCard;