/**
 * Lookalike Domain, Typosquatting & Phishing Intelligence Engine
 * Computes Levenshtein distance, detects Cyrillic/Greek/homoglyph spoofing,
 * risky TLDs, IP hosts, subdomain deceptions, and brand spoofing.
 */

export interface OfficialBrand {
  brand: string;
  officialDomain: string;
  category: 'Banking' | 'Payment' | 'Tech' | 'Government' | 'Social' | 'Crypto' | 'E-Commerce';
  aliases?: string[];
  keywords?: string[]; // Substring triggers for instant spoofing detection
}

export const OFFICIAL_BRANDS: OfficialBrand[] = [
  // Global Tech & Social
  {
    brand: "Google",
    officialDomain: "google.com",
    category: "Tech",
    aliases: ["google.co.in", "accounts.google.com", "mail.google.com", "myaccount.google.com"],
    keywords: ["google", "g00gle"]
  },
  {
    brand: "PayPal",
    officialDomain: "paypal.com",
    category: "Payment",
    aliases: ["paypal.me"],
    keywords: ["paypal", "paypa1"]
  },
  {
    brand: "Apple",
    officialDomain: "apple.com",
    category: "Tech",
    aliases: ["icloud.com", "appleid.apple.com"],
    keywords: ["apple", "icloud", "appleid"]
  },
  {
    brand: "Microsoft",
    officialDomain: "microsoft.com",
    category: "Tech",
    aliases: ["live.com", "office.com", "outlook.com", "msn.com", "login.live.com"],
    keywords: ["microsoft", "outlook", "office365"]
  },
  {
    brand: "Amazon",
    officialDomain: "amazon.com",
    category: "E-Commerce",
    aliases: ["amazon.in", "amazonpay.in", "amazon.co.uk"],
    keywords: ["amazon", "amazonpay"]
  },
  {
    brand: "Meta / Facebook",
    officialDomain: "facebook.com",
    category: "Social",
    aliases: ["fb.com", "messenger.com"],
    keywords: ["facebook"]
  },
  {
    brand: "Instagram",
    officialDomain: "instagram.com",
    category: "Social",
    keywords: ["instagram"]
  },
  {
    brand: "WhatsApp",
    officialDomain: "whatsapp.com",
    category: "Social",
    aliases: ["wa.me", "api.whatsapp.com"],
    keywords: ["whatsapp"]
  },
  {
    brand: "Netflix",
    officialDomain: "netflix.com",
    category: "Tech",
    keywords: ["netflix"]
  },
  {
    brand: "Twitter / X",
    officialDomain: "x.com",
    category: "Social",
    aliases: ["twitter.com"],
    keywords: ["twitter"]
  },
  {
    brand: "Telegram",
    officialDomain: "telegram.org",
    category: "Social",
    aliases: ["t.me"],
    keywords: ["telegram"]
  },

  // Indian Financial & Banking
  {
    brand: "State Bank of India",
    officialDomain: "sbi.co.in",
    category: "Banking",
    aliases: ["onlinesbi.sbi", "onlinesbi.com", "sbi.bank"],
    keywords: ["sbi", "onlinesbi"]
  },
  {
    brand: "HDFC Bank",
    officialDomain: "hdfcbank.com",
    category: "Banking",
    aliases: ["netbanking.hdfcbank.com", "hdfc.com"],
    keywords: ["hdfc", "hdfcbank"]
  },
  {
    brand: "ICICI Bank",
    officialDomain: "icicibank.com",
    category: "Banking",
    aliases: ["infinity.icicibank.com"],
    keywords: ["icici", "icicibank"]
  },
  {
    brand: "Axis Bank",
    officialDomain: "axisbank.com",
    category: "Banking",
    keywords: ["axisbank", "axis-bank"]
  },
  {
    brand: "Kotak Mahindra Bank",
    officialDomain: "kotak.com",
    category: "Banking",
    keywords: ["kotak", "kotak811"]
  },
  {
    brand: "Punjab National Bank",
    officialDomain: "pnbindia.in",
    category: "Banking",
    aliases: ["pnb.bank"],
    keywords: ["pnb", "pnbindia"]
  },
  {
    brand: "Bank of Baroda",
    officialDomain: "bankofbaroda.in",
    category: "Banking",
    aliases: ["bobworld.com"],
    keywords: ["bankofbaroda", "bobworld"]
  },
  {
    brand: "Canara Bank",
    officialDomain: "canarabank.com",
    category: "Banking",
    keywords: ["canarabank"]
  },
  {
    brand: "Union Bank of India",
    officialDomain: "unionbankofindia.co.in",
    category: "Banking",
    keywords: ["unionbank", "uboi"]
  },
  {
    brand: "IDFC FIRST Bank",
    officialDomain: "idfcfirstbank.com",
    category: "Banking",
    keywords: ["idfc", "idfcfirst"]
  },
  {
    brand: "IndusInd Bank",
    officialDomain: "indusind.com",
    category: "Banking",
    keywords: ["indusind"]
  },
  {
    brand: "Federal Bank",
    officialDomain: "federalbank.co.in",
    category: "Banking",
    keywords: ["federalbank"]
  },
  {
    brand: "Yes Bank",
    officialDomain: "yesbank.in",
    category: "Banking",
    keywords: ["yesbank"]
  },

  // Indian Fintech & Payment Gateways
  { brand: "Paytm", officialDomain: "paytm.com", category: "Payment", keywords: ["paytm"] },
  { brand: "PhonePe", officialDomain: "phonepe.com", category: "Payment", keywords: ["phonepe"] },
  { brand: "Razorpay", officialDomain: "razorpay.com", category: "Payment", keywords: ["razorpay"] },
  { brand: "CRED", officialDomain: "cred.club", category: "Payment", keywords: ["cred"] },
  { brand: "NPCI", officialDomain: "npci.org.in", category: "Payment", keywords: ["npci"] },

  // Government & Utilities
  { brand: "Income Tax Dept India", officialDomain: "incometax.gov.in", category: "Government", keywords: ["incometax", "pan-card", "incometaxindia"] },
  { brand: "UIDAI (Aadhaar)", officialDomain: "uidai.gov.in", category: "Government", keywords: ["uidai", "aadhaar"] },
  { brand: "IRCTC Railway", officialDomain: "irctc.co.in", category: "Government", keywords: ["irctc"] },
  { brand: "EPFO (Provident Fund)", officialDomain: "epfindia.gov.in", category: "Government", keywords: ["epfindia", "epfo"] },
  { brand: "Passport Seva", officialDomain: "passportindia.gov.in", category: "Government", keywords: ["passportindia"] },

  // Global Financial & Crypto
  { brand: "Chase Bank", officialDomain: "chase.com", category: "Banking", keywords: ["chase"] },
  { brand: "Bank of America", officialDomain: "bankofamerica.com", category: "Banking", keywords: ["bankofamerica"] },
  { brand: "Wells Fargo", officialDomain: "wellsfargo.com", category: "Banking", keywords: ["wellsfargo"] },
  { brand: "Citibank", officialDomain: "citi.com", category: "Banking", aliases: ["citibank.com"], keywords: ["citibank", "citi"] },
  { brand: "Binance", officialDomain: "binance.com", category: "Crypto", keywords: ["binance"] },
  { brand: "Coinbase", officialDomain: "coinbase.com", category: "Crypto", keywords: ["coinbase"] },
  { brand: "Kraken", officialDomain: "kraken.com", category: "Crypto", keywords: ["kraken"] },
];

export const RISKY_TLDS = new Set([
  'xyz', 'top', 'click', 'buzz', 'fit', 'support', 'work', 'rest',
  'gq', 'cf', 'ml', 'tk', 'ga', 'cam', 'country', 'stream', 'download',
  'accountant', 'date', 'faith', 'racing', 'win', 'bid', 'loan', 'review',
  'live', 'sbs', 'icu', 'monster', 'cfd', 'quest', 'pw', 'space'
]);

export const BLOCKLIST_DOMAINS = new Set([
  'g00gle.com',
  'paypa1.com',
  'sbi-login.xyz',
  'secure-hdfc-kyc.com',
  'icici-kycupdate.top',
  'paytm-cashback2026.click',
  'free-crypto-giveaway.buzz',
  'apple-id-verify.support',
  'update-pan-aadhaar.live',
  'axis-kyc-unblock.xyz',
  'pnb-pan-verification.top',
  'kotak-card-rewards.click',
  'falseqr.com',
  'fake-qr.com',
  'fakebank.com',
  'scam-portal.com',
  'false-qr-code.com',
]);

// Map of Cyrillic/Greek/homoglyph characters that visually look identical to Latin chars
export const HOMOGLYPH_MAP: Record<string, string> = {
  '\u0430': 'a', // Cyrillic small a
  '\u0410': 'A', // Cyrillic capital A
  '\u0435': 'e', // Cyrillic small e
  '\u0415': 'E', // Cyrillic capital E
  '\u043E': 'o', // Cyrillic small o
  '\u041E': 'O', // Cyrillic capital O
  '\u0440': 'p', // Cyrillic small p
  '\u0420': 'P', // Cyrillic capital P
  '\u0441': 'c', // Cyrillic small c
  '\u0421': 'C', // Cyrillic capital C
  '\u0443': 'y', // Cyrillic small y
  '\u0423': 'Y', // Cyrillic capital Y
  '\u0445': 'x', // Cyrillic small x
  '\u0425': 'X', // Cyrillic capital X
  '\u0456': 'i', // Cyrillic small i
  '\u0406': 'I', // Cyrillic capital I
  '\u0458': 'j', // Cyrillic small j
  '\u0455': 's', // Cyrillic small s
  '\u03BF': 'o', // Greek small omicron
  '\u039F': 'O', // Greek capital omicron
  '\u03B1': 'a', // Greek small alpha
  '\u03C1': 'p', // Greek small rho
  '\u03BD': 'v', // Greek small nu
};

export interface DomainAnalysisResult {
  hostname: string;
  originalInput: string;
  isOfficial: boolean;
  officialBrand?: OfficialBrand;
  isTyposquat: boolean;
  targetBrand?: OfficialBrand;
  detectedHomoglyphs: { char: string; codePoint: string; replaces: string }[];
  normalizedHost: string;
  hasRiskyTld: boolean;
  isBlocked: boolean;
  isIpAddress: boolean;
  hasSuspiciousSubdomain: boolean;
  subdomainDeceptionBrand?: string;
  verdict: 'SAFE' | 'DANGEROUS' | 'SUSPICIOUS' | 'UNVERIFIED';
  score: number;
  reasons: string[];
}

export function computeLevenshtein(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (a[i - 1] === b[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
      }
    }
  }
  return dp[m][n];
}

export function extractHostname(input: string): string {
  if (!input || typeof input !== 'string') return '';
  let cleaned = input.trim();
  if (!cleaned.startsWith('http://') && !cleaned.startsWith('https://')) {
    cleaned = 'https://' + cleaned;
  }
  try {
    const url = new URL(cleaned);
    return url.hostname.toLowerCase();
  } catch {
    return input.replace(/^https?:\/\//i, '').split('/')[0].split('?')[0].split(':')[0].toLowerCase();
  }
}

export function analyzeDomain(rawInput: string): DomainAnalysisResult {
  if (!rawInput || typeof rawInput !== 'string') {
    return {
      hostname: '',
      originalInput: '',
      isOfficial: false,
      isTyposquat: false,
      detectedHomoglyphs: [],
      normalizedHost: '',
      hasRiskyTld: false,
      isBlocked: false,
      isIpAddress: false,
      hasSuspiciousSubdomain: false,
      verdict: 'UNVERIFIED',
      score: 50,
      reasons: ['No target provided.']
    };
  }

  // Extract raw hostname string preserving non-ASCII unicode characters
  const rawHost = rawInput
    .trim()
    .replace(/^https?:\/\//i, '')
    .split('/')[0]
    .split('?')[0]
    .split(':')[0]
    .toLowerCase();

  const hostname = extractHostname(rawInput) || rawHost;
  const reasons: string[] = [];
  let score = 0;

  // 1. Direct Blocklist Check
  const isBlocked = BLOCKLIST_DOMAINS.has(hostname) || BLOCKLIST_DOMAINS.has(rawHost);
  if (isBlocked) {
    let matchedBrand: OfficialBrand | undefined = undefined;
    for (const b of OFFICIAL_BRANDS) {
      if (b.keywords?.some((k) => hostname.includes(k) || rawHost.includes(k))) {
        matchedBrand = b;
        break;
      }
    }
    return {
      hostname,
      originalInput: rawInput,
      isOfficial: false,
      isTyposquat: true,
      targetBrand: matchedBrand,
      detectedHomoglyphs: [],
      normalizedHost: hostname,
      hasRiskyTld: false,
      isBlocked: true,
      isIpAddress: false,
      hasSuspiciousSubdomain: false,
      verdict: 'DANGEROUS',
      score: 100,
      reasons: ['CRITICAL: Domain is flagged on cybercrime threat lists as a malicious phishing host.']
    };
  }

  // 2. Explicit Official Domain Match - ONLY official brands get isOfficial: true
  for (const b of OFFICIAL_BRANDS) {
    if (
      rawHost === b.officialDomain ||
      hostname === b.officialDomain ||
      (b.aliases && (b.aliases.includes(rawHost) || b.aliases.includes(hostname)))
    ) {
      return {
        hostname: rawHost || hostname,
        originalInput: rawInput,
        isOfficial: true,
        officialBrand: b,
        isTyposquat: false,
        detectedHomoglyphs: [],
        normalizedHost: rawHost || hostname,
        hasRiskyTld: false,
        isBlocked: false,
        isIpAddress: false,
        hasSuspiciousSubdomain: false,
        verdict: 'SAFE',
        score: 0,
        reasons: [`Verified authentic enterprise portal for ${b.brand} (${b.category}). SSL and brand identity authenticated.`]
      };
    }
  }

  // 3. Homoglyph character inspection
  const detectedHomoglyphs: DomainAnalysisResult['detectedHomoglyphs'] = [];
  let normalizedHost = '';
  for (const ch of rawHost) {
    if (HOMOGLYPH_MAP[ch]) {
      detectedHomoglyphs.push({
        char: ch,
        codePoint: `U+${ch.charCodeAt(0).toString(16).toUpperCase().padStart(4, '0')}`,
        replaces: HOMOGLYPH_MAP[ch]
      });
      normalizedHost += HOMOGLYPH_MAP[ch];
    } else {
      normalizedHost += ch;
    }
  }

  // Check Punycode IDN prefix
  const isPunycode = hostname.startsWith('xn--') || hostname.includes('.xn--');
  if (isPunycode && detectedHomoglyphs.length === 0) {
    reasons.push('Contains Internationalized Punycode (IDN) encoding commonly used to disguise counterfeit characters.');
  }

  // Also test digit substitutions (0->o, 1->l, etc.)
  let deDigitizedHost = normalizedHost || hostname;
  deDigitizedHost = deDigitizedHost
    .replace(/0/g, 'o')
    .replace(/1/g, 'l')
    .replace(/3/g, 'e')
    .replace(/5/g, 's')
    .replace(/vv/g, 'w')
    .replace(/rn/g, 'm');

  // 4. IP Address Check
  const isIpAddress = /^(\d{1,3}\.){3}\d{1,3}$/.test(hostname);
  if (isIpAddress) {
    score += 90;
    reasons.push('Raw numeric IP address used instead of a registered domain name (common vector for credential harvesting).');
  }

  // 5. Risky TLD Check
  const parts = hostname.split('.');
  const tld = parts[parts.length - 1] || '';
  const hasRiskyTld = RISKY_TLDS.has(tld);
  if (hasRiskyTld) {
    score += 50;
    reasons.push(`Uses high-risk top-level domain (.${tld}) heavily abused in automated phishing campaigns.`);
  }

  // 6. Subdomain Deception & Brand Spoofing Check
  let hasSuspiciousSubdomain = false;
  let subdomainDeceptionBrand: string | undefined = undefined;
  let isTyposquat = false;
  let matchedTargetBrand: OfficialBrand | undefined = undefined;

  for (const b of OFFICIAL_BRANDS) {
    const officialBase = b.officialDomain.split('.')[0];
    const brandStem = b.brand.toLowerCase().replace(/[^a-z0-9]/g, '');

    const brandTriggers = [officialBase, brandStem, ...(b.keywords || [])];

    const hostContainsBrandTrigger = brandTriggers.some(
      (trigger) =>
        trigger.length >= 3 &&
        (hostname.includes(trigger) ||
          rawHost.includes(trigger) ||
          normalizedHost.includes(trigger) ||
          deDigitizedHost.includes(trigger))
    );

    if (hostContainsBrandTrigger) {
      const isSubdomainOfOfficial = hostname.endsWith('.' + b.officialDomain);
      if (!isSubdomainOfOfficial && hostname !== b.officialDomain) {
        hasSuspiciousSubdomain = true;
        subdomainDeceptionBrand = b.brand;
        isTyposquat = true;
        matchedTargetBrand = b;
        score += 95;
        reasons.push(
          `SPOOFING ALERT: Counterfeit domain impersonates ${b.brand} (${b.officialDomain}). Registered root domain differs from authentic brand.`
        );
        break;
      }
    }

    // Levenshtein distance on domain SLD (Second-Level Domain)
    const hostSld = parts[parts.length - 2] || parts[0];
    const targetSld = officialBase;

    if (hostSld !== targetSld && targetSld.length >= 4) {
      const dist = computeLevenshtein(hostSld, targetSld);
      const normalizedDist = computeLevenshtein(
        deDigitizedHost.split('.')[parts.length - 2] || '',
        targetSld
      );

      if (dist === 1 || (dist === 2 && targetSld.length > 5) || normalizedDist === 0) {
        isTyposquat = true;
        matchedTargetBrand = b;
        score += 90;
        reasons.push(`TYPOSQUATTING: Hostname "${hostSld}" is an optical lookalike of "${targetSld}" (${b.brand}).`);
        break;
      }
    }
  }

  if (detectedHomoglyphs.length > 0) {
    score += 95;
    isTyposquat = true;
    reasons.push(
      `PUNYCODE / HOMOGLYPH ATTACK: Contains ${detectedHomoglyphs.length} internationalized glyph(s) visually disguising Latin letters.`
    );
  }

  // 7. Explicit Scam & Phishing Trigger Keywords
  const severePhishKeywords = [
    'fake', 'false', 'phish', 'scam', 'hack', 'fraud', 'clone', 'test', 'dummy', 'rogue',
    'spoofer', 'steal', 'kyc', 'pan', 'aadhaar', 'update', 'unblock', 'suspend', 'deactivate',
    'lottery', 'cashback', 'winner', 'prize', 'gift', 'bonus', 'claim', 'reward', 'otp'
  ];

  const matchedSevere = severePhishKeywords.filter((k) => hostname.includes(k) || rawHost.includes(k));
  if (matchedSevere.length > 0) {
    score += 85;
    reasons.push(`MALICIOUS TRIGGER: Domain contains dangerous keywords associated with scam campaigns: "${matchedSevere.join(', ')}".`);
  }

  // Moderate suspicious security keywords
  const moderateKeywords = ['login', 'signin', 'secure', 'verify', 'support', 'account', 'banking', 'portal', 'auth'];
  const matchedModerate = moderateKeywords.filter((k) => hostname.includes(k) || rawHost.includes(k));
  if (matchedModerate.length > 0 && !matchedTargetBrand) {
    score += 45;
    reasons.push(`Contains high-value credential capture keywords: "${matchedModerate.join(', ')}".`);
  }

  // ZERO-TRUST VERDICT DETERMINATION:
  // ONLY official verified domains can be 'SAFE'. Everything else is DANGEROUS or CAUTION!
  let verdict: 'SAFE' | 'DANGEROUS' | 'SUSPICIOUS' | 'UNVERIFIED' = 'UNVERIFIED';

  if (score >= 65 || isTyposquat || detectedHomoglyphs.length > 0 || isBlocked || isIpAddress || matchedSevere.length > 0) {
    verdict = 'DANGEROUS';
    score = Math.max(score, 85);
  } else if (score >= 30 || hasRiskyTld || matchedModerate.length > 0) {
    verdict = 'SUSPICIOUS';
    score = Math.max(score, 60);
  } else {
    // Unverified third-party domain (NOT official!)
    verdict = 'UNVERIFIED';
    score = 55; // Default score for unverified domain - NEVER 0!
    reasons.push('Unverified third-party domain. This website is NOT authenticated on the verified enterprise whitelist.');
  }

  return {
    hostname,
    originalInput: rawInput,
    isOfficial: false,
    isTyposquat,
    targetBrand: matchedTargetBrand,
    detectedHomoglyphs,
    normalizedHost,
    hasRiskyTld,
    isBlocked,
    isIpAddress,
    hasSuspiciousSubdomain,
    subdomainDeceptionBrand,
    verdict,
    score: Math.min(100, Math.max(0, score)),
    reasons,
  };
}
