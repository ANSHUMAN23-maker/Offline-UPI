import React, { useState } from 'react';
import { LanguageCode, TransactionItem } from '../types';
import { TRANSLATIONS } from '../i18n/translations';
import { buildUssdToUpi } from '../utils/ussd';
import { isValidUpiId } from '../utils/upi';
import { triggerKeypadHaptic } from '../utils/haptics';
import { UnifiedPaymentModal } from './UnifiedPaymentModal';
import { UpiPaymentReceiptModal } from './UpiPaymentReceiptModal';
import { ArrowLeft, AtSign, IndianRupee, Send, ShieldCheck, CheckCircle2 } from 'lucide-react';

interface ToUpiScreenProps {
  currentLang: LanguageCode;
  onBack: () => void;
  onOpenUssdModal: (
    dialCode: string,
    title: string,
    response: string,
    options?: { key: string; label: string }[]
  ) => void;
}

export const ToUpiScreen: React.FC<ToUpiScreenProps> = ({
  currentLang,
  onBack,
  onOpenUssdModal,
}) => {
  const t = TRANSLATIONS[currentLang];
  const [upiId, setUpiId] = useState('');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Modals
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [completedTxn, setCompletedTxn] = useState<TransactionItem | null>(null);

  const handlePay = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    triggerKeypadHaptic();

    const trimmedUpi = upiId.trim().toLowerCase();
    const trimmedAmount = amount.trim();

    if (!trimmedUpi) {
      setError('Please enter a recipient UPI ID (e.g., name@okaxis).');
      return;
    }

    if (!isValidUpiId(trimmedUpi)) {
      setError('Please enter a valid UPI VPA format (e.g., user@bank).');
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

    if (amtVal > 100000) {
      setError('NPCI per-transaction limit is ₹1,00,000.');
      return;
    }

    setShowPaymentModal(true);
  };

  const ussdDial = buildUssdToUpi();

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col justify-between p-6 max-w-md mx-auto select-none relative">
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
          <span className="font-bold text-sm text-slate-900">{t.upi_transfer}</span>
          <div className="w-6" />
        </div>

        {/* Hero Title */}
        <div className="text-center mt-6 mb-6">
          <div className="w-14 h-14 bg-sky-50 text-sky-600 rounded-2xl flex items-center justify-center mx-auto mb-2 border border-sky-100">
            <AtSign className="w-7 h-7" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-950">
            Pay to UPI ID
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Send money to any UPI Virtual Payment Address (VPA)
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
            <span className="font-semibold">Notice:</span> {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handlePay} className="space-y-4">
          {/* UPI ID Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 block">
              Beneficiary UPI ID / VPA
            </label>
            <div className="relative">
              <AtSign className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                id="upi-id-input"
                type="text"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                placeholder="e.g. rohan@okhdfcbank or 9876543210@paytm"
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:border-black focus:bg-white transition-all shadow-2xs font-mono"
              />
            </div>
            {/* Common UPI Handles helper */}
            <div className="flex gap-1.5 pt-0.5 flex-wrap">
              {['@okhdfcbank', '@okaxis', '@oksbi', '@paytm', '@ybl'].map((h) => (
                <button
                  key={h}
                  type="button"
                  onClick={() => {
                    triggerKeypadHaptic();
                    const prefix = upiId.split('@')[0] || '';
                    if (prefix) {
                      setUpiId(prefix + h);
                    }
                  }}
                  className="py-0.5 px-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded text-[10px] font-mono cursor-pointer"
                >
                  {h}
                </button>
              ))}
            </div>
          </div>

          {/* Amount Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 block">
              {t.enter_amount} (₹)
            </label>
            <div className="relative">
              <IndianRupee className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                id="upi-amount-input"
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
              {[100, 200, 500, 1000, 2000].map((chip) => (
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

          {/* Note Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 block">
              Remarks / Purpose (Optional)
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Bill split, Gift, Services"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-black focus:bg-white transition-all"
              maxLength={40}
            />
          </div>

          {/* Submit */}
          <div className="pt-2">
            <button
              id="to-upi-pay-btn"
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
        <span>Direct Bank Settlement via NPCI UPI</span>
      </div>

      {/* Unified Payment Chooser Modal */}
      <UnifiedPaymentModal
        isOpen={showPaymentModal}
        payeeName={upiId.split('@')[0] || 'UPI Beneficiary'}
        payeeVpa={upiId.trim().toLowerCase()}
        amount={parseFloat(amount) || 0}
        note={note || 'UPI Payment'}
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
