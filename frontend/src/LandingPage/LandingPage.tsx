import React from "react";
import Hero from "./sections/Hero/Hero";
import HowItWorks from "@/LandingPage/sections/HowItWorks/HowItWorks";
import WhyNavin from "@/LandingPage/sections/WhyNavin/WhyNavin";
import Features from "@/pages/LandingPage/sections/Features/Features";
import CTABanner from "@/pages/LandingPage/sections/CTABanner/CTABanner";

const LandingPage: React.FC = () => {
    return (
        <main>
            <Hero />
            <WhyNavin />
            <Features />
            <HowItWorks />
            <CTABanner />
        </main>
    );
};

export default LandingPage;
