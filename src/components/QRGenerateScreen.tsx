import React, { useEffect, useState, useRef } from 'react';
import QRCode from 'qrcode';
import { LanguageCode } from '../types';
import { TRANSLATIONS } from '../i18n/translations';
import { storage } from '../utils/storage';
import { buildUpiUri, formatINR } from '../utils/upi';
import { triggerKeypadHaptic } from '../utils/haptics';
import { ArrowLeft, Download, Share2, CheckCircle2, IndianRupee, QrCode } from 'lucide-react';

interface QRGenerateScreenProps {
  currentLang: LanguageCode;
  onBack: () => void;
}

export const QRGenerateScreen: React.FC<QRGenerateScreenProps> = ({
  currentLang,
  onBack,
}) => {
  const t = TRANSLATIONS[currentLang];
  const userData = storage.getUserData();
  const name = userData.myName || 'User';
  const upiId = userData.myUPIid || 'offline@upi';

  const [requestedAmount, setRequestedAmount] = useState<string>('');
  const [remarks, setRemarks] = useState<string>('');
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  const numAmt = parseFloat(requestedAmount);
  const upiPayUri = buildUpiUri({
    pa: upiId,
    pn: name,
    am: !isNaN(numAmt) && numAmt > 0 ? numAmt : undefined,
    tn: remarks.trim() || undefined,
    cu: 'INR',
  });

  useEffect(() => {
    setLoading(true);
    QRCode.toDataURL(
      upiPayUri,
      {
        width: 480,
        margin: 2,
        color: {
          dark: '#020617',
          light: '#ffffff',
        },
      },
      (err, url) => {
        if (!err && url) {
          setQrDataUrl(url);
        }
        setLoading(false);
      }
    );
  }, [upiPayUri]);

  const handleCopyUri = () => {
    triggerKeypadHaptic();
    navigator.clipboard.writeText(upiPayUri);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    triggerKeypadHaptic();
    if (navigator.share) {
      try {
        await navigator.share({
          title: `UPI Payment to ${name}`,
          text: `Pay ${numAmt > 0 ? formatINR(numAmt) + ' ' : ''}to ${name} via UPI ID: ${upiId}\nLink: ${upiPayUri}`,
          url: upiPayUri,
        });
        return;
      } catch {
        // fallback
      }
    }
    handleCopyUri();
  };

  const handleDownload = () => {
    triggerKeypadHaptic();
    if (!qrDataUrl) return;
    const a = document.createElement('a');
    a.href = qrDataUrl;
    a.download = `UPI-QR-${upiId}${numAmt > 0 ? '-' + numAmt : ''}.png`;
    a.click();
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col justify-between p-6 max-w-md mx-auto select-none">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <button
            onClick={() => {
              triggerKeypadHaptic();
              onBack();
            }}
            className="flex items-center gap-1.5 text-slate-600 hover:text-black py-2 px-1 text-sm font-medium transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{t.back}</span>
          </button>
          <span className="font-bold text-sm text-slate-900">{t.your_qr_code}</span>
          <div className="w-8" />
        </div>

        {/* QR Card Container */}
        <div className="mt-4 bg-slate-50 border border-slate-200 rounded-3xl p-5 shadow-sm flex flex-col items-center">
          {/* User Details Header */}
          <div className="text-center mb-3">
            <h3 className="font-extrabold text-base text-slate-900">
              {name}
            </h3>
            <p className="text-xs font-mono font-medium text-slate-600 mt-0.5">
              UPI ID: {upiId}
            </p>
            {numAmt > 0 && (
              <span className="inline-block mt-1 text-xs font-extrabold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                Fixed Amount: {formatINR(numAmt)}
              </span>
            )}
          </div>

          {/* QR Canvas / Image */}
          <div className="w-56 h-56 bg-white p-3 rounded-2xl shadow-inner border border-slate-200 flex items-center justify-center relative">
            {loading ? (
              <div className="flex flex-col items-center gap-2">
                <div className="w-8 h-8 border-3 border-black border-t-transparent rounded-full animate-spin" />
                <span className="text-xs text-slate-500 font-medium">Generating QR...</span>
              </div>
            ) : qrDataUrl ? (
              <img
                src={qrDataUrl}
                alt="UPI QR Code"
                className="w-full h-full object-contain"
              />
            ) : null}
          </div>

          {/* Payee string pill */}
          <div className="mt-3 text-center">
            <span className="inline-block text-[11px] font-mono text-slate-500 bg-white px-3 py-1 rounded-full border border-slate-200">
              Compatible with GPay, PhonePe, Paytm, BHIM &amp; BharatQR
            </span>
          </div>

          {/* Actions */}
          <div className="flex gap-2 mt-4 w-full">
            <button
              type="button"
              onClick={handleShare}
              className="flex-1 py-2 px-3 bg-white hover:bg-slate-100 text-slate-800 text-xs font-semibold rounded-xl border border-slate-300 flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
            >
              {copied ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5 text-slate-600" />
                  <span>Share / Copy</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleDownload}
              className="flex-1 py-2 px-3 bg-slate-900 hover:bg-black text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download</span>
            </button>
          </div>
        </div>

        {/* Optional Custom Amount Input */}
        <div className="mt-4 p-4 bg-white border border-slate-200 rounded-2xl space-y-2">
          <span className="text-xs font-bold text-slate-900 block">
            Set Dynamic Amount for this QR (Optional)
          </span>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <IndianRupee className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
              <input
                type="number"
                value={requestedAmount}
                onChange={(e) => setRequestedAmount(e.target.value)}
                placeholder="Enter exact ₹ amount"
                className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:border-black"
                min="1"
              />
            </div>
            {requestedAmount && (
              <button
                type="button"
                onClick={() => setRequestedAmount('')}
                className="px-2.5 py-1 text-xs text-slate-500 hover:text-slate-800 font-semibold cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>

          <div className="flex gap-1.5 pt-1">
            {[100, 250, 500, 1000].map((amt) => (
              <button
                key={amt}
                type="button"
                onClick={() => {
                  triggerKeypadHaptic();
                  setRequestedAmount(amt.toString());
                }}
                className="py-1 px-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[10px] font-bold cursor-pointer"
              >
                ₹{amt}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="text-center py-3 text-[11px] text-slate-400 font-mono">
        NPCI Unified Payments Interface &bull; BharatQR Standard
      </div>
    </div>
  );
};
