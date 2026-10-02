import React, { useState } from 'react';
import { ShieldAlert, ExternalLink, AlertOctagon, CheckCircle2, Copy, X } from 'lucide-react';
import { ThreatAnalysisResult } from '../lib/engine.ts';

interface SafeNavigationGuardProps {
  threat: ThreatAnalysisResult;
  isOpen: boolean;
  onClose: () => void;
}

export const SafeNavigationGuard: React.FC<SafeNavigationGuardProps> = ({
  threat,
  isOpen,
  onClose,
}) => {
  const [confirmedRisk, setConfirmedRisk] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(threat.target);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isCritical = threat.verdict === 'DANGER';

  const handleProceed = () => {
    let url = threat.target;
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }
    window.open(url, '_blank', 'noopener,noreferrer');
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="guard-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in"
    >
      <div
        className={`relative w-full max-w-lg bg-[#18181B] border-2 ${
          isCritical ? 'border-[#EF4444] animate-danger-shake shadow-[0_0_40px_rgba(239,68,68,0.35)]' : 'border-[#F59E0B]'
        } rounded-2xl shadow-2xl overflow-hidden p-6 sm:p-7`}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-[#FAFAFA] hover:bg-[#2D0A0A] rounded-xl transition-colors cursor-pointer"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3.5 mb-4">
          <div className="w-11 h-11 rounded-xl bg-[#2D0A0A] border border-[#EF4444]/40 flex items-center justify-center text-[#EF4444] shrink-0">
            <ShieldAlert className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h3 id="guard-title" className="text-lg font-bold text-[#FAFAFA]">
              Security Guard Intercept
            </h3>
            <p className="text-xs text-[#EF4444] font-semibold">
              Threat Vector Quarantined &middot; Action Required
            </p>
          </div>
        </div>

        {/* Target Destination Box */}
        <div className="p-3.5 bg-[#121212] border border-[#2D0A0A] rounded-xl mb-4">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#FECDD3]">
              Destination Address
            </span>
            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-1 text-[11px] text-[#9CA3AF] hover:text-[#FAFAFA] transition-colors cursor-pointer"
            >
              {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981]" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
          <div className="font-mono text-xs text-[#EF4444] break-all select-all font-semibold">
            {threat.target}
          </div>
        </div>

        {/* 1-Sentence Plain English Warning */}
        <div className="p-3 bg-[#2D0A0A]/60 border border-[#6B0000] rounded-xl mb-4 text-xs font-semibold text-[#FECDD3]">
          {threat.plainEnglishVerdict}
        </div>

        {/* Detailed Reasons */}
        <div className="space-y-1.5 mb-4">
          <p className="text-[11px] font-bold uppercase tracking-wider text-[#9CA3AF]">Signals Triggered:</p>
          <ul className="space-y-1 text-xs text-slate-300 list-disc list-inside">
            {threat.reasons.map((r, i) => (
              <li key={i} className="leading-relaxed">
                {r}
              </li>
            ))}
          </ul>
        </div>

        {isCritical && (
          <div className="flex items-center gap-2 mb-5">
            <input
              type="checkbox"
              id="confirm-bypass"
              checked={confirmedRisk}
              onChange={(e) => setConfirmedRisk(e.target.checked)}
              className="w-4 h-4 rounded border-slate-700 bg-[#121212] text-[#DC2626] focus:ring-[#DC2626] cursor-pointer"
            />
            <label htmlFor="confirm-bypass" className="text-xs text-slate-300 font-medium cursor-pointer select-none">
              I acknowledge the high phishing risk and want to proceed anyway
            </label>
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          <button
            onClick={onClose}
            className="flex-1 inline-flex items-center justify-center px-4 py-2.5 text-xs sm:text-sm font-semibold text-[#FAFAFA] bg-[#121212] hover:bg-[#2D0A0A] border border-[#6B0000] rounded-xl transition-colors cursor-pointer"
          >
            Return to Safety (Recommended)
          </button>

          <button
            onClick={handleProceed}
            disabled={isCritical && !confirmedRisk}
            className={`inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-semibold rounded-xl border transition-all cursor-pointer ${
              isCritical && !confirmedRisk
                ? 'opacity-40 cursor-not-allowed bg-[#2D0A0A] text-[#9CA3AF] border-slate-800'
                : 'bg-[#DC2626] hover:bg-[#EF4444] text-[#FAFAFA] border-[#DC2626]'
            }`}
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Proceed Anyway</span>
          </button>
        </div>
      </div>
    </div>
  );
};
