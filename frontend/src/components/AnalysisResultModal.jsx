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
  Info,
  Shield,
  Ban,
  ArrowRight,
  Sparkles,
  ExternalLink,
  Lock
} from 'lucide-react';

export const AnalysisResultModal = ({ result, onClose }) => {
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(null);

  const handleFeedback = async (isHelpful) => {
    try {
      await submitFeedback({ analysisId: result.id, isHelpful });
      setFeedbackSubmitted(isHelpful);
    } catch (err) {
      console.error('Feedback error:', err);
    }
  };

  const getRiskIcon = (level) => {
    switch (level) {
      case 'high_risk':
      case 'potentially_dangerous':
        return <ShieldAlert size={20} />;
      case 'low_risk':
      case 'safe':
        return <ShieldCheck size={20} />;
      default:
        return <HelpCircle size={20} />;
    }
  };

  const formatRiskLabel = (level) => {
    switch (level) {
      case 'high_risk':
        return 'High Risk Threat';
      case 'potentially_dangerous':
        return 'Potentially Dangerous';
      case 'low_risk':
      case 'safe':
        return 'Low Risk / Safe';
      case 'insufficient_evidence':
        return 'Insufficient Evidence';
      default:
        return level ? level.replace('_', ' ') : 'Assessment Complete';
    }
  };

  const isDangerous = result.riskLevel === 'high_risk' || result.riskLevel === 'potentially_dangerous';
  const isSafe = result.riskLevel === 'low_risk' || result.riskLevel === 'safe';

  // Fallback verification advice if not provided by backend
  const verificationAdvice = result.verificationAdvice || (
    isDangerous
      ? 'Do not use links or contact details from this message. Open the provider’s official mobile app or visit their verified website directly.'
      : 'Always ensure URLs match official domain names before entering sensitive credentials.'
  );

  return (
    <div className="modal-overlay">
      {/* MODAL HEADER */}
      <div className="modal-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div className={`risk-pill ${result.riskLevel}`}>
            {getRiskIcon(result.riskLevel)}
            <span>{formatRiskLabel(result.riskLevel)}</span>
          </div>
        </div>
        <button
          onClick={onClose}
          aria-label="Close"
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-on-surface-variant)',
            cursor: 'pointer',
            padding: '6px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '6px'
          }}
        >
          <X size={22} />
        </button>
      </div>

      {/* MODAL BODY */}
      <div className="modal-body">
        {/* SUMMARY CARD */}
        {result.summary && (
          <div
            className="card-container"
            style={{
              backgroundColor: 'var(--surface-container-low)',
              borderLeft: isDangerous ? '4px solid var(--risk-high-border)' : '4px solid #81c784',
              padding: '14px 16px'
            }}
          >
            <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-on-surface-variant)', fontWeight: 600 }}>
              Threat Assessment Summary
            </div>
            <p style={{ fontSize: '14px', color: 'var(--text-on-surface)', lineHeight: 1.45, margin: 0, fontWeight: 500 }}>
              {result.summary}
            </p>
          </div>
        )}

        {/* WHAT WE NOTICED (SIGNALS) */}
        {result.signals && result.signals.length > 0 && (
          <div className="card-container">
            <div className="card-title">
              <AlertTriangle size={16} style={{ color: isDangerous ? '#ffb596' : 'var(--color-primary-light)' }} />
              <span>What We Detected (Signals)</span>
            </div>
            <ul style={{ display: 'flex', flexDirection: 'column', gap: '8px', paddingLeft: '0', listStyle: 'none', margin: 0 }}>
              {result.signals.map((signal, idx) => (
                <li
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '10px',
                    fontSize: '13px',
                    color: 'var(--text-on-surface)',
                    backgroundColor: 'var(--surface-container-lowest)',
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid rgba(255, 255, 255, 0.05)'
                  }}
                >
                  <span style={{ color: isDangerous ? '#ff897d' : 'var(--color-primary-light)', fontWeight: 'bold', fontSize: '14px', lineHeight: 1 }}>
                    •
                  </span>
                  <span style={{ lineHeight: 1.4 }}>{signal}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* RECOMMENDED SAFE ACTION: CLARIFIED ACTION PLAN (WHAT TO DO & HOW TO DO IT) */}
        <div
          className="card-container"
          style={{
            borderColor: isDangerous ? 'var(--risk-dangerous-border)' : 'var(--color-primary)',
            backgroundColor: isDangerous ? 'rgba(188, 72, 0, 0.12)' : 'rgba(37, 99, 235, 0.1)',
            gap: '14px',
            padding: '16px'
          }}
        >
          {/* Action Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Shield size={18} style={{ color: isDangerous ? '#ffb596' : '#81c784' }} />
              <span style={{ fontSize: '14px', fontWeight: 700, color: '#ffffff', letterSpacing: '0.02em', textTransform: 'uppercase' }}>
                Recommended Safe Action Plan
              </span>
            </div>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 700,
                color: isDangerous ? '#ffb4ab' : '#81c784',
                backgroundColor: isDangerous ? 'rgba(255, 137, 125, 0.2)' : 'rgba(129, 199, 132, 0.2)',
                padding: '2px 8px',
                borderRadius: 'var(--radius-pill)',
                textTransform: 'uppercase'
              }}
            >
              {isDangerous ? 'Action Required' : 'Verified Safe'}
            </span>
          </div>

          {/* STEP 1: WHAT TO DO RIGHT NOW */}
          <div
            style={{
              backgroundColor: 'var(--surface-container-lowest)',
              border: isDangerous ? '1px solid rgba(255, 137, 125, 0.35)' : '1px solid rgba(129, 199, 132, 0.35)',
              borderRadius: 'var(--radius-md)',
              padding: '12px 14px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 800,
                  color: isDangerous ? '#ff897d' : '#81c784',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                {isDangerous ? <Ban size={13} /> : <CheckCircle size={13} />}
                Step 1: What To Do (Immediate Action)
              </span>
            </div>
            <p
              style={{
                fontSize: '13.5px',
                fontWeight: 600,
                color: '#ffffff',
                lineHeight: 1.45,
                margin: 0
              }}
            >
              {result.recommendedAction || 'No immediate corrective action required. Exercise standard digital caution.'}
            </p>
          </div>

          {/* STEP 2: HOW TO DO IT SAFELY (VERIFICATION & NEXT STEPS) */}
          <div
            style={{
              backgroundColor: 'var(--surface-container-lowest)',
              border: '1px solid rgba(59, 130, 246, 0.35)',
              borderRadius: 'var(--radius-md)',
              padding: '12px 14px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 800,
                  color: '#93c5fd',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <ShieldCheck size={13} />
                Step 2: How To Do It (Safe Verification)
              </span>
            </div>
            <p
              style={{
                fontSize: '13px',
                color: 'var(--text-on-surface)',
                lineHeight: 1.45,
                margin: 0
              }}
            >
              {verificationAdvice}
            </p>
          </div>

          {/* WHY THIS MATTERS / POTENTIAL IMPACT (IF AVAILABLE) */}
          {(result.whyItMatters || result.potentialImpact) && (
            <div
              style={{
                fontSize: '12px',
                color: 'var(--text-on-surface-variant)',
                backgroundColor: 'rgba(0, 0, 0, 0.25)',
                padding: '10px 12px',
                borderRadius: 'var(--radius-sm)',
                lineHeight: 1.4
              }}
            >
              {result.potentialImpact && (
                <div style={{ marginBottom: result.whyItMatters ? '4px' : '0' }}>
                  <strong style={{ color: '#ffb596' }}>Risk Impact: </strong>
                  {result.potentialImpact}
                </div>
              )}
              {result.whyItMatters && (
                <div>
                  <strong style={{ color: 'var(--color-primary-light)' }}>Why: </strong>
                  {result.whyItMatters}
                </div>
              )}
            </div>
          )}
        </div>

        {/* ACCURACY DISCLAIMER */}
        <div
          style={{
            fontSize: '12px',
            color: 'var(--text-on-surface-variant)',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '2px 4px'
          }}
        >
          <Info size={14} style={{ color: 'var(--color-primary-light)', flexShrink: 0 }} />
          <span>TrustVision AI safety assistant helps you make informed security decisions.</span>
        </div>

        {/* FEEDBACK SECTION */}
        <div className="card-container" style={{ textAlign: 'center', padding: '14px', gap: '8px' }}>
          <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-on-surface-variant)' }}>
            Was this assessment helpful?
          </span>
          {feedbackSubmitted !== null ? (
            <span style={{ fontSize: '13px', color: '#81c784', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
              <CheckCircle size={16} /> Thank you for your feedback!
            </span>
          ) : (
            <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginTop: '4px' }}>
              <button
                className="btn-secondary"
                onClick={() => handleFeedback(true)}
                style={{ width: 'auto', padding: '0 20px', height: '36px', fontSize: '13px' }}
              >
                <ThumbsUp size={15} /> Yes
              </button>
              <button
                className="btn-secondary"
                onClick={() => handleFeedback(false)}
                style={{ width: 'auto', padding: '0 20px', height: '36px', fontSize: '13px' }}
              >
                <ThumbsDown size={15} /> No
              </button>
            </div>
          )}
        </div>

        {/* CLOSE BUTTON */}
        <button className="btn-primary" onClick={onClose} style={{ marginTop: '4px' }}>
          Done / Close Report
        </button>
      </div>
    </div>
  );
};
