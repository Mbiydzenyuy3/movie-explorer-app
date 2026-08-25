// Mood Configuration for the Discovery Engine
// Maps user moods to content characteristics

export const moodConfig = {
  energetic: {
    label: 'Energetic',
    emoji: '⚡',
    description: 'High energy, fast-paced action',
    genres: [28, 12, 53], // Action, Adventure, Thriller
    keywords: ['action', 'explosive', 'fast-paced', 'adrenaline'],
    color: '#FF6B35',
    timeMultiplier: 1.0,
  },
  relaxed: {
    label: 'Relaxed',
    emoji: '🌿',
    description: 'Calm, easy-going content',
    genres: [35, 10749, 16], // Comedy, Romance, Animation
    keywords: ['feel-good', 'lighthearted', 'comedy', 'wholesome'],
    color: '#4ECDC4',
    timeMultiplier: 1.2,
  },
  tense: {
    label: 'Intense',
    emoji: '🎭',
    description: 'Gripping drama and suspense',
    genres: [18, 53, 80], // Drama, Thriller, Crime
    keywords: ['suspenseful', 'dramatic', 'psychological', 'dark'],
    color: '#2C3E50',
    timeMultiplier: 1.0,
  },
  adventurous: {
    label: 'Adventurous',
    emoji: '🗺️',
    description: 'Journey and discovery',
    genres: [12, 14, 10759], // Adventure, Fantasy, Action & Adventure
    keywords: ['adventure', 'journey', 'epic', 'fantasy'],
    color: '#9B59B6',
    timeMultiplier: 1.0,
  },
  nostalgic: {
    label: 'Nostalgic',
    emoji: '📼',
    description: 'Classic and vintage vibes',
    genres: [36, 10770, 10402], // History, TV Movie, Music
    keywords: ['classic', 'nostalgic', 'retro', 'vintage'],
    color: '#E74C3C',
    timeMultiplier: 1.0,
  },
  curious: {
    label: 'Curious',
    emoji: '🔍',
    description: 'Mystery and exploration',
    genres: [9648, 99, 10770], // Mystery, Documentary, TV Movie
    keywords: ['mystery', 'documentary', 'investigation', 'educational'],
    color: '#3498DB',
    timeMultiplier: 1.0,
  },
  romantic: {
    label: 'Romantic',
    emoji: '💕',
    description: 'Love and romance',
    genres: [10749, 35], // Romance, Comedy
    keywords: ['romance', 'love story', 'romantic comedy', 'heartwarming'],
    color: '#E91E63',
    timeMultiplier: 1.0,
  },
  dark: {
    label: 'Dark',
    emoji: '🌑',
    description: 'Dark and gritty content',
    genres: [27, 53, 80], // Horror, Thriller, Crime
    keywords: ['horror', 'dark', 'gritty', 'psychological thriller'],
    color: '#1a1a2e',
    timeMultiplier: 1.0,
  },
};

// Time availability options
export const timeOptions = [
  { value: 30, label: '30 mins', shortLabel: '30m' },
  { value: 45, label: '45 mins', shortLabel: '45m' },
  { value: 60, label: '1 hour', shortLabel: '1h' },
  { value: 90, label: '1.5 hours', shortLabel: '1.5h' },
  { value: 120, label: '2 hours', shortLabel: '2h' },
  { value: 0, label: 'Any length', shortLabel: 'Any' },
];

// Energy levels for the dual-slider UI
export const energyLevels = [
  { value: 'low', label: 'Low Energy', description: 'Tired, want something easy' },
  { value: 'medium', label: 'Medium', description: 'Balanced mood' },
  { value: 'high', label: 'High Energy', description: 'Want something exciting' },
];

// Get mood from energy level
export const getMoodFromEnergy = (energy) => {
  const moodMap = {
    low: 'relaxed',
    medium: 'curious',
    high: 'energetic',
  };
  return moodMap[energy] || 'relaxed';
};

// Get movies filtered by mood and time
export const filterByMood = (movies, mood, maxMinutes) => {
  if (!movies || !mood) return movies;
  
  const config = moodConfig[mood];
  if (!config) return movies;

  let filtered = movies.filter(movie => {
    // Filter by genre
    if (movie.genre_ids) {
      const hasGenre = movie.genre_ids.some(genreId => 
        config.genres.includes(genreId)
      );
      if (!hasGenre) return false;
    }
    
    // Filter by runtime
    if (maxMinutes > 0 && movie.runtime) {
      return movie.runtime <= maxMinutes * config.timeMultiplier;
    }
    
    return true;
  });

  return filtered;
};

export default moodConfig;
