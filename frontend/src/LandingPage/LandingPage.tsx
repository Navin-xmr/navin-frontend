import React from "react";
import Hero from "./sections/Hero/Hero";
import HowItWorks from "@/LandingPage/sections/HowItWorks/HowItWorks";
import WhyNavin from "@/LandingPage/sections/WhyNavin/WhyNavin";

const LandingPage: React.FC = () => {
    return (
        <main>
            <Hero />
            <WhyNavin />
            <HowItWorks />
        </main>
    );
};

export default LandingPage;
