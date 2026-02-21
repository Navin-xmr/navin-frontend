import "./WhyNavin.css";
import Alerts from "../../../assets/Alerts.svg";
import Deliveries from "../../../assets/Deliveries.svg";
import Fast from "../../../assets/Fast.svg";
import Transparency from "../../../assets/Transparency.svg";

function WhyNavin() {
    const whyNavin = [
        {
            icon: Transparency,
            iconAlt: "Eye icon",
            header: "Total Transparency",
            description: "See your shipments journey, every step of the way.",
        },
        {
            icon: Alerts,
            iconAlt: "Bell icon",
            header: "Real Time Alerts",
            description: "Know instantly if there is a delay or issue.",
        },
        {
            icon: Deliveries,
            iconAlt: "Truck icon",
            header: "Safe Deliveries",
            description: "Tamper proof technology prevents fraud and errors.",
        },
        {
            icon: Fast,
            iconAlt: "Rocket icon",
            header: "Faster Service",
            description:
                "Automated processes mean quicker, smoother deliveries.",
        },
    ];

    return (
        <section className="why__section">
            <h2 className="why__section__header">
                Why <span className="navin__cyan"> Navin?</span>
            </h2>
            <div className="why__item__container">
                {whyNavin.map((item) => (
                    <article className="why__section__item">
                        <div className="why__icon__container">
                            <img src={item.icon} alt={item.iconAlt} />
                        </div>
                        <article>
                            <h3 className="why__item__header">{item.header}</h3>
                            <p className="why__item__description">
                                {item.description}
                            </p>
                        </article>
                    </article>
                ))}
            </div>
        </section>
    );
}

export default WhyNavin;
