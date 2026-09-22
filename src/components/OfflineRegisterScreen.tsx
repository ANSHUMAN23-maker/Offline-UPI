import React, { useState } from 'react';
import { LanguageCode } from '../types';
import { TRANSLATIONS } from '../i18n/translations';
import { executeUssdCall, simulateUssdResponse } from '../utils/ussd';
import { PhoneCall, CheckCircle2, ArrowRight, ArrowLeft } from 'lucide-react';

interface OfflineRegisterScreenProps {
  currentLang: LanguageCode;
  onContinue?: () => void;
  onBack?: () => void;
  onOpenUssdModal?: (dialCode: string, title: string, response: string, options?: { key: string; label: string }[]) => void;
}

export const OfflineRegisterScreen: React.FC<OfflineRegisterScreenProps> = ({
  currentLang,
  onContinue,
  onBack,
  onOpenUssdModal,
}) => {
  const t = TRANSLATIONS[currentLang];
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const handleSetup = () => {
    const dialCode = '*99#';
    executeUssdCall(dialCode);
    const resp = simulateUssdResponse(dialCode);
    if (onOpenUssdModal) {
      onOpenUssdModal(resp.dialCode, resp.title, resp.body, resp.options);
    }
  };

  return (
    <div className="min-h-screen bg-[#BBDEFB] text-slate-900 flex flex-col justify-between p-6 max-w-md mx-auto select-none">
      <div className="space-y-6">
        {/* Header with back button */}
        <div className="flex items-center justify-between pt-2">
          {onBack ? (
            <button
              onClick={onBack}
              className="flex items-center gap-1.5 text-slate-800 hover:text-black py-2 px-1 text-sm font-semibold transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{t.back}</span>
            </button>
          ) : (
            <div />
          )}
          <span className="font-bold text-xs text-slate-800">NUUP Setup</span>
          <div className="w-8" />
        </div>

        <div className="text-center pt-2">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-black">
            {t.activate_offline_upi}
          </h1>
          <p className="text-xs text-slate-700 mt-1">
            National Unified USSD Platform (*99#) Setup
          </p>
        </div>

        {/* Info Card */}
        <div className="bg-white/95 rounded-2xl p-6 shadow-md border border-white space-y-4">
          <div className="flex items-center gap-2 text-slate-800 font-semibold text-sm border-b border-slate-100 pb-3">
            <CheckCircle2 className="w-5 h-5 text-sky-600 shrink-0" />
            <span>Instructions</span>
          </div>

          <div className="text-slate-800 text-sm leading-relaxed whitespace-pre-line font-medium">
            {t.Activate_info}
          </div>
        </div>

        {/* Action Buttons: Setup & Continue */}
        <div className="flex gap-4 pt-2">
          <button
            type="button"
            onClick={handleSetup}
            className="flex-1 py-3.5 px-4 bg-black hover:bg-slate-900 text-white font-bold text-sm rounded-xl shadow-md active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <PhoneCall className="w-4 h-4 text-emerald-400" />
            <span>{t.setup}</span>
          </button>

          <button
            type="button"
            onClick={() => setShowConfirmDialog(true)}
            className="flex-1 py-3.5 px-4 bg-black hover:bg-slate-900 text-white font-bold text-sm rounded-xl shadow-md active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>{t.continue_next}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="text-center py-4 text-xs text-slate-600">
        Dial *99# anytime on your phone to link your bank account
      </div>

      {/* Confirmation Dialog */}
      {showConfirmDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-xs bg-white rounded-2xl p-6 shadow-2xl space-y-4 border border-slate-200">
            <h3 className="font-bold text-lg text-slate-900">{t.confirm_continue}</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              {t.did_you_complete_setup}
            </p>
            <div className="flex justify-end gap-3 pt-3">
              <button
                type="button"
                onClick={() => setShowConfirmDialog(false)}
                className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              >
                {t.no}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowConfirmDialog(false);
                  if (onContinue) onContinue();
                }}
                className="px-5 py-2 text-sm font-semibold bg-black hover:bg-slate-900 text-white rounded-lg shadow transition-all cursor-pointer"
              >
                {t.yes}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
