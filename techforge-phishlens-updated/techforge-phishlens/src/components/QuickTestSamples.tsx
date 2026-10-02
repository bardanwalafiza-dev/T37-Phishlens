import React from 'react';
import { ShieldAlert, ShieldCheck, AlertTriangle, QrCode } from 'lucide-react';

interface QuickTestSamplesProps {
  onSelectSample: (sample: string) => void;
}

export const QuickTestSamples: React.FC<QuickTestSamplesProps> = ({ onSelectSample }) => {
  const samples = [
    {
      label: 'Fake UPI Bank Handle',
      value: 'utility-refund@unauthorizedbank',
      type: 'dangerous',
      tag: 'Unauthorized Handle',
    },
    {
      label: 'Known Fraud Blacklist',
      value: 'lotterywinner@okhdfcbank',
      type: 'dangerous',
      tag: 'Indexed Blacklist',
    },
    {
      label: 'Banking Phishing URL',
      value: 'https://secure-hdfc-kyc.com/login',
      type: 'dangerous',
      tag: 'Lookalike Domain',
    },
    {
      label: 'Homoglyph Attack',
      // Contains Cyrillic small 'о' (U+043E)
      value: 'https://g\u043E\u043Egle.com/login',
      type: 'suspicious',
      tag: 'Cyrillic Spoof',
    },
    {
      label: 'Official Merchant UPI',
      value: 'swiggy@icici',
      type: 'safe',
      tag: 'Verified Merchant',
    },
    {
      label: 'UPI QR Deep Link',
      value: 'upi://pay?pa=zomato@hdfcbank&pn=Zomato%20Ordering&am=380&cu=INR&tn=Food%20Delivery',
      type: 'safe',
      tag: 'Official QR Code',
    },
  ];

  return (
    <div className="w-full">
      <div className="flex items-center gap-2 mb-3">
        <QrCode className="w-4 h-4 text-cyan-400" />
        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Instant Threat Simulation Presets
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
        {samples.map((s, idx) => (
          <button
            key={idx}
            onClick={() => onSelectSample(s.value)}
            className="flex flex-col text-left p-3 rounded-xl bg-slate-900/80 hover:bg-slate-800/90 border border-slate-800 hover:border-slate-700 transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-1.5">
              <span
                className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border ${
                  s.type === 'dangerous'
                    ? 'text-rose-400 border-rose-800/60 bg-rose-950/40'
                    : s.type === 'suspicious'
                      ? 'text-amber-400 border-amber-800/60 bg-amber-950/40'
                      : 'text-emerald-400 border-emerald-800/60 bg-emerald-950/40'
                }`}
              >
                {s.tag}
              </span>
              {s.type === 'dangerous' && <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />}
              {s.type === 'suspicious' && <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />}
              {s.type === 'safe' && <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />}
            </div>
            <span className="text-xs font-semibold text-slate-200 group-hover:text-cyan-300 transition-colors line-clamp-1">
              {s.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};
