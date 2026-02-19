
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Check .env.local');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Profile functions
export const getProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) throw error;
  return data;
};

export const updateProfile = async (userId: string, updates: any) => {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const getProfilesCount = async (): Promise<number> => {
  const { count, error } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true });

  if (error) return 0;
  return count || 0;
};

export const getAllProfiles = async () => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};

export const updateUserRole = async (userId: string, role: string) => {
  const { data, error } = await supabase
    .from('profiles')
    .update({ role: role })
    .eq('id', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Signal source functions
export const createSignalSource = async (type: 'url' | 'pasted_text', value: string) => {
  const { data, error } = await supabase
    .from('signal_sources')
    .insert({
      type,
      value
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const getSignalSources = async () => {
  const { data, error } = await supabase
    .from('signal_sources')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};

// Signal functions
export const getSignals = async () => {
  const { data, error } = await supabase
    .from('signals')
    .select(`
      *,
      signal_sources (*),
      ai_analysis (*)
    `)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};

export const extractSignals = async (sourceId: string) => {
  const { data, error } = await supabase.functions.invoke('extract-signals', {
    body: { source_id: sourceId }
  });

  if (error) throw error;
  return data;
};

export const analyzeSignal = async (signalId: string, analysisType: 'intent' | 'seniority' | 'outreach') => {
  const { data, error } = await supabase.functions.invoke('analyze-signal', {
    body: { signal_id: signalId, analysis_type: analysisType }
  });

  if (error) throw error;
  return data;
};

// Usage tracking
export const getMonthlySignalCount = async (): Promise<number> => {
  const { count, error } = await supabase
    .from('signals')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString());

  if (error) return 0;
  return count || 0;
};

// Total signals for current user (all-time)
export const getUserSignalCount = async (): Promise<number> => {
  const user = (await supabase.auth.getUser()).data.user;
  if (!user) return 0;

  const { count, error } = await supabase
    .from('signals')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id);

  if (error) return 0;
  return count || 0;
};

export const canCreateSignal = async (): Promise<boolean> => {
  const { data, error } = await supabase.rpc('can_create_signal', {
    user_uuid: (await supabase.auth.getUser()).data.user?.id
  });

  if (error) return false;
  return data;
};

export const canRunAIAnalysis = async (): Promise<boolean> => {
  const { data, error } = await supabase.rpc('can_run_ai_analysis', {
    user_uuid: (await supabase.auth.getUser()).data.user?.id
  });

  if (error) return false;
  return data;
};
