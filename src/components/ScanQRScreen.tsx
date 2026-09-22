import React, { useState, useRef, useEffect, useCallback } from 'react';
import jsQR from 'jsqr';
import { LanguageCode } from '../types';
import { TRANSLATIONS } from '../i18n/translations';
import { buildUssdToUpi, executeUssdCall, simulateUssdResponse } from '../utils/ussd';
import { triggerHapticSuccess } from '../utils/haptics';
import { ArrowLeft, Camera, Upload, CheckCircle2, ShieldCheck, QrCode } from 'lucide-react';

interface ScanQRScreenProps {
  currentLang: LanguageCode;
  onBack: () => void;
  onOpenUssdModal: (
    dialCode: string,
    title: string,
    response: string,
    options?: { key: string; label: string }[]
  ) => void;
}

export const ScanQRScreen: React.FC<ScanQRScreenProps> = ({
  currentLang,
  onBack,
  onOpenUssdModal,
}) => {
  const t = TRANSLATIONS[currentLang];
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [scannedResult, setScannedResult] = useState<string | null>(null);
  const [manualInput, setManualInput] = useState('');

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Exact reproduction of ScanQRActivity.trimString(input)
  const trimString = (input: string): string => {
    const startIndex = input.indexOf('=');
    const endIndex = input.indexOf('&');

    if (startIndex !== -1 && endIndex !== -1) {
      return input.substring(startIndex + 1, endIndex);
    } else if (startIndex !== -1) {
      return input.substring(startIndex + 1);
    } else {
      return input;
    }
  };

  const processBarcodeValue = useCallback((rawValue: string) => {
    const trimmedUpiId = trimString(rawValue.trim());
    setScannedResult(trimmedUpiId);
    triggerHapticSuccess();

    // Copy to clipboard (as done in ScanQRActivity.copyToClipboard)
    try {
      navigator.clipboard.writeText(trimmedUpiId);
    } catch {
      // ignore
    }

    // Stop camera stream
    stopCamera();

    // Dial *99*1*3#
    const dialString = buildUssdToUpi();
    executeUssdCall(dialString);
    const resp = simulateUssdResponse(dialString, { upiId: trimmedUpiId });

    setTimeout(() => {
      onOpenUssdModal(resp.dialCode, resp.title, resp.body, resp.options);
    }, 400);
  }, [onOpenUssdModal]);

  const tick = useCallback(() => {
    if (videoRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (ctx) {
          canvas.height = videoRef.current.videoHeight;
          canvas.width = videoRef.current.videoWidth;
          ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: 'dontInvert',
          });

          if (code && code.data) {
            processBarcodeValue(code.data);
            return;
          }
        }
      }
    }
    animationFrameRef.current = requestAnimationFrame(tick);
  }, [processBarcodeValue]);

  const startCamera = async () => {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        videoRef.current.play();
        setCameraActive(true);
        animationFrameRef.current = requestAnimationFrame(tick);
      }
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Camera access denied or unavailable.';
      setCameraError(errorMsg);
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  useEffect(() => {
    // Attempt camera auto-start
    startCamera();
    return () => {
      stopCamera();
    };
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height);
          if (code && code.data) {
            processBarcodeValue(code.data);
          } else {
            setCameraError('No valid QR code found in uploaded image.');
          }
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualInput.trim()) {
      processBarcodeValue(manualInput.trim());
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-between p-6 max-w-md mx-auto select-none">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <button
            onClick={() => {
              stopCamera();
              onBack();
            }}
            className="flex items-center gap-1.5 text-slate-400 hover:text-white py-2 px-1 text-sm font-medium transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{t.back}</span>
          </button>
          <span className="font-bold text-sm text-white">{t.scan_pay}</span>
          <div className="w-8" />
        </div>

        {/* Camera Viewfinder */}
        <div className="mt-4 relative rounded-3xl overflow-hidden bg-slate-900 border-2 border-slate-800 aspect-square flex items-center justify-center shadow-2xl">
          <video
            ref={videoRef}
            className={`w-full h-full object-cover ${cameraActive ? 'block' : 'hidden'}`}
          />
          <canvas ref={canvasRef} className="hidden" />

          {/* Viewfinder crosshairs overlay */}
          <div className="absolute inset-8 border-2 border-dashed border-sky-400/70 rounded-2xl pointer-events-none flex items-center justify-center">
            <div className="w-full h-0.5 bg-sky-400/40 shadow-xs shadow-sky-400 animate-pulse" />
          </div>

          {!cameraActive && (
            <div className="p-6 text-center z-10 flex flex-col items-center">
              <Camera className="w-12 h-12 text-slate-500 mb-3" />
              <p className="text-xs text-slate-300 font-medium max-w-xs">
                {cameraError || 'Camera inactive'}
              </p>
              <button
                type="button"
                onClick={startCamera}
                className="mt-3 px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs rounded-xl shadow transition-colors cursor-pointer"
              >
                Enable Camera
              </button>
            </div>
          )}
        </div>

        {/* Scan Status Feedback */}
        {scannedResult && (
          <div className="mt-4 p-3 bg-emerald-950/80 border border-emerald-500/50 rounded-2xl flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <div className="text-xs">
              <span className="font-bold text-emerald-300 block">UPI ID Detected</span>
              <span className="font-mono text-white text-[11px]">{scannedResult}</span>
            </div>
          </div>
        )}

        {/* Alternative Scan / Input Methods */}
        <div className="mt-5 space-y-3">
          {/* Upload QR Image Option */}
          <label className="w-full py-3 px-4 bg-slate-900 hover:bg-slate-850 border border-slate-800 rounded-xl flex items-center justify-between text-xs font-medium text-slate-300 transition-colors cursor-pointer">
            <div className="flex items-center gap-2.5">
              <Upload className="w-4 h-4 text-sky-400" />
              <span>Upload QR Image from Gallery</span>
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
            <span className="text-[10px] text-sky-400 font-bold">Browse</span>
          </label>

          {/* Test / Manual UPI URI entry */}
          <form onSubmit={handleManualSubmit} className="flex gap-2">
            <input
              type="text"
              value={manualInput}
              onChange={(e) => setManualInput(e.target.value)}
              placeholder="Or paste UPI URI / QR string"
              className="flex-1 px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-sky-500 font-mono"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs rounded-xl shadow transition-colors cursor-pointer shrink-0"
            >
              Parse
            </button>
          </form>
        </div>
      </div>

      <div className="text-center py-4 text-xs text-slate-500 font-mono flex items-center justify-center gap-1.5">
        <ShieldCheck className="w-4 h-4 text-emerald-500" />
        <span>Extracts VPA & copies to clipboard for USSD *99*1*3#</span>
      </div>
    </div>
  );
};
