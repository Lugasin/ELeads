-- =====================================================
-- E-Place Intel Engine v1 - Signals-First Migration
-- Phase 1: Database Schema
-- =====================================================
-- This migration transforms the platform from "Lead Generator" 
-- to "Signal Intelligence Platform"
-- 
-- Core Principle: Signals are PRIMARY, Organizations are DERIVED
-- =====================================================

-- =====================================================
-- 1. ORGANIZATIONS TABLE (Simplified)
-- =====================================================
CREATE TABLE IF NOT EXISTS organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  industry TEXT,
  country TEXT DEFAULT 'Zambia',
  city TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_organizations_name ON organizations(name);
CREATE INDEX idx_organizations_industry ON organizations(industry);

-- =====================================================
-- 2. SIGNALS TABLE (PRIMARY TABLE)
-- =====================================================
CREATE TABLE IF NOT EXISTS signals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Signal Classification
  signal_type TEXT NOT NULL CHECK (signal_type IN (
    'hiring',
    'expansion',
    'procurement',
    'regulation',
    'infrastructure',
    'logistics_activity',
    'technology_adoption',
    'market_entry',
    'operational_disruption'
  )),
  
  -- Signal Content
  description TEXT NOT NULL,
  source_url TEXT,
  source_excerpt TEXT,
  
  -- Confidence & Timing
  confidence_level TEXT CHECK (confidence_level IN ('low', 'medium', 'high')),
  observed_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ DEFAULT (now() + INTERVAL '30 days'),
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for performance
CREATE INDEX idx_signals_org ON signals(organization_id);
CREATE INDEX idx_signals_type ON signals(signal_type);
CREATE INDEX idx_signals_expires ON signals(expires_at);
CREATE INDEX idx_signals_confidence ON signals(confidence_level);
CREATE INDEX idx_signals_created ON signals(created_at DESC);

-- =====================================================
-- 3. SIGNAL ANALYSIS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS signal_analysis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  signal_id UUID REFERENCES signals(id) ON DELETE CASCADE UNIQUE,
  
  -- Analysis Results
  urgency_score INT CHECK (urgency_score BETWEEN 1 AND 100),
  commercial_implications JSONB DEFAULT '[]'::jsonb,
  recommended_actions JSONB DEFAULT '[]'::jsonb,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_analysis_signal ON signal_analysis(signal_id);
CREATE INDEX idx_analysis_urgency ON signal_analysis(urgency_score DESC);

-- =====================================================
-- 4. USER SIGNAL ACCESS (Credit Tracking & Audit)
-- =====================================================
CREATE TABLE IF NOT EXISTS user_signal_access (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  signal_id UUID REFERENCES signals(id) ON DELETE CASCADE,
  
  -- Action Tracking
  action_type TEXT CHECK (action_type IN ('view', 'analyze', 'draft', 'monitor')),
  
  -- Metadata
  consumed_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_user_access_user ON user_signal_access(user_id);
CREATE INDEX idx_user_access_signal ON user_signal_access(signal_id);
CREATE INDEX idx_user_access_consumed ON user_signal_access(consumed_at DESC);

-- =====================================================
-- 5. OUTREACH DRAFTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS outreach_drafts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  signal_id UUID REFERENCES signals(id) ON DELETE CASCADE,
  
  -- Draft Content
  channel TEXT CHECK (channel IN ('email', 'sms')),
  content TEXT NOT NULL,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_drafts_user ON outreach_drafts(user_id);
CREATE INDEX idx_drafts_signal ON outreach_drafts(signal_id);

-- =====================================================
-- 7. CREDIT MANAGEMENT FUNCTION
-- =====================================================
CREATE OR REPLACE FUNCTION decrement_user_credits(
  p_user_id UUID,
  p_amount INT DEFAULT 1
) RETURNS INT AS $$
DECLARE
  new_balance INT;
BEGIN
  UPDATE profiles
  SET credits = GREATEST(credits - p_amount, 0)
  WHERE user_id = p_user_id
  RETURNING credits INTO new_balance;
  
  IF new_balance IS NULL THEN
    RAISE EXCEPTION 'User not found: %', p_user_id;
  END IF;
  
  RETURN new_balance;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user has sufficient credits
CREATE OR REPLACE FUNCTION check_user_credits(
  p_user_id UUID,
  p_required INT DEFAULT 1
) RETURNS BOOLEAN AS $$
DECLARE
  current_credits INT;
BEGIN
  SELECT credits INTO current_credits
  FROM profiles
  WHERE user_id = p_user_id;
  
  RETURN current_credits >= p_required;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get current credits
CREATE OR REPLACE FUNCTION get_user_credits(
  p_user_id UUID
) RETURNS INT AS $$
DECLARE
  current_credits INT;
BEGIN
  SELECT credits INTO current_credits
  FROM profiles
  WHERE user_id = p_user_id;
  
  RETURN current_credits;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 8. ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE signals ENABLE ROW LEVEL SECURITY;
ALTER TABLE signal_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_signal_access ENABLE ROW LEVEL SECURITY;
ALTER TABLE outreach_drafts ENABLE ROW LEVEL SECURITY;

-- Signals: Users can only see signals they've accessed
CREATE POLICY "Users see accessed signals"
ON signals FOR SELECT
USING (
  id IN (
    SELECT signal_id 
    FROM user_signal_access 
    WHERE user_id = auth.uid()
  )
);

-- Signal Analysis: Users can see analysis for their signals
CREATE POLICY "Users see their signal analyses"
ON signal_analysis FOR SELECT
USING (
  signal_id IN (
    SELECT signal_id 
    FROM user_signal_access 
    WHERE user_id = auth.uid()
  )
);

-- User Signal Access: Users can only see their own access records
CREATE POLICY "Users see own access records"
ON user_signal_access FOR SELECT
USING (user_id = auth.uid());

-- Outreach Drafts: Users can only see their own drafts
CREATE POLICY "Users see own drafts"
ON outreach_drafts FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Users create own drafts"
ON outreach_drafts FOR INSERT
WITH CHECK (user_id = auth.uid());

-- =====================================================
-- 9. HELPER VIEWS
-- =====================================================

-- Active signals with analysis
CREATE OR REPLACE VIEW active_signals_with_analysis AS
SELECT 
  s.*,
  o.name as organization_name,
  o.industry as organization_industry,
  o.city as organization_city,
  sa.urgency_score,
  sa.commercial_implications,
  sa.recommended_actions,
  EXTRACT(DAY FROM (s.expires_at - now())) as days_until_expiry
FROM signals s
LEFT JOIN organizations o ON s.organization_id = o.id
LEFT JOIN signal_analysis sa ON s.id = sa.signal_id
WHERE s.expires_at > now()
ORDER BY sa.urgency_score DESC NULLS LAST, s.created_at DESC;

-- User signal summary
CREATE OR REPLACE VIEW user_signal_summary AS
SELECT 
  user_id,
  COUNT(DISTINCT signal_id) as total_signals_accessed,
  COUNT(CASE WHEN action_type = 'view' THEN 1 END) as views,
  COUNT(CASE WHEN action_type = 'analyze' THEN 1 END) as analyses,
  COUNT(CASE WHEN action_type = 'draft' THEN 1 END) as drafts,
  MAX(consumed_at) as last_activity
FROM user_signal_access
GROUP BY user_id;

-- =====================================================
-- 10. MIGRATION COMPLETE
-- =====================================================
-- This migration creates the foundation for a signals-first,
-- compliance-safe, monetizable intelligence platform.
-- 
-- Next Steps:
-- 1. Apply this migration: supabase db push
-- 2. Verify tables created
-- 3. Test RLS policies
-- 4. Proceed to Phase 2 (FastAPI Backend)
-- =====================================================
