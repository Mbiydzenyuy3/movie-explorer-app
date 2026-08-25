import { useEffect } from 'react';
import { useUser, useAuth } from '@clerk/clerk-react';
import { getSupabaseClient } from './supabaseClient';

/**
 * Synchronises the Clerk user into the Supabase `profiles` table.
 *
 * Uses the Clerk-authenticated client, not the bare anon client: Row Level
 * Security identifies the caller from the JWT's `sub` claim, so an anon-key
 * write has no identity and is rejected once policies are enabled.
 *
 * `id` holds the Clerk user id (e.g. "user_2ab…"), which is what the RLS
 * policies in supabase/policies.sql match against.
 */
export const useSyncUser = () => {
  const { isLoaded, isSignedIn, user } = useUser();
  const { getToken } = useAuth();

  useEffect(() => {
    if (!isLoaded || !isSignedIn || !user) return;

    let cancelled = false;

    const syncUser = async () => {
      try {
        const token = await getToken();
        if (!token || cancelled) return;

        const supabase = getSupabaseClient(token);

        const { error } = await supabase.from('profiles').upsert(
          {
            id: user.id,
            email: user.primaryEmailAddress?.emailAddress,
            full_name: user.fullName,
            avatar_url: user.imageUrl,
            updated_at: new Date().toISOString()
          },
          { onConflict: 'id' }
        );

        if (error) console.error('Error syncing user to Supabase:', error);
      } catch (err) {
        console.error('Error syncing user to Supabase:', err);
      }
    };

    syncUser();

    return () => {
      cancelled = true;
    };
  }, [isLoaded, isSignedIn, user, getToken]);
};
