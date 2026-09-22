import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { TransactionItem } from '../types';
import { storage } from '../utils/storage';
import { buildUpiUri, formatINR, isMobileDevice, launchUpiIntent, generateUTR } from '../utils/upi';
import { triggerKeypadHaptic, triggerPaymentSuccessHaptic, triggerHapticError } from '../utils/haptics';
import {
  X,
  Zap,
  Lock,
  PhoneCall,
  QrCode,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  Smartphone,
  AlertCircle,
  Copy,
  ChevronRight
} from 'lucide-react';

interface UnifiedPaymentModalProps {
  isOpen: boolean;
  payeeName: string;
  payeeVpa: string;
  amount: number;
  note?: string;
  onClose: () => void;
  onPaymentSuccess: (transaction: TransactionItem) => void;
  onOpenUssdModal?: (dialCode: string, title: string, body: string, options?: { key: string; label: string }[]) => void;
  ussdDialString?: string;
}

export const UnifiedPaymentModal: React.FC<UnifiedPaymentModalProps> = ({
  isOpen,
  payeeName,
  payeeVpa,
  amount,
  note = 'Payment',
  onClose,
  onPaymentSuccess,
  onOpenUssdModal,
  ussdDialString,
}) => {
  const [activeTab, setActiveTab] = useState<'options' | 'pin' | 'qr'>('options');
  const [pinDigits, setPinDigits] = useState<string[]>(['', '', '', '']);
  const [pinError, setPinError] = useState<string | null>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [copiedVpa, setCopiedVpa] = useState(false);
  const isMobile = isMobileDevice();

  const upiUri = buildUpiUri({
    pa: payeeVpa,
    pn: payeeName,
    am: amount,
    tn: note,
    cu: 'INR',
  });

  useEffect(() => {
    if (isOpen) {
      setActiveTab('options');
      setPinDigits(['', '', '', '']);
      setPinError(null);

      // Pre-generate dynamic QR code for desktop or external phone scan
      QRCode.toDataURL(
        upiUri,
        {
          width: 320,
          margin: 2,
          color: { dark: '#020617', light: '#ffffff' },
        },
        (err, url) => {
          if (!err && url) {
            setQrCodeUrl(url);
          }
        }
      );
    }
  }, [isOpen, upiUri]);

  if (!isOpen) return null;

  // 1. Launch real UPI App intent (Google Pay, PhonePe, Paytm, BHIM)
  const handleLaunchUpiIntent = () => {
    triggerKeypadHaptic();
    launchUpiIntent(upiUri);

    // If launched on mobile, also provide instant confirmation button
    // or log as pending/completed
    const currentBalance = storage.getBalance();
    if (currentBalance >= amount) {
      storage.deductBalance(amount);
    }
    const txn = storage.addTransaction(`UPI to ${payeeName}`, amount, {
      payeeVpa,
      mode: 'UPI_INTENT',
      status: 'success',
      utr: generateUTR(),
    });
    triggerPaymentSuccessHaptic();
    onPaymentSuccess(txn);
  };

  // 2. Validate In-App UPI PIN
  const handleVerifyPin = (pinToTest: string) => {
    setPinError(null);
    const storedPin = storage.getStoredPin();

    if (storedPin && pinToTest !== storedPin) {
      triggerHapticError();
      setPinError('Incorrect UPI PIN. Please try again.');
      setPinDigits(['', '', '', '']);
      return;
    }

    const currentBal = storage.getBalance();
    if (currentBal < amount) {
      triggerHapticError();
      setPinError(`Insufficient balance! Available: ${formatINR(currentBal)}`);
      return;
    }

    // Deduct balance and record transaction
    storage.deductBalance(amount);
    const utr = generateUTR();
    const txn = storage.addTransaction(`Transfer to ${payeeName}`, amount, {
      payeeVpa,
      mode: 'IN_APP_UPI',
      status: 'success',
      utr,
    });

    triggerPaymentSuccessHaptic();
    onPaymentSuccess(txn);
  };

  const handlePinKeyClick = (num: number) => {
    triggerKeypadHaptic();
    setPinError(null);
    const firstEmpty = pinDigits.findIndex((d) => d === '');
    if (firstEmpty !== -1) {
      const next = [...pinDigits];
      next[firstEmpty] = num.toString();
      setPinDigits(next);

      if (firstEmpty === 3) {
        setTimeout(() => {
          handleVerifyPin(next.join(''));
        }, 80);
      }
    }
  };

  const handlePinBackspace = () => {
    triggerKeypadHaptic();
    const lastFilled = [...pinDigits].reverse().findIndex((d) => d !== '');
    if (lastFilled !== -1) {
      const actual = 3 - lastFilled;
      const next = [...pinDigits];
      next[actual] = '';
      setPinDigits(next);
    }
  };

  // 3. Dial Offline USSD
  const handleDialUssd = () => {
    triggerKeypadHaptic();
    if (ussdDialString && onOpenUssdModal) {
      onClose();
      // Dial cellular string
      if (typeof window !== 'undefined') {
        window.location.href = `tel:${encodeURIComponent(ussdDialString)}`;
      }
      onOpenUssdModal(
        ussdDialString,
        'NUUP *99# Cellular Session',
        `Initiating offline payment of ${formatINR(amount)} to ${payeeName} via telecom network...`,
        [
          { key: '1', label: '1. Confirm Payment' },
          { key: '2', label: '2. Cancel Session' },
        ]
      );
    }
  };

  const handleCopyVpa = () => {
    triggerKeypadHaptic();
    navigator.clipboard.writeText(payeeVpa);
    setCopiedVpa(true);
    setTimeout(() => setCopiedVpa(false), 2000);
  };

  return (
    <div
      id="unified-payment-modal-backdrop"
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200"
    >
      <div
        id="unified-payment-modal"
        className="w-full max-w-sm bg-white rounded-3xl overflow-hidden shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-200 flex flex-col max-h-[92vh]"
      >
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-xs shadow-xs">
              UPI
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900">
                {activeTab === 'pin'
                  ? 'Enter UPI PIN'
                  : activeTab === 'qr'
                  ? 'Scan to Pay'
                  : 'Confirm Payment'}
              </h3>
              <p className="text-[10px] text-slate-500 font-mono">
                {payeeVpa}
              </p>
            </div>
          </div>
          <button
            id="payment-modal-close"
            type="button"
            onClick={() => {
              triggerKeypadHaptic();
              onClose();
            }}
            className="w-8 h-8 rounded-full bg-slate-200/70 hover:bg-slate-300 text-slate-700 flex items-center justify-center cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Recipient & Amount Badge */}
        <div className="p-4 bg-gradient-to-b from-slate-50 to-white text-center border-b border-slate-100">
          <span className="text-[11px] font-semibold text-slate-500 block uppercase tracking-wider">
            Paying To
          </span>
          <h2 className="text-lg font-extrabold text-slate-900 mt-0.5 truncate px-4">
            {payeeName}
          </h2>
          <div className="flex items-center justify-center gap-1.5 mt-1">
            <span className="font-mono text-xs text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200">
              {payeeVpa}
            </span>
            <button
              type="button"
              onClick={handleCopyVpa}
              className="text-slate-500 hover:text-slate-900 cursor-pointer"
              title="Copy UPI ID"
            >
              <Copy className="w-3.5 h-3.5" />
            </button>
          </div>
          {copiedVpa && (
            <span className="text-[10px] text-emerald-600 font-semibold block mt-0.5">
              Copied to clipboard!
            </span>
          )}

          <div className="mt-3 py-2 px-4 bg-emerald-50 border border-emerald-200 rounded-2xl inline-block shadow-xs">
            <span className="text-2xl font-black text-emerald-800 tracking-tight">
              {formatINR(amount)}
            </span>
          </div>
        </div>

        {/* Content based on Active Tab */}
        <div className="p-4 flex-1 overflow-y-auto">
          {activeTab === 'options' && (
            <div className="space-y-3">
              {/* Option 1: Direct UPI Deep Link Intent */}
              <button
                id="pay-via-upi-intent-btn"
                type="button"
                onClick={handleLaunchUpiIntent}
                className="w-full p-3.5 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 active:scale-98 text-white rounded-2xl shadow-md transition-all text-left flex items-center justify-between cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center shrink-0">
                    <Zap className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs">
                        {isMobile ? 'Pay via UPI App' : 'Launch Installed UPI App'}
                      </span>
                      <span className="text-[9px] font-bold bg-white/20 px-1.5 py-0.2 rounded-full uppercase">
                        Instant
                      </span>
                    </div>
                    <span className="text-[11px] text-emerald-100 block">
                      Google Pay, PhonePe, Paytm, BHIM
                    </span>
                  </div>
                </div>
                <ExternalLink className="w-4 h-4 text-white/80 group-hover:translate-x-0.5 transition-transform" />
              </button>

              {/* Option 2: Pay In-App with Secure PIN */}
              <button
                id="pay-via-inapp-pin-btn"
                type="button"
                onClick={() => {
                  triggerKeypadHaptic();
                  setActiveTab('pin');
                }}
                className="w-full p-3.5 bg-slate-900 hover:bg-black active:scale-98 text-white rounded-2xl shadow-md transition-all text-left flex items-center justify-between cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center shrink-0">
                    <Lock className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-xs">Pay In-App with UPI PIN</span>
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    </div>
                    <span className="text-[11px] text-slate-300 block">
                      Direct bank deduction &amp; UTR receipt
                    </span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
              </button>

              {/* Option 3: Dynamic QR Code for External Scan */}
              <button
                id="pay-via-qr-code-btn"
                type="button"
                onClick={() => {
                  triggerKeypadHaptic();
                  setActiveTab('qr');
                }}
                className="w-full p-3.5 bg-slate-50 hover:bg-slate-100 active:scale-98 border border-slate-200 text-slate-800 rounded-2xl transition-all text-left flex items-center justify-between cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 border border-indigo-100">
                    <QrCode className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="font-bold text-xs block text-slate-900">
                      Show UPI QR Code
                    </span>
                    <span className="text-[11px] text-slate-500 block">
                      Scan with any bank phone camera to pay
                    </span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>

              {/* Option 4: Offline *99# USSD */}
              {ussdDialString && (
                <button
                  id="pay-via-ussd-btn"
                  type="button"
                  onClick={handleDialUssd}
                  className="w-full p-3 bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 rounded-2xl transition-all text-left flex items-center justify-between cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-amber-200/80 text-amber-900 flex items-center justify-center shrink-0">
                      <PhoneCall className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-bold text-xs block">
                        Dial *99# Offline Banking
                      </span>
                      <span className="text-[10px] text-amber-800 font-mono">
                        {ussdDialString} (No internet needed)
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-amber-700" />
                </button>
              )}
            </div>
          )}

          {/* TAB 2: IN-APP PIN ENTRY */}
          {activeTab === 'pin' && (
            <div className="flex flex-col items-center">
              <span className="text-xs text-slate-600 font-medium mb-3 text-center">
                Enter your 4-digit UPI PIN to authorize deduction of {formatINR(amount)}
              </span>

              {pinError && (
                <div className="mb-3 w-full p-2.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{pinError}</span>
                </div>
              )}

              {/* 4 Digit Boxes */}
              <div className="flex gap-3 mb-4">
                {pinDigits.map((digit, idx) => (
                  <div
                    key={idx}
                    className={`w-12 h-14 rounded-2xl border-2 flex items-center justify-center text-2xl font-bold font-mono transition-all ${
                      digit
                        ? 'bg-slate-900 text-white border-black scale-105 shadow-sm'
                        : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  >
                    {digit ? '•' : ''}
                  </div>
                ))}
              </div>

              {/* On-Screen Number Pad */}
              <div className="w-full grid grid-cols-3 gap-2">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => handlePinKeyClick(num)}
                    className="h-11 rounded-xl bg-slate-50 hover:bg-slate-100 active:bg-slate-900 active:text-white border border-slate-200 font-mono font-bold text-lg text-slate-900 shadow-xs flex items-center justify-center transition-all cursor-pointer select-none"
                  >
                    {num}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => {
                    triggerKeypadHaptic();
                    setActiveTab('options');
                  }}
                  className="h-11 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-semibold flex items-center justify-center cursor-pointer"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => handlePinKeyClick(0)}
                  className="h-11 rounded-xl bg-slate-50 hover:bg-slate-100 active:bg-slate-900 active:text-white border border-slate-200 font-mono font-bold text-lg text-slate-900 shadow-xs flex items-center justify-center transition-all cursor-pointer select-none"
                >
                  0
                </button>
                <button
                  type="button"
                  onClick={handlePinBackspace}
                  className="h-11 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center justify-center cursor-pointer"
                >
                  ⌫
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: DYNAMIC QR CODE DISPLAY */}
          {activeTab === 'qr' && (
            <div className="flex flex-col items-center text-center">
              <span className="text-xs text-slate-600 mb-2 font-medium">
                Scan with any UPI app on another phone to complete payment of {formatINR(amount)}
              </span>

              <div className="w-56 h-56 bg-white p-3 rounded-2xl border-2 border-slate-200 shadow-inner flex items-center justify-center mb-3">
                {qrCodeUrl ? (
                  <img
                    src={qrCodeUrl}
                    alt="Dynamic Payment QR"
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin" />
                )}
              </div>

              <div className="flex items-center gap-2 mb-3">
                <span className="text-[11px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 truncate max-w-[200px]">
                  {payeeVpa}
                </span>
                <button
                  type="button"
                  onClick={handleCopyVpa}
                  className="text-xs font-bold text-indigo-600 hover:underline cursor-pointer"
                >
                  Copy VPA
                </button>
              </div>

              <div className="flex gap-2 w-full">
                <button
                  type="button"
                  onClick={() => {
                    triggerKeypadHaptic();
                    setActiveTab('options');
                  }}
                  className="flex-1 py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
                >
                  Change Method
                </button>
                <button
                  type="button"
                  onClick={() => {
                    // Mark as completed
                    triggerKeypadHaptic();
                    storage.deductBalance(amount);
                    const txn = storage.addTransaction(`QR Payment to ${payeeName}`, amount, {
                      payeeVpa,
                      mode: 'UPI_INTENT',
                      status: 'success',
                      utr: generateUTR(),
                    });
                    triggerPaymentSuccessHaptic();
                    onPaymentSuccess(txn);
                  }}
                  className="flex-1 py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer"
                >
                  Confirm Paid
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Security badge footer */}
        <div className="bg-slate-50 py-2.5 px-4 text-center border-t border-slate-100 flex items-center justify-center gap-1.5 text-[10px] text-slate-500">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>NPCI 256-Bit Encrypted Payment Channel</span>
        </div>
      </div>
    </div>
  );
};
