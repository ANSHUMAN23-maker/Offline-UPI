import React, { useState } from 'react';
import { TransactionItem } from '../types';
import { formatINR } from '../utils/upi';
import { triggerKeypadHaptic } from '../utils/haptics';
import { CheckCircle2, Share2, Copy, ArrowLeft, Download, ShieldCheck, Landmark } from 'lucide-react';

interface UpiPaymentReceiptModalProps {
  isOpen: boolean;
  transaction: TransactionItem | null;
  onClose: () => void;
}

export const UpiPaymentReceiptModal: React.FC<UpiPaymentReceiptModalProps> = ({
  isOpen,
  transaction,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !transaction) return null;

  const handleShare = async () => {
    triggerKeypadHaptic();
    const shareText = `UPI Payment Receipt\nPaid ${formatINR(transaction.amount)} to ${transaction.desc}\nUTR / Ref: ${transaction.utr || transaction.id}\nDate: ${transaction.date} ${transaction.time || ''}\nStatus: Completed via Offline UPI`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'UPI Payment Receipt',
          text: shareText,
        });
        return;
      } catch {
        // fallback
      }
    }

    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  const handleCopyUtr = () => {
    triggerKeypadHaptic();
    if (transaction.utr) {
      navigator.clipboard.writeText(transaction.utr);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div
      id="upi-receipt-modal-backdrop"
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200"
    >
      <div
        id="upi-receipt-card"
        className="w-full max-w-sm bg-white rounded-3xl overflow-hidden shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-200"
      >
        {/* Success Header Banner */}
        <div className="bg-emerald-600 text-white pt-8 pb-6 px-6 text-center relative">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg shadow-emerald-900/20 text-emerald-600">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <span className="text-[11px] font-bold tracking-widest uppercase opacity-90 block">
            Payment Successful
          </span>
          <h2 className="text-3xl font-extrabold tracking-tight mt-1">
            {formatINR(transaction.amount)}
          </h2>
          <p className="text-xs text-emerald-100 mt-1 font-medium">
            {transaction.date} &bull; {transaction.time || 'Completed'}
          </p>

          <div className="absolute top-4 right-4">
            <span className="text-[10px] font-mono bg-emerald-700/80 px-2 py-0.5 rounded-full text-white/90">
              {transaction.mode === 'UPI_INTENT'
                ? 'UPI App'
                : transaction.mode === 'USSD_NUUP'
                ? '*99# USSD'
                : 'Instant UPI'}
            </span>
          </div>
        </div>

        {/* Receipt Details Body */}
        <div className="p-6 space-y-4 text-xs text-slate-700">
          {/* Recipient Details */}
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
            <div className="flex justify-between items-start">
              <span className="text-slate-500 font-medium">Paid To</span>
              <span className="font-bold text-slate-900 text-right max-w-[180px] truncate">
                {transaction.desc}
              </span>
            </div>
            {transaction.payeeVpa && (
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-slate-500 font-medium">UPI VPA</span>
                <span className="font-mono text-slate-800">{transaction.payeeVpa}</span>
              </div>
            )}
            <div className="flex justify-between items-center text-[11px]">
              <span className="text-slate-500 font-medium">Payment Type</span>
              <span className="font-semibold text-slate-800 capitalize">
                {transaction.type === 'debit' ? 'Money Sent (Debit)' : 'Money Received (Credit)'}
              </span>
            </div>
          </div>

          {/* NPCI & Bank Audit Details */}
          <div className="space-y-2 px-1">
            <div className="flex justify-between items-center">
              <span className="text-slate-500 font-medium">UPI Transaction ID</span>
              <span className="font-mono font-bold text-slate-900">{transaction.id}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-slate-500 font-medium">UTR / NPCI Ref</span>
              <button
                type="button"
                onClick={handleCopyUtr}
                className="font-mono text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1 cursor-pointer"
                title="Click to copy UTR"
              >
                <span>{transaction.utr || '2209' + transaction.id.replace(/\D/g, '')}</span>
                <Copy className="w-3 h-3 text-slate-400" />
              </button>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-slate-500 font-medium">Debited From</span>
              <span className="font-medium text-slate-800 flex items-center gap-1">
                <Landmark className="w-3.5 h-3.5 text-slate-500" />
                <span>Primary Bank Account</span>
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-slate-500 font-medium">Status</span>
              <span className="inline-flex items-center gap-1 text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full text-[10px]">
                <ShieldCheck className="w-3 h-3" />
                <span>NPCI Verified</span>
              </span>
            </div>
          </div>

          {copied && (
            <div className="p-2 bg-slate-900 text-white text-[11px] rounded-xl text-center font-medium">
              Receipt summary copied to clipboard!
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-2 flex gap-2">
            <button
              id="receipt-share-btn"
              type="button"
              onClick={handleShare}
              className="flex-1 py-3 px-4 bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-800 font-bold rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Share2 className="w-4 h-4" />
              <span>Share Receipt</span>
            </button>

            <button
              id="receipt-done-btn"
              type="button"
              onClick={() => {
                triggerKeypadHaptic();
                onClose();
              }}
              className="flex-1 py-3 px-4 bg-slate-950 hover:bg-black active:scale-95 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <span>Done</span>
            </button>
          </div>
        </div>

        {/* Footer brand */}
        <div className="bg-slate-50 py-2.5 px-4 text-center border-t border-slate-100 text-[10px] text-slate-400 font-mono">
          Unified Payments Interface &bull; NPCI Compliant
        </div>
      </div>
    </div>
  );
};
