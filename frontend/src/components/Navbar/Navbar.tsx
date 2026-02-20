import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import "./Navbar.css";

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("");
  const location = useLocation();

  // Handle smooth scroll navigation
  const handleNavClick = (sectionId: string) => {
    setActiveSection(sectionId);
    setIsMenuOpen(false);

    // If on the home page, scroll to section
    if (location.pathname === "/") {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  const handleLogoClick = () => {
    setIsMenuOpen(false);
    setActiveSection("");
  };

  const navLinks = [
    { id: "About", label: "About", href: "#about" },
    { id: "Services", label: "Services", href: "#services" },
    { id: "Pricing", label: "Pricing", href: "#pricing" },
    { id: "FAQ", label: "FAQ", href: "#faq" },
  ];

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo" onClick={handleLogoClick}>
          <img src="/images/logo.svg" alt="Navin Logo" className="logo-image" />
          <span className="logo-text">Navin</span>
        </Link>

        <div className="navbar-menu desktop">
          <div className="nav-links">
            {navLinks.map((link) => (
              <a
                key={link.id}
                href={link.href}
                className={`nav-link ${activeSection === link.id ? "active" : ""}`}
                onClick={(e) => {
                  e.preventDefault();
                  handleNavClick(link.id);
                }}
              >
                {link.label}
              </a>
            ))}
          </div>

          <div className="nav-ctas">
            <Link to="/" className="btn-try">
              Try now
            </Link>
            <Link to="/signup" className="btn-signup">
              Free Demo
            </Link>
          </div>
        </div>

        <button
          className="hamburger-menu mobile"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle menu"
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {isMenuOpen && (
          <div className="mobile-menu open">
            <div className="mobile-nav-links">
              {navLinks.map((link) => (
                <a
                  key={link.id}
                  href={link.href}
                  className={`mobile-nav-link ${activeSection === link.id ? "active" : ""}`}
                  onClick={(e) => {
                    e.preventDefault();
                    handleNavClick(link.id);
                  }}
                >
                  {link.label}
                </a>
              ))}
            </div>
            <div className="mobile-nav-ctas">
              <Link to="/login" className="btn-try mobile">
                Login
              </Link>
              <Link to="/signup" className="btn-signup mobile">
                Free Demo
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
