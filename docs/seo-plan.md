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

## To Do
- [ ] Image hygiene: optionally remove legacy PNG fallbacks if unused; ensure new assets ship as WebP/AVIF.
- [ ] Sitemap/robots upkeep: review after new pages are added; align robots.txt if public routes change.
- [ ] Performance/CWV: further LCP/JS/CSS trimming; consider lazy-loading non-critical sections and auditing bundle size.
- [ ] Content additions: add case studies and deeper service pages; expand blog for primary queries.
- [ ] Analytics/Search Console: requires account access—set up GSC/Bing, submit sitemap, and monitor CWV/coverage.
