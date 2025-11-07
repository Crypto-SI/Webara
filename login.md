# Authentication Playbook

This guide walks through everything required for customers and admins to register, sign in, reach the correct dashboard, and sign out. It reflects the current code in `src/` and the Supabase Auth guidance from the official docs (Context7 `/supabase/supabase`, topic `authentication`).

## 1. Prerequisites

### Environment
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` (or `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`)
- `SUPABASE_SERVICE_ROLE_KEY` (only for trusted server actions like admin overview)

Store these in `.env.local` and restart the dev server after changes. Missing variables throw at client creation (`src/lib/supabase/client.ts:4` and `src/lib/supabase/server.ts:4`).

### Schema & Roles
- Run the migrations in `supabase/migrations/` to create `profiles`, `businesses`, `quotes`, and the RLS policies/roles. Admins use the `admin` role column on `profiles`.
- Profiles are created on-demand inside the auth context when a session first appears (`src/contexts/auth-context.tsx:40`).

### Providers
Wrap the Next.js App Router root with `<AuthProvider>` (already wired up in `src/app/layout.tsx:27`), so every component can call `useAuth()`.

## 2. Supabase Clients

- **Browser**: `createSupabaseClient()` memoises a singleton `createBrowserClient<Database>()` (`src/lib/supabase/client.ts:1`). This keeps local storage auth state in sync and mirrors the recommended pattern from the Supabase docs (fetch session with `auth.getSession()` on mount).
- **Server / Route Handlers**: `createServerSupabaseClient()` (`src/lib/supabase/server.ts:1`) injects Next.js cookies. Use it in server actions or route handlers when you need the current user's session without exposing the service role key.

## 3. Auth Context Responsibilities

`src/contexts/auth-context.tsx:18`
- Tracks `{ user, session, loading, error }` plus the signed-in profile.
- `signUp(email, password, metadata)` stores profile metadata (e.g. `full_name`).
- `signIn(email, password)` uses `auth.signInWithPassword`, sets state, and refreshes the profile.
- `signOut()` clears the Supabase session and resets local React state.
- `refreshProfile()` is exposed so UI elements can force a re-fetch when roles might have changed.
- The hook listens to `supabase.auth.onAuthStateChange` so tabs stay in sync (matching Supabase recommendations for client apps).

## 4. User Signup Flow

1. **Page**: `/signup` renders `SignupForm` (`src/components/auth/signup-form.tsx:20`).
2. **Validation**: Zod schema enforces email + password + full name.
3. **Call**: `signUp()` forwards `metadata.full_name` so the profile row has display data once verification is complete.
4. **Verification**: Supabase emails a confirmation link by default. The UI shows “check your email” until confirmed.

### Admin Seeding
- Script: `pnpm ts-node scripts/create-admin.ts` (uses service role key).
- Temporary UI: visit `/setup-admin` to create an admin profile in environments where CLI access is limited.

## 5. Sign-In Flow & Dashboard Routing

### Entry Points
- `/login` renders the shared `LoginForm` (`src/components/auth/login-form.tsx:20`).
- The header modal also renders `LoginForm`, so the behaviour is identical.

### Behaviour
1. Validate credentials via `signIn()`.
2. After a successful response, call `supabase.auth.getUser()` to grab the latest user and profile role.
3. Redirect logic:
   - `role === 'admin'` → `/admin`
   - Otherwise → `/account`
4. `router.refresh()` ensures server components that read session cookies re-render.

If a profile row is missing, the auth context automatically inserts one (see `loadProfile()` in `auth-context.tsx:48`). Errors are surfaced in an `<Alert>` component for quick troubleshooting.

## 6. Protecting Routes

- `ProtectedRoute` (`src/components/auth/protected-route.tsx:7`) checks `user` on mount using a pattern straight from Supabase docs: fetch the session (`auth.getSession()`), redirect unauthenticated visitors to `/login`, and show a spinner while loading.
- `AdminGate` (`src/app/admin/page.tsx:71`) ensures the signed-in profile or metadata grants `admin` privileges. Non-admins are rerouted to `/account`.
- Account pages (`src/app/account/page.tsx:1`) wrap everything in `<ProtectedRoute>` to prevent unauthenticated access.

## 7. Dashboard Experiences

### User Dashboard (`/account`)
- Fetches the current profile (`profiles` table) and recent quotes using `getMyQuotesAction()` (`src/app/actions.ts`).
- Displays metrics, charts, and quote status cards. Everything assumes a verified user session.

### Admin Dashboard (`/admin`)
- Wrapped in both `ProtectedRoute` and `AdminGate`.
- Loads metrics from `/api/admin/overview`, which validates the session with `createRouteHandlerClient` and uses the service role key only for aggregated statistics.
- Shows user counts, business/quote summaries, and status breakdown.

## 8. Signing Out

- Triggered from the header dropdown or mobile navigation sheet.
- Calls `signOut()` from the auth context, which in turn runs `supabase.auth.signOut()` (`auth-context.tsx:119`), clears profile state, and resets loading flags.
- Because the browser client was built with `createBrowserClient`, Supabase's local storage session is also purged, matching the documented flow for client-side apps.

## 9. Troubleshooting Checklist

- Verify all auth env vars exist and match the Supabase project.
- Confirm migrations ran so `profiles` and `quotes` tables exist and RLS policies allow the logged-in user to read their own data.
- Inspect the browser console for Supabase error payloads if sign-in fails.
- For admin tests, make sure the profile row has `role = 'admin'`—you can update it via the Supabase dashboard or the `create-admin` utilities.
- If redirects feel stale, confirm `router.refresh()` fired and the Next.js server action is reading from the updated session.

## 10. QA Flow Before Shipping

- [ ] Create a brand-new user via `/signup`, confirm email, log in, land on `/account`, and see personal data.
- [ ] Elevate that profile to `admin`, log out, log back in, and confirm redirect to `/admin`.
- [ ] Attempt to hit `/admin` as a non-admin and verify you are redirected to `/account`.
- [ ] Sign out from both desktop and mobile navigation to ensure state clears.
- [ ] Reload the app in a new tab to confirm `auth.getSession()` restores the signed-in state automatically.
- [ ] Run through the admin dashboard to ensure `/api/admin/overview` responds with no Supabase errors.

Keep this document in parity with the implementation whenever auth flows change. Cross-check against the Supabase authentication docs (Context7 `/supabase/supabase`) when updating flows, especially for new MFA, OAuth, or passwordless features.
