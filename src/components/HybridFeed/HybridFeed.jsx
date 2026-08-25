import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { Play, Clock, Film, ChevronRight, Sparkles } from "lucide-react";
import { usePopularMovies, useTrendingDaily } from "../../hooks/useQueries";
import styles from "./HybridFeed.module.css";

const HybridFeed = ({ onItemClick, title = "Discover" }) => {
  const [feedItems, setFeedItems] = useState([]);

  const { data: popularMovies, isLoading: loadingPopular } = usePopularMovies();
  const { data: trendingMovies, isLoading: loadingTrending } =
    useTrendingDaily();

  // Build hybrid feed from different content types
  useEffect(() => {
    if (!popularMovies || !trendingMovies) return;

    const items = [];

    // Add a "Spotlight" item at the top (sponsored or featured)
    if (trendingMovies?.[0]) {
      items.push({
        type: "spotlight",
        movie: trendingMovies[0],
        title: "Trending Now",
        subtitle: "Most popular today"
      });
    }

    // Mix in short-form content (short films, trailers)
    const shortContent =
      trendingMovies?.filter((m) => m.runtime && m.runtime <= 30).slice(0, 2) ||
      [];

    shortContent.forEach((movie) => {
      items.push({
        type: "short",
        movie,
        title: "Quick Watch",
        subtitle: "Under 30 mins",
        badge: "short"
      });
    });

    // Add genre-based sections
    if (popularMovies?.[1]) {
      items.push({
        type: "movie",
        movie: popularMovies[1],
        title: "Popular Pick",
        subtitle: "Everyone is watching"
      });
    }

    if (trendingMovies?.[2]) {
      items.push({
        type: "movie",
        movie: trendingMovies[2],
        title: "Trending",
        subtitle: "Hot this week"
      });
    }

    // Add more popular content
    popularMovies?.slice(3, 6).forEach((movie) => {
      items.push({
        type: "movie",
        movie,
        title: "Popular",
        subtitle: "Top rated"
      });
    });

    setFeedItems(items);
  }, [popularMovies, trendingMovies]);

  const handleItemClick = (item) => {
    if (onItemClick && item?.movie) {
      onItemClick(item.movie);
    }
  };

  const getItemIcon = (type) => {
    switch (type) {
      case "spotlight":
        return <Sparkles size={16} />;
      case "short":
        return <Clock size={16} />;
      default:
        return <Film size={16} />;
    }
  };

  if (loadingPopular || loadingTrending) {
    return (
      <div className={styles.container}>
        <div className={styles.skeleton} />
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>{title}</h2>
        <button className={styles.seeAll}>
          See All <ChevronRight size={18} />
        </button>
      </div>

      <div className={styles.feed}>
        {feedItems.map((item) => (
          <div
            key={`${item.type}-${item.movie.id}`}
            className={`${styles.card} ${styles[item.type]}`}
            onClick={() => handleItemClick(item)}
          >
            {/* Background Image */}
            <div
              className={styles.cardImage}
              style={{
                backgroundImage: item.movie.backdrop_path
                  ? `url(https://image.tmdb.org/t/p/w780${item.movie.backdrop_path})`
                  : item.movie.poster_path
                    ? `url(https://image.tmdb.org/t/p/w780${item.movie.poster_path})`
                    : "none"
              }}
            >
              <div className={styles.cardOverlay} />
            </div>

            {/* Card Content */}
            <div className={styles.cardContent}>
              {/* Type Badge */}
              <div className={styles.typeBadge}>
                {getItemIcon(item.type)}
                <span>{item.title}</span>
              </div>

              {/* Movie Info */}
              <h3 className={styles.movieTitle}>
                {item.movie.title || item.movie.name}
              </h3>
              <p className={styles.movieSubtitle}>{item.subtitle}</p>

              {/* Action */}
              <button className={styles.playBtn}>
                <Play size={18} fill='white' />
                <span>{item.type === "short" ? "Watch Now" : "Play"}</span>
              </button>
            </div>

            {/* Short Badge */}
            {item.badge && (
              <div className={styles.shortBadge}>
                <Clock size={12} />
                <span>Short</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default HybridFeed;

HybridFeed.propTypes = {
  onItemClick: PropTypes.func,
  title: PropTypes.string
};
