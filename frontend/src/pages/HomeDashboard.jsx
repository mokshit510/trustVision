import React, { useState, useEffect } from 'react';
import { analyzeText, analyzeImage, analyzeVoice, getAnalyses } from '../services/api.js';
import { Navbar } from '../components/Navbar.jsx';
import { DemoPresets } from '../components/DemoPresets.jsx';
import { ScanInputSection } from '../components/ScanInputSection.jsx';
import { AnalysisResultModal } from '../components/AnalysisResultModal.jsx';
import { HistoryList } from '../components/HistoryList.jsx';
import { Shield, History } from 'lucide-react';

export const HomeDashboard = () => {
  const [activeNav, setActiveNav] = useState('scan');
  const [isLoading, setIsLoading] = useState(false);
  const [activeAnalysis, setActiveAnalysis] = useState(null);
  const [historyItems, setHistoryItems] = useState([]);
  const [selectedText, setSelectedText] = useState('');
  const [errorMessage, setErrorMessage] = useState(null);

  const loadHistory = async () => {
    try {
      const data = await getAnalyses();
      setHistoryItems(data);
    } catch (err) {
      console.error('Failed to load history:', err);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const handleSelectPreset = (preset) => {
    setSelectedText(preset.inputContent);
    setErrorMessage(null);
  };

  const handleAnalyzeText = async (text) => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const result = await analyzeText(text);
      setActiveAnalysis(result);
      loadHistory();
    } catch (err) {
      setErrorMessage(err.message || 'Failed to analyze text.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnalyzeImage = async (file, text) => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const result = await analyzeImage(file, text);
      setActiveAnalysis(result);
      loadHistory();
    } catch (err) {
      setErrorMessage(err.message || 'Failed to analyze image.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnalyzeVoice = async (file, text) => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const result = await analyzeVoice(file, text);
      setActiveAnalysis(result);
      loadHistory();
    } catch (err) {
      setErrorMessage(err.message || 'Failed to analyze voice note.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="app-container">
      <Navbar />

      <main className="app-main">
        {errorMessage && (
          <div className="card-container" style={{ border: '1px solid #ff897d', backgroundColor: 'rgba(239, 68, 68, 0.15)', color: '#ffb4ab', padding: '12px', fontSize: '13px' }}>
            ⚠️ Error: {errorMessage}
          </div>
        )}

        {activeNav === 'scan' ? (
          <>
            <DemoPresets onSelectPreset={handleSelectPreset} />

            <ScanInputSection
              onAnalyzeText={handleAnalyzeText}
              onAnalyzeImage={handleAnalyzeImage}
              onAnalyzeVoice={handleAnalyzeVoice}
              isLoading={isLoading}
              selectedText={selectedText}
            />

            <HistoryList
              analyses={historyItems.slice(0, 3)}
              onSelectAnalysis={(item) => setActiveAnalysis(item)}
            />
          </>
        ) : (
          <HistoryList
            analyses={historyItems}
            onSelectAnalysis={(item) => setActiveAnalysis(item)}
          />
        )}
      </main>

      {/* RESULT MODAL */}
      {activeAnalysis && (
        <AnalysisResultModal
          result={activeAnalysis}
          onClose={() => setActiveAnalysis(null)}
        />
      )}

      {/* FOOTER TAB NAV */}
      <nav className="app-nav">
        <button
          className={`nav-tab ${activeNav === 'scan' ? 'active' : ''}`}
          onClick={() => setActiveNav('scan')}
        >
          <Shield className="nav-icon" />
          <span>Safety Scan</span>
        </button>

        <button
          className={`nav-tab ${activeNav === 'history' ? 'active' : ''}`}
          onClick={() => setActiveNav('history')}
        >
          <History className="nav-icon" />
          <span>Scan History</span>
        </button>
      </nav>
    </div>
  );
};
