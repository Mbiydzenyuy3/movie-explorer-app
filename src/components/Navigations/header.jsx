// src/components/Header.js
import { Link, useNavigate } from "react-router-dom";
import SearchBar from "../SearchForm/SearchBar";
import Logo from "../logo";
import { useState } from "react";

export default function Header() {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleSearch = (query) => {
    navigate(`/search?query=${query}`);
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <>
      <header>
        <div className='container header'>
          <Logo />
          <nav className='navbar'>
            <ul className={isMenuOpen ? "open" : ""}>
              <li>
                <Link to='/' onClick={() => setIsMenuOpen(false)}>
                  Home
                </Link>
              </li>
              <li>
                <Link to='/movies' onClick={() => setIsMenuOpen(false)}>
                  Movies
                </Link>
              </li>
              <li>
                <Link to='/series' onClick={() => setIsMenuOpen(false)}>
                  Series
                </Link>
              </li>
              <li>
                <Link to='/trending' onClick={() => setIsMenuOpen(false)}>
                  Trending
                </Link>
              </li>
              <li>
                <Link to='/categories' onClick={() => setIsMenuOpen(false)}>
                  Categories
                </Link>
              </li>
            </ul>
          </nav>
          <div className='search-bar'>
            <div className='search-form'>
              <SearchBar onclick={handleSearch} />
            </div>
          </div>
          <div className='profile'>
            <img src='/assets/img/profile.png' alt='' />
          </div>
          <button className='hamburger' onClick={toggleMenu}>
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </header>
    </>
  );
}
