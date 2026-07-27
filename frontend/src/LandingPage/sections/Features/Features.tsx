import React from "react";

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
        <section 
            id="features" 
            className="relative py-20 px-4 md:py-28 lg:py-32 bg-background-secondary overflow-hidden"
        >
            {/* Ambient glow effects */}
            <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-primary/10 blur-[120px] rounded-full pointer-events-none" />
            <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-accent-teal/10 blur-[120px] rounded-full pointer-events-none" />
            
            <div className="relative max-w-7xl mx-auto">
                <h2 className="font-display text-3xl md:text-5xl lg:text-6xl font-bold text-center mb-6 text-text-primary">
                    Key <span className="text-primary">Features</span>
                </h2>
                <p className="text-center text-text-secondary text-lg mb-16 max-w-2xl mx-auto">
                    Cutting-edge blockchain technology meets logistics. Experience transparency, security, and efficiency like never before.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {features.map((feature, index) => (
                        <article 
                            key={index} 
                            className="group relative flex flex-col gap-6 p-6 bg-background-card/60 backdrop-blur-lg border border-border-light rounded-2xl transition-all duration-300 hover:border-primary-light hover:-translate-y-2 hover:shadow-glow-blue hover:bg-background-card/80"
                        >
                            {/* Icon container with inset glow */}
                            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-card border border-primary-light/40 shadow-inset-teal transition-all duration-300 group-hover:shadow-inset-teal-hover group-hover:border-primary-light group-hover:scale-110 group-hover:rotate-3">
                                <img
                                    src={feature.icon}
                                    alt={feature.iconAlt}
                                    className="w-10 h-10 object-contain transition-transform duration-300 group-hover:scale-110"
                                />
                            </div>
                            
                            {/* Content */}
                            <div>
                                <h3 className="font-display text-xl font-semibold text-text-primary mb-3 transition-colors duration-300 group-hover:text-primary">
                                    {feature.title}
                                </h3>
                                <p className="font-sans text-base leading-relaxed text-text-secondary transition-colors duration-300 group-hover:text-text-primary">
                                    {feature.description}
                                </p>
                            </div>
                            
                            {/* Hover glow effect */}
                            <div className="absolute inset-0 bg-primary/5 rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100 pointer-events-none" />
                        </article>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Features;
