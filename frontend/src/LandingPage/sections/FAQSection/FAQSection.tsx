import { useState } from "react";
import { ChevronDown } from "lucide-react";

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
        <section 
            className="relative py-20 px-4 md:py-28 lg:py-32 bg-background overflow-hidden"
        >
            {/* Ambient glow effect */}
            <div className="absolute bottom-0 right-1/4 w-[700px] h-[700px] bg-primary/10 blur-[120px] rounded-full pointer-events-none" />
            
            <div className="relative max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
                {/* Left side - FAQ Content */}
                <div>
                    <h2 className="font-display text-3xl md:text-5xl lg:text-6xl font-bold mb-6 text-text-primary">
                        Frequently Asked <span className="text-primary">Questions</span>
                    </h2>
                    <p className="text-text-secondary text-lg mb-12">
                        Everything you need to know about Navin's blockchain-powered logistics platform.
                    </p>
                    
                    <div className="flex flex-col gap-4">
                        {faqItems.map((item, index) => {
                            const isOpen = openIndex === index;
                            return (
                                <div
                                    key={index}
                                    className={`group bg-background-card/60 backdrop-blur-lg border rounded-2xl transition-all duration-300 ${
                                        isOpen 
                                            ? 'border-primary-light shadow-glow-blue scale-[1.02]' 
                                            : 'border-border-light hover:border-primary-light/50 hover:shadow-glow-blue/50 hover:bg-background-card/80'
                                    }`}
                                >
                                    <button
                                        type="button"
                                        onClick={() => handleToggle(index)}
                                        aria-expanded={isOpen}
                                        className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-2xl transition-all duration-300 group-hover:px-7"
                                    >
                                        <span className={`font-display font-semibold text-base md:text-lg transition-colors duration-300 ${
                                            isOpen ? 'text-primary' : 'text-text-primary group-hover:text-primary'
                                        }`}>
                                            {item.question}
                                        </span>
                                        <ChevronDown 
                                            className={`flex-shrink-0 w-5 h-5 text-primary transition-all duration-300 ${
                                                isOpen ? 'rotate-180 scale-110' : 'group-hover:scale-110'
                                            }`}
                                            aria-hidden="true"
                                        />
                                    </button>
                                    
                                    <div
                                        className={`grid transition-all duration-300 ease-in-out ${
                                            isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                                        }`}
                                    >
                                        <div className="overflow-hidden">
                                            <p className="px-6 pb-5 font-sans text-base leading-relaxed text-text-secondary">
                                                {item.answer}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
                
                {/* Right side - Container Image */}
                <div className="hidden lg:flex items-center justify-center">
                    <img 
                        src="/images/faq-container.png" 
                        alt="Shipping container illustration" 
                        className="w-full max-w-[600px] h-auto object-contain"
                    />
                </div>
            </div>
        </section>
    );
}

export default FAQSection;
