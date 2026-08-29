import React from 'react';
import { ShieldCheck, AlertTriangle, Lock, PhoneCall, HelpCircle, CheckCircle2, Key, Gift } from 'lucide-react';

export const AboutSection = ({ onStartScan }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* ABOUT BANNER */}
      <div className="hero-card">
        <div className="hero-pill">
          <ShieldCheck size={14} />
          <span>About TrustVision</span>
        </div>
        <h2 className="hero-headline">Your Friendly Digital Safety Assistant</h2>
        <p className="hero-subtext">
          TrustVision was built for everyone — from young kids getting their first phone to grandparents browsing online.
          If something feels off, check it before you tap or reply.
        </p>
      </div>

      {/* 4 RED FLAGS TO WATCH OUT FOR */}
      <div className="how-it-works-card">
        <div className="section-title-wrap">
          <h3 className="section-title">
            <AlertTriangle size={18} style={{ color: '#f59e0b' }} />
            <span>4 Common Scam Warning Signs</span>
          </h3>
        </div>

        <div className="steps-list">
          <div className="step-item">
            <div className="step-number" style={{ background: '#ef4444' }}>
              <AlertTriangle size={18} color="#ffffff" />
            </div>
            <div className="step-content">
              <h4>Panic & Fake Urgency</h4>
              <p>"Your account will be blocked in 15 minutes!" Scammers rush you so you don't have time to think.</p>
            </div>
          </div>

          <div className="step-item">
            <div className="step-number" style={{ background: '#f97316' }}>
              <Key size={18} color="#ffffff" />
            </div>
            <div className="step-content">
              <h4>Asking for OTPs or Passwords</h4>
              <p>Real banks, courier services, and apps will NEVER ask you to share your OTP over the phone or chat.</p>
            </div>
          </div>

          <div className="step-item">
            <div className="step-number" style={{ background: '#eab308' }}>
              <Gift size={18} color="#ffffff" />
            </div>
            <div className="step-content">
              <h4>Too-Good-to-be-True Prizes</h4>
              <p>"You won a lottery!" but you have to pay a small processing fee first. If you didn't enter, you didn't win.</p>
            </div>
          </div>

          <div className="step-item">
            <div className="step-number" style={{ background: '#3b82f6' }}>
              <PhoneCall size={18} color="#ffffff" />
            </div>
            <div className="step-content">
              <h4>Imposter Callers & Strange Links</h4>
              <p>Callers pretending to be bank managers or police asking you to click unknown website links.</p>
            </div>
          </div>
        </div>
      </div>

      {/* GOLDEN RULES */}
      <div className="how-it-works-card">
        <div className="section-title-wrap">
          <h3 className="section-title">
            <CheckCircle2 size={18} style={{ color: '#10b981' }} />
            <span>Golden Rules to Stay Safe</span>
          </h3>
        </div>

        <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px', padding: 0 }}>
          <li className="report-reason-item">
            <CheckCircle2 size={16} style={{ color: '#10b981', flexShrink: 0 }} />
            <span>Never share one-time passwords (OTP) or PINs with anyone.</span>
          </li>
          <li className="report-reason-item">
            <CheckCircle2 size={16} style={{ color: '#10b981', flexShrink: 0 }} />
            <span>Always open official apps directly instead of clicking SMS links.</span>
          </li>
          <li className="report-reason-item">
            <CheckCircle2 size={16} style={{ color: '#10b981', flexShrink: 0 }} />
            <span>When in doubt, hang up and call the number printed on your bank card.</span>
          </li>
        </ul>

        <button className="btn-primary" onClick={onStartScan} style={{ marginTop: '8px' }}>
          <span>Check a Message or Screenshot Now</span>
        </button>
      </div>

      {/* SAFETY DISCLAIMER */}
      <div className="safety-note-box">
        <Lock size={18} style={{ color: 'var(--color-primary-light)', flexShrink: 0 }} />
        <p>
          <strong>Trust & Privacy:</strong> TrustVision checks content for security risks. We do not sell your data or share your personal scans.
        </p>
      </div>
    </div>
  );
};
