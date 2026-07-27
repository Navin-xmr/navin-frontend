type WhyNavinItem = {
    icon: string;
    iconAlt: string;
    header: string;
    description: string;
};

function WhyNavin() {
    const whyNavin: WhyNavinItem[] = [
        {
            icon: "/images/icons/Transparency.svg",
            iconAlt: "Eye icon",
            header: "Total Transparency",
            description: "See your shipments journey, every step of the way.",
        },
        {
            icon: "/images/icons/Alerts.svg",
            iconAlt: "Bell icon",
            header: "Real Time Alerts",
            description: "Know instantly if there is a delay or issue.",
        },
        {
            icon: "/images/icons/Deliveries.svg",
            iconAlt: "Truck icon",
            header: "Safe Deliveries",
            description: "Tamper proof technology prevents fraud and errors.",
        },
        {
            icon: "/images/icons/Fast.svg",
            iconAlt: "Rocket icon",
            header: "Faster Service",
            description: "Automated processes mean quicker, smoother deliveries.",
        },
    ];

    return (
        <section 
            id="about" 
            className="relative py-20 px-4 md:py-28 lg:py-32 bg-background-secondary overflow-hidden"
        >
            {/* Ambient glow effects */}
            <div className="absolute top-1/3 -left-40 w-[500px] h-[500px] bg-accent-teal/10 blur-[100px] rounded-full pointer-events-none" />
            <div className="absolute bottom-1/3 -right-40 w-[500px] h-[500px] bg-primary/10 blur-[100px] rounded-full pointer-events-none" />
            
            <div className="relative max-w-7xl mx-auto">
                <h2 className="font-display text-3xl md:text-5xl lg:text-6xl font-bold text-center mb-6 text-text-primary">
                    Why <span className="text-primary">Navin?</span>
                </h2>
                <p className="text-center text-text-secondary text-lg mb-16 max-w-2xl mx-auto">
                    Blockchain-powered logistics that puts transparency, speed, and security first.
                </p>
                
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                    {whyNavin.map((item) => (
                        <article
                            key={item.header}
                            className="group relative flex flex-col gap-6 p-6 bg-background-card/60 backdrop-blur-lg border border-border-light rounded-2xl transition-all duration-300 hover:border-primary-light hover:shadow-glow-blue hover:-translate-y-2 hover:bg-background-card/80"
                        >
                            {/* Icon container */}
                            <div className="inline-flex items-center justify-center w-[6.5rem] h-[6.5rem] rounded-2xl bg-gradient-card border border-primary-light/40 shadow-inset-teal transition-all duration-300 group-hover:shadow-inset-teal-hover group-hover:border-primary-light group-hover:scale-110">
                                <img src={item.icon} alt={item.iconAlt} className="w-8 h-8 transition-transform duration-300 group-hover:scale-110" />
                            </div>
                            
                            {/* Content */}
                            <div>
                                <h3 className="font-display text-xl font-semibold text-text-primary mb-3 transition-colors duration-300 group-hover:text-primary">
                                    {item.header}
                                </h3>
                                <p className="font-sans text-base leading-relaxed text-text-secondary transition-colors duration-300 group-hover:text-text-primary">
                                    {item.description}
                                </p>
                            </div>
                        </article>
                    ))}
                </div>
            </div>
        </section>
    );
}

export default WhyNavin;
