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
  Info,
  Quote,
  Flame,
  CheckCircle2
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

  const getThreatMeta = (level) => {
    switch (level) {
      case 'critical':
        return {
          badgeClass: 'critical',
          label: 'CRITICAL',
          color: '#ef4444',
          dotColor: '#ef4444',
          title: 'Severe threat detected with active credential or financial extraction.',
          icon: <ShieldAlert size={22} />
        };
      case 'high_risk':
        return {
          badgeClass: 'high_risk',
          label: 'HIGH RISK',
          color: '#f97316',
          dotColor: '#f97316',
          title: 'Strong indicators of a potential financial or social-engineering threat.',
          icon: <ShieldAlert size={22} />
        };
      case 'potentially_dangerous':
      case 'suspicious':
        return {
          badgeClass: 'suspicious',
          label: 'SUSPICIOUS',
          color: '#eab308',
          dotColor: '#eab308',
          title: 'Exercise caution. Contains suspicious patterns or unverified requests.',
          icon: <AlertTriangle size={22} />
        };
      case 'low_risk':
      case 'safe':
        return {
          badgeClass: 'safe',
          label: 'SAFE',
          color: '#10b981',
          dotColor: '#10b981',
          title: 'No obvious scam signs or malicious patterns detected.',
          icon: <ShieldCheck size={22} />
        };
      case 'insufficient_evidence':
      default:
        return {
          badgeClass: 'insufficient_evidence',
          label: 'NOT ENOUGH INFO',
          color: '#60a5fa',
          dotColor: '#60a5fa',
          title: 'Could not determine threat level safely from provided input.',
          icon: <ShieldQuestion size={22} />
        };
    }
  };

  // Categorical confidence (Never numerical score or percentage)
  const getConfidenceLabel = (confidence) => {
    if (!confidence && confidence !== 0) return null;
    if (typeof confidence === 'string') {
      if (confidence.includes('%') || !isNaN(Number(confidence))) {
        const num = parseFloat(confidence);
        if (!isNaN(num)) {
          if (num >= 0.85 || num >= 85) return 'High';
          if (num >= 0.60 || num >= 60) return 'Medium';
          return 'Low';
        }
      }
      return confidence;
    }
    if (typeof confidence === 'number') {
      if (confidence >= 0.85) return 'High';
      if (confidence >= 0.60) return 'Medium';
      return 'Low';
    }
    return null;
  };

  const isDangerous =
    result.riskLevel === 'critical' ||
    result.riskLevel === 'high_risk' ||
    result.riskLevel === 'potentially_dangerous' ||
    result.riskLevel === 'suspicious';

  const meta = getThreatMeta(result.riskLevel);
  const confidenceLabel = getConfidenceLabel(result.confidence);

  // Formatting potential impacts into list if multi-clause
  const getPotentialImpacts = () => {
    if (!result.potentialImpact) {
      return isDangerous
        ? ['Financial loss', 'Account compromise', 'Credential theft']
        : ['Minimal immediate risk'];
    }
    if (Array.isArray(result.potentialImpact)) {
      return result.potentialImpact;
    }
    // If string has bullet points or sentences
    if (result.potentialImpact.includes('•') || result.potentialImpact.includes('\n')) {
      return result.potentialImpact
        .split(/[•\n]/)
        .map((s) => s.trim())
        .filter(Boolean);
    }
    return [result.potentialImpact];
  };

  // Fallback verification guidance if not provided
  const verificationAdvice =
    result.verificationAdvice ||
    (isDangerous
      ? 'Do not use any phone number or link inside the message. Open your bank’s official mobile app or dial the phone number printed on the back of your card.'
      : 'Always double-check website address bar before typing passwords or payment details.');

  const recommendedAction =
    result.recommendedAction ||
    (isDangerous
      ? 'Do not click links, send money, or share any OTP or password.'
      : 'You can proceed normally, but remain attentive.');

  const impacts = getPotentialImpacts();

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true">
      <div className="modal-window">
        {/* HEADER */}
        <div className="modal-header-bar">
          <div className="modal-header-title">
            <ShieldCheck size={20} style={{ color: 'var(--color-primary-light)' }} />
            <span>Threat Assessment Report</span>
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
          {/* 1. THREAT LEVEL VERDICT BANNER */}
          <div className={`risk-verdict-banner ${meta.badgeClass}`}>
            <div className="threat-assessment-label">THREAT ASSESSMENT</div>
            <div className={`risk-badge-large ${meta.badgeClass}`}>
              <span className="threat-dot" style={{ backgroundColor: meta.dotColor }} />
              {meta.icon}
              <span>{meta.label}</span>
            </div>

            <p className="risk-summary-text">
              {result.summary || meta.title}
            </p>

            {confidenceLabel && (
              <div className="threat-confidence-row">
                <span className="threat-confidence-label">Confidence:</span>
                <span className="threat-confidence-value">{confidenceLabel}</span>
              </div>
            )}
          </div>

          {/* 2. DETECTED SIGNALS */}
          {result.signals && result.signals.length > 0 && (
            <div className="report-card">
              <div
                className="report-card-heading"
                style={{ color: isDangerous ? meta.color : 'var(--color-primary-light)' }}
              >
                <AlertTriangle size={16} />
                <span>Detected Signals</span>
              </div>

              <ul className="report-reasons-list">
                {result.signals.map((signal, idx) => (
                  <li key={idx} className="report-reason-item">
                    <span className="signal-bullet-icon" style={{ color: meta.color }}>
                      ⚠
                    </span>
                    <span>{signal}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* 3. POTENTIAL IMPACT */}
          <div
            className="report-card"
            style={{
              borderColor: isDangerous ? `${meta.color}40` : 'rgba(16, 185, 129, 0.3)'
            }}
          >
            <div
              className="report-card-heading"
              style={{ color: isDangerous ? meta.color : '#34d399' }}
            >
              <ShieldAlert size={16} />
              <span>Potential Impact</span>
            </div>

            <ul className="report-impact-list">
              {impacts.map((impact, idx) => (
                <li key={idx} className="report-impact-item">
                  <span className="impact-bullet">•</span>
                  <span>{impact}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* 4. RECOMMENDED ACTION */}
          <div
            className="report-card"
            style={{
              borderColor: isDangerous ? `${meta.color}55` : 'rgba(16, 185, 129, 0.4)'
            }}
          >
            <div
              className="report-card-heading"
              style={{ color: isDangerous ? meta.color : '#34d399' }}
            >
              <CheckCircle2 size={16} />
              <span>Recommended Action</span>
            </div>

            <div
              className="action-guidance-box"
              style={{ borderLeft: `4px solid ${meta.color}` }}
            >
              {recommendedAction}
            </div>
          </div>

          {/* 5. VERIFICATION ADVICE */}
          <div className="report-card">
            <div className="report-card-heading" style={{ color: '#93c5fd' }}>
              <Lock size={16} />
              <span>Verification Advice</span>
            </div>

            <div className="verify-guidance-box">{verificationAdvice}</div>
          </div>

          {/* 6. SUPPORTING EVIDENCE */}
          {((result.evidence && result.evidence.length > 0) || result.extractedContent || result.rawInputSnippet) && (
            <div className="report-card">
              <div
                className="report-card-heading"
                style={{ fontSize: '12px', color: 'var(--text-muted)' }}
              >
                <Quote size={15} />
                <span>Supporting Evidence</span>
              </div>

              {result.extractedContent && (
                <div className="evidence-quote-box">
                  "{result.extractedContent}"
                </div>
              )}

              {result.evidence && result.evidence.length > 0 && (
                <div className="evidence-items-col">
                  {result.evidence.map((item, idx) => (
                    <div key={idx} className="evidence-entry-row">
                      <strong style={{ color: '#ffffff' }}>{item.title}: </strong>
                      <span>{item.detail}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 7. WHY THIS WAS FLAGGED */}
          {result.whyItMatters && (
            <div className="report-card">
              <div
                className="report-card-heading"
                style={{ color: 'var(--color-primary-light)' }}
              >
                <Info size={16} />
                <span>Why this was flagged</span>
              </div>
              <div className="why-flagged-text">{result.whyItMatters}</div>
            </div>
          )}

          {/* HELPFUL FEEDBACK */}
          <div className="feedback-box">
            <span
              style={{
                fontSize: '13px',
                fontWeight: 600,
                color: 'var(--text-on-surface)'
              }}
            >
              Was this safety report helpful?
            </span>

            {feedbackSubmitted !== null ? (
              <span
                style={{
                  fontSize: '13px',
                  color: '#34d399',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <CheckCircle size={16} /> Thank you! Your feedback helps protect
                others.
              </span>
            ) : (
              <div className="feedback-buttons-row">
                <button
                  className="btn-secondary"
                  onClick={() => handleFeedback(true)}
                  style={{
                    minHeight: '38px',
                    padding: '0 20px',
                    fontSize: '13px'
                  }}
                >
                  <ThumbsUp size={15} /> Yes
                </button>
                <button
                  className="btn-secondary"
                  onClick={() => handleFeedback(false)}
                  style={{
                    minHeight: '38px',
                    padding: '0 20px',
                    fontSize: '13px'
                  }}
                >
                  <ThumbsDown size={15} /> No
                </button>
              </div>
            )}
          </div>

          {/* DONE BUTTON */}
          <button
            className="btn-primary"
            onClick={onClose}
            style={{ marginTop: '4px' }}
          >
            <span>Done / Close Report</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AnalysisResultModal;
