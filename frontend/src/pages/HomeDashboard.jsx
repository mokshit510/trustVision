import React, { useState, useEffect, useRef } from 'react';
import { analyzeText, analyzeImage, analyzeVoice, getAnalyses } from '../services/api.js';
import { Navbar } from '../components/Navbar.jsx';
import { DemoPresets } from '../components/DemoPresets.jsx';
import { ScanInputSection } from '../components/ScanInputSection.jsx';
import { AnalysisResultModal } from '../components/AnalysisResultModal.jsx';
import { HistoryList } from '../components/HistoryList.jsx';
import { HowItWorks } from '../components/HowItWorks.jsx';
import { AboutSection } from '../components/AboutSection.jsx';
import { Home, History, Info, ShieldCheck, AlertCircle, RefreshCw } from 'lucide-react';

const LOADING_PHRASES = [
  'Checking for warning signs...',
  'Looking for suspicious requests...',
  'Checking for urgency and pressure...',
  'Preparing your safety report...'
];

export const HomeDashboard = () => {
  const [activeNav, setActiveNav] = useState('home');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingPhraseIndex, setLoadingPhraseIndex] = useState(0);
  const [activeAnalysis, setActiveAnalysis] = useState(null);
  const [historyItems, setHistoryItems] = useState([]);
  const [selectedPreset, setSelectedPreset] = useState(null);
  const [activeInputTab, setActiveInputTab] = useState('text');
  const [errorMessage, setErrorMessage] = useState(null);
  const [lastAction, setLastAction] = useState(null);

  // Cycling loading phrases
  useEffect(() => {
    let interval = null;
    if (isLoading) {
      setLoadingPhraseIndex(0);
      interval = setInterval(() => {
        setLoadingPhraseIndex((prev) => (prev + 1) % LOADING_PHRASES.length);
      }, 1400);
    } else {
      setLoadingPhraseIndex(0);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isLoading]);

  const loadHistory = async () => {
    try {
      const data = await getAnalyses();
      if (Array.isArray(data)) {
        setHistoryItems(data);
      }
    } catch (err) {
      console.error('Failed to load history:', err);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const handleSelectPreset = (preset) => {
    setSelectedPreset(preset);
    setActiveNav('home');
    if (preset.modality) {
      setActiveInputTab(preset.modality);
    }
    setErrorMessage(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAnalyzeText = async (text) => {
    setIsLoading(true);
    setErrorMessage(null);
    setLastAction(() => () => handleAnalyzeText(text));
    try {
      const result = await analyzeText(text);
      setActiveAnalysis(result);
      loadHistory();
    } catch (err) {
      console.error(err);
      setErrorMessage("We couldn't check this message right now. Please check your connection and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnalyzeImage = async (file, text) => {
    setIsLoading(true);
    setErrorMessage(null);
    setLastAction(() => () => handleAnalyzeImage(file, text));
    try {
      const result = await analyzeImage(file, text);
      setActiveAnalysis(result);
      loadHistory();
    } catch (err) {
      console.error(err);
      setErrorMessage("We couldn't check this screenshot right now. Please check your connection and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnalyzeVoice = async (file, text) => {
    setIsLoading(true);
    setErrorMessage(null);
    setLastAction(() => () => handleAnalyzeVoice(file, text));
    try {
      const result = await analyzeVoice(file, text);
      setActiveAnalysis(result);
      loadHistory();
    } catch (err) {
      console.error(err);
      setErrorMessage("We couldn't check this voice note right now. Please check your connection and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetry = () => {
    if (lastAction) {
      lastAction();
    } else {
      setErrorMessage(null);
    }
  };

  return (
    <div className="app-container">
      {/* NAVBAR */}
      <Navbar onLogoClick={() => setActiveNav('home')} />

      {/* MAIN CONTENT AREA */}
      <main className="app-main">
        {/* FRIENDLY ERROR STATE */}
        {errorMessage && (
          <div className="error-banner">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertCircle size={20} style={{ flexShrink: 0 }} />
              <span>{errorMessage}</span>
            </div>
            <button className="error-retry-btn" onClick={handleRetry}>
              Try Again
            </button>
          </div>
        )}

        {/* TAB 1: HOME VIEW */}
        {activeNav === 'home' && (
          <>
            {/* HERO / FIRST SCREEN: 3-SECOND CLARITY */}
            <div className="hero-card">
              <div className="hero-pill">
                <ShieldCheck size={14} />
                <span>AI Safety Check</span>
              </div>
              <h1 className="hero-headline">Not sure if it's safe? Check it first.</h1>
              <p className="hero-subtext">
                Scan a message, screenshot, or voice note and get a simple safety report.
              </p>
            </div>

            {/* THREE INPUT CHOICES & SCANNER WORKSPACE */}
            <ScanInputSection
              onAnalyzeText={handleAnalyzeText}
              onAnalyzeImage={handleAnalyzeImage}
              onAnalyzeVoice={handleAnalyzeVoice}
              isLoading={isLoading}
              selectedPreset={selectedPreset}
              activeTab={activeInputTab}
              onTabChange={(tab) => setActiveInputTab(tab)}
            />

            {/* DEMO SCENARIOS */}
            <DemoPresets onSelectPreset={handleSelectPreset} />

            {/* HOW IT WORKS */}
            <HowItWorks />

            {/* RECENT SCANS SNIPPET */}
            {historyItems.length > 0 && (
              <HistoryList
                analyses={historyItems.slice(0, 3)}
                onSelectAnalysis={(item) => setActiveAnalysis(item)}
                onStartScan={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              />
            )}
          </>
        )}

        {/* TAB 2: FULL HISTORY VIEW */}
        {activeNav === 'history' && (
          <HistoryList
            analyses={historyItems}
            onSelectAnalysis={(item) => setActiveAnalysis(item)}
            onStartScan={() => setActiveNav('home')}
          />
        )}

        {/* TAB 3: ABOUT / SAFETY GUIDE */}
        {activeNav === 'about' && (
          <AboutSection onStartScan={() => setActiveNav('home')} />
        )}
      </main>

      {/* REASSURING LOADING OVERLAY */}
      {isLoading && (
        <div className="loading-fullscreen" role="alert" aria-busy="true">
          <div className="loading-shield-pulse">
            <ShieldCheck size={40} color="#60a5fa" />
          </div>
          <div>
            <div className="loading-phase-text">
              {LOADING_PHRASES[loadingPhraseIndex]}
            </div>
            <div className="loading-subtext" style={{ marginTop: '6px' }}>
              TrustVision is evaluating the safety of your input
            </div>
          </div>
        </div>
      )}

      {/* SAFETY REPORT MODAL */}
      {activeAnalysis && (
        <AnalysisResultModal
          result={activeAnalysis}
          onClose={() => setActiveAnalysis(null)}
        />
      )}

      {/* FOOTER TAB NAVIGATION */}
      <nav className="bottom-nav-bar" aria-label="Main Navigation">
        <button
          className={`nav-item-btn ${activeNav === 'home' ? 'active' : ''}`}
          onClick={() => { setActiveNav('home'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
          aria-label="Home safety scanner"
        >
          <Home className="nav-icon-indicator" size={20} />
          <span>Home</span>
        </button>

        <button
          className={`nav-item-btn ${activeNav === 'history' ? 'active' : ''}`}
          onClick={() => { setActiveNav('history'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
          aria-label="Scan history"
        >
          <History className="nav-icon-indicator" size={20} />
          <span>History</span>
        </button>

        <button
          className={`nav-item-btn ${activeNav === 'about' ? 'active' : ''}`}
          onClick={() => { setActiveNav('about'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
          aria-label="Safety tips and about"
        >
          <Info className="nav-icon-indicator" size={20} />
          <span>About</span>
        </button>
      </nav>
    </div>
  );
};

export default HomeDashboard;
