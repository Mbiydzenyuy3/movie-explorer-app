// Regional Content Configuration
// Supports hyper-local content prioritization for African markets
import {
  Globe,
  MapPin,
  Sparkles,
  Ghost,
  Sun,
  Clapperboard,
  BookOpen
} from "lucide-react";

export const regions = {
  // Africa
  NG: {
    code: "NG",
    name: "Nigeria",
    flag: "NG",
    language: "English",
    contentPriority: [10769, 18], // Nollywood, Drama
    color: "#00A651",
    Icon: MapPin
  },
  GH: {
    code: "GH",
    name: "Ghana",
    flag: "GH",
    language: "English",
    contentPriority: [10769, 18],
    color: "#FFDA00",
    Icon: MapPin
  },
  KE: {
    code: "KE",
    name: "Kenya",
    flag: "KE",
    language: "English",
    contentPriority: [99, 10770], // Documentary, TV Movie
    color: "#BB0000",
    Icon: MapPin
  },
  CM: {
    code: "CM",
    name: "Cameroon",
    flag: "CM",
    language: "French",
    contentPriority: [10769, 18],
    color: "#007A3D",
    Icon: MapPin
  },
  ZA: {
    code: "ZA",
    name: "South Africa",
    flag: "ZA",
    language: "English",
    contentPriority: [28, 18], // Action, Drama
    color: "#007A4B",
    Icon: MapPin
  },
  // Other markets
  US: {
    code: "US",
    name: "United States",
    flag: "US",
    language: "English",
    contentPriority: [28, 12, 18],
    color: "#3C3B6E",
    Icon: Globe
  },
  UK: {
    code: "UK",
    name: "United Kingdom",
    flag: "UK",
    language: "English",
    contentPriority: [18, 80],
    color: "#012169",
    Icon: Globe
  },
  FR: {
    code: "FR",
    name: "France",
    flag: "FR",
    language: "French",
    contentPriority: [18, 10749],
    color: "#002395",
    Icon: Globe
  }
};

// Region selector options
export const regionOptions = Object.values(regions);

// Auto-detect user region (simplified)
export const detectRegion = () => {
  // In production, use IP geolocation
  // Default to Nigeria as primary market
  return regions.NG;
};

// Get content for region
export const getRegionContent = (movies, regionCode) => {
  const region = regions[regionCode];
  if (!region) return movies;

  // Sort movies that match region priorities
  const priorityIds = region.contentPriority;

  return [...movies].sort((a, b) => {
    const aPriority = a.genre_ids
      ? priorityIds.findIndex((id) => a.genre_ids.includes(id))
      : -1;
    const bPriority = b.genre_ids
      ? priorityIds.findIndex((id) => b.genre_ids.includes(id))
      : -1;

    // Higher priority (lower index) comes first
    if (aPriority !== bPriority) {
      return aPriority - bPriority;
    }

    // Then sort by popularity
    return (b.popularity || 0) - (a.popularity || 0);
  });
};

// Aura collections (aesthetic tags)
export const auraCollections = {
  "neon-noir": {
    name: "Neon Noir",
    description: "Cyberpunk and neon-lit thrillers",
    icon: "neon",
    color: "#FF00FF",
    keywords: ["neon", "cyberpunk", "noir", "dystopian"],
    Icon: Sparkles
  },
  "sahelian-sunset": {
    name: "Sahelian Sunset",
    description: "African cinema and diaspora stories",
    icon: "sunset",
    color: "#FF6B35",
    keywords: ["african", "diaspora", "west african", "sunset"],
    Icon: Sun
  },
  "midnight-horror": {
    name: "Midnight Horror",
    description: "Creepy horror for late nights",
    icon: "horror",
    color: "#1a1a2e",
    keywords: ["horror", "supernatural", "psychological", "gothic"],
    Icon: Ghost
  },
  "feel-good": {
    name: "Feel Good",
    description: "Uplifting stories to brighten your day",
    icon: "feelgood",
    color: "#FFD93D",
    keywords: ["comedy", "romance", "feel-good", "wholesome"],
    Icon: Sun
  },
  "cinematic-epic": {
    name: "Cinematic Epic",
    description: "Grand visual spectacles",
    icon: "epic",
    color: "#6C5CE7",
    keywords: ["epic", "fantasy", "historical", "spectacular"],
    Icon: Clapperboard
  },
  "documentary-deep": {
    name: "Documentary Deep",
    description: "Eye-opening documentaries",
    icon: "doc",
    color: "#00B894",
    keywords: ["documentary", "biography", "true story", "investigation"],
    Icon: BookOpen
  }
};

export const auraOptions = Object.values(auraCollections);

export default regions;
