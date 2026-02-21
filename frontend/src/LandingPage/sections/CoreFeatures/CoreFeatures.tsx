import React, { useEffect, useRef, useState } from 'react';
import FeatureBlock from './FeatureBlock';
import './CoreFeatures.css';

const CoreFeatures: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const [visibleBlocks, setVisibleBlocks] = useState<Set<number>>(new Set());

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = parseInt(entry.target.getAttribute('data-index') || '0', 10);
            setVisibleBlocks((prev) => new Set(prev).add(index));
          }
        });
      },
      { threshold: 0.2, rootMargin: '0px 0px -100px 0px' }
    );

    const blocks = sectionRef.current?.querySelectorAll('.feature-block');
    blocks?.forEach((block) => observer.observe(block));

    return () => observer.disconnect();
  }, []);

  const features = [
    {
      headline: 'Track every delivery, every step of the way',
      description:
        'Navin gives you full visibility into every shipment from pickup to delivery. Powered by on-chain milestone recording and IoT sensor data, every checkpoint is cryptographically verified by the Stellar blockchain — so what you see is what actually happened.',
      bullets: [
        'Live status updates at every checkpoint',
        'IoT-powered temperature and condition monitoring',
        'Cryptographically verified — no one can alter records after the fact',
      ],
      imagePath: '/images/core-features/tracking.svg',
      imageAlt: 'Real-time shipment tracking visualization',
    },
    {
      headline: "Don't trust. Verify.",
      description:
        'Navin uses a unique Hash-and-Emit architecture. Heavy data (GPS, sensor readings, manifests) is stored off-chain for speed, but a cryptographic hash is published permanently to the Stellar blockchain. Your frontend can independently verify any record against the chain — no middleman required.',
      bullets: [
        'SHA-256 hashes of all shipment data published on-chain',
        'Frontend independently verifies against Stellar RPC — zero trust in the backend',
        'Tamper-proof audit trail that lasts forever',
      ],
      imagePath: '/images/core-features/blockchain.svg',
      imageAlt: 'Blockchain verification data flow diagram',
    },
    {
      headline: 'Payments that release themselves',
      description:
        'When a shipment is created, the sender locks funds in a Soroban smart contract escrow. Funds are automatically released to the carrier only when the receiver confirms delivery on-chain. No manual invoicing, no payment disputes, no delays.',
      bullets: [
        'Funds locked on shipment creation',
        'Auto-release on delivery confirmation',
        'Dispute resolution built-in — admin arbitration with on-chain transparency',
      ],
      imagePath: '/images/core-features/escrow.svg',
      imageAlt: 'Smart escrow payment flow illustration',
    },
    {
      headline: 'Everyone sees what they need to see',
      description:
        'Navin supports four roles — Company, Carrier, Customer, and Admin. Each role has precisely scoped permissions enforced by the smart contract. Companies create shipments, carriers update status, customers confirm delivery, and admins resolve disputes.',
      bullets: [
        'On-chain role assignment — permissions enforced at the contract level',
        'Multi-carrier handoff support for complex supply chains',
        'Company-level carrier whitelisting',
      ],
      imagePath: '/images/core-features/roles.svg',
      imageAlt: 'Role-based access control diagram',
    },
  ];

  return (
    <section className="core-features" ref={sectionRef}>
      <div className="core-features__header">
        <h2 className="core-features__title">Core Features</h2>
        <p className="core-features__subtitle">
          Built on Stellar blockchain for transparency, security, and automation
        </p>
      </div>

      <div className="core-features__blocks">
        {features.map((feature, index) => (
          <FeatureBlock
            key={index}
            index={index}
            headline={feature.headline}
            description={feature.description}
            bullets={feature.bullets}
            imagePath={feature.imagePath}
            imageAlt={feature.imageAlt}
            isVisible={visibleBlocks.has(index)}
          />
        ))}
      </div>
    </section>
  );
};

export default CoreFeatures;
