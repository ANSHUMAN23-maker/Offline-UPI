import React, { useState, useRef, useEffect, useCallback } from 'react';
import jsQR from 'jsqr';
import { LanguageCode, TransactionItem } from '../types';
import { TRANSLATIONS } from '../i18n/translations';
import { buildUssdToUpi } from '../utils/ussd';
import { parseUpiPayload, ParsedUpiData, formatINR } from '../utils/upi';
import { triggerHapticSuccess, triggerKeypadHaptic } from '../utils/haptics';
import { UnifiedPaymentModal } from './UnifiedPaymentModal';
import { UpiPaymentReceiptModal } from './UpiPaymentReceiptModal';
import {
  ArrowLeft,
  Camera,
  Upload,
  CheckCircle2,
  ShieldCheck,
  QrCode,
  IndianRupee,
  Send,
  Sparkles,
  AlertCircle
} from 'lucide-react';

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
  const [manualInput, setManualInput] = useState('');

  // Scanned payload and verified state
  const [parsedData, setParsedData] = useState<ParsedUpiData | null>(null);
  const [enteredAmount, setEnteredAmount] = useState<string>('');
  const [enteredNote, setEnteredNote] = useState<string>('');
  const [payError, setPayError] = useState<string | null>(null);

  // Modals
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [completedTxn, setCompletedTxn] = useState<TransactionItem | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const processBarcodeValue = useCallback((rawValue: string) => {
    const data = parseUpiPayload(rawValue);
    setParsedData(data);
    triggerHapticSuccess();

    if (data.amount) {
      setEnteredAmount(data.amount.toString());
    }
    if (data.note) {
      setEnteredNote(data.note);
    }

    // Stop camera stream once captured
    stopCamera();
  }, []);

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
      const errorMsg = err instanceof Error ? err.message : 'Camera access denied or unavailable in this environment.';
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
            setCameraError('No valid UPI QR code detected in this image.');
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

  // Test Sample QRs for preview testing
  const handleLoadSampleQr = (sampleUri: string) => {
    triggerKeypadHaptic();
    processBarcodeValue(sampleUri);
  };

  const handleProceedToPay = () => {
    setPayError(null);
    triggerKeypadHaptic();

    if (!parsedData) return;

    const amt = parseFloat(enteredAmount);
    if (isNaN(amt) || amt <= 0) {
      setPayError('Please enter a valid payment amount greater than ₹0.');
      return;
    }

    setShowPaymentModal(true);
  };

  const ussdDial = buildUssdToUpi();

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-between p-6 max-w-md mx-auto select-none">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <button
            onClick={() => {
              triggerKeypadHaptic();
              onBack();
            }}
            className="flex items-center gap-1.5 text-slate-400 hover:text-white py-2 px-1 text-sm font-medium transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{t.back}</span>
          </button>
          <span className="font-bold text-sm text-slate-200">{t.scan_pay}</span>
          <div className="w-6" />
        </div>

        {/* If QR is SCANNED -> Show Payment Verification Sheet */}
        {parsedData ? (
          <div className="mt-5 bg-white text-slate-900 rounded-3xl p-5 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-2 mb-3 pb-3 border-b border-slate-100">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-700 block">
                  Verified UPI Payee
                </span>
                <h3 className="font-extrabold text-base text-slate-900 leading-tight">
                  {parsedData.payeeName}
                </h3>
              </div>
            </div>

            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 mb-4">
              <span className="text-[10px] text-slate-500 font-semibold block uppercase">
                UPI ID / VPA
              </span>
              <span className="font-mono text-xs font-bold text-slate-800 break-all">
                {parsedData.vpa}
              </span>
            </div>

            {payError && (
              <div className="mb-3 p-2.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{payError}</span>
              </div>
            )}

            {/* Amount Input */}
            <div className="space-y-1.5 mb-3">
              <label className="text-xs font-bold text-slate-700 block">
                Amount to Pay (₹)
              </label>
              <div className="relative">
                <IndianRupee className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="number"
                  value={enteredAmount}
                  onChange={(e) => setEnteredAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-lg font-bold text-slate-900 focus:outline-none focus:border-black focus:bg-white transition-all font-mono"
                  min="1"
                  step="any"
                />
              </div>

              {/* Quick Amount Chips */}
              <div className="flex gap-1.5 pt-1">
                {[50, 100, 200, 500, 1000].map((chip) => (
                  <button
                    key={chip}
                    type="button"
                    onClick={() => {
                      triggerKeypadHaptic();
                      setEnteredAmount(chip.toString());
                    }}
                    className="py-1 px-2.5 bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-700 rounded-lg text-[11px] font-semibold transition-all cursor-pointer"
                  >
                    +{chip}
                  </button>
                ))}
              </div>
            </div>

            {/* Note Input */}
            <div className="space-y-1.5 mb-4">
              <label className="text-xs font-bold text-slate-700 block">
                Remarks (Optional)
              </label>
              <input
                type="text"
                value={enteredNote}
                onChange={(e) => setEnteredNote(e.target.value)}
                placeholder="e.g. Chai, Grocery, Order #123"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-black focus:bg-white transition-all"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  triggerKeypadHaptic();
                  setParsedData(null);
                  startCamera();
                }}
                className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
              >
                Scan Another
              </button>
              <button
                id="scan-proceed-pay-btn"
                type="button"
                onClick={handleProceedToPay}
                className="flex-2 py-3 bg-slate-950 hover:bg-black active:scale-98 text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Choose Payment Mode</span>
              </button>
            </div>
          </div>
        ) : (
          /* Camera Viewfinder & Scan Mode */
          <div className="mt-4">
            {/* Viewfinder Window */}
            <div className="w-full h-64 sm:h-72 bg-black rounded-3xl overflow-hidden relative border-2 border-slate-700 shadow-2xl flex items-center justify-center">
              {/* Hidden Video & Canvas for decoding */}
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
                playsInline
                muted
              />
              <canvas ref={canvasRef} className="hidden" />

              {/* Viewfinder Target Framing Overlays */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-48 h-48 border-2 border-emerald-400/80 rounded-2xl relative">
                  {/* Corner accents */}
                  <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-emerald-400 rounded-tl-lg" />
                  <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-emerald-400 rounded-tr-lg" />
                  <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-emerald-400 rounded-bl-lg" />
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-emerald-400 rounded-br-lg" />

                  {/* Scanning Laser Line */}
                  <div className="w-full h-0.5 bg-emerald-400 shadow-[0_0_8px_#34d399] animate-pulse absolute top-1/2 -translate-y-1/2" />
                </div>
              </div>

              {!cameraActive && (
                <div className="absolute inset-0 bg-slate-900/90 flex flex-col items-center justify-center p-6 text-center">
                  <Camera className="w-10 h-10 text-slate-500 mb-2" />
                  <span className="text-xs text-slate-300 font-medium">
                    {cameraError || 'Camera inactive or permission required'}
                  </span>
                  <button
                    onClick={startCamera}
                    className="mt-3 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer"
                  >
                    Enable Camera
                  </button>
                </div>
              )}
            </div>

            <p className="text-center text-xs text-slate-400 mt-3 font-medium">
              Align any BharatQR, Google Pay, PhonePe, or Paytm QR code inside the box
            </p>

            {/* Quick Upload from Gallery Option */}
            <div className="mt-4">
              <label className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-2xl flex items-center justify-center gap-2 text-xs font-semibold text-slate-300 transition-colors cursor-pointer shadow-xs">
                <Upload className="w-4 h-4 text-emerald-400" />
                <span>Upload QR from Gallery / Photos</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>

            {/* Interactive Test Previews (Instant Demo Without Physical Camera) */}
            <div className="mt-4 p-3 bg-slate-900/90 border border-slate-800 rounded-2xl">
              <span className="text-[10px] font-bold tracking-wider uppercase text-emerald-400 block mb-1.5 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Test Live QR Payloads</span>
              </span>
              <div className="flex gap-1.5 flex-wrap">
                <button
                  type="button"
                  onClick={() =>
                    handleLoadSampleQr(
                      'upi://pay?pa=swiggy@icici&pn=Swiggy%20India&am=249.00&cu=INR&tn=Food%20Delivery'
                    )
                  }
                  className="py-1 px-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] rounded-lg font-medium cursor-pointer"
                >
                  Swiggy ₹249
                </button>
                <button
                  type="button"
                  onClick={() =>
                    handleLoadSampleQr(
                      'upi://pay?pa=priya@okaxis&pn=Priya%20Patel&am=500.00&cu=INR&tn=Dinner%20Split'
                    )
                  }
                  className="py-1 px-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] rounded-lg font-medium cursor-pointer"
                >
                  Priya ₹500
                </button>
                <button
                  type="button"
                  onClick={() =>
                    handleLoadSampleQr('upi://pay?pa=merchant.store@paytm&pn=SuperMarket&cu=INR')
                  }
                  className="py-1 px-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] rounded-lg font-medium cursor-pointer"
                >
                  Store (Open Amt)
                </button>
              </div>
            </div>

            {/* Manual QR Text / VPA Fallback */}
            <form onSubmit={handleManualSubmit} className="mt-3 flex gap-2">
              <input
                type="text"
                value={manualInput}
                onChange={(e) => setManualInput(e.target.value)}
                placeholder="Or paste UPI ID / payload..."
                className="flex-1 px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
              />
              <button
                type="submit"
                className="py-2 px-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl cursor-pointer"
              >
                Verify
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="py-4 text-center border-t border-slate-900 flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
        <ShieldCheck className="w-4 h-4 text-emerald-400" />
        <span>BharatQR &bull; NPCI UPI Standard</span>
      </div>

      {/* Unified Payment Chooser Modal */}
      {parsedData && (
        <UnifiedPaymentModal
          isOpen={showPaymentModal}
          payeeName={parsedData.payeeName}
          payeeVpa={parsedData.vpa}
          amount={parseFloat(enteredAmount) || 0}
          note={enteredNote || 'QR Payment'}
          onClose={() => setShowPaymentModal(false)}
          onPaymentSuccess={(txn) => {
            setShowPaymentModal(false);
            setCompletedTxn(txn);
          }}
          onOpenUssdModal={onOpenUssdModal}
          ussdDialString={ussdDial}
        />
      )}

      {/* Payment Receipt Modal */}
      <UpiPaymentReceiptModal
        isOpen={Boolean(completedTxn)}
        transaction={completedTxn}
        onClose={() => {
          setCompletedTxn(null);
          onBack();
        }}
      />
    </div>
  );
};
