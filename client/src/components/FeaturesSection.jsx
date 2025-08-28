import React from 'react';
import SlackFeatures from './SlackFeatures';
import StripeFeatures from './StripeFeatures';
import GithubFeatures from './GithubFeatures';
import BlockchainFeatures from './BlockchainFeatures';
import '../styles/featuressection.css';

const FeaturesSection = ({ activeFeature, setActiveFeature }) => {
  return (
    <section id="features" className="features">
      <div className="section-header">
        <h2>Powerful Integrations</h2>
        <p>Connect your tools and automate workflows with advanced webhook management</p>
      </div>
      
      <div className="features-tabs">
        <button 
          className={`tab ${activeFeature === 'slack' ? 'active' : ''}`}
          onClick={() => setActiveFeature('slack')}
        >
          <i className="fab fa-slack"></i> Slack
        </button>
        <button 
          className={`tab ${activeFeature === 'stripe' ? 'active' : ''}`}
          onClick={() => setActiveFeature('stripe')}
        >
          <i className="fab fa-stripe"></i> Stripe
        </button>
        <button 
          className={`tab ${activeFeature === 'github' ? 'active' : ''}`}
          onClick={() => setActiveFeature('github')}
        >
          <i className="fab fa-github"></i> GitHub
        </button>
        <button 
          className={`tab ${activeFeature === 'blockchain' ? 'active' : ''}`}
          onClick={() => setActiveFeature('blockchain')}
        >
          <i className="fas fa-link"></i> Blockchain
        </button>
      </div>
      
      <div className="features-content">
        {activeFeature === 'slack' && <SlackFeatures />}
        {activeFeature === 'stripe' && <StripeFeatures />}
        {activeFeature === 'github' && <GithubFeatures />}
        {activeFeature === 'blockchain' && <BlockchainFeatures />}
      </div>
    </section>
  );
};

export default FeaturesSection;