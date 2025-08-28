// src/pages/SecurityScanning.js
import React, { useState, useEffect } from 'react';
import ScanResultCard from '../components/SecurityScanning/ScanResultCard';
import VulnerabilityChart from '../components/SecurityScanning/VulnerabilityChart';
import ScanFilters from '../components/SecurityScanning/ScanFilters';
import './SecurityScanning.css';

const SecurityScanning = () => {
  const [scanResults, setScanResults] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    severity: 'all',
    type: 'all',
    repository: 'all',
    dateRange: '7d'
  });

  // Mock data - Replace with actual API calls
  useEffect(() => {
    const fetchScanResults = async () => {
      setLoading(true);
      try {
        // TODO: Replace with actual API call
        // const response = await securityAPI.getScanResults(filters);
        
        // Mock data
        const mockScanResults = [
          {
            id: 1,
            repository: 'webhook-manager',
            branch: 'main',
            commitHash: 'a1b2c3d4e5',
            timestamp: '2023-10-15T14:30:00Z',
            status: 'completed',
            issues: 12,
            warnings: 8,
            critical: 2,
            high: 4,
            medium: 3,
            low: 3,
            scanDuration: '2m 34s',
            vulnerabilities: [
              {
                id: 'CVE-2023-12345',
                type: 'security',
                severity: 'critical',
                title: 'SQL Injection Vulnerability',
                description: 'User input not properly sanitized in database queries',
                file: 'src/api/database.js',
                line: 42,
                codeSnippet: 'const query = `SELECT * FROM users WHERE id = ${userId}`;',
                recommendation: 'Use parameterized queries or prepared statements',
                owaspCategory: 'A1: Injection',
                cwe: 'CWE-89'
              },
              {
                id: 'CVE-2023-12346',
                type: 'security',
                severity: 'high',
                title: 'Cross-Site Scripting (XSS)',
                description: 'User input not properly escaped in HTML output',
                file: 'src/components/UserProfile.js',
                line: 78,
                codeSnippet: 'document.getElementById("profile").innerHTML = userInput;',
                recommendation: 'Use proper escaping or a templating library',
                owaspCategory: 'A7: Cross-Site Scripting',
                cwe: 'CWE-79'
              },
              {
                id: 'WARN-2023-1001',
                type: 'performance',
                severity: 'medium',
                title: 'Inefficient Database Query',
                description: 'Query fetching entire table when only specific columns needed',
                file: 'src/services/userService.js',
                line: 15,
                codeSnippet: 'const users = await User.findAll();',
                recommendation: 'Use selective column fetching with attributes option',
                impact: 'High memory usage on large datasets'
              },
              {
                id: 'WARN-2023-1002',
                type: 'code-quality',
                severity: 'low',
                title: 'Unused Variable',
                description: 'Variable declared but never used',
                file: 'src/utils/helpers.js',
                line: 23,
                codeSnippet: 'const unusedVariable = "this is never used";',
                recommendation: 'Remove unused variables to clean up code',
                impact: 'Minor code clutter'
              }
            ]
          },
          {
            id: 2,
            repository: 'api-gateway',
            branch: 'develop',
            commitHash: 'f6g7h8i9j0',
            timestamp: '2023-10-14T11:20:00Z',
            status: 'completed',
            issues: 8,
            warnings: 5,
            critical: 1,
            high: 2,
            medium: 3,
            low: 2,
            scanDuration: '1m 45s',
            vulnerabilities: [
              {
                id: 'CVE-2023-12347',
                type: 'security',
                severity: 'high',
                title: 'Insecure Randomness',
                description: 'Math.random() used for security-sensitive purpose',
                file: 'src/auth/token.js',
                line: 56,
                codeSnippet: 'const token = Math.random().toString(36).substring(2);',
                recommendation: 'Use crypto.getRandomValues() for cryptographic randomness',
                owaspCategory: 'A2: Broken Authentication',
                cwe: 'CWE-338'
              },
              {
                id: 'WARN-2023-1003',
                type: 'performance',
                severity: 'medium',
                title: 'Memory Leak Potential',
                description: 'Event listeners not properly cleaned up',
                file: 'src/server/socket.js',
                line: 89,
                codeSnippet: 'socket.on("message", handleMessage);',
                recommendation: 'Add removeListener in cleanup phase',
                impact: 'Potential memory leak over time'
              }
            ]
          },
          {
            id: 3,
            repository: 'mobile-app',
            branch: 'feature/auth',
            commitHash: 'k1l2m3n4o5',
            timestamp: '2023-10-13T16:45:00Z',
            status: 'failed',
            issues: 0,
            warnings: 0,
            critical: 0,
            high: 0,
            medium: 0,
            low: 0,
            scanDuration: '0m 23s',
            error: 'Dependency resolution failed: vulnerable package detected',
            vulnerabilities: []
          }
        ];

        const mockStats = {
          totalScans: 42,
          completedScans: 38,
          failedScans: 4,
          totalIssues: 124,
          criticalIssues: 12,
          highIssues: 28,
          mediumIssues: 45,
          lowIssues: 39,
          averageScanTime: '1m 52s',
          repositoriesScanned: 8
        };

        setScanResults(mockScanResults);
        setStats(mockStats);
      } catch (error) {
        console.error('Error fetching scan results:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchScanResults();
  }, [filters]);

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  const runScan = async (repository, branch) => {
    // TODO: Implement actual scan execution
    alert(`Starting security scan for ${repository}/${branch}`);
  };

  const dismissIssue = async (scanId, vulnerabilityId) => {
    // TODO: Implement issue dismissal
    setScanResults(scanResults.map(scan => 
      scan.id === scanId 
        ? {
            ...scan,
            vulnerabilities: scan.vulnerabilities.filter(v => v.id !== vulnerabilityId)
          }
        : scan
    ));
  };

  if (loading) {
    return (
      <div className="security-scanning-page">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading security scan results...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="security-scanning-page">
      <div className="scanning-header">
        <div className="header-content">
          <h1>Security Scanning</h1>
          <p>Identify and fix vulnerabilities, warnings, and code improvements</p>
        </div>
        <button className="btn-primary">
          <i className="fas fa-shield-alt"></i>
          Run Full Scan
        </button>
      </div>

      <div className="scanning-stats">
        <div className="stat-card">
          <div className="stat-icon total-scans">
            <i className="fas fa-search"></i>
          </div>
          <div className="stat-info">
            <h3>{stats.totalScans}</h3>
            <p>Total Scans</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon total-issues">
            <i className="fas fa-bug"></i>
          </div>
          <div className="stat-info">
            <h3>{stats.totalIssues}</h3>
            <p>Total Issues</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon critical-issues">
            <i className="fas fa-exclamation-triangle"></i>
          </div>
          <div className="stat-info">
            <h3>{stats.criticalIssues}</h3>
            <p>Critical Issues</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon repos-scanned">
            <i className="fas fa-book"></i>
          </div>
          <div className="stat-info">
            <h3>{stats.repositoriesScanned}</h3>
            <p>Repositories Scanned</p>
          </div>
        </div>
      </div>

      <div className="vulnerability-overview">
        <div className="overview-chart">
          <h3>Vulnerability Distribution</h3>
          <VulnerabilityChart stats={stats} />
        </div>
        <div className="overview-summary">
          <h3>Scan Summary</h3>
          <div className="summary-stats">
            <div className="summary-item">
              <span className="label">Completed Scans:</span>
              <span className="value">{stats.completedScans}</span>
            </div>
            <div className="summary-item">
              <span className="label">Failed Scans:</span>
              <span className="value error">{stats.failedScans}</span>
            </div>
            <div className="summary-item">
              <span className="label">Average Scan Time:</span>
              <span className="value">{stats.averageScanTime}</span>
            </div>
            <div className="summary-item">
              <span className="label">High Severity:</span>
              <span className="value warning">{stats.highIssues}</span>
            </div>
            <div className="summary-item">
              <span className="label">Medium Severity:</span>
              <span className="value info">{stats.mediumIssues}</span>
            </div>
            <div className="summary-item">
              <span className="label">Low Severity:</span>
              <span className="value success">{stats.lowIssues}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="filters-section">
        <ScanFilters filters={filters} onFilterChange={handleFilterChange} />
      </div>

      <div className="scan-results">
        <h2>Recent Scan Results</h2>
        <div className="results-list">
          {scanResults.map(scan => (
            <ScanResultCard
              key={scan.id}
              scan={scan}
              onRunScan={() => runScan(scan.repository, scan.branch)}
              onDismissIssue={dismissIssue}
            />
          ))}
        </div>
      </div>

      {scanResults.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">
            <i className="fas fa-shield-alt"></i>
          </div>
          <h3>No scan results found</h3>
          <p>Run your first security scan to identify vulnerabilities and improvements</p>
          <button className="btn-primary">
            <i className="fas fa-play"></i>
            Run Initial Scan
          </button>
        </div>
      )}
    </div>
  );
};

export default SecurityScanning;