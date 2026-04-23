# Deploy Checklist

Code-side work complete. Four commits landed on `main`:

- `chore: pin Node 20.x for Vercel runtime`
- `chore: add security headers to next.config`
- `feat: add robots, sitemap, OG image, icons, JSON-LD Person schema`
- `chore: add Vercel Analytics and Speed Insights`

Follow the sections in order; don't skip.

## A. Vercel project import

- [ ] vercel.com → Add New → Project → GitHub → select the repo.
- [ ] Framework preset auto-detects Next.js — verify, accept.
- [ ] Build command `pnpm build`, install `pnpm install`, output `.next`, root `./` — all defaults, verify.
- [ ] Click Deploy. First build ~2–3 min. Note the assigned `*.vercel.app` subdomain.
- [ ] Project Settings → Environment Variables → add `NEXT_PUBLIC_SITE_URL` = the full `https://<subdomain>.vercel.app` URL.
- [ ] Trigger a redeploy (Deployments → latest → `⋯` → Redeploy) so OG image, sitemap, robots, JSON-LD all resolve to the live host.

## B. Preview-deploy QA (browser against the vercel.app URL)

- [ ] Click-through: Hero → Build Log → Selected Builds → Then vs. Now → FAQ → Contact. No missing sections, no layout shifts.
- [ ] DevTools viewport 412×823 — same click-through on mobile, no horizontal scroll.
- [ ] OS Reduce Motion on → reload → hero renders at final state (no fade), below-fold reveals collapse to opacity-only fade (no 14px transform).
- [ ] Keyboard Tab order: Skip to content → sticky nav → hero content. Skip-to-content focus-ring visible.
- [ ] Real iOS Safari on cellular: `position: sticky` + Lenis smooth scroll does not jank on scroll.
- [ ] Real Android Chrome on cellular: same check.

## C. Post-deploy production tests

- [ ] Lighthouse against the vercel.app URL, mobile + desktop, 3 runs each. Median target: mobile ≥ 90, desktop ≥ 95. Record in PERF_AUDIT.md.
- [ ] `curl -I https://<subdomain>.vercel.app/` — verify all six security headers present: `Strict-Transport-Security`, `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`, `Content-Security-Policy`.
- [ ] securityheaders.com → target grade A.
- [ ] ssllabs.com → target A or A+.
- [ ] OG preview: paste the URL into a Twitter DM, LinkedIn post composer, and Slack message. Card renders with accent-red pullquote. Slack caches OG hard — get it right first.
- [ ] `https://<subdomain>.vercel.app/sitemap.xml` returns 200 with single URL entry.
- [ ] `https://<subdomain>.vercel.app/robots.txt` returns 200 with sitemap reference.
- [ ] `https://<subdomain>.vercel.app/some-nonexistent-path` returns Next.js 404, not Vercel platform error.
- [ ] `https://<subdomain>.vercel.app/opengraph-image` returns 1200×630 PNG.
- [ ] `https://<subdomain>.vercel.app/icon` and `/apple-icon` return the KJ monogram.
- [ ] View source on homepage → `<script type="application/ld+json">` contains the Person schema with real `sameAs` URLs.

## D. Record results in PERF_AUDIT.md

Append under a new "Production baseline" section, one line per check:

- [ ] Mobile Lighthouse median: Perf __, A11y __, BP __, SEO __
- [ ] Desktop Lighthouse median: Perf __, A11y __, BP __, SEO __
- [ ] Mobile LCP value: __ms
- [ ] Mobile CLS value: __
- [ ] securityheaders.com grade: __
- [ ] SSL Labs grade: __
- [ ] OG card renders on Twitter / LinkedIn / Slack: pass / fail
- [ ] sitemap.xml + robots.txt reachable: pass / fail
- [ ] 404 page correct: pass / fail
- [ ] Real-device iOS Safari + Android Chrome pass: pass / fail
