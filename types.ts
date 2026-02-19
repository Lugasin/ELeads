export type UserRole = 'free' | 'pro' | 'enterprise' | 'admin';

// Signal Source Types - User-provided input
export interface SignalSource {
  id: string;
  user_id: string;
  type: 'url' | 'pasted_text';
  value: string;
  created_at: string;
}

// Signal Types - Extracted observations
export interface Signal {
  id: string;
  user_id: string;
  source_id: string;
  entity_name?: string;
  entity_type?: 'person' | 'company';
  observed_title?: string;
  observed_company?: string;
  observed_location?: string;
  observed_contact?: string;
  source_excerpt?: string;
  source_url?: string;
  observed_at?: string;
  created_at: string;

  // Relations
  signal_sources?: SignalSource;
  ai_analysis?: AIAnalysis[];
  signal_snapshots?: SignalSnapshot[];
}

// Signal Snapshot - Captures point-in-time state for change detection
export interface SignalSnapshot {
  id: string;
  signal_id: string;
  hash: string; // Hash of signal data to detect changes
  captured_at: string;
}

// AI Analysis Types - Optional interpretation
export interface AIAnalysis {
  id: string;
  signal_id: string;
  analysis_type: 'intent' | 'seniority' | 'outreach';
  content: any; // JSON content from AI
  created_at: string;
}

// User Profile
export interface User {
  id: string;
  email: string;
  role: UserRole;
  company_name?: string;
  name?: string;
  avatar_url?: string;
  created_at?: string;
}

// Role Permissions - Based on capacity + continuity
export const ROLE_PERMISSIONS = {
  free: {
    maxSignalsPerMonth: 20,
    canRunAIAnalysis: false,
    canExport: false,
    canMonitorChanges: false,
  },
  pro: {
    maxSignalsPerMonth: 1000,
    canRunAIAnalysis: true,
    canExport: true,
    canMonitorChanges: true,
  },
  enterprise: {
    maxSignalsPerMonth: -1, // unlimited
    canRunAIAnalysis: true,
    canExport: true,
    canMonitorChanges: true,
  },
  admin: {
    maxSignalsPerMonth: -1, // unlimited
    canRunAIAnalysis: true,
    canExport: true,
    canMonitorChanges: true,
  }
};