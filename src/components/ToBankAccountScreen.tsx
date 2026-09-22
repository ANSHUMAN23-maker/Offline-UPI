import React, { useState } from 'react';
import { LanguageCode, TransactionItem } from '../types';
import { TRANSLATIONS } from '../i18n/translations';
import { buildUssdToBank } from '../utils/ussd';
import { triggerKeypadHaptic } from '../utils/haptics';
import { UnifiedPaymentModal } from './UnifiedPaymentModal';
import { UpiPaymentReceiptModal } from './UpiPaymentReceiptModal';
import { ArrowLeft, Landmark, CreditCard, Hash, IndianRupee, Send, ShieldCheck } from 'lucide-react';

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
  const [beneficiaryName, setBeneficiaryName] = useState('');
  const [amount, setAmount] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Modals
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [completedTxn, setCompletedTxn] = useState<TransactionItem | null>(null);

  const handlePay = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    triggerKeypadHaptic();

    const trimmedAcc = accountNumber.trim();
    const trimmedIfsc = ifsc.trim().toUpperCase();
    const trimmedAmount = amount.trim();

    if (!trimmedAcc) {
      setError('Please enter Bank Account Number.');
      return;
    }
    if (trimmedAcc.length < 9) {
      setError('Account Number must be at least 9 digits.');
      return;
    }
    if (!trimmedIfsc) {
      setError('Please enter IFSC code.');
      return;
    }
    if (trimmedIfsc.length !== 11) {
      setError('IFSC code must be exactly 11 characters (e.g. SBIN0001234).');
      return;
    }
    if (!trimmedAmount) {
      setError('Please enter the payment amount.');
      return;
    }

    const amtVal = parseFloat(trimmedAmount);
    if (isNaN(amtVal) || amtVal <= 0) {
      setError('Amount must be greater than ₹0.');
      return;
    }

    setShowPaymentModal(true);
  };

  const ussdDial =
    ifsc.trim() && accountNumber.trim() && amount.trim()
      ? buildUssdToBank(ifsc.trim().toUpperCase(), accountNumber.trim(), amount.trim())
      : undefined;

  const payeeVpa = `${accountNumber.trim()}@${ifsc.trim().toUpperCase().slice(0, 4)}.ifsc.npci`;

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col justify-between p-6 max-w-md mx-auto select-none">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-6 border-b border-slate-100">
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
          <span className="font-bold text-sm text-slate-900">{t.bank_transfer}</span>
          <div className="w-6" />
        </div>

        <div className="text-center mt-5 mb-5">
          <div className="w-14 h-14 bg-slate-50 text-slate-900 rounded-2xl flex items-center justify-center mx-auto mb-2 border border-slate-200">
            <Landmark className="w-7 h-7" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-950">
            {t.bank_transfer}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Direct IMPS/UPI bank account transfer
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
            <span className="font-semibold">Notice:</span> {error}
          </div>
        )}

        {/* Bank Transfer Form */}
        <form onSubmit={handlePay} className="space-y-3.5">
          {/* Beneficiary Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 block">
              Beneficiary Name (Optional)
            </label>
            <input
              type="text"
              value={beneficiaryName}
              onChange={(e) => setBeneficiaryName(e.target.value)}
              placeholder="e.g. Ramesh Kumar"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:border-black focus:bg-white transition-all"
            />
          </div>

          {/* Account Number */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 block">
              {t.bank_account_number}
            </label>
            <div className="relative">
              <Hash className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                id="acc-num-input"
                type="text"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value.replace(/[^0-9]/g, ''))}
                placeholder="Enter 9-18 digit account number"
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:border-black focus:bg-white transition-all font-mono shadow-2xs"
                maxLength={18}
              />
            </div>
          </div>

          {/* IFSC Code */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 block">
              {t.ifsc_code}
            </label>
            <div className="relative">
              <CreditCard className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                id="ifsc-input"
                type="text"
                value={ifsc}
                onChange={(e) => setIfsc(e.target.value.toUpperCase())}
                placeholder="e.g. SBIN0001234 or HDFC0000001"
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:border-black focus:bg-white transition-all font-mono uppercase shadow-2xs"
                maxLength={11}
              />
            </div>
          </div>

          {/* Amount */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 block">
              {t.enter_amount} (₹)
            </label>
            <div className="relative">
              <IndianRupee className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                id="bank-amount-input"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-lg font-bold text-slate-900 focus:outline-none focus:border-black focus:bg-white transition-all shadow-2xs"
                min="1"
                step="any"
              />
            </div>

            {/* Quick Amount Chips */}
            <div className="flex gap-2 pt-1">
              {[500, 1000, 2000, 5000].map((chip) => (
                <button
                  key={chip}
                  type="button"
                  onClick={() => {
                    triggerKeypadHaptic();
                    setAmount(chip.toString());
                  }}
                  className="py-1 px-2.5 bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-700 rounded-lg text-[11px] font-semibold transition-all cursor-pointer"
                >
                  +{chip}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-2">
            <button
              id="to-bank-pay-btn"
              type="submit"
              className="w-full py-3.5 bg-slate-950 hover:bg-black active:scale-98 text-white font-bold text-sm rounded-xl shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>Proceed to Pay</span>
            </button>
          </div>
        </form>
      </div>

      {/* Security badge footer */}
      <div className="py-4 text-center border-t border-slate-100 flex items-center justify-center gap-1.5 text-[11px] text-slate-500">
        <ShieldCheck className="w-4 h-4 text-emerald-600" />
        <span>IMPS Bank Clearing via NPCI Network</span>
      </div>

      {/* Unified Payment Chooser Modal */}
      <UnifiedPaymentModal
        isOpen={showPaymentModal}
        payeeName={beneficiaryName || `A/C ${accountNumber.slice(-4)} (${ifsc})`}
        payeeVpa={payeeVpa}
        amount={parseFloat(amount) || 0}
        note={`Bank Transfer to ${ifsc}`}
        onClose={() => setShowPaymentModal(false)}
        onPaymentSuccess={(txn) => {
          setShowPaymentModal(false);
          setCompletedTxn(txn);
        }}
        onOpenUssdModal={onOpenUssdModal}
        ussdDialString={ussdDial}
      />

      {/* Payment Receipt Modal */}
      <UpiPaymentReceiptModal
        isOpen={Boolean(completedTxn)}
        transaction={completedTxn}
        onClose={() => {
          setCompletedTxn(null);
          onBack();
        }}
      />
    </div>
  );
};
