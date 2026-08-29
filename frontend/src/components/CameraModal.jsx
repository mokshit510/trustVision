import React, { useState, useRef, useEffect, useCallback } from 'react';
import jsQR from 'jsqr';
import {
  Camera,
  QrCode,
  X,
  RotateCcw,
  Check,
  Zap,
  ZapOff,
  SwitchCamera,
  AlertCircle,
  Copy,
  ExternalLink,
  ShieldCheck,
  RefreshCw,
  Sparkles
} from 'lucide-react';

export const CameraModal = ({
  isOpen,
  onClose,
  onPhotoCaptured,
  onQrDetected,
  onCheckQrText,
  initialMode = null
}) => {
  // Modal states: 'select' | 'camera' | 'qr'
  const [mode, setMode] = useState(initialMode || 'select');
  const [stream, setStream] = useState(null);
  const [facingMode, setFacingMode] = useState('environment'); // 'environment' (rear) or 'user' (front)
  const [hasMultipleCameras, setHasMultipleCameras] = useState(false);
  const [isTorchOn, setIsTorchOn] = useState(false);
  const [hasTorch, setHasTorch] = useState(false);
  const [errorState, setErrorState] = useState(null);
  const [capturedPhotoUrl, setCapturedPhotoUrl] = useState(null);
  const [capturedBlob, setCapturedBlob] = useState(null);
  const [qrResult, setQrResult] = useState(null);
  const [copied, setCopied] = useState(false);
  const [isScanning, setIsScanning] = useState(false);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const animationFrameRef = useRef(null);
  const barcodeDetectorRef = useRef(null);

  // Initialize BarcodeDetector if available in browser
  useEffect(() => {
    if ('BarcodeDetector' in window) {
      try {
        barcodeDetectorRef.current = new window.BarcodeDetector({ formats: ['qr_code'] });
      } catch (err) {
        barcodeDetectorRef.current = null;
      }
    }
  }, []);

  // Check for multiple video devices (front/back)
  const checkCameraDevices = useCallback(async () => {
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoInputs = devices.filter((device) => device.kind === 'videoinput');
        setHasMultipleCameras(videoInputs.length > 1);
      }
    } catch (err) {
      setHasMultipleCameras(false);
    }
  }, []);

  // Stop camera tracks cleanly
  const stopCamera = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (stream) {
      stream.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch (e) {
          // ignore
        }
      });
      setStream(null);
    }
    setIsTorchOn(false);
    setHasTorch(false);
    setIsScanning(false);
  }, [stream]);

  // Start camera stream
  const startCamera = useCallback(
    async (targetFacingMode = facingMode) => {
      stopCamera();
      setErrorState(null);
      setCapturedPhotoUrl(null);
      setCapturedBlob(null);

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setErrorState({
          type: 'unsupported',
          message: 'Your browser or device does not support direct camera access.'
        });
        return;
      }

      try {
        const constraints = {
          audio: false,
          video: {
            facingMode: { ideal: targetFacingMode },
            width: { ideal: 1920, min: 640 },
            height: { ideal: 1080, min: 480 }
          }
        };

        const newStream = await navigator.mediaDevices.getUserMedia(constraints);
        setStream(newStream);

        // Check if track supports torch
        const videoTrack = newStream.getVideoTracks()[0];
        if (videoTrack) {
          const capabilities = typeof videoTrack.getCapabilities === 'function' ? videoTrack.getCapabilities() : {};
          if (capabilities.torch) {
            setHasTorch(true);
          }
        }

        checkCameraDevices();
      } catch (err) {
        console.error('Camera access error:', err);
        let errorMsg = 'Could not access camera.';
        if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
          errorMsg = 'Camera permission was denied. Please allow camera permissions in your browser or device settings to use this feature.';
        } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
          errorMsg = 'No camera device found on this system.';
        } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
          errorMsg = 'Camera is already in use by another application or tab.';
        } else if (err.name === 'OverconstrainedError') {
          // Fallback to any camera without facingMode constraint
          try {
            const fallbackStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
            setStream(fallbackStream);
            return;
          } catch (fallbackErr) {
            errorMsg = 'Could not configure camera with the requested settings.';
          }
        }
        setErrorState({ type: err.name, message: errorMsg });
      }
    },
    [facingMode, stopCamera, checkCameraDevices]
  );

  // Toggle Torch/Flashlight
  const toggleTorch = async () => {
    if (!stream) return;
    const videoTrack = stream.getVideoTracks()[0];
    if (videoTrack && typeof videoTrack.applyConstraints === 'function') {
      try {
        const nextTorch = !isTorchOn;
        await videoTrack.applyConstraints({
          advanced: [{ torch: nextTorch }]
        });
        setIsTorchOn(nextTorch);
      } catch (err) {
        console.warn('Torch toggle failed:', err);
      }
    }
  };

  // Flip Front/Rear Camera
  const switchCameraFacing = () => {
    const nextFacing = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(nextFacing);
    startCamera(nextFacing);
  };

  // Attach stream to <video> when stream or mode changes
  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
      videoRef.current
        .play()
        .then(() => {
          if (mode === 'qr') {
            setIsScanning(true);
          }
        })
        .catch((err) => console.warn('Video play error:', err));
    }
  }, [stream, mode]);

  // Handle mode transitions and initial startup
  useEffect(() => {
    if (isOpen) {
      if (initialMode && initialMode !== 'select') {
        setMode(initialMode);
        startCamera();
      } else {
        setMode('select');
      }
      setQrResult(null);
      setCapturedPhotoUrl(null);
      setCapturedBlob(null);
      setErrorState(null);
    } else {
      stopCamera();
      setMode('select');
    }

    return () => {
      stopCamera();
    };
  }, [isOpen, initialMode]);

  // QR Code Scanning Loop
  const handleQrDetected = useCallback(
    (data) => {
      stopCamera();
      setQrResult(data);
      if (onQrDetected) {
        onQrDetected(data);
      }
    },
    [stopCamera, onQrDetected]
  );

  useEffect(() => {
    if (mode !== 'qr' || !isScanning || !stream || qrResult) return;

    let isActive = true;

    const scanFrame = async () => {
      if (!isActive || !videoRef.current) return;

      const video = videoRef.current;
      if (video.readyState === video.HAVE_ENOUGH_DATA) {
        // 1. Try Native BarcodeDetector first (faster, hardware-accelerated)
        if (barcodeDetectorRef.current) {
          try {
            const barcodes = await barcodeDetectorRef.current.detect(video);
            if (barcodes && barcodes.length > 0 && barcodes[0].rawValue) {
              handleQrDetected(barcodes[0].rawValue);
              return;
            }
          } catch (e) {
            // fallback to jsQR below
          }
        }

        // 2. Fallback to jsQR via canvas
        try {
          const canvas = canvasRef.current || document.createElement('canvas');
          const context = canvas.getContext('2d', { willReadFrequently: true });
          if (context && video.videoWidth > 0 && video.videoHeight > 0) {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            context.drawImage(video, 0, 0, canvas.width, canvas.height);
            const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
            const code = jsQR(imageData.data, imageData.width, imageData.height, {
              inversionAttempts: 'attemptBoth'
            });

            if (code && code.data && code.data.trim().length > 0) {
              handleQrDetected(code.data);
              return;
            }
          }
        } catch (err) {
          // Frame read error
        }
      }

      if (isActive && mode === 'qr') {
        animationFrameRef.current = requestAnimationFrame(scanFrame);
      }
    };

    animationFrameRef.current = requestAnimationFrame(scanFrame);

    return () => {
      isActive = false;
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [mode, isScanning, stream, qrResult, handleQrDetected]);

  // Capture Photo
  const handleCapturePhoto = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(
      (blob) => {
        if (blob) {
          const fileUrl = URL.createObjectURL(blob);
          setCapturedPhotoUrl(fileUrl);
          setCapturedBlob(blob);
          // Pause camera tracks while reviewing
          if (stream) {
            stream.getVideoTracks().forEach((t) => (t.enabled = false));
          }
        }
      },
      'image/jpeg',
      0.95
    );
  };

  // Retake Photo
  const handleRetakePhoto = () => {
    if (capturedPhotoUrl) {
      URL.revokeObjectURL(capturedPhotoUrl);
    }
    setCapturedPhotoUrl(null);
    setCapturedBlob(null);
    if (stream) {
      stream.getVideoTracks().forEach((t) => (t.enabled = true));
    } else {
      startCamera();
    }
  };

  // Confirm and Use Captured Photo
  const handleUseCapturedPhoto = () => {
    if (capturedBlob) {
      const fileName = `camera-capture-${Date.now()}.jpg`;
      const file = new File([capturedBlob], fileName, { type: 'image/jpeg' });
      stopCamera();
      if (onPhotoCaptured) {
        onPhotoCaptured(file, capturedPhotoUrl);
      }
      onClose();
    }
  };

  // Close Modal Handler
  const handleClose = () => {
    stopCamera();
    if (capturedPhotoUrl) {
      URL.revokeObjectURL(capturedPhotoUrl);
    }
    setCapturedPhotoUrl(null);
    setCapturedBlob(null);
    setQrResult(null);
    setErrorState(null);
    onClose();
  };

  // Copy QR text to clipboard
  const handleCopyQr = () => {
    if (qrResult) {
      navigator.clipboard.writeText(qrResult).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }
  };

  // Check QR Code Safety Action
  const handleCheckQrSafety = () => {
    if (qrResult) {
      const textToCheck = qrResult;
      handleClose();
      if (onCheckQrText) {
        onCheckQrText(textToCheck);
      }
    }
  };

  if (!isOpen) return null;

  const isUrl = (str) => {
    try {
      const url = new URL(str);
      return url.protocol === 'http:' || url.protocol === 'https:';
    } catch {
      return false;
    }
  };

  return (
    <div className="modal-overlay camera-modal-overlay" role="dialog" aria-modal="true" aria-labelledby="camera-modal-title">
      <div className="modal-window camera-modal-window">
        {/* HEADER BAR */}
        <div className="modal-header-bar">
          <div className="modal-header-title" id="camera-modal-title">
            <span style={{ fontSize: '18px' }}>
              {mode === 'camera' ? '📸' : mode === 'qr' ? '🔍' : '📷'}
            </span>
            <span>
              {mode === 'camera'
                ? 'Take a Photo'
                : mode === 'qr'
                ? 'Scan QR Code'
                : 'Camera & Scanner'}
            </span>
          </div>

          <button className="modal-close-btn" onClick={handleClose} aria-label="Close camera modal">
            <X size={20} />
          </button>
        </div>

        {/* MODAL BODY */}
        <div className="camera-modal-body">
          {/* 1. SELECTION SCREEN */}
          {mode === 'select' && (
            <div className="camera-select-grid">
              <button
                type="button"
                className="camera-choice-card"
                onClick={() => {
                  setMode('camera');
                  startCamera();
                }}
              >
                <div className="camera-choice-icon-wrap photo-theme">
                  <Camera size={32} />
                </div>
                <div className="camera-choice-text">
                  <h4>Take Photo</h4>
                  <p>Snap a photo of a suspicious message, screen, or bill with your camera</p>
                </div>
              </button>

              <button
                type="button"
                className="camera-choice-card"
                onClick={() => {
                  setMode('qr');
                  startCamera();
                }}
              >
                <div className="camera-choice-icon-wrap qr-theme">
                  <QrCode size={32} />
                </div>
                <div className="camera-choice-text">
                  <h4>Scan QR Code</h4>
                  <p>Scan a QR code to detect suspicious links, fake payment codes, or scams</p>
                </div>
              </button>
            </div>
          )}

          {/* 2. ERROR STATE */}
          {errorState && (
            <div className="camera-error-container">
              <div className="camera-error-icon">
                <AlertCircle size={44} />
              </div>
              <h3 className="camera-error-title">Camera Access Required</h3>
              <p className="camera-error-desc">{errorState.message}</p>

              <div className="camera-error-actions">
                <button
                  type="button"
                  className="btn-primary"
                  onClick={() => startCamera()}
                  style={{ minWidth: '140px' }}
                >
                  <RefreshCw size={18} />
                  <span>Try Again</span>
                </button>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={handleClose}
                  style={{ minWidth: '120px' }}
                >
                  <span>Close</span>
                </button>
              </div>
            </div>
          )}

          {/* 3. CAMERA LIVE / PHOTO CAPTURE VIEW */}
          {mode === 'camera' && !errorState && (
            <div className="camera-live-container">
              {capturedPhotoUrl ? (
                /* Captured Photo Review State */
                <div className="camera-review-wrapper">
                  <img src={capturedPhotoUrl} alt="Captured preview" className="camera-captured-img" />
                  <div className="camera-review-toolbar">
                    <button
                      type="button"
                      className="btn-secondary camera-action-btn"
                      onClick={handleRetakePhoto}
                    >
                      <RotateCcw size={18} />
                      <span>Retake</span>
                    </button>

                    <button
                      type="button"
                      className="btn-primary camera-action-btn"
                      onClick={handleUseCapturedPhoto}
                    >
                      <Check size={18} />
                      <span>Use Photo</span>
                    </button>
                  </div>
                </div>
              ) : (
                /* Live Viewfinder */
                <div className="camera-viewfinder-wrapper">
                  <video
                    ref={videoRef}
                    className="camera-video-element"
                    autoPlay
                    playsInline
                    muted
                  />
                  <canvas ref={canvasRef} style={{ display: 'none' }} />

                  {/* Top Floating Controls */}
                  <div className="camera-top-controls">
                    {hasTorch && (
                      <button
                        type="button"
                        className={`camera-control-icon-btn ${isTorchOn ? 'active' : ''}`}
                        onClick={toggleTorch}
                        title={isTorchOn ? 'Turn Flash Off' : 'Turn Flash On'}
                        aria-label="Toggle flashlight"
                      >
                        {isTorchOn ? <Zap size={20} /> : <ZapOff size={20} />}
                      </button>
                    )}

                    {hasMultipleCameras && (
                      <button
                        type="button"
                        className="camera-control-icon-btn"
                        onClick={switchCameraFacing}
                        title="Switch Camera"
                        aria-label="Switch front and rear camera"
                      >
                        <SwitchCamera size={20} />
                      </button>
                    )}
                  </div>

                  {/* Bottom Shutter Controls */}
                  <div className="camera-bottom-shutter-bar">
                    <button
                      type="button"
                      className="camera-mode-switch-btn"
                      onClick={() => {
                        stopCamera();
                        setMode('qr');
                        startCamera();
                      }}
                      title="Switch to QR Scanner"
                    >
                      <QrCode size={18} />
                      <span>QR Scan</span>
                    </button>

                    <button
                      type="button"
                      className="camera-shutter-button"
                      onClick={handleCapturePhoto}
                      aria-label="Take photo"
                    >
                      <div className="camera-shutter-inner" />
                    </button>

                    <button
                      type="button"
                      className="camera-mode-switch-btn"
                      onClick={handleClose}
                      title="Cancel"
                    >
                      <X size={18} />
                      <span>Cancel</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 4. QR CODE SCANNER VIEW */}
          {mode === 'qr' && !errorState && (
            <div className="camera-live-container">
              {qrResult ? (
                /* QR Result Screen */
                <div className="qr-result-card">
                  <div className="qr-result-header">
                    <div className="qr-result-icon-badge">
                      <QrCode size={26} />
                    </div>
                    <div className="qr-result-meta">
                      <span className="qr-result-pill">QR Code Detected</span>
                      <h4>{isUrl(qrResult) ? 'Scanned Link' : 'Scanned Content'}</h4>
                    </div>
                  </div>

                  <div className="qr-result-content-box">
                    <p className="qr-result-raw-text">{qrResult}</p>
                    {isUrl(qrResult) && (
                      <span className="qr-link-badge">
                        <ExternalLink size={13} />
                        Web Link
                      </span>
                    )}
                  </div>

                  <div className="qr-result-actions-grid">
                    <button
                      type="button"
                      className="btn-primary qr-verify-btn"
                      onClick={handleCheckQrSafety}
                    >
                      <ShieldCheck size={20} />
                      <span>Check Safety with AI</span>
                    </button>

                    <div className="qr-secondary-btn-row">
                      <button
                        type="button"
                        className="btn-secondary"
                        onClick={handleCopyQr}
                        style={{ flex: 1 }}
                      >
                        <Copy size={16} />
                        <span>{copied ? '✓ Copied' : 'Copy Content'}</span>
                      </button>

                      <button
                        type="button"
                        className="btn-secondary"
                        onClick={() => {
                          setQrResult(null);
                          startCamera();
                        }}
                        style={{ flex: 1 }}
                      >
                        <RefreshCw size={16} />
                        <span>Scan Another</span>
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                /* Live QR Viewfinder */
                <div className="camera-viewfinder-wrapper qr-viewfinder">
                  <video
                    ref={videoRef}
                    className="camera-video-element"
                    autoPlay
                    playsInline
                    muted
                  />
                  <canvas ref={canvasRef} style={{ display: 'none' }} />

                  {/* QR Scanning Target Box with Animated Laser Beam */}
                  <div className="qr-target-box">
                    <div className="qr-corner top-left" />
                    <div className="qr-corner top-right" />
                    <div className="qr-corner bottom-left" />
                    <div className="qr-corner bottom-right" />
                    <div className="qr-scan-laser" />
                  </div>

                  <div className="qr-instruction-pill">
                    <Sparkles size={14} />
                    <span>Align QR code within the frame</span>
                  </div>

                  {/* Top Floating Controls */}
                  <div className="camera-top-controls">
                    {hasTorch && (
                      <button
                        type="button"
                        className={`camera-control-icon-btn ${isTorchOn ? 'active' : ''}`}
                        onClick={toggleTorch}
                        title={isTorchOn ? 'Turn Flash Off' : 'Turn Flash On'}
                        aria-label="Toggle flashlight"
                      >
                        {isTorchOn ? <Zap size={20} /> : <ZapOff size={20} />}
                      </button>
                    )}

                    {hasMultipleCameras && (
                      <button
                        type="button"
                        className="camera-control-icon-btn"
                        onClick={switchCameraFacing}
                        title="Switch Camera"
                        aria-label="Switch front and rear camera"
                      >
                        <SwitchCamera size={20} />
                      </button>
                    )}
                  </div>

                  {/* Bottom Bar */}
                  <div className="camera-bottom-shutter-bar">
                    <button
                      type="button"
                      className="camera-mode-switch-btn"
                      onClick={() => {
                        stopCamera();
                        setMode('camera');
                        startCamera();
                      }}
                      title="Switch to Photo Capture"
                    >
                      <Camera size={18} />
                      <span>Take Photo</span>
                    </button>

                    <button
                      type="button"
                      className="camera-mode-switch-btn"
                      onClick={handleClose}
                      title="Cancel"
                    >
                      <X size={18} />
                      <span>Cancel</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CameraModal;
