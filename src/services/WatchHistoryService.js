import { getSupabaseClient } from './supabaseClient';

/**
 * Watch History Service - Persists and retrieves movie/series progress in Supabase
 * Handles "Smart-Resume" functionality
 */
const WatchHistoryService = {
  /**
   * Records or updates watch progress for a user
   */
  async updateProgress(clerkToken, userId, movie, progressSeconds, durationSeconds) {
    if (!clerkToken || !userId || !movie?.id) return null;

    const supabase = getSupabaseClient(clerkToken);
    
    const { data, error } = await supabase
      .from('watch_history')
      .upsert({
        user_id: userId,
        movie_id: movie.id,
        title: movie.title || movie.name,
        poster_path: movie.poster_path,
        backdrop_path: movie.backdrop_path,
        progress_seconds: Math.floor(progressSeconds),
        duration_seconds: Math.floor(durationSeconds),
        updated_at: new Date().toISOString(),
        is_completed: progressSeconds >= durationSeconds * 0.95 // Mark as completed at 95%
      }, { onConflict: 'user_id,movie_id' });

    if (error) {
      console.error('Error updating watch history:', error);
      return null;
    }
    return data;
  },

  /**
   * Fetches the latest watch history for a user
   */
  async getRecentHistory(clerkToken, userId, limit = 10) {
    if (!clerkToken || !userId) return [];

    const supabase = getSupabaseClient(clerkToken);
    
    const { data, error } = await supabase
      .from('watch_history')
      .select('*')
      .eq('user_id', userId)
      .eq('is_completed', false)
      .order('updated_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching watch history:', error);
      return [];
    }
    return data;
  },

  /**
   * Removes a movie from watch history
   */
  async deleteEntry(clerkToken, userId, movieId) {
    if (!clerkToken || !userId) return;

    const supabase = getSupabaseClient(clerkToken);
    const { error } = await supabase
      .from('watch_history')
      .delete()
      .eq('user_id', userId)
      .eq('movie_id', movieId);

    if (error) console.error('Error deleting watch history entry:', error);
  }
};

export default WatchHistoryService;
