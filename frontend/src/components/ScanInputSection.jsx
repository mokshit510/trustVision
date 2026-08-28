import React, { useState, useRef } from 'react';
import { MessageSquare, Camera, Mic, Upload, Play, Square, RefreshCw, Send } from 'lucide-react';

export const ScanInputSection = ({
  onAnalyzeText,
  onAnalyzeImage,
  onAnalyzeVoice,
  isLoading,
  selectedText = ''
}) => {
  const [activeTab, setActiveTab] = useState('text');
  const [inputText, setInputText] = useState(selectedText);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  // Audio recording state
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const mediaRecorderRef = useRef(null);

  // Sync selectedText when preset is clicked
  React.useEffect(() => {
    if (selectedText) {
      setInputText(selectedText);
    }
  }, [selectedText]);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);

      if (file.type.startsWith('image/')) {
        setPreviewUrl(URL.createObjectURL(file));
      }
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
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      alert('Microphone access unavailable or denied. You can upload an audio file directly.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleSubmit = () => {
    if (isLoading) return;

    if (activeTab === 'text') {
      if (!inputText.trim()) return alert('Please enter message text to analyze.');
      onAnalyzeText(inputText);
    } else if (activeTab === 'image') {
      if (selectedFile) {
        onAnalyzeImage(selectedFile);
      } else if (inputText) {
        onAnalyzeImage(undefined, inputText);
      } else {
        alert('Please select an image file or capture a screenshot.');
      }
    } else if (activeTab === 'voice') {
      if (audioBlob) {
        const file = new File([audioBlob], 'voice-recording.webm', { type: 'audio/webm' });
        onAnalyzeVoice(file);
      } else if (selectedFile) {
        onAnalyzeVoice(selectedFile);
      } else if (inputText) {
        onAnalyzeVoice(undefined, inputText);
      } else {
        alert('Please record a voice note or select an audio file.');
      }
    }
  };

  return (
    <div className="card-container">
      <div className="tab-switcher">
        <button
          className={`tab-btn ${activeTab === 'text' ? 'active' : ''}`}
          onClick={() => setActiveTab('text')}
        >
          <MessageSquare size={16} />
          <span>Text</span>
        </button>
        <button
          className={`tab-btn ${activeTab === 'image' ? 'active' : ''}`}
          onClick={() => setActiveTab('image')}
        >
          <Camera size={16} />
          <span>Camera / Image</span>
        </button>
        <button
          className={`tab-btn ${activeTab === 'voice' ? 'active' : ''}`}
          onClick={() => setActiveTab('voice')}
        >
          <Mic size={16} />
          <span>Voice Note</span>
        </button>
      </div>

      {/* TEXT TAB */}
      {activeTab === 'text' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <textarea
            className="text-input-area"
            placeholder="Paste suspicious SMS, email, message link, or payment request..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
          />
        </div>
      )}

      {/* CAMERA / IMAGE TAB */}
      {activeTab === 'image' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <label className="media-input-box">
            <input
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />
            {previewUrl ? (
              <img
                src={previewUrl}
                alt="Upload preview"
                style={{ width: '100%', maxHeight: '160px', objectFit: 'contain', borderRadius: '8px' }}
              />
            ) : (
              <>
                <div className="media-icon-wrapper">
                  <Camera size={24} />
                </div>
                <span style={{ fontSize: '14px', fontWeight: 600, color: '#ffffff' }}>
                  Tap to Take Photo or Upload Screenshot
                </span>
                <span style={{ fontSize: '12px', color: 'var(--text-on-surface-variant)' }}>
                  Supports PNG, JPG, WEBP formats
                </span>
              </>
            )}
          </label>

          {selectedFile && (
            <span style={{ fontSize: '12px', color: '#81c784', textAlign: 'center' }}>
              ✓ File selected: {selectedFile.name}
            </span>
          )}
        </div>
      )}

      {/* VOICE NOTE TAB */}
      {activeTab === 'voice' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div className="media-input-box" style={{ cursor: 'default' }}>
            <div className="media-icon-wrapper" style={{ backgroundColor: isRecording ? 'rgba(239, 68, 68, 0.2)' : undefined, color: isRecording ? '#ef4444' : undefined }}>
              <Mic size={24} />
            </div>

            {isRecording ? (
              <>
                <span style={{ fontSize: '14px', fontWeight: 600, color: '#ef4444' }}>
                  🎙️ Recording Voice Note...
                </span>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={stopRecording}
                  style={{ width: 'auto', padding: '0 20px', borderColor: '#ef4444', color: '#ef4444' }}
                >
                  <Square size={16} /> Stop Recording
                </button>
              </>
            ) : (
              <>
                <span style={{ fontSize: '14px', fontWeight: 600, color: '#ffffff' }}>
                  Record Call or Upload Audio Note
                </span>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={startRecording}
                    style={{ width: 'auto', padding: '0 16px' }}
                  >
                    <Play size={16} /> Record Mic
                  </button>
                  <label className="btn-secondary" style={{ width: 'auto', padding: '0 16px', cursor: 'pointer' }}>
                    <Upload size={16} /> Upload Audio
                    <input
                      type="file"
                      accept="audio/*"
                      onChange={handleFileChange}
                      style={{ display: 'none' }}
                    />
                  </label>
                </div>
              </>
            )}
          </div>

          {audioBlob && (
            <span style={{ fontSize: '12px', color: '#81c784', textAlign: 'center' }}>
              ✓ Voice recording captured successfully.
            </span>
          )}
        </div>
      )}

      {/* SUBMIT BUTTON */}
      <button
        className="btn-primary"
        onClick={handleSubmit}
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <RefreshCw size={18} className="spinner" style={{ width: '18px', height: '18px', borderWidth: '2px' }} />
            <span>Analyzing Security Threats...</span>
          </>
        ) : (
          <>
            <Send size={18} />
            <span>Scan & Analyze Input</span>
          </>
        )}
      </button>
    </div>
  );
};
