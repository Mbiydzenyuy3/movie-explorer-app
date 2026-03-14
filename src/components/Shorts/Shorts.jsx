import { useState, useRef } from "react";
import PropTypes from "prop-types";
import { Play, ChevronLeft, ChevronRight, Tv } from "lucide-react";
import styles from "./Shorts.module.css";
import VerticalShortsPlayer from "./VerticalShortsPlayer";

export default function Shorts({
  title = "Short Dramas",
  seriesList = [],
  onSeriesClick,
  IMAGE_PATH,
  apiKey,
  baseUrl
}) {
  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // Player state
  const [selectedSeries, setSelectedSeries] = useState(null);
  const [episodes, setEpisodes] = useState([]);
  const [currentEpisodeIndex, setCurrentEpisodeIndex] = useState(0);
  const [isPlayerOpen, setIsPlayerOpen] = useState(false);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = 300;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth"
      });
    }
  };

  const handleScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  // Fetch episodes for a series when clicked
  const handleSeriesClick = async (series) => {
    setSelectedSeries(series);

    // Call the external onSeriesClick callback if provided
    if (onSeriesClick) {
      onSeriesClick(series);
    }

    // Fetch TV series details to get episodes
    try {
      const seasonNumber = 1; // Start with first season
      const response = await fetch(
        `${baseUrl}/tv/${series.id}/season/${seasonNumber}?api_key=${apiKey}`
      );
      const data = await response.json();

      if (data.episodes && data.episodes.length > 0) {
        // Transform episodes for the player
        const formattedEpisodes = data.episodes.map((ep) => ({
          id: ep.id,
          name: ep.name,
          overview: ep.overview,
          still_path: ep.still_path,
          episode_number: ep.episode_number,
          runtime: ep.runtime,
          // We'll use the embed URL pattern for episodes
          videoUrl: `https://vidsrc.rip/tv/${series.id}/${seasonNumber}/${ep.episode_number}`
        }));

        setEpisodes(formattedEpisodes);
        setCurrentEpisodeIndex(0);
        setIsPlayerOpen(true);
      }
    } catch (error) {
      console.error("Error fetching episodes:", error);
    }
  };

  const handleClosePlayer = () => {
    setIsPlayerOpen(false);
    setSelectedSeries(null);
    setEpisodes([]);
    setCurrentEpisodeIndex(0);
  };

  const handleEpisodeChange = (index) => {
    setCurrentEpisodeIndex(index);
  };

  // Get video URL for episode
  const getVideoUrl = (episode) => {
    if (selectedSeries && episode) {
      return `https://vidsrc.rip/tv/${selectedSeries.id}/1/${episode.episode_number}`;
    }
    return null;
  };

  return (
    <>
      <div className={styles.shortsContainer}>
        <div className={styles.header}>
          <h2 className={styles.title}>{title}</h2>
          <span className={styles.subtitle}>Short Drama Series</span>
        </div>

        <div className={styles.wrapper}>
          {canScrollLeft && (
            <button
              className={`${styles.navBtn} ${styles.leftBtn}`}
              onClick={() => scroll("left")}
            >
              <ChevronLeft size={24} />
            </button>
          )}

          <div
            className={styles.scrollContainer}
            ref={scrollRef}
            onScroll={handleScroll}
          >
            {seriesList.map((series) => (
              <div
                key={series.id}
                className={styles.shortCard}
                onClick={() => handleSeriesClick(series)}
              >
                <div className={styles.thumbnail}>
                  {series.poster_path ? (
                    <img
                      src={`${IMAGE_PATH}${series.poster_path}`}
                      alt={series.name}
                      className={styles.thumbnailImg}
                    />
                  ) : (
                    <div className={styles.placeholder}>
                      <Tv size={48} />
                    </div>
                  )}
                  <div className={styles.playOverlay}>
                    <div className={styles.playBtn}>
                      <Play size={20} fill='white' />
                    </div>
                  </div>
                  <div className={styles.badges}>
                    {series.vote_average && (
                      <span className={styles.rating}>
                        ⭐ {series.vote_average.toFixed(1)}
                      </span>
                    )}
                  </div>
                </div>
                <div className={styles.info}>
                  <h3 className={styles.seriesTitle}>{series.name}</h3>
                  <p className={styles.overview}>
                    {series.overview?.substring(0, 50)}...
                  </p>
                  <div className={styles.meta}>
                    <span className={styles.episodeCount}>
                      {series.number_of_episodes || "New"} Episodes
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {canScrollRight && (
            <button
              className={`${styles.navBtn} ${styles.rightBtn}`}
              onClick={() => scroll("right")}
            >
              <ChevronRight size={24} />
            </button>
          )}
        </div>
      </div>

      {/* Vertical Shorts Player - DramaBox Style */}
      {isPlayerOpen && selectedSeries && (
        <VerticalShortsPlayer
          series={selectedSeries}
          episodes={episodes}
          currentEpisodeIndex={currentEpisodeIndex}
          onClose={handleClosePlayer}
          onEpisodeChange={handleEpisodeChange}
          getVideoUrl={getVideoUrl}
          IMAGE_PATH={IMAGE_PATH}
        />
      )}
    </>
  );
}

Shorts.propTypes = {
  title: PropTypes.string,
  seriesList: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      name: PropTypes.string,
      overview: PropTypes.string,
      poster_path: PropTypes.string,
      vote_average: PropTypes.number,
      number_of_episodes: PropTypes.number
    })
  ).isRequired,
  onSeriesClick: PropTypes.func,
  IMAGE_PATH: PropTypes.string.isRequired,
  apiKey: PropTypes.string,
  baseUrl: PropTypes.string
};

Shorts.defaultProps = {
  title: "Short Dramas",
  seriesList: [],
  onSeriesClick: undefined,
  IMAGE_PATH: "https://image.tmdb.org/t/p/w500",
  apiKey: "",
  baseUrl: "https://api.themoviedb.org/3"
};
