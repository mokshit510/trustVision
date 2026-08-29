import React, { useState, useEffect } from 'react';
import { analyzeText, analyzeImage, analyzeVoice, getAnalyses } from '../services/api.js';
import { Navbar } from '../components/Navbar.jsx';
import { DemoPresets } from '../components/DemoPresets.jsx';
import { ScanInputSection } from '../components/ScanInputSection.jsx';
import { AnalysisResultModal } from '../components/AnalysisResultModal.jsx';
import { HistoryList } from '../components/HistoryList.jsx';
import { HowItWorks } from '../components/HowItWorks.jsx';
import { AboutSection } from '../components/AboutSection.jsx';
import { Home, History, Info, ShieldCheck, AlertCircle, Plus, ArrowRight } from 'lucide-react';

const LOADING_PHRASES = [
  'Inspecting content...',
  'Checking threat indicators...',
  'Evaluating suspicious patterns...',
  'Preparing safety guidance...'
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

  // Cycling multi-step loading phrases
  useEffect(() => {
    let interval = null;
    if (isLoading) {
      setLoadingPhraseIndex(0);
      interval = setInterval(() => {
        setLoadingPhraseIndex((prev) => (prev + 1) % LOADING_PHRASES.length);
      }, 1200);
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
      setErrorMessage("Analysis unavailable. Cloud analysis could not be completed. Please check your connection or retry.");
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
      setErrorMessage("Image inspection failed. Please verify the image file format and try again.");
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
      setErrorMessage("Voice analysis could not be completed. You can type or paste the conversation instead.");
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

  const handleStartNewAnalysis = () => {
    setActiveNav('home');
    setSelectedPreset(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      {/* AMBIENT DYNAMIC BACKGROUND */}
      <div className="app-ambient-bg">
        <div className="ambient-orb ambient-orb-1" />
        <div className="ambient-orb-2" />
      </div>

      <div className="app-container">
        {/* TOP BRAND HEADER */}
        <Navbar
          activeNav={activeNav}
          onNavSelect={(nav) => {
            setActiveNav(nav);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onLogoClick={handleStartNewAnalysis}
        />

        {/* MAIN CONTENT AREA */}
        <main className="app-main">
          {/* CALM ERROR STATE */}
          {errorMessage && (
            <div className="error-banner">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <AlertCircle size={18} style={{ color: '#ef4444', flexShrink: 0 }} />
                <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{errorMessage}</span>
              </div>
              <button className="error-retry-btn" onClick={handleRetry}>
                Try Again
              </button>
            </div>
          )}

          {/* TAB 1: DASHBOARD VIEW */}
          {activeNav === 'home' && (
            <>
              {/* HERO SECTION */}
              <div className="hero-card">
                <div className="hero-pill">
                  <ShieldCheck size={13} />
                  <span>AI Security Platform</span>
                </div>
                <h1 className="hero-headline">Analyze before you trust.</h1>
                <p className="hero-subtext">
                  Check suspicious messages, images, QR codes, and voice notes before taking action.
                </p>

                <div className="hero-cta-row">
                  <button className="btn-primary" style={{ width: 'auto' }} onClick={() => window.scrollTo({ top: 220, behavior: 'smooth' })}>
                    <Plus size={16} />
                    <span>New Analysis</span>
                  </button>
                  {historyItems.length > 0 && (
                    <button className="btn-ghost" onClick={() => setActiveNav('history')}>
                      <span>Recent Activity ({historyItems.length})</span>
                      <ArrowRight size={14} />
                    </button>
                  )}
                </div>
              </div>

              {/* PRIMARY SCANNER WORKSPACE */}
              <ScanInputSection
                onAnalyzeText={handleAnalyzeText}
                onAnalyzeImage={handleAnalyzeImage}
                onAnalyzeVoice={handleAnalyzeVoice}
                isLoading={isLoading}
                selectedPreset={selectedPreset}
                activeTab={activeInputTab}
                onTabChange={(tab) => setActiveInputTab(tab)}
              />

              {/* DEMO SECURITY SCENARIOS */}
              <DemoPresets onSelectPreset={handleSelectPreset} />

              {/* HOW IT WORKS */}
              <HowItWorks />

              {/* RECENT ACTIVITY PREVIEW (IF ANY) */}
              {historyItems.length > 0 && (
                <HistoryList
                  analyses={historyItems.slice(0, 3)}
                  onSelectAnalysis={(item) => setActiveAnalysis(item)}
                  onStartScan={handleStartNewAnalysis}
                />
              )}
            </>
          )}

          {/* TAB 2: FULL ACTIVITY LOG */}
          {activeNav === 'history' && (
            <HistoryList
              analyses={historyItems}
              onSelectAnalysis={(item) => setActiveAnalysis(item)}
              onStartScan={handleStartNewAnalysis}
            />
          )}

          {/* TAB 3: SECURITY GUIDE / ABOUT */}
          {activeNav === 'about' && (
            <AboutSection onStartScan={handleStartNewAnalysis} />
          )}
        </main>

        {/* SOPHISTICATED MULTI-STEP ANALYSIS LOADING OVERLAY */}
        {isLoading && (
          <div className="loading-fullscreen" role="alert" aria-busy="true">
            <div className="loading-radar-ring">
              <ShieldCheck size={28} color="#ffffff" />
            </div>
            <div>
              <div className="loading-title-pill">ANALYZING THREAT VECTORS</div>
              <div className="loading-phase-text">
                {LOADING_PHRASES[loadingPhraseIndex]}
              </div>
              <div className="loading-subtext" style={{ marginTop: '8px' }}>
                Trust Vision is assessing intent, urgency manipulation, and threat markers
              </div>
            </div>
          </div>
        )}

        {/* THREAT ASSESSMENT REPORT MODAL */}
        {activeAnalysis && (
          <AnalysisResultModal
            result={activeAnalysis}
            onClose={() => setActiveAnalysis(null)}
          />
        )}

        {/* MOBILE BOTTOM NAVIGATION */}
        <nav className="bottom-nav-bar" aria-label="Mobile Navigation">
          <button
            className={`nav-item-btn ${activeNav === 'home' ? 'active' : ''}`}
            onClick={() => { setActiveNav('home'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
            aria-label="Home Dashboard"
          >
            <Home className="nav-icon-indicator" size={20} />
            <span>Dashboard</span>
          </button>

          <button
            className={`nav-item-btn ${activeNav === 'history' ? 'active' : ''}`}
            onClick={() => { setActiveNav('history'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
            aria-label="Activity Log"
          >
            <History className="nav-icon-indicator" size={20} />
            <span>Activity</span>
          </button>

          <button
            className={`nav-item-btn ${activeNav === 'about' ? 'active' : ''}`}
            onClick={() => { setActiveNav('about'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
            aria-label="Security Guide"
          >
            <Info className="nav-icon-indicator" size={20} />
            <span>Guide</span>
          </button>
        </nav>
      </div>
    </>
  );
};

export default HomeDashboard;
