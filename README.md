# T37-Phishlens

**Project Overview**
•	The problem. A shop QR or a "KYC update" message on WhatsApp gives a user about three seconds to decide. Scammers count on that speed, using fake bank sites, lookalike domains and UPI "receive money" tricks.
•	Our solution. PhishLens is a "look before you tap" shield. It judges the destination, not the disguise, so shortened and redirected links are unwrapped before any decision is made.


**Setup & Installation Instructions**
•	Prerequisites: Node.js 18+ (20 recommended), npm, and a modern browser with camera access.
 Setup & Run Locally

 Prerequisites

- Node.js 20 or newer (includes `npm`) — check with `node -v`
- A modern browser (Chrome, Edge or Firefox)
- Internet access while scanning (used for live redirect resolution and domain-age lookups)

 1. Get the project

```bash
cd techforge-phishlens
```

 2. Install dependencies

```bash
npm install
```

 3. Configure environment (optional)

The scanner runs fully without any API key. If you want to set a custom port or URL, copy the example file:

```bash
# macOS / Linux / Git Bash
cp .env.example .env.local

# Windows (Command Prompt)
copy .env.example .env.local
```

 4. Start the development server

```bash
npm run dev
```

Open http://localhost:3000 in your browser.

 Other scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Starts the dev server on port 3000 |
| `npm run build` | Creates a production build in `dist/` |
| `npm run preview` | Serves the production build locally |
| `npm run lint` | Type-checks the project with TypeScript |

---

 How to Use

1. Check a link — paste a URL on the main card and press Verify. PhishLens follows every redirect and scores the final destination, including domain age, look-alike domains and suspicious TLDs.
2. Scan a QR code — allow camera access and point it at a QR code, or upload a QR image. The decoded link or UPI payment request is analysed before you open anything.
3.Verify a UPI ID / payment QR — enter a UPI ID (e.g. `name@bank`) or scan a UPI QR. The bank handle is validated and the payee name is compared with the shop name.
4. Read the verdict — each scan returns SAFE, SUSPICIOUS or DANGEROUS, with the reasons listed so you know why.
5. Try the samples — use the Quick Test Samples to see how safe and malicious examples are scored.
6. Change language — use the language dropdown in the nav bar to switch the interface.

---

 Troubleshooting

- `npm` is not recognized (Windows) — install Node.js from nodejs.org, then reopen your terminal.
- Port 3000 already in use — stop the other app, or run `npx vite --port=3001`.
- Camera not working — allow camera permission in the browser. Cameras only work on `localhost` or HTTPS.
- Redirect / domain-age checks fail — check your internet connection. The scan falls back to the instant offline analysis.
- Fresh start — delete `node_modules` and `package-lock.json`, then run `npm install` again.


**Key Features**
•	Three ways to check: live camera scan, image upload, or pasted text
•	WhatsApp Share Target: share a suspicious link straight into PhishLens
•	Safe redirect unrolling: up to 5 hops, strict timeouts, shorteners and meta-refresh redirects all followed
•	SSRF protection: DNS is checked first and the validated IP is pinned, so internal addresses can never be reached
•	Lookalike and homoglyph detection: punycode, Cyrillic characters, typos, combosquats and subdomain tricks against Indian brands
•	Newly registered domain detection through RDAP domain age
•	URL structure analysis: @ tricks, IP hosts, hyphen spam, pressure keywords
•	Page-content check: password and OTP fields, and forms that submit to another site
•	Threat feed and scam-wording detection: OpenPhish match and scam phrases in messages
•	UPI guard: payee-name mismatch, personal-looking VPAs on shop QRs, the "receive money" trick, scam words and fake handles
•	Transparent scoring: weighted signals with hard overrides to Danger, and no AI guesswork
•	Safe only with proof: "nothing found" gives Caution, never false comfort
•	Verdicts in multilingual languages.
•	Privacy by design: HMAC-SHA256 hashing, rate limiting, and a "What we stored" panel that proves it.


**Technology Stack**
| Layer | Technology | Role |
| :--- | :--- | :--- |
| **Frontend** | Next.js 15 (App Router), TypeScript, Tailwind CSS | Fast, mobile-first, type-safe interface |
| **QR Scanning** | html5-qrcode, jsQR | Live camera scan and image decoding |
| **PWA** | Service worker, Web Share Target | Installable, accepts links shared from WhatsApp |
| **Languages** | next-intl | English, Hindi and Marathi |
| **Backend** | Next.js Route Handlers (Node runtime), zod | API endpoints with strict validation |
| **Redirects** | undici | Manual redirect-chain following |
| **SSRF Protection** | ipaddr.js, node:dns | Blocks private and internal addresses |
| **Domain Analysis** | tldts, domainToASCII / punycode, RDAP | Parsing, IDN handling, domain age |
| **Lookalike Detection** | fastest-levenshtein, Unicode confusables, Indian brand JSON | Typo, combosquat and homoglyph matching |
| **Page Analysis** | cheerio | Password/OTP fields and off-site forms |
| **Threat Intelligence** | OpenPhish feed | Known phishing match |
| **Privacy** | node:crypto (HMAC-SHA256) | Hashes query values and VPAs |
| **Data and Speed** | Upstash Redis, Postgres with Drizzle ORM | Caching, rate limiting, safe log storage |
| **Quality** | Vitest | 36 passing tests and a benchmark suite |
| **Deployment** | GitHub, Vercel | Version control and hosting |


**Architecture / Workflow**
•	One-line flow
Input → Guard → Normalize → URL path or UPI path → Parallel checks → Weighted scoring → Verdict → HMAC log and display
•	Step by step
•	Input: QR camera scan, image upload, pasted text, or WhatsApp share.
•	Guard: zod validation, rate limiting and cache lookup, so repeat scans return instantly.
•	Normalize: the input becomes either a web link or a upi://pay string, and the pipeline branches.
•	URL path: the Safe Redirect Unroller follows the chain to the final destination. Five checks then run in parallel: lookalike/homoglyph, domain age, URL structure, page content, and the OpenPhish feed.
•	UPI path: the payload is parsed (pa, pn, am, mc). Checks run for payee-name mismatch, personal VPA on a shop QR, the "receive money" trick, and scam words or fake handles.
•	Scoring: weighted signals plus hard overrides to Danger. Safe requires positive proof, and no evidence gives Caution.
•	Verdict: Safe, Caution or Danger with one template sentence in multilingual languages.
•	Log and display: query values and VPAs are HMAC-SHA256 hashed and saved, and the result card shows a "What we stored" panel.
•	Design choice: verdicts come from a rule engine and templates, not an LLM. That makes them fast, repeatable and fully auditable.


**Dataset / API Information**
•	No API keys, paid services or downloadable datasets needed
•	RDAP (free, public): domain age, to flag newly registered domains
•	Live redirect resolution: follows shorteners and hops to the final destination
•	Indian brand and official-domain list (built in, curated): lookalike matching and whitelisting genuine sites
•	Unicode confusables map (built in): homoglyph and punycode detection
•	UPI handle list (built in): validates bank handles and spots fake ones
•	Suspicious TLD and keyword lists (built in): risky endings and pressure words
•	Quick Test Samples (built in): one-tap safe and malicious demos
•	Offline fallback: if the internet or RDAP is down, instant offline analysis still gives a verdict
•	No personal data collected, no account needed


**Screenshots and Demo Video Link**
[Google Drive access](https://drive.google.com/drive/folders/1gRjyUB3CKY9OMj9_7P6wywCC5dF2nBid)


**Limitations & Future Scope**
**Current limitations**
•	Lookalike detection covers the curated list of Indian brands, so a brand outside the list is checked by its other signals instead.
•	Payee-name matching relies on the shop name the user enters.
•	Brand-new scams may not yet appear in public threat feeds, so PhishLens relies on several signals, not one


**Future Scope**
•	Shop-board OCR: snap the shop's name board to auto-match the UPI payee name
•	Certificate-age and popularity checks: use crt.sh and the Tranco list to sharpen trust signals
•	Visual brand check: compare a page's logo and layout with the real bank's page to catch pixel-perfect clones
•	More regional languages: Tamil, Telugu, Bengali, Gujarati and others, with voice readout of the verdict
•	Browser extension and WhatsApp bot: warn users right where scams arrive
•	On-device and offline mode: run core checks on the phone, even with weak internet
•	Community scam reporting: one-tap reports that grow the brand and threat lists for everyone
•	Learn mode: a short tip after each verdict on how to spot that scam next time
•	Family Guard: alert a trusted family member when an elderly relative scans something dangerous
•	API for banks and UPI apps: embed PhishLens as a pre-payment safety check


**Team Name: Generation C                                                                                                      Team Members:
Fiza Bardanwala
Aryan Deshawal
Swara Dongare**

