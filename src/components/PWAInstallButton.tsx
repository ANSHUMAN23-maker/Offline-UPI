import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Download, Smartphone, X, Check } from 'lucide-react';
import { triggerKeypadHaptic } from '../utils/haptics';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // If already installed in standalone mode, hide button
  if (isInstalled) {
    return null;
  }

  // Chromium / Android / Desktop flow
  if (isInstallable) {
    return (
      <button
        type="button"
        onClick={() => {
          triggerKeypadHaptic();
          install();
        }}
        className="w-full py-2.5 px-3 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 active:scale-98 text-white rounded-xl flex items-center justify-between text-xs font-bold shadow-md cursor-pointer transition-all"
      >
        <div className="flex items-center gap-2">
          <Download className="w-4 h-4 text-emerald-200" />
          <span>Install OFFPAY App</span>
        </div>
        <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-mono">
          Install PWA
        </span>
      </button>
    );
  }

  // iOS Safari flow
  if (isIOS) {
    return (
      <>
        <button
          type="button"
          onClick={() => {
            triggerKeypadHaptic();
            setShowIOSGuide(true);
          }}
          className="w-full py-2 px-3 bg-slate-100 hover:bg-slate-200 border border-slate-300 active:scale-98 text-slate-800 rounded-xl flex items-center justify-between text-xs font-semibold cursor-pointer transition-all"
        >
          <div className="flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-slate-600" />
            <span>Install on iPhone / iPad</span>
          </div>
          <span className="text-[10px] text-slate-500">Tap for guide</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
            <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl border border-slate-200 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Smartphone className="w-5 h-5 text-emerald-600" />
                  <h3 className="text-sm font-bold text-slate-900">Install on iPhone / iPad</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowIOSGuide(false)}
                  className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-2 text-xs text-slate-600">
                <div className="flex items-start gap-2.5 p-2 bg-slate-50 rounded-xl">
                  <span className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px] font-bold shrink-0">
                    1
                  </span>
                  <span>
                    Tap the <strong>Share</strong> button at the bottom of Safari.
                  </span>
                </div>
                <div className="flex items-start gap-2.5 p-2 bg-slate-50 rounded-xl">
                  <span className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px] font-bold shrink-0">
                    2
                  </span>
                  <span>
                    Scroll down and tap <strong>Add to Home Screen</strong>.
                  </span>
                </div>
                <div className="flex items-start gap-2.5 p-2 bg-slate-50 rounded-xl">
                  <span className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px] font-bold shrink-0">
                    3
                  </span>
                  <span>
                    Launch <strong>OFFPAY</strong> directly from your home screen for full offline and instant UPI experience.
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowIOSGuide(false)}
                className="w-full py-2.5 bg-slate-950 text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
