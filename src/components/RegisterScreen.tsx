import React, { useState } from 'react';
import { LanguageCode, UserData } from '../types';
import { TRANSLATIONS } from '../i18n/translations';
import { storage } from '../utils/storage';
import { User, Phone, AtSign, ArrowLeft, Landmark, Wallet, CheckCircle2 } from 'lucide-react';
import { triggerKeypadHaptic } from '../utils/haptics';

interface RegisterScreenProps {
  currentLang: LanguageCode;
  isEditing?: boolean;
  onSuccess: (data?: UserData) => void;
  onBack?: () => void;
}

const SUPPORTED_BANKS = [
  { name: 'State Bank of India (SBI)', handle: '@oksbi', code: 'SBIN' },
  { name: 'HDFC Bank', handle: '@okhdfcbank', code: 'HDFC' },
  { name: 'ICICI Bank', handle: '@okicici', code: 'ICIC' },
  { name: 'Axis Bank', handle: '@okaxis', code: 'UTIB' },
  { name: 'Punjab National Bank (PNB)', handle: '@okpnb', code: 'PUNB' },
  { name: 'Bank of Baroda', handle: '@barodampay', code: 'BARB' },
  { name: 'Kotak Mahindra Bank', handle: '@kotak', code: 'KKBK' },
  { name: 'Other Indian Bank', handle: '@upi', code: 'NPCI' },
];

export const RegisterScreen: React.FC<RegisterScreenProps> = ({
  currentLang,
  isEditing = false,
  onSuccess,
  onBack,
}) => {
  const t = TRANSLATIONS[currentLang];
  const existingData = storage.getUserData();

  const [name, setName] = useState(isEditing ? existingData.myName : '');
  const [phone, setPhone] = useState(isEditing ? existingData.myPhone : '');
  const [selectedBank, setSelectedBank] = useState(existingData.myBank || SUPPORTED_BANKS[0].name);
  const [upiId, setUpiId] = useState(isEditing ? existingData.myUPIid : '');
  const [error, setError] = useState<string | null>(null);

  const handleBankChange = (bankName: string) => {
    setSelectedBank(bankName);
    const bankObj = SUPPORTED_BANKS.find((b) => b.name === bankName);
    if (bankObj && phone.length === 10) {
      setUpiId(`${phone}${bankObj.handle}`);
    }
  };

  const handlePhoneChange = (val: string) => {
    const clean = val.replace(/\D/g, '');
    setPhone(clean);
    if (clean.length === 10 && !upiId) {
      const bankObj = SUPPORTED_BANKS.find((b) => b.name === selectedBank) || SUPPORTED_BANKS[0];
      setUpiId(`${clean}${bankObj.handle}`);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    triggerKeypadHaptic();

    const trimmedName = name.trim();
    const trimmedPhone = phone.trim();
    let trimmedUpi = upiId.trim();

    if (!trimmedName || !trimmedPhone) {
      setError('Please enter your full name and 10-digit mobile number.');
      return;
    }

    if (trimmedPhone.length !== 10) {
      setError('Mobile number must be exactly 10 digits.');
      return;
    }

    if (!trimmedUpi) {
      const bankObj = SUPPORTED_BANKS.find((b) => b.name === selectedBank) || SUPPORTED_BANKS[0];
      trimmedUpi = `${trimmedPhone}${bankObj.handle}`;
    }

    if (
      !trimmedUpi.includes('@') ||
      trimmedUpi.startsWith('@') ||
      trimmedUpi.endsWith('@')
    ) {
      setError('Please enter a valid UPI ID (e.g. mobile@bank).');
      return;
    }

    const userData: UserData = {
      myName: trimmedName,
      myPhone: trimmedPhone,
      myUPIid: trimmedUpi,
      myBank: selectedBank,
      myAccountNumber: `•••• ${trimmedPhone.slice(-4)}`,
    };

    storage.setUserData(userData);

    onSuccess(userData);
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col justify-between p-6 max-w-md mx-auto select-none">
      {/* Top Header */}
      <div>
        {onBack && (
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
        )}

        <div className="text-center mt-6 mb-6">
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-950">
            {isEditing ? t.edit_info : 'Link Bank & Set Up UPI'}
          </h1>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
            <span className="font-semibold">Notice:</span> {error}
          </div>
        )}

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* Name */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-700">
              Account Holder Full Name <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                id="register-name-input"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Ramesh Kumar"
                className="w-full px-4 py-2.5 pl-10 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs font-semibold focus:outline-none focus:border-black focus:bg-white transition-all shadow-2xs"
                required
              />
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            </div>
          </div>

          {/* Phone Number */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-700">
              Bank-Registered Mobile Number <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-xs font-bold text-slate-500">+91</span>
              <input
                id="register-phone-input"
                type="tel"
                maxLength={10}
                value={phone}
                onChange={(e) => handlePhoneChange(e.target.value)}
                placeholder="10-digit mobile number"
                className="w-full pl-12 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs font-semibold font-mono focus:outline-none focus:border-black focus:bg-white transition-all shadow-2xs"
                required
              />
              <Phone className="w-4 h-4 text-slate-400 absolute right-3.5 top-3" />
            </div>
          </div>

          {/* Primary Bank Selection */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-700">
              Primary Savings / Current Bank
            </label>
            <div className="relative">
              <select
                id="register-bank-select"
                value={selectedBank}
                onChange={(e) => handleBankChange(e.target.value)}
                className="w-full px-4 py-2.5 pl-10 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs font-semibold focus:outline-none focus:border-black focus:bg-white transition-all cursor-pointer shadow-2xs"
              >
                {SUPPORTED_BANKS.map((b) => (
                  <option key={b.name} value={b.name}>
                    {b.name}
                  </option>
                ))}
              </select>
              <Landmark className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            </div>
          </div>

          {/* UPI ID */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-700">
                Primary UPI ID / Virtual Address (VPA)
              </label>
              {phone.length === 10 && (
                <button
                  type="button"
                  onClick={() => {
                    const bankObj = SUPPORTED_BANKS.find((b) => b.name === selectedBank) || SUPPORTED_BANKS[0];
                    setUpiId(`${phone}${bankObj.handle}`);
                  }}
                  className="text-[10px] text-emerald-600 hover:text-emerald-700 font-bold cursor-pointer"
                >
                  Auto-generate
                </button>
              )}
            </div>
            <div className="relative">
              <input
                id="register-upi-input"
                type="text"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                placeholder="e.g. yourname@oksbi"
                className="w-full px-4 py-2.5 pl-10 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs font-semibold font-mono focus:outline-none focus:border-black focus:bg-white transition-all shadow-2xs"
              />
              <AtSign className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            </div>
          </div>

          <div className="pt-4">
            <button
              id="register-submit-btn"
              type="submit"
              className="w-full py-3.5 bg-slate-950 hover:bg-black text-white font-bold text-sm rounded-xl shadow-md active:scale-98 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <span>{isEditing ? 'Save Profile Changes' : 'Link Account & Set PIN →'}</span>
            </button>
          </div>
        </form>
      </div>

      <div className="text-center py-3 text-[11px] text-slate-400 font-mono">
        NPCI Unified Payments Interface &bull; NUUP *99#
      </div>
    </div>
  );
};
