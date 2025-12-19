import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

export async function checkRateLimit(
    supabase: SupabaseClient,
    userId: string,
    eventName: string,
    limit: number
): Promise<boolean> {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    const { count, error } = await supabase
        .from('analytics_events')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('event_name', eventName)
        .gte('created_at', oneDayAgo);

    if (error) {
        console.error("RateLimit check failed:", error);
        return true; // Fail open (allow request) if DB error? Or fail closed? MVP: Open.
    }

    return (count || 0) < limit;
}
