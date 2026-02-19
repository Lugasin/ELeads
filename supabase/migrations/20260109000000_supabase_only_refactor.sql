-- =====================================================
-- E-Place Intel Engine: Supabase-Only Refactor
-- Migration: 20260109000000_supabase_only_refactor.sql
-- =====================================================
-- This migration transforms the platform to Supabase BaaS only,
-- removing FastAPI and implementing signals-first architecture
-- with strict RLS and tier-based access control.
-- =====================================================

-- =====================================================
-- 0. CLEANUP: Drop old tables and policies
-- =====================================================
DROP TABLE IF EXISTS ai_analysis CASCADE;
DROP TABLE IF EXISTS signal_snapshots CASCADE;
DROP TABLE IF EXISTS signals CASCADE;
DROP TABLE IF EXISTS signal_sources CASCADE;

-- Drop old policies that depend on user_id column
DROP POLICY IF EXISTS "Users can view their own profile." ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile." ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile." ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles." ON profiles;
DROP POLICY IF EXISTS "Admins can update all profiles." ON profiles;

-- =====================================================
-- 1. PROFILES TABLE (Recreate)
-- =====================================================
-- Since we can't modify the existing table due to dependencies,
-- we'll recreate it with the new schema
CREATE TABLE IF NOT EXISTS profiles_new (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'free' CHECK (role IN ('free', 'pro', 'enterprise', 'admin')),
  company_name TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Copy data from old table (only keep id and company_name if they exist)
INSERT INTO profiles_new (id, company_name, created_at)
SELECT
  CASE
    WHEN user_id IS NOT NULL THEN user_id
    ELSE id
  END as id,
  company_name,
  created_at
FROM profiles
ON CONFLICT (id) DO NOTHING;

-- Drop old table and rename new one
DROP TABLE profiles CASCADE;
ALTER TABLE profiles_new RENAME TO profiles;

-- Recreate indexes
CREATE INDEX IF NOT EXISTS idx_profiles_id ON profiles(id);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create new policies
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- =====================================================
-- 2. SIGNAL_SOURCES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS signal_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('url', 'pasted_text')),
  value TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_signal_sources_user_id ON signal_sources(user_id);
CREATE INDEX IF NOT EXISTS idx_signal_sources_type ON signal_sources(type);

-- RLS
ALTER TABLE signal_sources ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own sources" ON signal_sources FOR ALL USING (auth.uid() = user_id);

-- =====================================================
-- 3. SIGNALS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS signals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  source_id UUID REFERENCES signal_sources(id) ON DELETE CASCADE,
  entity_name TEXT,
  entity_type TEXT CHECK (entity_type IN ('person', 'company')),
  observed_title TEXT,
  observed_company TEXT,
  observed_location TEXT,
  observed_contact TEXT,
  source_excerpt TEXT,
  source_url TEXT,
  observed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_signals_user_id ON signals(user_id);
CREATE INDEX IF NOT EXISTS idx_signals_source_id ON signals(source_id);
CREATE INDEX IF NOT EXISTS idx_signals_entity_type ON signals(entity_type);
CREATE INDEX IF NOT EXISTS idx_signals_observed_company ON signals(observed_company);

-- RLS
ALTER TABLE signals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own signals" ON signals FOR ALL USING (auth.uid() = user_id);

-- =====================================================
-- 4. SIGNAL_SNAPSHOTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS signal_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  signal_id UUID REFERENCES signals(id) ON DELETE CASCADE,
  hash TEXT NOT NULL,
  captured_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_signal_snapshots_signal_id ON signal_snapshots(signal_id);

-- RLS (inherited through signal ownership)
ALTER TABLE signal_snapshots ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own snapshots" ON signal_snapshots FOR ALL USING (
  EXISTS (SELECT 1 FROM signals WHERE signals.id = signal_snapshots.signal_id AND signals.user_id = auth.uid())
);

-- =====================================================
-- 5. AI_ANALYSIS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS ai_analysis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  signal_id UUID REFERENCES signals(id) ON DELETE CASCADE,
  analysis_type TEXT NOT NULL CHECK (analysis_type IN ('intent', 'seniority', 'outreach')),
  content JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_ai_analysis_signal_id ON ai_analysis(signal_id);
CREATE INDEX IF NOT EXISTS idx_ai_analysis_type ON ai_analysis(analysis_type);

-- RLS (inherited through signal ownership)
ALTER TABLE ai_analysis ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own analysis" ON ai_analysis FOR ALL USING (
  EXISTS (SELECT 1 FROM signals WHERE signals.id = ai_analysis.signal_id AND signals.user_id = auth.uid())
);

-- =====================================================
-- 6. USAGE TRACKING FUNCTIONS
-- =====================================================

-- Function to get user's current signal count for this month
CREATE OR REPLACE FUNCTION get_monthly_signal_count(user_uuid UUID)
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)
    FROM signals
    WHERE user_id = user_uuid
    AND DATE_TRUNC('month', created_at) = DATE_TRUNC('month', CURRENT_TIMESTAMP)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user can create more signals
CREATE OR REPLACE FUNCTION can_create_signal(user_uuid UUID)
RETURNS BOOLEAN AS $$
DECLARE
  user_role TEXT;
  signal_count INTEGER;
BEGIN
  -- Get user role
  SELECT role INTO user_role FROM profiles WHERE id = user_uuid;

  -- Get user's total signal count (all-time)
  SELECT COUNT(*) INTO signal_count FROM signals WHERE user_id = user_uuid;

  -- Check limits based on role (total signals)
  CASE user_role
    WHEN 'free' THEN RETURN signal_count < 20;
    WHEN 'pro' THEN RETURN signal_count < 1000;
    WHEN 'enterprise' THEN RETURN TRUE;
    WHEN 'admin' THEN RETURN TRUE;
    ELSE RETURN FALSE;
  END CASE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user can run AI analysis
CREATE OR REPLACE FUNCTION can_run_ai_analysis(user_uuid UUID)
RETURNS BOOLEAN AS $$
DECLARE
  user_role TEXT;
BEGIN
  SELECT role INTO user_role FROM profiles WHERE id = user_uuid;

  RETURN user_role IN ('pro', 'enterprise', 'admin');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 7. TRIGGERS FOR USAGE ENFORCEMENT
-- =====================================================

-- Trigger to enforce signal creation limits
CREATE OR REPLACE FUNCTION enforce_signal_limits()
RETURNS TRIGGER AS $$
BEGIN
  IF NOT can_create_signal(NEW.user_id) THEN
    RAISE EXCEPTION 'Signal creation limit exceeded for your plan';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_enforce_signal_limits ON signals;
CREATE TRIGGER trigger_enforce_signal_limits
  BEFORE INSERT ON signals
  FOR EACH ROW EXECUTE FUNCTION enforce_signal_limits();