import React from 'react';
import { LanguageCode } from '../types';
import { LANGUAGES, TRANSLATIONS } from '../i18n/translations';

interface GetStartedScreenProps {
  currentLang: LanguageCode;
  onSelectLanguage: (lang: LanguageCode) => void;
  onContinue?: () => void;
  onGetStarted?: () => void;
  onActivateOffline?: () => void;
}

export const GetStartedScreen: React.FC<GetStartedScreenProps> = ({
  currentLang,
  onSelectLanguage,
  onContinue,
  onGetStarted,
  onActivateOffline,
}) => {
  const t = TRANSLATIONS[currentLang];
  const handleProceed = onGetStarted || onContinue;

  return (
    <div className="min-h-screen bg-black text-white flex flex-col justify-between items-center p-6 select-none max-w-md mx-auto">
      {/* Top Section with App Name (no icon in replacement) */}
      <div className="w-full flex-1 flex flex-col items-center justify-center pt-12 pb-6">
        <div className="text-center">
          <h1 className="text-5xl font-black tracking-wider text-white font-mono uppercase">
            OFFPAY
          </h1>
        </div>
      </div>

      {/* Language Selector & Continue Button */}
      <div className="w-full space-y-5 pb-12 flex flex-col items-center">
        {/* Language Selection Spinner */}
        <div className="w-64 relative">
          <label className="block text-[11px] font-medium text-slate-400 uppercase tracking-wider mb-1.5 text-center">
            {t.change_language}
          </label>
          <select
            value={currentLang}
            onChange={(e) => onSelectLanguage(e.target.value as LanguageCode)}
            className="w-full h-12 px-4 bg-white text-black text-base font-semibold rounded-xl appearance-none shadow-md focus:outline-none focus:ring-2 focus:ring-slate-400 text-center cursor-pointer"
          >
            {LANGUAGES.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.label}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute right-4 top-[34px] flex items-center text-slate-700">
            <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
              <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
            </svg>
          </div>
        </div>

        {/* Continue Button */}
        <button
          onClick={handleProceed}
          className="w-64 h-14 bg-white text-black text-xl font-bold rounded-xl shadow-lg hover:bg-slate-100 active:scale-95 transition-all flex items-center justify-center cursor-pointer"
        >
          {t.continue_next}
        </button>

        {onActivateOffline && (
          <button
            onClick={onActivateOffline}
            className="text-xs text-slate-400 hover:text-white underline underline-offset-4 transition-colors cursor-pointer pt-2"
          >
            {t.activate_offline_upi}
          </button>
        )}
      </div>
    </div>
  );
};
