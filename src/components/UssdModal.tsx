import React, { useState, useEffect } from 'react';
import { USSDSessionState } from '../types';
import { PhoneCall, X, Send, CheckCircle2, AlertCircle } from 'lucide-react';
import { triggerPaymentSuccessHaptic, triggerKeypadHaptic } from '../utils/haptics';

interface UssdModalProps {
  session: USSDSessionState;
  onClose: () => void;
  onSelectOption?: (optionKey: string) => void;
}

export const UssdModal: React.FC<UssdModalProps> = ({ session, onClose, onSelectOption }) => {
  const [userInput, setUserInput] = useState('');

  useEffect(() => {
    if (session.isOpen) {
      const titleLower = (session.title || '').toLowerCase();
      const bodyLower = (session.response || '').toLowerCase();
      const isPaymentSuccess =
        titleLower.includes('success') ||
        bodyLower.includes('successful') ||
        session.status === 'completed';

      if (isPaymentSuccess) {
        triggerPaymentSuccessHaptic();
      }
    }
  }, [session.isOpen, session.title, session.response, session.status]);

  if (!session.isOpen) return null;

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    triggerKeypadHaptic();
    if (userInput.trim() && onSelectOption) {
      onSelectOption(userInput.trim());
      setUserInput('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-sm overflow-hidden bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl text-white">
        {/* USSD Network Bar Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-slate-800/90 border-b border-slate-700/80">
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <div className="flex flex-col">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                GSM / NUUP Network
              </span>
              <span className="text-xs font-mono text-emerald-400 font-bold">
                {session.dialCode}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* USSD Content / Flash Screen */}
        <div className="p-5 space-y-4">
          <div className="flex items-center gap-2 text-slate-300">
            {session.status === 'completed' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            ) : session.status === 'error' ? (
              <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />
            ) : (
              <PhoneCall className="w-5 h-5 text-sky-400 shrink-0 animate-bounce" />
            )}
            <h3 className="font-semibold text-sm text-slate-100">{session.title}</h3>
          </div>

          <div className="p-3.5 bg-slate-950/80 rounded-xl border border-slate-800/80 font-mono text-xs leading-relaxed text-slate-200 whitespace-pre-wrap max-h-56 overflow-y-auto">
            {session.response}
          </div>

          {/* Quick Select Options */}
          {session.options && session.options.length > 0 && (
            <div className="space-y-1.5">
              <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                Select Option
              </span>
              <div className="grid grid-cols-2 gap-1.5">
                {session.options.map((opt) => (
                  <button
                    key={opt.key}
                    type="button"
                    onClick={() => {
                      triggerKeypadHaptic();
                      onSelectOption && onSelectOption(opt.key);
                    }}
                    className="flex items-center justify-between px-3 py-2 text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700 transition-colors cursor-pointer"
                  >
                    <span>{opt.label}</span>
                    <span className="font-mono font-bold text-sky-400 bg-slate-900 px-1.5 py-0.5 rounded text-[10px]">
                      {opt.key}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Interactive Response Input */}
          {session.options && session.options.length > 0 && (
            <form onSubmit={handleSend} className="flex gap-2 pt-1">
              <input
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder="Enter option number..."
                className="flex-1 px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-sky-500 font-mono"
              />
              <button
                type="submit"
                className="px-3 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-medium flex items-center gap-1 transition-colors"
              >
                <span>Send</span>
                <Send className="w-3 h-3" />
              </button>
            </form>
          )}

          {/* External Call Link fallback */}
          <div className="pt-2 border-t border-slate-800/80 flex flex-col gap-2">
            <a
              href={`tel:${encodeURIComponent(session.dialCode)}`}
              className="w-full py-2.5 px-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 shadow-sm transition-colors text-center"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>Launch Dialer on Phone ({session.dialCode})</span>
            </a>
            <button
              type="button"
              onClick={onClose}
              className="w-full py-2 text-xs font-medium text-slate-400 hover:text-slate-200 transition-colors"
            >
              Dismiss
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
