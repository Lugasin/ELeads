// =====================================================
// SIGNALS-FIRST TYPES (Phase 1)
// =====================================================

export type SignalType =
    | 'hiring'
    | 'expansion'
    | 'procurement'
    | 'regulation'
    | 'infrastructure'
    | 'logistics_activity'
    | 'technology_adoption'
    | 'market_entry'
    | 'operational_disruption';

export type ConfidenceLevel = 'low' | 'medium' | 'high';
export type ActionType = 'view' | 'analyze' | 'draft' | 'monitor';
export type Channel = 'email' | 'sms';
export type Plan = 'free' | 'starter' | 'pro' | 'enterprise';

export interface Organization {
    id: string;
    name: string;
    industry?: string;
    country: string;
    city?: string;
    created_at: string;
    updated_at: string;
}

export interface Signal {
    id: string;
    organization_id: string;
    signal_type: SignalType;
    description: string;
    source_url?: string;
    source_excerpt?: string;
    confidence_level: ConfidenceLevel;
    observed_at?: string;
    expires_at: string;
    created_at: string;
    updated_at: string;

    // Joined data
    organization?: Organization;
    analysis?: SignalAnalysis;
}

export interface SignalAnalysis {
    id: string;
    signal_id: string;
    urgency_score: number; // 1-100
    commercial_implications: string[];
    recommended_actions: string[];
    created_at: string;
    updated_at: string;
}

export interface UserSignalAccess {
    id: string;
    user_id: string;
    signal_id: string;
    action_type: ActionType;
    consumed_at: string;
}

export interface OutreachDraft {
    id: string;
    user_id: string;
    signal_id: string;
    channel: Channel;
    content: string;
    created_at: string;
    updated_at: string;
}

export interface UserProfile extends User {
    credits: number;
    plan: Plan;
}

// API Request/Response Types
export interface SignalIngestRequest {
    source_type: 'url' | 'text' | 'upload';
    content: string;
    user_id: string;
}

export interface SignalIngestResponse {
    status: 'success' | 'no_signals' | 'error';
    signals_extracted?: number;
    signals?: Signal[];
    message?: string;
}

export interface SignalFeedResponse {
    signals: Signal[];
    total: number;
    has_more: boolean;
}
