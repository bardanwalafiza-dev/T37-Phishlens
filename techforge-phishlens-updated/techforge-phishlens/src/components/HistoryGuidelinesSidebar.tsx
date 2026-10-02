import React, { useState } from 'react';
import {
  X,
  History,
  Shield,
  BookOpen,
  CheckCircle2,
  Trash2,
  ArrowRight,
  ShieldCheck,
  AlertTriangle
} from 'lucide-react';
import { ThreatAnalysisResult } from '../lib/engine.ts';
import { Translations, TRANSLATIONS } from '../lib/translations.ts';

interface HistoryGuidelinesSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  history: ThreatAnalysisResult[];
  onSelectHistory: (item: ThreatAnalysisResult) => void;
  onClearHistory: () => void;
  t?: Translations;
}

export const HistoryGuidelinesSidebar: React.FC<HistoryGuidelinesSidebarProps> = ({
  isOpen,
  onClose,
  history,
  onSelectHistory,
  onClearHistory,
  t = TRANSLATIONS.en,
}) => {
  const [activeTab, setActiveTab] = useState<'history' | 'guidelines'>('history');

  if (!isOpen) return null;

  const s = t.sidebar;

  // Single-line concise security pointers (Clean, powerful, no unnecessary text)
  const securityPointers = [
    { text: 'Never enter your UPI PIN to receive money — PIN is exclusively used for outgoing debits.', highlight: 'Never enter PIN to receive' },
    { text: 'Always verify the root domain in your address bar before entering passwords or OTPs.', highlight: 'Verify root domain' },
    { text: 'Watch for Cyrillic and lookalike homoglyphs disguised as familiar brand letters.', highlight: 'Watch for homoglyphs' },
    { text: 'Banks never demand urgent KYC PAN or Aadhaar verification via SMS or WhatsApp links.', highlight: 'No urgent KYC via SMS' },
    { text: 'Inspect QR codes for Inverted Collect Tricks disguising debit requests as "Cashback".', highlight: 'Reject "Cashback" debit QRs' },
    { text: 'Ensure UPI handles belong to 60+ authorized NPCI partner banks (e.g. @oksbi, @okhdfcbank).', highlight: 'Check NPCI bank handle' },
    { text: 'Never open shortened or multi-hop redirect links (bit.ly, t.co) without unrolling destination.', highlight: 'Unroll shortened links' },
    { text: 'Download official banking apps only from Google Play Store or Apple App Store, never from QR APKs.', highlight: 'No APK downloads via QR' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Blurred Dim Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-2xs transition-opacity"
        onClick={onClose}
      />

      {/* Slide-out White Drawer on the left */}
      <div className="relative w-[85vw] max-w-sm sm:max-w-md bg-white h-full shadow-2xl flex flex-col justify-between z-10 animate-slide-in border-r border-slate-200">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-rose-50 border border-rose-200 flex items-center justify-center text-[#e11d48]">
                <Shield className="w-4 h-4" />
              </div>
              <h3 className="font-extrabold text-base text-slate-900">
                {s.title}
              </h3>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Two Tabs */}
          <div className="p-3 sm:p-4 border-b border-slate-100 flex items-center gap-2 shrink-0">
            <button
              onClick={() => setActiveTab('history')}
              className={`flex-1 py-2 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'history'
                  ? 'bg-[#e11d48] text-white shadow-xs'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              <span>{s.history}</span>
            </button>

            <button
              onClick={() => setActiveTab('guidelines')}
              className={`flex-1 py-2 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'guidelines'
                  ? 'bg-[#e11d48] text-white shadow-xs'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>{s.securityGuidelines}</span>
            </button>
          </div>

          {/* Content Area */}
          <div className="p-4 sm:p-5 overflow-y-auto flex-1">
            {activeTab === 'history' ? (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-rose-600 block">
                    {s.recentVerifications}
                  </span>
                  {history.length > 0 && (
                    <button
                      onClick={onClearHistory}
                      className="text-xs text-slate-400 hover:text-rose-600 flex items-center gap-1 font-medium transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>{s.clearHistory}</span>
                    </button>
                  )}
                </div>

                {history.length === 0 ? (
                  <div className="text-center py-12 px-4 border border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
                    <History className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="text-xs font-semibold text-slate-700">{s.noHistory}</p>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Scanned URLs and UPI targets will appear here.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {history.map((item, idx) => {
                      const isDanger = item.verdict === 'DANGER';
                      const isCaution = item.verdict === 'CAUTION';
                      return (
                        <div
                          key={idx}
                          onClick={() => {
                            onSelectHistory(item);
                            onClose();
                          }}
                          className="p-3 rounded-2xl border border-slate-200 hover:border-rose-300 bg-white hover:bg-rose-50/40 transition-all cursor-pointer shadow-2xs group"
                        >
                          <div className="flex items-center justify-between mb-1.5">
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                isDanger
                                  ? 'bg-rose-100 text-rose-700'
                                  : isCaution
                                    ? 'bg-amber-100 text-amber-700'
                                    : 'bg-emerald-100 text-emerald-700'
                              }`}
                            >
                              {item.verdict} ({item.riskScore}/100)
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              {new Date(item.timestamp).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                                second: '2-digit',
                              })}
                            </span>
                          </div>

                          <p className="font-mono text-xs font-semibold text-slate-800 truncate mb-1">
                            {item.target}
                          </p>

                          <div className="flex items-center justify-between text-[11px] text-slate-500">
                            <span>{item.category}</span>
                            <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-rose-600 transition-colors" />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ) : (
              /* Security Guidelines - One Line Pointers Only (Clean & Direct) */
              <div className="space-y-2.5">
                <div className="flex items-center gap-2 mb-3">
                  <ShieldCheck className="w-4 h-4 text-[#e11d48]" />
                  <span className="text-[11px] font-bold uppercase tracking-wider text-rose-600">
                    One-Line Security Pointers
                  </span>
                </div>

                {securityPointers.map((pointer, i) => (
                  <div
                    key={i}
                    className="p-3 bg-slate-50 hover:bg-rose-50/50 border border-slate-200 hover:border-rose-200 rounded-xl flex items-start gap-2.5 text-xs text-slate-700 transition-colors"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-[#e11d48] shrink-0 mt-1.5" />
                    <p className="leading-snug">
                      {pointer.text}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Compact Footer */}
          <div className="p-3.5 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-xs text-slate-500 shrink-0">
            <span>PhishLens v2.3</span>
            <span className="text-emerald-700 font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> 60+ NPCI Handles Active
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
