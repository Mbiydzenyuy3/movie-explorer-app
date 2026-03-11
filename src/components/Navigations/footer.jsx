import { Link } from "react-router";
// import { Twitter, Instagram, Youtube, Mail } from "lucide-react";
import styles from "./footer.module.css";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        {/* Brand Section */}
        <div className={styles.brand}>
          <Link to='/' className={styles.logo}>
            <span className={styles.logoText}>VibeBox</span>
          </Link>
          <p className={styles.tagline}>
            Your destination for premium entertainment. Discover, stream, and
            enjoy unlimited movies and shows.
          </p>
        </div>

        {/* Quick Links */}
        <div className={styles.linksSection}>
          <h4 className={styles.linksTitle}>Browse</h4>
          <nav className={styles.links}>
            <Link to='/movies'>Movies</Link>
            <Link to='/series'>TV Series</Link>
            <Link to='/trending'>Trending</Link>
            <Link to='/categories'>Categories</Link>
          </nav>
        </div>

        {/* Support */}
        <div className={styles.linksSection}>
          <h4 className={styles.linksTitle}>Support</h4>
          <nav className={styles.links}>
            <Link to='/help'>Help Center</Link>
            <Link to='/contact'>Contact Us</Link>
            <Link to='/faq'>FAQ</Link>
            <Link to='/devices'>Device Support</Link>
          </nav>
        </div>

        {/* Legal */}
        <div className={styles.linksSection}>
          <h4 className={styles.linksTitle}>Legal</h4>
          <nav className={styles.links}>
            <Link to='/terms'>Terms of Service</Link>
            <Link to='/privacy'>Privacy Policy</Link>
            <Link to='/cookies'>Cookie Preferences</Link>
            <Link to='/corporate'>Corporate Info</Link>
          </nav>
        </div>

        {/* Social & App Links */}
        <div className={styles.socialSection}>
          {/* <h4 className={styles.linksTitle}>Connect</h4>
          <div className={styles.socialIcons}>
            <a
              href='https://twitter.com'
              target='_blank'
              rel='noopener noreferrer'
              aria-label='Twitter'
            >
              <Twitter size={20} />
            </a>
            <a
              href='https://instagram.com'
              target='_blank'
              rel='noopener noreferrer'
              aria-label='Instagram'
            >
              <Instagram size={20} />
            </a>
            <a
              href='https://youtube.com'
              target='_blank'
              rel='noopener noreferrer'
              aria-label='YouTube'
            >
              <Youtube size={20} />
            </a>
            <a href='mailto:support@streamx.com' aria-label='Email'>
              <Mail size={20} />
            </a>
          </div> */}

          {/* <div className={styles.appLinks}>
            <p className={styles.appText}>Get the app</p>
            <div className={styles.appButtons}>
              <button className={styles.appButton}>
                <Film size={18} />
                <span>App Store</span>
              </button>
              <button className={styles.appButton}>
                <Film size={18} />
                <span>Google Play</span>
              </button>
            </div>
          </div> */}
        </div>
      </div>

      {/* Bottom Bar */}
      <div className={styles.bottomBar}>
        <div className={styles.bottomContent}>
          <p className={styles.copyright}>
            © {currentYear} VibeBox. All rights reserved.
          </p>
          <p className={styles.disclaimer}>
            VibeBox is not affiliated with any streaming service. Content
            provided by TMDB.
          </p>
        </div>
      </div>
    </footer>
  );
}
