import React from 'react';
import { DEMO_PRESETS } from '../../../shared/src/constants.js';
import { Sparkles, MessageSquare, Image, Mic } from 'lucide-react';

export const DemoPresets = ({ onSelectPreset }) => {
  const getIcon = (modality) => {
    switch (modality) {
      case 'text': return <MessageSquare size={16} />;
      case 'image': return <Image size={16} />;
      case 'voice': return <Mic size={16} />;
      default: return <Sparkles size={16} />;
    }
  };

  return (
    <div className="card-container">
      <div className="card-title">
        <Sparkles size={16} style={{ color: '#60a5fa' }} />
        <span>Quick Demo Scenarios</span>
      </div>

      <div className="presets-grid">
        {DEMO_PRESETS.map((preset) => (
          <button
            key={preset.id}
            className="preset-chip"
            onClick={() => onSelectPreset(preset)}
          >
            <div className="preset-info">
              <span className="preset-title">{preset.title}</span>
              <span className="preset-subtitle">{preset.subtitle}</span>
            </div>
            <div className={`preset-tag ${preset.modality}`}>
              {getIcon(preset.modality)}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
