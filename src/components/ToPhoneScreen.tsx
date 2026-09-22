import React, { useState, useEffect } from 'react';
import { LanguageCode, TransactionItem } from '../types';
import { TRANSLATIONS } from '../i18n/translations';
import { storage } from '../utils/storage';
import { buildUssdToMobile } from '../utils/ussd';
import { triggerKeypadHaptic } from '../utils/haptics';
import { UnifiedPaymentModal } from './UnifiedPaymentModal';
import { UpiPaymentReceiptModal } from './UpiPaymentReceiptModal';
import { ArrowLeft, Users, Phone, IndianRupee, Send, ShieldCheck } from 'lucide-react';

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
  const [note, setNote] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Modals
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [completedTxn, setCompletedTxn] = useState<TransactionItem | null>(null);

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
    triggerKeypadHaptic();

    const trimmedPhone = phone.trim();
    const trimmedAmount = amount.trim();

    if (!trimmedPhone || !trimmedAmount) {
      if (!trimmedPhone) {
        setError('Please enter a 10-digit mobile number.');
      } else {
        setError('Please enter the payment amount.');
      }
      return;
    }

    if (trimmedPhone.length !== 10) {
      setError('Phone number must be exactly 10 digits.');
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

    // Open Unified Payment Modal
    setShowPaymentModal(true);
  };

  const ussdDial = phone.trim() && amount.trim() ? buildUssdToMobile(phone.trim(), amount.trim()) : undefined;

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
          <span className="font-bold text-sm text-slate-900">{t.to_mobile_or_contact}</span>
          <div className="w-6" />
        </div>

        {/* Contact Picker Button */}
        <div className="mt-5 mb-4">
          <button
            type="button"
            onClick={() => {
              triggerKeypadHaptic();
              onOpenContacts();
            }}
            className="w-full py-3 px-4 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-2xl flex items-center justify-between text-xs font-semibold text-slate-800 transition-colors shadow-2xs cursor-pointer active:scale-98"
          >
            <div className="flex items-center gap-2.5">
              <Users className="w-4 h-4 text-emerald-600" />
              <span>{t.select_from_contacts}</span>
            </div>
            <span className="text-[11px] text-emerald-700 font-bold">Browse &rarr;</span>
          </button>
        </div>

        {/* Hero Title */}
        <div className="text-center mt-3 mb-6">
          <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-2 border border-emerald-100">
            <Phone className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-950">
            Pay by Mobile Number
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Instant transfer via UPI VPA or Offline NUUP
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
            <span className="font-semibold">Notice:</span> {error}
          </div>
        )}

        {/* Payment Form */}
        <form onSubmit={handlePay} className="space-y-4">
          {/* Phone Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 block">
              Recipient Phone Number
            </label>
            <div className="relative">
              <div className="absolute left-3.5 top-3 flex items-center gap-1 text-slate-400">
                <span className="text-xs font-bold text-slate-600">+91</span>
                <span className="text-slate-300">|</span>
              </div>
              <input
                id="phone-input"
                type="tel"
                value={phone}
                onChange={(e) => {
                  const cleaned = e.target.value.replace(/[^0-9]/g, '');
                  if (cleaned.length <= 10) setPhone(cleaned);
                }}
                placeholder="10-digit mobile number"
                className="w-full pl-16 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:border-black focus:bg-white transition-all shadow-2xs"
                maxLength={10}
              />
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
                id="amount-input"
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

          {/* Optional Note */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 block">
              Note (Optional)
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Lunch, Grocery, Rent"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-black focus:bg-white transition-all"
              maxLength={40}
            />
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              id="to-phone-pay-btn"
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
        <span>Secured by NPCI Unified Payments Protocol</span>
      </div>

      {/* Unified Payment Chooser Modal */}
      <UnifiedPaymentModal
        isOpen={showPaymentModal}
        payeeName={phone ? `Recipient (+91 ${phone})` : 'Recipient'}
        payeeVpa={`${phone}@upi`}
        amount={parseFloat(amount) || 0}
        note={note || 'Mobile Transfer'}
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
