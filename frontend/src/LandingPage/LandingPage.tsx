import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, History, Bookmark } from "lucide-react";
import Home from "./sections/Home/Home";
import HowItWorks from "./sections/HowItWorks/HowItWorks";
import WhyNavin from "./sections/WhyNavin/WhyNavin";
import Features from "./sections/Features/Features";
import FAQSection from "./sections/FAQSection/FAQSection";
import LogoStrip from "./sections/LogoStrip/LogoStrip";
import CoreFeatures from "./sections/CoreFeatures/CoreFeatures";
import Footer from "./sections/Footer/Footer";
import { useReturningVisitor } from "@hooks/useReturningVisitor";
import { useAuthContext } from "@context/AuthContext";

const LandingPage: React.FC = () => {
  const { isReturning, visitCount, daysSinceLastVisit } = useReturningVisitor();
  const { isAuthenticated } = useAuthContext();

  const showReturningBanner = isReturning && !isAuthenticated;

  return (
    <main className="scroll-smooth w-full">
      {/* Returning visitor banner */}
      {showReturningBanner && (
        <div
          className="bg-[rgba(98,255,255,0.06)] border-b border-[rgba(98,255,255,0.15)] px-6 py-3"
          role="region"
          aria-label="Welcome back"
        >
          <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[rgba(98,255,255,0.15)] flex items-center justify-center shrink-0">
                <History size={16} className="text-[#62ffff]" />
              </div>
              <div>
                <p className="text-sm text-white font-medium">
                  Welcome back{visitCount > 1 ? ` — visit #${visitCount}` : ''}!
                  {daysSinceLastVisit !== null && daysSinceLastVisit > 0 && (
                    <span className="text-slate-400 font-normal">
                      {' '}It's been {daysSinceLastVisit} {daysSinceLastVisit === 1 ? 'day' : 'days'} since your last visit.
                    </span>
                  )}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-[rgba(98,255,255,0.1)] hover:bg-[rgba(98,255,255,0.2)] border border-[rgba(98,255,255,0.3)] text-sm font-medium text-[#62ffff] transition-colors no-underline"
              >
                Sign In
                <ArrowRight size={14} />
              </Link>
              <Link
                to="/signup"
                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-[#62ffff] hover:bg-[#4ae8e8] text-sm font-semibold text-black transition-colors no-underline"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Quick-access for authenticated returning visitors */}
      {isReturning && isAuthenticated && (
        <div
          className="bg-[rgba(98,255,255,0.06)] border-b border-[rgba(98,255,255,0.15)] px-6 py-3"
          role="region"
          aria-label="Quick access"
        >
          <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[rgba(98,255,255,0.15)] flex items-center justify-center shrink-0">
                <Bookmark size={16} className="text-[#62ffff]" />
              </div>
              <p className="text-sm text-white font-medium">
                Jump back into your dashboard — pick up where you left off.
              </p>
            </div>
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-[#62ffff] hover:bg-[#4ae8e8] text-sm font-semibold text-black transition-colors no-underline"
            >
              Go to Dashboard
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      )}

      <section id="home">
        <Home />
      </section>
      <LogoStrip />
      <section id="why-navin">
        <WhyNavin />
      </section>
      <section id="features">
        <Features />
      </section>
      <section id="core-features">
        <CoreFeatures />
      </section>
      <section id="how-it-works">
        <HowItWorks />
      </section>
      <section id="faq">
        <FAQSection />
      </section>
      <Footer />
    </main>
  );
};

export default LandingPage;
