-- =====================================================
-- E-Place Intel Engine - Create Profiles Table Migration
-- =====================================================
-- This migration creates the 'profiles' table and sets
-- up Row Level Security policies. It is designed to
-- work with Supabase Auth.
-- =====================================================

-- =====================================================
-- 1. PROFILES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  email TEXT UNIQUE,
  name TEXT,
  company_name TEXT,
  role TEXT DEFAULT 'free' CHECK (role IN ('free', 'pro', 'enterprise', 'admin')),
  is_approved BOOLEAN DEFAULT FALSE,
  is_suspended BOOLEAN DEFAULT FALSE,
  credits INT DEFAULT 10,
  plan TEXT DEFAULT 'free' CHECK (plan IN ('free', 'starter', 'pro', 'enterprise')),
  avatar_url TEXT,
  territory TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- =====================================================
-- 2. RLS POLICIES FOR PROFILES
-- =====================================================
-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Users can see their own profile.
CREATE POLICY "Users can view their own profile."
ON public.profiles FOR SELECT
USING (auth.uid() = user_id);

-- Policy: Users can insert their own profile.
CREATE POLICY "Users can insert their own profile."
ON public.profiles FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own profile.
CREATE POLICY "Users can update their own profile."
ON public.profiles FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Policy: Admins can see all profiles.
CREATE POLICY "Admins can view all profiles."
ON public.profiles FOR SELECT
USING (
  (SELECT role FROM public.profiles WHERE user_id = auth.uid()) = 'admin'
);

-- Policy: Admins can update all profiles.
CREATE POLICY "Admins can update all profiles."
ON public.profiles FOR UPDATE
USING (
  (SELECT role FROM public.profiles WHERE user_id = auth.uid()) = 'admin'
)
WITH CHECK (
  (SELECT role FROM public.profiles WHERE user_id = auth.uid()) = 'admin'
);

-- Note: The logic in the original migration file that alters the 'profiles' table
-- is now redundant, as the columns are created here. It will not cause errors
-- because of the IF NOT EXISTS checks in the original migration.

-- =====================================================
-- 3. MIGRATION COMPLETE
-- =====================================================
-- Next Steps:
-- 1. Apply this migration. If using the Supabase CLI, run: supabase db push
-- 2. Verify 'profiles' table and RLS policies in your Supabase dashboard.
-- =====================================================
