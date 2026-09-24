import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from "react-i18next";
import { useScrollSpy } from '../../hooks/useScrollSpy';
import LanguageSelect from '@components/common/LanguageSelect';

const SECTION_IDS = ['home', 'why-navin', 'features', 'how-it-works', 'faq'] as const;

const navLinks = [
  { id: "home", key: "home", href: "#home" },
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
  const { t } = useTranslation(["common"]);
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
    <div className="max-w-[1480px] mx-auto px-8 py-3 flex items-center gap-4">

      {/* Logo */}
      <Link
        to="/"
        className="flex items-center gap-2 no-underline font-albert font-normal text-[30px] text-white transition-opacity duration-300 hover:opacity-80 shrink-0"
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

      {/* Compact language switcher for screens too narrow to fit the full nav below
          (the nav links + login + signup can overflow at md/lg widths once
          translated into longer languages like French/Spanish) */}
      <div className="flex xl:hidden items-center ml-auto">
        <LanguageSelect compact variant="navbar" />
      </div>

      {/* Desktop Menu: a flexible center zone keeps the nav pill from ever
          colliding with the right-side controls, regardless of how long the
          translated nav labels get. */}
      <div className="hidden xl:flex flex-1 items-center min-w-0 gap-4">

        <div className="flex-1 flex justify-center min-w-0">
          <div className="flex flex-row justify-center items-center px-4 py-3.5 gap-3.5 h-[55.19px] max-w-full bg-gradient-card border-t border-[rgba(0,128,128,0.3)] rounded-[30px]">
            {navLinks.map((link) => {
              const isActive = activeSectionId === link.id;

              return (
                <a
                  key={link.id}
                  href={link.href}
                  className={`text-white no-underline text-sm font-normal relative whitespace-nowrap transition-colors duration-300 cursor-pointer hover:text-[#00d4c8] after:content-[''] after:absolute after:-bottom-1.5 after:left-0 after:w-0 after:h-0.5 after:bg-[#00d4c8] after:transition-all after:duration-300 hover:after:w-full${
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
        </div>

        {/* Right side */}
        <div className="flex gap-2.5 items-center shrink-0">

          <LanguageSelect variant="navbar" />

          <Link
            to="/login"
            className="px-3 py-2 rounded-full no-underline font-medium text-sm whitespace-nowrap transition-all duration-300 text-white font-display bg-transparent hover:-translate-y-0.5"
          >
            {t("login")}
          </Link>

          <Link
            to="/signup"
            className="font-display flex flex-row justify-center items-center px-5 py-2.5 gap-2 bg-[rgba(1,56,59)] backdrop-blur-xs text-[#E5FFFF] font-bold text-sm no-underline whitespace-nowrap cursor-pointer transition-all duration-300 rounded-full border border-[#60C9CD] shadow-glow-blue shadow-inset-teal hover:-translate-y-0.5 hover:shadow-glow-blue-hover hover:shadow-inset-teal-hover"
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