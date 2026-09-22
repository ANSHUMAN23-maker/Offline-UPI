import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  Building2,
  Cpu,
  Key,
  Smartphone,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Zap,
  BookOpen
} from 'lucide-react';
import { triggerKeypadHaptic } from '../utils/haptics';
import { isMobileDevice, launchUpiIntent, buildUpiUri } from '../utils/upi';

interface UpiGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UpiGuideModal: React.FC<UpiGuideModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'architecture' | 'tpap' | 'gateway' | 'checklist'>('architecture');
  const [testUpiLaunched, setTestUpiLaunched] = useState(false);
  const isMobile = isMobileDevice();

  if (!isOpen) return null;

  const testUpiUri = buildUpiUri({
    pa: 'anshumanpati411@okaxis',
    pn: 'Test Merchant',
    am: '1.00',
    tn: 'UPI Test Ping',
  });

  const handleTestPing = () => {
    triggerKeypadHaptic();
    setTestUpiLaunched(true);
    launchUpiIntent(testUpiUri);
    setTimeout(() => setTestUpiLaunched(false), 5000);
  };

  return (
    <div
      id="upi-guide-modal-backdrop"
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200"
    >
      <div
        id="upi-guide-card"
        className="w-full max-w-lg bg-white rounded-3xl overflow-hidden shadow-2xl border border-slate-200 flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-extrabold text-sm sm:text-base tracking-tight">
                Production UPI Implementation Guide
              </h2>
              <p className="text-[11px] text-slate-400">
                What is needed to run a fully functional UPI app in India
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              triggerKeypadHaptic();
              onClose();
            }}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab navigation bar */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-2 pt-2 gap-1 overflow-x-auto select-none">
          {[
            { id: 'architecture', label: '1. How It Works' },
            { id: 'gateway', label: '2. Gateway (Fast)' },
            { id: 'tpap', label: '3. NPCI TPAP (Enterprise)' },
            { id: 'checklist', label: '4. Checklist' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                triggerKeypadHaptic();
                setActiveTab(tab.id as any);
              }}
              className={`px-3 py-2 text-xs font-bold rounded-t-xl transition-all cursor-pointer whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-white text-slate-900 border-t-2 border-emerald-600 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Contents */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4 text-xs text-slate-700 leading-relaxed">
          {/* TAB 1: ARCHITECTURE & HOW IT WORKS NOW */}
          {activeTab === 'architecture' && (
            <div className="space-y-4">
              <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl">
                <div className="flex items-center gap-2 text-emerald-900 font-bold text-xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Already Functional in this Web App!</span>
                </div>
                <p className="text-emerald-800 text-[11px] mt-1 leading-normal">
                  This app is already equipped with three fully working payment engines that require zero API keys or external servers:
                </p>
              </div>

              <div className="grid grid-cols-1 gap-2.5">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 flex items-center gap-1.5">
                      <Zap className="w-4 h-4 text-amber-500" />
                      <span>1. Standard UPI Intent (`upi://pay`)</span>
                    </span>
                    <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                      Ready
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600">
                    When you click "Pay via UPI App" on any mobile phone (Android or iOS), it invokes the operating system's registered UPI handler. Google Pay, PhonePe, Paytm, BHIM, or Cred pops up immediately to authenticate and transfer real money directly between bank accounts at 0% fee.
                  </p>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 flex items-center gap-1.5">
                      <Smartphone className="w-4 h-4 text-indigo-500" />
                      <span>2. Dynamic BharatQR / UPI QR Engine</span>
                    </span>
                    <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                      Ready
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600">
                    Real-time QR generation and scanning using standard NPCI parameters. Any customer can point their phone camera at the screen and pay directly to your configured UPI ID.
                  </p>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-500" />
                      <span>3. Offline NUUP *99# USSD Banking</span>
                    </span>
                    <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                      Ready
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600">
                    Dials telecom codes over GSM network without internet or mobile data. Built into Indian telecom infrastructure (Airtel, Jio, Vi, BSNL).
                  </p>
                </div>
              </div>

              {/* Live Test Trigger */}
              <div className="p-3.5 bg-slate-900 text-white rounded-2xl space-y-2">
                <span className="font-bold text-xs block text-emerald-400">
                  ⚡ Test Real UPI Deep Link on Your Device
                </span>
                <p className="text-[11px] text-slate-300">
                  Tap below on your mobile device. It will prompt your device to open Google Pay, PhonePe, or Paytm with a sample test URI:
                </p>
                <button
                  type="button"
                  onClick={handleTestPing}
                  className="w-full py-2.5 px-3 bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-slate-950 font-bold text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-transform"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Launch Test UPI Intent</span>
                </button>
                {testUpiLaunched && (
                  <span className="text-[10px] text-emerald-300 block text-center font-mono">
                    Intent triggered! If on mobile, your UPI app chooser will display.
                  </span>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: PAYMENT GATEWAY (RECOMMENDED FOR WEB & HYBRID APPS) */}
          {activeTab === 'gateway' && (
            <div className="space-y-3">
              <div className="p-3 bg-sky-50 border border-sky-200 rounded-2xl">
                <h4 className="font-bold text-xs text-sky-950 flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-sky-600" />
                  <span>Recommended for 99% of Startups & Web Apps</span>
                </h4>
                <p className="text-[11px] text-sky-800 mt-1">
                  If you want your website or app to accept payments and automatically receive server-verified confirmation without becoming a licensed bank, use a licensed UPI Payment Gateway (Razorpay or Cashfree).
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-slate-900 text-xs">Steps to Go Live:</h4>
                <ol className="list-decimal pl-4 space-y-2 text-[11px] text-slate-700">
                  <li>
                    <strong>Register for a Payment Gateway:</strong> Sign up at{' '}
                    <span className="font-mono text-indigo-600">razorpay.com</span> or{' '}
                    <span className="font-mono text-indigo-600">cashfree.com</span>.
                  </li>
                  <li>
                    <strong>Complete Business KYC:</strong> Provide your Indian Business PAN, GSTIN (or Individual PAN for unregistered businesses), and linked Bank Account details.
                  </li>
                  <li>
                    <strong>Obtain API Keys:</strong> Copy your <code className="bg-slate-100 px-1 py-0.5 rounded">RAZORPAY_KEY_ID</code> and <code className="bg-slate-100 px-1 py-0.5 rounded">RAZORPAY_KEY_SECRET</code> from the dashboard.
                  </li>
                  <li>
                    <strong>Add Webhook Endpoint:</strong> Set up an endpoint (e.g. <code className="bg-slate-100 px-1 py-0.5 rounded">/api/upi/webhook</code>) that listens for <code className="font-mono">payment.captured</code> events to verify money has actually credited into your bank account.
                  </li>
                </ol>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1 text-[11px]">
                <span className="font-bold text-slate-900 block">Why this is best:</span>
                <p className="text-slate-600">
                  &bull; No multi-crore bank partnerships required.<br />
                  &bull; Automated settlement directly into your Indian bank account next morning.<br />
                  &bull; Supports UPI AutoPay (recurring subscriptions) and UPI QR.
                </p>
              </div>
            </div>
          )}

          {/* TAB 3: NPCI TPAP ROUTE (PHONEPE / GPAY MODEL) */}
          {activeTab === 'tpap' && (
            <div className="space-y-3">
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl">
                <h4 className="font-bold text-xs text-amber-950 flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-amber-600" />
                  <span>Enterprise TPAP (Third Party Application Provider)</span>
                </h4>
                <p className="text-[11px] text-amber-900 mt-1">
                  This is how apps like PhonePe, Google Pay, and CRED operate as direct consumer UPI payment apps.
                </p>
              </div>

              <div className="space-y-2 text-[11px]">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <span className="font-bold text-slate-900 block">1. Sponsor PSP Bank Partnership</span>
                  <p className="text-slate-600 mt-0.5">
                    NPCI does not connect directly to tech companies. You must enter a multi-year partnership with a Sponsor Payment Service Provider (PSP) bank (e.g., ICICI Bank, Yes Bank, Axis Bank, or HDFC Bank).
                  </p>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <span className="font-bold text-slate-900 block">2. NPCI Common Library (CL) SDK</span>
                  <p className="text-slate-600 mt-0.5">
                    RBI regulations strictly prohibit web apps or mobile apps from capturing the user's 4-digit or 6-digit UPI MPIN in plain software. You must embed the proprietary NPCI Common Library (CL) native Android/iOS SDK which captures and encrypts the PIN using hardware HSM keys before transmission.
                  </p>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <span className="font-bold text-slate-900 block">3. CERT-In Security Audit & Compliance</span>
                  <p className="text-slate-600 mt-0.5">
                    Mandatory comprehensive security audit by a CERT-In empanelled auditing firm, OWASP MASVS Level 2 compliance, and NPCI procedural sign-off.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: CHECKLIST */}
          {activeTab === 'checklist' && (
            <div className="space-y-3">
              <span className="font-bold text-xs text-slate-900 block">
                Readiness Checklist for Your App:
              </span>

              <div className="space-y-2 text-[11px]">
                <div className="flex items-start gap-2 p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-slate-900 block">UPI Deep Linking (`upi://pay`)</span>
                    <span className="text-slate-500">Configured and active on all transfer screens.</span>
                  </div>
                </div>

                <div className="flex items-start gap-2 p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-slate-900 block">Dynamic QR Scanner & Generator</span>
                    <span className="text-slate-500">Supports camera scanning, image uploads, and BharatQR standard.</span>
                  </div>
                </div>

                <div className="flex items-start gap-2 p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-slate-900 block">Offline *99# USSD Protocol</span>
                    <span className="text-slate-500">Cellular telephony dialing via GSM network.</span>
                  </div>
                </div>

                <div className="flex items-start gap-2 p-2.5 bg-amber-50 border border-amber-200 rounded-xl">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-amber-950 block">Payment Gateway Key (For Production Web)</span>
                    <span className="text-amber-800">
                      When ready to collect real business payments on web, declare <code className="font-mono text-slate-900">RAZORPAY_KEY_ID</code> in <code className="font-mono text-slate-900">.env.example</code>.
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-2 p-2.5 bg-indigo-50 border border-indigo-200 rounded-xl">
                  <Smartphone className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-indigo-950 block">Publishing as Android APK (Capacitor / TWA)</span>
                    <span className="text-indigo-800">
                      Run <code className="font-mono bg-white px-1 py-0.5 rounded">npx @capacitor/cli create</code> to turn this web app into an installable Android APK that launches UPI intents seamlessly.
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            type="button"
            onClick={() => {
              triggerKeypadHaptic();
              onClose();
            }}
            className="py-2.5 px-6 bg-slate-900 hover:bg-black text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer active:scale-95 transition-transform"
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  );
};
