import { supabase } from '@/utils/supabase/client';

export function getSupabaseBrowserClient() {
    return supabase;
}
