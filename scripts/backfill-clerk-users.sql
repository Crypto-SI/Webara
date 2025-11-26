-- SQL script to backfill missing Clerk users in Supabase
-- This script inserts/updates Clerk users into the profiles table

-- Example: Check if a specific Clerk user exists
-- Replace 'user_123' with the actual Clerk user ID you want to check
SELECT * FROM profiles WHERE user_id = 'user_123' OR id = 'user_123';

-- Example: Insert/upsert a single Clerk user
-- Replace the values with actual Clerk user data
INSERT INTO profiles (
    id, 
    user_id, 
    email, 
    full_name, 
    first_name, 
    last_name, 
    avatar_url, 
    role, 
    email_verified,
    clerk_created_at,
    clerk_last_sign_in_at,
    public_metadata,
    private_metadata,
    unsafe_metadata,
    clerk_user_id,
    created_at, 
    updated_at
) 
VALUES (
    'user_123',  -- Clerk user ID (use as both id and user_id for consistency)
    'user_123',  -- Clerk user ID
    'user@example.com',  -- Email from Clerk
    'Full Name',  -- Full name
    'First',  -- First name
    'Last',  -- Last name
    null,  -- Avatar URL
    'user',  -- Role (user, admin, webara_staff)
    true,  -- Email verified status
    '2025-01-01T00:00:00Z',  -- Clerk created_at
    '2025-01-01T00:00:00Z',  -- Clerk last_sign_in_at
    '{}',  -- Public metadata
    '{}',  -- Private metadata
    '{}',  -- Unsafe metadata
    'user_123',  -- Clerk user ID (duplicate field)
    now(),  -- created_at
    now()   -- updated_at
) 
ON CONFLICT (id) DO UPDATE 
SET 
    user_id = excluded.user_id,
    email = excluded.email,
    full_name = excluded.full_name,
    first_name = excluded.first_name,
    last_name = excluded.last_name,
    avatar_url = excluded.avatar_url,
    role = excluded.role,
    email_verified = excluded.email_verified,
    clerk_created_at = excluded.clerk_created_at,
    clerk_last_sign_in_at = excluded.clerk_last_sign_in_at,
    public_metadata = excluded.public_metadata,
    private_metadata = excluded.private_metadata,
    unsafe_metadata = excluded.unsafe_metadata,
    clerk_user_id = excluded.clerk_user_id,
    updated_at = now();

-- Example: Insert multiple users at once
INSERT INTO profiles (
    id, 
    user_id, 
    email, 
    full_name, 
    first_name, 
    last_name, 
    avatar_url, 
    role, 
    email_verified,
    clerk_created_at,
    clerk_last_sign_in_at,
    public_metadata,
    private_metadata,
    unsafe_metadata,
    clerk_user_id,
    created_at, 
    updated_at
) 
VALUES 
    (
        'user_456', 
        'user_456', 
        'another@example.com', 
        'Another User', 
        'Another', 
        'User', 
        null, 
        'user', 
        true, 
        '2025-01-01T00:00:00Z', 
        '2025-01-01T00:00:00Z', 
        '{}', 
        '{}', 
        '{}', 
        'user_456', 
        now(), 
        now()
    ),
    (
        'user_789', 
        'user_789', 
        'admin@example.com', 
        'Admin User', 
        'Admin', 
        'User', 
        null, 
        'admin', 
        true, 
        '2025-01-01T00:00:00Z', 
        '2025-01-01T00:00:00Z', 
        '{"role": "admin"}', 
        '{}', 
        '{}', 
        'user_789', 
        now(), 
        now()
    )
ON CONFLICT (id) DO UPDATE 
SET 
    user_id = excluded.user_id,
    email = excluded.email,
    full_name = excluded.full_name,
    first_name = excluded.first_name,
    last_name = excluded.last_name,
    avatar_url = excluded.avatar_url,
    role = excluded.role,
    email_verified = excluded.email_verified,
    clerk_created_at = excluded.clerk_created_at,
    clerk_last_sign_in_at = excluded.clerk_last_sign_in_at,
    public_metadata = excluded.public_metadata,
    private_metadata = excluded.private_metadata,
    unsafe_metadata = excluded.unsafe_metadata,
    clerk_user_id = excluded.clerk_user_id,
    updated_at = now();

-- Query to check all current profiles
SELECT 
    id,
    user_id, 
    email, 
    full_name, 
    role, 
    email_verified,
    created_at,
    updated_at
FROM profiles 
ORDER BY created_at DESC;

-- Query to find profiles that might need updating (missing email or full_name)
SELECT 
    id,
    user_id, 
    email, 
    full_name, 
    role,
    email_verified
FROM profiles 
WHERE email IS NULL OR full_name IS NULL OR email_verified = false
ORDER BY created_at DESC;