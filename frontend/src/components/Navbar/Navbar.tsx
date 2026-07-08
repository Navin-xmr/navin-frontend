import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from "react-i18next";
import { useScrollSpy } from '../../hooks/useScrollSpy';

const SECTION_IDS = ['hero', 'why-navin', 'features', 'how-it-works', 'faq'] as const;

const navLinks = [
  { id: "hero", key: "hero", href: "#hero" },
  { id: "why-navin", key: "whyNavin", href: "#why-navin" },
  { id: "features", key: "features", href: "#features" },
  { id: "how-it-works", key: "howItWorks", href: "#how-it-works" },
  { id: "faq", key: "faq", href: "#faq" },
];

const Navbar: React.FC = () => {
  const [companyLogo] = React.useState<string | null>(() => {
    try {
      return window.localStorage.getItem('navin-company-logo');
    } catch {
      return null;
    }
  });
  const location = useLocation();
const { t, i18n } = useTranslation(["common"]);
  const isLandingPage = location.pathname === '/';
  const activeSectionId = useScrollSpy(
    isLandingPage ? [...SECTION_IDS] : [],
  );

  const handleNavClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    sectionId: string,
  ) => {
    if (isLandingPage) {
      e.preventDefault();
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

 return (
  <nav className="absolute top-0 left-0 w-full bg-transparent z-[1000] m-0 p-0">
    <div className="max-w-[1480px] mx-auto px-8 py-3 flex justify-center items-center relative gap-12">

      {/* Logo */}
      <Link
        to="/"
        className="flex items-center gap-2 no-underline font-albert font-normal text-[30px] text-white transition-opacity duration-300 hover:opacity-80 absolute left-8"
      >
        {companyLogo ? (
          <img
            src={companyLogo}
            alt="Company logo"
            className="w-[56.44px] h-[55.19px] object-cover rounded-xl border border-white/10"
          />
        ) : (
          <img
            src="/images/logo.svg"
            alt="Navin Logo"
            className="w-[56.44px] h-[55.19px] object-contain"
          />
        )}

        <span className="bg-white bg-clip-text text-transparent">
          {t("appName")}
        </span>
      </Link>

      {/* Desktop Menu */}
      <div className="hidden md:flex items-center gap-12">

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
                {t(link.key)}
              </a>
            );
          })}
        </div>

        {/* Right side */}
        <div className="flex gap-4 items-center absolute right-8">

          <select
            value={i18n.language}
            onChange={(e) => {
              const lang = e.target.value;
              i18n.changeLanguage(lang);
              localStorage.setItem("language", lang);
            }}
            className="bg-transparent text-white border border-white/30 rounded-md px-2 py-1"
          >
            <option value="en">English</option>
            <option value="fr">Français</option>
            <option value="es">Español</option>
          </select>

          <Link
            to="/login"
            className="px-5 py-2.5 rounded-full no-underline font-medium text-lg transition-all duration-300 text-white font-display bg-transparent hover:-translate-y-0.5"
          >
            {t("login")}
          </Link>

          <Link
            to="/signup"
            className="font-display flex flex-row justify-center items-center px-8 py-3.5 gap-2 bg-[rgba(1,56,59)] backdrop-blur-xs text-[#E5FFFF] font-bold text-lg leading-[21px] tracking-[-0.32px] no-underline cursor-pointer transition-all duration-300 rounded-full border border-[#60C9CD] shadow-glow-blue shadow-inset-teal hover:-translate-y-0.5 hover:shadow-glow-blue-hover hover:shadow-inset-teal-hover"
          >
            {t("freeDemo")}
          </Link>

        </div>

      </div>

    </div>
  </nav>
);
};

export default Navbar;