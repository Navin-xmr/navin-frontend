import React from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar/Navbar";
import Hero from "../../LandingPage/sections/Hero/Hero";
import "./Home.css";
import HowItWorks from "@/LandingPage/sections/HowItWorks/HowItWorks";
import WhyNavin from "@/LandingPage/sections/WhyNavin/WhyNavin";

const Home: React.FC = () => {
    return (
        <div className="home-container">
            <Navbar />
            <Hero />

            <div className="home-content">
                <h1 className="home-title">
                    Transparent <br /> Tracking Solution
                </h1>
                <p className="home-subtitle">
                    Experience the next generation of delivery intelligence.
                    Real-time visibility, secure shipments, and unparalleled
                    efficiency.
                </p>
                <div className="home-actions">
                    <Link to="/dashboard" className="btn-secondary">
                        View Dashboard
                    </Link>
                    <Link to="/signup" className="btn-primary">
                        Get Started
                    </Link>
                    <Link to="/login" className="btn-secondary">
                        Sign In
                    </Link>
                </div>
            </div>
            <WhyNavin />
            <HowItWorks />
        </div>
    );
};

export default Home;
