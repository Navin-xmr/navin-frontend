import React from "react";
import "./Features.css";

type FeatureCard = {
    icon: string;
    iconAlt: string;
    title: string;
    description: string;
};

const Features: React.FC = () => {
    const features: FeatureCard[] = [
        {
            icon: "/images/icons/tracking.svg",
            iconAlt: "Real-time tracking icon",
            title: "Real-time Tracking",
            description: "Monitor your shipments live with precise location updates at every stage of delivery.",
        },
        {
            icon: "/images/icons/blockchain.svg",
            iconAlt: "Immutable records icon",
            title: "Immutable Records",
            description: "Blockchain-powered ledger ensures every transaction is secure and tamper-proof.",
        },
        {
            icon: "/images/icons/settlement.svg",
            iconAlt: "Automated settlements icon",
            title: "Automated Settlements",
            description: "Smart contracts handle payments instantly, eliminating delays and manual processing.",
        },
        {
            icon: "/images/icons/dashboard.svg",
            iconAlt: "Responsive dashboard icon",
            title: "Responsive Dashboard",
            description: "Access your logistics data anywhere with our intuitive, mobile-friendly interface.",
        },
    ];

    return (
        <section id="features" className="features">
            <div className="features__container">
                <h2 className="features__heading">
                    Key <span className="features__accent">Features</span>
                </h2>
                <div className="features__grid">
                    {features.map((feature, index) => (
                        <article key={index} className="features__card">
                            <div className="features__icon-wrapper">
                                <img
                                    src={feature.icon}
                                    alt={feature.iconAlt}
                                    className="features__icon"
                                />
                            </div>
                            <h3 className="features__title">{feature.title}</h3>
                            <p className="features__description">{feature.description}</p>
                        </article>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Features;
