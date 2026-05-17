import React from "react";
import { Link } from "react-router-dom";
import { FaFacebookF, FaInstagram, FaLinkedinIn, FaXTwitter } from "react-icons/fa6";
import "./Footer.css";

const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="site-footer__inner">
        <div className="site-footer__top">
          <div className="site-footer__brand">
            <div className="site-footer__logo">
              <span className="site-footer__logo-mark">y</span>
              <span className="site-footer__logo-text">inayak</span>
            </div>
            <p className="site-footer__tagline">
              Doorstep mobile repair with genuine parts, fast turnaround, and friendly support.
            </p>
            <div className="site-footer__social">
              <a className="site-footer__social-link" href="#" aria-label="Facebook">
                <FaFacebookF />
              </a>
              <a className="site-footer__social-link" href="#" aria-label="Instagram">
                <FaInstagram />
              </a>
              <a className="site-footer__social-link" href="#" aria-label="LinkedIn">
                <FaLinkedinIn />
              </a>
              <a className="site-footer__social-link" href="#" aria-label="X">
                <FaXTwitter />
              </a>
            </div>
          </div>

          <div className="site-footer__cols">
            <div className="site-footer__col">
              <h4 className="site-footer__title">Company</h4>
              <ul className="site-footer__links">
                <li><Link to="/about">About</Link></li>
                <li><Link to="/blog">Blog</Link></li>
                <li><Link to="/policie">Policies</Link></li>
                <li><Link to="/contact">Contact</Link></li>
              </ul>
            </div>

            <div className="site-footer__col">
              <h4 className="site-footer__title">Services</h4>
              <ul className="site-footer__links">
                <li><Link to="/service">Repairs</Link></li>
                <li><Link to="/pricing">Pricing</Link></li>
                <li><Link to="/track">Track Order</Link></li>
                <li><Link to="/brand">Brands</Link></li>
              </ul>
            </div>

            <div className="site-footer__col">
              <h4 className="site-footer__title">Support</h4>
              <ul className="site-footer__links">
                <li><a href="tel:+910000000000">+91 00000 00000</a></li>
                <li><a href="mailto:support@erepairhub.com">support@erepairhub.com</a></li>
                <li><span className="site-footer__muted">Mon–Sun · 9am–9pm</span></li>
              </ul>
            </div>
          </div>
        </div>

        <div className="site-footer__bottom">
          <p className="site-footer__copyright">
            © {year} Inayak. All rights reserved.
          </p>
          <div className="site-footer__bottom-links">
            <Link to="/policie">Privacy</Link>
            <span className="site-footer__dot" aria-hidden>•</span>
            <Link to="/policie">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
