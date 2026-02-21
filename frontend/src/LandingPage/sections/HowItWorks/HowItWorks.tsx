import "./HowItWorks.css";

function HowItWorks() {
    return (
        <section className="how__section">
            <h3 className="how__section__header">
                {" "}
                <span className="navin__cyan">How Navin</span> Works
            </h3>
            <div className="how__item__container">
                <article className="how__section__item">
                    <h3 className="how__article__header navin__cyan">
                        Smart Pickup
                    </h3>
                    <p className="how__article__description">
                        We pick up your package from your chosen location or
                        partner hub and log it into our system for full
                        transparency from the start
                    </p>
                </article>
                <article className="how__section__item">
                    <h3 className="how__article__header navin__cyan">
                        Live Tracking
                    </h3>
                    <p>
                        Track your shipment in real time with instant updates at
                        every milestone—from dispatch to delivery. No more
                        wondering where your package
                    </p>
                </article>
                <article className="how__section__item">
                    <h3 className="how__article__header navin__cyan">
                        Secure Delivery
                    </h3>
                    <p>
                        Once your package arrives, you’ll receive a secure
                        delivery confirmation—complete with proof of hand-off.
                        Peace of mind, guaranteed
                    </p>
                </article>
            </div>
        </section>
    );
}

export default HowItWorks;
