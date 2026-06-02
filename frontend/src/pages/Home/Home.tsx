import React from "react";
import Navbar from "@/components/Navbar/Navbar";
import LandingPage from "../../LandingPage/LandingPage";

const Home: React.FC = () => {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-background text-text-primary relative overflow-hidden text-center p-5 m-0">
            <Navbar />
            <LandingPage />
        </div>
    );
};

export default Home;
