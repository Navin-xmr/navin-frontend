import React from "react";
import Hero from "./sections/Hero/Hero";
import HowItWorks from "@/LandingPage/sections/HowItWorks/HowItWorks";
import WhyNavin from "@/LandingPage/sections/WhyNavin/WhyNavin";
import Features from "@/pages/LandingPage/sections/Features/Features";
import FAQSection from "./sections/FAQSection/FAQSection";

const LandingPage: React.FC = () => {
  return (
    <main className="scroll-smooth w-full">
      <section id="hero">
        <Hero />
      </section>
      <section id="why-navin">
        <WhyNavin />
      </section>
      <section id="features">
        <Features />
      </section>
      <section id="how-it-works">
        <HowItWorks />
      </section>
      <section id="faq">
        <FAQSection />
      </section>
    </main>
  );
};

export default LandingPage;
