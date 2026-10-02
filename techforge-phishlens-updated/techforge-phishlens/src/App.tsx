/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import {
  Menu,
  Globe,
  CreditCard,
  FileText,
  Camera,
  Upload,
  Languages,
  Sparkles,
  Shield,
  Loader2,
  ChevronDown,
  X,
} from 'lucide-react';
import { analyzeTargetDeep, AnalyzeOptions, ThreatAnalysisResult } from './lib/engine.ts';
import { TRANSLATIONS, LANGUAGE_OPTIONS, LanguageCode } from './lib/translations.ts';
import { QrCameraScanner } from './components/QrCameraScanner.tsx';
import { ImageQrUploader } from './components/ImageQrUploader.tsx';
import { ResultModal } from './components/ResultModal.tsx';
import { HistoryGuidelinesSidebar } from './components/HistoryGuidelinesSidebar.tsx';
import { PhishLensLogo } from './components/PhishLensLogo.tsx';
import { AsciiSquaresHover } from './components/AsciiSquaresHover.tsx';

type NavTab = 'link' | 'upi' | 'kyc' | 'scan-qr' | 'upload';

export default function App() {
  const [activeTab, setActiveTab] = useState<NavTab>('link');
  const [urlInput, setUrlInput] = useState<string>('');
  const [scanResult, setScanResult] = useState<ThreatAnalysisResult | null>(null);
  const [isResultModalOpen, setIsResultModalOpen] = useState<boolean>(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [isChecking, setIsChecking] = useState<boolean>(false);
  // Optional UPI shop check: name on the shop board and name shown by the payment app
  const [shopName, setShopName] = useState<string>('');
  const [shownPayee, setShownPayee] = useState<string>('');

  // Navbar behaviour: compact on scroll, scroll-progress bar, sliding active-tab pill
  const [scrolled, setScrolled] = useState<boolean>(false);
  const [scrollProgress, setScrollProgress] = useState<number>(0);
  const navRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const [pill, setPill] = useState<{ left: number; width: number; ready: boolean }>({ left: 0, width: 0, ready: false });
  
  // Persisted language state with 18 languages support
  const [currentLanguage, setCurrentLanguage] = useState<LanguageCode>(() => {
    try {
      const stored = sessionStorage.getItem('phishlens_lang') as LanguageCode;
      if (stored && TRANSLATIONS[stored]) return stored;
    } catch {
      // safe fallback
    }
    return 'en';
  });

  const [showLanguageDropdown, setShowLanguageDropdown] = useState<boolean>(false);

  // Scan History
  const [scanHistory, setScanHistory] = useState<ThreatAnalysisResult[]>(() => {
    try {
      const stored = sessionStorage.getItem('phishlens_audit_history');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setScrolled(y > 8);
      setScrollProgress(max > 0 ? Math.min(1, y / max) : 0);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  const t = TRANSLATIONS[currentLanguage] || TRANSLATIONS.en;

  const navTabs: { id: NavTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'link', label: t.tabs.link, icon: Globe },
    { id: 'upi', label: t.tabs.upi, icon: CreditCard },
    { id: 'kyc', label: t.tabs.kyc, icon: FileText },
    { id: 'scan-qr', label: t.tabs.scanQr, icon: Camera },
    { id: 'upload', label: t.tabs.upload, icon: Upload },
  ];

  // Slide the highlight pill under whichever tab is active (re-measure on language change / resize)
  useLayoutEffect(() => {
    const measure = () => {
      const el = navRefs.current[activeTab];
      if (el) setPill({ left: el.offsetLeft, width: el.offsetWidth, ready: true });
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [activeTab, currentLanguage]);

  const handleLanguageChange = (code: LanguageCode) => {
    setCurrentLanguage(code);
    setShowLanguageDropdown(false);
    try {
      sessionStorage.setItem('phishlens_lang', code);
    } catch {
      // safe
    }
  };

  const handleVerify = async (targetString: string, overrides?: AnalyzeOptions) => {
    if (!targetString.trim()) return;
    setIsChecking(true);
    // Resolves redirects live and scores the FINAL destination (falls back to the instant scan offline).
    const analyzed = await analyzeTargetDeep(
      targetString.trim(),
      overrides ?? { shopName, shownPayeeName: shownPayee },
    );
    setIsChecking(false);
    setScanResult(analyzed);
    setIsResultModalOpen(true);

    // Save to audit history
    setScanHistory((prev) => {
      const updated = [analyzed, ...prev.filter((item) => item.target !== analyzed.target)].slice(0, 20);
      try {
        sessionStorage.setItem('phishlens_audit_history', JSON.stringify(updated));
      } catch {
        // safe
      }
      return updated;
    });
  };

  const handleInputSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleVerify(urlInput);
  };

  const handleScanSuccess = (data: string) => {
    setUrlInput(data);
    handleVerify(data);
  };

  const handleClearHistory = () => {
    setScanHistory([]);
    sessionStorage.removeItem('phishlens_audit_history');
  };

  // Demo scenarios
  const demoScenarios = [
    {
      label: t.demoScenarios.fakeKyc,
      dotColor: 'bg-rose-500',
      value: 'https://secure-hdfc-kyc.com/update-pan',
      tab: 'kyc' as NavTab,
    },
    {
      label: t.demoScenarios.fakeUpi,
      dotColor: 'bg-rose-500',
      value: 'refundhelp@unauthorizedfakebank',
      tab: 'upi' as NavTab,
    },
    {
      label: t.demoScenarios.misspelledGoogle,
      dotColor: 'bg-rose-500',
      value: 'https://g\u043E\u043Egle.com/accounts', // Cyrillic homoglyph (U+043E)
      tab: 'link' as NavTab,
    },
    {
      label: t.demoScenarios.deceptivePaypal,
      dotColor: 'bg-amber-500',
      value: 'https://paypa1.com/verify-account',
      tab: 'link' as NavTab,
    },
    {
      label: t.demoScenarios.collectScamUpi,
      dotColor: 'bg-amber-500',
      value: 'upi://pay?pa=lotterywinner@okhdfcbank&pn=Cashback%20Reward&am=4999&cu=INR&tn=Receive%20Cashback%20Bonus',
      tab: 'upi' as NavTab,
    },
    {
      label: 'Payee ≠ shop name',
      dotColor: 'bg-rose-500',
      value: 'upi://pay?pa=sharmasweets@okicici&pn=Rahul%20Verma&cu=INR',
      tab: 'upi' as NavTab,
      shop: 'Sharma Sweets',
    },
    {
      label: t.demoScenarios.officialSbi,
      dotColor: 'bg-emerald-500',
      value: 'https://sbi.co.in',
      tab: 'link' as NavTab,
    },
    {
      label: t.demoScenarios.verifiedSwiggy,
      dotColor: 'bg-emerald-500',
      value: 'swiggy@icici',
      tab: 'upi' as NavTab,
    },
  ];

  const handleSelectScenario = (scenario: typeof demoScenarios[number]) => {
    const shop = 'shop' in scenario ? (scenario as { shop?: string }).shop || '' : '';
    setActiveTab(scenario.tab);
    setUrlInput(scenario.value);
    setShopName(shop);
    setShownPayee('');
    handleVerify(scenario.value, { shopName: shop });
  };

  // Dynamic tab configurations
  const getTabConfig = () => {
    switch (activeTab) {
      case 'link':
        return {
          title: t.cards.linkTitle,
          badge: t.cards.linkBadge,
          description: t.cards.linkDesc,
          placeholder: t.cards.linkPlaceholder,
          inputLabel: t.cards.inputLabel,
        };
      case 'upi':
        return {
          title: t.cards.upiTitle,
          badge: t.cards.upiBadge,
          description: t.cards.upiDesc,
          placeholder: t.cards.upiPlaceholder,
          inputLabel: t.cards.inputLabel,
        };
      case 'kyc':
        return {
          title: t.cards.kycTitle,
          badge: t.cards.kycBadge,
          description: t.cards.kycDesc,
          placeholder: t.cards.kycPlaceholder,
          inputLabel: t.cards.inputLabel,
        };
      case 'scan-qr':
        return {
          title: t.cards.qrTitle,
          badge: t.cards.qrBadge,
          description: t.cards.qrDesc,
          placeholder: t.cards.qrPlaceholder,
          inputLabel: t.cards.inputLabel,
        };
      case 'upload':
        return {
          title: t.cards.uploadTitle,
          badge: t.cards.uploadBadge,
          description: t.cards.uploadDesc,
          placeholder: t.cards.uploadPlaceholder,
          inputLabel: t.cards.inputLabel,
        };
    }
  };

  const tabConfig = getTabConfig();

  // Optional shop-name check shown on the UPI-related tabs
  const shopCheckPanel = (activeTab === 'upi' || activeTab === 'scan-qr' || activeTab === 'upload') && (
    <div className="mb-5 rounded-2xl border border-dashed border-rose-200 bg-rose-50/40 p-3">
      <span className="text-[11px] font-bold uppercase tracking-wider text-rose-600 block mb-2">
        Shop name check (optional): catch a QR that pays someone else
      </span>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <label className="block">
          <span className="text-[10px] font-semibold text-slate-500 block mb-1">Shop name on the board</span>
          <input
            type="text"
            value={shopName}
            onChange={(e) => setShopName(e.target.value)}
            placeholder="e.g. Sharma Sweets"
            className="w-full text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 bg-white border border-slate-300 rounded-xl px-3 py-2 outline-none focus:border-[#e11d48] focus:ring-2 focus:ring-rose-100"
          />
        </label>
        <label className="block">
          <span className="text-[10px] font-semibold text-slate-500 block mb-1">Name shown in your UPI app (if QR has none)</span>
          <input
            type="text"
            value={shownPayee}
            onChange={(e) => setShownPayee(e.target.value)}
            placeholder="e.g. RAHUL VERMA"
            className="w-full text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 bg-white border border-slate-300 rounded-xl px-3 py-2 outline-none focus:border-[#e11d48] focus:ring-2 focus:ring-rose-100"
          />
        </label>
      </div>
    </div>
  );


  return (
    <div className="relative isolate min-h-screen bg-[#fcf9fa] text-slate-800 flex flex-col font-sans selection:bg-rose-500/20 selection:text-rose-700">
      {/* Hover-reactive ASCII squares (small -> big) in the page body outside the card */}
      <AsciiSquaresHover />

      {/* 1. Responsive Top Navigation Bar */}
      <header className="pl-navbar sticky top-0 z-40 w-full bg-[#0b0f17]/95 backdrop-blur-md text-white shadow-[0_8px_30px_-8px_rgba(225,29,72,0.45)]">
        <div className={`relative z-10 max-w-[1400px] mx-auto px-3 sm:px-6 ${scrolled ? "h-12 sm:h-14" : "h-16 sm:h-18"} transition-[height] duration-300 flex items-center justify-between gap-2 sm:gap-4`}>
          {/* Left Brand Lockup with Custom Magnifying Lens + QR Logo */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 rounded-xl bg-white/5 border border-rose-500/40 hover:bg-rose-500/20 hover:border-rose-400 text-rose-300 transition-colors cursor-pointer"
              aria-label="Open History & Guidelines"
              title="Open History & Guidelines"
            >
              <Menu className="w-5 h-5" />
            </button>

            <a href="/" className="flex items-center gap-2.5 group">
              <span className="relative inline-flex">
                <span aria-hidden="true" className="pl-radar" />
                <span aria-hidden="true" className="pl-radar pl-radar-late" />
                <PhishLensLogo size={scrolled ? 30 : 36} className="relative transition-all duration-300 group-hover:scale-110 group-hover:rotate-6 drop-shadow-[0_0_8px_rgba(244,63,94,0.7)]" />
              </span>
              <div className="flex flex-col">
                <span className="text-base sm:text-lg font-extrabold tracking-tight text-white leading-tight pl-brand-glow">
                  PhishLens
                </span>
                <span className="text-[10px] sm:text-[11px] font-semibold text-rose-400 leading-tight">
                  Fraud Protection &amp; Threat Verification
                </span>
              </div>
            </a>
          </div>

          {/* Center Navigation Bar (Capsule Segmented Bar for desktop) */}
          <nav className="relative hidden lg:flex items-center gap-1 p-1 bg-white/5 border border-white/15 rounded-full backdrop-blur-sm">
            {/* Sliding highlight that glides to the active tab */}
            <span
              aria-hidden="true"
              className="absolute top-1 bottom-1 rounded-full bg-gradient-to-r from-[#e11d48] to-[#f43f5e] shadow-[0_0_18px_rgba(244,63,94,0.8)] transition-[left,width] duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]"
              style={{ left: pill.left, width: pill.width, opacity: pill.ready ? 1 : 0 }}
            />
            {navTabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  ref={(el) => {
                    navRefs.current[tab.id] = el;
                  }}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative z-10 inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-full transition-colors cursor-pointer ${
                    activeTab === tab.id ? 'text-white' : 'text-slate-300 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Controls */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Live engine status */}
            <span
              className={`hidden md:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-bold tracking-wider transition-colors ${
                isChecking
                  ? 'border-amber-400/40 bg-amber-400/10 text-amber-300'
                  : 'border-emerald-400/30 bg-emerald-400/10 text-emerald-300'
              }`}
              title={isChecking ? 'Resolving redirects and checking domain age' : 'Zero-trust engine online'}
            >
              <span className={`pl-live-dot ${isChecking ? 'pl-live-dot-busy' : ''}`} />
              {isChecking ? 'SCANNING…' : 'ZERO-TRUST LIVE'}
            </span>

            {/* Language Selector Dropdown (18 Languages) */}
            <div className="relative">
              <button
                onClick={() => setShowLanguageDropdown(!showLanguageDropdown)}
                className="inline-flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-semibold text-slate-200 hover:text-white bg-white/5 hover:bg-white/10 border border-white/20 rounded-full transition-all cursor-pointer"
                title="Select Multi-Lingual Interface Language"
              >
                <Languages className="w-3.5 h-3.5 text-rose-400" />
                <span className="max-w-[70px] sm:max-w-none truncate">{LANGUAGE_OPTIONS.find((l) => l.code === currentLanguage)?.native || 'English'}</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {showLanguageDropdown && (
                <div className="absolute right-0 mt-1.5 w-52 max-h-80 overflow-y-auto bg-white border border-slate-200 rounded-2xl shadow-xl py-1 z-50 text-xs">
                  <div className="px-3.5 py-1.5 text-[10px] font-bold uppercase text-slate-400 border-b border-slate-100">
                    Select Language ({LANGUAGE_OPTIONS.length})
                  </div>
                  {LANGUAGE_OPTIONS.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => handleLanguageChange(lang.code)}
                      className={`w-full text-left px-3.5 py-2 flex items-center justify-between transition-colors cursor-pointer ${
                        currentLanguage === lang.code
                          ? 'bg-rose-50 text-[#e11d48] font-bold'
                          : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span>{lang.flag}</span>
                        <span>{lang.native}</span>
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">{lang.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Navigation Tabs (Horizontally scrollable) */}
        <div className="relative z-10 lg:hidden flex items-center overflow-x-auto px-3 py-2 border-t border-white/10 gap-1.5 scrollbar-none touch-pan-x">
          {navTabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-full whitespace-nowrap transition-colors shrink-0 ${
                  activeTab === tab.id
                    ? 'bg-[#e11d48] text-white font-semibold shadow-[0_0_12px_rgba(244,63,94,0.7)]'
                    : 'bg-white/5 text-slate-300 border border-white/15'
                }`}
              >
                <Icon className="w-3 h-3" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      {/* Navbar speciality: animated gradient edge + travelling scan light */}
        <div aria-hidden="true" className="pl-navbar-edge" />
        <div
          aria-hidden="true"
          className="pl-navbar-progress"
          style={{ width: `${scrollProgress * 100}%` }}
        />
        <div aria-hidden="true" className="pl-navbar-scan" />
      </header>

      {/* 2. Main Content Area */}
      <main className="relative z-10 flex-1 max-w-5xl w-full mx-auto px-3 sm:px-6 py-6 sm:py-8 space-y-6">
        {/* Main Central Card */}
        <div data-ascii-exclude className="bg-white border-2 border-slate-900 rounded-[28px] p-5 sm:p-8 shadow-sm relative transition-all">
          {/* Consistent Unified Header for ALL tabs */}
          <div className="flex items-center justify-between gap-3 mb-2 flex-wrap">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#e11d48]" />
              <h2 className="bg-rose-100/70 text-[#be123c] font-black text-xl sm:text-2xl px-2.5 py-0.5 rounded-lg inline-block tracking-tight">
                {tabConfig.title}
              </h2>
            </div>
            <span className="bg-rose-50 border border-rose-200 text-[#e11d48] text-xs font-bold px-3 py-0.5 rounded-full uppercase tracking-wider">
              {tabConfig.badge}
            </span>
          </div>

          {/* Subtitle */}
          <p className="text-slate-600 text-xs sm:text-sm mb-5">
            {tabConfig.description}
          </p>

          {/* Active Tab Interactive Area */}
          {activeTab === 'scan-qr' ? (
            <div className="mb-5">
              <QrCameraScanner
                onScanSuccess={handleScanSuccess}
                onSwitchToUpload={() => setActiveTab('upload')}
              />
            </div>
          ) : activeTab === 'upload' ? (
            <div className="mb-5">
              <ImageQrUploader onScanSuccess={handleScanSuccess} />
            </div>
          ) : (
            /* Dynamic Target Input Form */
            <form onSubmit={handleInputSubmit} className="mb-5">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                {tabConfig.inputLabel}
              </label>

              <div className="rounded-2xl border-2 border-slate-300 bg-white p-2 pl-3 sm:pl-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 shadow-2xs focus-within:border-[#e11d48] focus-within:ring-3 focus-within:ring-rose-100 transition-all">
                <input
                  type="text"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder={tabConfig.placeholder}
                  className="font-mono text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 bg-transparent flex-1 outline-none py-1.5"
                />

                <div className="flex items-center gap-1.5 shrink-0">
                  {urlInput && (
                    <button
                      type="button"
                      onClick={() => setUrlInput('')}
                      className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                      title={t.actions.clear}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}

                  <button
                    type="submit"
                    disabled={isChecking}
                    className="w-full sm:w-auto disabled:opacity-70 disabled:cursor-wait bg-[#e11d48] hover:bg-[#be123c] active:bg-[#9f1239] text-white font-bold text-xs sm:text-sm px-5 sm:px-6 py-2.5 rounded-xl flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer whitespace-nowrap"
                  >
                    {isChecking ? <Loader2 className="w-4 h-4 animate-spin" /> : <Shield className="w-4 h-4" />}
                    <span>{isChecking ? 'Checking destination…' : t.actions.verifyTarget}</span>
                  </button>
                </div>
              </div>
            </form>
          )}

          {shopCheckPanel}

          {/* Interactive Demo Scenarios & Quick Presets */}
          <div className="border-t border-slate-100 pt-4">
            <span className="text-rose-600 text-[11px] font-bold tracking-wider uppercase mb-2.5 block">
              {t.demoHeader}
            </span>

            <div className="flex flex-wrap items-center gap-2">
              {demoScenarios.map((scenario, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelectScenario(scenario)}
                  className="border border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 rounded-full px-3 py-1.5 text-xs font-medium text-slate-800 flex items-center gap-2 transition-all shadow-2xs cursor-pointer group"
                >
                  <span className={`w-2 h-2 rounded-full ${scenario.dotColor} shrink-0`} />
                  <span className="group-hover:text-rose-600 transition-colors">
                    {scenario.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* 3. Result Popup Modal */}
      <ResultModal
        result={scanResult}
        isOpen={isResultModalOpen}
        onClose={() => setIsResultModalOpen(false)}
        t={t}
      />

      {/* 4. Left History & Guidelines Sidebar */}
      <HistoryGuidelinesSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        history={scanHistory}
        onSelectHistory={(item) => {
          setScanResult(item);
          setIsResultModalOpen(true);
        }}
        onClearHistory={handleClearHistory}
        t={t}
      />

      {/* 5. Footer (copyright only, same pink as the site background) */}
      <footer className="relative z-10 mt-auto border-t border-slate-200 bg-[#fcf9fa] py-5">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center text-[11px] text-slate-400">
          &copy; {new Date().getFullYear()} Generation C. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
