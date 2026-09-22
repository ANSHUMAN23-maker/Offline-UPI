import React, { useState } from 'react';
import { LanguageCode, TransactionItem } from '../types';
import { TRANSLATIONS } from '../i18n/translations';
import { storage } from '../utils/storage';
import { formatINR } from '../utils/upi';
import { triggerKeypadHaptic, triggerPaymentSuccessHaptic } from '../utils/haptics';
import { UpiPaymentReceiptModal } from './UpiPaymentReceiptModal';
import {
  ArrowLeft,
  ArrowDownLeft,
  ArrowUpRight,
  Landmark,
  PlusCircle,
  Receipt,
  Search,
  Filter,
  CheckCircle2,
  RefreshCw
} from 'lucide-react';

interface TransactionHistoryScreenProps {
  currentLang: LanguageCode;
  onBack: () => void;
}

export const TransactionHistoryScreen: React.FC<TransactionHistoryScreenProps> = ({
  currentLang,
  onBack,
}) => {
  const t = TRANSLATIONS[currentLang];
  const [balance, setBalance] = useState<number>(() => storage.getBalance());
  const [transactions, setTransactions] = useState<TransactionItem[]>(() => storage.getTransactions());
  const [filter, setFilter] = useState<'all' | 'debit' | 'credit'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTxn, setSelectedTxn] = useState<TransactionItem | null>(null);
  const [showAddFunds, setShowAddFunds] = useState(false);
  const [addAmount, setAddAmount] = useState('1000');

  const handleAddFunds = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(addAmount);
    if (!isNaN(val) && val > 0) {
      triggerPaymentSuccessHaptic();
      const updated = storage.addFunds(val);
      setBalance(updated);
      setTransactions(storage.getTransactions());
      setShowAddFunds(false);
    }
  };

  const filteredList = transactions.filter((item) => {
    if (filter !== 'all' && item.type !== filter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchDesc = item.desc.toLowerCase().includes(q);
      const matchVpa = item.payeeVpa?.toLowerCase().includes(q);
      const matchUtr = item.utr?.toLowerCase().includes(q);
      const matchId = item.id.toLowerCase().includes(q);
      return matchDesc || matchVpa || matchUtr || matchId;
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between max-w-md mx-auto select-none">
      <div className="p-5">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200">
          <button
            type="button"
            onClick={() => {
              triggerKeypadHaptic();
              onBack();
            }}
            className="flex items-center gap-1.5 text-slate-600 hover:text-black py-2 px-1 text-sm font-medium transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{t.back}</span>
          </button>
          <span className="font-bold text-sm text-slate-900">Passbook &amp; History</span>
          <div className="w-6" />
        </div>

        {/* Bank Balance Card */}
        <div className="mt-4 p-5 bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-3xl shadow-lg border border-slate-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Landmark className="w-5 h-5 text-emerald-400" />
              <span className="text-xs font-semibold text-slate-300">Primary Bank Account</span>
            </div>
            <span className="text-[10px] font-mono bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full">
              UPI Active
            </span>
          </div>

          <div className="mt-4">
            <span className="text-[11px] text-slate-400 uppercase tracking-wider block">
              Available Balance
            </span>
            <div className="text-3xl font-extrabold tracking-tight mt-0.5 text-white">
              {formatINR(balance)}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-700/60 flex items-center justify-between">
            <span className="text-[11px] text-slate-400 font-mono">
              A/C No: &bull;&bull;&bull;&bull; 4892 (State Bank of India)
            </span>
            <button
              type="button"
              onClick={() => {
                triggerKeypadHaptic();
                setShowAddFunds(true);
              }}
              className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Add Balance</span>
            </button>
          </div>
        </div>

        {/* Add Balance Modal Form */}
        {showAddFunds && (
          <div className="mt-3 p-4 bg-white rounded-2xl border border-slate-200 shadow-sm animate-in slide-in-from-top duration-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-900">Add Test Balance</span>
              <button
                type="button"
                onClick={() => setShowAddFunds(false)}
                className="text-xs text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                Cancel
              </button>
            </div>
            <form onSubmit={handleAddFunds} className="flex gap-2">
              <input
                type="number"
                value={addAmount}
                onChange={(e) => setAddAmount(e.target.value)}
                placeholder="Amount in ₹"
                className="flex-1 py-2 px-3 border border-slate-300 rounded-xl text-sm font-semibold focus:outline-none focus:border-black"
                min="1"
              />
              <button
                type="submit"
                className="py-2 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer"
              >
                Credit ₹
              </button>
            </form>
          </div>
        )}

        {/* Search & Filter Bar */}
        <div className="mt-5 space-y-2.5">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, UPI ID, or UTR..."
              className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs text-slate-900 focus:outline-none focus:border-black shadow-2xs"
            />
          </div>

          <div className="flex gap-1.5">
            {(['all', 'debit', 'credit'] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => {
                  triggerKeypadHaptic();
                  setFilter(tab);
                }}
                className={`py-1.5 px-3.5 rounded-full text-xs font-semibold capitalize transition-all cursor-pointer ${
                  filter === tab
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                {tab === 'all' ? 'All Transactions' : tab === 'debit' ? 'Debits (-)' : 'Credits (+)'}
              </button>
            ))}
          </div>
        </div>

        {/* Transactions List */}
        <div className="mt-4 space-y-2">
          {filteredList.length === 0 ? (
            <div className="py-12 text-center text-slate-400 space-y-1">
              <Receipt className="w-8 h-8 mx-auto text-slate-300" />
              <p className="text-xs font-medium">No transactions found</p>
            </div>
          ) : (
            filteredList.map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  triggerKeypadHaptic();
                  setSelectedTxn(item);
                }}
                className="p-3.5 bg-white hover:bg-slate-100/80 active:scale-99 border border-slate-200/80 rounded-2xl shadow-2xs flex items-center justify-between cursor-pointer transition-all"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      item.type === 'debit'
                        ? 'bg-rose-50 text-rose-600 border border-rose-100'
                        : 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                    }`}
                  >
                    {item.type === 'debit' ? (
                      <ArrowUpRight className="w-5 h-5" />
                    ) : (
                      <ArrowDownLeft className="w-5 h-5" />
                    )}
                  </div>
                  <div>
                    <span className="font-bold text-xs text-slate-900 block truncate max-w-[170px]">
                      {item.desc}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {item.date} {item.time ? `• ${item.time}` : ''}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span
                    className={`font-mono font-extrabold text-xs block ${
                      item.type === 'debit' ? 'text-slate-900' : 'text-emerald-700'
                    }`}
                  >
                    {item.type === 'debit' ? '-' : '+'}
                    {formatINR(item.amount)}
                  </span>
                  <span className="text-[9px] font-mono text-indigo-600 font-semibold block">
                    UTR: {item.utr ? item.utr.slice(-6) : item.id}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* UPI Receipt Detail Modal */}
      <UpiPaymentReceiptModal
        isOpen={Boolean(selectedTxn)}
        transaction={selectedTxn}
        onClose={() => setSelectedTxn(null)}
      />
    </div>
  );
};
