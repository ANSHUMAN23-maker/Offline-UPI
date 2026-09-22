import React, { useState } from 'react';
import { LanguageCode } from '../types';
import { TRANSLATIONS } from '../i18n/translations';
import { buildUssdToUpi, executeUssdCall, simulateUssdResponse } from '../utils/ussd';
import { triggerHapticSuccess } from '../utils/haptics';
import { ArrowLeft, AtSign, Copy, Send, CheckCircle2 } from 'lucide-react';

interface ToUpiScreenProps {
  currentLang: LanguageCode;
  onBack: () => void;
  onOpenUssdModal: (
    dialCode: string,
    title: string,
    response: string,
    options?: { key: string; label: string }[]
  ) => void;
}

export const ToUpiScreen: React.FC<ToUpiScreenProps> = ({
  currentLang,
  onBack,
  onOpenUssdModal,
}) => {
  const t = TRANSLATIONS[currentLang];
  const [upiId, setUpiId] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [showOverlay, setShowOverlay] = useState(false);

  const handlePay = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmed = upiId.trim();
    if (!trimmed) {
      setError('Please enter a UPI ID.');
      return;
    }

    // Copy to clipboard
    try {
      navigator.clipboard.writeText(trimmed);
      triggerHapticSuccess();
    } catch {
      // fallback
    }

    // Show overlay popup for 6 seconds (matching original toUPI.java)
    setShowOverlay(true);
    setTimeout(() => {
      setShowOverlay(false);
    }, 6000);

    const dialString = buildUssdToUpi();
    executeUssdCall(dialString);
    const resp = simulateUssdResponse(dialString, { upiId: trimmed });
    onOpenUssdModal(resp.dialCode, resp.title, resp.body, resp.options);
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col justify-between p-6 max-w-md mx-auto select-none relative">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-6 border-b border-slate-100">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-slate-600 hover:text-black py-2 px-1 text-sm font-medium transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{t.back}</span>
          </button>
          <span className="font-bold text-sm text-slate-900">{t.upi_transfer}</span>
          <div className="w-6" />
        </div>

        {/* 6-Second Overlay Notice mirroring overlay_layout.xml */}
        {showOverlay && (
          <div className="mt-4 p-4 bg-sky-50 border border-sky-200 rounded-2xl shadow-lg animate-in slide-in-from-top duration-300">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-xs text-sky-950 uppercase tracking-wide">
                  UPI ID Copied to Clipboard
                </h4>
                <p className="text-xs text-sky-800 mt-1 leading-relaxed">
                  Dialing *99*1*3#... When prompted by the cellular USSD session, simply paste your copied UPI ID.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="text-center mt-10 mb-8">
          <div className="w-16 h-16 bg-sky-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-sky-100">
            <AtSign className="w-8 h-8 text-sky-600" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-950">
            {t.upi_transfer}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Send money offline using beneficiary UPI Virtual Payment Address
          </p>
        </div>

        {error && (
          <div className="mb-5 p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
            <span className="font-semibold">Notice:</span> {error}
          </div>
        )}

        {/* UPI Form */}
        <form onSubmit={handlePay} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {t.enter_upi_id} <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                placeholder="name@okhdfcbank"
                className="w-full px-4 py-3.5 pl-11 pr-20 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-black font-mono transition-all"
              />
              <AtSign className="w-4 h-4 text-slate-400 absolute left-3.5 top-4" />
              <button
                type="button"
                onClick={async () => {
                  try {
                    const text = await navigator.clipboard.readText();
                    if (text) setUpiId(text);
                  } catch {
                    // ignore
                  }
                }}
                className="absolute right-2 top-2 px-2.5 py-1.5 text-[11px] font-bold bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg flex items-center gap-1 transition-colors"
              >
                <Copy className="w-3 h-3" />
                <span>Paste</span>
              </button>
            </div>
          </div>

          <div className="pt-6 flex justify-center">
            <button
              type="submit"
              className="w-48 py-3.5 bg-black hover:bg-slate-900 text-white font-bold text-base rounded-xl shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Send className="w-4 h-4 text-emerald-400" />
              <span>{t.pay}</span>
            </button>
          </div>
        </form>
      </div>

      <div className="text-center py-4 text-xs text-slate-500 font-mono">
        NPCI Dial Code: *99*1*3#
      </div>
    </div>
  );
};
