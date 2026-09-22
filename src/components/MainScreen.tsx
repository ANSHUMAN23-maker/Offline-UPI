import React, { useState } from 'react';
import { LanguageCode, ScreenType } from '../types';
import { TRANSLATIONS } from '../i18n/translations';
import { storage } from '../utils/storage';
import { formatINR } from '../utils/upi';
import { executeUssdCall, simulateUssdResponse } from '../utils/ussd';
import { triggerKeypadHaptic } from '../utils/haptics';
import { UpiGuideModal } from './UpiGuideModal';
import {
  User,
  Search,
  BookOpen,
  Landmark,
  ShieldCheck,
  Zap,
  ArrowRight,
  ExternalLink,
  Plus
} from 'lucide-react';

interface MainScreenProps {
  currentLang: LanguageCode;
  onNavigate: (screen: ScreenType) => void;
  onOpenUssdModal: (
    dialCode: string,
    title: string,
    response: string,
    options?: { key: string; label: string }[]
  ) => void;
}

export const MainScreen: React.FC<MainScreenProps> = ({
  currentLang,
  onNavigate,
  onOpenUssdModal,
}) => {
  const t = TRANSLATIONS[currentLang];
  const [showGuideModal, setShowGuideModal] = useState(false);
  const balance = storage.getBalance();

  const handleRecentTransactions = () => {
    triggerKeypadHaptic();
    onNavigate('transaction_history');
  };

  const handleCheckBalance = () => {
    triggerKeypadHaptic();
    const dialCode = '*99*3#';
    executeUssdCall(dialCode);
    const resp = simulateUssdResponse(dialCode);
    onOpenUssdModal(resp.dialCode, resp.title, resp.body, resp.options);
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 pb-10 max-w-md mx-auto select-none shadow-xl border-x border-slate-200">
      {/* Top Search Bar & Profile Header */}
      <div className="pt-4 px-4 flex items-center gap-3">
        {/* Search Bar - Clicking opens ContactsActivity */}
        <div
          onClick={() => {
            triggerKeypadHaptic();
            onNavigate('contacts');
          }}
          className="flex-1 flex items-center gap-2.5 px-4 py-2.5 bg-slate-50 rounded-full border border-slate-200 hover:border-slate-300 transition-all cursor-pointer shadow-2xs"
        >
          <Search className="w-4 h-4 text-slate-400" />
          <span className="text-slate-600 text-xs font-medium">{t.search} or enter mobile</span>
        </div>

        {/* Profile Button - Clicking opens Menu */}
        <button
          onClick={() => {
            triggerKeypadHaptic();
            onNavigate('menu');
          }}
          className="w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200 border border-slate-300 shadow-2xs flex items-center justify-center transition-transform active:scale-95 cursor-pointer shrink-0"
          title="Account Menu"
        >
          <User className="w-5 h-5 text-slate-800" />
        </button>
      </div>

      {/* Production Guide Announcement Ribbon */}
      <div className="mt-3 px-4">
        <button
          type="button"
          onClick={() => {
            triggerKeypadHaptic();
            setShowGuideModal(true);
          }}
          className="w-full py-2 px-3.5 bg-gradient-to-r from-emerald-600 via-teal-600 to-slate-900 text-white rounded-2xl flex items-center justify-between text-xs font-bold shadow-sm hover:shadow-md transition-all cursor-pointer group active:scale-99"
        >
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-300 animate-ping" />
            <BookOpen className="w-4 h-4 text-emerald-200" />
            <span>Production UPI Setup &amp; Architecture Guide</span>
          </div>
          <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-mono flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
            <span>View</span>
            <ArrowRight className="w-3 h-3" />
          </span>
        </button>
      </div>

      {/* Live Bank Balance Card */}
      <div className="mt-3 px-4">
        <div
          onClick={() => {
            triggerKeypadHaptic();
            onNavigate('transaction_history');
          }}
          className="p-3.5 bg-slate-50 hover:bg-slate-100/90 border border-slate-200 rounded-2xl flex items-center justify-between cursor-pointer transition-all shadow-2xs"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center">
              <Landmark className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider block">
                State Bank of India (Primary)
              </span>
              <span className="text-base font-extrabold text-slate-950 font-mono">
                {formatINR(balance)}
              </span>
            </div>
          </div>
          <div className="text-right">
            <span className="text-[11px] font-bold text-indigo-600 block">
              Passbook &rarr;
            </span>
            <span className="text-[9px] text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded font-semibold border border-emerald-200">
              UPI Active
            </span>
          </div>
        </div>
      </div>

      {/* Hero Banner Illustration */}
      <div className="mt-3 px-4">
        <div className="w-full h-44 sm:h-52 rounded-2xl overflow-hidden shadow-xs border border-slate-100 bg-slate-50 flex items-center justify-center relative">
          <img
            src="/body.jpg"
            alt="Offline & Online UPI"
            className="w-full h-full object-cover object-center"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = '/ic_logo.png';
            }}
          />
          <div className="absolute bottom-2 left-2 right-2 bg-slate-950/70 backdrop-blur-xs text-white p-2 rounded-xl text-[11px] flex items-center justify-between">
            <span className="flex items-center gap-1.5 font-medium">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>Real UPI Intent (`upi://pay`) &amp; *99# USSD Active</span>
            </span>
            <span className="text-[10px] font-mono text-emerald-400">0% Fees</span>
          </div>
        </div>
      </div>

      {/* 4 Main Action Buttons (2x2 Grid) */}
      <div className="mt-5 px-6">
        <div className="grid grid-cols-2 gap-y-6 gap-x-4">
          {/* 1. To Mobile or Contact */}
          <div
            onClick={() => {
              triggerKeypadHaptic();
              onNavigate('to_phone');
            }}
            className="flex flex-col items-center group cursor-pointer"
          >
            <div className="w-16 h-16 rounded-full flex items-center justify-center transition-transform group-hover:scale-105 active:scale-95 shadow-sm">
              <img
                src="/phone_circle.png"
                alt="To Mobile"
                className="w-full h-full object-contain"
              />
            </div>
            <span className="mt-2 text-xs font-semibold text-slate-900 text-center leading-tight">
              {t.to_mobile_or_contact}
            </span>
          </div>

          {/* 2. Scan & Pay */}
          <div
            onClick={() => {
              triggerKeypadHaptic();
              onNavigate('scan_qr');
            }}
            className="flex flex-col items-center group cursor-pointer"
          >
            <div className="w-16 h-16 rounded-full flex items-center justify-center transition-transform group-hover:scale-105 active:scale-95 shadow-sm">
              <img
                src="/qr_circle.png"
                alt="Scan & Pay"
                className="w-full h-full object-contain"
              />
            </div>
            <span className="mt-2 text-xs font-semibold text-slate-900 text-center leading-tight">
              {t.scan_pay}
            </span>
          </div>

          {/* 3. Bank Transfer */}
          <div
            onClick={() => {
              triggerKeypadHaptic();
              onNavigate('to_bank');
            }}
            className="flex flex-col items-center group cursor-pointer"
          >
            <div className="w-16 h-16 rounded-full flex items-center justify-center transition-transform group-hover:scale-105 active:scale-95 shadow-sm">
              <img
                src="/bank_circle.png"
                alt="Bank Transfer"
                className="w-full h-full object-contain"
              />
            </div>
            <span className="mt-2 text-xs font-semibold text-slate-900 text-center leading-tight">
              {t.bank_transfer}
            </span>
          </div>

          {/* 4. UPI Transfer */}
          <div
            onClick={() => {
              triggerKeypadHaptic();
              onNavigate('to_upi');
            }}
            className="flex flex-col items-center group cursor-pointer"
          >
            <div className="w-16 h-16 rounded-full flex items-center justify-center transition-transform group-hover:scale-105 active:scale-95 shadow-sm">
              <img
                src="/upi_circle.png"
                alt="UPI Transfer"
                className="w-full h-full object-contain"
              />
            </div>
            <span className="mt-2 text-xs font-semibold text-slate-900 text-center leading-tight">
              {t.upi_transfer}
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Service Actions: Recent Transactions & Check Balance */}
      <div className="mt-7 px-6 space-y-2.5">
        {/* See Transaction History */}
        <div
          onClick={handleRecentTransactions}
          className="flex items-center gap-3.5 p-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 shadow-2xs cursor-pointer active:scale-98 transition-all"
        >
          <img
            src="/recent.png"
            alt="Recent Transactions"
            className="w-10 h-10 object-contain shrink-0"
          />
          <div className="flex-1">
            <span className="text-sm font-semibold text-slate-900 block">
              {t.see_transaction_history}
            </span>
            <span className="text-[11px] font-mono text-slate-500">
              Passbook &amp; Live UTR Receipts
            </span>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-400" />
        </div>

        {/* Check Bank Balance */}
        <div
          onClick={handleCheckBalance}
          className="flex items-center gap-3.5 p-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 shadow-2xs cursor-pointer active:scale-98 transition-all"
        >
          <img
            src="/balance.png"
            alt="Check Bank Balance"
            className="w-10 h-10 object-contain shrink-0"
          />
          <div className="flex-1">
            <span className="text-sm font-semibold text-slate-900 block">
              {t.check_bank_balance}
            </span>
            <span className="text-[11px] font-mono text-slate-500">
              Offline Dial *99*3#
            </span>
          </div>
          <span className="text-xs font-mono font-bold text-slate-800">
            {formatINR(balance)}
          </span>
        </div>
      </div>

      {/* Footer Info */}
      <div className="mt-6 text-center px-4">
        <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-semibold">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          Dual Engine: Real Online UPI + *99# Cellular Banking
        </span>
      </div>

      {/* Production Guide Modal */}
      <UpiGuideModal
        isOpen={showGuideModal}
        onClose={() => setShowGuideModal(false)}
      />
    </div>
  );
};
