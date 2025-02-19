import ComedyMovies from "../components/CommedyMovies/Comedy";
import RomanceDramaMovies from "../components/Romance/Romance";
import ActionMovies from "../components/ActionMovies/ActionMovies";
import TopSearchesMovies from "../components/TopSearches/TopSearches";
import LatestMovies from "../components/LatestMovies/LatestMovies";
import HeroSection from "../components/HeroSection/HeroCard";
import Footer from "../components/Navigations/footer";
import Header from "../components/Navigations/header";

export default function HomePage() {
  return (
    <div className="home-page">
      <Header />
      <HeroSection />
      <LatestMovies />
      <div className="movies">
        <TopSearchesMovies />
        <ActionMovies />
        <RomanceDramaMovies />
        <ComedyMovies />
      </div>

      <Footer />
    </div>
  );
}
