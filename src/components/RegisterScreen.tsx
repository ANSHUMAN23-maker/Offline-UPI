import React, { useState } from 'react';
import { LanguageCode, UserData } from '../types';
import { TRANSLATIONS } from '../i18n/translations';
import { storage } from '../utils/storage';
import { User, Phone, AtSign, ArrowLeft } from 'lucide-react';

interface RegisterScreenProps {
  currentLang: LanguageCode;
  isEditing?: boolean;
  onSuccess: (data?: UserData) => void;
  onBack?: () => void;
}

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
  const [upiId, setUpiId] = useState(isEditing ? existingData.myUPIid : '');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedName = name.trim();
    const trimmedPhone = phone.trim();
    const trimmedUpi = upiId.trim();

    // Replicating validation logic from RegisterPage.java
    if (!trimmedName || !trimmedPhone) {
      setError('Fill all the Mandatory Info..');
      return;
    }

    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(trimmedPhone)) {
      setError('Phone number should be a 10-digit number');
      return;
    }

    if (trimmedUpi.length > 0) {
      if (
        !trimmedUpi.includes('@') ||
        trimmedUpi.startsWith('@') ||
        trimmedUpi.endsWith('@')
      ) {
        setError('Invalid UPI ID');
        return;
      }
    }

    const userData: UserData = {
      myName: trimmedName,
      myPhone: trimmedPhone,
      myUPIid: trimmedUpi,
    };

    storage.setUserData(userData);
    onSuccess(userData);
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col justify-between p-6 max-w-md mx-auto">
      {/* Top Header */}
      <div>
        {onBack && (
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-slate-600 hover:text-black py-2 px-1 text-sm font-medium transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{t.back}</span>
          </button>
        )}

        <div className="text-center mt-12 mb-8">
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-950">
            {isEditing ? t.edit_info : t.register}
          </h1>
          <p className="text-xs text-slate-500 mt-2">
            {isEditing
              ? 'Update your offline profile information'
              : 'Enter your basic details to start using Offline UPI'}
          </p>
        </div>

        {error && (
          <div className="mb-5 p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
            <span className="font-semibold">Notice:</span> {error}
          </div>
        )}

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div className="relative">
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {t.name} <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t.name}
                className="w-full px-4 py-3 pl-11 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition-all"
              />
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            </div>
          </div>

          {/* Phone Number */}
          <div className="relative">
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {t.phone_number} <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="tel"
                maxLength={10}
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                placeholder={t.enter_phone_number}
                className="w-full px-4 py-3 pl-11 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-black font-mono transition-all"
              />
              <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            </div>
          </div>

          {/* UPI ID (Optional) */}
          <div className="relative">
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {t.upi_id_optional}
            </label>
            <div className="relative">
              <input
                type="text"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                placeholder="example@upi"
                className="w-full px-4 py-3 pl-11 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition-all"
              />
              <AtSign className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            </div>
          </div>

          <div className="pt-6 flex justify-center">
            <button
              type="submit"
              className="w-48 py-3.5 bg-black hover:bg-slate-900 text-white font-bold text-base rounded-xl shadow-lg active:scale-95 transition-all cursor-pointer"
            >
              {t.continue_next}
            </button>
          </div>
        </form>
      </div>

      <div className="text-center py-4 text-[11px] text-slate-400 font-mono">
        NPCI Offline USSD *99# Technology
      </div>
    </div>
  );
};
