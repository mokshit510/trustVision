import React from 'react';
import { History, ShieldAlert, ShieldCheck, AlertTriangle, ChevronRight, MessageSquare, Image, Mic, FileText, ShieldQuestion } from 'lucide-react';

export const HistoryList = ({ analyses = [], onSelectAnalysis, onStartScan }) => {
  if (!analyses || analyses.length === 0) {
    return (
      <div className="history-section-card" style={{ textAlign: 'center', padding: '36px 20px', alignItems: 'center' }}>
        <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'var(--surface-container-high)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary-light)', marginBottom: '8px' }}>
          <History size={24} />
        </div>
        <h4 style={{ fontSize: '15px', fontWeight: 700, color: '#ffffff', marginBottom: '4px' }}>No Safety Checks Yet</h4>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)', maxWidth: '320px', marginBottom: '16px' }}>
          When you check a message, screenshot, or voice note, your safety reports will be saved here.
        </p>
        {onStartScan && (
          <button className="btn-primary" onClick={onStartScan} style={{ width: 'auto', padding: '0 24px' }}>
            <span>Check Something Now</span>
          </button>
        )}
      </div>
    );
  }

  const getThreatCategory = (level) => {
    switch (level) {
      case 'critical':
        return {
          icon: <ShieldAlert size={18} style={{ color: '#ef4444' }} />,
          label: 'CRITICAL',
          color: '#ef4444',
          dot: '#ef4444'
        };
      case 'high_risk':
        return {
          icon: <ShieldAlert size={18} style={{ color: '#f97316' }} />,
          label: 'HIGH RISK',
          color: '#f97316',
          dot: '#f97316'
        };
      case 'potentially_dangerous':
      case 'suspicious':
        return {
          icon: <AlertTriangle size={18} style={{ color: '#eab308' }} />,
          label: 'SUSPICIOUS',
          color: '#eab308',
          dot: '#eab308'
        };
      case 'low_risk':
      case 'safe':
        return {
          icon: <ShieldCheck size={18} style={{ color: '#10b981' }} />,
          label: 'SAFE',
          color: '#10b981',
          dot: '#10b981'
        };
      case 'insufficient_evidence':
      default:
        return {
          icon: <ShieldQuestion size={18} style={{ color: '#60a5fa' }} />,
          label: 'NOT ENOUGH INFO',
          color: '#60a5fa',
          dot: '#60a5fa'
        };
    }
  };

  const getModalityIcon = (modality) => {
    switch (modality) {
      case 'text': return <MessageSquare size={13} style={{ display: 'inline', verticalAlign: 'middle' }} />;
      case 'image': return <Image size={13} style={{ display: 'inline', verticalAlign: 'middle' }} />;
      case 'voice': return <Mic size={13} style={{ display: 'inline', verticalAlign: 'middle' }} />;
      default: return <FileText size={13} style={{ display: 'inline', verticalAlign: 'middle' }} />;
    }
  };

  return (
    <div className="history-section-card">
      <div className="section-title-wrap">
        <h3 className="section-title">
          <History size={18} style={{ color: 'var(--color-primary-light)' }} />
          <span>Recent Analyses ({analyses.length})</span>
        </h3>
        <span className="section-subtitle">Tap to view full threat report</span>
      </div>

      <div className="history-items-list">
        {analyses.map((item) => {
          const threat = getThreatCategory(item.riskLevel);
          return (
            <div
              key={item.id || Math.random()}
              className="history-item-row"
              onClick={() => onSelectAnalysis(item)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onSelectAnalysis(item); }}
            >
              <div className="history-left-group">
                <div>{threat.icon}</div>
                <div className="history-text-col">
                  <span className="history-summary">
                    {item.summary ? (item.summary.length > 50 ? item.summary.substring(0, 50) + '...' : item.summary) : 'Threat Assessment'}
                  </span>
                  <span className="history-meta-sub">
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      {getModalityIcon(item.modality)} {item.modality ? item.modality.toUpperCase() : 'SCAN'}
                    </span>
                    <span>•</span>
                    <span style={{
                      fontWeight: 700,
                      color: threat.color,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: threat.dot }} />
                      {threat.label}
                    </span>
                    <span>•</span>
                    <span>{item.createdAt ? new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recent'}</span>
                  </span>
                </div>
              </div>

              <ChevronRight size={18} style={{ color: 'var(--text-muted)' }} />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default HistoryList;
