type Step = {
    number: string;
    title: string;
    description: string;
};

function HowItWorks() {
    const steps: Step[] = [
        {
            number: "01",
            title: "Smart Pickup",
            description: "We pick up your package from your chosen location or partner hub and log it into our system for full transparency from the start.",
        },
        {
            number: "02",
            title: "Live Tracking",
            description: "Track your shipment in real time with instant updates at every milestone—from dispatch to delivery. No more wondering where your package is.",
        },
        {
            number: "03",
            title: "Secure Delivery",
            description: "Once your package arrives, you'll receive a secure delivery confirmation—complete with proof of hand-off. Peace of mind, guaranteed.",
        },
    ];

    return (
        <section 
            id="how-it-works" 
            className="relative py-20 px-4 md:py-28 lg:py-32 bg-background-secondary overflow-hidden"
        >
            {/* Ambient glow effects */}
            <div className="absolute top-1/4 -left-40 w-[600px] h-[600px] bg-accent-teal/10 blur-[100px] rounded-full pointer-events-none" />
            <div className="absolute bottom-1/4 -right-40 w-[600px] h-[600px] bg-primary/10 blur-[100px] rounded-full pointer-events-none" />
            
            <div className="relative max-w-7xl mx-auto">
                <h2 className="font-display text-3xl md:text-5xl lg:text-6xl font-bold text-center mb-6 text-text-primary">
                    How <span className="text-primary">Navin</span> Works
                </h2>
                <p className="text-center text-text-secondary text-lg mb-16 max-w-2xl mx-auto">
                    Simple, transparent, and blockchain-powered. Track your shipments from pickup to delivery.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {steps.map((step, index) => (
                        <article 
                            key={index}
                            className="group relative flex flex-col gap-4 p-8 bg-background-card/60 backdrop-blur-lg border border-border-light rounded-2xl transition-all duration-300 hover:border-primary-light hover:shadow-glow-blue hover:-translate-y-2 hover:bg-background-card/80"
                        >
                            {/* Step number with glow */}
                            <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-card border border-primary-light/40 shadow-inset-teal transition-all duration-300 group-hover:shadow-inset-teal-hover group-hover:border-primary-light group-hover:scale-110">
                                <span className="font-display text-2xl font-bold text-primary transition-all duration-300 group-hover:scale-110">
                                    {step.number}
                                </span>
                            </div>
                            
                            {/* Content */}
                            <div>
                                <h3 className="font-display text-2xl font-semibold text-text-primary mb-3 transition-colors duration-300 group-hover:text-primary">
                                    {step.title}
                                </h3>
                                <p className="font-sans text-base leading-relaxed text-text-secondary transition-colors duration-300 group-hover:text-text-primary">
                                    {step.description}
                                </p>
                            </div>
                            
                            {/* Connecting line (only for non-last items on desktop) */}
                            {index < steps.length - 1 && (
                                <div className="hidden md:block absolute top-1/2 -right-4 w-8 h-0.5 bg-gradient-to-r from-primary-light/40 to-transparent transition-all duration-300 group-hover:from-primary-light group-hover:shadow-glow-blue" />
                            )}
                            
                            {/* Hover glow effect */}
                            <div className="absolute inset-0 bg-primary/5 rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100 pointer-events-none" />
                        </article>
                    ))}
                </div>
            </div>
        </section>
    );
}

export default HowItWorks;
