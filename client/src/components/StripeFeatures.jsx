import React from 'react';

const StripeFeatures = () => {
  return (
    <div className="feature-cards">
      <div className="feature-card">
        <div className="card-icon">
          <i className="fas fa-credit-card"></i>
        </div>
        <h3>Payment Success Tracking</h3>
        <p>Monitor successful payments and failed transactions in real-time with detailed webhook logs.</p>
      </div>
      <div className="feature-card">
        <div className="card-icon">
          <i className="fas fa-bell"></i>
        </div>
        <h3>Custom Notifications</h3>
        <p>Create tailored alerts for different payment events based on your business needs.</p>
      </div>
      <div className="feature-card">
        <div className="card-icon">
          <i className="fas fa-file-invoice"></i>
        </div>
        <h3>Invoice Generator</h3>
        <p>Automatically generate and send invoices when payments are processed successfully.</p>
      </div>
      <div className="feature-card">
        <div className="card-icon">
          <i className="fas fa-clipboard-list"></i>
        </div>
        <h3>Comprehensive Logging</h3>
        <p>Maintain complete records of all transactions with searchable, filterable logs.</p>
      </div>
    </div>
  );
};

export default StripeFeatures;