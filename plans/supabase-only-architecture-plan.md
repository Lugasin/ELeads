# E-Place Intel Engine: Supabase-Only Architecture Plan

## Overview
Refactoring from FastAPI + React to Supabase BaaS only, with Edge Functions for AI processing. Focus on signals-first data model with strict no-hallucination policies.

## Data Model

### 1. profiles
```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'free' CHECK (role IN ('free', 'pro', 'enterprise', 'admin')),
  company_name TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS Policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
```

### 2. signal_sources
```sql
CREATE TABLE signal_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT CHECK (type IN ('url', 'pasted_text')),
  value TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS: Users can only access their own sources
CREATE POLICY "Users manage own sources" ON signal_sources FOR ALL USING (auth.uid() = user_id);
```

### 3. signals
```sql
CREATE TABLE signals (
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

-- RLS: Users can only access their own signals
CREATE POLICY "Users manage own signals" ON signals FOR ALL USING (auth.uid() = user_id);
```

### 4. signal_snapshots
```sql
CREATE TABLE signal_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  signal_id UUID REFERENCES signals(id) ON DELETE CASCADE,
  hash TEXT NOT NULL,
  captured_at TIMESTAMPTZ DEFAULT now()
);

-- RLS inherited through signal ownership
CREATE POLICY "Users manage own snapshots" ON signal_snapshots FOR ALL USING (
  EXISTS (SELECT 1 FROM signals WHERE signals.id = signal_snapshots.signal_id AND signals.user_id = auth.uid())
);
```

### 5. ai_analysis
```sql
CREATE TABLE ai_analysis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  signal_id UUID REFERENCES signals(id) ON DELETE CASCADE,
  analysis_type TEXT CHECK (analysis_type IN ('intent', 'seniority', 'outreach')),
  content JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS inherited through signal ownership
CREATE POLICY "Users manage own analysis" ON ai_analysis FOR ALL USING (
  EXISTS (SELECT 1 FROM signals WHERE signals.id = ai_analysis.signal_id AND signals.user_id = auth.uid())
);
```

## Tier Limits
- Free: 10 signals/month
- Pro: 500 signals/month + AI analysis
- Enterprise: Unlimited + monitoring

Enforced via:
- Database triggers
- Edge Functions
- RLS policies with subqueries

## Supabase Edge Functions

### extract-signals
- Input: source_id
- Process: Fetch source content, extract signals using Gemini
- Output: Insert signals, return count
- Cost: 1 credit per successful extraction

### analyze-signal
- Input: signal_id, analysis_type
- Process: Run Gemini analysis based on type
- Output: Insert ai_analysis record

### check-limits
- Input: user_id, action_type
- Output: boolean (allowed/not allowed)

## Frontend Changes

### Services Refactor
- Remove all FastAPI calls
- Use Supabase client for data operations
- Use `supabase.functions.invoke()` for Edge Functions

### UI Terminology Update
- "Leads" → "Signals"
- "Verified" → "Observed"
- "Intelligence Found" → "Public Mentions"

### Components Update
- ScraperForm → SourceInputForm
- LeadTable → SignalTable
- LeadDetail → SignalDetail

## Migration Strategy

1. Create new migrations for schema
2. Migrate existing data where possible
3. Update frontend incrementally
4. Remove backend/ directory
5. Update package.json to remove unused deps

## Compliance & Safety
- Only process user-provided content
- No scraping or external data collection
- Clear disclaimers about public information only
- No verification claims