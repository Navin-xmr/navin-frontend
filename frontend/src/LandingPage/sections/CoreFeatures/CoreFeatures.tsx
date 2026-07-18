import React from "react";

interface FeatureBlock {
  title: string;
  subtitle: string;
  description: string;
  bullets: string[];
  imageSrc: string;
  imageAlt: string;
}

const CoreFeatures: React.FC = () => {
  const features: FeatureBlock[] = [
    {
      title: "Track every delivery, every step of the way",
      subtitle: "Real-time Visibility",
      description: "Navin gives you full visibility into every shipment milestone, from warehouse pickup to final delivery. No more guessing where your package is—everything is tracked on-chain and reflected in your dashboard.",
      bullets: [
        "Live status updates at every checkpoint",
        "IoT-powered temperature and condition monitoring",
        "GPS tracking with real-time map visualization",
      ],
      imageSrc: "/images/tracking-visualization.png",
      imageAlt: "Real-time shipment tracking visualization",
    },
    {
      title: "Don't trust. Verify.",
      subtitle: "Blockchain Verification",
      description: "Hash-and-Emit architecture means every milestone update is hashed and emitted as a blockchain event. You're not trusting a centralized database—you're verifying cryptographic proof.",
      bullets: [
        "SHA-256 hashes of all shipment data recorded on-chain",
        "Immutable audit trail accessible to all authorized parties",
        "One-click Stellar Explorer link to verify transactions",
      ],
      imageSrc: "/images/blockchain-verification.png",
      imageAlt: "Blockchain verification data flow diagram",
    },
    {
      title: "Payments that release themselves",
      subtitle: "Smart Escrow",
      description: "Navin uses smart contract escrow to hold funds until delivery is confirmed. No manual invoicing. No waiting for bank transfers. The moment a verified delivery happens, payment releases automatically.",
      bullets: [
        "Funds locked on shipment creation",
        "Automatic release on verified delivery",
        "Built-in dispute resolution with admin override",
      ],
      imageSrc: "/images/smart-escrow.png",
      imageAlt: "Smart escrow payment flow illustration",
    },
    {
      title: "Everyone sees what they need to see",
      subtitle: "Role-Based Access",
      description: "Navin supports four roles — Company, Carrier, Customer, and Admin. Each role sees exactly what they're authorized to see. No information asymmetry. No hidden data.",
      bullets: [
        "On-chain role assignment with cryptographic proof",
        "Granular permissions for shipment visibility",
        "Customer and company dashboards with tailored views",
      ],
      imageSrc: "/images/role-access.png",
      imageAlt: "Role-based access control diagram",
    },
  ];

  return (
    <section className="relative py-20 px-4 md:py-28 lg:py-32 bg-background overflow-hidden">
      {/* Ambient glow effects */}
      <div className="absolute top-1/3 right-1/4 w-[700px] h-[700px] bg-accent-teal/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/3 left-1/4 w-[700px] h-[700px] bg-primary/10 blur-[120px] rounded-full pointer-events-none" />
      
      <div className="relative max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-20">
          <h2 className="font-display text-3xl md:text-5xl lg:text-6xl font-bold mb-6 text-text-primary">
            Core <span className="text-primary">Features</span>
          </h2>
          <p className="text-lg text-text-secondary max-w-2xl mx-auto">
            Built on Stellar blockchain for transparency, security, and automation
          </p>
        </div>

        {/* Feature Blocks with Zigzag Layout */}
        <div className="space-y-24">
          {features.map((feature, index) => {
            const isImageLeft = index % 2 === 0;
            
            return (
              <div
                key={index}
                className={`flex flex-col ${
                  isImageLeft ? "lg:flex-row" : "lg:flex-row-reverse"
                } gap-12 items-center`}
              >
                {/* Image Side */}
                <div className="flex-1 w-full">
                  <div className="group/image relative overflow-hidden rounded-2xl">
                    <img
                      src={feature.imageSrc}
                      alt={feature.imageAlt}
                      className="w-full rounded-2xl border border-border-light bg-background-card/40 backdrop-blur-lg transition-all duration-500 group-hover/image:border-primary-light group-hover/image:shadow-glow-blue group-hover/image:scale-105"
                    />
                    {/* Hover overlay glow */}
                    <div className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent opacity-0 transition-opacity duration-500 group-hover/image:opacity-100 rounded-2xl pointer-events-none" />
                  </div>
                </div>

                {/* Content Side */}
                <div className="flex-1 group/content">
                  <h2 className="text-primary font-semibold uppercase tracking-wide text-sm mb-3 transition-all duration-300 group-hover/content:text-primary-light group-hover/content:tracking-wider">
                    {feature.subtitle}
                  </h2>
                  <h3 className="font-display text-3xl md:text-4xl font-bold mb-6 text-text-primary transition-colors duration-300 group-hover/content:text-primary">
                    {feature.title}
                  </h3>
                  <p className="font-sans text-lg text-text-secondary mb-6 leading-relaxed transition-colors duration-300 group-hover/content:text-text-primary">
                    {feature.description}
                  </p>
                  <ul className="space-y-3">
                    {feature.bullets.map((bullet, bulletIndex) => (
                      <li
                        key={bulletIndex}
                        className="group/bullet flex items-start gap-3 text-text-secondary transition-all duration-300 hover:translate-x-1"
                      >
                        <svg
                          className="w-6 h-6 text-primary flex-shrink-0 mt-0.5 transition-all duration-300 group-hover/bullet:scale-125 group-hover/bullet:text-primary-light"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        <span className="transition-colors duration-300 group-hover/bullet:text-text-primary">{bullet}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default CoreFeatures;
