import React from 'react';
import '../styles/herosection.css';

const HeroSection = () => {
  return (
    <section className="hero">
      <div className="hero-content">
        <h1>Advanced Webhook Management for Modern Teams</h1>
        <p>Monitor, manage, and automate your webhooks with powerful integrations for Slack, Stripe, GitHub, and Blockchain</p>
        <div className="hero-buttons">
          <button className="btn-primary">Start Free Trial</button>
          <button className="btn-secondary">View Demo</button>
        </div>
      </div>
      <div className="hero-visual">
        <div className="floating-card">
          <i className="fab fa-slack"></i>
          <p>New message from Slack</p>
        </div>
        <div className="floating-card">
          <i className="fab fa-stripe"></i>
          <p>Payment processed</p>
        </div>
        <div className="floating-card">
          <i className="fab fa-github"></i>
          <p>Push to main branch</p>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;