import React, { useState, useEffect, useRef, useCallback } from 'react';
import { RefreshCw, Camera, AlertTriangle, UploadCloud, CameraOff, Sparkles } from 'lucide-react';
import { scanVideoFrame } from '../lib/qrScanner.ts';

interface QrCameraScannerProps {
  onScanSuccess: (data: string) => void;
  onSwitchToUpload: () => void;
}

export const QrCameraScanner: React.FC<QrCameraScannerProps> = ({
  onScanSuccess,
  onSwitchToUpload,
}) => {
  const [isStreaming, setIsStreaming] = useState<boolean>(false);
  const [isRequesting, setIsRequesting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Stop camera tracks cleanly
  const stopCamera = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch {
          // safe
        }
      });
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsStreaming(false);
    setIsRequesting(false);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  // Robust camera stream start
  const startCamera = useCallback(async (mode: 'environment' | 'user') => {
    setErrorMessage(null);
    setIsRequesting(true);

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setErrorMessage('Camera access is not supported on this browser or hardware.');
      setIsRequesting(false);
      return;
    }

    try {
      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: mode },
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        });
      } catch (e) {
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });
      }

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        videoRef.current.setAttribute('webkit-playsinline', 'true');
        videoRef.current.muted = true;

        try {
          await videoRef.current.play();
        } catch (playErr) {
          console.warn('Video play deferred:', playErr);
        }

        setIsStreaming(true);
      } else {
        setIsStreaming(true);
      }
    } catch (err: any) {
      console.warn('Camera request error:', err);
      stopCamera();
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setErrorMessage('Camera permission was blocked. Please click the camera icon in your address bar to allow access.');
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setErrorMessage('No camera device detected on this system. You can test by uploading an image or selecting a demo preset.');
      } else {
        setErrorMessage(`Camera error: ${err.message || 'Unable to open camera feed'}`);
      }
    } finally {
      setIsRequesting(false);
    }
  }, [stopCamera]);

  // Connect stream whenever streaming becomes true
  useEffect(() => {
    if (isStreaming && videoRef.current && streamRef.current && videoRef.current.srcObject !== streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
      videoRef.current.play().catch((err) => console.warn('Stream play error:', err));
    }
  }, [isStreaming]);

  // Attempt auto-start on mount
  useEffect(() => {
    startCamera(facingMode);
    return () => {
      stopCamera();
    };
  }, []);

  // Frame scanning loop
  useEffect(() => {
    if (!isStreaming) return;

    let isScanning = true;

    const tick = () => {
      if (!isScanning) return;

      const video = videoRef.current;
      const canvas = canvasRef.current;

      if (video && canvas && video.readyState >= 2 && video.videoWidth > 0) {
        try {
          const result = scanVideoFrame(video, canvas);
          if (result && result.data && result.data.trim()) {
            try {
              const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
              if (AudioCtx) {
                const ctx = new AudioCtx();
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(880, ctx.currentTime);
                gain.gain.setValueAtTime(0.08, ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.start();
                osc.stop(ctx.currentTime + 0.12);
              }
            } catch {
              // audio context
            }

            stopCamera();
            onScanSuccess(result.data.trim());
            return;
          }
        } catch (e) {
          // ignore transient frame capture
        }
      }

      animationFrameRef.current = requestAnimationFrame(tick);
    };

    animationFrameRef.current = requestAnimationFrame(tick);

    return () => {
      isScanning = false;
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isStreaming, onScanSuccess, stopCamera]);

  const handleSwitchCamera = () => {
    const nextMode = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(nextMode);
    stopCamera();
    startCamera(nextMode);
  };

  return (
    <div className="w-full flex flex-col items-center">
      {/* Hidden processing canvas */}
      <canvas ref={canvasRef} className="hidden" />

      {isStreaming ? (
        /* Properly positioned, centered, sleek camera viewport */
        <div className="w-full max-w-md mx-auto flex flex-col items-center">
          <div className="w-full aspect-[4/3] rounded-2xl overflow-hidden relative border-2 border-slate-800 bg-slate-950 shadow-xl flex items-center justify-center">
            {/* Live Video */}
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              onLoadedMetadata={() => videoRef.current?.play()}
              className="w-full h-full object-cover"
            />

            {/* Dark vignette backdrop mask with centered targeting aperture */}
            <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">
              {/* Centered targeting square with corner brackets */}
              <div className="w-48 h-48 sm:w-56 sm:h-56 relative rounded-2xl border-2 border-dashed border-rose-400/70 overflow-hidden shadow-[0_0_0_9999px_rgba(0,0,0,0.4)]">
                {/* 4 Corner Solid Brackets */}
                <span className="absolute top-0 left-0 w-5 h-5 border-t-3 border-l-3 border-[#e11d48] rounded-tl-lg" />
                <span className="absolute top-0 right-0 w-5 h-5 border-t-3 border-r-3 border-[#e11d48] rounded-tr-lg" />
                <span className="absolute bottom-0 left-0 w-5 h-5 border-b-3 border-l-3 border-[#e11d48] rounded-bl-lg" />
                <span className="absolute bottom-0 right-0 w-5 h-5 border-b-3 border-r-3 border-[#e11d48] rounded-br-lg" />

                {/* Animated Laser Scanning Beam */}
                <div className="absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-[#f43f5e] to-transparent shadow-[0_0_10px_#f43f5e] animate-laser-sweep" />
              </div>
            </div>

            {/* Top Floating Badge */}
            <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20 pointer-events-none flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/70 backdrop-blur-md border border-white/20 text-white text-[11px] font-bold shadow-md whitespace-nowrap">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Align QR Code in Frame</span>
            </div>

            {/* Top-Right Floating Camera Controls */}
            <div className="absolute top-3 right-3 z-20 flex items-center gap-1.5">
              <button
                onClick={handleSwitchCamera}
                className="p-1.5 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-md text-white border border-white/25 shadow-md transition-colors cursor-pointer"
                title="Switch Camera"
                aria-label="Switch Camera"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={stopCamera}
                className="p-1.5 rounded-full bg-black/60 hover:bg-rose-600/90 backdrop-blur-md text-white border border-white/25 shadow-md transition-colors cursor-pointer"
                title="Stop Camera"
                aria-label="Stop Camera"
              >
                <CameraOff className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Under-viewfinder Controls & Status */}
          <div className="w-full flex items-center justify-between mt-3 px-1 text-xs text-slate-500">
            <span className="inline-flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-rose-500" />
              <span>Real-time local frame scanner</span>
            </span>

            <button
              onClick={onSwitchToUpload}
              className="text-[#e11d48] hover:text-[#be123c] font-semibold inline-flex items-center gap-1 transition-colors cursor-pointer"
            >
              <UploadCloud className="w-3.5 h-3.5" />
              <span>Upload image instead</span>
            </button>
          </div>
        </div>
      ) : (
        /* Camera Start Card when not streaming */
        <div className="w-full max-w-xl p-6 sm:p-8 text-center bg-slate-50/70 border border-slate-200 rounded-3xl">
          <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-[#e11d48] shadow-2xs">
            <Camera className="w-7 h-7" />
          </div>

          <h3 className="text-sm sm:text-base font-bold text-slate-900 mb-1">
            Camera QR Code Scanner
          </h3>

          <p className="text-slate-500 text-xs sm:text-sm max-w-md mx-auto mb-5 leading-relaxed">
            Click below to start scanning QR codes in real time. Frames are processed locally on your device.
          </p>

          {errorMessage && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 max-w-md mx-auto flex items-start gap-2 text-left">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
              <div>
                <p className="font-bold">Camera Notice</p>
                <p>{errorMessage}</p>
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5">
            <button
              onClick={() => startCamera(facingMode)}
              disabled={isRequesting}
              className="w-full sm:w-auto px-5 py-2.5 bg-[#e11d48] hover:bg-[#be123c] active:bg-[#9f1239] text-white font-bold text-xs sm:text-sm rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <Camera className="w-4 h-4" />
              <span>{isRequesting ? 'Starting Camera...' : 'Allow Camera & Start Scanning'}</span>
            </button>

            <button
              onClick={onSwitchToUpload}
              className="w-full sm:w-auto px-4 py-2.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 font-semibold text-xs sm:text-sm rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <UploadCloud className="w-4 h-4 text-slate-500" />
              <span>Upload QR Image Instead</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
