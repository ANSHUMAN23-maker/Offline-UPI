import React, { useState } from 'react';
import { LanguageCode } from '../types';
import { TRANSLATIONS } from '../i18n/translations';
import { storage } from '../utils/storage';
import { Lock, ShieldCheck } from 'lucide-react';
import { triggerKeypadHaptic, triggerHapticSuccess, triggerHapticError } from '../utils/haptics';

interface SetPinScreenProps {
  currentLang: LanguageCode;
  onSuccess: () => void;
}

export const SetPinScreen: React.FC<SetPinScreenProps> = ({ currentLang, onSuccess }) => {
  const t = TRANSLATIONS[currentLang];
  const [pin, setPinState] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (pin.length !== 4) {
      setError('PIN must be 4 digits');
      triggerHapticError();
      return;
    }

    if (pin !== confirmPin) {
      setError('PINs do not match');
      triggerHapticError();
      return;
    }

    // Save encrypted PIN
    storage.setPin(pin);
    triggerHapticSuccess();
    onSuccess();
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col justify-between p-6 max-w-md mx-auto select-none">
      <div className="pt-12">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-slate-200">
            <Lock className="w-8 h-8 text-black" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-950">
            {t.set_pin}
          </h1>
          <p className="text-xs text-slate-500 mt-2">
            Create a secure 4-digit PIN for offline access
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
            <span className="font-semibold">Notice:</span> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* PIN Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2 text-center uppercase tracking-wider">
              {t.enter_pin}
            </label>
            <div className="flex justify-center">
              <input
                type="password"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={4}
                value={pin}
                onChange={(e) => {
                  triggerKeypadHaptic();
                  setPinState(e.target.value.replace(/\D/g, ''));
                }}
                placeholder="****"
                className="w-48 h-14 text-center tracking-[0.5em] text-2xl font-bold bg-slate-50 border-2 border-slate-300 rounded-xl focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all"
              />
            </div>
          </div>

          {/* Confirm PIN Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2 text-center uppercase tracking-wider">
              {t.confirm_pin}
            </label>
            <div className="flex justify-center">
              <input
                type="password"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={4}
                value={confirmPin}
                onChange={(e) => {
                  triggerKeypadHaptic();
                  setConfirmPin(e.target.value.replace(/\D/g, ''));
                }}
                placeholder="****"
                className="w-48 h-14 text-center tracking-[0.5em] text-2xl font-bold bg-slate-50 border-2 border-slate-300 rounded-xl focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all"
              />
            </div>
          </div>

          <div className="pt-6 flex justify-center">
            <button
              type="submit"
              className="w-48 py-3.5 bg-black hover:bg-slate-900 text-white font-bold text-base rounded-xl shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <span>{t.submit}</span>
            </button>
          </div>
        </form>
      </div>

      <div className="text-center py-4 text-xs text-slate-400 font-mono">
        Your PIN is stored securely in encrypted storage
      </div>
    </div>
  );
};
