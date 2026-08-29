import React, { useState, useRef, useEffect } from 'react';
import {
  MessageSquare,
  Image as ImageIcon,
  Mic,
  Upload,
  Square,
  ShieldCheck,
  X,
  FileAudio,
  CheckCircle2,
  AlertCircle,
  Camera,
  QrCode,
  ArrowRight,
  RotateCcw
} from 'lucide-react';
import { CameraModal } from './CameraModal.jsx';

export const ScanInputSection = ({
  onAnalyzeText,
  onAnalyzeImage,
  onAnalyzeVoice,
  isLoading,
  selectedPreset = null,
  activeTab: controlledTab,
  onTabChange
}) => {
  const [activeTab, setActiveTab] = useState('text');
  const [inputText, setInputText] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  // Camera & QR Scanner modal state
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [cameraInitialMode, setCameraInitialMode] = useState('select');

  // Audio recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [audioBlob, setAudioBlob] = useState(null);
  const mediaRecorderRef = useRef(null);
  const timerRef = useRef(null);
  const fileInputRef = useRef(null);
  const audioInputRef = useRef(null);

  // Sync tab if controlled externally
  useEffect(() => {
    if (controlledTab && controlledTab !== activeTab) {
      setActiveTab(controlledTab);
    }
  }, [controlledTab]);

  // Sync selected preset
  useEffect(() => {
    if (selectedPreset) {
      if (selectedPreset.modality) {
        setActiveTab(selectedPreset.modality);
        if (onTabChange) onTabChange(selectedPreset.modality);
      }
      setInputText(selectedPreset.inputContent || '');
      setSelectedFile(null);
      setPreviewUrl(null);
      setAudioBlob(null);
    }
  }, [selectedPreset]);

  // Clean up recording timer
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const handleTabSelect = (tab) => {
    setActiveTab(tab);
    if (onTabChange) onTabChange(tab);
  };

  const handleImageFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      if (file.type.startsWith('image/')) {
        setPreviewUrl(URL.createObjectURL(file));
      }
    }
  };

  const handleAudioFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setAudioBlob(null);
    }
  };

  const clearSelectedFile = () => {
    setSelectedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (audioInputRef.current) audioInputRef.current.value = '';
  };

  // Camera / QR modal handlers
  const handleOpenScanner = (initialMode = 'select') => {
    setCameraInitialMode(initialMode);
    setIsCameraOpen(true);
  };

  const handlePhotoCaptured = (file, fileUrl) => {
    setSelectedFile(file);
    setPreviewUrl(fileUrl);
    setActiveTab('image');
    if (onTabChange) onTabChange('image');
  };

  const handleQrDetected = (qrData) => {
    console.log('QR Code detected:', qrData);
  };

  const handleCheckQrText = (qrText) => {
    setActiveTab('text');
    setInputText(qrText);
    if (onTabChange) onTabChange('text');
    if (onAnalyzeText) {
      onAnalyzeText(qrText);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      const chunks = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        setAudioBlob(blob);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingSeconds(0);

      timerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.error('Mic permission denied or error:', err);
      alert('Could not access microphone. Please check your browser microphone permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const handleTextSubmit = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    onAnalyzeText(inputText);
  };

  const handleImageSubmit = (e) => {
    e.preventDefault();
    if (!selectedFile) return;
    onAnalyzeImage(selectedFile, inputText);
  };

  const handleVoiceSubmit = (e) => {
    e.preventDefault();
    if (audioBlob) {
      const audioFile = new File([audioBlob], 'voicenote.webm', { type: 'audio/webm' });
      onAnalyzeVoice(audioFile, inputText);
    } else if (selectedFile) {
      onAnalyzeVoice(selectedFile, inputText);
    } else if (inputText.trim()) {
      onAnalyzeText(inputText);
    }
  };

  return (
    <section className="input-choices-container" aria-label="Threat Analysis Workspace">
      <div className="section-title-wrap">
        <h3 className="section-title">
          <span>Choose Analysis Mode</span>
        </h3>
        <span className="section-subtitle">Select input format</span>
      </div>

      {/* THREE CHOICES GRID */}
      <div className="choice-tabs-grid" role="tablist">
        <button
          className={`choice-tab-card ${activeTab === 'text' ? 'active' : ''}`}
          onClick={() => handleTabSelect('text')}
          role="tab"
          aria-selected={activeTab === 'text'}
        >
          <div className="choice-tab-icon">
            <MessageSquare size={18} />
          </div>
          <span className="choice-tab-title">Message</span>
          <span className="choice-tab-desc">SMS & text</span>
        </button>

        <button
          className={`choice-tab-card ${activeTab === 'image' ? 'active' : ''}`}
          onClick={() => handleTabSelect('image')}
          role="tab"
          aria-selected={activeTab === 'image'}
        >
          <div className="choice-tab-icon">
            <ImageIcon size={18} />
          </div>
          <span className="choice-tab-title">Image / QR</span>
          <span className="choice-tab-desc">Screenshots & bills</span>
        </button>

        <button
          className={`choice-tab-card ${activeTab === 'voice' ? 'active' : ''}`}
          onClick={() => handleTabSelect('voice')}
          role="tab"
          aria-selected={activeTab === 'voice'}
        >
          <div className="choice-tab-icon">
            <Mic size={18} />
          </div>
          <span className="choice-tab-title">Voice Note</span>
          <span className="choice-tab-desc">Calls & audio</span>
        </button>
      </div>

      {/* ACTIVE SCANNER WORKSPACE */}
      <div className="active-scanner-box">
        {/* 1. TEXT INPUT WORKSPACE */}
        {activeTab === 'text' && (
          <form onSubmit={handleTextSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div className="scanner-header-info">
              <MessageSquare size={18} className="scanner-header-icon" />
              <div className="scanner-header-text">
                <h3>Suspicious Message or Link</h3>
                <p>Paste an SMS, email, WhatsApp message, or payment notice</p>
              </div>
            </div>

            <textarea
              className="text-input-field"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="e.g. 'Your bank account is suspended. Click here to verify your KYC details within 30 minutes...'"
              rows={4}
              aria-label="Message content to analyze"
            />

            <button
              type="submit"
              className="btn-primary"
              disabled={!inputText.trim() || isLoading}
            >
              <ShieldCheck size={18} />
              <span>{isLoading ? 'Inspecting...' : 'Analyze Message'}</span>
            </button>
          </form>
        )}

        {/* 2. IMAGE & SCREENSHOT WORKSPACE */}
        {activeTab === 'image' && (
          <form onSubmit={handleImageSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div className="scanner-header-info">
              <ImageIcon size={18} className="scanner-header-icon" />
              <div className="scanner-header-text">
                <h3>Screenshot, Bill or QR Code</h3>
                <p>Upload a screenshot or capture a photo with your camera</p>
              </div>
            </div>

            {!previewUrl ? (
              <div className="image-input-container">
                {/* CAMERA QUICK TRIGGER */}
                <button
                  type="button"
                  className="btn-camera-trigger"
                  onClick={() => handleOpenScanner('select')}
                >
                  <div className="camera-trigger-content">
                    <div className="camera-trigger-icon-wrap">
                      <Camera size={18} />
                    </div>
                    <div className="camera-trigger-text">
                      <span className="camera-trigger-main">Scan / Take Photo</span>
                      <span className="camera-trigger-sub">Use your camera to snap a screen or scan a QR code</span>
                    </div>
                  </div>
                  <ArrowRight size={18} style={{ color: 'var(--text-muted)' }} />
                </button>

                <div className="upload-divider">
                  <span>OR UPLOAD FILE</span>
                </div>

                {/* DROPZONE */}
                <div
                  className="file-dropzone"
                  onClick={() => fileInputRef.current && fileInputRef.current.click()}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') fileInputRef.current && fileInputRef.current.click(); }}
                >
                  <div className="dropzone-icon-circle">
                    <Upload size={20} />
                  </div>
                  <div>
                    <h4 style={{ fontSize: '13.5px', fontWeight: 700, color: '#ffffff' }}>
                      Choose an image or screenshot
                    </h4>
                    <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                      PNG, JPG, or WEBP (up to 10MB)
                    </p>
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageFileChange}
                    style={{ display: 'none' }}
                  />
                </div>
              </div>
            ) : (
              /* PREVIEW SELECTED IMAGE */
              <div className="image-preview-wrapper">
                <div className="preview-action-overlay-bar">
                  <button
                    type="button"
                    className="preview-secondary-btn"
                    onClick={() => handleOpenScanner('camera')}
                  >
                    <RotateCcw size={13} />
                    <span>Retake</span>
                  </button>
                  <button
                    type="button"
                    className="preview-clear-btn"
                    onClick={clearSelectedFile}
                  >
                    <X size={13} />
                    <span>Remove</span>
                  </button>
                </div>

                <img src={previewUrl} alt="Inspection preview" />

                <div style={{ padding: '8px 12px', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border-subtle)', background: 'var(--surface-secondary)' }}>
                  <span style={{ fontSize: '12px', color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '300px' }}>
                    {selectedFile?.name || 'Captured photo'}
                  </span>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Ready for scan</span>
                </div>
              </div>
            )}

            {/* OPTIONAL CONTEXT */}
            <input
              type="text"
              className="text-input-field"
              style={{ minHeight: '44px', padding: '10px 14px', fontSize: '13px' }}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Optional: Add any extra context about where you saw this"
            />

            <button
              type="submit"
              className="btn-primary"
              disabled={!selectedFile || isLoading}
            >
              <ShieldCheck size={18} />
              <span>{isLoading ? 'Inspecting Screenshot...' : 'Analyze Image'}</span>
            </button>
          </form>
        )}

        {/* 3. VOICE NOTE WORKSPACE */}
        {activeTab === 'voice' && (
          <form onSubmit={handleVoiceSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div className="scanner-header-info">
              <Mic size={18} className="scanner-header-icon" />
              <div className="scanner-header-text">
                <h3>Suspicious Call or Voice Note</h3>
                <p>Record a voice clip or upload an audio recording of a call</p>
              </div>
            </div>

            <div className="voice-recorder-card">
              {!isRecording ? (
                <button
                  type="button"
                  className="mic-action-btn"
                  onClick={startRecording}
                  aria-label="Start recording voice note"
                >
                  <Mic size={28} />
                </button>
              ) : (
                <button
                  type="button"
                  className="mic-action-btn recording"
                  onClick={stopRecording}
                  aria-label="Stop recording"
                >
                  <Square size={24} />
                </button>
              )}

              <div>
                {isRecording ? (
                  <div className="recording-status-text">
                    Recording: {Math.floor(recordingSeconds / 60)}:{String(recordingSeconds % 60).padStart(2, '0')} (Tap to stop)
                  </div>
                ) : audioBlob ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#34d399', fontSize: '13px', fontWeight: 600 }}>
                    <CheckCircle2 size={16} />
                    <span>Voice Note Ready ({Math.floor(recordingSeconds / 60)}:{String(recordingSeconds % 60).padStart(2, '0')})</span>
                  </div>
                ) : (
                  <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                    Tap microphone to record suspicious conversation
                  </span>
                )}
              </div>

              {/* OR UPLOAD AUDIO */}
              {!audioBlob && (
                <div style={{ marginTop: '8px' }}>
                  <button
                    type="button"
                    className="btn-ghost"
                    onClick={() => audioInputRef.current && audioInputRef.current.click()}
                  >
                    <FileAudio size={15} />
                    <span>Upload Audio File</span>
                  </button>
                  <input
                    ref={audioInputRef}
                    type="file"
                    accept="audio/*"
                    onChange={handleAudioFileChange}
                    style={{ display: 'none' }}
                  />
                </div>
              )}

              {selectedFile && !audioBlob && (
                <div className="audio-file-row">
                  <span style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>
                    {selectedFile.name}
                  </span>
                  <button
                    type="button"
                    onClick={clearSelectedFile}
                    style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}
                  >
                    <X size={14} />
                  </button>
                </div>
              )}
            </div>

            <button
              type="submit"
              className="btn-primary"
              disabled={(!audioBlob && !selectedFile && !inputText.trim()) || isLoading}
            >
              <ShieldCheck size={18} />
              <span>{isLoading ? 'Analyzing Audio...' : 'Analyze Voice Note'}</span>
            </button>
          </form>
        )}
      </div>

      {/* CAMERA & QR SCANNER MODAL */}
      <CameraModal
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onPhotoCaptured={handlePhotoCaptured}
        onQrDetected={handleQrDetected}
        onCheckQrText={handleCheckQrText}
        initialMode={cameraInitialMode}
      />
    </section>
  );
};

export default ScanInputSection;
