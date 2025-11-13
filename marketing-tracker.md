# Marketing & Content Execution Tracker

This file is your single source of truth for:
- Weekly content and marketing execution checklist
- Platform-by-platform tasks
- Implementation tasks for the Admin Weekly Execution Tracker feature

Update checkboxes as work is completed.

---

## 1. Weekly Execution Checklist (Operational)

Use this section every week as your manual reference (the in-app tracker will mirror this).

### Monday

- [ ] Review lead submissions from last week (quality, source, status)
- [ ] Check all main CTAs and forms are working
- [ ] Review previous week analytics (traffic, conversions, key pages)

LinkedIn
- [ ] Publish educational or teardown post
- [ ] Engage with comments and DMs (10–15 minutes)
- [ ] Connect with 5–10 relevant founders, marketers, or agency owners

Instagram
- [ ] Post: strong Webara layout or before-and-after example
- [ ] Story: "This week we’re working on..." with link to site

X (Twitter)
- [ ] Publish 1–2 short insight tweets
- [ ] Reply to 3–5 relevant tweets with meaningful input

YouTube
- [ ] Choose topic and outline this week’s main video
- [ ] Confirm recording slot and required assets

Ads
- [ ] Run quick performance check: CPC, CTR, conversions
- [ ] Pause obvious underperformers if needed

---

### Tuesday

LinkedIn
- [ ] Post: mini case study or results-driven narrative
- [ ] Respond to DMs and comments
- [ ] Start 2–3 new conversations via insightful comments

Instagram
- [ ] Story: work-in-progress snippet, UI detail, or quick tip

X (Twitter)
- [ ] Publish 1–2 tweets with micro-lessons or strong opinions

YouTube
- [ ] Finalize script/outline and screens for this week’s video

Ads
- [ ] Capture creative ideas from best-performing organic content

---

### Wednesday

LinkedIn
- [ ] Post: process / behind-the-scenes breakdown
- [ ] Engage with users who liked or commented

Instagram
- [ ] Post: carousel or reel (process, outcomes, or explainer)
- [ ] Story: poll or question on website or conversion challenges

X (Twitter)
- [ ] Publish 1–2 tweets
- [ ] Optional: short thread (3–5 tweets) on a core topic

YouTube
- [ ] Record the main weekly video (teardown, tutorial, or case study)

Ads
- [ ] Confirm spend pacing; adjust only if significantly off

---

### Thursday

LinkedIn
- [ ] Optional post: founder POV, strategic insight, or opinion
- [ ] Follow up with any warm leads or replies

Instagram
- [ ] Story: highlight a YouTube clip, client win, or testimonial

X (Twitter)
- [ ] Publish 1–2 tweets with insights, metrics, or screenshots

YouTube
- [ ] Edit video: intro/outro, overlays, and strong call-to-action
- [ ] Prepare title, description with keywords and tracking links
- [ ] Create 2–4 short clips for Shorts/Reels

Ads
- [ ] Draft 1 new ad creative or variation to test next week

---

### Friday

LinkedIn
- [ ] Post: weekly recap, key lesson, or transformation story with CTA
- [ ] Engage with comments; DM 2–3 warm prospects (value first)

Instagram
- [ ] Post: case study, testimonial, or standout UI example
- [ ] Stories: human/brand personality moment (team, workspace, process)

X (Twitter)
- [ ] Publish 1–2 tweets (recap, insight, teaser for next content)

YouTube
- [ ] Publish main video
- [ ] Add to playlists; configure end screens and pinned CTA comment
- [ ] Publish 1–2 Shorts from this week’s video
- [ ] Share the video on LinkedIn, X, and Instagram Stories

Ads (Weekly Optimization)
- [ ] Review performance: CTR, CPL, conversions, lead quality
- [ ] Pause worst performers
- [ ] Reallocate budget to top performers
- [ ] Decide next week’s focus and experiments

---

### Saturday (Optional / Light)

- [ ] Optional Instagram Story: behind-the-scenes, culture, or casual update
- [ ] Optional X tweet: founder-style reflection or evergreen insight
- [ ] Reply to new YouTube comments

---

### Sunday (Review & Planning)

- [ ] Review weekly performance:
  - [ ] Total leads and opportunities
  - [ ] Conversion rate on key forms
  - [ ] Top-performing posts, videos, and ads
- [ ] Define next week’s:
  - [ ] Primary content theme
  - [ ] Main offer/CTA
  - [ ] YouTube topic(s)
- [ ] Outline next week’s LinkedIn posts and key talking points
- [ ] Capture ideas for new landing pages, experiments, or offers

---

## 2. Admin Weekly Execution Tracker Implementation Tasks

These tasks define the mini-app that will live in the `/admin` dashboard and sync progress to Supabase.

- [x] Design data model and RLS approach for weekly marketing tracker tables in Supabase
- [ ] Implement migration SQL for:
  - [ ] `weekly_marketing_checklist_items` table
  - [ ] `weekly_marketing_summaries` table
  - [ ] `is_admin()` helper function aligned with existing roles/claims
  - [ ] RLS policies restricting access to admins only
- [ ] Add "Weekly Execution Tracker" panel to Admin dashboard UI
- [ ] Implement client-side state and API integration for per-task check/uncheck
- [ ] Implement `/api/admin/weekly-tracker/commit` endpoint to:
  - [ ] Enforce Sunday 21:00 UK time commit rule on the server
  - [ ] Aggregate checklist into a weekly summary snapshot
  - [ ] Prevent edits for weeks that have been committed
- [ ] Add read-only weekly history view powered by `weekly_marketing_summaries`
- [ ] Verify end-to-end:
  - [ ] Only admins can access tracker and APIs
  - [ ] Tasks persist correctly during the week
  - [ ] Commit flow runs only at/after allowed time and locks results
  - [ ] Supabase data is written and protected correctly via RLS