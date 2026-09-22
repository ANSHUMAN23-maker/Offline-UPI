import React, { useState, useEffect } from 'react';
import { LanguageCode } from '../types';
import { TRANSLATIONS } from '../i18n/translations';
import { storage } from '../utils/storage';
import { triggerHapticSuccess, triggerHapticError, triggerKeypadHaptic } from '../utils/haptics';
import { Fingerprint, CheckCircle2, ShieldAlert, KeyRound, X } from 'lucide-react';

interface BiometricPromptModalProps {
  isOpen: boolean;
  currentLang: LanguageCode;
  onClose: () => void;
  onSuccess: () => void;
}

export const BiometricPromptModal: React.FC<BiometricPromptModalProps> = ({
  isOpen,
  currentLang,
  onClose,
  onSuccess,
}) => {
  const t = TRANSLATIONS[currentLang];
  const [authStatus, setAuthStatus] = useState<'idle' | 'scanning' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      setAuthStatus('idle');
      setErrorMessage('');

      // Auto-trigger biometric scan after a brief 300ms delay to feel natural like native OS prompts
      const timer = setTimeout(() => {
        handleTriggerScan();
      }, 400);

      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleTriggerScan = () => {
    const storedPin = storage.getStoredPin();
    if (!storedPin) {
      setAuthStatus('error');
      setErrorMessage('No PIN registered. Please enter PIN manually.');
      triggerHapticError();
      return;
    }

    setAuthStatus('scanning');
    setErrorMessage('');

    // Simulate authentic biometric hardware capture (touch / FaceID)
    setTimeout(() => {
      // Biometric hardware matched with Keystore credentials
      setAuthStatus('success');
      triggerHapticSuccess();

      setTimeout(() => {
        storage.setLoggedIn(true);
        onSuccess();
      }, 600);
    }, 850);
  };

  const handleSimulateFailure = () => {
    setAuthStatus('error');
    setErrorMessage(t.biometric_failed);
    triggerHapticError();
  };

  return (
    <div
      id="biometric-modal-backdrop"
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 transition-opacity animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget && authStatus !== 'scanning' && authStatus !== 'success') {
          onClose();
        }
      }}
    >
      <div
        id="biometric-modal-card"
        className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl border border-slate-100 transform transition-transform animate-in slide-in-from-bottom duration-300 relative select-none"
      >
        {/* Close icon button */}
        {authStatus !== 'scanning' && authStatus !== 'success' && (
          <button
            id="biometric-close-button"
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* Header Branding */}
        <div className="flex flex-col items-center text-center pt-2 pb-4">
          <div className="w-10 h-1 bg-slate-200 rounded-full mb-5 sm:hidden" />

          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full mb-3 flex items-center gap-1 border border-emerald-100">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Keystore Biometric Layer
          </span>

          <h2 className="text-xl font-bold text-slate-900 mb-1">
            {t.biometric_prompt}
          </h2>
          <p className="text-xs text-slate-500 max-w-xs leading-relaxed">
            {authStatus === 'success'
              ? t.biometric_success
              : authStatus === 'error'
              ? errorMessage || t.biometric_failed
              : t.touch_sensor}
          </p>
        </div>

        {/* Biometric Interactive Sensor Target */}
        <div className="my-6 flex flex-col items-center justify-center">
          <button
            id="biometric-sensor-trigger"
            type="button"
            disabled={authStatus === 'scanning' || authStatus === 'success'}
            onClick={() => {
              triggerKeypadHaptic();
              handleTriggerScan();
            }}
            className={`relative w-28 h-28 rounded-full flex items-center justify-center transition-all cursor-pointer ${
              authStatus === 'success'
                ? 'bg-emerald-500 text-white scale-105 shadow-lg shadow-emerald-500/30'
                : authStatus === 'error'
                ? 'bg-red-50 text-red-600 border-2 border-red-300'
                : authStatus === 'scanning'
                ? 'bg-slate-900 text-white scale-100 shadow-xl'
                : 'bg-slate-50 text-slate-800 border-2 border-slate-200 hover:border-black hover:bg-slate-100 active:scale-95 shadow-inner'
            }`}
          >
            {/* Animated Pulses when scanning */}
            {authStatus === 'scanning' && (
              <>
                <span className="absolute inset-0 rounded-full border-2 border-emerald-400 animate-ping opacity-60" />
                <span className="absolute -inset-3 rounded-full border border-slate-300 animate-pulse opacity-40" />
              </>
            )}

            {authStatus === 'success' ? (
              <CheckCircle2 className="w-14 h-14 animate-in zoom-in-50 duration-200" />
            ) : authStatus === 'error' ? (
              <ShieldAlert className="w-12 h-12 text-red-500 animate-shake" />
            ) : (
              <Fingerprint
                className={`w-14 h-14 transition-all ${
                  authStatus === 'scanning' ? 'text-emerald-400 animate-pulse' : 'text-slate-800'
                }`}
              />
            )}
          </button>

          {/* Status Label */}
          <div className="mt-4 text-center">
            {authStatus === 'scanning' && (
              <p className="text-xs font-semibold text-slate-700 animate-pulse">
                Verifying fingerprint / face credentials...
              </p>
            )}
            {authStatus === 'success' && (
              <p className="text-xs font-bold text-emerald-600">
                Identity verified! Unlocking...
              </p>
            )}
            {authStatus === 'error' && (
              <button
                type="button"
                onClick={handleTriggerScan}
                className="text-xs font-semibold text-slate-900 hover:underline cursor-pointer"
              >
                Tap sensor to retry
              </button>
            )}
            {authStatus === 'idle' && (
              <p className="text-[11px] text-slate-400">
                Tap the sensor above to authenticate
              </p>
            )}
          </div>
        </div>

        {/* Fallback Option */}
        <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
          <button
            id="biometric-use-pin-button"
            type="button"
            onClick={() => {
              triggerKeypadHaptic();
              onClose();
            }}
            className="w-full py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <KeyRound className="w-4 h-4 text-slate-600" />
            <span>{t.use_pin_instead}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
