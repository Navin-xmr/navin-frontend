function HowItWorks() {
    return (
        <section className="py-20">
            <h3 className="font-display font-normal text-[1.5rem] md:text-[2.25rem] lg:text-[3.25rem] mb-12">
                <span className="text-[#62ffff]">How Navin</span> Works
            </h3>
            <div className="flex flex-col gap-[2.125rem] md:flex-row md:flex-wrap md:justify-center">
                <article className="px-4 md:max-w-[21.5rem] lg:max-w-[26.125rem]">
                    <h3 className="font-display text-[1.125rem] mb-3 text-[#62ffff]">
                        Smart Pickup
                    </h3>
                    <p className="text-base">
                        We pick up your package from your chosen location or
                        partner hub and log it into our system for full
                        transparency from the start
                    </p>
                </article>
                <article className="px-4 md:max-w-[21.5rem] lg:max-w-[26.125rem]">
                    <h3 className="font-display text-[1.125rem] mb-3 text-[#62ffff]">
                        Live Tracking
                    </h3>
                    <p className="text-base">
                        Track your shipment in real time with instant updates at
                        every milestone—from dispatch to delivery. No more
                        wondering where your package
                    </p>
                </article>
                <article className="px-4 md:max-w-[21.5rem] lg:max-w-[26.125rem]">
                    <h3 className="font-display text-[1.125rem] mb-3 text-[#62ffff]">
                        Secure Delivery
                    </h3>
                    <p className="text-base">
                        Once your package arrives, you'll receive a secure
                        delivery confirmation—complete with proof of hand-off.
                        Peace of mind, guaranteed
                    </p>
                </article>
            </div>
        </section>
    );
}

export default HowItWorks;
