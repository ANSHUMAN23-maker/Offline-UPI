import React, { useState } from 'react';
import { LanguageCode, ScreenType, UserData } from '../types';
import { LANGUAGES, TRANSLATIONS } from '../i18n/translations';
import { storage } from '../utils/storage';
import { executeUssdCall, simulateUssdResponse } from '../utils/ussd';
import { ArrowLeft, User, Phone, AtSign, QrCode, Landmark, Globe, LogOut, KeyRound, Edit3, Fingerprint, Smartphone, Volume2, Receipt, BookOpen } from 'lucide-react';
import { triggerKeypadHaptic, triggerPaymentSuccessHaptic, haptics } from '../utils/haptics';
import { UpiGuideModal } from './UpiGuideModal';

interface MenuScreenProps {
  currentLang: LanguageCode;
  onNavigate: (screen: ScreenType) => void;
  onSelectLanguage: (lang: LanguageCode) => void;
  onLogout: () => void;
  onOpenUssdModal: (
    dialCode: string,
    title: string,
    response: string,
    options?: { key: string; label: string }[]
  ) => void;
}

export const MenuScreen: React.FC<MenuScreenProps> = ({
  currentLang,
  onNavigate,
  onSelectLanguage,
  onLogout,
  onOpenUssdModal,
}) => {
  const t = TRANSLATIONS[currentLang];
  const userData: UserData = storage.getUserData();
  const [selectedLangOption, setSelectedLangOption] = useState<LanguageCode>(currentLang);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState<boolean>(() => storage.isBiometricEnabled());
  const [hapticSoundEnabled, setHapticSoundEnabled] = useState<boolean>(() => haptics.isSoundEnabled());
  const [showGuideModal, setShowGuideModal] = useState(false);

  const handleChangeBankAccount = () => {
    const dialCode = '*99*4*1#';
    executeUssdCall(dialCode);
    const resp = simulateUssdResponse(dialCode);
    onOpenUssdModal(resp.dialCode, resp.title, resp.body, resp.options);
  };

  const handleChangeLanguage = () => {
    const option = LANGUAGES.find((l) => l.code === selectedLangOption);
    const codeNum = option ? option.ussdCode : '*1#';
    const dialCode = `*99*4*2${codeNum}`;
    executeUssdCall(dialCode);
    storage.setLanguage(selectedLangOption);
    onSelectLanguage(selectedLangOption);
    const resp = simulateUssdResponse(dialCode);
    onOpenUssdModal(resp.dialCode, resp.title, resp.body, resp.options);
  };

  return (
    <div className="min-h-screen bg-[#BBDEFB] text-slate-900 flex flex-col justify-between p-6 max-w-md mx-auto select-none">
      <div>
        {/* Back Button */}
        <div className="flex items-center justify-between pb-4">
          <button
            onClick={() => onNavigate('main')}
            className="flex items-center gap-1.5 text-slate-800 hover:text-black py-2 px-1 text-sm font-semibold transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{t.back}</span>
          </button>
          <span className="font-bold text-sm text-slate-900">Profile & Settings</span>
          <div className="w-8" />
        </div>

        {/* User Info Card */}
        <div className="mt-2 bg-white/95 rounded-2xl p-5 shadow-sm border border-white space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-lg">
              {userData.myName ? userData.myName.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-base text-slate-950 truncate flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span>{userData.myName || 'User'}</span>
              </h3>
              <p className="text-xs text-slate-600 font-mono flex items-center gap-1 mt-0.5">
                <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                <span>+91 {userData.myPhone || '9999999999'}</span>
              </p>
              <p className="text-xs text-slate-600 font-mono flex items-center gap-1 mt-0.5 truncate">
                <AtSign className="w-3 h-3 text-slate-400 shrink-0" />
                <span>{userData.myUPIid || 'Enter UPI Id'}</span>
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
            <button
              onClick={() => onNavigate('register')}
              className="py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5 text-slate-600" />
              <span>{t.edit_info}</span>
            </button>
            <button
              onClick={() => onNavigate('use_security_question')}
              className="py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <KeyRound className="w-3.5 h-3.5 text-slate-600" />
              <span>{t.reset_pin}</span>
            </button>
          </div>
        </div>

        {/* Account & Service Actions Card */}
        <div className="mt-4 bg-white/95 rounded-2xl p-4 shadow-sm border border-white space-y-2">
          {/* Your QR Code */}
          <button
            onClick={() => onNavigate('qr_generate')}
            className="w-full p-3 bg-slate-50 hover:bg-slate-100 rounded-xl flex items-center justify-between transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-sky-100 flex items-center justify-center text-sky-700">
                <QrCode className="w-4 h-4" />
              </div>
              <span className="text-xs font-semibold text-slate-900">{t.your_qr_code}</span>
            </div>
            <span className="text-xs text-slate-400">→</span>
          </button>

          {/* Passbook & Transaction History */}
          <button
            onClick={() => {
              triggerKeypadHaptic();
              onNavigate('transaction_history');
            }}
            className="w-full p-3 bg-slate-50 hover:bg-slate-100 rounded-xl flex items-center justify-between transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-700">
                <Receipt className="w-4 h-4" />
              </div>
              <div className="text-left">
                <span className="text-xs font-semibold text-slate-900 block">
                  Passbook &amp; History
                </span>
                <span className="text-[10px] text-slate-500">Live UTR receipts &amp; balance</span>
              </div>
            </div>
            <span className="text-xs text-slate-400">&rarr;</span>
          </button>

          {/* Production UPI Implementation Guide */}
          <button
            onClick={() => {
              triggerKeypadHaptic();
              setShowGuideModal(true);
            }}
            className="w-full p-3 bg-emerald-50/70 hover:bg-emerald-100/80 border border-emerald-200/80 rounded-xl flex items-center justify-between transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center">
                <BookOpen className="w-4 h-4" />
              </div>
              <div className="text-left">
                <span className="text-xs font-bold text-emerald-950 block">
                  Production UPI Setup Guide
                </span>
                <span className="text-[10px] text-emerald-800">TPAP, Razorpay, NPCI requirements</span>
              </div>
            </div>
            <span className="text-xs text-emerald-700 font-bold">&rarr;</span>
          </button>

          {/* Change Bank Account */}
          <button
            onClick={handleChangeBankAccount}
            className="w-full p-3 bg-slate-50 hover:bg-slate-100 rounded-xl flex items-center justify-between transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-700">
                <Landmark className="w-4 h-4" />
              </div>
              <div className="text-left">
                <span className="text-xs font-semibold text-slate-900 block">
                  {t.change_bank_account}
                </span>
                <span className="text-[10px] font-mono text-slate-500">NUUP *99*4*1#</span>
              </div>
            </div>
            <span className="text-xs text-slate-400">→</span>
          </button>

          {/* Biometric Authentication Setting */}
          <div className="p-3.5 bg-slate-50 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <Fingerprint className="w-4 h-4" />
              </div>
              <div className="text-left">
                <span className="text-xs font-semibold text-slate-900 block">
                  Biometric Fast Unlock
                </span>
                <span className="text-[10px] text-slate-500">
                  Fingerprint / Face ID for Enter PIN
                </span>
              </div>
            </div>
            <button
              id="menu-biometric-toggle"
              type="button"
              role="switch"
              aria-checked={biometricEnabled}
              onClick={() => {
                const next = !biometricEnabled;
                setBiometricEnabled(next);
                storage.setBiometricEnabled(next);
              }}
              className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
                biometricEnabled ? 'bg-emerald-600' : 'bg-slate-300'
              }`}
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                  biometricEnabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Tactile & Haptic Vibration Feedback Setting */}
          <div className="p-3.5 bg-slate-50 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center">
                  <Smartphone className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <span className="text-xs font-semibold text-slate-900 block">
                    Tactile Haptic Feedback
                  </span>
                  <span className="text-[10px] text-slate-500">
                    Vibrations on PIN keys & payments
                  </span>
                </div>
              </div>
              <button
                id="menu-haptic-sound-toggle"
                type="button"
                role="switch"
                aria-checked={hapticSoundEnabled}
                onClick={() => {
                  const next = !hapticSoundEnabled;
                  setHapticSoundEnabled(next);
                  haptics.setSoundEnabled(next);
                  triggerKeypadHaptic();
                }}
                className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
                  hapticSoundEnabled ? 'bg-indigo-600' : 'bg-slate-300'
                }`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                    hapticSoundEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Test Haptic Buttons */}
            <div className="flex gap-2 pt-1 border-t border-slate-200/60">
              <button
                type="button"
                onClick={() => triggerKeypadHaptic()}
                className="flex-1 py-1.5 px-2 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-lg text-[11px] font-medium transition-colors active:scale-95 cursor-pointer"
              >
                Test Key Click
              </button>
              <button
                type="button"
                onClick={() => triggerPaymentSuccessHaptic()}
                className="flex-1 py-1.5 px-2 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 rounded-lg text-[11px] font-medium transition-colors active:scale-95 cursor-pointer"
              >
                Test Payment Chime
              </button>
            </div>
          </div>

          {/* Change Language Section */}
          <div className="p-3 bg-slate-50 rounded-xl space-y-2">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-slate-600" />
              <span className="text-xs font-semibold text-slate-900">{t.change_language}</span>
            </div>
            <div className="flex gap-2">
              <select
                value={selectedLangOption}
                onChange={(e) => setSelectedLangOption(e.target.value as LanguageCode)}
                className="flex-1 px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-900 focus:outline-none cursor-pointer"
              >
                {LANGUAGES.map((l) => (
                  <option key={l.code} value={l.code}>
                    {l.label} ({l.ussdCode})
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={handleChangeLanguage}
                className="px-3 py-2 bg-black hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer shrink-0"
              >
                Apply
              </button>
            </div>
          </div>
        </div>

        {/* Log Out Button */}
        <div className="mt-4">
          <button
            type="button"
            onClick={() => setShowLogoutDialog(true)}
            className="w-full py-3.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-sm active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>{t.log_out}</span>
          </button>
        </div>
      </div>

      <div className="text-center py-2 text-[11px] text-slate-600 font-mono">
        Offline UPI v1.0.0 (NPCI NUUP)
      </div>

      {/* Logout Confirmation Dialog */}
      {showLogoutDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-xs bg-white rounded-2xl p-6 shadow-2xl space-y-4 border border-slate-200">
            <h3 className="font-bold text-base text-slate-900">{t.confirm_logout}</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              {t.are_you_sure_logout}
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowLogoutDialog(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 rounded-lg transition-colors cursor-pointer"
              >
                {t.no}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowLogoutDialog(false);
                  storage.logout();
                  onLogout();
                }}
                className="px-5 py-2 text-xs font-semibold bg-red-600 hover:bg-red-700 text-white rounded-lg shadow transition-all cursor-pointer"
              >
                {t.yes}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Production Guide Modal */}
      <UpiGuideModal
        isOpen={showGuideModal}
        onClose={() => setShowGuideModal(false)}
      />
    </div>
  );
};
