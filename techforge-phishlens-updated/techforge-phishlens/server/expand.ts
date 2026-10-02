/**
 * Live link intelligence endpoints:
 *   GET /api/expand?url=<http(s) url>   follow redirects, return every hop
 *   GET /api/domain-age?host=<hostname> real registration date via RDAP
 *
 * Redirect expander
 *
 * Browsers cannot follow cross-origin redirects (CORS hides every hop), so the
 * dev/preview server does it. It follows up to MAX_HOPS redirects manually and
 * returns every hop plus the final destination, which the engine then scores.
 *
 * SSRF guard: each hop's host must resolve ONLY to public IPs; private,
 * loopback, link-local and cloud-metadata ranges are refused. Request bodies
 * are never read and no cookies are sent.
 */
import dns from 'node:dns/promises';
import net from 'node:net';
import { domainToASCII, domainToUnicode } from 'node:url';
import type { IncomingMessage, ServerResponse } from 'node:http';
import type { Plugin } from 'vite';

const MAX_HOPS = 8;
const HOP_TIMEOUT_MS = 4000;
const MAX_URL_LENGTH = 2048;

export interface ExpandHop {
  url: string;
  status: number;
}
export interface ExpandResponse {
  hops: ExpandHop[];
  final: string;
  truncated?: boolean;
  error?: string;
}

function isPrivateIp(ip: string): boolean {
  if (net.isIPv4(ip)) {
    const [a, b] = ip.split('.').map(Number);
    return (
      a === 0 ||
      a === 10 ||
      a === 127 ||
      (a === 100 && b >= 64 && b <= 127) ||
      (a === 169 && b === 254) ||
      (a === 172 && b >= 16 && b <= 31) ||
      (a === 192 && b === 168) ||
      a >= 224
    );
  }
  if (net.isIPv6(ip)) {
    const l = ip.toLowerCase();
    if (l === '::' || l === '::1') return true;
    if (l.startsWith('fc') || l.startsWith('fd') || l.startsWith('fe8') || l.startsWith('fe9') || l.startsWith('fea') || l.startsWith('feb')) return true;
    const mapped = l.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/);
    if (mapped) return isPrivateIp(mapped[1]);
    return false;
  }
  return true; // not a valid IP: refuse
}

async function assertPublicHost(hostname: string): Promise<void> {
  const bare = hostname.replace(/^\[|\]$/g, '');
  if (net.isIP(bare)) {
    if (isPrivateIp(bare)) throw new Error('Blocked: private or internal address');
    return;
  }
  if (bare === 'localhost' || bare.endsWith('.localhost') || bare.endsWith('.internal') || bare.endsWith('.local')) {
    throw new Error('Blocked: private or internal host');
  }
  const addrs = await dns.lookup(bare, { all: true });
  if (addrs.length === 0 || addrs.some((a) => isPrivateIp(a.address))) {
    throw new Error('Blocked: host resolves to a private or internal address');
  }
}

/** Show IDN hosts in Unicode so homoglyph checks still see the lookalike characters. */
function displayUrl(u: URL): string {
  const unicodeHost = domainToUnicode(u.hostname) || u.hostname;
  return u.toString().replace(u.hostname, unicodeHost);
}

export async function expandUrl(input: string): Promise<ExpandResponse> {
  const hops: ExpandHop[] = [];
  let current: URL;
  try {
    current = new URL(input);
  } catch {
    return { hops: [], final: input, error: 'Invalid URL' };
  }

  for (let i = 0; i < MAX_HOPS; i++) {
    if (current.protocol !== 'http:' && current.protocol !== 'https:') {
      hops.push({ url: displayUrl(current), status: 0 });
      return { hops, final: displayUrl(current), error: 'Blocked: non-HTTP(S) redirect target' };
    }
    try {
      await assertPublicHost(current.hostname);
    } catch (e) {
      hops.push({ url: displayUrl(current), status: 0 });
      return { hops, final: displayUrl(current), error: (e as Error).message };
    }

    let status = 0;
    let location: string | null = null;
    try {
      const res = await fetch(current, {
        method: 'GET',
        redirect: 'manual',
        signal: AbortSignal.timeout(HOP_TIMEOUT_MS),
        headers: { 'User-Agent': 'PhishLensBot/1.0 (+link safety check)' },
      });
      status = res.status;
      location = res.headers.get('location');
      void res.body?.cancel().catch(() => {});
    } catch (e) {
      hops.push({ url: displayUrl(current), status: 0 });
      return { hops, final: displayUrl(current), error: `Unreachable: ${(e as Error).message}` };
    }

    hops.push({ url: displayUrl(current), status });

    if (status >= 300 && status < 400 && location) {
      try {
        current = new URL(location, current);
        continue;
      } catch {
        return { hops, final: displayUrl(current), error: 'Malformed redirect target' };
      }
    }
    return { hops, final: displayUrl(current) };
  }
  return { hops, final: hops[hops.length - 1].url, truncated: true };
}

// ---------------------------------------------------------------------------
// Domain registration age (RDAP): GET /api/domain-age?host=<hostname>
// ---------------------------------------------------------------------------

export interface DomainAgeResponse {
  host: string;
  domain: string;
  registeredAt?: string;
  ageDays?: number;
  notFound?: boolean;
  error?: string;
}

// Common multi-label public suffixes (no full Public Suffix List needed for this check).
const MULTI_LABEL_SUFFIXES = new Set([
  'co.in', 'org.in', 'net.in', 'gov.in', 'ac.in', 'edu.in', 'res.in', 'nic.in', 'firm.in', 'gen.in', 'ind.in',
  'co.uk', 'org.uk', 'ac.uk', 'gov.uk', 'com.au', 'net.au', 'org.au', 'co.nz', 'co.jp', 'co.za', 'com.br',
  'com.cn', 'com.sg', 'com.my', 'co.id', 'com.pk', 'com.bd', 'com.np', 'co.ke', 'com.ng', 'com.hk', 'com.tr',
]);

export function registrableDomain(host: string): string {
  const labels = host.toLowerCase().replace(/\.$/, '').split('.');
  if (labels.length <= 2) return labels.join('.');
  const lastTwo = labels.slice(-2).join('.');
  return MULTI_LABEL_SUFFIXES.has(lastTwo) ? labels.slice(-3).join('.') : lastTwo;
}

const ageCache = new Map<string, { at: number; value: DomainAgeResponse }>();
const AGE_CACHE_MS = 60 * 60 * 1000;

export async function lookupDomainAge(rawHost: string): Promise<DomainAgeResponse> {
  const host = domainToASCII(rawHost.trim().toLowerCase());
  if (!host || net.isIP(host) || !/^[a-z0-9.-]+$/.test(host) || !host.includes('.')) {
    return { host: rawHost, domain: rawHost, error: 'Not a registrable domain name' };
  }
  const domain = registrableDomain(host);
  const cached = ageCache.get(domain);
  if (cached && Date.now() - cached.at < AGE_CACHE_MS) return { ...cached.value, host };

  let result: DomainAgeResponse;
  try {
    // rdap.org redirects to the authoritative registry's RDAP server for the TLD.
    const res = await fetch(`https://rdap.org/domain/${encodeURIComponent(domain)}`, {
      headers: { Accept: 'application/rdap+json, application/json' },
      redirect: 'follow',
      signal: AbortSignal.timeout(7000),
    });
    if (res.status === 404) {
      result = { host, domain, notFound: true };
    } else if (!res.ok) {
      result = { host, domain, error: `RDAP lookup failed (HTTP ${res.status})` };
    } else {
      const data = (await res.json()) as { events?: { eventAction?: string; eventDate?: string }[] };
      const reg = data.events?.find((e) => /registration/i.test(e.eventAction || ''));
      const when = reg?.eventDate ? new Date(reg.eventDate) : null;
      if (when && !Number.isNaN(when.getTime())) {
        result = {
          host,
          domain,
          registeredAt: when.toISOString(),
          ageDays: Math.max(0, Math.floor((Date.now() - when.getTime()) / 86_400_000)),
        };
      } else {
        result = { host, domain, error: 'Registry did not publish a registration date' };
      }
    }
  } catch (e) {
    result = { host, domain, error: `RDAP unreachable: ${(e as Error).message}` };
  }
  if (!result.error) ageCache.set(domain, { at: Date.now(), value: result });
  return result;
}

function handler(req: IncomingMessage, res: ServerResponse, next: () => void) {
  if (!req.url || !req.url.startsWith('/api/')) return next();
  const send = (code: number, body: unknown) => {
    res.statusCode = code;
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 'no-store');
    res.end(JSON.stringify(body));
  };
  const u = new URL(req.url, 'http://localhost');
  if (u.pathname !== '/api/expand' && u.pathname !== '/api/domain-age') return next();
  if (req.method !== 'GET') return send(405, { error: 'Method not allowed' });

  if (u.pathname === '/api/domain-age') {
    const host = u.searchParams.get('host') || '';
    if (!host || host.length > 253) return send(400, { error: 'Missing or oversized host' });
    return void lookupDomainAge(host).then((r) => send(200, r)).catch(() => send(500, { error: 'Lookup failed' }));
  }

  const target = u.searchParams.get('url') || '';
  if (!target || target.length > MAX_URL_LENGTH) return send(400, { error: 'Missing or oversized url' });
  expandUrl(target).then((r) => send(200, r)).catch(() => send(500, { error: 'Expansion failed' }));
}

export function expandPlugin(): Plugin {
  return {
    name: 'phishlens-expand',
    configureServer(server) {
      server.middlewares.use(handler);
    },
    configurePreviewServer(server) {
      server.middlewares.use(handler);
    },
  };
}
