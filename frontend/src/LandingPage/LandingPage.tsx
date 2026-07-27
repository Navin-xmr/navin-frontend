import React from "react";
import Home from "./sections/Home/Home";
import HowItWorks from "./sections/HowItWorks/HowItWorks";
import WhyNavin from "./sections/WhyNavin/WhyNavin";
import Features from "./sections/Features/Features";
import FAQSection from "./sections/FAQSection/FAQSection";
import LogoStrip from "./sections/LogoStrip/LogoStrip";
import CoreFeatures from "./sections/CoreFeatures/CoreFeatures";
import Footer from "./sections/Footer/Footer";

const LandingPage: React.FC = () => {
  return (
    <main className="scroll-smooth w-full">
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
