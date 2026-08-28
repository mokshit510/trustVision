import React from 'react';
import { History, ShieldAlert, ShieldCheck, AlertTriangle, ChevronRight, MessageSquare, Image, Mic } from 'lucide-react';

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

  const getRiskIcon = (level) => {
    switch (level) {
      case 'high_risk':
        return <ShieldAlert size={18} style={{ color: '#f87171' }} />;
      case 'potentially_dangerous':
        return <AlertTriangle size={18} style={{ color: '#fb923c' }} />;
      case 'low_risk':
      case 'safe':
        return <ShieldCheck size={18} style={{ color: '#34d399' }} />;
      default:
        return <History size={18} style={{ color: '#93c5fd' }} />;
    }
  };

  const getModalityEmoji = (modality) => {
    switch (modality) {
      case 'text': return '💬';
      case 'image': return '🖼️';
      case 'voice': return '🎙️';
      default: return '📄';
    }
  };

  const getRiskLabel = (level) => {
    switch (level) {
      case 'high_risk': return 'High Risk';
      case 'potentially_dangerous': return 'Suspicious';
      case 'low_risk':
      case 'safe': return 'Looks Safe';
      default: return 'Checked';
    }
  };

  return (
    <div className="history-section-card">
      <div className="section-title-wrap">
        <h3 className="section-title">
          <History size={18} style={{ color: 'var(--color-primary-light)' }} />
          <span>Recent Safety Checks ({analyses.length})</span>
        </h3>
        <span className="section-subtitle">Tap to view full report</span>
      </div>

      <div className="history-items-list">
        {analyses.map((item) => (
          <div
            key={item.id || Math.random()}
            className="history-item-row"
            onClick={() => onSelectAnalysis(item)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onSelectAnalysis(item); }}
          >
            <div className="history-left-group">
              <div>{getRiskIcon(item.riskLevel)}</div>
              <div className="history-text-col">
                <span className="history-summary">
                  {item.summary ? (item.summary.length > 50 ? item.summary.substring(0, 50) + '...' : item.summary) : 'Safety Assessment'}
                </span>
                <span className="history-meta-sub">
                  <span>{getModalityEmoji(item.modality)} {item.modality ? item.modality.toUpperCase() : 'SCAN'}</span>
                  <span>•</span>
                  <span style={{
                    fontWeight: 600,
                    color: item.riskLevel === 'high_risk' ? '#f87171' : (item.riskLevel === 'potentially_dangerous' ? '#fb923c' : '#34d399')
                  }}>
                    {getRiskLabel(item.riskLevel)}
                  </span>
                  <span>•</span>
                  <span>{item.createdAt ? new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recent'}</span>
                </span>
              </div>
            </div>

            <ChevronRight size={18} style={{ color: 'var(--text-muted)' }} />
          </div>
        ))}
      </div>
    </div>
  );
};
