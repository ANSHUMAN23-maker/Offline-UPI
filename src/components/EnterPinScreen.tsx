import React, { useState, useRef, useEffect } from 'react';
import { LanguageCode } from '../types';
import { TRANSLATIONS } from '../i18n/translations';
import { storage } from '../utils/storage';
import { Lock, ShieldAlert, Fingerprint, Delete, RotateCcw } from 'lucide-react';
import { BiometricPromptModal } from './BiometricPromptModal';
import { triggerKeypadHaptic, triggerHapticSuccess, triggerHapticError } from '../utils/haptics';

interface EnterPinScreenProps {
  currentLang: LanguageCode;
  onSuccess: () => void;
  onForgotPin: () => void;
}

export const EnterPinScreen: React.FC<EnterPinScreenProps> = ({
  currentLang,
  onSuccess,
  onForgotPin,
}) => {
  const t = TRANSLATIONS[currentLang];
  const [digits, setDigits] = useState<string[]>(['', '', '', '']);
  const [error, setError] = useState<string | null>(null);
  const [isBiometricModalOpen, setIsBiometricModalOpen] = useState<boolean>(false);
  const [biometricEnabled, setBiometricEnabled] = useState<boolean>(() => storage.isBiometricEnabled());

  const inputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  useEffect(() => {
    inputRefs[0].current?.focus();

    // Auto-trigger biometric authentication if enabled and PIN exists
    if (storage.isBiometricEnabled() && storage.hasPin()) {
      const timer = setTimeout(() => {
        setIsBiometricModalOpen(true);
      }, 350);
      return () => clearTimeout(timer);
    }
  }, []);

  const validatePin = (enteredPin: string) => {
    setError(null);
    if (enteredPin.length < 4) {
      setError('Please enter all 4 digits');
      triggerHapticError();
      return;
    }

    const storedPin = storage.getStoredPin();
    if (!storedPin || enteredPin === storedPin) {
      triggerHapticSuccess();
      storage.setLoggedIn(true);
      onSuccess();
    } else {
      triggerHapticError();
      setError('Incorrect PIN');
      setDigits(['', '', '', '']);
      inputRefs[0].current?.focus();
    }
  };

  const handleDigitChange = (index: number, val: string) => {
    triggerKeypadHaptic();
    const clean = val.replace(/\D/g, '');
    const newDigits = [...digits];

    if (clean.length > 0) {
      newDigits[index] = clean.slice(-1);
      setDigits(newDigits);
      if (index < 3) {
        inputRefs[index + 1].current?.focus();
      } else {
        // Auto-validate on 4th digit entered
        setTimeout(() => {
          const fullPin = [...newDigits.slice(0, 3), clean.slice(-1)].join('');
          validatePin(fullPin);
        }, 80);
      }
    } else {
      newDigits[index] = '';
      setDigits(newDigits);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      triggerKeypadHaptic();
      if (!digits[index] && index > 0) {
        inputRefs[index - 1].current?.focus();
      }
    }
  };

  /**
   * Number Pad click handler
   */
  const handlePadNumberClick = (num: number) => {
    triggerKeypadHaptic();
    setError(null);

    const firstEmptyIndex = digits.findIndex((d) => d === '');
    if (firstEmptyIndex !== -1) {
      const newDigits = [...digits];
      newDigits[firstEmptyIndex] = num.toString();
      setDigits(newDigits);

      if (firstEmptyIndex === 3) {
        // All 4 digits entered, validate immediately
        setTimeout(() => {
          validatePin(newDigits.join(''));
        }, 80);
      } else {
        inputRefs[firstEmptyIndex + 1].current?.focus();
      }
    } else {
      // If already full, start fresh with new digit
      const freshDigits = [num.toString(), '', '', ''];
      setDigits(freshDigits);
      inputRefs[1].current?.focus();
    }
  };

  /**
   * Number Pad Backspace handler
   */
  const handlePadBackspace = () => {
    triggerKeypadHaptic();
    const lastFilledIndex = [...digits].reverse().findIndex((d) => d !== '');
    if (lastFilledIndex !== -1) {
      const actualIndex = 3 - lastFilledIndex;
      const newDigits = [...digits];
      newDigits[actualIndex] = '';
      setDigits(newDigits);
      inputRefs[actualIndex].current?.focus();
    }
  };

  /**
   * Number Pad Clear handler
   */
  const handlePadClear = () => {
    triggerKeypadHaptic();
    setDigits(['', '', '', '']);
    setError(null);
    inputRefs[0].current?.focus();
  };

  const toggleBiometricSetting = () => {
    triggerKeypadHaptic();
    const next = !biometricEnabled;
    setBiometricEnabled(next);
    storage.setBiometricEnabled(next);
    if (next) {
      setIsBiometricModalOpen(true);
    }
  };

  return (
    <div id="enter-pin-screen" className="min-h-screen bg-white text-slate-900 flex flex-col justify-between p-4 sm:p-6 max-w-md mx-auto select-none">
      <div className="pt-6 sm:pt-10 flex-1 flex flex-col items-center">
        {/* Lock Graphic */}
        <div className="relative mb-4">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-slate-50 rounded-full flex items-center justify-center border border-slate-200 shadow-xs">
            <Lock className="w-8 h-8 sm:w-10 sm:h-10 text-slate-900" />
          </div>
          {biometricEnabled && (
            <button
              id="header-biometric-badge"
              type="button"
              onClick={() => {
                triggerKeypadHaptic();
                setIsBiometricModalOpen(true);
              }}
              className="absolute -bottom-1 -right-1 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-md hover:bg-emerald-600 transition-transform active:scale-95 cursor-pointer"
              title={t.use_biometric}
            >
              <Fingerprint className="w-4 h-4" />
            </button>
          )}
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-950 mb-1">
          {t.enter_pin}
        </h1>
        <p className="text-xs text-slate-500 mb-4 text-center max-w-xs">
          Enter your 4-digit security PIN or use biometrics to access Offline UPI
        </p>

        {error && (
          <div id="pin-error-banner" className="mb-4 w-full max-w-xs p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2 animate-shake">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* 4 Digit Boxes */}
        <div className="flex gap-3 mb-4">
          {digits.map((digit, idx) => (
            <input
              key={idx}
              id={`pin-digit-${idx}`}
              ref={inputRefs[idx]}
              type="password"
              inputMode="none" // Use on-screen pad or external keyboard
              maxLength={1}
              value={digit}
              onChange={(e) => handleDigitChange(idx, e.target.value)}
              onKeyDown={(e) => handleKeyDown(idx, e)}
              className={`w-13 h-14 sm:w-14 sm:h-16 text-center text-3xl font-mono font-bold rounded-2xl focus:outline-none transition-all ${
                digit
                  ? 'bg-slate-900 text-white border-2 border-black scale-105 shadow-sm'
                  : 'bg-slate-50 border-2 border-slate-300 text-slate-900 focus:border-black focus:ring-2 focus:ring-black'
              }`}
            />
          ))}
        </div>

        {/* Tactile On-Screen Number Pad (with haptic feedback on every click) */}
        <div id="pin-number-pad" className="w-full max-w-xs grid grid-cols-3 gap-2.5 sm:gap-3 my-2">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <button
              key={num}
              id={`numpad-btn-${num}`}
              type="button"
              onClick={() => handlePadNumberClick(num)}
              className="h-13 sm:h-15 rounded-2xl bg-slate-50 hover:bg-slate-100 active:bg-slate-900 active:text-white active:scale-92 border border-slate-200 text-xl font-bold font-mono text-slate-900 shadow-xs flex items-center justify-center transition-all cursor-pointer select-none"
            >
              {num}
            </button>
          ))}

          {/* Biometric Quick Trigger / Clear key */}
          <button
            id="numpad-btn-biometric"
            type="button"
            onClick={() => {
              triggerKeypadHaptic();
              setIsBiometricModalOpen(true);
            }}
            className="h-13 sm:h-15 rounded-2xl bg-emerald-50 hover:bg-emerald-100 active:bg-emerald-600 active:text-white active:scale-92 border border-emerald-200 text-emerald-700 shadow-xs flex items-center justify-center transition-all cursor-pointer"
            title="Biometric Verification"
          >
            <Fingerprint className="w-6 h-6" />
          </button>

          {/* 0 Key */}
          <button
            id="numpad-btn-0"
            type="button"
            onClick={() => handlePadNumberClick(0)}
            className="h-13 sm:h-15 rounded-2xl bg-slate-50 hover:bg-slate-100 active:bg-slate-900 active:text-white active:scale-92 border border-slate-200 text-xl font-bold font-mono text-slate-900 shadow-xs flex items-center justify-center transition-all cursor-pointer select-none"
          >
            0
          </button>

          {/* Backspace Key */}
          <button
            id="numpad-btn-backspace"
            type="button"
            onClick={handlePadBackspace}
            className="h-13 sm:h-15 rounded-2xl bg-slate-100 hover:bg-slate-200 active:bg-slate-300 active:scale-92 border border-slate-200 text-slate-700 shadow-xs flex items-center justify-center transition-all cursor-pointer"
            title="Backspace"
          >
            <Delete className="w-5 h-5" />
          </button>
        </div>

        {/* Auxiliary Controls */}
        <div className="w-full max-w-xs flex items-center justify-between mt-3 px-1">
          <button
            id="pin-clear-btn"
            type="button"
            onClick={handlePadClear}
            className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 font-medium transition-colors cursor-pointer py-1"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Clear PIN</span>
          </button>

          <button
            id="pin-forgot-button"
            type="button"
            onClick={() => {
              triggerKeypadHaptic();
              onForgotPin();
            }}
            className="text-xs text-slate-600 hover:text-black font-semibold hover:underline transition-colors cursor-pointer py-1"
          >
            {t.forget_pin}?
          </button>
        </div>

        {/* Biometric Preference Toggle */}
        <div className="w-full max-w-xs flex items-center justify-between py-2 px-3 mt-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700">
          <div className="flex items-center gap-2">
            <Fingerprint className="w-4 h-4 text-slate-600" />
            <span className="font-medium">Auto-trigger Biometrics</span>
          </div>
          <button
            id="biometric-toggle-switch"
            type="button"
            role="switch"
            aria-checked={biometricEnabled}
            onClick={toggleBiometricSetting}
            className={`w-10 h-5.5 flex items-center rounded-full p-0.5 transition-colors cursor-pointer ${
              biometricEnabled ? 'bg-emerald-600' : 'bg-slate-300'
            }`}
          >
            <div
              className={`bg-white w-4.5 h-4.5 rounded-full shadow-md transform transition-transform ${
                biometricEnabled ? 'translate-x-4.5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      <div className="text-center py-2 text-[10px] text-slate-400 font-mono flex items-center justify-center gap-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
        <span>Tactile Haptic Feedback Enabled &bull; KeyStore Protected</span>
      </div>

      {/* Biometric Authentication Prompt Modal */}
      <BiometricPromptModal
        isOpen={isBiometricModalOpen}
        currentLang={currentLang}
        onClose={() => {
          setIsBiometricModalOpen(false);
          inputRefs[0].current?.focus();
        }}
        onSuccess={() => {
          setIsBiometricModalOpen(false);
          onSuccess();
        }}
      />
    </div>
  );
};
