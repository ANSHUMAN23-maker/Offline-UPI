import React, { useEffect, useState, useRef } from 'react';
import QRCode from 'qrcode';
import { LanguageCode } from '../types';
import { TRANSLATIONS } from '../i18n/translations';
import { storage } from '../utils/storage';
import { ArrowLeft, Download, Share2, CheckCircle2 } from 'lucide-react';

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
  const upiPayUri = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(name)}`;

  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    setLoading(true);
    QRCode.toDataURL(
      upiPayUri,
      {
        width: 480,
        margin: 2,
        color: {
          dark: '#000000',
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
    navigator.clipboard.writeText(upiPayUri);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!qrDataUrl) return;
    const a = document.createElement('a');
    a.href = qrDataUrl;
    a.download = `UPI-QR-${upiId}.png`;
    a.click();
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col justify-between p-6 max-w-md mx-auto select-none">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-6 border-b border-slate-100">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-slate-600 hover:text-black py-2 px-1 text-sm font-medium transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{t.back}</span>
          </button>
          <span className="font-bold text-sm text-slate-900">{t.your_qr_code}</span>
          <div className="w-8" />
        </div>

        {/* QR Card Container */}
        <div className="mt-8 bg-slate-50 border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col items-center">
          {/* User Details Header */}
          <div className="text-center mb-5">
            <h3 className="font-extrabold text-lg text-slate-900">
              Name: {name}
            </h3>
            <p className="text-xs font-mono font-medium text-slate-600 mt-1">
              UPI ID: {upiId}
            </p>
          </div>

          {/* QR Canvas / Image */}
          <div className="w-64 h-64 bg-white p-3 rounded-2xl shadow-inner border border-slate-200 flex items-center justify-center relative">
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
            <canvas ref={canvasRef} className="hidden" />
          </div>

          {/* Payee string pill */}
          <div className="mt-4 text-center">
            <span className="inline-block text-[11px] font-mono text-slate-500 bg-white px-3 py-1 rounded-full border border-slate-200">
              Scan with any UPI App or Offline UPI Scanner
            </span>
          </div>

          {/* Actions */}
          <div className="flex gap-3 mt-6 w-full max-w-xs">
            <button
              onClick={handleCopyUri}
              className="flex-1 py-2.5 px-3 bg-white hover:bg-slate-100 text-slate-800 text-xs font-semibold rounded-xl border border-slate-300 flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
            >
              {copied ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5 text-slate-600" />
                  <span>Copy URI</span>
                </>
              )}
            </button>

            <button
              onClick={handleDownload}
              className="flex-1 py-2.5 px-3 bg-black hover:bg-slate-800 text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download</span>
            </button>
          </div>
        </div>
      </div>

      <div className="text-center py-4 text-xs text-slate-400 font-mono">
        Standard UPI QR Specification (NPCI)
      </div>
    </div>
  );
};
