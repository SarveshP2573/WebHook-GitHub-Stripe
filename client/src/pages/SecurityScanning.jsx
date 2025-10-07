import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/securityscanning.css';

const api = axios.create({
  baseURL: 'http://localhost:3000/api'
});

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const SecurityScanning = () => {
  const [analyses, setAnalyses] = useState([]);
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedAnalysis, setSelectedAnalysis] = useState(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchSecurityData();
  }, []);

  const fetchSecurityData = async () => {
    try {
      setLoading(true);
      const [analysesResponse, overviewResponse] = await Promise.all([
        api.get('/github-security/analyses'),
        api.get('/github-security/overview')
      ]);
      
      setAnalyses(analysesResponse.data.analyses);
      setOverview(overviewResponse.data);
    } catch (error) {
      console.error('Error fetching security data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return '#10B981'; // Green
    if (score >= 60) return '#F59E0B'; // Yellow
    return '#EF4444'; // Red
  };

  const getSeverityColor = (severity) => {
    switch (severity.toLowerCase()) {
      case 'critical': return '#EF4444';
      case 'high': return '#F59E0B';
      case 'medium': return '#3B82F6';
      case 'low': return '#10B981';
      default: return '#6B7280';
    }
  };

  const filteredAnalyses = analyses.filter(analysis => {
    if (filter === 'all') return true;
    const score = analysis.filesAnalyzed[0]?.analysis.overall_score || 0;
    if (filter === 'high' && score >= 80) return true;
    if (filter === 'medium' && score >= 60 && score < 80) return true;
    if (filter === 'low' && score < 60) return true;
    return false;
  });

  if (loading) {
    return (
      <div className="security-scanning-page">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading security analyses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="security-scanning-page">
      {/* Header Section */}
      <div className="security-header">
        <div className="header-content">
          <h1>Security Scanning</h1>
          <p>AI-powered code security analysis powered by Gemini Flash 2.0</p>
        </div>
        <button className="btn-primary" onClick={fetchSecurityData}>
          <i className="fas fa-sync-alt"></i>
          Refresh
        </button>
      </div>

      {/* Overview Cards */}
      {overview && (
        <div className="overview-cards">
          <div className="overview-card">
            <div className="card-icon">
              <i className="fas fa-shield-alt"></i>
            </div>
            <div className="card-content">
              <h3>{overview.totalAnalyses}</h3>
              <p>Total Analyses</p>
            </div>
          </div>
          
          <div className="overview-card">
            <div className="card-icon">
              <i className="fas fa-bug"></i>
            </div>
            <div className="card-content">
              <h3>{overview.totalSecurityIssues}</h3>
              <p>Security Issues Found</p>
            </div>
          </div>
          
          <div className="overview-card">
            <div className="card-icon">
              <i className="fas fa-chart-line"></i>
            </div>
            <div className="card-content">
              <h3 style={{ color: getScoreColor(overview.averageScore) }}>
                {overview.averageScore}
              </h3>
              <p>Average Security Score</p>
            </div>
          </div>
        </div>
      )}

      {/* Filter Section */}
      <div className="filter-section">
        <div className="filter-buttons">
          <button 
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All Analyses
          </button>
          <button 
            className={`filter-btn ${filter === 'high' ? 'active' : ''}`}
            onClick={() => setFilter('high')}
          >
            <i className="fas fa-shield" style={{ color: '#10B981' }}></i>
            High Score (80+)
          </button>
          <button 
            className={`filter-btn ${filter === 'medium' ? 'active' : ''}`}
            onClick={() => setFilter('medium')}
          >
            <i className="fas fa-shield" style={{ color: '#F59E0B' }}></i>
            Medium Score (60-79)
          </button>
          <button 
            className={`filter-btn ${filter === 'low' ? 'active' : ''}`}
            onClick={() => setFilter('low')}
          >
            <i className="fas fa-shield" style={{ color: '#EF4444' }}></i>
            Low Score (60-0)
          </button>
        </div>
      </div>

      {/* Analyses List */}
      <div className="analyses-section">
        <h2>Recent Security Analyses</h2>
        
        {filteredAnalyses.length === 0 ? (
          <div className="empty-state">
            <i className="fas fa-search"></i>
            <h3>No analyses found</h3>
            <p>Push some code to your GitHub repositories to see security analyses here.</p>
          </div>
        ) : (
          <div className="analyses-grid">
            {filteredAnalyses.map((analysis) => (
              <div 
                key={analysis._id} 
                className="analysis-card"
                onClick={() => setSelectedAnalysis(analysis)}
              >
                <div className="analysis-header">
                  <div className="repo-info">
                    <h4>{analysis.repository}</h4>
                    <p>{analysis.commitMessage}</p>
                  </div>
                  <div 
                    className="score-badge"
                    style={{ backgroundColor: getScoreColor(analysis.filesAnalyzed[0]?.analysis.overall_score || 0) }}
                  >
                    {analysis.filesAnalyzed[0]?.analysis.overall_score || 0}
                  </div>
                </div>
                
                <div className="analysis-meta">
                  <span className="meta-item">
                    <i className="fas fa-code-branch"></i>
                    {analysis.branch}
                  </span>
                  <span className="meta-item">
                    <i className="fas fa-user"></i>
                    {analysis.author}
                  </span>
                  <span className="meta-item">
                    <i className="fas fa-clock"></i>
                    {new Date(analysis.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <div className="analysis-preview">
                  <div className="issue-count">
                    <i className="fas fa-exclamation-triangle" style={{ color: '#EF4444' }}></i>
                    {analysis.filesAnalyzed[0]?.analysis.security_issues.length || 0} security issues
                  </div>
                  <div className="summary">
                    {analysis.filesAnalyzed[0]?.analysis.summary || 'No analysis summary available'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Analysis Detail Modal */}
      {selectedAnalysis && (
        <div className="modal-overlay" onClick={() => setSelectedAnalysis(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Security Analysis Details</h2>
              <button 
                className="close-btn"
                onClick={() => setSelectedAnalysis(null)}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            
            <div className="modal-body">
              <div className="analysis-detail-header">
                <div>
                  <h3>{selectedAnalysis.repository}</h3>
                  <p>{selectedAnalysis.commitMessage}</p>
                </div>
                <div 
                  className="detail-score"
                  style={{ color: getScoreColor(selectedAnalysis.filesAnalyzed[0]?.analysis.overall_score || 0) }}
                >
                  {selectedAnalysis.filesAnalyzed[0]?.analysis.overall_score || 0}
                </div>
              </div>

              {selectedAnalysis.filesAnalyzed.map((file, index) => (
                <div key={index} className="file-analysis">
                  <h4>
                    <i className="fas fa-file-code"></i>
                    {file.filename} ({file.language})
                  </h4>
                  
                  {/* Security Issues */}
                  {file.analysis.security_issues.length > 0 && (
                    <div className="issue-section">
                      <h5>
                        <i className="fas fa-shield-alt" style={{ color: '#EF4444' }}></i>
                        Security Issues ({file.analysis.security_issues.length})
                      </h5>
                      <div className="issues-list">
                        {file.analysis.security_issues.map((issue, i) => (
                          <div key={i} className="issue-item security">
                            {issue}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Code Quality Issues */}
                  {file.analysis.code_quality.length > 0 && (
                    <div className="issue-section">
                      <h5>
                        <i className="fas fa-code" style={{ color: '#F59E0B' }}></i>
                        Code Quality ({file.analysis.code_quality.length})
                      </h5>
                      <div className="issues-list">
                        {file.analysis.code_quality.map((issue, i) => (
                          <div key={i} className="issue-item quality">
                            {issue}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Improvements */}
                  {file.analysis.improvements.length > 0 && (
                    <div className="issue-section">
                      <h5>
                        <i className="fas fa-lightbulb" style={{ color: '#10B981' }}></i>
                        Suggested Improvements ({file.analysis.improvements.length})
                      </h5>
                      <div className="issues-list">
                        {file.analysis.improvements.map((improvement, i) => (
                          <div key={i} className="issue-item improvement">
                            {improvement}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Summary */}
                  <div className="analysis-summary">
                    <h5>Summary</h5>
                    <p>{file.analysis.summary}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SecurityScanning;