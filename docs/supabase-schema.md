# Supabase Schema Documentation

This document provides an overview of the current Supabase schema for both AUTH and public tables in the Webara project.

## Project Information
- **Project ID**: jkpdcwmvwpxsjpuioper
- **Organization ID**: xfvqjwgqytnhlohnxwez
- **Region**: eu-west-1
- **Database Version**: 17.6.1.038

## Admin Dashboard Alignment

The enhanced profiles table now serves as the single source of truth for user management, eliminating dependency on `auth.users`. When scoping the dashboard, anchor each view to the relevant tables:

- **User Directory**: Use `public.profiles` directly to show email, role, signup date, last sign-in, and contact data. The profiles table now contains all Clerk authentication data including `email`, `email_verified`, `clerk_created_at`, `clerk_last_sign_in_at`, and metadata fields. Add quick filters on `role` and `clerk_created_at`.
- **User Detail Panel**: Surface the complete profile record from `public.profiles` plus a list of related businesses (`public.businesses` on `owner_id`) and quotes (`public.quotes` on `user_id`) for a consolidated view.
- **Business Pipeline**: Use `public.businesses` to track business name, industry, company size, and timestamps. Pair each business with its owner profile to highlight the primary contact.
- **Collaboration Tracker**: Drive stage-specific tables or Kanban lanes from `public.quotes.status`. Show pending reviews (`pending`, `under_review`), completed deals (`accepted`, `project_created`), and rejected proposals (`rejected`) to manage workload.
- **Alerts and Tasks**: Derive action queues from `quotes` filtered by status age (e.g., `pending` older than three days) and from any custom flags stored in `profiles.public_metadata`, `profiles.private_metadata`, or `quotes.ai_suggestions`.
- **Audit Trail**: Leverage `auth.audit_log_entries` for visibility into security-sensitive events such as role changes or authentication anomalies.

## AUTH Schema Tables

The AUTH schema contains Supabase's built-in authentication tables that manage user authentication, sessions, and security.

### 1. users
The main table storing user authentication data.

**Key Columns:**
- `id` (uuid): Primary key, unique identifier for each user
- `email` (varchar): User's email address
- `encrypted_password` (varchar): Encrypted password hash
- `email_confirmed_at` (timestamptz): Timestamp when email was confirmed
- `phone` (text): User's phone number (unique)
- `phone_confirmed_at` (timestamptz): Timestamp when phone was confirmed
- `last_sign_in_at` (timestamptz): Last login timestamp
- `created_at` (timestamptz): Account creation timestamp
- `updated_at` (timestamptz): Last update timestamp
- `is_super_admin` (boolean): Super admin flag
- `is_sso_user` (boolean): Flag for SSO users
- `is_anonymous` (boolean): Flag for anonymous users
- `deleted_at` (timestamptz): Soft delete timestamp
- `raw_app_meta_data` (jsonb): Application metadata
- `raw_user_meta_data` (jsonb): User metadata

**Current Rows:** 1

### 2. sessions
Stores active user sessions.

**Key Columns:**
- `id` (uuid): Primary key
- `user_id` (uuid): Foreign key to users.id
- `created_at` (timestamptz): Session creation time
- `updated_at` (timestamptz): Last update time
- `not_after` (timestamptz): Session expiration time
- `user_agent` (text): Browser user agent
- `ip` (inet): IP address of the session
- `refresh_token_hmac_key` (text): HMAC key for refresh tokens
- `refresh_token_counter` (bigint): Counter for refresh tokens

**Current Rows:** 2

### 3. refresh_tokens
Stores refresh tokens for JWT renewal.

**Key Columns:**
- `id` (bigint): Primary key
- `token` (varchar): Refresh token value
- `user_id` (varchar): User identifier
- `revoked` (boolean): Revocation status
- `session_id` (uuid): Foreign key to sessions.id

**Current Rows:** 2

### 4. identities
Stores external authentication identities (OAuth providers).

**Key Columns:**
- `id` (uuid): Primary key
- `provider_id` (text): Provider-specific ID
- `user_id` (uuid): Foreign key to users.id
- `provider` (text): Provider name (e.g., 'google', 'github')
- `identity_data` (jsonb): Provider-specific user data
- `email` (text): Generated email from identity_data

**Current Rows:** 1

### 5. mfa_factors
Stores multi-factor authentication factors.

**Key Columns:**
- `id` (uuid): Primary key
- `user_id` (uuid): Foreign key to users.id
- `factor_type` (enum): Type of factor ('totp', 'webauthn', 'phone')
- `status` (enum): Status ('unverified', 'verified')
- `friendly_name` (text): User-friendly name for the factor
- `secret` (text): TOTP secret
- `phone` (text): Phone number for SMS factors
- `web_authn_credential` (jsonb): WebAuthn credential data

**Current Rows:** 0

### 6. one_time_tokens
Stores one-time tokens for various authentication flows.

**Key Columns:**
- `id` (uuid): Primary key
- `user_id` (uuid): Foreign key to users.id
- `token_type` (enum): Type of token
- `token_hash` (text): Hashed token value
- `relates_to` (text): Related entity

**Current Rows:** 0

### 7. audit_log_entries
Stores audit trail for user actions.

**Key Columns:**
- `id` (uuid): Primary key
- `payload` (json): Audit event data
- `ip_address` (varchar): IP address of the action
- `created_at` (timestamptz): Timestamp of the event

**Current Rows:** 0

## Public Schema Tables

The public schema contains application-specific tables for the Webara application.

### 1. profiles
Enhanced user profile table serving as the primary public users table, mirroring Clerk authentication data.

**Key Columns:**
- `id` (uuid): Primary key, auto-generated
- `user_id` (uuid): Clerk user ID (unique)
- `email` (text): Primary email address from Clerk authentication
- `email_verified` (boolean): Email verification status from Clerk
- `first_name` (text): First name from Clerk user profile (nullable)
- `last_name` (text): Last name from Clerk user profile (nullable)
- `full_name` (text): User's full name (auto-maintained from first_name/last_name)
- `username` (text): Username from Clerk user profile (nullable)
- `phone` (text): User's phone number (nullable)
- `avatar_url` (text): URL to user's avatar image (nullable)
- `role` (text): User role with check constraint ('user', 'admin', 'webara_staff'), default 'user'
- `clerk_created_at` (timestamptz): Account creation timestamp from Clerk
- `clerk_last_sign_in_at` (timestamptz): Last sign-in timestamp from Clerk
- `public_metadata` (jsonb): Public metadata from Clerk for role management
- `private_metadata` (jsonb): Private metadata from Clerk
- `unsafe_metadata` (jsonb): Unsafe metadata from Clerk
- `created_at` (timestamptz): Local record creation timestamp
- `updated_at` (timestamptz): Last update timestamp

**Foreign Keys:**
- Previously referenced `auth.users.id`, now independent with Clerk user_id

**Current Rows:** 1

### 2. businesses
Stores business information associated with users.

**Key Columns:**
- `id` (uuid): Primary key, auto-generated
- `owner_id` (uuid): Foreign key to profiles.user_id
- `business_name` (text): Name of the business
- `industry` (text): Industry sector (nullable)
- `website` (text): Business website URL (nullable)
- `description` (text): Business description (nullable)
- `company_size` (text): Company size with check constraint ('1-10', '11-50', '51-200', '201-500', '500+')
- `business_type` (text): Type with check constraint ('startup', 'small_business', 'enterprise', 'non_profit', 'agency')
- `contact_preferences` (jsonb): Contact preferences as JSON, default '{}'
- `created_at` (timestamptz): Creation timestamp
- `updated_at` (timestamptz): Last update timestamp

**Foreign Keys:**
- `owner_id` → `profiles.user_id`

**Current Rows:** 0

### 3. quotes
Stores quote requests and AI-generated responses.

**Key Columns:**
- `id` (uuid): Primary key, auto-generated
- `user_id` (uuid): Foreign key to profiles.user_id
- `business_id` (uuid): Foreign key to businesses.id (nullable)
- `title` (text): Quote title
- `website_needs` (text): Description of website requirements
- `collaboration_preferences` (text): Collaboration preferences (nullable)
- `budget_range` (text): Budget range (nullable)
- `ai_quote` (text): AI-generated quote (nullable)
- `suggested_collaboration` (text): AI-suggested collaboration approach (nullable)
- `ai_suggestions` (jsonb): AI suggestions as JSON array, default '[]'
- `admin_feedback` (text): Internal admin feedback shared with the requester (nullable)
- `status` (text): Quote status with check constraint ('draft', 'pending', 'under_review', 'accepted', 'rejected', 'call_requested', 'project_created')
- `estimated_cost` (numeric): Estimated project cost (nullable)
- `currency` (text): Currency code, default 'USD'
- `created_at` (timestamptz): Creation timestamp
- `updated_at` (timestamptz): Last update timestamp

**Foreign Keys:**
- `user_id` → `profiles.user_id`
- `business_id` → `businesses.id`

**Current Rows:** 0

## Row Level Security (RLS)

All public tables have RLS enabled:
- `profiles`: RLS enabled
- `businesses`: RLS enabled
- `quotes`: RLS enabled

## Database Extensions

The database has the following extensions enabled (based on migration files):
- UUID generation functions
- Other extensions as defined in migration files

## Relationships

The schema follows these key relationships:
1. `profiles` (primary user table) → `businesses` (1:many via owner_id)
2. `profiles` → `quotes` (1:many via user_id)
3. `businesses` → `quotes` (1:many via business_id, optional)
4. Clerk authentication → `profiles` (1:1 via user_id, synced via sync-clerk-users script)

## Migration History

The database has been initialized with the following migrations:
1. 20251106_001_create_extensions.sql
2. 20251106_002_create_profiles_table.sql
3. 20251106_003_create_businesses_table.sql
4. 20251106_004_create_quotes_table.sql
5. 20251106_005_create_rls_policies.sql
6. 20251106_006_create_functions_and_triggers.sql
7. 20251106_007_add_admin_role.sql
8. 20251106_008_update_rls_policies_for_roles.sql
9. 20251107_001_update_schema_for_clerk.sql
10. 20251107_002_update_rls_policies_for_clerk.sql
11. 20251107_003_alter_user_ids_to_text.sql
12. 20251107_004_enhance_profiles_table_for_clerk.sql
13. 20251107_005_update_rls_policies_for_enhanced_profiles.sql

## Notes

- All tables use UUID primary keys for security and scalability
- Timestamps are stored in UTC with timezone information
- JSONB columns are used for flexible data storage
- Check constraints ensure data integrity for enumerated values
- RLS policies are in place to secure data access
- The schema supports a multi-role system (user, admin, webara_staff)
- **Enhanced profiles table** now serves as the single source of truth for user management, containing all Clerk authentication data
- **Clerk integration** eliminates dependency on Supabase Auth for user management
- **Admin dashboard** now uses profiles table directly instead of auth.users
- **User synchronization** is handled by the sync-clerk-users script
