import { useState } from "react";

type FAQItem = {
    question: string;
    answer: string;
};

const faqItems: FAQItem[] = [
    {
        question: "What is Navin?",
        answer:
            "Navin is a next-generation logistics platform that combines blockchain technology with IoT tracking to provide transparent, tamper-proof shipment management. Every milestone is recorded on-chain, ensuring accountability from pickup to delivery.",
    },
    {
        question: "How do Stellar payments work on Navin?",
        answer:
            "Navin integrates with the Stellar blockchain to handle payments via smart contracts. When a shipment is confirmed, funds are held in escrow and automatically released to the logistics provider upon successful delivery—no manual processing required.",
    },
    {
        question: "How does IoT tracking work?",
        answer:
            "Our IoT sensors attached to shipments continuously report GPS location, temperature, humidity, and shock events. This data is logged in real-time and anchored to the blockchain, giving you a verifiable, tamper-proof record of your shipment's journey.",
    },
    {
        question: "How do I get started with Navin?",
        answer:
            "Simply sign up for an account, choose your role (logistics company or customer), and you'll have immediate access to the dashboard. You can create your first shipment in minutes—our onboarding tour will guide you through each step.",
    },
    {
        question: "Is my data secure on Navin?",
        answer:
            "Yes. All sensitive data is encrypted in transit and at rest. Shipment records are anchored to the Stellar blockchain, making them immutable and auditable. Access is controlled through role-based permissions, ensuring only authorized parties can view or modify shipment details.",
    },
    {
        question: "Which wallets are supported?",
        answer:
            "Navin supports any Stellar-compatible wallet, including Freighter, Lobstr, and Solar Wallet. You can connect your wallet directly from the dashboard to manage payments and view on-chain transaction history.",
    },
];

function FAQSection() {
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    const handleToggle = (index: number) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <section className="py-20">
            <h2 className="font-display font-normal text-[1.5rem] md:text-[2.25rem] lg:text-[3.25rem] mb-12">
                <span className="text-[#62ffff]">Frequently Asked</span> Questions
            </h2>
            <div className="flex flex-col gap-4">
                {faqItems.map((item, index) => {
                    const isOpen = openIndex === index;
                    return (
                        <div
                            key={index}
                            className="rounded-[1.25rem] border border-[rgba(0,180,160,0.3)] bg-[rgba(8,40,50,0.6)] overflow-hidden"
                        >
                            <button
                                type="button"
                                onClick={() => handleToggle(index)}
                                aria-expanded={isOpen}
                                className="w-full flex items-center justify-between px-6 py-5 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00d4c8]"
                            >
                                <span className="font-display font-semibold text-white text-base md:text-lg">
                                    {item.question}
                                </span>
                                <span
                                    className="ml-4 flex-shrink-0 text-[#62ffff] text-2xl leading-none select-none"
                                    aria-hidden="true"
                                >
                                    {isOpen ? "×" : "+"}
                                </span>
                            </button>
                            <div
                                className={`transition-all duration-300 overflow-hidden ${
                                    isOpen ? "max-h-96" : "max-h-0"
                                }`}
                            >
                                <p className="px-6 pb-5 text-[#e5ffff] text-base leading-relaxed">
                                    {item.answer}
                                </p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </section>
    );
}

export default FAQSection;
