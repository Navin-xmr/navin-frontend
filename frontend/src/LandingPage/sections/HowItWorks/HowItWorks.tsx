import "./HowItWorks.css";

function HowItWorks() {
    return (
        <section>
            <h3>
                {" "}
                <span>How Navin</span> Works
            </h3>
            <div>
                <article>
                    <h3 className="article__header">Smart Pickup</h3>
                    <p>
                        We pick up your package from your chosen location or
                        partner hub and log it into our system for full
                        transparency from the start
                    </p>
                </article>
                <article>
                    <h3>Live Tracking</h3>
                    <p>
                        Track your shipment in real time with instant updates at
                        every milestone—from dispatch to delivery. No more
                        wondering where your package
                    </p>
                </article>
                <article>
                    <h3>Secure Delivery</h3>
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
