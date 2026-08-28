import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Bookmark } from "lucide-react";
import Home from "./sections/Home/Home";
import HowItWorks from "./sections/HowItWorks/HowItWorks";
import WhyNavin from "./sections/WhyNavin/WhyNavin";
import FAQSection from "./sections/FAQSection/FAQSection";
import LogoStrip from "./sections/LogoStrip/LogoStrip";
import CoreFeatures from "./sections/CoreFeatures/CoreFeatures";
import Footer from "./sections/Footer/Footer";
import { useReturningVisitor } from "@hooks/useReturningVisitor";
import { useAuthContext } from "@context/AuthContext";

const LandingPage: React.FC = () => {
  const { isReturning } = useReturningVisitor();
  const { isAuthenticated } = useAuthContext();

  return (
    <main className="scroll-smooth w-full">
      {/* Quick-access for authenticated returning visitors */}
      {isReturning && isAuthenticated && (
        <div
          className="bg-[rgba(98,255,255,0.06)] border-b border-[rgba(98,255,255,0.15)] px-6 pt-20 pb-3"
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
