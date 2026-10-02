import React, { useState } from 'react';
import { Search, Building2, Globe, ShieldCheck, Check } from 'lucide-react';
import { NPCI_HANDLES } from '../lib/upi.ts';
import { OFFICIAL_BRANDS } from '../lib/domain.ts';

export const DirectoryExplorer: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'upi' | 'domains'>('upi');
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    setTimeout(() => setCopiedText(null), 1500);
  };

  const handleList = Object.values(NPCI_HANDLES).filter((item) => {
    const q = searchQuery.toLowerCase();
    return (
      item.handle.toLowerCase().includes(q) ||
      item.name.toLowerCase().includes(q) ||
      item.bank.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q)
    );
  });

  const domainList = OFFICIAL_BRANDS.filter((item) => {
    const q = searchQuery.toLowerCase();
    return (
      item.brand.toLowerCase().includes(q) ||
      item.officialDomain.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q) ||
      (item.aliases && item.aliases.some((a) => a.toLowerCase().includes(q)))
    );
  });

  return (
    <div className="w-full bg-[#18181B] border border-[#3B0000] rounded-2xl p-6 sm:p-7 shadow-xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
        <div>
          <h3 className="text-base font-bold text-[#FAFAFA] flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#DC2626]" />
            <span>Authorized Security Directories</span>
          </h3>
          <p className="text-xs text-[#9CA3AF] mt-0.5">
            Indexed NPCI UPI Handles (60+) &amp; Protected Financial Brand Domains
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-1 p-1 bg-[#121212] border border-[#2D0A0A] rounded-xl">
          <button
            onClick={() => setActiveTab('upi')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              activeTab === 'upi' ? 'bg-[#DC2626] text-white shadow-xs' : 'text-[#FECDD3] hover:text-white'
            }`}
          >
            NPCI UPI Handles ({Object.keys(NPCI_HANDLES).length})
          </button>
          <button
            onClick={() => setActiveTab('domains')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              activeTab === 'domains' ? 'bg-[#DC2626] text-white shadow-xs' : 'text-[#FECDD3] hover:text-white'
            }`}
          >
            Official Brands ({OFFICIAL_BRANDS.length})
          </button>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative mb-4">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={
            activeTab === 'upi'
              ? 'Search by bank name or handle (e.g. oksbi, hdfc, phonepe)...'
              : 'Search by brand or domain (e.g. sbi, google, icici)...'
          }
          className="w-full bg-[#121212] border border-[#2D0A0A] focus:border-[#DC2626] focus:ring-1 focus:ring-[#DC2626] text-slate-200 pl-10 pr-4 py-2.5 rounded-xl text-xs placeholder:text-slate-500 outline-none transition-all"
        />
      </div>

      {/* Listings */}
      {activeTab === 'upi' ? (
        <div className="max-h-80 overflow-y-auto pr-1 space-y-2">
          {handleList.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-500">
              No matching authorized handle found. Any handle not indexed here is flagged as unverified.
            </div>
          ) : (
            handleList.map((item) => (
              <div
                key={item.handle}
                onClick={() => handleCopy(`@${item.handle}`)}
                className="flex items-center justify-between p-3 bg-[#121212] hover:bg-[#2D0A0A] border border-[#2D0A0A] hover:border-[#DC2626] rounded-xl transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-[#2D0A0A] border border-[#6B0000] flex items-center justify-center text-[#DC2626] shrink-0">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-[#FECDD3]">
                        @{item.handle}
                      </span>
                      <span className="text-[10px] text-slate-400 px-1.5 py-0.5 rounded bg-[#18181B] border border-[#2D0A0A]">
                        {item.category}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 truncate mt-0.5">
                      {item.name} &middot; <span className="text-slate-300">{item.bank}</span>
                    </p>
                  </div>
                </div>

                <div className="text-slate-500 group-hover:text-[#FECDD3] text-xs flex items-center gap-1 shrink-0 ml-3">
                  {copiedText === `@${item.handle}` ? (
                    <span className="text-[#10B981] text-[11px] flex items-center gap-1 font-medium">
                      <Check className="w-3 h-3" /> Copied
                    </span>
                  ) : (
                    <span className="text-[11px] opacity-0 group-hover:opacity-100 transition-opacity">Copy</span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="max-h-80 overflow-y-auto pr-1 space-y-2">
          {domainList.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-500">
              No matching official brand found.
            </div>
          ) : (
            domainList.map((item) => (
              <div
                key={item.officialDomain}
                onClick={() => handleCopy(item.officialDomain)}
                className="flex items-center justify-between p-3 bg-[#121212] hover:bg-[#2D0A0A] border border-[#2D0A0A] hover:border-[#DC2626] rounded-xl transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-[#2D0A0A] border border-[#6B0000] flex items-center justify-center text-[#10B981] shrink-0">
                    <Globe className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-xs text-[#FAFAFA]">
                        {item.brand}
                      </span>
                      <span className="text-[10px] text-slate-400 px-1.5 py-0.5 rounded bg-[#18181B] border border-[#2D0A0A]">
                        {item.category}
                      </span>
                    </div>
                    <p className="font-mono text-xs text-emerald-400 truncate mt-0.5">
                      {item.officialDomain}
                    </p>
                  </div>
                </div>

                <div className="text-slate-500 group-hover:text-[#FECDD3] text-xs flex items-center gap-1 shrink-0 ml-3">
                  {copiedText === item.officialDomain ? (
                    <span className="text-[#10B981] text-[11px] flex items-center gap-1 font-medium">
                      <Check className="w-3 h-3" /> Copied
                    </span>
                  ) : (
                    <span className="text-[11px] opacity-0 group-hover:opacity-100 transition-opacity">Copy</span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
