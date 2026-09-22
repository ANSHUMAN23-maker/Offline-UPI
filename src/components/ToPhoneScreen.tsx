import React, { useState, useEffect } from 'react';
import { LanguageCode } from '../types';
import { TRANSLATIONS } from '../i18n/translations';
import { storage } from '../utils/storage';
import { buildUssdToMobile, executeUssdCall, simulateUssdResponse } from '../utils/ussd';
import { ArrowLeft, Users, Phone, IndianRupee, Send } from 'lucide-react';

interface ToPhoneScreenProps {
  currentLang: LanguageCode;
  onBack: () => void;
  onOpenContacts: () => void;
  onOpenUssdModal: (
    dialCode: string,
    title: string,
    response: string,
    options?: { key: string; label: string }[]
  ) => void;
}

export const ToPhoneScreen: React.FC<ToPhoneScreenProps> = ({
  currentLang,
  onBack,
  onOpenContacts,
  onOpenUssdModal,
}) => {
  const t = TRANSLATIONS[currentLang];
  const [phone, setPhone] = useState('');
  const [amount, setAmount] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if a contact was selected from ContactsScreen
    const selectedContact = storage.getSelectedContact();
    if (selectedContact) {
      let clean = selectedContact.replace(/[^0-9]/g, '');
      if (clean.length > 10 && clean.startsWith('91')) {
        clean = clean.substring(2);
      }
      setPhone(clean);
      storage.clearSelectedContact();
    }
  }, []);

  const handlePay = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedPhone = phone.trim();
    const trimmedAmount = amount.trim();

    if (!trimmedPhone || !trimmedAmount) {
      if (!trimmedPhone) {
        setError('Please enter a phone number.');
      } else {
        setError('Please enter the amount');
      }
      return;
    }

    if (trimmedPhone.length !== 10) {
      setError('Phone number should be 10 digits.');
      return;
    }

    const amtVal = parseFloat(trimmedAmount);
    if (isNaN(amtVal) || amtVal <= 0) {
      setError('Amount should be greater than 0');
      return;
    }

    if (amtVal > 5000) {
      setError('Amount should be less than 5000.');
      return;
    }

    const dialString = buildUssdToMobile(trimmedPhone, trimmedAmount);
    executeUssdCall(dialString);
    const resp = simulateUssdResponse(dialString, { phone: trimmedPhone, amount: amtVal });
    onOpenUssdModal(resp.dialCode, resp.title, resp.body, resp.options);
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col justify-between p-6 max-w-md mx-auto select-none">
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
          <span className="font-bold text-sm text-slate-900">{t.to_mobile_or_contact}</span>
          <div className="w-6" />
        </div>

        {/* Contact Picker Button */}
        <div className="mt-6 mb-6">
          <button
            type="button"
            onClick={onOpenContacts}
            className="w-full py-3 px-4 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl flex items-center justify-between text-xs font-semibold text-slate-800 transition-colors shadow-xs cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <Users className="w-4 h-4 text-sky-600" />
              <span>{t.select_from_contacts}</span>
            </div>
            <span className="text-[11px] text-sky-600 font-bold">Browse →</span>
          </button>
        </div>

        {error && (
          <div className="mb-5 p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
            <span className="font-semibold">Notice:</span> {error}
          </div>
        )}

        {/* Payment Form */}
        <form onSubmit={handlePay} className="space-y-4">
          {/* Phone Number */}
          <div>
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

          {/* Amount */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {t.enter_amount} (Max ₹5,000) <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="number"
                min="1"
                max="5000"
                step="any"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="₹ 0.00"
                className="w-full px-4 py-3 pl-11 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-black font-mono font-bold transition-all"
              />
              <IndianRupee className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
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

      <div className="text-center py-4 text-xs text-slate-500">
        Dial string generated: <code className="font-mono text-[11px] bg-slate-100 px-1.5 py-0.5 rounded">*99*1*1*phone*amount*1#</code>
      </div>
    </div>
  );
};
