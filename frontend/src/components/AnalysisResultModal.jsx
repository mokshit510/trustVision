import React, { useState } from 'react';
import { submitFeedback } from '../services/api.js';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  HelpCircle,
  X,
  ThumbsUp,
  ThumbsDown,
  CheckCircle,
  PhoneCall,
  Lock,
  ArrowRight,
  ShieldQuestion,
  Info
} from 'lucide-react';

export const AnalysisResultModal = ({ result, onClose }) => {
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(null);

  if (!result) return null;

  const handleFeedback = async (isHelpful) => {
    try {
      if (result.id) {
        await submitFeedback({ analysisId: result.id, isHelpful });
      }
      setFeedbackSubmitted(isHelpful);
    } catch (err) {
      console.error('Feedback error:', err);
      setFeedbackSubmitted(isHelpful);
    }
  };

  const getRiskMeta = (level) => {
    switch (level) {
      case 'high_risk':
        return {
          badgeClass: 'high_risk',
          label: 'HIGH RISK',
          title: 'This appears very dangerous',
          icon: <ShieldAlert size={24} />
        };
      case 'potentially_dangerous':
        return {
          badgeClass: 'potentially_dangerous',
          label: 'SUSPICIOUS',
          title: 'Exercise high caution',
          icon: <AlertTriangle size={24} />
        };
      case 'low_risk':
      case 'safe':
        return {
          badgeClass: 'safe',
          label: 'LOOKS SAFE',
          title: 'No obvious scam signs detected',
          icon: <ShieldCheck size={24} />
        };
      case 'insufficient_evidence':
      default:
        return {
          badgeClass: 'insufficient_evidence',
          label: 'NOT ENOUGH INFO',
          title: 'Could not determine risk safely',
          icon: <ShieldQuestion size={24} />
        };
    }
  };

  const isDangerous = result.riskLevel === 'high_risk' || result.riskLevel === 'potentially_dangerous';
  const meta = getRiskMeta(result.riskLevel);

  // Fallback verification guidance if not provided
  const verificationAdvice = result.verificationAdvice || (
    isDangerous
      ? 'Do not use any phone number or link inside the message. Open your bank’s official mobile app or dial the phone number printed on the back of your card.'
      : 'Always double-check website address bar before typing passwords or payment details.'
  );

  const recommendedAction = result.recommendedAction || (
    isDangerous
      ? 'Do not click links, send money, or share any OTP or password.'
      : 'You can proceed normally, but remain attentive.'
  );

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true">
      <div className="modal-window">
        {/* HEADER */}
        <div className="modal-header-bar">
          <div className="modal-header-title">
            <ShieldCheck size={20} style={{ color: 'var(--color-primary-light)' }} />
            <span>Safety Report</span>
          </div>

          <button
            className="modal-close-btn"
            onClick={onClose}
            aria-label="Close report"
          >
            <X size={20} />
          </button>
        </div>

        {/* CONTENT */}
        <div className="modal-content-scroll">
          {/* 1. RISK LEVEL & 2. ONE-SENTENCE EXPLANATION */}
          <div className={`risk-verdict-banner ${meta.badgeClass}`}>
            <div className={`risk-badge-large ${meta.badgeClass}`}>
              {meta.icon}
              <span>{meta.label}</span>
            </div>
            <p className="risk-summary-text">
              {result.summary || meta.title}
            </p>
          </div>

          {/* 3. WHY WE THINK THIS (WARNING SIGNS) */}
          {result.signals && result.signals.length > 0 && (
            <div className="report-card">
              <div className="report-card-heading" style={{ color: isDangerous ? '#f87171' : 'var(--color-primary-light)' }}>
                <AlertTriangle size={16} />
                <span>WHY? (WARNING SIGNS DETECTED)</span>
              </div>

              <ul className="report-reasons-list">
                {result.signals.map((signal, idx) => (
                  <li key={idx} className="report-reason-item">
                    <span style={{ color: isDangerous ? '#ef4444' : '#10b981', fontWeight: 800 }}>•</span>
                    <span>{signal}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* 4. WHAT SHOULD YOU DO? */}
          <div className="report-card" style={{ borderColor: isDangerous ? 'rgba(239, 68, 68, 0.4)' : 'rgba(16, 185, 129, 0.4)' }}>
            <div className="report-card-heading" style={{ color: isDangerous ? '#f87171' : '#34d399' }}>
              <ShieldAlert size={16} />
              <span>WHAT SHOULD YOU DO?</span>
            </div>

            <div className="action-guidance-box" style={{ borderLeft: isDangerous ? '4px solid #ef4444' : '4px solid #10b981' }}>
              {recommendedAction}
            </div>
          </div>

          {/* 5. HOW TO VERIFY SAFELY */}
          <div className="report-card">
            <div className="report-card-heading" style={{ color: '#93c5fd' }}>
              <Lock size={16} />
              <span>VERIFY SAFELY</span>
            </div>

            <div className="verify-guidance-box">
              {verificationAdvice}
            </div>
          </div>

          {/* 6. SUPPORTING EVIDENCE (IF AVAILABLE) */}
          {result.evidence && result.evidence.length > 0 && (
            <div className="report-card" style={{ padding: '12px 14px' }}>
              <div className="report-card-heading" style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>
                <Info size={15} />
                <span>ADDITIONAL DETAILS</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {result.evidence.map((item, idx) => (
                  <div key={idx} style={{ fontSize: '12.5px', color: 'var(--text-on-surface-variant)' }}>
                    <strong style={{ color: '#ffffff' }}>{item.title}: </strong>
                    <span>{item.detail}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* HELPFUL FEEDBACK */}
          <div className="feedback-box">
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-on-surface)' }}>
              Was this safety report helpful?
            </span>

            {feedbackSubmitted !== null ? (
              <span style={{ fontSize: '13px', color: '#34d399', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <CheckCircle size={16} /> Thank you! Your feedback helps protect others.
              </span>
            ) : (
              <div className="feedback-buttons-row">
                <button
                  className="btn-secondary"
                  onClick={() => handleFeedback(true)}
                  style={{ minHeight: '38px', padding: '0 20px', fontSize: '13px' }}
                >
                  <ThumbsUp size={15} /> Yes
                </button>
                <button
                  className="btn-secondary"
                  onClick={() => handleFeedback(false)}
                  style={{ minHeight: '38px', padding: '0 20px', fontSize: '13px' }}
                >
                  <ThumbsDown size={15} /> No
                </button>
              </div>
            )}
          </div>

          {/* DONE BUTTON */}
          <button className="btn-primary" onClick={onClose} style={{ marginTop: '4px' }}>
            <span>Done / Close Report</span>
          </button>
        </div>
      </div>
    </div>
  );
};
