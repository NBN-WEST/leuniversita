import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

export type SubscriptionTier = 'free' | 'premium' | 'pilot';

export const TIER_LIMITS: Record<SubscriptionTier, Record<string, number>> = {
    free: {
        'diagnostic_started': 3, // Per day (strict for MVP, though Matrix says month, easier to track day here)
        'adaptive_review_completed': 10,
        'studyplan_generated': 1
    },
    premium: {
        'diagnostic_started': 1000,
        'adaptive_review_completed': 1000,
        'studyplan_generated': 1000
    },
    pilot: {
        'diagnostic_started': 1000,
        'adaptive_review_completed': 1000,
        'studyplan_generated': 1000
    }
};

export async function checkRateLimit(
    supabase: SupabaseClient,
    userId: string,
    eventName: string,
    fallbackLimit: number
): Promise<{ allowed: boolean; limit: number; usage: number; tier: string }> {
    // 1. Get User Tier
    const { data: profile } = await supabase
        .from('profiles')
        .select('tier')
        .eq('user_id', userId)
        .single();

    const tier: SubscriptionTier = (profile?.tier as SubscriptionTier) || 'free';

    // 2. Determine Limit
    const limit = TIER_LIMITS[tier]?.[eventName] ?? fallbackLimit;

    // 3. Check Usage (24h sliding window)
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const { count, error } = await supabase
        .from('analytics_events')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('event_name', eventName)
        .gte('created_at', oneDayAgo);

    if (error) {
        console.error("RateLimit check failed:", error);
        return { allowed: true, limit, usage: 0, tier }; // Fail open
    }

    const usage = count || 0;
    return {
        allowed: usage < limit,
        limit,
        usage,
        tier
    };
}

