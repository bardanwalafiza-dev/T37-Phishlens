/**
 * UPI payee-name vs shop-name matching.
 *
 * Fake or swapped QR stickers usually pay a stranger while the board shows a
 * shop's name. If the name a QR carries (or the name your payment app shows
 * before you enter the PIN) has nothing in common with the shop in front of
 * you, the payment is likely going to someone else.
 *
 * Matching is fuzzy: it ignores case, punctuation, accents and generic business
 * words (pvt, ltd, store, mart...) and tolerates small spelling differences.
 * Names written in different scripts (e.g. Devanagari vs Latin) are not
 * transliterated and will not match.
 */

export type PayeeMatchLevel = 'MATCH' | 'PARTIAL' | 'MISMATCH';

export interface PayeeCheckResult {
  shopName: string;
  payeeName: string;
  /** Where the payee name came from. */
  source: 'QR' | 'PAYMENT_APP';
  level: PayeeMatchLevel;
  /** 0-100 similarity between shop and payee name. */
  similarity: number;
}

const STOPWORDS = new Set([
  'pvt', 'ltd', 'private', 'limited', 'llp', 'inc', 'the', 'and', 'of', 'co', 'company', 'corp', 'corporation',
  'store', 'stores', 'shop', 'shops', 'mart', 'enterprises', 'enterprise', 'traders', 'trader', 'trading',
  'india', 'services', 'service', 'mr', 'mrs', 'ms', 'shri', 'sri', 'smt',
]);

export function nameTokens(name: string): string[] {
  const base = name
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  const filtered = base.filter((t) => !STOPWORDS.has(t));
  return filtered.length > 0 ? filtered : base;
}

function levenshtein(a: string, b: string): number {
  const dp: number[] = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    let prev = dp[0];
    dp[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const tmp = dp[j];
      dp[j] = Math.min(dp[j] + 1, dp[j - 1] + 1, prev + (a[i - 1] === b[j - 1] ? 0 : 1));
      prev = tmp;
    }
  }
  return dp[b.length];
}

function tokenSimilarity(a: string, b: string): number {
  if (a === b) return 1;
  const longest = Math.max(a.length, b.length);
  if (longest >= 4 && 1 - levenshtein(a, b) / longest >= 0.75) return 0.8; // typo / spelling variant
  const minLen = Math.min(a.length, b.length);
  if (minLen >= 4 && (a.startsWith(b) || b.startsWith(a))) return 0.7; // sweet / sweets, abbreviations
  return 0;
}

/** Similarity between two names, 0 (nothing in common) to 1 (same name). */
export function nameSimilarity(a: string, b: string): number {
  const ta = nameTokens(a);
  const tb = nameTokens(b);
  if (ta.length === 0 || tb.length === 0) return 0;

  const ca = ta.join('');
  const cb = tb.join('');
  if (ca === cb) return 1;
  // Same words glued together or split differently ("sharmasweets" vs "sharma sweets")
  if (Math.min(ca.length, cb.length) >= 5 && (ca.includes(cb) || cb.includes(ca))) return 0.9;

  const [small, large] = ta.length <= tb.length ? [ta, tb] : [tb, ta];
  const used = new Set<number>();
  let total = 0;
  for (const tok of small) {
    let best = 0;
    let bestIdx = -1;
    large.forEach((other, idx) => {
      if (used.has(idx)) return;
      const s = tokenSimilarity(tok, other);
      if (s > best) {
        best = s;
        bestIdx = idx;
      }
    });
    if (bestIdx >= 0) used.add(bestIdx);
    total += best;
  }
  return (2 * total) / (ta.length + tb.length);
}

export function classifyMatch(similarity: number): PayeeMatchLevel {
  if (similarity >= 0.67) return 'MATCH';
  if (similarity >= 0.34) return 'PARTIAL';
  return 'MISMATCH';
}

/**
 * Compare the shop name against every payee name we have; the best match wins,
 * so a legitimate QR is not flagged just because one source is abbreviated.
 */
export function checkPayeeAgainstShop(
  shopName: string,
  payeeNames: { name?: string; source: 'QR' | 'PAYMENT_APP' }[],
): PayeeCheckResult | null {
  const shop = shopName.trim();
  const candidates = payeeNames.filter((p) => p.name && p.name.trim());
  if (!shop || candidates.length === 0) return null;

  let best: PayeeCheckResult | null = null;
  for (const c of candidates) {
    const sim = nameSimilarity(shop, c.name!);
    if (!best || sim * 100 > best.similarity) {
      best = {
        shopName: shop,
        payeeName: c.name!.trim(),
        source: c.source,
        level: classifyMatch(sim),
        similarity: Math.round(sim * 100),
      };
    }
  }
  return best;
}
