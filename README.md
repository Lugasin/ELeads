<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# E-Place Intel Engine

A signal intelligence platform that extracts business signals from public information you provide. No scraping, no hallucination - just observable business insights.

## What It Does

**Paste public information → Extract signals → Analyze → Monitor over time → Assist outreach.**

This platform does NOT "find leads." It analyzes publicly available information you provide and extracts observable business signals for sales and business development teams.

## Architecture

**Supabase-Only Stack:**
- **Frontend**: React + TypeScript + Vite + Tailwind CSS
- **Backend**: Supabase BaaS (Auth, Database, Edge Functions)
- **AI**: Google Gemini via Supabase Edge Functions
- **Data**: User-provided URLs and text only

## Features

### Signal Extraction
- Extract business signals from pasted text or public URLs
- No hallucination - only entities explicitly present in the source
- Types: person/company observations, titles, locations, contacts

### AI Analysis
- Intent analysis (1-10 scale)
- Seniority assessment
- Outreach assistance with email drafts

### Tier-Based Usage
- **Free**: 10 signals/month
- **Pro**: 500 signals/month + AI analysis
- **Enterprise**: Unlimited + monitoring

## Compliance & Safety

> "E-Place analyzes publicly available information you provide and extracts observable business signals. We do not verify, scrape private data, or guarantee accuracy."

## Run Locally

**Prerequisites:** Node.js

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set environment variables in [.env.local](.env.local):
   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

3. Run the app:
   ```bash
   npm run dev
   ```

## Supabase Setup

1. Create a new Supabase project
2. Run the migrations in `supabase/migrations/`
3. Deploy the Edge Functions in `supabase/functions/`
4. Set the `GEMINI_API_KEY` secret in Supabase for AI functions

## Data Model

- **profiles**: User accounts with roles (free/pro/enterprise/admin)
- **signal_sources**: User-provided URLs or pasted text
- **signals**: Extracted business observations
- **ai_analysis**: AI-powered analysis of signals
