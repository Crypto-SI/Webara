# Webara

Webara is a full-stack collaboration and quoting platform for the studio’s clients. It combines a marketing site, AI-assisted quote intake, user dashboards, and an internal admin workspace backed by Supabase and Clerk.

## Feature Highlights
- **Marketing experience** – Hero, about, portfolio, testimonials, and CTA sections tailored to the studio’s brand with responsive animations and scroll interactions.
- **AI-assisted quote flow** – Prospect forms feed Genkit flows powered by Google’s Gemini models to generate pricing guidance, collaboration ideas, and optional text-to-speech previews.
- **Account dashboard** – Authenticated users can review their businesses, recent quotes, AI suggestions, and proposal statuses with modal detail views.
- **Admin workspace** – Admins see platform metrics, filter collaboration requests, open full quote detail modals, and leave feedback that syncs back to the requester via Supabase.
- **Clerk authentication** – Clerk handles session management on both the client and API routes, with role checks (admin, staff, user) mirrored inside Supabase profiles.
- **Supabase persistence** – Migrations define `profiles`, `businesses`, `quotes`, and supporting policies. RLS ensures users only see their own data while admins get elevated access through service-role APIs.

## Tech Stack
- **Framework:** Next.js 15 (App Router) · React 18 · TypeScript
- **Styling:** Tailwind CSS, shadcn/ui, Radix UI, Lucide, class-variance-authority
- **Auth:** Clerk (publishable + secret keys, role metadata)
- **Data:** Supabase (Postgres, Row Level Security, Edge Functions-ready API routes)
- **AI:** Genkit with `@genkit-ai/googleai` to reach Gemini 2.5 Flash + Flash Preview TTS
- **Tooling:** Turbopack dev server, ESLint (`next lint`), `tsc --noEmit`, PostCSS, dotenv

## Environment Setup
1. **Install dependencies**
   ```bash
   npm install
   ```
2. **Copy environment variables**
   - Duplicate `.env.local` (or create one) and fill in:
     - `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
     - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`
     - `GOOGLE_GENAI_API_KEY` (or configure `GOOGLE_APPLICATION_CREDENTIALS`)
3. **Run database migrations (optional but recommended)**
   ```bash
   supabase db reset         # wipes local db and reapplies migrations
   # or
   supabase migration up     # applies pending migrations
   ```
   The SQL files under `supabase/migrations` are ordered chronologically and keep Postgres in sync with the app.
4. **Start the dev servers**
   ```bash
   npm run dev        # Next.js on http://localhost:9002
   npm run genkit:dev # (optional) hot-reload Genkit explorer
   ```

Common scripts:
```bash
npm run build       # Production build
npm run start       # Serve the compiled build
npm run lint        # ESLint via next lint
npm run typecheck   # Project-wide type checking
npm run sync:clerk  # Sync Clerk users into Supabase profiles
```

## Project Structure
- `src/app/(marketing)` – Marketing pages and content.
- `src/app/(dashboard)` – User/account dashboards, quote detail routes, and admin area.
- `src/app/(auth)` – Setup/admin auth helpers and middleware.
- `src/app/api` – Route handlers (e.g., `/api/admin/overview`, `/api/admin/quotes/[id]/feedback`, `/api/profile/data`) that call Supabase with service-role keys when needed.
- `src/components` – Reusable UI (layout, dashboards, admin tables, auth forms, dialogs).
- `src/contexts` – Clerk + custom auth contexts and providers.
- `src/lib` – Supabase client helpers, generated database types, and shared utilities.
- `src/ai` – Genkit config plus quote/collaboration/TTS flows.
- `supabase/` – Config, migrations, and docs describing the database schema.

## Development Notes
- Admin-only views rely on Clerk role metadata and server-side verification in Supabase before returning sensitive data.
- Quotes include AI suggestions, collaboration preferences, and an admin feedback field surfaced to both the user dashboard and admin workspace.
- When editing UI heavy dialogs/tables, prefer shadcn/ui primitives; responsive behavior is handled with Tailwind utility classes.
- The project currently uses the Supabase service role key for server routes—keep it on the server only.

## Deployment
- `apphosting.yaml` contains Firebase App Hosting defaults, but any platform that can run `npm run build && npm run start` will work.
- Make sure environment variables (Supabase, Clerk, Gemini) are available in the hosting platform.
- Run migrations against your production Supabase project before deploying new API/UI changes that depend on schema updates.

## Contributing
1. Fork and clone the repo.
2. Create a feature branch off `main`.
3. Keep Supabase migrations atomic and describe schema changes in `docs/supabase-schema.md`.
4. Run `npm run lint` and `npm run typecheck`; include screenshots or loom links for notable UI tweaks.
5. Open a PR with a concise summary plus testing notes.
