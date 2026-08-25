import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Standard public client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Creates an authenticated Supabase client using a Clerk JWT
 */
export const getSupabaseClient = (supabaseAccessToken) => {
  return createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${supabaseAccessToken}`,
      },
    },
  });
};
