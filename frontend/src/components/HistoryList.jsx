import React from 'react';
import { ShieldAlert, ShieldCheck, HelpCircle, ChevronRight, History } from 'lucide-react';

export const HistoryList = ({ analyses, onSelectAnalysis }) => {
  if (!analyses || analyses.length === 0) {
    return (
      <div className="card-container" style={{ textAlign: 'center', padding: '32px 16px' }}>
        <History size={32} style={{ color: 'var(--color-outline)', margin: '0 auto' }} />
        <span style={{ fontSize: '14px', color: 'var(--text-on-surface-variant)', fontWeight: 500 }}>
          No past scans found in history.
        </span>
        <span style={{ fontSize: '12px', color: 'var(--color-outline)' }}>
          Scan a text, screenshot, or voice note to view threat assessments here.
        </span>
      </div>
    );
  }

  const getRiskIcon = (level) => {
    switch (level) {
      case 'high_risk':
      case 'potentially_dangerous':
        return <ShieldAlert size={16} style={{ color: '#ffb596' }} />;
      case 'low_risk':
      case 'safe':
        return <ShieldCheck size={16} style={{ color: '#81c784' }} />;
      default:
        return <HelpCircle size={16} style={{ color: '#90caf9' }} />;
    }
  };

  return (
    <div className="card-container">
      <div className="card-title">
        <History size={16} />
        <span>Recent Safety Scans ({analyses.length})</span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {analyses.map((item) => (
          <div
            key={item.id}
            onClick={() => onSelectAnalysis(item)}
            style={{
              backgroundColor: 'var(--surface-container-low)',
              border: '1px solid var(--color-outline-variant)',
              borderRadius: '12px',
              padding: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
              transition: 'background-color 0.2s ease'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {getRiskIcon(item.riskLevel)}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <span style={{ fontSize: '13px', fontWeight: 600, color: '#ffffff' }}>
                  {item.summary.length > 45 ? item.summary.substring(0, 45) + '...' : item.summary}
                </span>
                <span style={{ fontSize: '11px', color: 'var(--text-on-surface-variant)' }}>
                  {item.modality.toUpperCase()} • {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>

            <ChevronRight size={18} style={{ color: 'var(--color-outline)' }} />
          </div>
        ))}
      </div>
    </div>
  );
};
