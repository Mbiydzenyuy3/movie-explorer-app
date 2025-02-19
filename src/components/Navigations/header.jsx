// src/components/Header.js
import { Link, useNavigate } from "react-router-dom";
import SearchBar from "../SearchForm/SearchBar";
import Logo from "../logo";

export default function Header() {
  const navigate = useNavigate();

  const handleSearch = (query) => {
    navigate(`/search?query=${query}`);
  };

  return (
    <>
      <header>
        <div className="container header">
          <Logo />
          <nav className="navbar">
            <ul>
              <li>
                <Link to="/">Home</Link>
              </li>
              <li>
                <Link to="/movie/:id">Movies</Link>
              </li>
              <li>
                <Link to="/movie/:id">Series</Link>
              </li>
              <li>
                <Link to="/movie/:id">Trending</Link>
              </li>
              <li>
                <Link to="/movie/:id">Categories</Link>
              </li>
            </ul>
          </nav>
          <div className="search-bar">
            <div className="search-form">
              <SearchBar onclick={handleSearch} />
            </div>
          </div>
          <div className="profile">
            <img src="/assets/img/profile.png" alt="" />
          </div>
        </div>
      </header>
    </>
  );
}
