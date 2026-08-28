import React from 'react';
import { Shield } from 'lucide-react';

export const Navbar = () => {
  return (
    <header className="app-header">
      <div className="brand-logo">
        <Shield className="brand-icon" />
        <span>TrustVision</span>
      </div>

      <div className="status-badge">
        <span className="status-dot"></span>
        <span>AI Safety Active</span>
      </div>
    </header>
  );
};
