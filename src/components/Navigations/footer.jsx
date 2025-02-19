import Logo from "../logo";

export default function Footer() {
  return (
    <>
      <footer>
        <div className="container">
          <div className="footer">
            <div className="footer-main-items">
              <div className="footer-item company">
                <h4 className="footer-heading">Company</h4>
                <ul className="footer-ul">
                  <a className="footer-link" href="">
                    About Us
                  </a>
                  <a className="footer-link" href="">
                    Careers
                  </a>
                </ul>
              </div>
              <div className="help-center">
                <h4 className="footer-heading">Help Center</h4>
                <ul className="footer-ul ">
                  <a className="footer-link" href="">
                    Visit Help Center?
                  </a>
                  <a className="footer-link" href="">
                    Share Feedback
                  </a>
                </ul>
              </div>
              <div className="footer-item visit-website">
                <h4 className="footer-heading">View Websites in</h4>
                <div className="footer-rounded-tick">
                  <img src="/assets/img/correct.svg" alt="correct" />
                  <p className="footer-p">English</p>
                  <select name="select" id="select-option">
                    <option value="empty"></option>
                  </select>
                </div>
              </div>
              <div className="footer-item footer-social-media">
                <h4 className="footer-heading">Social Media</h4>
                <div className="footer-social-media-icons">
                  <div className="footer-rounded-media">
                    <img src="/assets/img/Group.svg" alt="" />
                  </div>
                  <div className="footer-rounded-media">
                    <img src="/assets/img/Group.svg" alt="" />
                  </div>
                </div>
              </div>
              <div className="footer-item footer-images">
                <h4 className="footer-heading">Download Our App</h4>
                <div className="footer-images-item">
                  <img src="/assets/img/apple.png" alt="" />
                  <img src="/assets/img/playstore.png" alt="" />
                </div>
              </div>
            </div>
            <div className="footer-contact">
              <div className="footer-contact-items">
                <div className="copyright">
                  <p>&copy; 2023 STREAM X. All Rights Reserved</p>
                </div>
                <div className="footer-terms">
                  <p className="terms">Terms Of Use </p>
                </div>
                <div className="footer-policy">
                  <p className="tpolicy"> Privacy Policy</p>
                </div>
                <div className="faq">
                  <p className="faq"> FAQ</p>
                </div>
              </div>
              <div className="footer-logo">
                <Logo />
              </div>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
