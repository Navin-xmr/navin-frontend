import React from 'react';
import FeatureBlock from './FeatureBlock';
import './CoreFeatures.css';

const CoreFeatures: React.FC = () => {
  const features = [
    {
      headline: 'Track every delivery, every step of the way',
      description:
        'Navin gives you full visibility into every shipment from pickup to delivery. Powered by on-chain milestone recording and IoT sensor data, every checkpoint is cryptographically verified by the Stellar blockchain — so what you see is what actually happened.',
      bulletPoints: [
        'Live status updates at every checkpoint',
        'IoT-powered temperature and condition monitoring',
        'Cryptographically verified — no one can alter records after the fact',
      ],
      imageSrc: '/images/core-features/tracking.svg',
      imageAlt: 'Real-time shipment tracking visualization',
    },
    {
      headline: "Don't trust. Verify.",
      description:
        'Navin uses a unique Hash-and-Emit architecture. Heavy data (GPS, sensor readings, manifests) is stored off-chain for speed, but a cryptographic hash is published permanently to the Stellar blockchain. Your frontend can independently verify any record against the chain — no middleman required.',
      bulletPoints: [
        'SHA-256 hashes of all shipment data published on-chain',
        'Frontend independently verifies against Stellar RPC — zero trust in the backend',
        'Tamper-proof audit trail that lasts forever',
      ],
      imageSrc: '/images/core-features/blockchain.svg',
      imageAlt: 'Blockchain verification data flow diagram',
    },
    {
      headline: 'Payments that release themselves',
      description:
        'When a shipment is created, the sender locks funds in a Soroban smart contract escrow. Funds are automatically released to the carrier only when the receiver confirms delivery on-chain. No manual invoicing, no payment disputes, no delays.',
      bulletPoints: [
        'Funds locked on shipment creation',
        'Auto-release on delivery confirmation',
        'Dispute resolution built-in — admin arbitration with on-chain transparency',
      ],
      imageSrc: '/images/core-features/escrow.svg',
      imageAlt: 'Smart escrow payment flow',
    },
    {
      headline: 'Everyone sees what they need to see',
      description:
        'Navin supports four roles — Company, Carrier, Customer, and Admin. Each role has precisely scoped permissions enforced by the smart contract. Companies create shipments, carriers update status, customers confirm delivery, and admins resolve disputes.',
      bulletPoints: [
        'On-chain role assignment — permissions enforced at the contract level',
        'Multi-carrier handoff support for complex supply chains',
        'Company-level carrier whitelisting',
      ],
      imageSrc: '/images/core-features/roles.svg',
      imageAlt: 'Role-based multi-party collaboration diagram',
    },
  ];

  return (
    <section className="core-features">
      <div className="core-features__container">
        <div className="core-features__header">
          <h2 className="core-features__title">Core Features</h2>
          <p className="core-features__subtitle">
            Everything you need for transparent, secure, and automated logistics
          </p>
        </div>

        <div className="core-features__blocks">
          {features.map((feature, index) => (
            <FeatureBlock
              key={index}
              headline={feature.headline}
              description={feature.description}
              bulletPoints={feature.bulletPoints}
              imageSrc={feature.imageSrc}
              imageAlt={feature.imageAlt}
              reverse={index % 2 !== 0}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default CoreFeatures;
