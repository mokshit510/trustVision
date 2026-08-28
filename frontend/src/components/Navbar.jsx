import React from 'react';
import { ShieldCheck } from 'lucide-react';

export const Navbar = ({ onLogoClick }) => {
  return (
    <header className="app-header">
      <div className="brand-container" onClick={onLogoClick} role="button" tabIndex={0}>
        <div className="brand-icon-wrapper">
          <ShieldCheck size={22} strokeWidth={2.5} />
        </div>
        <div className="brand-text-group">
          <span className="brand-title">TrustVision</span>
          <span className="brand-subtitle">Digital Safety Assistant</span>
        </div>
      </div>

      <div className="status-badge" title="TrustVision AI safety shield is active">
        <span className="status-dot"></span>
        <span>Safety Active</span>
      </div>
    </header>
  );
};
