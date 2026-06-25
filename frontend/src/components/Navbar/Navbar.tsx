import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { useScrollSpy } from "../../hooks/useScrollSpy";

const SECTION_IDS = ["hero", "why-navin", "features", "how-it-works", "faq"] as const;

const navLinks = [
  { id: "hero",         label: "Hero",         href: "#hero" },
  { id: "why-navin",    label: "Why Navin",    href: "#why-navin" },
  { id: "features",     label: "Features",     href: "#features" },
  { id: "how-it-works", label: "How It Works", href: "#how-it-works" },
  { id: "faq",          label: "FAQ",          href: "#faq" },
];

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const isLandingPage = location.pathname === "/";
  const activeSectionId = useScrollSpy(
    isLandingPage ? [...SECTION_IDS] : [],
  );

  const handleNavClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    sectionId: string,
  ) => {
    setIsMenuOpen(false);

    if (isLandingPage) {
      e.preventDefault();
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  const handleLogoClick = () => setIsMenuOpen(false);

  return (
    <nav className="absolute top-0 left-0 w-full bg-transparent z-[1000] m-0 p-0">
      <div className="max-w-[1480px] mx-auto px-8 py-3 flex justify-center items-center relative gap-12">
        {/* Logo */}
        <Link
          to="/"
          className="flex items-center gap-2 no-underline font-albert font-normal text-[30px] text-white transition-opacity duration-300 hover:opacity-80 absolute left-8"
          onClick={handleLogoClick}
        >
          <img src="/images/logo.svg" alt="Navin Logo" className="w-[56.44px] h-[55.19px] object-contain" />
          <span className="bg-white bg-clip-text text-transparent">Navin</span>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-12">
          {/* Nav Links */}
          <div className="flex flex-row justify-center items-center px-6 py-3.5 gap-12 h-[55.19px] bg-gradient-card border-t border-[rgba(0,128,128,0.3)] rounded-[30px]">
            {navLinks.map((link) => {
              const isActive = activeSectionId === link.id;
              return (
                <a
                  key={link.id}
                  href={link.href}
                  className={`text-white no-underline text-base font-normal relative transition-colors duration-300 cursor-pointer hover:text-[#00d4c8] after:content-[''] after:absolute after:-bottom-1.5 after:left-0 after:w-0 after:h-0.5 after:bg-[#00d4c8] after:transition-all after:duration-300 hover:after:w-full${
                    isActive ? " !text-[#00d4c8] after:!w-full" : ""
                  }`}
                  onClick={(e) => handleNavClick(e, link.id)}
                  aria-current={isActive ? "true" : undefined}
                >
                  {link.label}
                </a>
              );
            })}
          </div>

          {/* CTA Buttons */}
          <div className="flex gap-4 items-center absolute right-8">
            <Link
              to="/"
              className="px-5 py-2.5 rounded-full no-underline font-medium text-lg transition-all duration-300 text-white font-display bg-transparent hover:-translate-y-0.5"
            >
              Try now
            </Link>
            <Link
              to="/signup"
              className="font-display flex flex-row justify-center items-center px-8 py-3.5 gap-2 bg-[rgba(1,56,59)] backdrop-blur-xs text-[#E5FFFF] font-bold text-lg leading-[21px] tracking-[-0.32px] no-underline cursor-pointer transition-all duration-300 rounded-full border border-[#60C9CD] shadow-glow-blue shadow-inset-teal hover:-translate-y-0.5 hover:shadow-glow-blue-hover hover:shadow-inset-teal-hover"
            >
              Free Demo
            </Link>
          </div>
        </div>

        {/* Hamburger Menu (Mobile) */}
        <button
          className="hidden max-md:block bg-transparent border-none text-primary cursor-pointer text-2xl p-2 transition-transform duration-300 hover:scale-110 absolute right-6 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle menu"
          aria-expanded={isMenuOpen}
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 w-full bg-[rgba(10,22,40,0.98)] backdrop-blur-[10px] border-b border-border-light px-6 py-4 animate-[slideDown_0.3s_ease]">
            <div className="flex flex-col gap-4 mb-6 border-b border-border-light pb-6">
              {navLinks.map((link) => {
                const isActive = activeSectionId === link.id;
                return (
                  <a
                    key={link.id}
                    href={link.href}
                    className={`no-underline text-base font-medium transition-colors duration-300 cursor-pointer ${
                      isActive
                        ? "text-[#00d4c8]"
                        : "text-[#E0E0E0] hover:text-[#00d4c8]"
                    }`}
                    onClick={(e) => handleNavClick(e, link.id)}
                    aria-current={isActive ? "true" : undefined}
                  >
                    {link.label}
                  </a>
                );
              })}
            </div>
            <div className="flex flex-col gap-3">
              <Link
                to="/login"
                className="w-full text-center px-5 py-2.5 rounded-full no-underline font-medium text-lg transition-all duration-300 text-white font-display bg-transparent hover:-translate-y-0.5"
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="w-full text-center font-display flex flex-row justify-center items-center px-8 py-3.5 gap-2 bg-[rgba(1,56,59)] backdrop-blur-xs text-[#E5FFFF] font-bold text-lg leading-[21px] tracking-[-0.32px] no-underline cursor-pointer transition-all duration-300 rounded-full border border-[#60C9CD] shadow-glow-blue shadow-inset-teal hover:-translate-y-0.5 hover:shadow-glow-blue-hover hover:shadow-inset-teal-hover"
              >
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
