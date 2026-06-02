type WhyNavinItem = {
    icon: string;
    iconAlt: string;
    header: string;
    description: string;
};

function WhyNavin() {
    const whyNavin: WhyNavinItem[] = [
        {
            icon: "public/images/icons/Transparency.svg",
            iconAlt: "Eye icon",
            header: "Total Transparency",
            description: "See your shipments journey, every step of the way.",
        },
        {
            icon: "public/images/icons/Alerts.svg",
            iconAlt: "Bell icon",
            header: "Real Time Alerts",
            description: "Know instantly if there is a delay or issue.",
        },
        {
            icon: "public/images/icons/Deliveries.svg",
            iconAlt: "Truck icon",
            header: "Safe Deliveries",
            description: "Tamper proof technology prevents fraud and errors.",
        },
        {
            icon: "public/images/icons/Fast.svg",
            iconAlt: "Rocket icon",
            header: "Faster Service",
            description: "Automated processes mean quicker, smoother deliveries.",
        },
    ];

    return (
        <section className="py-20">
            <h2 className="font-display font-normal text-[1.5rem] md:text-[2.25rem] lg:text-[3.25rem] mb-12">
                Why <span className="text-[#62ffff]"> Navin?</span>
            </h2>
            <div className="grid gap-[1.125rem] md:grid-cols-2 lg:grid-cols-4">
                {whyNavin.map((item) => (
                    <article
                        key={item.header}
                        className="w-full h-[17.4rem] flex flex-col justify-center items-start px-4 rounded-[1.25rem] gap-6 text-left"
                        style={{
                            boxShadow: 'inset 0 0 20px 0px #008080',
                            background: 'rgba(19, 186, 186, 0.1)',
                        }}
                    >
                        <div
                            className="bg-[#101010] rounded-2xl px-6 py-[1.875rem] flex items-center justify-center border border-[rgba(6,255,255,0.4)]"
                            style={{ boxShadow: 'inset 0 0 12px 0px #008080', width: '6.5625rem' }}
                        >
                            <img src={item.icon} alt={item.iconAlt} />
                        </div>
                        <article>
                            <h3 className="font-display font-semibold text-[#f8ffff] mb-3">{item.header}</h3>
                            <p className="text-[#e5ffff]">{item.description}</p>
                        </article>
                    </article>
                ))}
            </div>
        </section>
    );
}

export default WhyNavin;
