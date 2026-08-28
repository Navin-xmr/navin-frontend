import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { useTranslation } from "react-i18next";

type FAQItem = {
    key: string;
};

const faqItems: FAQItem[] = [
    { key: "whatIsNavin" },
    { key: "stellarPayments" },
    { key: "iotTracking" },
    { key: "getStarted" },
    { key: "dataSecure" },
    { key: "walletsSupported" },
];

function FAQSection() {
    const { t } = useTranslation("landing");
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
                        {t("faq.heading")} <span className="text-primary">{t("faq.headingHighlight")}</span>
                    </h2>
                    <p className="text-text-secondary text-lg mb-12">
                        {t("faq.subtitle")}
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
                                            {t(`faq.${item.key}.question`)}
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
                                                {t(`faq.${item.key}.answer`)}
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
