import React from "react";
import Button from "@/components/Button/Button";
import "./CTABanner.css";

const CTABanner: React.FC = () => {
    return (
        <section className="cta-banner">
            <div className="cta-banner__content">
                <h2 className="cta-banner__headline">
                    Ready to Transform Your Logistics?
                </h2>
                <p className="cta-banner__subheadline">
                    Join thousands of businesses speeding up shipments with Navin. 
                    Get started today and gain full visibility into your supply chain.
                </p>
                <Button variant="primary" size="lg" className="cta-banner__button">
                    Start Tracking Today
                </Button>
            </div>
        </section>
    );
};

export default CTABanner;
