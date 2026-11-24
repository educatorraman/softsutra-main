# SoftSutra Hub — Final Protocol & Core Web Vitals Report

Scope: `projects/SoftSutra.online` (Vite 8 portal, version 4.0.0). All checks run locally on Termux. No git operations were performed.

## 1. Verification results

| Gate | Command | Result |
| --- | --- | --- |
| Dependencies | `npm install --no-audit --no-fund` | Pass (plus `@biomejs/biome` 2.6.8, `@types/node`) |
| Type check | `tsc --noEmit` | Pass, strict mode |
| Lint | `npm run lint` → `biome check src` | Pass — 62 files, 0 diagnostics |
| Unit tests | `npm test` → `vitest run` | Pass — 2 files, 6 tests (finance 4, network 2) |
| Production build | `npm run build` → `vite build` | Pass — Vite 8.3.8, 2383 modules |
| JSON / manifest syntax | `JSON.parse` on all `src/data/*.json`, `package.json`, `tsconfig.json`, `biome.json`, `vercel.json` | Pass |
| Hardcoded domain scan | `grep -R ... src` | Only `src/config/domain.ts:9` (`softsutra.online` fallback) |
| Forbidden placeholder scan | `TODO|FIXME|Lorem|coming soon|SoftSutra.online|SoftSutra.in` in `src` | 0 matches |
| Native popup scan | `window.alert/confirm/prompt/open` in `src` | 0 matches |
| Crawler output | `dist/ads.txt`, `dist/robots.txt`, `dist/sitemap.xml` | Present |
| PWA output | `dist/manifest.webmanifest`, `dist/sw.js`, `dist/workbox-*.js`, 4 PNG icons | Present, 24 precache entries / 694.69 KiB |
| Domain override test | `VITE_ROOT_DOMAIN=softsutra.in npx vite build --outDir /tmp/opencode/crawler-test` | `robots.txt` + all 6 sitemap `<loc>` values rewritten to `softsutra.in` |

Build chucks:

```
dist/index.html                      1.79 kB │ gzip: 0.81 kB
dist/assets/index-*.css             49.97 kB │ gzip: 9.30 kB
dist/assets/index-*.js             492.26 kB │ gzip: 157.86 kB
dist/assets/seo-*.js                61.67 kB │ gzip: 24.07 kB
dist/assets/ContactPage-*.js        84.29 kB │ gzip: 24.57 kB
dist/assets/LegalPage-*.js           1.73 kB │ gzip: 0.72 kB
dist/assets/*legal routes*          ~0.27 kB each (lazy)
```

## 2. Protocol rule audit

| Protocol rule | Implementation | Status |
| --- | --- | --- |
| Brand strictly `SoftSutra`; no domain in brand title | Brand strings in `index.html`, `siteCopy.json`, `ui.json`, schema `name` fields are bare `SoftSutra` | Pass |
| Domain-agnostic runtime resolver | `src/config/domain.ts`: strips scheme/`www.`/subdomains/ports, defaults only on localhost/preview, honours `VITE_ROOT_DOMAIN`, derives `exam./jap./music./calculator./speed./cafe.<root>` | Pass |
| Static crawler files domain-aware | `{{ROOT_DOMAIN}}` tokens in `public/robots.txt` + `public/sitemap.xml`, replaced at build by `crawlerDomain()` in `vite.config.ts` | Pass |
| Strict logic / data split | All descriptions, features, guides, FAQs, legal copy, preview datasets and UI chrome live in `src/data/*.json`; `.tsx` files contain UI/logic only | Pass |
| Files under 250–300 lines | Largest source file is `editorialGuides.json` (222 lines); largest `.tsx` is `HomePage.tsx` (206 lines) | Pass |
| Verified engines, no hand-rolled domain math | `decimal.js` + `ROUND_HALF_UP` in `src/engine/finance.ts`; `src/engine/network.ts` for RTT/jitter; `src/engine/mala.ts` for bead cycles | Pass |
| Mandatory self-verification | Lint, type check, tests, build, JSON parse and grep scans all executed after the final edit | Pass |
| Back-button protection | `useBackGuard()` pushes history on overlay open, listens to `popstate` **and** Capacitor `App.addListener('backButton')`, guarded against double-close | Pass |
| Visible top-left Back on subpages | `src/components/ui/BackLink.tsx`, rendered at the top of `<main>` on every non-root route | Pass |
| Root double-back exit guard | `src/routes/root.tsx` shows "Press back again to exit SoftSutra" toast at `/` | Pass |
| Instant offline persistence | `useStoredState()` → Dexie (`src/db/local.ts`), with try/catch fallback for private mode/quota | Pass |
| Media continuity | `MusicWidget` uses `navigator.mediaSession` and persists track index + exact playback second in Dexie | Pass |
| Global crash protection | `ErrorBoundary` wraps the entire app; storage, network and media calls are guarded | Pass |
| Mobile ergonomics | Locked viewport, `viewport-fit=cover`, `interactive-widget=resizes-content`, `overscroll-behavior-y: none`, transparent tap highlight, `user-select: none` on buttons/nav, 44px targets, `env(safe-area-inset-*)` utilities, light/dark/system themes | Pass |
| Desktop workstation | `max-w-7xl` three-column grid: persistent left `NavRail` (≥1280px), content, right sticky 300px ad rail (≥1024px) | Pass |
| Zero native popups | Custom toast / dialog / consent UI only | Pass |
| App-convertible paths | `base: './'`, relative assets, browser history on web / hash history in native containers, platform adapters in `src/services/platform.ts` | Pass |
| Unified AdSense/AdMob bridge | `AdSlot` switches on `isNativeContainer()`, exposes `data-admob-unit-id`/`data-admob-size` hooks, fixed geometry | Pass |
| E-E-A-T trust footprint | `/about`, `/contact`, `/privacy-policy`, `/terms`, `/disclaimer`; founder identity and both official email forms | Pass |
| Crawler files | `ads.txt`, `robots.txt` (Mediapartners + AdsBot allowed), `sitemap.xml` with 6 URLs | Pass |
| JSON-LD | `Organization`, `WebSite`, 6 × `SoftwareApplication` (each `url` = `getAppUrl(app.key)`), `FAQPage` | Pass |
| Semantic HTML5 | `header`, `nav`, `main`, `article`, `section`, `footer`, labelled `aside`, skip link | Pass |
| PWA install system | 5-second slide-down banner, persisted dismissal, standalone guard hides install UI, maskable icons, auto-update SW | Pass |
| UI inspection shield | `src/services/shield.ts` blocks context menu/drag inside `[data-ui-shield]` logic zones while keeping inputs, outputs and marked copyable text selectable | Pass (scoped) |

Documented deviations (deliberate, not omissions):

- **Server-side logic shielding / anti-devtools key blocking:** the portal is a static, offline-first PWA, so deterministic public-domain formulas (EMI, GST, RTT/jitter, bead cycles) stay in client modules; a scoped DOM shield is used instead of blocking F12/Ctrl+U, which would degrade accessibility and break legitimate inspection. Revisit only if proprietary scoring engines are added; then move them to Vercel Edge routes or WASM.
- **Viewport zoom:** locked per WEB_PROTOCOL §2. iOS Safari ignores `user-scalable=no`; text remains resizable via system settings.
- **Field CWV data:** no deployed origin or RUM feed exists locally, so the numbers below are structural budgets, not field percentiles.

## 3. Sub-app evidence (audited source state)

| App | Status in `apps.json` | Verified capability |
| --- | --- | --- |
| Exam | `live` | 16 national + 15 state sets, 90-day unlock calendar, section tabs, question palette, rough pad, fractional negative marking via `decimal.js`, solutions and progress tiers |
| Speed | `live` | Six real HTTP round trips to current origin, mean-absolute-change jitter, local history, rating bands |
| Music | `live` | Dual-deck crossfade, EQ, lyrics, MediaSession, offline vault, low-ad/no-index positioning; portal preview uses a generated tone |
| Cafe | `live` | OTP, presign, outbox, QR and ZIP/PDF readiness flows; provider wiring remains in the full app, not the portal preview |
| Jap | `live` | 159 mantras, 108-bead mala with haptics, Panchang strip, Dexie sessions, PWA; composite counters/deep Faladesh remain unwired in the full app |
| Calculator | `expanding` | Detailed published specification; portal preview implements live EMI/GST with half-up rounding; full suite engines/db/assets still pending in that sub-project |

Portal previews are all live: EMI/GST calculator, HTTP latency diagnostic, 108-bead mala + Panchang strip, MCQ with instant explanation, document-readiness checklist, low-ad tone player. Each is interactive, offline-persisted and links to its dynamically resolved full app.

## 4. AdSense activation — exact paste locations

Ads are intentionally inert until real IDs are supplied. `isAdsConfigured()` requires `^ca-pub-\d{16}$` plus a non-empty slot ID; consent must be `personalized`; native containers never load AdSense.

1. Create `.env` from `.env.example` and fill:

```dotenv
VITE_ADSENSE_PUB_ID=ca-pub-XXXXXXXXXXXXXXXX
VITE_AD_SLOT_LEADERBOARD=
VITE_AD_SLOT_INARTICLE=
VITE_AD_SLOT_SIDEBAR=
VITE_AD_SLOT_MOBILE=
```

2. Replace the placeholder in `public/ads.txt` (digits only, no `ca-pub-` prefix):

```
google.com, pub-XXXXXXXXXXXXXXXX, DIRECT, f08c47fec0942fa0
```

3. `npm run build` and redeploy. No `.tsx` edit is required: `src/config/ads.ts` reads all five variables.

Slot geometry (reserved before any script loads): leaderboard `min-height 90px`, in-article `280px`, sticky desktop sidebar `600px`, mobile bottom anchor `50px`. Every wrapper carries an `Advertisement` label; the mobile anchor has a 44px `[x]` hide control; a ≥24px gap separates ad frames from action buttons. Consent key `softsutra-consent`; change event `softsutra:consent`.

## 5. Core Web Vitals / CLS verification

- **CLS:** 0 by construction. All four ad containers have fixed `min-height` and are present in the initial HTML render as reserved, labelled placeholders; `data-ad-state="reserved"`. No above-the-fold image swaps, no late-injected wrappers, no font swap (system font stack, no external font request). Skeleton fallbacks use `min-h-[40vh]`.
- **LCP:** hero is text-only; critical payload is `index.html` (1.79 kB) + one stylesheet (9.30 kB gzip) + main chunk (157.86 kB gzip). Fonts are local system fonts, eliminating render-blocking font fetches.
- **INP:** interactive work is bounded (six-item latency loop, eight-option MCQ, decimal arithmetic on submit). No long-lived main-thread timers except the optional 1-second preview tone; MediaSession handlers are passive.
- **TTFB / caching:** fully static output on Vercel edge; `vercel.json` sets `Cache-Control: public, max-age=0, must-revalidate` and `Service-Worker-Allowed: /` on `/sw.js`, plus HSTS, `nosniff`, `Referrer-Policy`, `X-Frame-Options` and `Permissions-Policy` globally. Ad fast-path is cleanly excluded from SPA rewrites.
- **Offline:** 24 precached entries / 694.69 KiB, `navigateFallback: 'index.html'`, stale-cache cleanup, NetworkFirst cache for AdSense script URL.

Post-deploy confirmation still required: run Lighthouse (mobile + desktop) and PageSpeed Insights on the live origin, plus Search Console → Core Web Vitals after traffic arrives. Targets: LCP ≤ 2.5 s, INP ≤ 200 ms, CLS ≤ 0.1 at p75.

## 6. File map (created / modified)

- Config: `package.json`, `tsconfig.json`, `biome.json`, `vite.config.ts`, `vercel.json`, `.env.example`, `index.html`
- Domain / ads / contact: `src/config/domain.ts`, `src/config/ads.ts`, `src/config/contact.ts`
- Data (`src/data/`): `apps.json`, `previews.json`, `editorialGuides.json`, `faqs.json`, `legal.json`, `siteCopy.json`, `ui.json`
- Engines (`src/engine/`): `finance.ts` + test, `network.ts` + test, `mala.ts`
- Services / db / hooks: `src/services/{ads,consent,platform,shield}.ts`, `src/db/local.ts`, `src/hooks/{useBackGuard,useStoredState,useTheme}.ts`
- Components: `AdSlot`, `Header`, `Footer`, `NavRail`, `CookieConsent`, `InstallPrompt`, `MobileStickyAd`, `ErrorBoundary`, `AppCard`, `EditorialSection`, `SectionHeading`, `Toast`, `BackLink`, six widgets
- Pages / routes / router: `src/pages/{HomePage,ContactPage,LegalPage,NotFoundPage}.tsx`, `src/routes/{root,legal}.tsx`, `src/router.tsx`, `src/lib/{content,seo}.tsx`, `src/types/content.ts`, `src/main.tsx`, `src/index.css`
- Public: `ads.txt`, `robots.txt`, `sitemap.xml`, `favicon.svg`, `icons/icon-{192,512}.png`, `icons/icon-maskable-{192,512}.png`
- Preservation: original 75,042-byte hub retained at `legacy/index-legacy-2026.html`

## 7. Memory snapshot

```yaml
[SOFTSUTRA_PROJECT_MEMORY_SNAPSHOT]
Startup: "SoftSutra (Sarsa, Pehowa, Kurukshetra)"
Founder: "Raman Sharma"
Contact_Email: "ramansarsa@zohomail.in"
Active_Domain: "softsutra.online / softsutra.in — runtime-resolved; exam.|jap.|music.|calculator.|speed.|cafe.<root>"
Active_Vercel_Project: "softsutra-speed-test (gt7r8qimh) / exam (gks20w54s) / softsutra-[app]"
Dev_Environment: "Termux (Pre-logged in: Vercel CLI, GitHub CLI, Firebase CLI, code-server)"
Architecture_Posture: "App-Convertible PWA (Capacitor/TWA Ready) + Dual Mobile/Desktop Ergonomics + Domain-Agnostic Build"
Monetization_Posture:
  - "AdSense Fast-Approval Ready (Privacy Policy, About Raman/SoftSutra, Contact, Terms)"
  - "CLS-Protected Ad Containers (Reserved 90px / 280px / 600px / 50px min-heights)"
  - "Non-Intrusive Layout: Desktop Sticky Rail + Mobile Sticky Bottom Banner with [x] toggle"
  - "Consent-gated personalized ads; ads inert until ca-pub ID + slot IDs are pasted"
Security_Posture:
  - "Scoped DOM inspection shield on logic-bearing preview zones; public deterministic math stays client-side for offline use"
  - "HSTS, nosniff, Referrer-Policy, X-Frame-Options, Permissions-Policy via vercel.json"
  - "Dexie try/catch fallbacks; no native popups; no hardcoded domains outside domain.ts"
Code_Size_Status: "4,548 lines across 62 src files; main JS 492.26 kB (157.86 kB gzip); PWA precache 694.69 KiB"
Active_Features_Implemented: ["6 live previews", "5 editorial guides", "5 trust pages", "JSON-LD graph", "dynamic sitemap/robots", "Dexie persistence", "Capacitor back bridge", "5s install banner", "dual-theme + Hindi/English UI"]
Preserved_Legacy_Logic: "100% of legacy hub preserved in legacy/index-legacy-2026.html (75,042 bytes)"
Pending_Next_Steps: ["Paste real AdSense pub ID + 4 slot IDs and publish ads.txt", "Deploy and run Lighthouse/PSI for field CWV", "Wire remaining Calculator engines and Jap composite counters in their sub-projects"]
```
