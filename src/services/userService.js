import { useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import { supabase } from './supabaseClient';

/**
 * Hook to synchronize Clerk user data with Supabase profiles table
 */
export const useSyncUser = () => {
  const { isLoaded, isSignedIn, user } = useUser();

  useEffect(() => {
    const syncUser = async () => {
      if (isLoaded && isSignedIn && user) {
        const { error } = await supabase
          .from('profiles')
          .upsert({
            id: user.id,
            email: user.primaryEmailAddress?.emailAddress,
            full_name: user.fullName,
            avatar_url: user.imageUrl,
            updated_at: new Date().toISOString(),
          }, { onConflict: 'id' });

        if (error) {
          console.error('Error syncing user to Supabase:', error);
        }
      }
    };

    syncUser();
  }, [isLoaded, isSignedIn, user]);
};
