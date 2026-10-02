import React, { useState } from 'react';
import {
  X,
  History,
  Shield,
  AlertTriangle,
  Lock,
  Layers,
  ChevronRight,
  Trash2,
  ExternalLink,
  BookOpen,
  ArrowRight,
  Clock,
  Sparkles
} from 'lucide-react';
import { ThreatAnalysisResult } from '../lib/engine.ts';

interface SecurityGuidelinesDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  history: ThreatAnalysisResult[];
  onSelectHistory: (item: ThreatAnalysisResult) => void;
  onClearHistory: () => void;
}

export const SecurityGuidelinesDrawer: React.FC<SecurityGuidelinesDrawerProps> = ({
  isOpen,
  onClose,
  history,
  onSelectHistory,
  onClearHistory,
}) => {
  const [activeTab, setActiveTab] = useState<'guidelines' | 'history'>('guidelines');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/75 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="relative ml-auto w-full max-w-md sm:max-w-lg bg-[#18181B] border-l border-[#3B0000] h-full shadow-2xl flex flex-col justify-between z-10 animate-slide-in">
        {/* Header */}
        <div className="p-5 border-b border-[#2D0A0A] bg-gradient-to-r from-[#3B0000] to-[#18181B] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#DC2626] flex items-center justify-center text-white font-bold shadow-md shadow-red-900/40">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-[#FAFAFA]">PhishLens Intelligence</h3>
              <p className="text-[10px] text-[#FECDD3]">Security Guidelines &amp; Audit Logs</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-black/30 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switchers */}
        <div className="px-5 pt-3 pb-2 border-b border-[#2D0A0A] flex items-center gap-2 bg-[#121212]">
          <button
            onClick={() => setActiveTab('guidelines')}
            className={`flex-1 py-2 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'guidelines'
                ? 'bg-[#2D0A0A] text-[#FECDD3] border border-[#DC2626]/50'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Security Guidelines</span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 py-2 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'history'
                ? 'bg-[#2D0A0A] text-[#FECDD3] border border-[#DC2626]/50'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Audit History ({history.length})</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {activeTab === 'guidelines' ? (
            <div className="space-y-4 text-xs">
              {/* Rule 1: The 3-Second Window */}
              <div className="p-4 bg-[#121212] border border-[#3B0000] rounded-2xl space-y-2">
                <div className="flex items-center gap-2 text-[#EF4444] font-bold">
                  <Clock className="w-4 h-4" />
                  <span>The 3-Second Decision Window</span>
                </div>
                <p className="text-slate-300 leading-relaxed text-[11px]">
                  Scammers bank on cognitive urgency: you scan a QR at a counter or click an SMS link in under 3 seconds. Always pause 3 seconds to let PhishLens unpack hidden redirect hops and verify NPCI handles.
                </p>
              </div>

              {/* Rule 2: Anti-Collect Golden Rule */}
              <div className="p-4 bg-[#2D0A0A] border border-[#DC2626] rounded-2xl space-y-2">
                <div className="flex items-center gap-2 text-[#FECDD3] font-bold">
                  <AlertTriangle className="w-4 h-4 text-[#EF4444]" />
                  <span>The Golden Rule of UPI</span>
                </div>
                <p className="text-[#FECDD3] font-semibold text-xs leading-normal">
                  RECEIVING MONEY NEVER REQUIRES YOUR UPI PIN.
                </p>
                <p className="text-slate-300 leading-relaxed text-[11px]">
                  If a QR code or payment link promises cashback, lottery, or refund, but prompts for your UPI PIN, it is a <strong>Collect Fraud</strong> that will immediately deduct funds from your account.
                </p>
              </div>

              {/* Rule 3: Homoglyphs & Lookalikes */}
              <div className="p-4 bg-[#121212] border border-slate-800 rounded-2xl space-y-2">
                <div className="flex items-center gap-2 text-[#F59E0B] font-bold">
                  <Sparkles className="w-4 h-4" />
                  <span>Homoglyph Character Traps</span>
                </div>
                <p className="text-slate-300 leading-relaxed text-[11px]">
                  Attackers register internationalized domains with Cyrillic characters (e.g. Cyrillic <code className="text-[#EF4444] font-bold">о</code> instead of Latin <code className="text-emerald-400 font-bold">o</code>). To human eyes they look identical, but PhishLens converts them to Punycode and flags them instantly.
                </p>
              </div>

              {/* Rule 4: Data Privacy & Hash Logging */}
              <div className="p-4 bg-[#121212] border border-slate-800 rounded-2xl space-y-2">
                <div className="flex items-center gap-2 text-[#10B981] font-bold">
                  <Lock className="w-4 h-4" />
                  <span>Privacy &amp; Hash Logging Policy</span>
                </div>
                <p className="text-slate-300 leading-relaxed text-[11px]">
                  In accordance with PhishLens audit rules, sensitive query tokens, phone numbers, and payment references are passed through a cryptographic <strong>SHA-256</strong> hash prior to log ingestion. Raw personal credentials are never retained.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {history.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-500">
                  <History className="w-8 h-8 mx-auto mb-2 opacity-40 text-slate-400" />
                  <p>No recent scans recorded in this session.</p>
                  <p className="text-[11px] mt-1 text-slate-600">Scan any link, QR code, or UPI ID to populate audit logs.</p>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Recent Session Scans
                    </span>
                    <button
                      onClick={onClearHistory}
                      className="text-[11px] text-rose-400 hover:text-rose-300 flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Clear All</span>
                    </button>
                  </div>

                  <div className="space-y-2.5">
                    {history.map((item, idx) => (
                      <div
                        key={idx}
                        onClick={() => {
                          onSelectHistory(item);
                          onClose();
                        }}
                        className="p-3 bg-[#121212] hover:bg-[#2D0A0A] border border-slate-800 hover:border-[#DC2626] rounded-xl transition-all cursor-pointer group"
                      >
                        <div className="flex items-center justify-between text-[10px] font-bold uppercase mb-1">
                          <span
                            className={`px-1.5 py-0.5 rounded ${
                              item.verdict === 'DANGER'
                                ? 'bg-red-950 text-red-400 border border-red-800'
                                : item.verdict === 'CAUTION'
                                  ? 'bg-amber-950 text-amber-400 border border-amber-800'
                                  : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                            }`}
                          >
                            {item.verdict}
                          </span>
                          <span className="text-slate-500 font-mono text-[10px]">
                            {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                          </span>
                        </div>

                        <p className="font-mono text-xs text-white truncate group-hover:text-[#FECDD3] font-semibold">
                          {item.anonymizedTarget}
                        </p>

                        <p className="text-[11px] text-slate-400 line-clamp-1 mt-1">
                          {item.plainEnglishVerdict}
                        </p>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#2D0A0A] bg-[#121212] flex items-center justify-between text-xs text-slate-500">
          <span>PhishLens Engine v2.1.0</span>
          <span className="text-[#10B981] font-medium flex items-center gap-1">
            <Shield className="w-3 h-3" /> Zero-Trust Active
          </span>
        </div>
      </div>
    </div>
  );
};
