import React from 'react';
import { HelpCircle, ShieldAlert, CheckCircle2, Shield } from 'lucide-react';

export const HowItWorks = () => {
  return (
    <div className="how-it-works-card">
      <div className="section-title-wrap">
        <h3 className="section-title">
          <HelpCircle size={18} style={{ color: 'var(--color-primary-light)' }} />
          <span>How TrustVision Works</span>
        </h3>
        <span className="section-subtitle">Simple 3-step safety check</span>
      </div>

      <div className="steps-list">
        <div className="step-item">
          <div className="step-number">1</div>
          <div className="step-content">
            <h4>Give us the message</h4>
            <p>Paste an SMS or email, upload a screenshot, or record a voice note.</p>
          </div>
        </div>

        <div className="step-item">
          <div className="step-number">2</div>
          <div className="step-content">
            <h4>TrustVision checks for warning signs</h4>
            <p>We spot fake urgency, OTP requests, suspicious links, and imposter tricks.</p>
          </div>
        </div>

        <div className="step-item">
          <div className="step-number">3</div>
          <div className="step-content">
            <h4>Get simple safety advice</h4>
            <p>See if it looks safe, why, and exactly what to do next to stay protected.</p>
          </div>
        </div>
      </div>

      <div className="safety-note-box">
        <Shield size={18} style={{ color: 'var(--color-primary-light)', flexShrink: 0, marginTop: '2px' }} />
        <p>
          <strong>Safety Promise:</strong> TrustVision helps you spot warning signs. Always verify important requests through official apps or phone numbers.
        </p>
      </div>
    </div>
  );
};
