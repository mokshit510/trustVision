import React from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';
import { DEMO_PRESETS } from '../../../shared/src/constants.js';

export const DemoPresets = ({ onSelectPreset }) => {
  const getDemoMeta = (preset) => {
    switch (preset.id) {
      case 'demo-text-bank':
        return {
          emoji: '🚨',
          name: 'Bank Message',
          preview: '"Your account will be blocked!"',
          tag: 'SMS Scam'
        };
      case 'demo-image-prize':
        return {
          emoji: '🎁',
          name: 'Prize Scam',
          preview: '"You won ₹25,000!"',
          tag: 'Fake Prize'
        };
      case 'demo-voice-otp':
        return {
          emoji: '📞',
          name: 'Fake Bank Call',
          preview: '"Tell me your OTP right now"',
          tag: 'Call Scam'
        };
      default:
        return {
          emoji: '⚠️',
          name: preset.title,
          preview: `"${preset.subtitle}"`,
          tag: preset.modality
        };
    }
  };

  return (
    <div className="demo-section-card">
      <div className="section-title-wrap">
        <h3 className="section-title">
          <Sparkles size={18} style={{ color: '#60a5fa' }} />
          <span>Try a Demo Scenario</span>
        </h3>
        <span className="section-subtitle">See how TrustVision catches scams</span>
      </div>

      <div className="demo-cards-list">
        {DEMO_PRESETS.map((preset) => {
          const meta = getDemoMeta(preset);
          return (
            <div
              key={preset.id}
              className="demo-card"
              onClick={() => onSelectPreset(preset)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onSelectPreset(preset); }}
              aria-label={`Try demo: ${meta.name}`}
            >
              <div className="demo-card-content">
                <div className="demo-icon-badge">{meta.emoji}</div>
                <div className="demo-text-meta">
                  <span className="demo-title">{meta.name}</span>
                  <span className="demo-quote">{meta.preview}</span>
                </div>
              </div>

              <div className="demo-action-tag">
                <span>Try Demo</span>
                <ArrowRight size={13} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
