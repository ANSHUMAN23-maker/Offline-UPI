import React from 'react';
import { LanguageCode, ScreenType } from '../types';
import { TRANSLATIONS } from '../i18n/translations';
import { executeUssdCall, simulateUssdResponse } from '../utils/ussd';
import { User, Search } from 'lucide-react';

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

  const handleRecentTransactions = () => {
    const dialCode = '*99*6*1#';
    executeUssdCall(dialCode);
    const resp = simulateUssdResponse(dialCode);
    onOpenUssdModal(resp.dialCode, resp.title, resp.body, resp.options);
  };

  const handleCheckBalance = () => {
    const dialCode = '*99*3#';
    executeUssdCall(dialCode);
    const resp = simulateUssdResponse(dialCode);
    onOpenUssdModal(resp.dialCode, resp.title, resp.body, resp.options);
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 pb-10 max-w-md mx-auto select-none shadow-xl border-x border-slate-200">
      {/* Top Search Bar & Profile Header */}
      <div className="pt-5 px-4 flex items-center gap-3">
        {/* Search Bar - Clicking opens ContactsActivity */}
        <div
          onClick={() => onNavigate('contacts')}
          className="flex-1 flex items-center gap-2.5 px-4 py-3 bg-white rounded-full shadow-md border border-slate-100 hover:border-slate-300 transition-all cursor-pointer"
        >
          <img
            src="/search.png"
            alt="Search"
            className="w-5 h-5 object-contain"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.display = 'none';
            }}
          />
          <Search className="w-4 h-4 text-slate-500" />
          <span className="text-slate-800 text-sm font-medium">{t.search}</span>
        </div>

        {/* Profile Button - Clicking opens Menu */}
        <button
          onClick={() => onNavigate('menu')}
          className="w-12 h-12 rounded-full bg-slate-100 hover:bg-slate-200 border border-slate-300 shadow-sm flex items-center justify-center transition-transform active:scale-95 cursor-pointer shrink-0"
          title="Account Menu"
        >
          <User className="w-6 h-6 text-slate-800" />
        </button>
      </div>

      {/* Hero Banner Illustration */}
      <div className="mt-4 px-4">
        <div className="w-full h-56 sm:h-64 rounded-2xl overflow-hidden shadow-sm border border-slate-100 bg-slate-50 flex items-center justify-center">
          <img
            src="/body.jpg"
            alt="Offline UPI Hero"
            className="w-full h-full object-cover object-center"
            onError={(e) => {
              // fallback graphic if image load fails
              (e.currentTarget as HTMLImageElement).src = '/ic_logo.png';
            }}
          />
        </div>
      </div>

      {/* 4 Main Action Buttons (2x2 Grid) */}
      <div className="mt-6 px-6">
        <div className="grid grid-cols-2 gap-y-7 gap-x-4">
          {/* 1. To Mobile or Contact */}
          <div
            onClick={() => onNavigate('to_phone')}
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
            onClick={() => onNavigate('scan_qr')}
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
            onClick={() => onNavigate('to_bank')}
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
            onClick={() => onNavigate('to_upi')}
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
      <div className="mt-9 px-6 space-y-3">
        {/* See Transaction History */}
        <div
          onClick={handleRecentTransactions}
          className="flex items-center gap-3.5 p-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 shadow-xs cursor-pointer active:scale-98 transition-all"
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
              NUUP *99*6*1#
            </span>
          </div>
        </div>

        {/* Check Bank Balance */}
        <div
          onClick={handleCheckBalance}
          className="flex items-center gap-3.5 p-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 shadow-xs cursor-pointer active:scale-98 transition-all"
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
              NUUP *99*3#
            </span>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="mt-8 text-center px-4">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] font-semibold">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          Offline Banking Active (No Internet Required)
        </span>
      </div>
    </div>
  );
};
