import React, { useState } from 'react';
import { LanguageCode } from '../types';
import { TRANSLATIONS } from '../i18n/translations';
import { buildUssdToBank, executeUssdCall, simulateUssdResponse } from '../utils/ussd';
import { ArrowLeft, Landmark, CreditCard, Hash, IndianRupee, Send } from 'lucide-react';

interface ToBankAccountScreenProps {
  currentLang: LanguageCode;
  onBack: () => void;
  onOpenUssdModal: (
    dialCode: string,
    title: string,
    response: string,
    options?: { key: string; label: string }[]
  ) => void;
}

export const ToBankAccountScreen: React.FC<ToBankAccountScreenProps> = ({
  currentLang,
  onBack,
  onOpenUssdModal,
}) => {
  const t = TRANSLATIONS[currentLang];
  const [accountNumber, setAccountNumber] = useState('');
  const [ifsc, setIfsc] = useState('');
  const [amount, setAmount] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handlePay = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedAcc = accountNumber.trim();
    const trimmedIfsc = ifsc.trim().toUpperCase();
    const trimmedAmount = amount.trim();

    if (!trimmedAcc) {
      setError('Please enter Bank Account Number.');
      return;
    }
    if (!trimmedIfsc) {
      setError('Please enter IFSC code.');
      return;
    }
    if (!trimmedAmount) {
      setError('Please enter the amount');
      return;
    }

    const amtVal = parseFloat(trimmedAmount);
    if (isNaN(amtVal) || amtVal <= 0) {
      setError('Amount should be greater than 0');
      return;
    }

    const dialString = buildUssdToBank(trimmedIfsc, trimmedAcc, trimmedAmount);
    executeUssdCall(dialString);
    const resp = simulateUssdResponse(dialString, {
      account: trimmedAcc,
      amount: amtVal,
    });
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
          <span className="font-bold text-sm text-slate-900">{t.bank_transfer}</span>
          <div className="w-6" />
        </div>

        <div className="text-center mt-6 mb-6">
          <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-3 border border-slate-200">
            <Landmark className="w-7 h-7 text-slate-900" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-950">
            {t.bank_transfer}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Direct account to account transfer via NUUP IMPS
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
            <span className="font-semibold">Notice:</span> {error}
          </div>
        )}

        {/* Bank Transfer Form */}
        <form onSubmit={handlePay} className="space-y-4">
          {/* Account Number */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {t.bank_account_number} <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, ''))}
                placeholder={t.enter_bank_account_number}
                className="w-full px-4 py-3 pl-11 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-black font-mono transition-all"
              />
              <CreditCard className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            </div>
          </div>

          {/* IFSC Code */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {t.ifsc_code} <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                maxLength={11}
                value={ifsc}
                onChange={(e) => setIfsc(e.target.value.toUpperCase())}
                placeholder="SBIN0001234"
                className="w-full px-4 py-3 pl-11 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-black font-mono uppercase transition-all"
              />
              <Hash className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            </div>
          </div>

          {/* Amount */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {t.enter_amount} <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="number"
                min="1"
                step="any"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="₹ 0.00"
                className="w-full px-4 py-3 pl-11 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-black font-mono font-bold transition-all"
              />
              <IndianRupee className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            </div>
          </div>

          <div className="pt-4 flex justify-center">
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
        Dial string: *99*1*5*IFSC*Account*Amount*1#
      </div>
    </div>
  );
};
