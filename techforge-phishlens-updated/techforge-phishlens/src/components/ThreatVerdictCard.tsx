import React, { useState } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Copy,
  CheckCircle2,
  ExternalLink,
  Building2,
  AlertOctagon,
  ArrowRight,
  Zap,
  Calendar,
  Layers,
  Sparkles,
  Lock,
  Compass
} from 'lucide-react';
import { ThreatAnalysisResult } from '../lib/engine.ts';
import { SafeNavigationGuard } from './SafeNavigationGuard.tsx';

interface ThreatVerdictCardProps {
  result: ThreatAnalysisResult;
  onClear: () => void;
}

export const ThreatVerdictCard: React.FC<ThreatVerdictCardProps> = ({ result, onClear }) => {
  const [copied, setCopied] = useState<boolean>(false);
  const [showGuard, setShowGuard] = useState<boolean>(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(result.target);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const { verdict, riskScore, category, upiDetails, domainDetails, redirectChain, hasRedirectChain, domainAgeDays, executionTimeMs } = result;

  const isDanger = verdict === 'DANGER';
  const isCaution = verdict === 'CAUTION';
  const isSafe = verdict === 'SAFE';

  // Full-width banner styles
  const bannerBg = isDanger
    ? 'bg-[#DC2626] text-[#FAFAFA]'
    : isCaution
      ? 'bg-[#F59E0B] text-slate-950'
      : 'bg-[#10B981] text-[#FAFAFA]';

  const handleLaunchExternal = () => {
    if (isDanger || isCaution) {
      setShowGuard(true);
    } else {
      let url = result.target;
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'https://' + url;
      }
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <>
      <SafeNavigationGuard
        threat={result}
        isOpen={showGuard}
        onClose={() => setShowGuard(false)}
      />

      <div
        className={`w-full bg-[#18181B] border-2 ${
          isDanger ? 'border-[#EF4444] animate-danger-shake shadow-[0_0_50px_rgba(220,38,38,0.25)]' : isCaution ? 'border-[#F59E0B]' : 'border-[#10B981]'
        } rounded-3xl overflow-hidden shadow-2xl transition-all`}
      >
        {/* 1. Full-Width High-Visibility Status Header */}
        <div className={`w-full px-6 py-5 ${bannerBg} flex flex-col md:flex-row md:items-center justify-between gap-4`}>
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-black/20 flex items-center justify-center shrink-0">
              {isDanger && <ShieldAlert className="w-7 h-7 text-white animate-pulse" />}
              {isCaution && <AlertTriangle className="w-7 h-7 text-slate-950" />}
              {isSafe && <ShieldCheck className="w-7 h-7 text-white" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-black/25">
                  {verdict} VERDICT
                </span>
                <span className="text-xs opacity-90 font-medium">
                  {category === 'UPI_VPA' ? 'NPCI UPI Identifier' : category === 'UPI_DEEP_LINK' ? 'UPI QR Deep Link' : 'Web Domain / URL'}
                </span>
              </div>
              {/* Oversized 1-Sentence Plain-Language Verdict (18px-20px) */}
              <h2 className="text-lg sm:text-xl font-extrabold mt-1 tracking-tight leading-snug">
                {result.plainEnglishVerdict}
              </h2>
            </div>
          </div>

          {/* Latency & Risk Badge */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="px-3 py-1.5 rounded-xl bg-black/30 backdrop-blur-xs text-xs font-mono font-semibold flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-300" />
              <span>{executionTimeMs}ms (Under 3s)</span>
            </div>
          </div>
        </div>

        {/* 2. Visual Metric Badges Bar */}
        <div className="px-6 py-3.5 bg-[#121212] border-b border-[#2D0A0A] flex flex-wrap items-center gap-2.5 text-xs">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#18181B] border border-slate-800 text-slate-200">
            <span className="text-[10px] text-slate-400 font-bold uppercase">Risk Score:</span>
            <span className={`font-mono font-bold ${isDanger ? 'text-[#EF4444]' : isCaution ? 'text-[#F59E0B]' : 'text-[#10B981]'}`}>
              {riskScore}/100
            </span>
          </div>

          {domainAgeDays !== undefined && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#18181B] border border-slate-800 text-slate-200">
              <Calendar className="w-3.5 h-3.5 text-[#F59E0B]" />
              <span className="text-[10px] text-slate-400 font-bold uppercase">Domain Age:</span>
              <span className="font-mono font-bold">
                {domainAgeDays < 30 ? `${domainAgeDays} Days (Disposable)` : `${domainAgeDays} Days`}
              </span>
            </div>
          )}

          {hasRedirectChain && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#18181B] border border-slate-800 text-[#FECDD3]">
              <Layers className="w-3.5 h-3.5 text-[#DC2626]" />
              <span className="text-[10px] font-bold uppercase">Redirect Hops:</span>
              <span className="font-mono font-bold">{redirectChain.length} Hops Detected</span>
            </div>
          )}

          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#18181B] border border-slate-800 text-slate-300">
            <Lock className="w-3.5 h-3.5 text-[#10B981]" />
            <span className="text-[10px] text-slate-400 font-bold uppercase">SHA-256 Hash Log:</span>
            <span className="font-mono text-[11px] text-slate-400">Anonymized</span>
          </div>
        </div>

        {/* 3. Inspected Target Box */}
        <div className="p-6 space-y-6">
          <div className="p-4 bg-[#121212] border border-[#2D0A0A] rounded-2xl">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Inspected Address</span>
              <button
                onClick={handleCopy}
                className="inline-flex items-center gap-1.5 text-xs text-[#FECDD3] hover:text-white font-medium transition-colors cursor-pointer"
              >
                {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981]" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <p className="font-mono text-xs sm:text-sm text-[#FAFAFA] break-all select-all font-semibold">
              {result.target}
            </p>
          </div>

          {/* 4. Visual Inspection Breakdown: Redirect Chain Node Graph */}
          {hasRedirectChain && (
            <div className="p-4 bg-[#121212] border border-[#3B0000] rounded-2xl">
              <div className="flex items-center gap-2 mb-3">
                <Layers className="w-4 h-4 text-[#DC2626]" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#FECDD3]">
                  Redirect Chain Node Graph (Unroller Engine)
                </h4>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 overflow-x-auto py-2">
                {redirectChain.map((node, i) => (
                  <React.Fragment key={i}>
                    <div
                      className={`flex-1 min-w-[200px] p-3 rounded-xl border ${
                        node.flagged
                          ? 'bg-[#2D0A0A] border-[#DC2626]/70 text-[#FECDD3]'
                          : 'bg-[#18181B] border-slate-800 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[10px] font-bold uppercase mb-1">
                        <span className={node.flagged ? 'text-[#DC2626]' : 'text-slate-400'}>
                          Step {node.step}: {node.type}
                        </span>
                        <span className="font-mono text-slate-400">HTTP {node.status}</span>
                      </div>
                      <p className="font-mono text-xs text-white truncate font-medium" title={node.url}>
                        {node.url}
                      </p>
                      {node.note && (
                        <p className="text-[11px] text-slate-400 mt-1">{node.note}</p>
                      )}
                    </div>

                    {i < redirectChain.length - 1 && (
                      <div className="flex items-center justify-center shrink-0 text-[#DC2626] font-bold">
                        <ArrowRight className="w-4 h-4 hidden sm:block" />
                        <span className="sm:hidden text-xs">&darr;</span>
                      </div>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
          )}

          {/* 5. Visual Inspection Breakdown: Homoglyph Highlighter */}
          {domainDetails && domainDetails.detectedHomoglyphs.length > 0 && (
            <div className="p-4 bg-[#2D0A0A]/70 border border-[#DC2626] rounded-2xl">
              <div className="flex items-center gap-2 mb-3">
                <AlertOctagon className="w-4 h-4 text-[#EF4444]" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#FECDD3]">
                  Homoglyph Character Inspection (Lookalike Attack)
                </h4>
              </div>

              <div className="p-3 bg-[#121212] border border-slate-800 rounded-xl mb-3 flex flex-wrap items-center gap-1 font-mono text-sm sm:text-base">
                <span className="text-slate-400">Domain:</span>
                {Array.from(domainDetails.hostname).map((ch, idx) => {
                  const hg = domainDetails.detectedHomoglyphs.find((h) => h.char === ch);
                  if (hg) {
                    return (
                      <span
                        key={idx}
                        className="bg-[#DC2626] text-white px-1.5 py-0.5 rounded font-bold shadow-md shadow-red-900/50"
                        title={`Deceptive character ${hg.codePoint} impersonating Latin '${hg.replaces}'`}
                      >
                        {ch}
                      </span>
                    );
                  }
                  return <span key={idx} className="text-slate-200">{ch}</span>;
                })}
              </div>

              <div className="flex flex-wrap gap-2 text-xs">
                {domainDetails.detectedHomoglyphs.map((hg, idx) => (
                  <div
                    key={idx}
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#18181B] border border-[#DC2626]/50 text-xs"
                  >
                    <span className="font-mono font-bold text-[#EF4444] text-sm">'{hg.char}'</span>
                    <span className="text-slate-400">({hg.codePoint})</span>
                    <ArrowRight className="w-3 h-3 text-slate-500" />
                    <span className="text-[#FAFAFA]">Replaces Latin '{hg.replaces}'</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 6. Visual Inspection Breakdown: 2-Column Key-Value UPI Payload Grid */}
          {upiDetails && (
            <div className="p-4 bg-[#121212] border border-[#2D0A0A] rounded-2xl">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-[#DC2626]" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#FECDD3]">
                    UPI Payload &amp; Banking Parameters
                  </h4>
                </div>
                {result.isCollectTrick && (
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 bg-[#DC2626] text-white rounded-full">
                    Anti-Collect Alert
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-[#18181B] border border-slate-800 rounded-xl">
                  <span className="text-[10px] font-bold uppercase text-slate-500 block mb-1">
                    Payee Virtual Address (VPA)
                  </span>
                  <span className="font-mono text-sm font-bold text-white break-all">
                    {upiDetails.username}@{upiDetails.handle}
                  </span>
                </div>

                <div className="p-3 bg-[#18181B] border border-slate-800 rounded-xl">
                  <span className="text-[10px] font-bold uppercase text-slate-500 block mb-1">
                    NPCI Bank / PSP Authorization
                  </span>
                  <div className="flex items-center gap-1.5">
                    {upiDetails.isRecognizedPsp ? (
                      <span className="font-bold text-[#10B981] flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Authorized ({upiDetails.bankName})
                      </span>
                    ) : (
                      <span className="font-bold text-[#EF4444] flex items-center gap-1">
                        <AlertOctagon className="w-3.5 h-3.5" />
                        Unauthorized Bank Handle
                      </span>
                    )}
                  </div>
                </div>

                <div className="p-3 bg-[#18181B] border border-slate-800 rounded-xl">
                  <span className="text-[10px] font-bold uppercase text-slate-500 block mb-1">
                    Transaction Intent (Collect vs Pay)
                  </span>
                  <span className={`font-bold ${result.isCollectTrick ? 'text-[#EF4444]' : 'text-slate-200'}`}>
                    {result.isCollectTrick ? '⚠️ Inverted Collect (DEBITS YOUR ACCOUNT)' : 'Standard Transfer'}
                  </span>
                </div>

                <div className="p-3 bg-[#18181B] border border-slate-800 rounded-xl">
                  <span className="text-[10px] font-bold uppercase text-slate-500 block mb-1">
                    Requested Amount
                  </span>
                  <span className="font-mono text-sm font-bold text-[#F59E0B]">
                    {upiDetails.parsedDetails?.amount ? `₹${upiDetails.parsedDetails.amount}` : 'Dynamic / Any Amount'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* 7. Action Signals List */}
          <div className="space-y-2">
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Inspection Reasoning &amp; Signals
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {result.reasons.map((r, i) => (
                <div
                  key={i}
                  className="p-3 bg-[#121212] border border-[#2D0A0A] rounded-xl text-xs text-slate-300 flex items-start gap-2.5"
                >
                  <span className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${isDanger ? 'bg-[#EF4444]' : isCaution ? 'bg-[#F59E0B]' : 'bg-[#10B981]'}`} />
                  <span className="leading-relaxed">{r}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 8. Bottom Action Controls */}
          <div className="pt-4 border-t border-[#2D0A0A] flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              {category === 'URL' && (
                <button
                  onClick={handleLaunchExternal}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-[#FAFAFA] bg-[#2D0A0A] hover:bg-[#3B0000] border border-[#6B0000] rounded-xl transition-colors cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-[#FECDD3]" />
                  <span>Test Link with Safe Guard</span>
                </button>
              )}

              <button
                onClick={handleCopy}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-[#121212] hover:bg-slate-900 border border-slate-800 rounded-xl transition-colors cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5 text-slate-400" />
                <span>Copy Target</span>
              </button>
            </div>

            <button
              onClick={onClear}
              className="px-4 py-2 text-xs font-bold text-[#FECDD3] hover:text-white transition-colors cursor-pointer"
            >
              Clear &amp; Scan Another Target
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
