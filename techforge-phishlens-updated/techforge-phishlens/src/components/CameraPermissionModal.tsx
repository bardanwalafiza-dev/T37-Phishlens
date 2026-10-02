import React, { useState } from 'react';
import { Camera, ShieldCheck, Lock, EyeOff, X, ArrowRight, UploadCloud } from 'lucide-react';

interface CameraPermissionModalProps {
  isOpen: boolean;
  onGrant: (rememberChoice: boolean) => void;
  onDeny: () => void;
  onSelectUploadAlternative: () => void;
}

export const CameraPermissionModal: React.FC<CameraPermissionModalProps> = ({
  isOpen,
  onGrant,
  onDeny,
  onSelectUploadAlternative,
}) => {
  const [remember, setRemember] = useState(false);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="camera-permission-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in"
    >
      <div className="relative w-full max-w-md bg-[#18181B] border border-[#3B0000] rounded-2xl shadow-2xl shadow-black/80 overflow-hidden p-6 sm:p-7 text-left">
        {/* Close Button */}
        <button
          onClick={onDeny}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-[#FAFAFA] hover:bg-[#2D0A0A] rounded-xl transition-colors cursor-pointer"
          aria-label="Close permission dialog"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3.5 mb-4">
          <div className="w-11 h-11 rounded-xl bg-[#2D0A0A] border border-[#DC2626]/40 flex items-center justify-center text-[#DC2626] shrink-0 shadow-inner">
            <Camera className="w-5 h-5" />
          </div>
          <div>
            <h3 id="camera-permission-title" className="text-lg font-bold text-[#FAFAFA]">
              Camera Access Required
            </h3>
            <p className="text-[11px] text-[#FECDD3] font-medium">
              PhishLens Privacy Guard &middot; Consent Required
            </p>
          </div>
        </div>

        {/* Concise Description */}
        <p className="text-xs text-[#9CA3AF] leading-relaxed mb-4">
          PhishLens requires explicit authorization before activating your camera hardware to scan QR codes in real time.
        </p>

        {/* 3 Concise Privacy Guarantees */}
        <div className="space-y-2.5 p-3.5 bg-[#121212] border border-[#2D0A0A] rounded-xl mb-5 text-xs">
          <div className="flex items-center gap-2.5 text-[#FAFAFA]">
            <ShieldCheck className="w-4 h-4 text-[#10B981] shrink-0" />
            <span><strong>100% On-Device:</strong> Frames are processed locally in memory.</span>
          </div>
          <div className="flex items-center gap-2.5 text-[#FAFAFA]">
            <EyeOff className="w-4 h-4 text-[#DC2626] shrink-0" />
            <span><strong>Zero Cloud Storage:</strong> No images or video are saved or sent.</span>
          </div>
          <div className="flex items-center gap-2.5 text-[#FAFAFA]">
            <Lock className="w-4 h-4 text-[#F59E0B] shrink-0" />
            <span><strong>Instant Disconnect:</strong> Single-click camera shutdown anytime.</span>
          </div>
        </div>

        {/* Remember choice toggle */}
        <div className="flex items-center gap-2.5 mb-5">
          <input
            type="checkbox"
            id="remember-permission"
            checked={remember}
            onChange={(e) => setRemember(e.target.checked)}
            className="w-4 h-4 rounded border-slate-700 bg-[#121212] text-[#DC2626] focus:ring-[#DC2626] cursor-pointer"
          />
          <label htmlFor="remember-permission" className="text-xs text-[#9CA3AF] cursor-pointer select-none">
            Remember consent for this session
          </label>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          <button
            onClick={() => onGrant(remember)}
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold text-[#FAFAFA] bg-[#DC2626] hover:bg-[#EF4444] active:bg-[#B91C1C] rounded-xl shadow-lg shadow-[#DC2626]/25 transition-all cursor-pointer"
          >
            <span>Grant &amp; Open Camera</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => {
              onDeny();
              onSelectUploadAlternative();
            }}
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 text-xs font-medium text-[#FECDD3] bg-[#2D0A0A] hover:bg-[#3B0000] border border-[#6B0000] rounded-xl transition-all cursor-pointer whitespace-nowrap"
          >
            <UploadCloud className="w-4 h-4 text-[#DC2626]" />
            <span>Upload Instead</span>
          </button>
        </div>
      </div>
    </div>
  );
};
