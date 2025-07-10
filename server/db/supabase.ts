import { createClient } from '@supabase/supabase-js';

// Extract Supabase project details from DATABASE_URL
const databaseUrl = process.env.DATABASE_URL || "postgresql://postgres.bxtgozydlrqaihecmrwo:Mohammed@123@aws-0-us-west-1.pooler.supabase.com:6543/postgres";

// Parse the database URL to get project details
const parseSupabaseUrl = (url: string) => {
  const match = url.match(/postgres\.([^:]+):.*@([^:]+)/);
  if (match) {
    const projectRef = match[1];
    const host = match[2];
    
    // Extract region and construct Supabase URL
    const region = host.split('.')[0]; // aws-0-us-west-1
    const supabaseUrl = `https://${projectRef}.supabase.co`;
    
    return { projectRef, supabaseUrl };
  }
  return null;
};

const supabaseDetails = parseSupabaseUrl(databaseUrl);

export const supabaseClient = supabaseDetails && process.env.SUPABASE_ANON_KEY ? createClient(
  supabaseDetails.supabaseUrl,
  process.env.SUPABASE_ANON_KEY,
  {
    auth: {
      persistSession: false // For server-side usage
    }
  }
) : null;

// Enhanced storage interface with real-time capabilities
export class SupabaseRealtimeStorage {
  async subscribeToHomeownerPitches(homeownerId: string, callback: (pitch: any) => void) {
    if (!supabaseClient) {
      console.warn('Supabase client not initialized');
      return null;
    }

    const subscription = supabaseClient
      .channel('pitches')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'pitches',
        filter: `homeowner_id=eq.${homeownerId}`
      }, (payload) => {
        callback(payload.new);
      })
      .subscribe();

    return subscription;
  }

  async getHomeownerAnalytics(homeownerId: string) {
    if (!supabaseClient) {
      console.warn('Supabase client not initialized');
      return null;
    }

    const { data, error } = await supabaseClient
      .from('pitches')
      .select('sentiment, urgency, detected_business_type, created_at')
      .eq('homeowner_id', homeownerId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching analytics:', error);
      return null;
    }

    return data;
  }

  async getSalesmanLeaderboard() {
    if (!supabaseClient) {
      console.warn('Supabase client not initialized');
      return null;
    }

    const { data, error } = await supabaseClient
      .from('salesmen')
      .select('id, first_name, last_name, business_name, total_scans')
      .order('total_scans', { ascending: false })
      .limit(10);

    if (error) {
      console.error('Error fetching leaderboard:', error);
      return null;
    }

    return data;
  }

  async getRealtimeStats() {
    if (!supabaseClient) {
      console.warn('Supabase client not initialized');
      return null;
    }

    const { data: totalHomeowners } = await supabaseClient
      .from('homeowners')
      .select('id', { count: 'exact' });

    const { data: totalPitches } = await supabaseClient
      .from('pitches')
      .select('id', { count: 'exact' });

    const { data: todayPitches } = await supabaseClient
      .from('pitches')
      .select('id', { count: 'exact' })
      .gte('created_at', new Date().toISOString().split('T')[0]);

    return {
      totalHomeowners: totalHomeowners?.length || 0,
      totalPitches: totalPitches?.length || 0,
      todayPitches: todayPitches?.length || 0
    };
  }
}

export const realtimeStorage = new SupabaseRealtimeStorage();