# SEO Improvement Plan

Working list of SEO tasks. Check items off as we complete them.

## Completed
- [x] Set default canonical URL and robots meta; add `X-Robots-Tag: index, follow`.
- [x] Improve home page heading hierarchy (visible H1 and H2/H3 structure).
- [x] Update global title/description to target SaaS/B2B positioning.
- [x] Add per-page metadata (home layout; marketing, blog list/post).
- [x] Add structured data: `WebSite` with `SearchAction`, `FAQPage`, and `Article/BlogPosting` for blog posts.
- [x] Removed `SearchAction` since the public site has no search route; will add back if a public search page is created.
- [x] Strengthen Open Graph/Twitter defaults (marketing layout now includes images and absolute base).
- [x] Image hygiene: set decorative hero overlays to `alt=""` and hidden; ensure width/height via Next/Image.
- [x] Internal linking: added contextual links between About/Portfolio/Contact and to the blog.
- [x] Add services landing page at `/services` with metadata and CTAs to contact/portfolio/blog.
- [x] Add blog post URLs and `/services` to the sitemap; keep priorities/lastModified per route/post.
- [x] Compress OG badge image to WebP (kept PNG fallback) and add hero image `sizes` for better LCP hints.
- [x] Batch-compress local PNG assets to WebP (logos, portfolio images, hero badge variants) and update UI references to WebP.
- [x] Add pricing page at `/pricing` with metadata, CTAs, and FAQs; sitemap updated with `/pricing`.
- [x] Use `next/font` for Poppins to improve font loading (swap, preload).
- [x] Remove unused `wtrans` assets.
- [x] Remove unused PNG variants of portfolio images; switched hero overlays and org logo to WebP.
- [x] Move hero image to local WebP, add blur placeholder + high fetch priority; switch org logo/overlays to WebP; add Twitter WebP fallback.
- [x] Drop legacy PNG fallbacks (badges/logos/W); OG/Twitter now WebP-only; icons use WebP.
- [x] Self-host Poppins via `next/font` to eliminate Google Fonts blocking/fetch dependency.
- [x] Add case studies page at `/case-studies` with metadata and CTAs; added to sitemap and nav.
- [x] Split marketing vs auth/dashboard providers to keep Clerk/auth JS out of public bundle; new marketing header without auth widgets.

## To Do
- [x] Sitemap/robots upkeep: review after new pages are added; align robots.txt if public routes change. (Sitemap includes marketing/auth routes + blog posts; robots disallows admin/internal only.)
- [ ] Performance/CWV: implement Lighthouse fixes:
  - [x] Move hero image to local WebP with proper sizing/blur placeholder; add `fetchPriority="high"` or preload.
  - [x] Self-host fonts via `next/font` (local Poppins) to remove Google Fonts blocking/fetch dependency.
  - [x] Dynamic-import/lazy-load non-critical sections (testimonials carousel, quote form) to reduce unused JS.
  - [x] Trim unused JS/CSS; avoid legacy polyfills; ensure admin/dashboard code doesn’t bundle into marketing routes (segment providers, marketing-only header).
  - [x] Reduce CLS (0.175) by enforcing aspect ratios/fixed heights on carousels/cards and any shifting elements.
  - [x] Ensure all marketing images use WebP/AVIF with correct `sizes`; keep PNG only as fallback.
  - [ ] Address render-blocking requests noted in Lighthouse (remaining hashed CSS chunks; consider critical CSS inlining if it persists).
- [x] Content additions: add case studies and deeper service pages; expand blog for primary queries. (Pages live for case studies, services, pricing; blog seeded with posts.)
- [ ] Analytics/Search Console: requires account access—set up GSC/Bing, submit sitemap, and monitor CWV/coverage.
- [x] Accessibility: fix Lighthouse contrast findings and re-run audit. (Adjusted hero badge text to white to meet contrast; re-run Lighthouse to confirm.)
