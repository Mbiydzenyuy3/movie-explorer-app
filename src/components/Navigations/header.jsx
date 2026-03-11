import { Link, useNavigate } from "react-router";
import { useState, useRef, useEffect } from "react";
import {
  Menu,
  X,
  Search,
  User,
  Bell,
  Home,
  Film,
  Tv,
  TrendingUp,
  Layers,
  Loader2
} from "lucide-react";
import styles from "./header.module.css";

export default function Header() {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const searchRef = useRef(null);

  // Sample suggestions for immediate display
  const quickSuggestions = [
    { id: 1, title: "Action Movies", query: "action", type: "genre" },
    { id: 2, title: "Comedy", query: "comedy", type: "genre" },
    { id: 3, title: "Thriller", query: "thriller", type: "genre" },
    { id: 4, title: "Romance", query: "romance", type: "genre" },
    { id: 5, title: "Sci-Fi", query: "sci-fi", type: "genre" },
    { id: 6, title: "Horror", query: "horror", type: "genre" },
    { id: 7, title: "Nigerian Movies", query: "Nigerian", type: "region" },
    { id: 8, title: "Korean Dramas", query: "korean", type: "region" },
    { id: 9, title: "Hollywood", query: "hollywood", type: "region" },
    { id: 10, title: "Bollywood", query: "bollywood", type: "region" },
    { id: 11, title: "Top Rated", query: "top rated", type: "category" },
    { id: 12, title: "New Releases", query: "new releases", type: "category" }
  ];

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  // Handle search input with immediate suggestions
  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (query.length >= 2) {
      // Filter suggestions based on input
      const filtered = quickSuggestions
        .filter(
          (s) =>
            s.title.toLowerCase().includes(query.toLowerCase()) ||
            s.query.toLowerCase().includes(query.toLowerCase())
        )
        .slice(0, 6);
      setSuggestions(filtered);
    } else {
      setSuggestions([]);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?query=${searchQuery}`);
      setIsSearchOpen(false);
      setSearchQuery("");
      setSuggestions([]);
    }
  };

  const handleSuggestionClick = (query) => {
    navigate(`/search?query=${query}`);
    setIsSearchOpen(false);
    setSearchQuery("");
    setSuggestions([]);
  };

  // Close search when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsSearchOpen(false);
        setSuggestions([]);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        {/* Logo - Left */}
        <Link to='/' className={styles.logo} onClick={closeMenu}>
          <span className={styles.logoText}>VibeBox</span>
        </Link>

        {/* Desktop Navigation - Center */}
        <nav className={styles.nav}>
          <Link to='/' className={styles.navLink} onClick={closeMenu}>
            <Home size={18} />
            <span>Home</span>
          </Link>
          <Link to='/movies' className={styles.navLink} onClick={closeMenu}>
            <Film size={18} />
            <span>Movies</span>
          </Link>
          <Link to='/series' className={styles.navLink} onClick={closeMenu}>
            <Tv size={18} />
            <span>Series</span>
          </Link>
          <Link to='/trending' className={styles.navLink} onClick={closeMenu}>
            <TrendingUp size={18} />
            <span>Trending</span>
          </Link>
          <Link to='/categories' className={styles.navLink} onClick={closeMenu}>
            <Layers size={18} />
            <span>Categories</span>
          </Link>
        </nav>

        {/* Right Side - Search, Notifications, Profile */}
        <div className={styles.actions}>
          {/* Search Toggle */}
          <div className={styles.searchWrapper} ref={searchRef}>
            <button
              className={`${styles.iconButton} ${isSearchOpen ? styles.active : ""}`}
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              aria-label='Search'
            >
              <Search size={20} />
            </button>

            {/* Search Dropdown */}
            {isSearchOpen && (
              <div className={styles.searchDropdown}>
                <form onSubmit={handleSearch} className={styles.searchForm}>
                  <Search size={18} className={styles.searchIcon} />
                  <input
                    type='text'
                    placeholder='Search movies, shows...'
                    value={searchQuery}
                    onChange={handleSearchChange}
                    className={styles.searchInput}
                    autoFocus
                  />
                  {searchQuery && (
                    <button
                      type='button'
                      className={styles.clearButton}
                      onClick={() => {
                        setSearchQuery("");
                        setSuggestions([]);
                      }}
                    >
                      <X size={14} />
                    </button>
                  )}
                </form>

                {/* Immediate Suggestions */}
                {(suggestions.length > 0 || searchQuery.length >= 2) && (
                  <div className={styles.suggestions}>
                    {suggestions.length > 0 ? (
                      <>
                        <p className={styles.suggestionTitle}>Quick Picks</p>
                        {suggestions.map((suggestion) => (
                          <button
                            key={suggestion.id}
                            className={styles.suggestionItem}
                            onClick={() =>
                              handleSuggestionClick(suggestion.query)
                            }
                          >
                            <Search size={14} />
                            <span>{suggestion.title}</span>
                          </button>
                        ))}
                      </>
                    ) : (
                      searchQuery.length >= 2 && (
                        <button
                          className={styles.searchAllBtn}
                          onClick={handleSearch}
                        >
                          Search for &quot;{searchQuery}&quot;
                          <Loader2 size={14} className={styles.searchIcon} />
                        </button>
                      )
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Notifications */}
          <button className={styles.iconButton} aria-label='Notifications'>
            <Bell size={20} />
          </button>

          {/* Profile */}
          <button className={styles.profileButton} aria-label='Profile'>
            <User size={20} />
          </button>

          {/* Mobile Menu Toggle */}
          <button
            className={`${styles.hamburger} ${isMenuOpen ? styles.open : ""}`}
            onClick={toggleMenu}
            aria-label='Menu'
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Dropdown */}
      <nav className={`${styles.mobileNav} ${isMenuOpen ? styles.open : ""}`}>
        <Link to='/' className={styles.mobileNavLink} onClick={closeMenu}>
          <Home size={20} />
          <span>Home</span>
        </Link>
        <Link to='/movies' className={styles.mobileNavLink} onClick={closeMenu}>
          <Film size={20} />
          <span>Movies</span>
        </Link>
        <Link to='/series' className={styles.mobileNavLink} onClick={closeMenu}>
          <Tv size={20} />
          <span>Series</span>
        </Link>
        <Link
          to='/trending'
          className={styles.mobileNavLink}
          onClick={closeMenu}
        >
          <TrendingUp size={20} />
          <span>Trending</span>
        </Link>
        <Link
          to='/categories'
          className={styles.mobileNavLink}
          onClick={closeMenu}
        >
          <Layers size={20} />
          <span>Categories</span>
        </Link>
      </nav>
    </header>
  );
}
