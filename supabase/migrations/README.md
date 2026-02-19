# Phase 1: Database Migration Guide

## What Was Created

✅ **Migration File**: `20260108000000_signals_first.sql`

This migration creates the complete Signals-First architecture:

### Tables Created
1. **`organizations`** - Simplified entity storage (no contacts)
2. **`signals`** - PRIMARY table (time-bound business events)
3. **`signal_analysis`** - AI interpretation results
4. **`user_signal_access`** - Credit tracking & audit trail
5. **`outreach_drafts`** - User-generated outreach messages

### Features Added
- ✅ Credit system (`profiles.credits`, `profiles.plan`)
- ✅ Credit management functions
- ✅ Row Level Security (RLS) policies
- ✅ Performance indexes
- ✅ Helper views for queries

---

## How to Apply This Migration

### Option 1: Supabase CLI (Recommended)

```bash
# 1. Install Supabase CLI if not installed
npm install -g supabase

# 2. Link to your project
supabase link --project-ref your-project-ref

# 3. Apply migration
supabase db push
```

### Option 2: Supabase Dashboard

1. Go to https://supabase.com/dashboard
2. Select your project
3. Navigate to **SQL Editor**
4. Copy the entire contents of `20260108000000_signals_first.sql`
5. Paste and click **Run**

### Option 3: Direct SQL Execution

```bash
# Using psql
psql "postgresql://postgres:[password]@[host]:5432/postgres" < supabase/migrations/20260108000000_signals_first.sql
```

---

## Verification Steps

After applying the migration, run these checks:

### 1. Verify Tables Exist
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
  'organizations', 
  'signals', 
  'signal_analysis', 
  'user_signal_access', 
  'outreach_drafts'
);
```

**Expected**: 5 rows returned

### 2. Check RLS is Enabled
```sql
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('signals', 'signal_analysis', 'user_signal_access', 'outreach_drafts');
```

**Expected**: All should show `rowsecurity = true`

### 3. Verify Credit System
```sql
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'profiles' 
AND column_name IN ('credits', 'plan');
```

**Expected**: Both columns exist

### 4. Test Credit Functions
```sql
-- Test check function (replace with real user_id)
SELECT check_user_credits('your-user-id-here', 1);

-- Test decrement function
SELECT decrement_user_credits('your-user-id-here', 1);
```

---

## What Changed from Phase 0

| Phase 0 (Old) | Phase 1 (New) |
|---------------|---------------|
| `business_entities` (primary) | `signals` (primary) |
| `contacts` (embedded) | No contacts table |
| `engagement_scores` | `signal_analysis` |
| No credit system | Full credit tracking |
| No expiry logic | 30-day signal expiry |

---

## Next Steps

Once migration is applied and verified:

1. ✅ **Phase 1 Complete** - Database ready
2. ⏭️ **Phase 2** - Build FastAPI backend
3. ⏭️ **Phase 3** - Refactor frontend components
4. ⏭️ **Phase 4** - Implement monetization

---

## Rollback Plan

If you need to rollback:

```sql
-- Drop all new tables
DROP TABLE IF EXISTS outreach_drafts CASCADE;
DROP TABLE IF EXISTS user_signal_access CASCADE;
DROP TABLE IF EXISTS signal_analysis CASCADE;
DROP TABLE IF EXISTS signals CASCADE;
DROP TABLE IF EXISTS organizations CASCADE;

-- Remove credit columns from profiles
ALTER TABLE profiles DROP COLUMN IF EXISTS credits;
ALTER TABLE profiles DROP COLUMN IF EXISTS plan;

-- Drop functions
DROP FUNCTION IF EXISTS decrement_user_credits;
DROP FUNCTION IF EXISTS check_user_credits;
```

---

## Troubleshooting

### Error: "relation 'profiles' does not exist"
**Solution**: Create profiles table first or adjust migration to skip profile modifications

### Error: "permission denied"
**Solution**: Ensure you're using service_role key or have admin access

### Error: "constraint violation"
**Solution**: Check if old data conflicts with new CHECK constraints

---

## Support

If you encounter issues:
1. Check Supabase logs in dashboard
2. Verify your Supabase project is active
3. Ensure you have the correct project credentials

Ready to proceed to Phase 2?
