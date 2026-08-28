import React, { useState, useRef, useEffect } from 'react';
import {
  MessageSquare,
  Image as ImageIcon,
  Mic,
  Upload,
  Square,
  Sparkles,
  ShieldCheck,
  X,
  FileAudio,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

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
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (audioInputRef.current) audioInputRef.current.value = '';
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
      setSelectedFile(null);

      timerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      alert('Microphone access was denied or is not supported. You can upload an audio file directly below.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };

  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleCheckAction = () => {
    if (isLoading) return;

    if (activeTab === 'text') {
      if (!inputText.trim()) {
        alert('Please paste or type the suspicious message you want to check.');
        return;
      }
      onAnalyzeText(inputText);
    } else if (activeTab === 'image') {
      if (selectedFile) {
        onAnalyzeImage(selectedFile, inputText);
      } else if (inputText) {
        onAnalyzeImage(undefined, inputText);
      } else {
        alert('Please choose or upload a screenshot to check.');
      }
    } else if (activeTab === 'voice') {
      if (audioBlob) {
        const file = new File([audioBlob], 'voice-recording.webm', { type: 'audio/webm' });
        onAnalyzeVoice(file, inputText);
      } else if (selectedFile) {
        onAnalyzeVoice(selectedFile, inputText);
      } else if (inputText) {
        onAnalyzeVoice(undefined, inputText);
      } else {
        alert('Please record a voice note or choose an audio file to check.');
      }
    }
  };

  return (
    <div className="input-choices-container">
      {/* 3 LARGE OBVIOUS INPUT CHOICES */}
      <div className="choice-tabs-grid" role="tablist" aria-label="Input type selector">
        {/* OPTION 1: MESSAGE */}
        <div
          className={`choice-tab-card ${activeTab === 'text' ? 'active' : ''}`}
          onClick={() => handleTabSelect('text')}
          role="tab"
          aria-selected={activeTab === 'text'}
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleTabSelect('text'); }}
        >
          <div className="choice-tab-icon">💬</div>
          <span className="choice-tab-title">Check a Message</span>
          <span className="choice-tab-desc">Paste an SMS, email, or chat</span>
        </div>

        {/* OPTION 2: SCREENSHOT */}
        <div
          className={`choice-tab-card ${activeTab === 'image' ? 'active' : ''}`}
          onClick={() => handleTabSelect('image')}
          role="tab"
          aria-selected={activeTab === 'image'}
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleTabSelect('image'); }}
        >
          <div className="choice-tab-icon">🖼️</div>
          <span className="choice-tab-title">Check a Screenshot</span>
          <span className="choice-tab-desc">Upload a suspicious image</span>
        </div>

        {/* OPTION 3: VOICE NOTE */}
        <div
          className={`choice-tab-card ${activeTab === 'voice' ? 'active' : ''}`}
          onClick={() => handleTabSelect('voice')}
          role="tab"
          aria-selected={activeTab === 'voice'}
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleTabSelect('voice'); }}
        >
          <div className="choice-tab-icon">🎙️</div>
          <span className="choice-tab-title">Check a Voice Note</span>
          <span className="choice-tab-desc">Record or upload a call</span>
        </div>
      </div>

      {/* ACTIVE SCANNER WORKSPACE */}
      <div className="active-scanner-box">
        {/* MESSAGE SCANNER TAB */}
        {activeTab === 'text' && (
          <>
            <div className="scanner-header-info">
              <MessageSquare className="scanner-header-icon" size={20} />
              <div className="scanner-header-text">
                <h3>Paste your message</h3>
                <p>Paste any suspicious SMS, WhatsApp message, email, or payment link</p>
              </div>
            </div>

            <textarea
              className="text-input-field"
              placeholder="e.g. 'Your bank account will be blocked within 30 minutes! Click here to verify KYC...'"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              aria-label="Suspicious message text"
              rows={4}
            />

            <button
              className="btn-primary"
              onClick={handleCheckAction}
              disabled={isLoading}
            >
              <ShieldCheck size={20} />
              <span>Check this message</span>
            </button>
          </>
        )}

        {/* SCREENSHOT SCANNER TAB */}
        {activeTab === 'image' && (
          <>
            <div className="scanner-header-info">
              <ImageIcon className="scanner-header-icon" size={20} />
              <div className="scanner-header-text">
                <h3>Upload a screenshot</h3>
                <p>Take a photo or upload a screenshot of a suspicious chat, payment app, or email</p>
              </div>
            </div>

            {previewUrl ? (
              <div className="image-preview-wrapper">
                <img src={previewUrl} alt="Screenshot to check" />
                <button
                  className="preview-clear-btn"
                  onClick={clearSelectedFile}
                  title="Remove image"
                  type="button"
                >
                  <X size={14} /> Remove Image
                </button>
              </div>
            ) : (
              <label className="file-dropzone" tabIndex={0}>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageFileChange}
                  style={{ display: 'none' }}
                />
                <div className="dropzone-icon-circle">
                  <Upload size={24} />
                </div>
                <div>
                  <div style={{ fontSize: '14.5px', fontWeight: 700, color: '#ffffff', marginBottom: '2px' }}>
                    Tap to upload screenshot
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    Supports PNG, JPG, JPEG, WEBP photos
                  </div>
                </div>
              </label>
            )}

            {/* If preset text was loaded */}
            {inputText && (
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', backgroundColor: 'var(--surface-container-lowest)', padding: '8px 12px', borderRadius: 'var(--radius-sm)' }}>
                <strong>Demo content attached: </strong> {inputText}
              </div>
            )}

            <button
              className="btn-primary"
              onClick={handleCheckAction}
              disabled={isLoading}
            >
              <ShieldCheck size={20} />
              <span>Check this screenshot</span>
            </button>
          </>
        )}

        {/* VOICE NOTE SCANNER TAB */}
        {activeTab === 'voice' && (
          <>
            <div className="scanner-header-info">
              <Mic className="scanner-header-icon" size={20} />
              <div className="scanner-header-text">
                <h3>Record or upload a call</h3>
                <p>Record a suspicious caller or upload an audio note</p>
              </div>
            </div>

            <div className="voice-recorder-card">
              {isRecording ? (
                <>
                  <button
                    type="button"
                    className="mic-action-btn recording"
                    onClick={stopRecording}
                    title="Stop recording"
                    aria-label="Stop recording"
                  >
                    <Square size={28} />
                  </button>
                  <div className="recording-status-text">
                    <span>🔴 Recording: {formatTimer(recordingSeconds)}</span>
                  </div>
                  <span style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>
                    Tap the red button when finished speaking
                  </span>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    className="mic-action-btn"
                    onClick={startRecording}
                    title="Start recording"
                    aria-label="Start recording"
                  >
                    <Mic size={30} />
                  </button>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <span style={{ fontSize: '15px', fontWeight: 700, color: '#ffffff' }}>
                      {audioBlob ? '✓ Voice Note Recorded' : 'Tap to Record Voice Note'}
                    </span>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                      {audioBlob ? 'Ready to check for scam signs' : 'Speak or play the suspicious call'}
                    </span>
                  </div>

                  <div className="audio-file-row">
                    <label className="btn-secondary" style={{ cursor: 'pointer', width: 'auto', minHeight: '38px', fontSize: '13px' }}>
                      <FileAudio size={16} />
                      <span>{selectedFile ? `File: ${selectedFile.name.substring(0, 18)}...` : 'Or upload audio file'}</span>
                      <input
                        ref={audioInputRef}
                        type="file"
                        accept="audio/*"
                        onChange={handleAudioFileChange}
                        style={{ display: 'none' }}
                      />
                    </label>

                    {(audioBlob || selectedFile) && (
                      <button
                        type="button"
                        className="btn-secondary"
                        onClick={() => { setAudioBlob(null); clearSelectedFile(); }}
                        style={{ width: 'auto', minHeight: '38px', padding: '0 12px' }}
                        title="Clear audio"
                      >
                        <X size={15} />
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* If preset text was loaded */}
            {inputText && (
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', backgroundColor: 'var(--surface-container-lowest)', padding: '8px 12px', borderRadius: 'var(--radius-sm)' }}>
                <strong>Demo audio script: </strong> {inputText}
              </div>
            )}

            <button
              className="btn-primary"
              onClick={handleCheckAction}
              disabled={isLoading || isRecording}
            >
              <ShieldCheck size={20} />
              <span>Check this voice note</span>
            </button>
          </>
        )}
      </div>
    </div>
  );
};
