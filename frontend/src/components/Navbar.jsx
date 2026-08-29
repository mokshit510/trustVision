import React from 'react';
import { ShieldCheck } from 'lucide-react';

export const Navbar = ({ activeNav = 'home', onNavSelect, onLogoClick }) => {
  return (
    <header className="app-header">
      <div
        className="brand-container"
        onClick={onLogoClick || (() => onNavSelect && onNavSelect('home'))}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            if (onLogoClick) onLogoClick();
            else if (onNavSelect) onNavSelect('home');
          }
        }}
      >
        <div className="brand-icon-wrapper">
          <ShieldCheck size={20} strokeWidth={2.2} />
        </div>
        <div className="brand-text-group">
          <span className="brand-title">Trust Vision</span>
          <span className="brand-subtitle">Analyze before you trust</span>
        </div>
      </div>

      <div className="header-right-nav">
        {onNavSelect && (
          <nav className="desktop-nav-links" aria-label="Desktop Header Navigation">
            <button
              className={`nav-link-btn ${activeNav === 'home' ? 'active' : ''}`}
              onClick={() => onNavSelect('home')}
            >
              Dashboard
            </button>
            <button
              className={`nav-link-btn ${activeNav === 'history' ? 'active' : ''}`}
              onClick={() => onNavSelect('history')}
            >
              Activity Log
            </button>
            <button
              className={`nav-link-btn ${activeNav === 'about' ? 'active' : ''}`}
              onClick={() => onNavSelect('about')}
            >
              Security Guide
            </button>
          </nav>
        )}

        <div className="status-badge" title="Trust Vision threat detection is active">
          <span className="status-dot" />
          <span>Active</span>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
